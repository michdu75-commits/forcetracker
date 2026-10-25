#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — RECETTE CROISEE NUTRITION V2 x NUT-SECURISATION-P1 (B-NIX, integration du 23/10/2026).
Le banc croise sait-il ROUGIR ? Chaque mutation est appliquee a une COPIE de l'arbre (NUT2X_RACINE), jamais au depot
(BUGS.md §60). Point de depart : 0 rouge sur la copie saine. Une mutation qui casse la syntaxe est INVALIDE ; un plantage
(code 2, ou pas de ligne de total) n'est PAS un rouge (il ne prouve rien).
Usage : python3 tools/mut_nut_v2_p1_croise.py [PREFIXE[,PREFIXE...]]"""
import io, os, re, subprocess, sys, tarfile, tempfile, shutil
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANC = os.path.join('tools', 'banc_nut_v2_p1_croise.js')
EXCLUS = ('.git', 'audits', 'worktrees', 'node_modules', 'clone')

def git(*a): return subprocess.run(['git'] + list(a), cwd=RACINE, capture_output=True, text=True).stdout
# (nom, fichier, AVANT|ancre, apres, attendu) — attendu : 'GARDE' (au moins un rouge) ou 'OK' (aucun rouge)
MUT = [
    ("C00 le Code.js d'AVANT D-110 (P1 seul : les favoris sont REFUSES pendant une panne de Drive — le defaut de la verification 5)",
     'Code.js', ('REV', '5ead88db'), None, 'GARDE'),
    ("C01 le Code.js de la PROD (@192, sans P1 : la liste du serveur remplacee sans rien garder)",
     'Code.js', ('REV', '677cf50b'), None, 'GARDE'),   # master juste AVANT P1 ; ⛔ pas « origin/master » : il porte P1 depuis 9a72e107 (23/10)
    ("C02 l'identite V2 retombe sur le NOM (deux produits du meme nom = un seul aliment)",
     'app.js', "  const s=(x && typeof x.sourceId==='string') ? x.sourceId.trim() : '', n=String((x && x.name)||'');\n",
     "  const s='', n=String((x && x.name)||'');\n", 'GARDE'),
    ("C03 la redefinition de portion cherche le favori par son NOM (l'homonyme est touche, ou rien ne l'est)",
     'app.js', "    const memes=S.savedFoods.filter(x=>_n2Cle(x)===k);\n",
     "    const memes=S.savedFoods.filter(x=>String(x.name||'').toLowerCase()===String(e.name||'').toLowerCase());\n", 'GARDE'),
    ("C04 la restauration FUSIONNE les favoris par nom (le prototype FIX-B) : la limite dite X3 doit basculer",
     'setup.js', "  try{if(Array.isArray(d.savedFoods)&&d.savedFoods.length)S.savedFoods=d.savedFoods;}catch(e){console.warn('[FT restore] savedFoods',e);}\n",
     "  try{if(Array.isArray(d.savedFoods)&&d.savedFoods.length){const _k=f=>String(f&&f.name||'').trim().toLowerCase(),_l=Array.isArray(S.savedFoods)?S.savedFoods:[],_v=new Set(_l.map(_k));S.savedFoods=_l.concat(d.savedFoods.filter(f=>f&&!_v.has(_k(f))));}}catch(e){console.warn('[FT restore] savedFoods',e);}\n", 'GARDE'),
    ("C05 D-110 sans `n = 0` : les copies que Drive n'a pas gardees sont retirees de la zone",
     'Code.js', "        n = 0; differe = true;                         // D-110 : RIEN ne sort de la zone (rien n'a été écrit dans Drive)\n",
     "        differe = true;\n", 'GARDE'),
    ("C07 la diapo du Guide ne dit plus « a verifier » (regle d'or #11, point 5) : les quatre supports ne disent plus la meme chose",
     'app.js', "<br><br>⚠️ <b>«&nbsp;à vérifier&nbsp;»</b> : un aliment dont les valeurs se contredisent ne se recopie plus en silence — «&nbsp;+&nbsp;Ajouter&nbsp;» ouvre l\\'écran, et rien ne s\\'écrit sans «&nbsp;Ajouter&nbsp;». Deux produits du même nom (deux codes-barres) restent <b>deux aliments</b>.", "", 'GARDE'),
    ("C06 (temoin de controle) un COMMENTAIRE de l'identite V2 modifie : le banc doit rester VERT",
     'app.js', "/* ⭐⭐ INCIDENT DU 23/10 — L'IDENTITÉ D'UN ALIMENT : son identifiant de produit (code-barres, `ciqual:…`) quand il en a un,\n",
     "/* ⭐⭐ INCIDENT DU 23/10 — L'IDENTITE D'UN ALIMENT : son identifiant de produit (code-barres, ciqual) quand il en a un,\n", 'OK'),
]

def copier(dest):
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode='w') as tf:
        for nom in os.listdir(RACINE):
            if nom in EXCLUS: continue
            tf.add(os.path.join(RACINE, nom), arcname=nom)
    buf.seek(0)
    with tarfile.open(fileobj=buf, mode='r') as tf: tf.extractall(dest)

def banc(racine):
    env = dict(os.environ, NUT2X_RACINE=racine)
    p = subprocess.run(['node', os.path.join(racine, BANC)], capture_output=True, text=True, timeout=1200, env=env, cwd=racine)
    s = p.stdout + p.stderr
    total = re.search(r'^(\d+) OK / (\d+) rouge$', s, re.M)
    rouges = re.findall(r'^  !!   (B-NIX \S+ \S+)', s, re.M)
    return p.returncode, total, rouges, s

def syntaxe_ok(chemin):
    return subprocess.run(['node', '--check', chemin], capture_output=True).returncode == 0

def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    tmp = tempfile.mkdtemp(prefix='mutnv2x_')
    try:
        sain = os.path.join(tmp, 'sain'); os.makedirs(sain); copier(sain)
        code, total, rouges, s = banc(sain)
        print('  arbre sain : %s' % (total.group(0) if total else 'PAS DE TOTAL (code %d)' % code))
        if code != 0 or not total or total.group(2) != '0':
            print(s[-2500:]); return 1
        conformes = n = 0
        for nom, fichier, av, ap, attendu in MUT:
            if filtres and not any(nom.startswith(f) for f in filtres): continue
            n += 1
            arbre = os.path.join(tmp, 'm%02d' % n); shutil.copytree(sain, arbre)
            chemin = os.path.join(arbre, fichier); src = open(chemin, encoding='utf-8').read()
            if isinstance(av, tuple):
                nouv = git('show', av[1] + ':' + fichier)
                if len(nouv) < 1000 or nouv == src:
                    print('  INVALIDE  %s (version %s introuvable ou identique)' % (nom, av[1])); continue
                src = nouv
            else:
                if src.count(av) != 1:
                    print('  INVALIDE  %s (ancre trouvee %d fois)' % (nom, src.count(av))); continue
                src = src.replace(av, ap, 1)
            open(chemin, 'w', encoding='utf-8').write(src)
            if not syntaxe_ok(chemin):
                print('  INVALIDE  %s (syntaxe cassee)' % nom); continue
            code, total, rouges, s = banc(arbre)
            shutil.rmtree(arbre, ignore_errors=True)
            plante = code == 2 or not total
            ok = (attendu == 'GARDE' and rouges and not plante) or (attendu == 'OK' and not rouges and not plante)
            conformes += 1 if ok else 0
            print('  %s %s -> %s%s' % ('CONFORME ' if ok else 'NON CONFORME', nom, ('%d rouge(s)' % len(rouges)) if total else 'PAS DE TOTAL',
                                       ' (PLANTAGE : ne prouve rien)' if plante else ''))
            for r in rouges[:3]: print('        ' + r)
        print('\n  ==== %d / %d mutations conformes ====' % (conformes, n))
        return 0 if conformes == n else 1
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

if __name__ == '__main__':
    sys.exit(main())
