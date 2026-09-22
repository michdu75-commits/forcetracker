#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF DU GENERATEUR DE PDF de ft-v1234 — ses gardes mordent-ils vraiment ?

⛔⛔ LE CLONE GARDE SON `.git` (`git clone`, PAS un `tar`). Lecon ft-v1227 : un arbre copie
    sans `.git` fait refuser le generateur pour « HEAD illisible », donc TOUTES les mutations
    echouent au meme endroit et le controle ne prouve RIEN.

⛔⛔ ET CHAQUE MUTATION EST **COMMITEE** DANS LE CLONE avant d appeler le generateur, puis
    `origin/master` est aligne localement. Sans ca, l arbre sale rend `publie=False` et le
    generateur refuse sur un garde de PUBLICATION au lieu du garde vise.
    *Un controle negatif dont toutes les mutations echouent au meme endroit ne prouve pas que
    les gardes mordent : il prouve qu on n est jamais arrive jusqu a eux.*

⭐ LA SORTIE IMPRIME LA RAISON DE CHAQUE REFUS — c est elle qui prouve que le bon garde a mordu.

Usage : python3 tools/mut_gen_ordre_1234.py <journal_passe> [<banc>] [<mut>]
"""
import os
import subprocess
import sys

SOURCE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
R = '/tmp/genordre_mut'
PASSE = sys.argv[1] if len(sys.argv) > 1 else ''
BANC = sys.argv[2] if len(sys.argv) > 2 else '/tmp/banc1234.log'
MUT = sys.argv[3] if len(sys.argv) > 3 else '/tmp/mut1234.log'
SC, AP = os.path.join(R, 'screens.js'), os.path.join(R, 'app.js')


def git(*a):
    return subprocess.run(('git',) + a, capture_output=True, text=True, cwd=R)   # noqa


VIDE = "lgn(m.lbl, undefined, 'Pas encore assez de données', true)"
SPAN = ("      +'<span style=\"color:var('+(vide?'--t3':'--t1')+');min-width:0;'"
        "+(vide?'opacity:.75;':'')+'\">'+txt+'</span></div>';")
AUTRE = ("if(lignes && (pa.habitudes.autre||[]).length)\n"
         "      lignes+=lgn('Autre', pa.heures.autre, "
         "pa.habitudes.autre.map(x=>esc(x.nom)).join(' · '), false);")

MUTATIONS = [
    ('G01', SC, "    let lignes=MM.map(m=>{",
     "    let lignes=Object.keys(pa.habitudes).map(m=>{",
     'refus', "l ordre de STOCKAGE revient (le code d avant)"),
    ('G02', SC, "    let lignes=MM.map(m=>{",
     "    const _O=['petitdej','collation','dejeuner','collation2','diner'];\n"
     "    let lignes=MM.map(m=>{",
     'refus', "DEGUISEE : l ordre RECOPIE sur place, l ecran reste juste"),
    ('G03', SC, "'Pas encore assez de données', true)", "'', true)",
     'refus', "l etat vide devient muet"),
    ('G04', SC, VIDE, "lgn(m.lbl, pa.heures[m.k], 'Pas encore assez de données', true)",
     'refus', "DEGUISEE : la ligne vide recupere une heure"),
    ('G05', AP, "const _PA_MIN_JOURS = 3;", "const _PA_MIN_JOURS = 1;",
     'refus', "PERIMETRE : le seuil metier de ft-v1233 a bouge"),
    ('G06', SC, SPAN, SPAN + "\n    const lgn2=(l,t)=>'<div class=\"nu-lgn\">'+l+t+'</div>';",
     'refus', "le gabarit de ligne est duplique"),
    ('G07', SC, AUTRE, "", 'refus', "« Autre » disparait en silence"),
    ('G08', AP, "      .sort((a,b)=> (b.jours-a.jours) || (b.n-a.n) || a.nom.localeCompare(b.nom,'fr'))",
     "      .sort((a,b)=> (b.jours-a.jours) || (b.n-a.n))",
     'refus', "PERIMETRE : le departage deterministe a saute"),
    # ⭐ CELLE QUI DOIT RESTER VERTE — sans elle, on ne saurait pas si on mesure le code
    #    ou la phrase qui l explique (R30).
    ('V01', SC, "function _blocApprisHTML(){",
     "/* note : Object.keys(pa.habitudes), FOOD_MEALS, LBL={petitdej:...}, petitdej,\n"
     "   collation, dejeuner, collation2, diner, Pas encore assez de donnees, nu-lgn, autre */\n"
     "function _blocApprisHTML(){",
     'ok', "un COMMENTAIRE citant tous les mots ne doit rien changer"),
]


def main():
    if not PASSE or not os.path.exists(PASSE):
        sys.exit('usage : mut_gen_ordre_1234.py <journal de passe_valide.sh> [banc] [mut]')
    subprocess.run(['rm', '-rf', R])                                             # noqa
    subprocess.run(['git', 'clone', '-q', SOURCE, R])                            # noqa
    env = dict(os.environ, OR_PASSE=PASSE, OR_BANC=BANC, OR_MUT=MUT,
               OR_PDF='/tmp/genordre_essai.pdf')
    base = git('rev-parse', 'HEAD').stdout.strip()
    ok = nc = anc = 0
    for mid, fic, a, b, att, quoi in MUTATIONS:
        src = open(fic, encoding='utf-8').read()
        if src.count(a) != 1:
            print('%s ANCRE invalide (%d) — %s' % (mid, src.count(a), quoi))
            anc += 1
            continue
        open(fic, 'w', encoding='utf-8').write(src.replace(a, b, 1))
        git('commit', '-qam', 'mutation ' + mid)
        git('update-ref', 'refs/remotes/origin/master', 'HEAD')
        p = subprocess.run(['python3', 'tools/gen_ordre_repas_1234_pdf.py'],     # noqa
                           capture_output=True, text=True, cwd=R, env=env)
        git('reset', '-q', '--hard', base)
        git('update-ref', 'refs/remotes/origin/master', base)
        obt = 'ok' if p.returncode == 0 else 'refus'
        lignes = [l.strip(' -') for l in (p.stdout + p.stderr).strip().split('\n') if l.strip()]
        raison = lignes[-1][:74] if lignes else ''
        if obt == att:
            ok += 1
            print('%s %-6s OK   — %-50s >> %s'
                  % (mid, obt, quoi, raison if obt == 'refus' else 'produit'))
        else:
            nc += 1
            print('%s %-6s NON CONFORME — %-42s >> %s' % (mid, obt, quoi, raison))
    print('=== conformes=%d nonconformes=%d ancres=%d ===' % (ok, nc, anc))
    return 1 if (nc or anc) else 0


if __name__ == '__main__':
    sys.exit(main())
