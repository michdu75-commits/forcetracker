#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — S2-NAV (session-C / Claude N°2, 24/11/2026, ft-v1269) : les temoins B-S2NAV-* savent-ils ROUGIR ?
(le passage automatique entre exercices, la sortie des supersets, la vue `S.wkt.vue`, la non-regression dropset / pyramide)

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord (et REJOUE a la fin : un banc instable pourrait « attraper » par hasard).
M00 remet log.js tel qu'il etait AVANT le lot (master dde3e9a2) : les temoins S2-* doivent rougir, les NR-* (ecrits AVANT le code) doivent rester verts.
Les mutations [equivalente] ne doivent PAS faire rougir (sinon le temoin mord sur la forme, pas sur le sens).
Un PLANTAGE du banc n'est jamais « garde ». Une mutation peut exiger un TEMOIN PRECIS (4e champ) : on prouve que CE temoin-la sait rougir.
Usage : python3 tools/mut_s2_nav.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_J=1 par defaut)
"""
import os, re, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = 'dde3e9a2'
LO = 'log.js'
FICHIERS = ('log.js',)

_VERS = "    if(_versSuite!==null){ _expandedEx=_versSuite; renderExBlocks(); _scrollTo(_versSuite); }\n    startRest(sec);"
_SUITE = "    if(_versSuite!==null) _restSuiteMontrer(S.wkt.exs[ei], S.wkt.exs[_versSuite]);"

MUT = [
    ("M00 code d'AVANT le lot remis mot pour mot (master dde3e9a2) : S2-* rougissent, NR-* restent verts", 'AVANT', 'GARDE', 'B-S2NAV-S2-1'),
    ('M1 [ordre] le passage se fait APRES startRest (le chronometre demarre avant)',
     [(LO, _VERS, "    startRest(sec);\n    if(_versSuite!==null){ _expandedEx=_versSuite; renderExBlocks(); _scrollTo(_versSuite); }")], 'GARDE', 'B-S2NAV-S2-1'),
    ('M2 [differe] une avance en differe est de nouveau armee apres le repos',
     [(LO, _SUITE, _SUITE + "\n    if(_versSuite!==null) _restDoneCb=()=>{_expandedEx=_versSuite;renderExBlocks();};")], 'GARDE', 'B-S2NAV-S2-4'),
    ('M3 [echauffements] un exercice n\'est « termine » que si TOUTES ses lignes sont cochees (la regle d\'avant le 18/08)',
     [(LO, "  return _exTermine(ex)?apresCe(ei+1):{kind:'meme',idx:ei};", "  return (ex.sets.every(s=>s&&s.done))?apresCe(ei+1):{kind:'meme',idx:ei};")], 'GARDE', 'B-S2NAV-S2-5'),
    ('M4 [superset] l\'ordre circulaire oublie le membre lui-meme : 2+3 sort trop tot',
     [(LO, "    for(let d=1;d<=m.length;d++){", "    for(let d=1;d<m.length;d++){")], 'GARDE', 'B-S2NAV-S2-6'),
    ('M5 [superset] le partenaire est choisi PAR POSITION, sans regarder ce qu\'il lui reste (le defaut du 24/11)',
     [(LO, "      if(_resteAFaireEx(exs[k])) return k===ei?{kind:'meme',idx:ei}:{kind:'membre',idx:k};", "      return k===ei?{kind:'meme',idx:ei}:{kind:'membre',idx:k};")], 'GARDE', 'B-S2NAV-S2-6'),
    ('M6 [superset] il n\'y a plus de sortie du groupe',
     [(LO, "    return apresCe(Math.max.apply(null,m)+1);                                    // le groupe est terminé : après son dernier membre", "    return {kind:'fin',idx:null};                                    // le groupe est terminé : après son dernier membre")], 'GARDE', 'B-S2NAV-S2-6'),
    ('M7 [sortie] la sortie ouvre l\'exercice suivant MEME TERMINE',
     [(LO, "  const apresCe=(debut)=>{ for(let k=debut;k<exs.length;k++) if(_resteAFaireEx(exs[k])) return {kind:'sortie',idx:k}; return {kind:'fin',idx:null}; };", "  const apresCe=(debut)=>{ if(debut<exs.length) return {kind:'sortie',idx:debut}; return {kind:'fin',idx:null}; };")], 'GARDE', 'B-S2NAV-S2-7'),
    ('M8 [echauffement] valider un echauffement sur un exercice termine declenche un passage',
     [(LO, "    if((set.type==='É'||set.type==='W')&&(_mouv.kind==='sortie'||_mouv.kind==='fin'))_mouv={kind:'meme',idx:ei};\n", "")], 'GARDE', 'B-S2NAV-S2-5b'),
    ('M9 [dock] le bouton « ＋ Série sur … » n\'existe plus',
     [(LO, "    +'<button type=\"button\" class=\"rbtn rs-add\" onclick=\"ajouterSerieDepuisDock()\">＋ Série sur '+_restSuiteNom(exFini.name)+'</button>';", "    +'';")], 'GARDE', 'B-S2NAV-S2-1b'),
    ('M10 [dock] « ＋ Série » ajoute sur le DERNIER exercice, pas sur celui qu\'on vient de finir',
     [(LO, "ei=(ex&&S.wkt&&Array.isArray(S.wkt.exs))?S.wkt.exs.indexOf(ex):-1;", "ei=(ex&&S.wkt&&Array.isArray(S.wkt.exs))?S.wkt.exs.length-1:-1;")], 'GARDE', 'B-S2NAV-S2-3'),
    ('M11 [RIR] la question ne nomme plus l\'exercice apres le passage',
     [(LO, "  const avecNom=cibles.length>1||cibles.some(c=>c.ei!==_expandedEx);", "  const avecNom=cibles.length>1;")], 'GARDE', 'B-S2NAV-S2-9'),
    ('M12 [vue] la vue s\'ecrit par persist() (synchronisation a chaque carte ouverte)',
     [(LO, "    d.vue=v; localStorage.setItem('ft4_wkt',JSON.stringify(d));", "    persist();")], 'GARDE', 'B-S2NAV-VUE-7b'),
    ('M13 [vue] la vue s\'ecrit meme si le disque porte une AUTRE seance (autre onglet)',
     [(LO, "    if(!meme) return;                                             // une autre séance, ou plus de séance : on ne touche à rien\n", "")], 'GARDE', 'B-S2NAV-VUE-7'),
    ('M14 [vue] un pointeur dont le nom ne correspond plus est cru quand meme (exercice vise « au rang »)',
     [(LO, "exs[v.i]&&String(exs[v.i].name||'')===String(v.n||'')) return v.i;", "exs[v.i]) return v.i;")], 'GARDE', 'B-S2NAV-VUE-6'),
    ('M15 [vue] la reprise ne lit plus la vue (le dernier exercice, comme avant)',
     [(LO, "  if(_expandedEx===null&&_vuePremiere){ const r=_vueLire(); if(r!==null)_expandedEx=r; }\n", "")], 'GARDE', 'B-S2NAV-VUE-2'),
    ('M16 [vue] repli : l\'exercice de la serie la plus recente est rouvert meme s\'il est termine',
     [(LO, "    if(_resteAFaireEx(exs[bi])) return bi;\n    for(let k=bi+1;k<exs.length;k++) if(_resteAFaireEx(exs[k])) return k;\n    return bi;", "    return bi;")], 'GARDE', 'B-S2NAV-VUE-5'),
    ('M17 [non-regression] un groupe pyramid-up passe maintenant a son partenaire SANS repos (comme un groupe drop)',
     [(LO, "      if(groupType==='super'||groupType==='drop'){", "      if(groupType==='super'||groupType==='drop'||groupType==='pyramid-up'){")], 'GARDE', 'B-S2NAV-NR-7'),
    ('M18 [non-regression] le dernier palier d\'un dropset arme maintenant un passage au suivant',
     [(LO, "        if(lbl)lbl.textContent='📉 Série dégressive terminée';\n        startRest(sec);", "        if(lbl)lbl.textContent='📉 Série dégressive terminée';\n        startRest(sec);_restDoneCb=()=>{_expandedEx=ei+1;renderExBlocks();};")], 'GARDE', 'B-S2NAV-NR-1b'),
    ('M19 [non-regression] le repos apres un echec X n\'est plus de 240 s',
     [(LO, "const restByType={N:defForEx,É:45,X:240,W:45,E:240};", "const restByType={N:defForEx,É:45,X:120,W:45,E:240};")], 'GARDE', 'B-S2NAV-NR-10'),
    ('M20 [non-regression] un groupe « drop » sort maintenant du groupe quand tout est fait',
     [(LO, "    } else if(groupType==='drop'&&S.wkt.exs[ei].group){\n      // Dernier palier : repos complet", "    } else if(groupType==='drop'&&S.wkt.exs[ei].group){\n      _expandedEx=Math.min(S.wkt.exs.length-1,ei+1);\n      // Dernier palier : repos complet")], 'GARDE', 'B-S2NAV-NR-6b'),
    ('M23 [vue] la vue s\'ecrit des le PREMIER rendu (afficher modifie la seance : le defaut des bancs « aide » / « abandon »)',
     [(LO, "    if(!_vueBase||_vueBase.w!==w){ _vueBase={w,i:v.i,n:v.n}; return; }   // 1ᵉʳ rendu de cette séance : rien n'est écrit\n", "    if(!_vueBase||_vueBase.w!==w){ _vueBase={w,i:-1,n:''}; }\n")], 'GARDE', 'B-S2NAV-VUE-0'),
    ('M24 [vue] l\'ecriture de la vue modifie AUSSI une valeur de serie sur le disque (« champ seul » viole sans changer une longueur)',
     [(LO, "    d.vue=v; localStorage.setItem('ft4_wkt',JSON.stringify(d));", "    d.vue=v; try{ d.exs[0].sets[0].kg=(d.exs[0].sets[0].kg||0)+1; }catch(_){} localStorage.setItem('ft4_wkt',JSON.stringify(d));")], 'GARDE', 'B-S2NAV-VUE-7b'),
    ('M21 [equivalente] le rang du partenaire est converti en nombre (meme valeur)',
     [(LO, "      const firstIdx=_mouv.idx;", "      const firstIdx=+_mouv.idx;")], 'OK'),
    ('M22 [equivalente] `_vueMemoriser` relit le rang par un accesseur equivalent',
     [(LO, "    const ex=w.exs[_expandedEx]; if(!ex) return;", "    const ex=w.exs.slice()[_expandedEx]; if(!ex) return;")], 'OK'),
]


def banc(arbre):
    """Rend (rouges, plantage). Un plantage n'est jamais un rouge : il n'attrape rien."""
    try:
        r = subprocess.run(['node', 'tools/banc_s2_nav.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
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
    tmp = tempfile.mkdtemp(prefix='mut_s2nav_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'clone'))
    return tmp, a


def une(m, avant):
    nom, remplacements, attendu = m[0], m[1], m[2]
    temoin = m[3] if len(m) > 3 else None
    tmp, arbre = cloner()
    try:
        if remplacements == 'AVANT':
            cur = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
            if any(not avant[f] for f in FICHIERS) or all(avant[f] == cur[f] for f in FICHIERS):
                return nom, None, "INVALIDE (code d'avant introuvable ou identique)", []
            for f in FICHIERS:
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(avant[f])
        else:
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
                if f.endswith('.js'):
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
    avant = {f: subprocess.run(['git', 'show', AVANT + ':' + f], cwd=SRC, capture_output=True, text=True).stdout for f in FICHIERS}
    tmp0, a0 = cloner()
    rouges, plantage = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rouges or plantage:
        print('  !! ARBRE SAIN DEJA ROUGE OU EN PLANTAGE — controle refuse :', ([plantage] if plantage else []) + rouges[:3]); return 1
    print('  arbre sain : 0 rouge (point de depart valide) · MUT_J=%s\n' % os.environ.get('MUT_J', '1'))
    choix = [m for m in MUT if not filtres or any(m[0].startswith(f) for f in filtres)]
    with ThreadPoolExecutor(max_workers=int(os.environ.get('MUT_J', '1'))) as ex:
        res = list(ex.map(lambda m: une(m, avant), choix))
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
    raise SystemExit(main())
