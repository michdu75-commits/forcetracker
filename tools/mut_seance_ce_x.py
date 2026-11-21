#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — SCCX (assemblage des trois lots, 16/11/2026) : les temoins B-SCCX d'INTERACTION savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Chaque mutation REMET UN DEFAUT D'INTERACTION (ou retire une protection que deux lots se partagent) ; le banc `tools/banc_seance_ce_x.js` doit alors rougir AU MOINS UNE fois dans la partie
qui lui est assignee. Une mutation qui laisse le banc vert = un temoin qui ne protege rien (R17 / R35). Point de depart : 0 rouge sur l'arbre sain, mesure d'abord. Une ancre perimee affiche INVALIDE.
Chaque mutation dit dans QUELLE partie du banc elle doit etre vue : 'pur' source seule (instantane) · 'ecran' (X1 + X2 + X3, un seul fil) · 'maj' (X4, vrai service worker).
Usage : python3 tools/mut_seance_ce_x.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_SEUL=M07 : une mutation · MUT_SANS_BASE=1 : sauter le point de depart · MUT_ANCRES=1 : ne verifier QUE les ancres)
A lancer sous le garde reseau : tools/sous_garde.sh python3 tools/mut_seance_ce_x.py
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FICHIERS = ('app.js', 'coach.js', 'log.js', 'setup.js', 'screens.js', 'state.js', 'tracking.js', 'style.css', 'index.html')
AP, CJ, LO, TR, CS, SC, IX = 'app.js', 'coach.js', 'log.js', 'tracking.js', 'style.css', 'screens.js', 'index.html'

# ── ancres (le texte EXACT du code sain) ──
# lot 3 × lot 2 : la feuille « Quelle série supprimer ? » dit la charge d'une série
FEUILLE_KG = "kg=(set&&(_pdcDe(set)!==null||(set.vide&&!(+set.kg>0))))?String(_kgTxtSerie(set)):((set&&_kgConnu(set.kg)&&+set.kg>0)?set.kg+' kg':'— kg');"
FEUILLE_KG_ANCIEN = "kg=(set&&_kgConnu(set.kg)&&+set.kg>0)?set.kg+' kg':'— kg';"
FEUILLE_PDC = "kg=(set&&(_pdcDe(set)!==null||(set.vide&&!(+set.kg>0))))?"
LIGNE_PALIER = "    if(_estPalierDrop(ex,si)&&!_serieSupprimable(ex,si)) return `<div style="
OKPAL = "const ok=k=>!_estPalierDrop(ex,k)||_nbPaliers(ex)>=2;"
# lot 2 × lot 3 : « Sauvegarder comme programme » (le SEUL copieur séance → programme)
SAP_PDC = "...(s.vide&&_pdcDe(s)===null?{vide:true}:{}),..._pdcRepris(s),...(s.restTxt?"
SAP_NOTE = "...(s.restTxt?{restTxt:String(s.restTxt)}:{}),...(s.note?{note:String(s.note)}:{})}))};"
SAP_VIDE = "...(s.vide&&_pdcDe(s)===null?{vide:true}:{}),"
SAP_NULL = "kg:(_pdcDe(s)!==null?0:(s.kg===null?null:(s.kg||0))),reps:"
SAP_DROP = "      _recopierDropset(ex,o);                                           // LOT 6 / ML-A"
# lot 1 × lot 2 : `_exsDeProgramme` (le SEUL copieur programme → séance)
EX_KGREPS = "const ppKg=pp&&!(ed.kg>ts)?pp:null, ppReps=pp&&!(ed.reps>ts)?pp:null;"
EX_REST = "const ppRest=(pp&&pp.rest>0&&!(ed.rest>ts))?pp:null;"
EX_PDC = "const _pdcSerie=(ppKg&&_pdcDe(ppKg)!==null)?_pdcRepris(ppKg):((ppKg&&ppKg.kg>0)?{}:_pdcRepris(s));"
EX_SID = "...(s.sid?{sid:s.sid}:{}),"
EX_NOTE = "...(s.note?{note:String(s.note)}:{}),              // D-171"
SERIES_AVANT = "if(!(prev||[]).some(x=>x&&x.sid))return _prevAligne(prev,sets);"
JOUR_ID = "(s.progDayId?(!!day.id&&s.progDayId===day.id):(unique&&s.progLabel===label))"
# l'éditeur (lot 1)
MOVE = "if(!ex||!ex.sets||si<1||si>=ex.sets.length)return false;\n  const t=ex.sets[si-1]; ex.sets[si-1]=ex.sets[si]; ex.sets[si]=t;"
ED_REST = "if(v!==(ex.sets[si].rest||0))_marquerEdition(ex.sets[si],'rest');"
# lot 3 : supprimer la série choisie
# l'assemblage : « Précédent » par identité
PREC_IDENT = "  if(!(prev||[]).some(x=>x&&x.sid)) return base;"
PREC_PRISES = "((sets[i]&&sets[i].sid&&d.p&&prises.has(d.p))?{p:null,exact:false}:d)"
SPLICE = "    ex.sets.splice(k,1);\n    const recaler"
RIR_CIBLE = "    if(Array.isArray(_rirCible)){ _rirCible=_rirCible.map(recaler).filter(Boolean); if(!_rirCible.length) _rirCible=null; } else _rirCible=recaler(_rirCible)||null;"
# lot 2 : tonnage, record de lest, lecture d'une charge
TONNAGE = "function _chargeTonnage(s){ const n=_pdcDe(s); return n!==null?(n>0?n:0):(+s.kg||0); }"
RECORD = "if(b&&old&&(b.lest>old.lest||(b.lest===old.lest&&b.reps>old.reps)))out.push("
VIDE_TXT = "if(x.vide&&!(+x.kg>0))return 'à vide'; return _kgConnu(x.kg)?x.kg:'?'; }"
# lot 3 : D-176 en-tête global
CSS_MASQUE = "#root:not(.on-home) .topbar{display:none;}"
CSS_SEANCE = "#root.on-log.seance-on .topbar{display:flex;}"
HOME_TOGGLE = "classList.toggle('on-home',id==='home')"
# lot 3 : D-170 attente réseau et verrou
FB_CORPS = "    const corps=lire?await Promise.race([lire(resp),delai]):undefined;"
FB_ABORT = "try{ if(ctl) ctl.abort(); }catch(_e){}"
SYNC_DELAI = ",8000,r=>r.text().catch(()=>'(body illisible)'));"
PEUT_FIN = "  if(typeof _finishing!=='undefined' && _finishing) return false;"
PEUT_RECAP = "  if(ov&&ov.classList.contains('open')) return false;                  // récapitulatif à l'écran"

