#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — SCFD (lot D de fermeture, 17/11/2026 : D-173, le palier isole d'un dropset se supprime) : les temoins B-SCFD savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Chaque mutation REMET UN DEFAUT (ou retire une protection) ; le banc `tools/banc_seance_cf_d.js` doit alors rougir AU MOINS UNE fois. Une mutation qui laisse
le banc vert = un temoin qui ne protege rien (R17 / R35). Point de depart : 0 rouge sur l'arbre sain, mesure d'abord. Une ancre perimee affiche INVALIDE.
Usage : python3 tools/mut_seance_cf_d.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_SEUL=D01 : une mutation · MUT_SANS_BASE=1 : sauter le point de depart)
A lancer sous le garde reseau : tools/sous_garde.sh python3 tools/mut_seance_cf_d.py
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FICHIERS = ('app.js', 'coach.js', 'log.js', 'setup.js', 'screens.js', 'state.js', 'tracking.js', 'style.css', 'index.html')
LO = 'log.js'

# ── ancres (le texte EXACT du code sain) ──
PALIER_FN = "function _estPalierDrop(ex,si){ return !!(ex&&ex.dropset)&&si>=_dropDebut(ex); }"
NB_FN = "function _nbPaliers(ex){ return (ex&&ex.dropset&&Array.isArray(ex.sets))?ex.sets.length-_dropDebut(ex):0; }"
OKPAL = "const ok=k=>!_estPalierDrop(ex,k)||_nbPaliers(ex)>=2;"
REGLE_SUIT = "    if(_estPalierDrop(ex,k)) ex.dropset.paliers=_nbPaliers(ex)-1;"
SPLICE = "    ex.sets.splice(k,1);\n    const recaler"
LIGNE_PALIER = "    if(_estPalierDrop(ex,si)&&!_serieSupprimable(ex,si)) return `<div style="
PHRASE = "Dernier palier du dropset : le retirer laisserait un dropset sans palier, rien n'est supprimé."
CONFIRME = "  if(set.done) showConfirm((_estPalierDrop(ex,si)?"
LIBELLE = "${_escNote(String(_estPalierDrop(ex,si)?'Palier':tp))} ·"
ATT_RECALE = "    _pdcAtt=recaler(_pdcAtt)||null; const _attPdc=_pdcAtt;"
RECALER = "    const recaler=c=>(c&&c.ei===e)?(c.si===k?null:(c.si>k?Object.assign({},c,{si:c.si-1}):c)):c;"
PERSIST = "    persist();renderExBlocks();\n    if(document.getElementById('rest-bar')"

# ── lot Z (18/11/2026) : les zéros inventés — ancres EXACTES du code sain ──
SD_SANS = ":{kg:null,reps:def&&def.reps};"
SD_CONNU = "const n=pp?{kg:_kgConnu(pp.kg)?pp.kg:null,reps:pp.reps}"
PV_VIDE = "...((pp.vide&&!(+pp.kg>0)&&_pdcDe(pp)===null)?{vide:true}:{})"
PV_PDC = "return pp?{..._pdcRepris(pp),"
AN_ANCRE0 = "ancre=(kgDe(ex.sets[0])===null&&kgDe(h)!==null)?h:ex.sets[0];"
AN_BASE = "const baseKg=kgDe(ancre);"
AN_REF = "ancre=kgDe(ref)===null?derniere:ref;"
AN_BOUCLE = "if((i>0||suite)&&kg!==null)kg=_roundToGym("
AN_PALIER = "newSets.push({kg:kg===null?null:(kg||0),reps:baseReps,done:false,type:'N',..._pdcVideDe(ancre)});"
RM_DEPART = "depart={kg:(s0&&_kgConnu(s0.kg))?s0.kg:null,reps:(s0&&s0.reps)||8,done:false,type:'N',..._pdcVideDe(s0)};"
GRP_KG = "const newKg=lastKg===null?null:(lastKg>0?_roundToGym(lastKg*factor):0);"
GRP_NEUF = "sets:[_serieDepuis(null,{reps:5},'N')],group:gid,groupType:'super'}"
PROG_SET = "kg:(l&&_kgConnu(l.kg))?l.kg:null,reps:"
TYPE_SEANCE = "sets.push({kg:null,reps:x.reps||10,type:'N',rest:x.rest||120});"
GEN_S3 = "const _s3=(reps)=>[{kg:null,"

