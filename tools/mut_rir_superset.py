#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — LE RIR EN SUPERSET (19/10/2026, retour de recette iPhone de Michel sur le clone D-088) : les temoins
B-RSS-* savent-ils ROUGIR ? Le retour decrivait UNE question generale au lieu d'une par mouvement : chaque mutation ci-dessous
fabrique une facon reelle d'y arriver (ou de perdre une reponse en route), et le banc doit la voir.

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord ; l'arbre sain est REJOUE a la fin (banc stable).
P00 remet TOUS les fichiers de l'app tels qu'ils sont dans la PROD ft-v1256 (racine de master 75288092), mot pour mot : le
banc doit y rester VERT — c'est la preuve, dans l'outil meme, que D-088 n'a rien perdu par rapport a la prod sur ce terrain.
Les autres mutations visent un INVARIANT ou un rouage precis, chacune avec SES temoins (4e champ, tous exiges).
[deguisee] = casse l'invariant sans toucher la ligne evidente ; [equivalente] = ne doit PAS rougir.
Un PLANTAGE du banc (code hors 0/1, ligne PLANTAGE, pas de ligne de total) n'est jamais « garde ».
⛔ Aucune mutation ne fait d'appel reel : le banc coupe toute requete hors du serveur local ; Milo n'est jamais appele.
Usage : python3 tools/mut_rir_superset.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_J=1 par defaut)
"""
import os, re, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROD = '75288092'                       # master : racine = la prod ft-v1256 (seul clone/ y differe de dbb50941)
LG, CS, SE, CO = 'log.js', 'style.css', 'setup.js', 'coach.js'
FICHIERS = (LG, CS, SE, CO)
APP = ('index.html', 'style.css', 'app.js', 'coach.js', 'constants.js', 'log.js', 'screens.js', 'setup.js', 'state.js', 'tracking.js',
       'translations.js', 'capacites-ia.js', 'food-health.js', 'supabase.js')
NOM = "String(S.wkt.exs[c.ei].name||'')"

MUT = [
    ("P00 [equivalente] le code de la PROD ft-v1256 remis mot pour mot (tous les fichiers de l'app) : le banc doit rester VERT", 'PROD', 'OK'),
    # ── une question par mouvement, a son nom
    ('M1 les questions perdent le nom de leur exercice (deux « Il t\'en restait combien ? » anonymes)',
     [(LG, "const avecNom=cibles.length>1;", "const avecNom=false;")], 'GARDE', ('B-RSS-①b',)),
    ('M2 ⭐ LE SYMPTOME DECRIT : le superset n\'accumule plus — seule la derniere serie validee recoit une question, generale',
     [(LG, "const _grpR=S.wkt.exs[ei].group, _enSS=!!(_grpR&&(S.wkt.exs[ei].groupType||'super')==='super');",
           "const _grpR=S.wkt.exs[ei].group, _enSS=false;")], 'GARDE', ('B-RSS-①b', 'B-RSS-⑤a')),
    ('M3 [deguisee] le repos ne garde que la DERNIERE serie en attente (la liste est bien deposee, mal consommee)',
     [(LG, "_rirCible=Array.isArray(_rirPending)?(_rirPending.length>1?_rirPending:(_rirPending[0]||null)):_rirPending;",
           "_rirCible=Array.isArray(_rirPending)?(_rirPending[_rirPending.length-1]||null):_rirPending;")], 'GARDE', ('B-RSS-①b',)),
    ('M4 [deguisee] les boutons sous « Marteau » ecrivent sur l\'Oiseau (bon nom, mauvaise serie)',
     [(LG, 'onclick="setRir(${c.ei},${c.si},${n})"', 'onclick="setRir(${c.ei?c.ei-1:c.ei},${c.si},${n})"')], 'GARDE', ('B-RSS-①b', 'B-RSS-②a')),
    ('M5 [deguisee] la reponse s\'ecrit toujours sur le 1er exercice de la seance',
     # D-093 : la garde de `setRir` est `if(!set) return;` (« Échec » répond aussi sur une série X) — même mutation, nouvelle ancre.
     [(LG, "const set=S.wkt&&S.wkt.exs&&S.wkt.exs[ei]&&S.wkt.exs[ei].sets[si];\n  if(!set) return;",
           "const set=S.wkt&&S.wkt.exs&&S.wkt.exs[0]&&S.wkt.exs[0].sets[si];\n  if(!set) return;")], 'GARDE', ('B-RSS-②a',)),
    ('M15 [deguisee] les noms sont croises : la question de l\'Oiseau porte « Marteau » et inversement',
     [(LG, NOM, "String(S.wkt.exs[c.ei?0:1]&&S.wkt.exs[c.ei?0:1].name||'')")], 'GARDE', ('B-RSS-①b',)),
    # ── a l'ecran : les deux questions se voient et se touchent
    ('M6 [deguisee] le CSS cache la 2e question (le DOM la porte toujours)',
     [(CS, "#rest-rir:empty{display:none;}", "#rest-rir:empty{display:none;}\n#rest-rir .rir-row ~ .rir-lbl,#rest-rir .rir-row ~ .rir-row{display:none;}")],
     'GARDE', ('B-RSS-①c',)),
    ('M7 [deguisee] la zone des questions est coupee a 96 px : la 2e rangee de boutons ne se touche plus',
     [(CS, "#rest-rir{margin-top:12px;padding-top:10px;border-top:1px solid var(--sep);}",
           "#rest-rir{margin-top:12px;padding-top:10px;border-top:1px solid var(--sep);max-height:96px;overflow:hidden;}")], 'GARDE', ('B-RSS-①c',)),
    # ── le superset et le chrono ne changent pas
    ('M11 [deguisee] un repos s\'intercale entre les deux mouvements (le superset n\'enchaine plus)',
     [(LG, "_expandedEx=_ssNext;renderExBlocks();_scrollTo(_ssNext);return;", "startRest(sec);_expandedEx=_ssNext;renderExBlocks();_scrollTo(_ssNext);return;")],
     'GARDE', ('B-RSS-①a',)),
    ('M13 [deguisee] les ECHAUFFEMENTS du superset recoivent aussi une question',
     [(LG, "return st&&st.type!=='É'&&st.type!=='W';", "return !!st;")], 'GARDE', ('B-RSS-⑤b',)),
    ('M14 [deguisee] un exercice HORS superset recoit lui aussi un nom (l\'affichage d\'avant change)',
     [(LG, "const avecNom=cibles.length>1;", "const avecNom=true;")], 'GARDE', ('B-RSS-②e', 'B-RSS-⑤c')),
    # ── la chaine des donnees
    ('M8 la reponse n\'est plus enregistree sur le telephone (setRir sans persist)',
     [(LG, "persist(); _renderRirRow(); renderExBlocks();", "_renderRirRow(); renderExBlocks();")], 'GARDE', ('B-RSS-③a',)),
    ('M9 l\'export de l\'historique perd la colonne RIR',
     [(SE, "rir:(r===null?'':r), volume:Math.round(kg*reps)});", "rir:'', volume:Math.round(kg*reps)});")], 'GARDE', ('B-RSS-③d',)),
    ('M10 le contexte de Milo ne porte plus le RIR des series',
     [(CO, "const rir = (_r===null) ? '' : (' RIR'+_r);", "const rir = '';")], 'GARDE', ('B-RSS-③e',)),
    ('M12 « Precedent » ne relit plus la reponse de la seance d\'avant',
     [(LG, 'return `<span class="prev-rir">·${_reserveBadgeTxt(n)}</span>`;', "return '';")], 'GARDE', ('B-RSS-③f',)),
    # ── equivalente
    ('M16 [equivalente] boutons de reponse de 44 px au lieu de 42',
     [(CS, "#rest-bar .rir-b{flex:1;min-width:0;height:42px;}", "#rest-bar .rir-b{flex:1;min-width:0;height:44px;}")], 'OK'),
]


def banc(arbre):
    """Rend (rouges, plantage). Un plantage n'est jamais un rouge : il n'attrape rien."""
    try:
        r = subprocess.run(['node', 'tools/banc_rir_superset.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
                           env=dict(os.environ, TZ='Europe/Paris'))
    except subprocess.TimeoutExpired:
        return [], 'PLANTAGE (delai depasse)'
    out = r.stdout + r.stderr
    rouges = [l.strip()[:170] for l in out.split('\n') if 'ROUGE' in l]
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
    tmp = tempfile.mkdtemp(prefix='mut_rss_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def une(m, prod):
    nom, remplacements, attendu = m[0], m[1], m[2]
    temoins = m[3] if len(m) > 3 else ()
    tmp, arbre = cloner()
    try:
        if remplacements == 'PROD':
            changes = [f for f in APP if prod.get(f) and prod[f] != open(os.path.join(arbre, f), encoding='utf-8').read()]
            if not changes:
                return nom, None, 'INVALIDE (code de la prod introuvable ou identique)', []
            for f in changes:
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(prod[f])
            nom = nom + ' [%d fichiers : %s]' % (len(changes), ', '.join(changes))
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
                    chk = subprocess.run(['node', '--check', os.path.join(arbre, f)], capture_output=True, text=True)
                    if chk.returncode:
                        return nom, None, 'INVALIDE (syntaxe cassee dans %s)' % f, []
        rouges, plantage = banc(arbre)
        if plantage:
            return nom, False, 'PLANTAGE', [plantage] + rouges
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu
        manque = [t for t in temoins if not temoin_present(rouges, t)]
        if ok and manque:
            ok, obtenu = False, 'GARDE sans ' + ', '.join(manque)
        return nom, ok, obtenu, rouges
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    prod = {f: subprocess.run(['git', 'show', PROD + ':' + f], cwd=SRC, capture_output=True, text=True).stdout for f in APP}
    tmp0, a0 = cloner()
    rouges, plantage = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rouges or plantage:
        print('  !! ARBRE SAIN DEJA ROUGE OU EN PLANTAGE — controle refuse :', ([plantage] if plantage else []) + rouges[:3]); return 1
    print('  arbre sain : 0 rouge (point de depart valide) · MUT_J=%s\n' % os.environ.get('MUT_J', '1'))
    choix = [m for m in MUT if not filtres or any(m[0].startswith(f) for f in filtres)]
    with ThreadPoolExecutor(max_workers=int(os.environ.get('MUT_J', '1'))) as ex:
        res = list(ex.map(lambda m: une(m, prod), choix))
    conformes = 0
    for nom, ok, obtenu, rouges in res:
        if ok is None:
            print('  INVALIDE  %s %s' % (nom, obtenu)); continue
        conformes += ok
        print('  %s  %-110s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0] if rouges else ''))
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