# (nom, [(fichier, avant, apres)], attendu, partie ou [parties])
MUT = [
    # ── X1 : la feuille de suppression (lot 3) lit une charge comme le lot 2 ──
    ('M01 ⛔⛔ le correctif d\'assemblage retiré : la feuille « Quelle série supprimer ? » écrit « — kg » pour toute charge non chiffrée (le PDC et « à vide » deviennent « inconnue »)',
     [(LO, FEUILLE_KG, FEUILLE_KG_ANCIEN)], 'GARDE', ['pur', 'ecran']),
    ('M02 ⛔ la feuille ne reconnaît plus un PDC (seul « à vide » passe par le texte commun)',
     [(LO, FEUILLE_PDC, "kg=(set&&((set.vide&&!(+set.kg>0))))?")], 'GARDE', 'ecran'),
    ('M03 ⛔ les lignes de PALIER d\'un dropset sont de nouveau TOUTES verrouillées dans la feuille (l\'état d\'avant le lot D : D-173 refusé)',
     [(LO, LIGNE_PALIER, "    if(_estPalierDrop(ex,si)) return `<div style="), (LO, OKPAL, "const ok=k=>!_estPalierDrop(ex,k);")], 'GARDE', 'ecran'),
    # ── X2 : « Sauvegarder comme programme » (lot 2 × lot 3) ──
    ('M04 ⛔⛔ « Sauvegarder comme programme » ne recopie plus le PDC / lest / assistance (le +17,5 de la séance disparaît du programme)',
     [(LO, SAP_PDC, "...(s.vide&&_pdcDe(s)===null?{vide:true}:{}),...(s.restTxt?")], 'GARDE', 'ecran'),
    ('M05 ⛔⛔ « Sauvegarder comme programme » ne recopie plus le commentaire PAR SÉRIE',
     [(LO, SAP_NOTE, "...(s.restTxt?{restTxt:String(s.restTxt)}:{})}))};")], 'GARDE', 'ecran'),
    ('M06 ⛔ « Sauvegarder comme programme » ne recopie plus « à vide »',
     [(LO, SAP_VIDE, "")], 'GARDE', 'ecran'),
    ('M07 ⛔⛔ « Sauvegarder comme programme » écrit 0 pour une charge INCONNUE (`null` perdue)',
     [(LO, SAP_NULL, "kg:(_pdcDe(s)!==null?0:(s.kg||0)),reps:")], 'GARDE', 'ecran'),
    ('M08 ⛔ « Sauvegarder comme programme » perd le réglage du dropset',
     [(LO, SAP_DROP, "")], 'GARDE', 'ecran'),
    # ── X2 : le chargement d'un jour (lot 1) garde les états de charge (lot 2) ──
    ('M09 ⛔⛔ une retouche manuelle ne protège plus le CHARGE (l\'historique reprend la main sur le 82,5 retouché)',
     [(LO, EX_KGREPS, "const ppKg=pp?pp:null, ppReps=pp&&!(ed.reps>ts)?pp:null;")], 'GARDE', 'ecran'),
    ('M10 ⛔⛔ une retouche manuelle ne protège plus le REPOS (`ed.rest` n\'est plus lu : le 200 s retouché redevient celui de l\'historique)',
     [(LO, EX_REST, "const ppRest=(pp&&pp.rest>0)?pp:null;")], 'GARDE', 'ecran'),
    ('M11 ⛔⛔ le repos ne vient plus de l\'historique (toujours celui du programme : le 90 s écrit sans retouche gagne sur le 150 s de la séance d\'avant)',
     [(LO, EX_REST, "const ppRest=null;")], 'GARDE', 'ecran'),
    ('M12 ⛔⛔ le PDC / lest de la dernière fois n\'est plus repris (le +12 prescrit revient à la place du +15 fait)',
     [(LO, EX_PDC, "const _pdcSerie=_pdcRepris(s);")], 'GARDE', 'ecran'),
    ('M13 ⛔ le commentaire PAR SÉRIE du programme ne suit plus la série dans la séance',
     [(LO, EX_NOTE, "// D-171")], 'GARDE', 'ecran'),
    ('M14 ⛔⛔ l\'identité de série (`sid`) n\'est plus copiée du programme dans la séance',
     [(LO, EX_SID, "")], 'GARDE', 'ecran'),
    ('M15 ⛔⛔ la progression se rapproche par POSITION et non plus par identité (une série déplacée reprend la valeur de sa voisine)',
     [(LO, SERIES_AVANT, "return _prevAligne(prev,sets);")], 'GARDE', 'ecran'),
    ('M16 SURVIT A DESSEIN : le jour d\'un programme se reconnaît par son LIBELLÉ seul — l\'identité d\'EXERCICE (`exId`) interdit à elle seule le mélange (défense en profondeur : les blocs d\'un autre jour n\'ont pas le même `exId`) ; la protection du JOUR est tuée par B-SCCH (mut_seance_ce_h M20 / M21)',
     [(LO, JOUR_ID, "s.progLabel===label")], 'OK', 'ecran'),
    # ── X2 : l'éditeur (lot 1) ──
    ('M17 ⛔⛔ déplacer une série échange aussi les identités (les valeurs bougent, leur `sid` reste en place : la série déplacée perd SON historique)',
     [(LO, MOVE, MOVE + " const _a=t.sid; t.sid=ex.sets[si-1].sid; ex.sets[si-1].sid=_a;")], 'GARDE', 'ecran'),
    ('M17b ⛔⛔ déplacer une série échange les RETOUCHES (`ed`) par position : la retouche du repos reste en place pendant que la série part (elle ne la suit plus)',
     [(LO, MOVE, MOVE + " const _e=t.ed; t.ed=ex.sets[si-1].ed; ex.sets[si-1].ed=_e;")], 'GARDE', 'ecran'),
    ('M18 ⛔⛔ le repos retouché dans l\'éditeur n\'est plus marqué (`ed.rest` jamais posé : la retouche ne gagne jamais)',
     [(LO, ED_REST, "")], 'GARDE', 'ecran'),
    # ── X2 : supprimer la série choisie (lot 3) ──
    ('M19 ⛔⛔ supprimer retire de nouveau la DERNIÈRE série (l\'inconnue part au lieu de l\'assistance choisie)',
     [(LO, SPLICE, "    ex.sets.pop();\n    const recaler")], 'GARDE', 'ecran'),
    ('M20 ⛔⛔ la suppression ré-identifie les séries restantes (leurs `sid` sont effacés : elles ne retrouvent plus leur historique)',
     [(LO, SPLICE, "    ex.sets.splice(k,1); ex.sets.forEach(function(s){ delete s.sid; });\n    const recaler")], 'GARDE', 'ecran'),
    ('M21 ⛔⛔ la question du RIR en attente n\'est plus recalée à la suppression (elle vise une série qui n\'existe plus, ou sa voisine)',
     [(LO, RIR_CIBLE, "")], 'GARDE', 'ecran'),
    # ── X2 : tonnage / record de lest (lot 2) ──
    ('M22 ⛔⛔ le lest ne compte plus au tonnage (15 × 6 = 90 disparaît du volume de la séance)',
     [(LO, TONNAGE, "function _chargeTonnage(s){ const n=_pdcDe(s); return n!==null?0:(+s.kg||0); }")], 'GARDE', 'ecran'),
    ('M23 ⛔ un lest qui bat le record n\'est plus annoncé au récapitulatif',
     [(LO, RECORD, "if(b&&old&&(b.lest>old.lest+99999||(b.lest===old.lest&&b.reps>old.reps+99999)))out.push(")], 'GARDE', 'ecran'),
    ('M24 ⛔ « à vide » se lit « 0 » pour Milo et l\'export (les états se confondent)',
     [(LO, VIDE_TXT, "if(x.vide&&!(+x.kg>0))return 0; return _kgConnu(x.kg)?x.kg:'?'; }")], 'GARDE', 'ecran'),
    # ── X2 : « Précédent » PAR IDENTITÉ (le défaut d'interaction trouvé par ce banc : D-171 déplacer / D-173 supprimer × D-163 × D-164) ──
    ('M36 ⛔⛔⛔ « Précédent », la suggestion grise et le commentaire de la dernière fois se rapprochent de nouveau par POSITION (le défaut : après un déplacement, valider un zéro écrit lui donne le PDC−20 de sa voisine)',
     [(LO, PREC_IDENT, "  return base;")], 'GARDE', 'ecran'),
    ('M37 ⛔ une série identifiée sans correspondante emprunte de nouveau la série d\'une AUTRE ligne (après une suppression, la ligne supprimée affiche la dernière fois de sa voisine)',
     [(LO, PREC_PRISES, "d")], 'GARDE', 'ecran'),
    # ── X3 : D-176, l'en-tête global ──
    ('M25 ⛔⛔ l\'en-tête global reste partout (la règle générique est retirée : l\'état d\'avant)',
     [(CS, CSS_MASQUE, "")], 'GARDE', 'ecran'),
    ('M26 ⛔ l\'en-tête est rendu invisible (`visibility:hidden`) au lieu d\'être retiré : une BANDE VIDE reste en haut',
     [(CS, CSS_MASQUE, "#root:not(.on-home) .topbar{visibility:hidden;}")], 'GARDE', 'ecran'),
    ('M27 ⛔⛔ l\'en-tête de SÉANCE est masqué aussi (« Terminer » disparaît pendant une séance)',
     [(CS, CSS_SEANCE, "")], 'GARDE', 'ecran'),
    ('M28 ⛔ le Progrès garde l\'en-tête de l\'Accueil (la classe `on-home` est posée à tort sur un autre écran)',
     [(SC, HOME_TOGGLE, "classList.toggle('on-home',id==='home'||id==='progress')")], 'GARDE', 'ecran'),
    ('M29 ⛔⛔ rendre la place de l\'en-tête DÉPLACE la barre du bas (règle d\'or #9) : le bouton central bouge',
     [(CS, CSS_SEANCE, CSS_SEANCE + "\n#root:not(.on-home) .nav{margin-bottom:-20px;}")], 'GARDE', 'ecran'),
    # ── X4 : D-170, « Terminer » pendant une mise à jour ──
    ('M30 ⛔⛔ le DÉFAUT d\'origine remis : le minuteur est levé AVANT la lecture du corps (la fin de séance ne se termine plus quand le corps est figé)',
     [(TR, FB_CORPS, "    clearTimeout(tId); const corps=lire?await lire(resp):undefined;")], 'GARDE', 'maj'),
    ('M31 ⛔ l\'abandon ne coupe plus la requête (`ctl.abort()` retiré : la connexion reste ouverte côté serveur)',
     [(TR, FB_ABORT, "")], 'GARDE', 'maj'),
    ('M32 ⛔⛔ la décision « peut-on appliquer ? » ne lit plus le verrou de la fin de séance (la page se recharge pendant l\'enregistrement)',
     [(AP, PEUT_FIN, "")], 'GARDE', 'maj'),
    ('M33 ⛔ le récapitulatif ouvert ne retient plus la mise à jour',
     [(AP, PEUT_RECAP, "")], 'GARDE', 'maj'),
    ('M34 ⛔⛔ le délai de la fin de séance devient énorme (8 000 s) : la séance reste suspendue, le récapitulatif ne s\'ouvre jamais',
     [(TR, SYNC_DELAI, ",8000000,r=>r.text().catch(()=>'(body illisible)'));")], 'GARDE', 'maj'),
]