# (nom, [(fichier, avant, apres)], attendu, partie)
MUT = [
    ('D01 ⛔⛔ le DERNIER palier restant se supprime (le dropset reste sans palier : sémantique non décidée tranchée en silence)',
     [(LO, OKPAL, "const ok=k=>true;")], 'GARDE', 'ecran'),
    ('D02 ⛔⛔ le réglage ne SUIT plus : un palier part, `dropset.paliers` garde l\'ancien nombre (la série normale bascule en « palier »)',
     [(LO, REGLE_SUIT, "")], 'GARDE', 'ecran'),
    ('D03 ⛔ le réglage retire DEUX paliers au lieu d\'un',
     [(LO, REGLE_SUIT, "    if(_estPalierDrop(ex,k)) ex.dropset.paliers=_nbPaliers(ex)-2;")], 'GARDE', 'ecran'),
    ('D04 ⛔ le réglage est calculé APRÈS le retrait (un de trop : paliers = nombre restant − 1)',
     [(LO, REGLE_SUIT, ""), (LO, SPLICE, "    ex.sets.splice(k,1); if(ex.dropset&&k>=_dropDebut(ex)-1) ex.dropset.paliers=_nbPaliers(ex)-1;\n    const recaler")], 'GARDE', 'ecran'),
    ('D05 ⛔ un palier ne se supprime que s\'il en reste TROIS (le palier isolé est de nouveau refusé à 2)',
     [(LO, OKPAL, "const ok=k=>!_estPalierDrop(ex,k)||_nbPaliers(ex)>=3;")], 'GARDE', 'ecran'),
    ('D06 ⛔⛔ TOUT palier est de nouveau verrouillé (l\'état d\'avant le lot D : D-173 refusé)',
     [(LO, OKPAL, "const ok=k=>!_estPalierDrop(ex,k);")], 'GARDE', 'ecran'),
    ('D07 ⛔ la feuille ne DIT plus pourquoi le dernier palier reste (la contradiction est cachée)',
     [(LO, PHRASE, "…")], 'GARDE', 'ecran'),
    ('D08 ⛔ la ligne du dernier palier n\'est plus verrouillée (un bouton qui ne fait rien)',
     [(LO, LIGNE_PALIER, "    if(false) return `<div style=")], 'GARDE', 'ecran'),
    ('D09 ⛔⛔ un palier DÉJÀ POINTÉ part sans confirmation (volume, records et calories perdus en silence)',
     [(LO, CONFIRME, "  if(set.done&&!_estPalierDrop(ex,si)) showConfirm((_estPalierDrop(ex,si)?")], 'GARDE', 'ecran'),
    ('D10 ⛔ la feuille ne dit plus « Palier » (un palier se lit « Normal »)',
     [(LO, LIBELLE, "${_escNote(String(tp))} ·")], 'GARDE', 'ecran'),
    ('D11 ⛔⛔ le sens PDC en attente n\'est plus recalé (il garde l\'ancien index : le montant va à la voisine)',
     [(LO, ATT_RECALE, "    const _attPdc=_pdcAtt;")], 'GARDE', 'ecran'),
    ('D12 ⛔ la question du RIR n\'est plus recalée (la réponse irait au palier d\'à côté)',
     [(LO, RECALER, "    const recaler=c=>c;")], 'GARDE', 'ecran'),
    ('D13 ⛔⛔ la suppression retire de nouveau la DERNIÈRE série (le mauvais palier part)',
     [(LO, SPLICE, "    ex.sets.pop();\n    const recaler")], 'GARDE', 'ecran'),
    ('D14 ⛔ supprimer un palier retire AUSSI sa voisine',
     [(LO, SPLICE, "    ex.sets.splice(k,2);\n    const recaler")], 'GARDE', 'ecran'),
    ('D15 ⛔⛔ supprimer un palier efface tout le RÉGLAGE du dropset (la structure est perdue)',
     [(LO, SPLICE, "    ex.sets.splice(k,1); if(ex.dropset) delete ex.dropset;\n    const recaler")], 'GARDE', 'ecran'),
    ('D16 ⛔ la notion de PALIER disparaît (tout est série normale : le réglage ne suit plus)',
     [(LO, PALIER_FN, "function _estPalierDrop(ex,si){ return false; }")], 'GARDE', 'ecran'),
    ('D17 ⛔ la frontière série / palier est décalée d\'un cran (une série normale devient un palier)',
     [(LO, PALIER_FN, "function _estPalierDrop(ex,si){ return !!(ex&&ex.dropset)&&si>=_dropDebut(ex)-1; }")], 'GARDE', 'ecran'),
    ('D18 ⛔ un nom d\'exercice du catalogue est codé en dur dans la règle des paliers',
     [(LO, PALIER_FN, "function _estPalierDrop(ex,si){ return !!(ex&&ex.dropset)&&ex.name!=='Squat'&&si>=_dropDebut(ex); }")], 'GARDE', 'ecran'),
    ('D19 ⛔ l\'ancien format (aucun `paliers` écrit) n\'est plus reconnu : le nombre de paliers se lit directement dans le réglage',
     [(LO, NB_FN, "function _nbPaliers(ex){ return (ex&&ex.dropset)?(Math.round(+ex.dropset.paliers)||0):0; }")], 'GARDE', 'ecran'),
    ('D20 ⛔⛔ la suppression n\'est plus écrite sur le disque (règle d\'or #3 : une reprise retrouve le palier supprimé)',
     [(LO, PERSIST, "    renderExBlocks();\n    if(document.getElementById('rest-bar')")], 'GARDE', 'ecran'),
    # ── LOT Z : les zéros inventés (chaque mutation REMET un zéro fabriqué ou fait perdre un état de charge) ──
    ('Z01 ⛔⛔ `_serieDepuis` sans source reprend le `def.kg` de l\'appelant (contre-sonde 5 : un « 0 écrit » sans source)',
     [(LO, SD_SANS, ":def;")], 'GARDE', 'zecran'),
    ('Z02 ⛔⛔ `_serieDepuis` : une charge inconnue de la série source devient 0',
     [(LO, SD_CONNU, "const n=pp?{kg:pp.kg||0,reps:pp.reps}")], 'GARDE', 'zecran'),
    ('Z03 ⛔ `_pdcVideDe` ne recopie plus « à vide »',
     [(LO, PV_VIDE, "...{}")], 'GARDE', 'zecran'),
    ('Z04 ⛔ `_pdcVideDe` ne recopie plus le PDC / lest / assistance',
     [(LO, PV_PDC, "return pp?{")], 'GARDE', 'zecran'),
    ('Z05 ⛔⛔ `applyDropset` : un zéro écrit (série n°1) cède de nouveau la place à l\'historique (`0||x`)',
     [(LO, AN_ANCRE0, "ancre=(!(+(ex.sets[0]&&ex.sets[0].kg)>0)&&kgDe(h)!==null)?h:ex.sets[0];")], 'GARDE', 'zecran'),
    ('Z06 ⛔⛔ `applyDropset` : un départ inconnu sans source devient 0 (trois zéros inventés)',
     [(LO, AN_BASE, "const baseKg=kgDe(ancre)||0;")], 'GARDE', 'zecran'),
    ('Z07 ⛔ `applyDropset` : un zéro écrit sur la PROCHAINE série cède la place à la dernière série faite',
     [(LO, AN_REF, "ancre=!(kgDe(ref)>0)?derniere:ref;")], 'GARDE', 'zecran'),
    ('Z08 ⛔ `applyDropset` : une charge inconnue passe par le pourcentage (null × 0,9 = 0)',
     [(LO, AN_BOUCLE, "if((i>0||suite))kg=_roundToGym(")], 'GARDE', 'zecran'),
    ('Z09 ⛔⛔ `applyDropset` : les paliers perdent le PDC / lest / « à vide » de la série dont ils partent',
     [(LO, AN_PALIER, "newSets.push({kg:kg===null?null:(kg||0),reps:baseReps,done:false,type:'N'});")], 'GARDE', 'zecran'),
    ('Z10 ⛔⛔ `removeDropset` : la série qui reste fabrique un zéro (`kg||0`, contre-sonde 4)',
     [(LO, RM_DEPART, "depart={kg:(s0&&s0.kg)||0,reps:(s0&&s0.reps)||8,done:false,type:'N',..._pdcVideDe(s0)};")], 'GARDE', 'zecran'),
    ('Z11 ⛔ `removeDropset` : la série qui reste perd son PDC / lest / « à vide »',
     [(LO, RM_DEPART, "depart={kg:(s0&&_kgConnu(s0.kg))?s0.kg:null,reps:(s0&&s0.reps)||8,done:false,type:'N'};")], 'GARDE', 'zecran'),
    ('Z12 ⛔ `addToGroup` (dégressif) : une charge inconnue devient 0',
     [(LO, GRP_KG, "const newKg=lastKg>0?_roundToGym(lastKg*factor):0;")], 'GARDE', 'zecran'),
    ('Z13 ⛔ ajouter un exercice à un superset fabrique de nouveau un « 0 écrit »',
     [(LO, GRP_NEUF, "sets:[{kg:0,reps:5,done:false,type:'N'}],group:gid,groupType:'super'}")], 'GARDE', 'zecran'),
    ('Z14 ⛔ éditeur de programme « + série » : une charge jamais écrite se copie en 0',
     [(LO, PROG_SET, "kg:l?(l.kg||0):null,reps:")], 'GARDE', 'zecran'),
    ('Z15 ⛔ chargement d\'un programme : une charge ABSENTE devient 0',
     [(LO, "(_kgConnu(s.kg)?s.kg:null)", "(s.kg===null?null:(s.kg||0))")], 'GARDE', 'zecran'),
    ('Z16 ⛔ la carte « type de séance » écrit de nouveau un zéro',
     [(LO, TYPE_SEANCE, "sets.push({kg:0,reps:x.reps||10,type:'N',rest:x.rest||120});")], 'GARDE', 'zecran'),
    ('Z17 ⛔ le générateur de programme écrit de nouveau un zéro (1ʳᵉ série de chaque exercice)',
     [(LO, GEN_S3, "const _s3=(reps)=>[{kg:0,")], 'GARDE', 'zecran'),
    ('Z18 ⛔ (source) `_serieDepuis` relit `def.kg`',
     [(LO, SD_SANS, ":{kg:def&&def.kg,reps:def&&def.reps};")], 'GARDE', 'pur'),
]

BANC = os.path.join('tools', 'banc_seance_cf_d.js')


def banc(arbre, partie):
    env = dict(os.environ, TZ='Europe/Paris')
    if partie == 'zecran':          # lot Z : l'écran, limité aux scénarios ZE* (les zéros inventés) — rapide
        env['SCFD_SEUL'] = 'ZE1,ZE2,ZE3,ZE4,ZE5'
        partie = 'ecran'
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
    return rouges, (ok.group(0) if ok else '?')


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_scfd_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'clone', 'exercises', 'anatomy', 'muscles'))
    for d in ('exercises', 'anatomy', 'muscles'):
        if os.path.isdir(os.path.join(SRC, d)) and not os.path.exists(os.path.join(a, d)):
            os.symlink(os.path.join(SRC, d), os.path.join(a, d))
    return tmp, a


def main():
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
