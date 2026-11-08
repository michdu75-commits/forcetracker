#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — IMPORT-IA-FIDELITE-01 · LE CORPUS SYNTHETIQUE (session-C, 02/11/2026) : les temoins B-IIC savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Chaque mutation REMET UN DEFAUT que le lot a supprime (ou retire une protection qu'il a ajoutee) ; le banc `tools/banc_import_corpus.js`
doit alors rougir AU MOINS UNE fois. Une mutation qui laisse le banc vert = un temoin qui ne protege rien (R17).
Ce banc-ci voit ce que `mut_import_fidelite.py` ne voit pas : les formats de repos que les coachs écrivent, les dropsets à repos recopié, le matériel écrit
dans la note, les reps non écrites, le superset, la colonne ECH/TRAV, les semaines A/B, les trois statuts de reconnaissance — sur 16 programmes
complets ENTIEREMENT INVENTES (12 méthodes + 4 programmes de formats).
Usage : python3 tools/mut_import_corpus.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_SEUL=C01 : une mutation)
A lancer sous le garde reseau : tools/sous_garde.sh python3 tools/mut_import_corpus.py
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FICHIERS = ('constants.js', 'log.js', 'index.html', 'style.css')
LO, CO, IX = 'log.js', 'constants.js', 'index.html'

MUT = [
    ('C01 le PLAFOND écrit (« 75 sec max », « Repos 40 sec maxi ») redevient du texte : ces repos ne sont plus lus',
     [(CO, r".replace(/\s*\b(?:au\s+)?max(?:i|imum)?\b\.?$/,'')", "")], 'GARDE'),
    ('C02 le blanc d\'extraction « 1 . 20 min » n\'est plus recollé',
     [(CO, r".replace(/(\d)\s*\.\s*(\d)/g,'$1.$2')", "")], 'GARDE'),
    ('C03 une PLAGE devient un repos chiffré (la borne basse est inventée comme durée) sur les plages du corpus',
     [(CO, "if(d&&g&&g.sec>0&&d.sec>g.sec&&d.sec<=3600&&d.sec<=g.sec*5) return {sec:0,min:g.sec,max:d.sec,txt};", "if(d&&g&&g.sec>0&&d.sec>g.sec&&d.sec<=3600&&d.sec<=g.sec*5) return {sec:g.sec,min:g.sec,max:d.sec,txt};")], 'GARDE'),
    ('C04 un repos uniforme recopié sur CHAQUE palier d\'un dropset interrompt la série dégressive (2 min entre deux paliers)',
     [(LO, "  const proprio=!vide(rp[si])&&!uniforme;", "  const proprio=!vide(rp[si]);")], 'GARDE'),
    ('C05 « Hip Thrust » + « Machine guidée » en note : rattaché d\'office à la barre (le matériel de la note n\'est plus lu)',
     [(LO, "  if(r.tier==='auto'&&_materielNoteContredit(ex,r.match)){ ex._vmSuggest=r.match; ex._vmConf=r.confidence; return; }\n", "")], 'GARDE'),
    ('C06 des reps que le document n\'écrit pas redeviennent un 10 inventé dans le programme enregistré (au lieu de « Non renseigné », null)',
     [(LO, "    reps.push(lu>0?lu:null);\n", "    reps.push(lu>0?lu:10);\n")], 'GARDE'),
    ('C07 une SUGGESTION (zone grise) est appliquée d\'office comme un rattachement sûr',
     [(LO, "ex.name=r.match; }\n  else if(r.tier==='confirm'){ ex._vmSuggest=r.match; ex._vmConf=r.confidence; }", "ex.name=r.match; }\n  else if(r.tier==='confirm'){ ex._vmFrom=ex.name; ex._vmConf=r.confidence; ex.name=r.match; }")], 'GARDE'),
    ('C08 le type « É » du programme à colonne ECH/TRAV n\'est plus traduit (les échauffements deviennent des séries normales)',
     [(LO, "  return v==='W' ? 'É' : (ex.setType||'N');          // 'W' est le mot du backend", "  return (ex.setType||'N');          // 'W' est le mot du backend")], 'GARDE'),
    ('C09 le regroupement échauffement + travail n\'est plus appelé (l\'ancien format du Worker : une ligne = un exercice)',
     [(LO, "    _mergeImportBlocsEch();      // ⛔ UN SEUL filet (IMPORT-IA-FIDELITE-01)", "    /*mut*/;      // ⛔ UN SEUL filet (IMPORT-IA-FIDELITE-01)")], 'GARDE'),
    ('C10 le texte d\'une plage de repos n\'est plus conservé dans le programme (restTxt perdu sur les plages du corpus)',
     [(LO, "if(r.txt)o.restTxt=r.txt; return o; };", "return o; };")], 'GARDE'),
    ('C11 le dropset importé n\'enchaîne plus : un repos entier ENTRE deux paliers à la séance',
     [(LO, "const _dsImporte=(_exD.dropChaine===true&&!_exD.dropset&&set.type==='D'", "const _dsImporte=(false&&_exD.dropChaine===true&&!_exD.dropset&&set.type==='D'")], 'GARDE'),
    ('C12 le groupe de superset est perdu à l\'enregistrement (les exercices liés deviennent indépendants)',
     [(LO, "        if(group){obj.group=group;obj.groupType='super';} // FIX Emma", "        if(false){obj.group=group;obj.groupType='super';} // FIX Emma")], 'GARDE'),
    ('C14 la séance perd le texte de la consigne de repos (restTxt) au chargement',
     [(LO, "        ...(s.restTxt?{restTxt:String(s.restTxt)}:{})   // IMPORT-IA-FIDELITE-01 : la consigne de repos écrite (une plage) suit la série\n", "")], 'GARDE'),
    ('C17 un exercice inconnu n\'est plus annoncé « sera créé » dans l\'aperçu',
     [(LO, "  if(_exerciceInconnu(ex.name,connus))return {k:'new',lib:'Sera créé · exercice perso'};\n", "")], 'GARDE'),
]

BANC = os.path.join('tools', 'banc_import_corpus.js')


def banc(arbre):
    r = subprocess.run(['node', BANC], cwd=arbre, capture_output=True, text=True, timeout=1800,
                       env=dict(os.environ, TZ='Europe/Paris'))
    out = r.stdout + r.stderr
    rouges = [l.strip()[:150] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    ok = re.search(r'(\d+) OK / (\d+) rouge', out)
    return rouges, (ok.group(0) if ok else '?')


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_iic_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'clone', 'exercises', 'anatomy', 'muscles'))
    # le banc lit les images du catalogue : on les lie (lecture seule) plutôt que de les copier
    for d in ('exercises', 'anatomy', 'muscles'):
        if os.path.isdir(os.path.join(SRC, d)) and not os.path.exists(os.path.join(a, d)):
            os.symlink(os.path.join(SRC, d), os.path.join(a, d))
    return tmp, a


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    seul = os.environ.get('MUT_SEUL')
    tmp0, a0 = cloner()
    rouges, bilan = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rouges:
        print('  !! ARBRE SAIN DEJA ROUGE — controle refuse :', rouges[:3]); return 1
    print('  arbre sain : 0 rouge (%s) — point de depart valide\n' % bilan)
    conformes = total = 0
    for nom, remplacements, attendu in MUT:
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
        rouges, bilan = banc(arbre)
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu; conformes += ok
        print('  %s  %-110s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0][:90] if rouges else ''))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