BANC = os.path.join('tools', 'banc_seance_ce_x.js')


def banc(arbre, parties):
    env = dict(os.environ, TZ='Europe/Paris')
    if isinstance(parties, str):
        parties = [parties]
    rouges_tous, bilans = [], []
    for partie in parties:
        arg = [] if partie == 'tout' else [partie]
        try:
            r = subprocess.run(['node', BANC] + arg, cwd=arbre, capture_output=True, text=True, timeout=1500, env=env)
        except subprocess.TimeoutExpired:
            return ['DELAI : le scenario ne finit pas (une page suspendue est un defaut vu, pas un vert)'], '?'
        out = r.stdout + r.stderr
        rouges = [l.strip()[:150] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
        if r.returncode not in (0, 1) and not rouges:
            rouges = ['PLANTAGE (code %d)' % r.returncode]
        ok = re.search(r'(\d+) OK / (\d+) rouge', out)
        rouges_tous += rouges
        bilans.append(ok.group(0) if ok else '?')
        if rouges:
            break                                                    # un rouge suffit : la mutation est tuee
    return rouges_tous, ' + '.join(bilans)


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_sccx_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'clone', 'exercises', 'anatomy', 'muscles'))
    for d in ('exercises', 'anatomy', 'muscles'):
        if os.path.isdir(os.path.join(SRC, d)) and not os.path.exists(os.path.join(a, d)):
            os.symlink(os.path.join(SRC, d), os.path.join(a, d))
    return tmp, a


