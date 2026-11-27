#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — S4-GARDE (Claude N°2 Seance, 27/11/2026, ft-v1269) : les temoins B-S4GARDE-* savent-ils ROUGIR ?
(la protection contre le double appui : P1, 300 ms, ciblee, silencieuse, armee aux changements d'exercice par passage automatique)

[!!] Qualifie en cible le 27/11/2026 (25/25 sur 3899e4f0), puis M24 RETIREE le meme jour (R30, option A) : 24 mutations = 22 detectees + 2 equivalentes (M18, M25). Ancres relues a la main.
[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord (et REJOUE a la fin : un banc instable pourrait « attraper » par hasard).
Les mutations [equivalente] ne doivent PAS faire rougir (sinon le temoin mord sur la forme, pas sur le sens).
Un PLANTAGE du banc n'est jamais « garde ». Une mutation peut exiger un TEMOIN PRECIS (4e champ) : on prouve que CE temoin-la sait rougir.
Une mutation INVALIDE (ancre absente ou multiple) n'est pas un succes : elle dit que le code a bouge et que l'ancre est a relire.
Usage : python3 tools/mut_s4_garde.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_J=1 par defaut)
"""
import os, re, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LO = 'log.js'
FICHIERS = ('log.js',)

_REFUS = "if(set&&!set.done&&_gardeRefuse(S.wkt.exs[ei],_gardeGeste((typeof window!=='undefined')?window.event:undefined,ei,si))) return;"

MUT = [
    ('M1 [protection] la protection est absente (aucun refus)',
     [(LO, _REFUS, "")], 'GARDE', 'B-S4GARDE-G1'),
    ('M2 [portee] verrou GLOBAL : on ne regarde plus quel exercice a ete ouvert par le passage',
     [(LO, "if(!_garde||!ev||_garde.ex!==ex) return false;", "if(!_garde||!ev) return false;")], 'GARDE', 'B-S4GARDE-G6'),
    ('M3 [duree] la fenetre vaut 0 ms',
     [(LO, "const GARDE_PASSAGE_MS=300;", "const GARDE_PASSAGE_MS=0;")], 'GARDE', 'B-S4GARDE-G0'),
    ('M4 [horloge] l\'instant du GESTE est ignore : on lit l\'heure d\'execution (un gestionnaire lent fait sortir le 2e appui de la fenetre)',
     [(LO, "return (Number.isFinite(ts)&&ts>0&&ts<=maintenant+1&&maintenant-ts<GARDE_AGE_MAX_MS)?ts:maintenant;", "return maintenant;")], 'GARDE', 'B-S4GARDE-G3'),
    ('M5 [devalidation] la protection refuse aussi la DEVALIDATION',
     [(LO, "if(set&&!set.done&&_gardeRefuse(", "if(set&&_gardeRefuse(")], 'GARDE', 'B-S4GARDE-G5'),
    ('M6 [borne] la borne est incluse (300 ms exactement est refuse)',
     [(LO, "return (_gardeInstant(ev)-_garde.t)<GARDE_PASSAGE_MS;", "return (_gardeInstant(ev)-_garde.t)<=GARDE_PASSAGE_MS;")], 'GARDE', 'B-S4GARDE-G2'),
    ('M7 [borne basse] l\'ancienne borne arbitraire de -1000 ms est reintroduite (un geste ne avant l\'armement de plus de 1 s n\'est plus refuse)',
     [(LO, "return (_gardeInstant(ev)-_garde.t)<GARDE_PASSAGE_MS;", "return (_gardeInstant(ev)-_garde.t)<GARDE_PASSAGE_MS&&(_gardeInstant(ev)-_garde.t)>-1000;")], 'GARDE', 'B-S4GARDE-G2b'),
    ('M8 [navigation] ouvrir une carte a la main ne desarme plus la protection',
     [(LO, "  _gardeDesarmer();   // S4 : ouvrir une carte à la main est un choix de la personne — la protection du passage s'arrête\n", "")], 'GARDE', 'B-S4GARDE-G14'),
    ('M9 [armement] la sortie vers l\'exercice suivant n\'arme plus rien',
     [(LO, "if(_versSuite!==null) _gardeArmer(_versSuite);", "")], 'GARDE', 'B-S4GARDE-G1'),
    ('M10 [armement] l\'avance vers le partenaire du superset n\'arme plus rien',
     [(LO, "_gardeArmer(_mouv.idx);", "")], 'GARDE', 'B-S4GARDE-G8'),
    ('M11 [armement] le tour suivant du superset n\'arme plus rien',
     [(LO, "_gardeArmer(firstIdx);", "")], 'GARDE', 'B-S4GARDE-G9'),
    ('M12 [armement] l\'ancien groupe « drop » n\'arme plus rien',
     [(LO, "_gardeArmer(_ssNext);_expandedEx=_ssNext;renderExBlocks();_scrollTo(_ssNext);return;", "_expandedEx=_ssNext;renderExBlocks();_scrollTo(_ssNext);return;")], 'GARDE', 'B-S4GARDE-G12'),
    ('M13 [armement] l\'ancienne pyramide (avance differee) n\'arme plus rien',
     [(LO, "_restDoneCb=()=>{_gardeArmer(_ssNext);_expandedEx=_ssNext;", "_restDoneCb=()=>{_expandedEx=_ssNext;")], 'GARDE', 'B-S4GARDE-G13'),
    ('M14 [sans geste] un appel programmatique (aucun evenement) est refuse lui aussi',
     [(LO, "if(!ev||typeof ev.type!=='string'||!ev.target) return null;", "if(!ev||typeof ev.type!=='string'||!ev.target) ev={type:'click',target:document.getElementById('sr-'+ei+'-'+si)};")], 'GARDE', 'B-S4GARDE-G4'),
    ('M15 [donnee] la protection ecrit une trace dans la seance (donnee persistee)',
     [(LO, "_garde=ex?{ex,t:performance.now()}:null; }catch(e){ _garde=null; }", "_garde=ex?{ex,t:performance.now()}:null; if(ex)S.wkt._garde=1; }catch(e){ _garde=null; }")], 'GARDE', 'B-S4GARDE-G15'),
    ('M16 [horloge] horloge murale `Date.now()` a la place de la reference monotone',
     [(LO, "const maintenant=performance.now();", "const maintenant=Date.now();")], 'GARDE', 'B-S4GARDE-G1'),
    # M17 : ETIQUETEE « equivalente » A TORT dans la 1re version (27/11, contre-expertise) : elle change le resultat pour un horodatage de 5500 ms d'age
    # (ecart 0 → refuse, au lieu du repli → accepte). Les entrees des premiers temoins ne couvraient pas cette zone : survivant = TROU, pas equivalence. Reclassee GARDE, exige G3c.
    ('M17 [plausibilite] le seuil d\'age de l\'horodatage du geste passe de 5000 a 6000 ms (un horodatage de 5500 ms est cru)',
     [(LO, "const GARDE_AGE_MAX_MS=5000;", "const GARDE_AGE_MAX_MS=6000;")], 'GARDE', 'B-S4GARDE-G3c'),
    ('M18 [equivalente] le desarmement met `undefined` au lieu de `null`',
     [(LO, "function _gardeDesarmer(){ _garde=null; }", "function _gardeDesarmer(){ _garde=undefined; }")], 'OK'),
    ('M19 [identification] n\'importe quel type d\'evenement est un geste (un focusout, un appel pendant un evenement sans rapport, est refuse)',
     [(LO, "if(ev.type!=='click'&&!(ev.type==='keydown'&&ev.key==='Enter')) return null;", "")], 'GARDE', 'B-S4GARDE-G20'),
    ('M20 [identification] n\'importe quelle touche est un geste (pas seulement Entree)',
     [(LO, "!(ev.type==='keydown'&&ev.key==='Enter')", "!(ev.type==='keydown')")], 'GARDE', 'B-S4GARDE-G20'),
    ('M21 [identification] la cible n\'est plus verifiee (un clic dans une AUTRE ligne est un geste)',
     [(LO, "return (ligne&&ligne.contains(ev.target))?ev:null;", "return ev;")], 'GARDE', 'B-S4GARDE-G20'),
    ('M22 [arriere-plan] `visibilitychange` desarme meme quand la page est visible',
     [(LO, "if(document.visibilityState==='hidden') _gardeDesarmer();", "_gardeDesarmer();")], 'GARDE', 'B-S4GARDE-G19'),
    ('M23 [arriere-plan] `visibilitychange` ne desarme plus',
     [(LO, "document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden') _gardeDesarmer(); });", "")], 'GARDE', 'B-S4GARDE-G19'),
    # M24 RETIREE (R30, 27/11/2026, GO de Michel « option A », avec le temoin B-S4GARDE-G19b) : elle supprimait l'ecouteur `pagehide` de S4, lui-meme retire du code parce qu'il faisait rougir OD-07 et T4
    # du debrief au vrai rechargement (mesure : sans cette ligne, banc debrief 63 OK / 0 rouge). Son ancre n'existe plus : le script la refuserait comme INVALIDE. Le comportement decide (levee en
    # arriere-plan) reste couvert par M22 / M23 (temoin G19). Numeros non reutilises : M25 garde son nom. Ne pas la reintroduire sans relire BUGS.md §168 Q et R.
    ('M25 [equivalente] le test `Number.isFinite(ts)` est retire (`ts>0` rejette deja NaN et `ts<=maintenant+1` rejette deja l\'infini)',
     [(LO, "(Number.isFinite(ts)&&ts>0&&ts<=maintenant+1", "(ts>0&&ts<=maintenant+1")], 'OK'),
]


def banc(arbre):
    """Rend (rouges, plantage). Un plantage n'est jamais un rouge : il n'attrape rien."""
    try:
        r = subprocess.run(['node', 'tools/banc_s4_garde.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
                           env=dict(os.environ, TZ='Europe/Paris'))
    except subprocess.TimeoutExpired:
        return [], 'PLANTAGE (delai depasse)'
    out = r.stdout + r.stderr
    rouges = [l.strip()[:160] for l in out.split('\n') if 'ROUGE' in l]
    plantage = None
    if r.returncode not in (0, 1):
        plantage = 'PLANTAGE (code %d)' % r.returncode
    elif 'PLANTAGE' in out:
        plantage = 'PLANTAGE (' + next(l.strip()[:120] for l in out.split('\n') if 'PLANTAGE' in l) + ')'
    elif not any(l.startswith('────') and 'OK /' in l for l in out.split('\n')):
        plantage = 'PLANTAGE (aucune ligne de total)'
    return rouges, plantage


def temoin_present(rouges, temoin):
    pat = re.compile(re.escape(temoin) + r'(?![0-9A-Za-z])')
    return any(pat.search(l) for l in rouges)


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_s4garde_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'clone'))
    return tmp, a


def une(m):
    nom, remplacements, attendu = m[0], m[1], m[2]
    temoin = m[3] if len(m) > 3 else None
    tmp, arbre = cloner()
    try:
        srcs = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
        invalide = []
        for f, av, ap in remplacements:
            if srcs[f].count(av) != 1:
                invalide.append('%s:%s (x%d)' % (f, av[:50], srcs[f].count(av)))
            else:
                srcs[f] = srcs[f].replace(av, ap, 1)
        if invalide:
            return nom, None, 'INVALIDE (ancre absente ou multiple : %s)' % invalide, []
        for f in FICHIERS:
            open(os.path.join(arbre, f), 'w', encoding='utf-8').write(srcs[f])
        # une mutation qui casse la SYNTAXE ne prouve rien (elle rougit tout) : on la refuse
        for f in FICHIERS:
            chk = subprocess.run(['node', '-e', "new Function(require('fs').readFileSync(process.argv[1],'utf8'))", os.path.join(arbre, f)], capture_output=True, text=True)
            if chk.returncode:
                return nom, None, 'INVALIDE (syntaxe cassee dans %s)' % f, []
        rouges, plantage = banc(arbre)
        if plantage:
            return nom, False, 'PLANTAGE', [plantage] + rouges
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu
        if ok and temoin and not temoin_present(rouges, temoin):
            ok, obtenu = False, 'GARDE sans ' + temoin
        return nom, ok, obtenu, rouges
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    tmp0, a0 = cloner()
    rouges, plantage = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rouges or plantage:
        print('  !! ARBRE SAIN DEJA ROUGE OU EN PLANTAGE — controle refuse :', ([plantage] if plantage else []) + rouges[:3]); return 1
    print('  arbre sain : 0 rouge (point de depart valide) · MUT_J=%s\n' % os.environ.get('MUT_J', '1'))
    choix = [m for m in MUT if not filtres or any(m[0].startswith(f) for f in filtres)]
    with ThreadPoolExecutor(max_workers=int(os.environ.get('MUT_J', '1'))) as ex:
        res = list(ex.map(une, choix))
    conformes = 0
    for nom, ok, obtenu, rouges in res:
        if ok is None:
            print('  INVALIDE  %s %s' % (nom, obtenu)); continue
        conformes += ok
        print('  %s  %-100s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0] if rouges else ''))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges[1:]:
                print('        ' + r)
    # rejeu de l'arbre sain APRES la campagne : un banc instable aurait pu « attraper » par hasard
    tmp1, a1 = cloner()
    rouges1, plantage1 = banc(a1)
    shutil.rmtree(tmp1, ignore_errors=True)
    if rouges1 or plantage1:
        print('\n  !! ARBRE SAIN ROUGE AU REJEU FINAL — campagne refusee (banc instable) :', ([plantage1] if plantage1 else []) + rouges1[:3])
        return 1
    print('\n  arbre sain rejoue a la fin : 0 rouge (banc stable)')
    print('\n%d/%d conformes' % (conformes, len(choix)))
    return 0 if conformes == len(choix) else 1


if __name__ == '__main__':
    sys.exit(main())