def ancres():
    """Verifie, sans rien lancer, que chaque ancre existe EXACTEMENT une fois dans l'arbre sain."""
    srcs = {f: open(os.path.join(SRC, f), encoding='utf-8').read() for f in FICHIERS}
    mauvais = 0
    for nom, remplacements, attendu, spec in MUT:
        for f, av, ap in remplacements:
            n = srcs[f].count(av)
            if n != 1:
                mauvais += 1
                print('  INVALIDE  %s (ancre %s x%d : %s)' % (nom[:60], f, n, av[:70]))
    print('%d mutation(s), %d ancre(s) invalide(s)' % (len(MUT), mauvais))
    return 1 if mauvais else 0


def main():
    if os.environ.get('MUT_ANCRES'):
        return ancres()
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    seul = os.environ.get('MUT_SEUL')
    if not os.environ.get('MUT_SANS_BASE'):
        tmp0, a0 = cloner()
        rouges, bilan = banc(a0, 'tout')
        shutil.rmtree(tmp0, ignore_errors=True)
        if rouges:
            print('  !! ARBRE SAIN DEJA ROUGE — controle refuse :', rouges[:3]); return 1
        print('  arbre sain : 0 rouge (%s) — point de depart valide\n' % bilan)
    conformes = total = 0
    for nom, remplacements, attendu, spec in MUT:
        if filtres and not any(nom.startswith(f) for f in filtres):
            continue
        if seul and not nom.startswith(seul):
            continue
        total += 1
        tmp, arbre = cloner()
        srcs = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
        invalide = []
        for f, av, ap in remplacements:
            if srcs[f].count(av) != 1:
                invalide.append('%s:%s (x%d)' % (f, av[:60], srcs[f].count(av)))
            else:
                srcs[f] = srcs[f].replace(av, ap, 1)
        if invalide:
            print('  INVALIDE  %s (ancre absente ou multiple : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
        for f in FICHIERS:
            open(os.path.join(arbre, f), 'w', encoding='utf-8').write(srcs[f])
        rouges, bilan = banc(arbre, spec)
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu; conformes += ok
        print('  %s  %-110s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0][:90] if rouges else ''))
        sys.stdout.flush()
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
