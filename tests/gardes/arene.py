#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 L'ARÈNE DES GARDES DE LA PASSE  (INFRA-QA-01 · lot L0, 16/11/2026)
 ⭐ POURQUOI : les gardes QA (passe_valide.sh, passe_repartie.py, recette_annexe.py, recette_selecteur.py) décident si une
    livraison part. Les audits des 15-16/11 ont montré qu'ILS laissaient passer : 11 faux verts sur 20 scénarios pour
    passe_valide.sh, 6 sur 13 pour passe_repartie.py, 8 sur 12 pour recette_annexe.py. *Un compteur vert sans preuve de
    couverture ne suffit pas.* Cette arène est LE témoin permanent : chaque faux vert démontré y est un scénario.
 COMMENT : un dépôt git JETABLE (origine nue + clone) reçoit les VRAIS fichiers du garde (copiés de cet arbre, empreinte
    affichée) ; son « runner » est un faux, fabriqué pour produire des sorties RÉALISTES (8 552 lignes ✅ de ~150 caractères,
    ligne de total et rouges au format réel). Chaque scénario porte l'issue d'un BON garde (VALIDE ou REFUS).
    PASS = le garde se comporte comme il le doit · FAIL = il ment (faux vert ou faux rouge).
 ⛔ CONTRÔLES POSITIFS OBLIGATOIRES (E01, …) : sans eux, un garde qui refuserait tout paraîtrait parfait (vécu : la première
    arène répartie refusait même le cas sain).
 ⛔ « PUBLICATION CONCURRENTE » a DEUX scénarios distincts : AVANT le lancement (E12) et PENDANT la passe (E21). L'arène initiale
    ne modélisait que le premier sous le nom du second : la variante durcie qui passait « 20/20 » avait un angle mort.
 Aucune écriture hors du dossier temporaire, aucun accès réseau, aucune donnée réelle.
 Usage : python3 tests/gardes/arene.py valide|repartie|annexe|selecteur|tout [dossier de sortie]      (code 0 = tous les scénarios PASS)
══════════════════════════════════════════════════════════════════════════════════════════════════════════════
"""
import hashlib, json, os, re, shutil, subprocess, sys, tempfile
sys.dont_write_bytecode = True      # jamais de __pycache__ dans le dépôt

RACINE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
GARDE = os.environ.get('GARDE_RACINE') or RACINE          # un MUTANT du garde vit dans une autre racine (tests/gardes/mutants.py)
sys.path.insert(0, os.path.join(GARDE, 'tools'))


def sh(*c, cwd=None, env=None, check=True):
    r = subprocess.run(list(c), cwd=cwd, capture_output=True, text=True, env=env)
    if check and r.returncode:
        raise SystemExit('échec %s : %s' % (c, r.stderr[:300]))
    return r


def empreinte_fichiers(noms):
    return ' · '.join('%s %s' % (n, hashlib.sha256(open(os.path.join(GARDE, n), 'rb').read()).hexdigest()[:10]) for n in noms)


# ───────────────────────── le faux runner réaliste ─────────────────────────
def runner_js(n_ok=8552, reds=0, red_fmt='  ❌ B-R%02d un témoin rouge réaliste\\n       → lu : 3 attendu : 4', total=True, total_ko=None, code=None,
              sortir_a=None, total_dans_libelle_a=None, ansi=False, ecrit_fichier=None, requiert=None, zero=False, commit_pendant=False,
              dup=None, omis=None, extra=False, date_var=False, double_total=False, push_pendant=False, cree_pendant=None,
              n_annonce=None, push_head_pendant=False, origine_ko_pendant=False, restaure='', dup_dates=False, dup_duree=False, dup_heure=False) :
    """`dup=(i, j)` : le témoin i est REMPLACÉ par une copie du témoin j (même total, même nombre de lignes) · `omis=i` : le témoin i
    n'est pas joué ET le total est ajusté (journal cohérent) · `extra` : un témoin de plus · `date_var` : (sans effet — le témoin n°5 porte toujours la date du jour, FT_DATE_ARENE, pour que l'identité soit éprouvée) · `push_pendant` : un AUTRE clone publie sur origin PENDANT la passe (E21) · `push_head_pendant` : HEAD est publié par quelqu'un d'autre PENDANT
    la passe (E21b) · `origine_ko_pendant` : le distant devient injoignable PENDANT la passe (E21c) · `n_annonce` : le total annonce un autre N que les lignes (E28)
    · `restaure` : fichier suivi que le runner remet à l'état commité (E09b : un arbre sale au départ, propre à l'arrivée)."""
    ko = reds if total_ko is None else total_ko
    n_aff = n_ok - (1 if omis is not None else 0) + (1 if extra else 0)
    L = ["const fs=require('fs'),cp=require('child_process');"]
    if requiert: L.append("require('%s');" % requiert)
    if zero:
        L.append("console.log('\\n════ TOTAL CROISÉ : 0 ✅ · 0 ❌ ════'); process.exit(0);")
        return '\n'.join(L)
    corps = ("const lib=(i)=>'  ✅ B-X'+String(i).padStart(4,'0')+' ⭐ témoin réaliste n°'+i+' — l\\'état final canonique est identique octet pour octet après le rechargement complet de la page et la reprise';"
             "const dv=process.env.FT_DATE_ARENE||'2026-11-15';"
             "const rel=(k)=>{const d=new Date(dv+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-k);return d.toISOString().slice(0,10);};")
    L.append(corps)
    boucle = "for(let i=1;i<=%d;i++){" % n_ok
    if omis is not None: boucle += "if(i===%d)continue;" % omis
    if dup: boucle += "if(i===%d){console.log(lib(%d));continue;}" % (dup[0], dup[1])
    boucle += "if(i===5){console.log('  ✅ B-DATE la plus vieille séance ('+dv+') s\\'ouvre en détail');continue;}"   # TOUS les runners portent ce témoin à valeur d'horloge
    # 🕒 (2ᵉ passe L0, défaut 5) deux libellés qui ne diffèrent QUE par une DATE FIXE, un libellé à date RELATIVE (aujourd'hui − 14), deux libellés qui ne diffèrent que par une DURÉE
    boucle += "if(i===6){console.log('  ✅ B-FIXE la séance du 2026-03-28 s\\'ouvre en détail');continue;}"
    boucle += "if(i===7){console.log('  ✅ B-FIXE la séance du %s s\\'ouvre en détail');continue;}" % ('2026-03-28' if dup_dates else '2026-04-15')
    boucle += "if(i===8){console.log('  ✅ B-REL la séance d\\'il y a 14 jours ('+rel(14)+') est reprise');continue;}"
    boucle += "if(i===9){console.log('  ✅ B-DUREE le décompte repart à 1:30');continue;}"
    boucle += "if(i===10){console.log('  ✅ B-DUREE le décompte repart à %s');continue;}" % ('1:30' if dup_duree else '0:30')
    # 🕒 (17/11, `QA-heure-liee-date`) l'HEURE collée à une date est significative (07:30 ≠ 08:30) ; un libellé qui déclare porter l'horloge de la passe voit la sienne changer (heure de consultation)
    boucle += "if(i===11){console.log('  ✅ B-HEURE le départ du 2026-03-28 à 07:30 est affiché');continue;}"
    boucle += "if(i===12){console.log('  ✅ B-HEURE le départ du 2026-03-28 à %s est affiché');continue;}" % ('07:30' if dup_heure else '08:30')
    boucle += "if(i===13){console.log('  ✅ B-HORL jamais l\\'heure de consultation ('+dv+' · '+(process.env.FT_HEURE_ARENE||'10:58')+')');continue;}"
    boucle += "console.log(lib(i));"
    if total_dans_libelle_a: boucle += "if(i===%d){ console.log('  ✅ ligne de total attendue : ════ TOTAL CROISÉ : 8552 ✅ · 0 ❌ ════'); }" % total_dans_libelle_a
    if sortir_a: boucle += "if(i===%d){ process.exit(0); }" % sortir_a
    if push_pendant:
        boucle += ("if(i===4000){const os=require('os'),p=require('path');const d=fs.mkdtempSync(p.join(os.tmpdir(),'concurrent-'));"
                   "cp.execSync('git clone -q '+process.env.ORIGINE_ARENE+' '+d,{stdio:'ignore'});cp.execSync('git config user.email a@example.test && git config user.name a',{cwd:d,stdio:'ignore'});"
                   "fs.writeFileSync(p.join(d,'CONCURRENT.txt'),'x\\n');cp.execSync('git add -A && git commit -q -m concurrent-pendant && git push -q origin HEAD:master',{cwd:d,stdio:'ignore'});}")
    if push_head_pendant: boucle += "if(i===4000){cp.execSync('git push -q origin HEAD:master',{stdio:'ignore'});}"
    if origine_ko_pendant: boucle += "if(i===4000){fs.renameSync(process.env.ORIGINE_ARENE,process.env.ORIGINE_ARENE+'.hors-ligne');}"
    boucle += "}"
    L.append(boucle)
    if restaure: L.append("cp.execSync('git checkout -- %s',{stdio:'ignore'});" % restaure)
    if extra: L.append("console.log('  ✅ B-NOUVEAU un témoin ajouté depuis le calibrage');")
    if commit_pendant: L.append("cp.execSync('git commit --allow-empty -q -m pendant-la-passe',{stdio:'ignore'});")
    if ecrit_fichier: L.append("fs.appendFileSync('%s','\\n// modifié pendant la passe\\n');" % ecrit_fichier)
    if cree_pendant: L.append("fs.writeFileSync('%s','créé pendant la passe\\n');" % cree_pendant)
    for k in range(reds):
        pre = '\\x1b[31m' if ansi else ''
        L.append("console.log('%s%s');" % (pre, (red_fmt % (k + 1)).replace("'", "\\'")))
    if total:
        L.append("console.log('\\n════ TOTAL CROISÉ : %d ✅ · %d ❌ ════');" % (n_aff if n_annonce is None else n_annonce, ko))
        if double_total: L.append("console.log('════ TOTAL CROISÉ : %d ✅ · %d ❌ ════');" % (n_aff, ko))
    L.append("process.exit(%s);" % (code if code is not None else ('1' if reds else '0')))
    return '\n'.join(L)


SAIN = runner_js()


def modif_non_commitee(w): open(w + '/src/app.js', 'a').write('// MODIFICATION NON COMMITÉE\n')
def fichier_non_suivi(w): open(w + '/tests/parcours/extra.js', 'w').write("console.log('  ✅ témoin d\\'un fichier JAMAIS commité');\n")


def cle_arene(libelle):
    """La clé d'identité d'un libellé, telle que le garde JUGÉ la calcule (le garde d'origine, avant la 2ᵉ passe L0, n'a que `empreinte` : l'arène doit pouvoir le juger aussi)."""
    import datetime
    try:
        from temoins import cle
        return cle(libelle, datetime.date(2026, 11, 15)), 2
    except ImportError:
        from temoins import empreinte
        return empreinte(libelle), 1


def journal_de(code_js, date_arene='2026-11-15'):
    """Le journal qu'un faux runner écrit (vers un FICHIER : process.exit() tronque un tube)."""
    d = tempfile.mkdtemp(prefix='journal-')
    open(d + '/r.js', 'w', encoding='utf-8').write(code_js)
    with open(d + '/r.log', 'w', encoding='utf-8') as fj:
        subprocess.run(['node', d + '/r.js'], stdout=fj, env=dict(os.environ, FT_DATE_ARENE=date_arene))
    j = open(d + '/r.log', encoding='utf-8').read(); shutil.rmtree(d, ignore_errors=True)
    return j


def ecrire_croiser(dossier, texte, commit, k=3, jour='2026-11-15', verdict_hors=True, modifier=None, retirer_sha=False):
    """Une passe RÉPARTIE de référence fabriquée : les témoins du journal séquentiel répartis en `k` processus (round-robin), chacun avec SA ligne de total, et le `PASSE.json`
    que passe_repartie.py écrit (commit, K, verdict, empreinte de chaque journal). `modifier(i, texte)` altère un journal APRÈS la consigne de son empreinte."""
    os.makedirs(dossier, exist_ok=True)
    lignes = [l for l in texte.split('\n') if re.match(r'^\s+✅ ', l)]
    meta = {'version': 1, 'commit': commit, 'K': k, 'jour': jour, 'verdict': 'VALIDE', 'verdict_hors_identites': verdict_hors, 'journaux': {}}
    for i in range(k):
        mien = lignes[i::k]
        s = '\n'.join(mien) + '\n\n════ TOTAL CROISÉ : %d ✅ · 0 ❌ ════\n' % len(mien)
        meta['journaux']['p%d.log' % i] = hashlib.sha256(s.encode('utf-8')).hexdigest()
        if modifier: s = modifier(i, s)
        open('%s/p%d.log' % (dossier, i), 'w', encoding='utf-8').write(s)
    json.dump(meta, open(dossier + '/PASSE.json', 'w', encoding='utf-8'), ensure_ascii=False)


def arene(nom, sortie_dir, runner, avant_garde=None, env=None, pousse_avant=False, origine_inaccessible=False, supprimer_ref=False,
          journal_prealable=None, sans_manifeste=False, args_garde=(), local_en_avance=False, calibrage=None, manifeste_forme=None, manifeste_avec=None):
    """`calibrage` : {'croiser': 'sain'|'amput'|'absent'|'autre_commit'|'modifie'|'k1'|'non_valide', 'retraits': bool} — le garde est lancé avec --calibrer ; le verdict inclut si le manifeste a ÉTÉ MODIFIÉ.
    `manifeste_forme` : 'vide' (passe {}) | 'v1' (ancien format) — un manifeste INVALIDE à la place du bon. `manifeste_avec` : runner de RÉFÉRENCE du manifeste (au lieu de SAIN)."""
    base = tempfile.mkdtemp(prefix='arene-%s-' % nom)
    o, w = base + '/origin.git', base + '/work'
    sh('git', 'init', '-q', '--bare', '-b', 'master', o)
    sh('git', 'clone', '-q', o, w)
    sh('git', 'config', 'user.email', 'arene@example.test', cwd=w); sh('git', 'config', 'user.name', 'arene', cwd=w)
    for d in ('tools', 'tests/parcours', 'tests/recette', 'src'):
        os.makedirs(w + '/' + d)
    for f in ('tools/passe_valide.sh', 'tools/temoins.py'):
        shutil.copy(os.path.join(GARDE, f), w + '/' + f)
    os.chmod(w + '/tools/passe_valide.sh', 0o755)
    open(w + '/src/app.js', 'w').write('// application fictive\n')
    open(w + '/tests/parcours/runner.js', 'w', encoding='utf-8').write(runner)
    jour_arene = (env or {}).get('FT_DATE_ARENE', '2026-11-15')
    if not sans_manifeste and manifeste_forme:       # un manifeste INVALIDE (vide, ancien format) : ⑦ ne doit pas le prendre pour une référence
        cal = {'commit': 'arene', 'n': 0, 'date': 'arene'}
        faux = {'version': 2 if manifeste_forme == 'vide' else 1, 'calibre': cal, 'passe': {}}
        json.dump(faux, open(w + '/tests/recette/temoins-attendus.json', 'w', encoding='utf-8'))
    elif not sans_manifeste:     # le manifeste est calibré sur le runner SAIN (la référence), jamais sur le runner du scénario
        from temoins import calibrer, nettoyer
        j = journal_de(manifeste_avec or SAIN, '2026-11-15')
        ecrire_croiser(base + '/croiser-ref', j, 'arene')       # la SOURCE INDÉPENDANTE du calibrage de référence (passe répartie fabriquée)
        try:
            calibrer(nettoyer(j), w + '/tests/recette/temoins-attendus.json', 'arene', croiser=base + '/croiser-ref', jour='2026-11-15')
        except TypeError:      # le garde D'ORIGINE (avant la 2ᵉ passe L0) : l'arène doit pouvoir le juger — c'est la preuve qu'elle mord
            calibrer(nettoyer(j), w + '/tests/recette/temoins-attendus.json', 'arene')
    sh('git', 'add', '-A', cwd=w); sh('git', 'commit', '-q', '-m', 'base', cwd=w); sh('git', 'push', '-q', 'origin', 'HEAD:master', cwd=w)
    if local_en_avance:    # le CANDIDAT est un commit local non poussé (le cas ordinaire : on teste avant de pousser)
        open(w + '/src/app.js', 'a').write('// candidat\n'); sh('git', 'commit', '-q', '-am', 'candidat local', cwd=w)
    if pousse_avant:       # un AUTRE clone publie sur origin/master AVANT le lancement du garde
        autre = base + '/autre'
        sh('git', 'clone', '-q', o, autre); sh('git', 'config', 'user.email', 'a@example.test', cwd=autre); sh('git', 'config', 'user.name', 'a', cwd=autre)
        open(autre + '/CONCURRENT.txt', 'w').write('publication concurrente\n'); sh('git', 'add', '-A', cwd=autre); sh('git', 'commit', '-q', '-m', 'concurrent', cwd=autre); sh('git', 'push', '-q', 'origin', 'HEAD:master', cwd=autre)
    if avant_garde: avant_garde(w)
    if origine_inaccessible: os.rename(o, o + '.hors-ligne')
    if supprimer_ref: sh('git', 'update-ref', '-d', 'refs/remotes/origin/master', cwd=w)
    journal = base + '/passe.log'
    if journal_prealable: open(journal, 'w', encoding='utf-8').write(journal_prealable)
    e = dict(os.environ); e.update(env or {}); e['ORIGINE_ARENE'] = o; e['FT_JOUR_PASSE'] = jour_arene      # le jour de la passe = le jour que le faux runner met dans ses libellés
    args_garde = list(args_garde)
    avant_manifeste = hashlib.sha256(open(w + '/tests/recette/temoins-attendus.json', 'rb').read()).hexdigest() if os.path.exists(w + '/tests/recette/temoins-attendus.json') else None
    if calibrage is not None:
        head = sh('git', 'rev-parse', 'HEAD', cwd=w).stdout.strip()
        args_garde += ['--calibrer']
        mode = calibrage.get('croiser', 'sain')
        if mode != 'absent':
            if mode == 'amput': j_ref = journal_de(runner_js(omis=1234), jour_arene)            # c'est la RÉPARTIE qui omet un témoin
            elif mode == 'sain': j_ref = journal_de(calibrage.get('reference') or runner, jour_arene)
            else: j_ref = journal_de(runner, jour_arene)
            ecrire_croiser(base + '/croiser', j_ref, 'autre-commit' if mode == 'autre_commit' else head, k=1 if mode == 'k1' else 3, jour=jour_arene,
                           verdict_hors=(mode != 'non_valide'), modifier=(lambda i, s: s + '\n(journal retouché après la passe : aucune identité ne change, seule l\'empreinte consignée le dit)\n') if mode == 'modifie' else None)
            args_garde += ['--croiser', base + '/croiser']
        if calibrage.get('retraits'): args_garde += ['--accepter-retraits']
    r = subprocess.run(['bash', 'tools/passe_valide.sh'] + args_garde + [journal], cwd=w, capture_output=True, text=True, env=e)
    sortie = r.stdout + r.stderr
    apres_manifeste = hashlib.sha256(open(w + '/tests/recette/temoins-attendus.json', 'rb').read()).hexdigest() if os.path.exists(w + '/tests/recette/temoins-attendus.json') else None
    sortie += '\nMANIFESTE_MODIFIE=%d\n' % (apres_manifeste != avant_manifeste)
    if os.path.exists(journal): shutil.copy(journal, '%s/journal.%s.log' % (sortie_dir, nom))
    open('%s/garde.%s.out' % (sortie_dir, nom), 'w', encoding='utf-8').write(sortie)
    a_tourne = os.path.exists(journal) and not journal_prealable        # le runner a-t-il réellement été lancé ?
    shutil.rmtree(base, ignore_errors=True)
    return r.returncode, sortie, a_tourne


ANCIEN = ''.join('  ✅ ancien témoin %d\n' % i for i in range(8552)) + '\n════ TOTAL CROISÉ : 8552 ✅ · 0 ❌ ════\n'
SC_VALIDE = [
    # (id, description, attendu : 'VALIDE' | 'REFUS' | 'EPREUVE', arguments d'arène)
    ('E01', 'CONTRÔLE POSITIF — runner sain (8 552 ✅, 0 ❌, code 0), arbre propre, distant frais', 'VALIDE', dict(runner=SAIN)),
    ('E02', 'CONTRÔLE NÉGATIF — 7 rouges réels, code 1, total « 8545 ✅ · 7 ❌ »', 'REFUS', dict(runner=runner_js(n_ok=8545, reds=7, total_ko=7))),
    ('E03', "passe interrompue : s'arrête à 3 000 lignes, code 0, AUCUN total", 'REFUS', dict(runner=runner_js(sortir_a=3000))),
    ('E04', 'tout vert mais code de sortie 1', 'REFUS', dict(runner=runner_js(code=1))),
    ('E05', 'runner VIDÉ : ne joue rien, imprime « TOTAL CROISÉ : 0 ✅ · 0 ❌ », code 0', 'REFUS', dict(runner=runner_js(zero=True))),
    ('E06', 'sortie prématurée à 40 % (code 0) APRÈS un libellé de témoin qui cite « TOTAL CROISÉ »', 'REFUS', dict(runner=runner_js(sortir_a=3400, total_dans_libelle_a=3000))),
    ('E07', 'rouges en COLONNE 0 (« ❌ ROUGE … », format des bancs), total sans rouge compté, code 0', 'REFUS', dict(runner=runner_js(reds=3, red_fmt='❌ ROUGE B-R%02d un banc au format colonne 0  >> détail', total_ko=0, code=0))),
    ('E08', "le total annonce « 5 ❌ » mais le journal n'a aucun rouge lisible, code 0", 'REFUS', dict(runner=runner_js(reds=0, total_ko=5, code=0))),
    ('E09', 'ARBRE SALE au départ : un fichier suivi modifié sans commit (HEAD inchangé)', 'REFUS', dict(runner=SAIN, avant_garde=modif_non_commitee, refus_avant=True)),
    ('E10', 'le runner MODIFIE un fichier suivi PENDANT la passe (HEAD inchangé)', 'REFUS', dict(runner=runner_js(ecrit_fichier='src/app.js'))),
    ('E11', 'un fichier JAMAIS commité (non suivi) est présent au départ et chargé par le runner', 'REFUS', dict(runner=runner_js(requiert='./extra.js'), avant_garde=fichier_non_suivi, refus_avant=True)),
    ('E11b', 'le runner CRÉE un fichier non suivi PENDANT la passe', 'REFUS', dict(runner=runner_js(cree_pendant='src/genere.json'))),
    ('E12', 'publication concurrente AVANT le lancement du garde, distant JOIGNABLE', 'REFUS', dict(runner=SAIN, pousse_avant=True, refus_avant=True)),
    ('E13', 'publication concurrente, distant INJOIGNABLE (fetch échoue en silence, origin/master périmé)', 'REFUS', dict(runner=SAIN, pousse_avant=True, origine_inaccessible=True, refus_avant=True)),
    ('E14', "distant injoignable ET aucune référence origin/master connue (l'inconnu doit refuser)", 'REFUS', dict(runner=SAIN, origine_inaccessible=True, supprimer_ref=True, refus_avant=True)),
    ('E15', "rouge précédé d'un code couleur ANSI (sortie colorée), code 0, total 0 ❌", 'REFUS', dict(runner=runner_js(reds=1, red_fmt='  ❌ B-R%02d rouge coloré', total_ko=0, code=0, ansi=True))),
    ('E16', "MODE D'ÉPREUVE hérité de l'environnement (FT_PASSE_REJOUER=1, FT_PASSE_CODE=0) : un ancien journal vert, un runner cassé", 'EPREUVE',
     dict(runner=runner_js(reds=7, total_ko=7), env={'FT_PASSE_REJOUER': '1', 'FT_PASSE_CODE': '0'}, journal_prealable=ANCIEN, sans_manifeste=True)),
    ('E16b', "MODE D'ÉPREUVE sur un journal SAIN : il ne dit jamais « PASSE VALIDE » et ne sort pas 0 (réussite d'épreuve ≠ preuve de livraison)", 'EPREUVE',
     dict(runner=SAIN, env={'FT_PASSE_REJOUER': '1', 'FT_PASSE_CODE': '0'}, journal_prealable=ANCIEN)),
    ('E17', 'le runner ne démarre pas (erreur de syntaxe) : code 1, journal sans total', 'REFUS', dict(runner='this is not javascript(')),
    ('E18', 'total COHÉRENT mais très inférieur à la normale : 12 témoins seulement, tout vert, code 0', 'REFUS', dict(runner=runner_js(n_ok=12))),
    ('E19', 'HEAD CHANGE pendant la passe (un commit est posé par le runner)', 'REFUS', dict(runner=runner_js(commit_pendant=True))),
    ('E20', 'rouges au format RÉEL du runner (« ❌ libellé »), mais code 0 et total « 0 ❌ »', 'REFUS', dict(runner=runner_js(reds=2, total_ko=0, code=0))),
    ('E21', 'PUBLICATION CONCURRENTE PENDANT la passe (un autre clone pousse sur origin au 4 000ᵉ témoin)', 'REFUS', dict(runner=runner_js(push_pendant=True))),
    ('E22', 'DOUBLON À LA PLACE D\'UNE OMISSION : le témoin 4 000 est remplacé par une copie du 4 001 — même total, même nombre de lignes, 0 rouge, code 0', 'REFUS', dict(runner=runner_js(dup=(4000, 4001)))),
    ('E23', 'OMISSION COHÉRENTE : un témoin n\'est pas joué ET le total est ajusté (8 551 lignes, 8 551 annoncés)', 'REFUS', dict(runner=runner_js(omis=1234))),
    ('E24', 'MANIFESTE DES IDENTITÉS ABSENT : on ne sait pas quels témoins devaient tourner — l\'inconnu bloque', 'REFUS', dict(runner=SAIN, sans_manifeste=True)),
    ('E25', 'DEUX lignes de total ancrées (journal concaténé ou rejoué deux fois)', 'REFUS', dict(runner=runner_js(double_total=True))),
    ('E26', 'CONTRÔLE : un témoin NOUVEAU depuis le calibrage (addition) n\'est PAS bloquant', 'VALIDE', dict(runner=runner_js(extra=True))),
    ('E27', 'CONTRÔLE : une valeur d\'horloge change dans un libellé (date du jour) — même identité, pas de faux rouge', 'VALIDE', dict(runner=runner_js(date_var=True), env={'FT_DATE_ARENE': '2026-11-16'})),
    ('E01b', 'CONTRÔLE POSITIF — le candidat est un commit LOCAL non poussé (le cas ordinaire) : on compare le distant à la base, pas au SHA du candidat', 'VALIDE', dict(runner=SAIN, local_en_avance=True)),
    ('E09b', 'ARBRE SALE au départ, remis propre PAR le runner (HEAD inchangé, arbre propre à l\'arrivée) : seul ⓪ le voit', 'REFUS', dict(runner=runner_js(restaure='src/app.js'), avant_garde=modif_non_commitee, refus_avant=True)),
    ('E21b', 'le CANDIDAT lui-même est publié PENDANT la passe par une autre session (HEAD contient le nouveau distant) : le distant a bougé', 'REFUS', dict(runner=runner_js(push_head_pendant=True), local_en_avance=True)),
    ('E21c', 'le distant devient INJOIGNABLE PENDANT la passe (réseau coupé au 4 000ᵉ témoin)', 'REFUS', dict(runner=runner_js(origine_ko_pendant=True))),
    ('E28', 'le total ANNONCE 8 600 ✅ mais le journal ne porte que 8 552 lignes ✅ (tous les témoins attendus sont présents)', 'REFUS', dict(runner=runner_js(n_annonce=8600))),
    ('E29', 'ROUGES RÉELS mais code 0 et total COHÉRENT (« 8552 ✅ · 2 ❌ », 2 lignes ❌) : seul ⑤ le voit', 'REFUS', dict(runner=runner_js(reds=2, total_ko=2, code=0))),
    # ── INFRA-QA-01 · L0, 2ᵉ passe (16/11/2026, contre-expertise) ──
    # défaut 3 : le calibrage ne se déduit plus du SEUL journal à certifier — il exige une 2ᵉ exécution INDÉPENDANTE (la passe RÉPARTIE du même commit) qui se recoupe
    ('E30', 'CALIBRAGE : un runner qui OMET un témoin et ajuste son total (8 551 / 8 551) alors que la passe répartie de référence en joue 8 552 : calibrage refusé, aucun manifeste écrit', 'REFUS',
     dict(runner=runner_js(omis=1234), sans_manifeste=True, calibrage=dict(croiser='sain', reference=SAIN), manifeste_modifie=False)),
    ('E30b', 'CONTRÔLE POSITIF du calibrage : séquentielle et répartie jouent les mêmes 8 552 témoins : manifeste écrit', 'VALIDE', dict(runner=SAIN, sans_manifeste=True, calibrage=dict(croiser='sain'), manifeste_modifie=True)),
    ('E30c', 'CALIBRAGE sans source indépendante (pas de --croiser) : refusé AVANT de lancer la passe', 'REFUS', dict(runner=SAIN, sans_manifeste=True, calibrage=dict(croiser='absent'), refus_avant=True, manifeste_modifie=False)),
    ('E30d', 'CALIBRAGE : la passe répartie porte un AUTRE commit (deux arbres ne se recoupent pas)', 'REFUS', dict(runner=SAIN, sans_manifeste=True, calibrage=dict(croiser='autre_commit'), manifeste_modifie=False)),
    ('E30e', 'CALIBRAGE : un journal de la passe répartie a été RETOUCHÉ après la passe sans changer aucune identité (seule l\'empreinte de PASSE.json le voit)', 'REFUS', dict(runner=SAIN, sans_manifeste=True, calibrage=dict(croiser='modifie'), manifeste_modifie=False)),
    ('E30f', "CALIBRAGE : c'est la passe RÉPARTIE qui omet un témoin (l'inverse de E30), séquentielle complète", 'REFUS', dict(runner=SAIN, sans_manifeste=True, calibrage=dict(croiser='amput'), manifeste_modifie=False)),
    ('E30g', 'CALIBRAGE : la « passe répartie » de référence n\'a qu\'UN processus (ce n\'est pas une répartition)', 'REFUS', dict(runner=SAIN, sans_manifeste=True, calibrage=dict(croiser='k1'), manifeste_modifie=False)),
    ('E30h', "CALIBRAGE : la passe répartie de référence n'a pas été VALIDE (hors identités)", 'REFUS', dict(runner=SAIN, sans_manifeste=True, calibrage=dict(croiser='non_valide'), manifeste_modifie=False)),
    ('E30i', 'CALIBRAGE : un témoin du manifeste précédent n\'est plus joué (retrait) sans --accepter-retraits : refusé, manifeste intact', 'REFUS',
     dict(runner=SAIN, manifeste_avec=runner_js(extra=True), calibrage=dict(croiser='sain'), manifeste_modifie=False)),
    ('E30j', 'CONTRÔLE : le même retrait, accepté EXPLICITEMENT (--accepter-retraits) : manifeste réécrit', 'VALIDE',
     dict(runner=SAIN, manifeste_avec=runner_js(extra=True), calibrage=dict(croiser='sain', retraits=True), manifeste_modifie=True)),
    # défaut 4 : un manifeste vide ou d'ancien format n'est PAS une référence
    ('E34', 'MANIFESTE VIDE (« passe » {}) : ⑦ ne le prend pas pour une référence — l\'inconnu bloque', 'REFUS', dict(runner=SAIN, manifeste_forme='vide')),
    ('E34b', 'MANIFESTE d\'ANCIEN FORMAT (version 1) : refusé (relancer le calibrage)', 'REFUS', dict(runner=SAIN, manifeste_forme='v1')),
    # défaut 5 : dates FIXES, dates RELATIVES, durées — et une horloge qui avance (D-172)
    ('E31', 'DEUX libellés qui ne diffèrent que par une DATE FIXE (2026-03-28 / 2026-04-15) : le 2ᵉ est remplacé par un doublon du 1ᵉʳ — même total, 0 rouge', 'REFUS', dict(runner=runner_js(dup_dates=True))),
    ('E32', 'DEUX libellés qui ne diffèrent que par une DURÉE (1:30 / 0:30) : le 2ᵉ est remplacé par un doublon du 1ᵉʳ (avant : toute heure devenait « ‹heure› »)', 'REFUS', dict(runner=runner_js(dup_duree=True))),
    ('E35', '⛔ HEURE LIÉE À UNE DATE : deux libellés qui ne diffèrent que par l\'heure (« 2026-03-28 à 07:30 » / « à 08:30 ») — le 2ᵉ est remplacé par un doublon du 1ᵉʳ, même total, 0 rouge (avant le 17/11 : l\'heure était jetée avec la date)', 'REFUS', dict(runner=runner_js(dup_heure=True))),
    ('E36', 'CONTRÔLE : un libellé qui DÉCLARE porter l\'heure de consultation (l\'horloge de la passe) voit son heure changer d\'une passe à l\'autre : même identité, pas de faux rouge', 'VALIDE', dict(runner=SAIN, env={'FT_DATE_ARENE': '2026-11-16', 'FT_HEURE_ARENE': '23:41'})),
    ('E33a', 'HORLOGE +1 mois (2026-12-16) : date RELATIVE (−14 j) décalée, date FIXE inchangée, durées inchangées : même identité', 'VALIDE', dict(runner=SAIN, env={'FT_DATE_ARENE': '2026-12-16'})),
    ('E33b', 'HORLOGE : passage d\'ANNÉE (2027-01-01)', 'VALIDE', dict(runner=SAIN, env={'FT_DATE_ARENE': '2027-01-01'})),
    ('E33c', 'HORLOGE : changement de mois (2026-12-01)', 'VALIDE', dict(runner=SAIN, env={'FT_DATE_ARENE': '2026-12-01'})),
    ('E33d', 'HORLOGE : le 29 FÉVRIER 2028 (année bissextile), très loin du calibrage', 'VALIDE', dict(runner=SAIN, env={'FT_DATE_ARENE': '2028-02-29'})),
    ('E33e', 'HORLOGE : un an plus tard (2027-11-15)', 'VALIDE', dict(runner=SAIN, env={'FT_DATE_ARENE': '2027-11-15'})),
    ('E33f', 'HORLOGE : une date FIXE dans le passé lointain ne dérive pas (2030-06-01)', 'VALIDE', dict(runner=SAIN, env={'FT_DATE_ARENE': '2030-06-01'})),
]


# ───────────────────────── passe_repartie.py ─────────────────────────
# Seules la DÉCOUPE et sa contre-vérification sont des bouchons (elles dépendent du vrai runner de 40 000 lignes : NOT RUN ici) ; TOUTE la
# logique de décision (conditions ⓪ à ⑨) est celle du vrai script. Les 3 « processus » jouent des parties fabriquées au format réel.
INFRA = ['  ✅ D031S-I garde réseau prouvé 1', '  ✅ D031S-I destination fictive refusée 1', '  ✅ D031S-II garde revérifié à la fermeture 1']
BOUCHON_DECOUPE = r"""const fs=require('fs'),path=require('path'),cp=require('child_process');
const sc=JSON.parse(fs.readFileSync(path.join(__dirname,'..','tests','parcours','scenario.json'),'utf8'));
const K=Number(process.argv[3]);
const lib=(i,k)=>'  ✅ B-P'+i+'-'+String(k).padStart(5,'0')+' ⭐ témoin réaliste de la partie '+i+' — état canonique identique après reprise';
for(let i=0;i<K;i++){const p=sc.parts[i]; let s="const fs=require('fs'),cp=require('child_process');\nconst lib="+lib.toString()+";\n";
 const inf=p.infra_off?sc.infra.slice(0,2):sc.infra; s+="for(const l of "+JSON.stringify(inf)+") console.log(l);\n";
 s+="for(let k=1;k<="+p.n+";k++){ "+(p.dup_p0?"if(k===5){console.log(lib(0,1));continue;} ":"")+"console.log(lib("+(p.lab!==undefined?p.lab:i)+",k));"
   +(p.push?"if(k===100){const os=require('os'),pa=require('path');const d=fs.mkdtempSync(pa.join(os.tmpdir(),'conc-'));cp.execSync('git clone -q '+process.env.ORIGINE_ARENE+' '+d,{stdio:'ignore'});cp.execSync('git config user.email a@example.test && git config user.name a',{cwd:d,stdio:'ignore'});fs.writeFileSync(pa.join(d,'C.txt'),'x\\n');cp.execSync('git add -A && git commit -q -m conc && git push -q origin HEAD:master',{cwd:d,stdio:'ignore'});}":"")
   +(p.ko_origin?"if(k===100){fs.renameSync(process.env.ORIGINE_ARENE,process.env.ORIGINE_ARENE+'.hors-ligne');}":"")+"}\n";
 if(p.infra_plus) s+="console.log('  ✅ D031S-I un témoin d\\'infrastructure de plus dans CE processus');\n";
 if(p.restaure) s+="cp.execSync('git checkout -- "+p.restaure+"',{stdio:'ignore'});\n";
 if(p.commit) s+="cp.execSync('git commit --allow-empty -q -m pendant-la-passe',{stdio:'ignore'});\n";
 if(p.git_ko) s+="fs.writeFileSync(process.env.GIT_KO_FILE,'');\n";
 if(p.ecrit) s+="fs.appendFileSync('"+p.ecrit+"','\\n// modifié pendant la passe\\n');\n";
 for(const r of (p.rouges||[])) s+="console.log("+JSON.stringify(r)+");\n";
 if(p.plante) s+="console.log('⛔ MODULE seance_ux a PLANTÉ');\n";
 if(p.total!==false) s+="console.log('\\n════ TOTAL CROISÉ : "+(p.n_annonce!==undefined?p.n_annonce:(p.n+inf.length+(p.infra_plus?1:0)))+" ✅ · "+(p.ko===undefined?(p.rouges||[]).length:p.ko)+" ❌ ════');\n";
 s+="process.exit("+(p.code===undefined?((p.rouges||[]).length?1:0):p.code)+");\n";
 fs.writeFileSync(path.join(__dirname,'..','tests','parcours','runner.part-'+K+'-'+i+'.js'),s);}
"""


def manifeste_repartie(chemin, n_parts):
    """Le manifeste SÉQUENTIEL de référence : l'infrastructure du garde comptée UNE fois, puis les témoins de chaque partie."""
    import collections
    ids = collections.Counter(cle_arene(l.strip()[2:].strip())[0] for l in INFRA)
    for i, n in enumerate(n_parts):
        for k in range(1, n + 1):
            ids[cle_arene('B-P%d-%05d ⭐ témoin réaliste de la partie %d — état canonique identique après reprise' % (i, k, i))[0]] += 1
    import json as _j
    _j.dump({'version': cle_arene('x')[1], 'calibre': {'date': 'arene', 'commit': 'arene', 'n': sum(ids.values())}, 'passe': dict(ids)}, open(chemin, 'w', encoding='utf-8'))


def arene_repartie(nom, sortie_dir, parts, avant_garde=None, pousse_avant=False, origine_inaccessible=False, sans_manifeste=False, local_en_avance=False, shim_git=False, lire_passe=False, rev_ko=False):
    base = tempfile.mkdtemp(prefix='arene-rep-%s-' % nom)
    o, w = base + '/origin.git', base + '/work'
    sh('git', 'init', '-q', '--bare', '-b', 'master', o); sh('git', 'clone', '-q', o, w)
    sh('git', 'config', 'user.email', 'arene@example.test', cwd=w); sh('git', 'config', 'user.name', 'arene', cwd=w)
    for d in ('tools', 'tests/parcours', 'tests/recette', 'src'):
        os.makedirs(w + '/' + d)
    for f in ('tools/passe_repartie.py', 'tools/temoins.py'):
        shutil.copy(os.path.join(GARDE, f), w + '/' + f)
    open(w + '/tools/decouper_passe.js', 'w').write(BOUCHON_DECOUPE); open(w + '/tools/verifier_decoupe.js', 'w').write('process.exit(0);\n')
    open(w + '/tests/parcours/runner.js', 'w').write('// runner fictif\n'); open(w + '/src/app.js', 'w').write('// app\n')
    open(w + '/tests/parcours/scenario.json', 'w', encoding='utf-8').write(json.dumps({'infra': INFRA, 'parts': parts}, ensure_ascii=False))
    if not sans_manifeste: manifeste_repartie(w + '/tests/recette/temoins-attendus.json', [2850, 2850, 2850])   # la RÉFÉRENCE : 3 × 2 850
    sh('git', 'add', '-A', cwd=w); sh('git', 'commit', '-q', '-m', 'base', cwd=w); sh('git', 'push', '-q', 'origin', 'HEAD:master', cwd=w)
    if pousse_avant:
        a = base + '/autre'; sh('git', 'clone', '-q', o, a); sh('git', 'config', 'user.email', 'a@example.test', cwd=a); sh('git', 'config', 'user.name', 'a', cwd=a)
        open(a + '/C.txt', 'w').write('x\n'); sh('git', 'add', '-A', cwd=a); sh('git', 'commit', '-q', '-m', 'concurrent', cwd=a); sh('git', 'push', '-q', 'origin', 'HEAD:master', cwd=a)
    if avant_garde: avant_garde(w)
    if origine_inaccessible: os.rename(o, o + '.hors-ligne')
    e = dict(os.environ); e['ORIGINE_ARENE'] = o
    if shim_git:       # un `git` qui échoue (code 128, sortie VIDE) pour `git status` SEULEMENT, une fois que le processus a posé le fichier-drapeau : l'état final est alors ILLISIBLE
        os.makedirs(base + '/shim')
        open(base + '/shim/git', 'w').write('#!/bin/sh\nif [ "$1" = "status" ] && [ -e "$GIT_KO_FILE" ]; then exit 128; fi\nif [ "$1" = "rev-parse" ] && [ -e "$GIT_KO_REV" ]; then exit 128; fi\nexec %s "$@"\n' % shutil.which('git'))
        os.chmod(base + '/shim/git', 0o755)
        e['PATH'] = base + '/shim:' + e['PATH']; e['GIT_KO_FILE'] = base + '/git-ko'; e['GIT_KO_REV'] = base + '/rev-ko'
        if rev_ko: open(base + '/rev-ko', 'w').write('')
    r = subprocess.run([sys.executable, 'tools/passe_repartie.py', '3', base + '/journaux'], cwd=w, capture_output=True, text=True, env=e)
    sortie = r.stdout + r.stderr
    if lire_passe and os.path.exists(base + '/journaux/PASSE.json'): sortie += '\nPASSE.json=' + open(base + '/journaux/PASSE.json', encoding='utf-8').read().replace('\n', ' ')
    open('%s/repartie.%s.out' % (sortie_dir, nom), 'w', encoding='utf-8').write(sortie)
    a_tourne = os.path.exists(base + '/journaux/p0.log')
    shutil.rmtree(base, ignore_errors=True)
    return r.returncode, sortie, a_tourne


def P(n=(2850, 2850, 2850), **par_partie):
    ps = [dict(n=x) for x in n]
    for i, kw in par_partie.items(): ps[int(i[1:])].update(kw)
    return ps


SC_REP = [
    ('R01', 'CONTRÔLE POSITIF — 3 processus sains, manifeste 3 × 2 850', 'VALIDE', dict(parts=P())),
    ('R02', 'un processus sans ligne de total (interrompu), code 0', 'REFUS', dict(parts=P(p1=dict(total=False)))),
    ('R03', 'un processus sort en code 1, sans rouge', 'REFUS', dict(parts=P(p2=dict(code=1)))),
    ('R04', 'un rouge réel (format runner) dans un processus', 'REFUS', dict(parts=P(p0=dict(rouges=['  ❌ B-R01 un témoin rouge\n       → lu 3 attendu 4'])))),
    ('R05', 'un module planté (« a PLANTÉ ») avec total et code 0', 'REFUS', dict(parts=P(p1=dict(plante=True)))),
    ('R06', 'témoins du garde différents entre processus (D031S-II absent de p1)', 'REFUS', dict(parts=P(p1=dict(infra_off=True)))),
    ('R06b', 'p1 joue un témoin d\'infrastructure de PLUS (asymétrie) : même manifeste, mais les processus ne portent pas les mêmes témoins du garde', 'REFUS', dict(parts=P(p1=dict(infra_plus=True)))),
    ('R07', 'publication concurrente, distant INJOIGNABLE (fetch muet, origin/master périmé)', 'REFUS', dict(parts=P(), pousse_avant=True, origine_inaccessible=True, refus_avant=True)),
    ('R08', 'publication concurrente AVANT la passe, distant joignable', 'REFUS', dict(parts=P(), pousse_avant=True, refus_avant=True)),
    ('R09', 'ARBRE SALE au départ (fichier suivi modifié sans commit)', 'REFUS', dict(parts=P(), avant_garde=modif_non_commitee, refus_avant=True)),
    ('R09b', 'ARBRE SALE au départ, remis propre par un processus : seul ⓪ le voit', 'REFUS', dict(parts=P(p0=dict(restaure='src/app.js')), avant_garde=modif_non_commitee, refus_avant=True)),
    ('R10', 'un processus ne joue presque rien : 100 témoins au lieu de 2 850, tout vert', 'REFUS', dict(parts=P(n=(2850, 100, 2850)))),
    ('R11', 'deux processus jouent EXACTEMENT les mêmes témoins (pas de partition)', 'REFUS', dict(parts=P(n=(5700, 5700, 10)))),
    ('R12', 'total annonçant 5 ❌ sans rouge lisible, code 0', 'REFUS', dict(parts=P(p0=dict(ko=5, code=0)))),
    ('R13', 'rouge au format colonne 0 (« ❌ ROUGE … »), total sans ❌, code 0', 'REFUS', dict(parts=P(p1=dict(rouges=['❌ ROUGE B-R02 banc colonne 0  >> détail'], ko=0, code=0)))),
    ('R14', 'PUBLICATION CONCURRENTE PENDANT la passe (un autre clone pousse)', 'REFUS', dict(parts=P(p0=dict(push=True)))),
    ('R15', 'le distant devient INJOIGNABLE PENDANT la passe', 'REFUS', dict(parts=P(p0=dict(ko_origin=True)))),
    ('R16', 'DOUBLON À LA PLACE D\'UNE OMISSION : p1 rejoue un témoin de p0 au lieu du sien — même total, même nombre de lignes', 'REFUS', dict(parts=P(p1=dict(dup_p0=True)))),
    ('R17', 'MANIFESTE ABSENT : l\'inconnu bloque', 'REFUS', dict(parts=P(), sans_manifeste=True)),
    ('R18', 'le total d\'un processus ANNONCE plus de ✅ que le journal n\'en porte', 'REFUS', dict(parts=P(p2=dict(n_annonce=3000)))),
    ('R20', 'HEAD CHANGE pendant la passe (une partie pose un commit)', 'REFUS', dict(parts=P(p1=dict(commit=True)))),
    ('R21', 'une partie MODIFIE un fichier suivi PENDANT la passe (HEAD inchangé)', 'REFUS', dict(parts=P(p2=dict(ecrit='src/app.js')))),
    ('R19', 'CONTRÔLE : un témoin NOUVEAU (une partie plus longue que la référence) n\'est pas bloquant', 'VALIDE', dict(parts=P(n=(2850, 2851, 2850)))),
    # ── INFRA-QA-01 · L0, 2ᵉ passe (contre-expertise, défaut 5) ──
    ('R22', '⛔ le `git status` FINAL échoue (code 128, sortie VIDE) : l\'état de l\'arbre est inconnu — avant, une sortie vide valait « arbre propre » et la passe était déclarée VALIDE', 'REFUS', dict(parts=P(p0=dict(git_ko=True)), shim_git=True)),
    ('R22b', 'CONTRÔLE : le même shim `git`, sans drapeau posé (git status réussit) : la passe est valide', 'VALIDE', dict(parts=P(), shim_git=True)),
    ('R27', '`git rev-parse HEAD` échoue AU DÉPART (code 128) : l\'arbre testé est inconnu — refus AVANT de lancer la passe', 'REFUS', dict(parts=P(), shim_git=True, rev_ko=True, refus_avant=True)),
    ('R23', 'PARTITIONS PERMUTÉES : p1 joue le lot de p2 et p2 celui de p1 — la RÉUNION est identique : valide (l\'ordre des processus n\'est pas une identité)', 'VALIDE', dict(parts=P(p1=dict(lab=2), p2=dict(lab=1)))),
    ('R24', 'PARTITION RÉPÉTÉE : p2 rejoue le lot de p1 (et le sien manque) — même total, mêmes lignes', 'REFUS', dict(parts=P(p2=dict(lab=1)))),
    ('R25', 'la passe laisse sa PROVENANCE (PASSE.json : commit, K, verdict, empreintes) — la source indépendante des calibrages — et dit VALIDE hors identités', 'VALIDE', dict(parts=P(), lire_passe=True)),
    ('R26', 'une passe en REFUS (un processus en code 1) n\'est PAS une source de calibrage : PASSE.json dit « verdict_hors_identites: false »', 'REFUS', dict(parts=P(p1=dict(code=1)), lire_passe=True)),
]


def jouer_repartie(out, arret=False):
    res = []
    for ident, desc, attendu, args in SC_REP:
        refus_avant = args.pop('refus_avant', False)
        code, sortie, a_tourne = arene_repartie(ident, out, **args)
        verdict = 'VALIDE' if 'PASSE RÉPARTIE VALIDE' in sortie and 'NON VALIDE' not in sortie else 'REFUS'
        ok = verdict == attendu and (code == 0) == (attendu == 'VALIDE') and not (refus_avant and a_tourne)
        if ident == 'R25': ok = ok and '"verdict_hors_identites": true' in sortie and '"commit":' in sortie and '"K": 3' in sortie and len(re.findall(r'"p\d\.log": "[0-9a-f]{64}"', sortie)) == 3      # SHA-256 : 64 hexa par journal
        if ident == 'R26': ok = ok and '"verdict_hors_identites": false' in sortie
        res.append({'id': ident, 'description': desc, 'attendu': attendu, 'observe': verdict, 'code_garde': code, 'statut': 'PASS' if ok else 'FAIL'})
        print('%-5s %-5s attendu %-6s observé %-6s (code %s) %s' % (ident, res[-1]['statut'], attendu, verdict, code, desc[:84]))
        if arret and not ok: break
        args['refus_avant'] = refus_avant
    return res


# ───────────────────────── le DÉCOUPEUR RÉEL (INFRA-QA-01 · L0, 2ᵉ passe) ─────────────────────────
# L'arène répartie ci-dessus remplace le découpeur par un BOUCHON (le vrai travaille sur un runner de 40 000 lignes). Ici le VRAI `tools/decouper_passe.js` et le VRAI
# `tools/verifier_decoupe.js` tournent sur un MINI-RUNNER qui a la structure exigée (fonction principale asynchrone, garde réseau, modules awaités, ligne de total) ;
# les copies découpées sont ensuite JOUÉES, et leurs identités (réunion, infrastructure comptée une fois) doivent être EXACTEMENT celles de la passe séquentielle.
# Aucun navigateur : le mini-runner n'en lance pas. Dépend d'acorn (/opt/node-tools) : sans lui, les scénarios sont « SKIP » (dits, jamais comptés verts).
ACORN = '/opt/node-tools/node_modules/acorn'
MINI_RUNNER = r"""(async () => {
  let ok = 0, ko = 0;
  const t = (n, c) => { if (c) { ok++; console.log('  ✅ ' + n); } else { ko++; console.log('  ❌ ' + n); } };
  const chromium = {}; const PORT = 1, ROOT = __dirname, fs = require('fs'), path = require('path');
  const D031S = require('./garde_reseau.js');
  const b = { close: async () => {} }; const _fermeNav = b.close;
  const srv = { close() {} }; const p = { addInitScript: async () => {}, goto: async () => {} };
  b.close=async(...a)=>{ await D031S.fin(t); return _fermeNav(...a); };
  { await D031S.debut(t, b, PORT, chromium); }
  await p.goto('x');
  console.log('\n-- I. blocs du runner --');
  t('bloc runner 1', true);
  await require('./m1.js').f(t, b, PORT);
  await require('./m2.js').f(t, b, PORT);
  t('bloc runner 2', true);
  await b.close();
  srv.close();
  console.log('\n════ TOTAL CROISÉ : ' + ok + ' ✅ · ' + ko + ' ❌ ════');
  process.exit(ko ? 1 : 0);
})();
"""
MINI_GARDE = "exports.debut = async (t) => { t('D031S-I garde réseau prouvé', true); };\nexports.fin = async (t) => { t('D031S-II garde revérifié à la fermeture', true); };\n"
MINI_M1 = "exports.f = async (t) => { console.log('\\n-- M1. module un --'); t('m1 témoin A', true); t('m1 témoin B', true); };\nexports.g = async (t) => { t('m1 témoin C (2ᵉ appel du même module)', true); };\n"
MINI_M2 = "exports.f = async (t) => { console.log('\\n-- M2. module deux --'); t('m2 témoin A', true); t('m2 témoin B', true); t('m2 témoin B', true); };\n"


def arene_decoupe(nom, sortie_dir, variante=None, runner_modif=None, copies_modif=None, k=3, rep=None):
    """Joue le VRAI découpeur puis le VRAI vérificateur. Rend (statut, détail) : CONFORME · DÉCOUPE_REFUSÉE (code 3) · NON_CONFORME (le vérificateur refuse) · ÉQUIVALENCE_ROUGE (les copies ne rejouent pas la même chose)."""
    base = tempfile.mkdtemp(prefix='arene-dec-%s-' % nom)
    os.makedirs(base + '/tools'); os.makedirs(base + '/tests/parcours')
    for f in ('tools/decouper_passe.js', 'tools/verifier_decoupe.js'):
        shutil.copy(os.path.join(GARDE, f), base + '/' + f)
    # les copies lisent acorn par un chemin ABSOLU (/opt/node-tools) : rien à installer
    runner = MINI_RUNNER if not runner_modif else runner_modif(MINI_RUNNER)
    open(base + '/tests/parcours/runner.js', 'w', encoding='utf-8').write(runner)
    open(base + '/tests/parcours/garde_reseau.js', 'w', encoding='utf-8').write(MINI_GARDE)
    open(base + '/tests/parcours/m1.js', 'w', encoding='utf-8').write(MINI_M1); open(base + '/tests/parcours/m2.js', 'w', encoding='utf-8').write(MINI_M2)
    json.dump(rep if rep is not None else {'./m1.js': 1, './m2.js': 2}, open(base + '/tests/parcours/repartition-%d.json' % k, 'w'))
    sh('node', 'tools/decouper_passe.js', 'tests/parcours/runner.js', str(k), 'tests/parcours/repartition-%d.json' % k, cwd=base, check=False)
    d = subprocess.run(['node', 'tools/decouper_passe.js', 'tests/parcours/runner.js', str(k), 'tests/parcours/repartition-%d.json' % k], cwd=base, capture_output=True, text=True)
    if d.returncode != 0:
        res = ('DÉCOUPE_REFUSÉE', (d.stderr or d.stdout).strip()[:200]); shutil.rmtree(base, ignore_errors=True); return res
    if copies_modif: copies_modif(base + '/tests/parcours', k)
    v = subprocess.run(['node', 'tools/verifier_decoupe.js', 'tests/parcours/runner.js', str(k)], cwd=base, capture_output=True, text=True)
    if v.returncode != 0:
        errs = re.findall(r'"([^"]*(?:OUBLIÉE|DOUBLÉE|éclaté|joué \d+ fois|ni identique|diffère|instructions au lieu)[^"]*)"', v.stdout)
        res = ('NON_CONFORME', ' | '.join(errs)[:260] or v.stdout[-200:]); shutil.rmtree(base, ignore_errors=True); return res
    # équivalence : la passe séquentielle et la RÉUNION des copies jouent les mêmes témoins (infrastructure comptée une fois)
    from temoins import analyser, fusion_repartie, comparer, nettoyer
    def jouer(fichier):
        with open(base + '/tests/parcours/_s.log', 'w', encoding='utf-8') as fj:
            subprocess.run(['node', fichier], cwd=base + '/tests/parcours', stdout=fj, stderr=subprocess.STDOUT)
        return analyser(nettoyer(open(base + '/tests/parcours/_s.log', encoding='utf-8').read()))
    seq = jouer('runner.js')
    parts = [jouer('runner.part-%d-%d.js' % (k, i)) for i in range(k)]
    fusion, anomalies = fusion_repartie(parts)
    m1, p1 = comparer(seq['ids'], fusion); m2, p2 = comparer(fusion, seq['ids'])
    res = ('CONFORME', 'équivalent séquentiel : %d témoins' % sum(seq['ids'].values())) if not (m1 or m2 or p1 or p2 or anomalies) else ('ÉQUIVALENCE_ROUGE', 'manquants %d/%d, en trop %d/%d, anomalies %s' % (len(m1), len(m2), p1, p2, anomalies))
    shutil.rmtree(base, ignore_errors=True)
    return res


def _dans_copie(dossier, k, i, ancien, nouveau, tout=False):
    f = '%s/runner.part-%d-%d.js' % (dossier, k, i)
    s = open(f, encoding='utf-8').read()
    assert ancien in s, (i, ancien)
    open(f, 'w', encoding='utf-8').write(s.replace(ancien, nouveau))


def _perm_copies(dossier, k):
    a, b = '%s/runner.part-%d-1.js' % (dossier, k), '%s/runner.part-%d-2.js' % (dossier, k)
    os.rename(a, a + '.x'); os.rename(b, a); os.rename(a + '.x', b)


def _remplace_texte(ancien, nouveau):
    return lambda s: s.replace(ancien, nouveau, 1)


SC_DEC = [
    # (id, description, attendu, arguments)
    ('D01', 'CONTRÔLE POSITIF — le vrai découpeur et le vrai vérificateur sur le mini-runner : copies conformes ET réunion = passe séquentielle', 'CONFORME', dict()),
    ('D02', 'un module reçoit autre chose que l\'infrastructure (« extra ») : le découpeur REFUSE de découper (fermé par défaut)', 'DÉCOUPE_REFUSÉE',
        dict(runner_modif=_remplace_texte("await require('./m2.js').f(t, b, PORT);", "const extra = 1; await require('./m2.js').f(t, b, PORT, extra);"))),
    ('D03', 'une copie RÉÉCRITE : une instruction d\'INFRASTRUCTURE (jouée dans toutes les copies) change d\'UNE espace dans UNE copie (même nombre d\'instructions) — ni identique ni vide : seul ② la voit', 'NON_CONFORME',
        dict(copies_modif=lambda d, k: _dans_copie(d, k, 1, "const D031S = require('./garde_reseau.js');", "const D031S = require('./garde_reseau.js') ;"))),
    ('D03b', 'une instruction du runner RÉÉCRITE dans la copie qui la garde (« false » à la place de « true »)', 'NON_CONFORME',
        dict(copies_modif=lambda d, k: _dans_copie(d, k, 0, "t('bloc runner 1', true);", "t('bloc runner 1', false);"))),
    ('D11', 'du texte AJOUTÉ hors de la fonction principale d\'une copie : le vérificateur refuse (la copie doit être identique au runner partout ailleurs)', 'NON_CONFORME',
        dict(copies_modif=lambda d, k: open('%s/runner.part-%d-1.js' % (d, k), 'a', encoding='utf-8').write('\n// texte ajouté\n'))),
    ('D04', 'une instruction OUBLIÉE : retirée de TOUTES les copies (rien d\'oublié)', 'NON_CONFORME',
        dict(copies_modif=lambda d, k: [_dans_copie(d, k, i, "t('bloc runner 2', true);", ";") for i in range(k) if "t('bloc runner 2', true);" in open('%s/runner.part-%d-%d.js' % (d, k, i), encoding='utf-8').read()])),
    ('D05', 'une instruction DOUBLÉE hors infrastructure : jouée dans deux copies (rien de doublé)', 'NON_CONFORME', dict(copies_modif=lambda d, k: _doubler(d, k))),
    ('D06', 'un module ÉCLATÉ : ses deux appels dans deux processus différents (état du module)', 'NON_CONFORME',
        dict(runner_modif=_remplace_texte("await require('./m2.js').f(t, b, PORT);", "await require('./m1.js').g(t, b, PORT);\n  await require('./m2.js').f(t, b, PORT);"),
             copies_modif=lambda d, k: _eclater(d, k))),
    ('D07', 'PARTITIONS PERMUTÉES (les copies 1 et 2 échangées) : la réunion est la même — conforme (contrôle : l\'ordre des processus n\'est pas une identité)', 'CONFORME', dict(copies_modif=_perm_copies)),
    ('D08', 'répartition qui cite un module ABSENT du runner : le découpeur refuse', 'DÉCOUPE_REFUSÉE', dict(rep={'./m1.js': 1, './fantome.js': 2})),
    ('D09', 'répartition hors bornes (processus 7 pour K = 3) : le découpeur refuse', 'DÉCOUPE_REFUSÉE', dict(rep={'./m1.js': 7, './m2.js': 2})),
    ('D10', 'le runner perd sa ligne de TOTAL : repère introuvable, le découpeur refuse', 'DÉCOUPE_REFUSÉE', dict(runner_modif=_remplace_texte("console.log('\\n════ TOTAL CROISÉ : ' + ok + ' ✅ · ' + ko + ' ❌ ════');", "console.log('fin');"))),
]


def _doubler(d, k):
    """Remet l'instruction « bloc runner 1 » dans la copie 1 au même rang que dans la copie 0 (les instructions tiennent sur une ligne) : jouée deux fois, hors infrastructure."""
    f0, f1 = '%s/runner.part-%d-0.js' % (d, k), '%s/runner.part-%d-1.js' % (d, k)
    L0, L1 = open(f0, encoding='utf-8').read().split('\n'), open(f1, encoding='utf-8').read().split('\n')
    n = next(i for i, l in enumerate(L0) if "t('bloc runner 1', true);" in l)
    L1[n] = L0[n]
    open(f1, 'w', encoding='utf-8').write('\n'.join(L1))


def _eclater(d, k):
    """Le 2ᵉ appel de m1 (« .g ») passe de la copie 1 (où le découpeur a mis TOUS les appels du module) à la copie 2 : le même module joué dans deux processus."""
    f1, f2 = '%s/runner.part-%d-1.js' % (d, k), '%s/runner.part-%d-2.js' % (d, k)
    L1, L2 = open(f1, encoding='utf-8').read().split('\n'), open(f2, encoding='utf-8').read().split('\n')
    n = next(i for i, l in enumerate(L1) if "m1.js').g(t, b, PORT)" in l)
    L2[n] = L1[n]; L1[n] = '  ;'
    open(f1, 'w', encoding='utf-8').write('\n'.join(L1)); open(f2, 'w', encoding='utf-8').write('\n'.join(L2))


def jouer_decoupe(out, arret=False):
    res = []
    if not os.path.exists(ACORN + '/package.json'):
        print('DÉC   SKIP  acorn absent (%s) : les %d scénarios du découpeur réel ne sont PAS joués — ce n\'est pas un vert' % (ACORN, len(SC_DEC)))
        return [{'id': i, 'description': d, 'attendu': a, 'observe': 'SKIP (acorn absent)', 'statut': 'SKIP'} for i, d, a, _ in SC_DEC]
    for ident, desc, attendu, args in SC_DEC:
        statut, det = arene_decoupe(ident, out, **args)
        ok = statut == attendu
        res.append({'id': ident, 'description': desc, 'attendu': attendu, 'observe': statut, 'detail': det, 'statut': 'PASS' if ok else 'FAIL'})
        print('%-5s %-5s attendu %-17s observé %-17s %s' % (ident, res[-1]['statut'], attendu, statut, desc[:80]))
        if arret and not ok: break
    return res


# ───────────────────────── tools/temoins.py : les préconditions du calibrage, en appel DIRECT ─────────────────────────
def arene_temoins(nom, sortie_dir, etape):
    """Rend (statut, détail) : 'REFUS' (le module lève ou sort ≠ 0, AUCUN fichier écrit/modifié) ou 'ECRIT'."""
    base = tempfile.mkdtemp(prefix='arene-tem-%s-' % nom)
    os.makedirs(base + '/tools'); os.makedirs(base + '/tests/recette')
    shutil.copy(os.path.join(GARDE, 'tools/temoins.py'), base + '/tools/temoins.py')
    m = base + '/tests/recette/temoins-attendus.json'
    j = journal_de(SAIN); open(base + '/j.log', 'w', encoding='utf-8').write(j)
    ecrire_croiser(base + '/croiser', j, 'arene')
    cli = lambda *a: subprocess.run([sys.executable, '-B', base + '/tools/temoins.py'] + list(a), capture_output=True, text=True, cwd=base)
    avant = None
    if etape == 'sans_croiser': r = cli('calibrer', base + '/j.log', '--commit', 'arene', '--manifeste', m)
    elif etape == 'sans_commit': r = cli('calibrer', base + '/j.log', '--croiser', base + '/croiser', '--manifeste', m)
    elif etape == 'positif': r = cli('calibrer', base + '/j.log', '--commit', 'arene', '--croiser', base + '/croiser', '--manifeste', m)
    elif etape == 'journal_rouge':
        r = cli('calibrer', _ecrit_rouge(base, j), '--commit', 'arene', '--croiser', base + '/croiser', '--manifeste', m)
    elif etape in ('ecriture_invalide', 'annexe_vide', 'annexe_sans_principal', 'ancien_intact', 'annexe_retrait', 'annexe_retrait_accepte', 'prov_incoherente'):
        sys.path.insert(0, base + '/tools')
        import importlib; T = importlib.import_module('temoins'); importlib.reload(T)
        ok_pre = json.dumps({'version': 2, 'calibre': {'commit': 'x', 'n': 2}, 'passe': {'a' * 12: 2}})
        if etape != 'annexe_sans_principal': open(m, 'w', encoding='utf-8').write(ok_pre)
        if etape in ('annexe_retrait', 'annexe_retrait_accepte', 'prov_incoherente'):
            import collections as _c
            deux = {'a' * 12: 1, 'b' * 12: 1}
            ok_man = json.loads(ok_pre); ok_man['annexes'] = {'s': deux}
            if etape == 'prov_incoherente': ok_man['annexes_prov'] = {'s': {'commit': 'x', 'n': 5}}
            open(m, 'w', encoding='utf-8').write(json.dumps(ok_man))
        avant = open(m, 'rb').read() if os.path.exists(m) else None
        try:
            if etape == 'ecriture_invalide': T._ecrire_atomique(m, {'version': 2, 'calibre': {'commit': 'x', 'n': 5}, 'passe': {'b' * 12: 1}})      # N ≠ somme
            elif etape == 'annexe_vide': T.calibrer_annexe('s', {}, m)
            elif etape == 'annexe_sans_principal': T.calibrer_annexe('s', {'c' * 12: 1}, m)
            elif etape == 'annexe_retrait': T.calibrer_annexe('s', {'a' * 12: 1}, m)
            elif etape == 'annexe_retrait_accepte': T.calibrer_annexe('s', {'a' * 12: 1}, m, commit='c', accepter_retraits=True)
            elif etape == 'prov_incoherente':
                if T.valider_manifeste(json.load(open(m, encoding='utf-8'))): raise SystemExit('provenance incohérente refusée')
            elif etape == 'ancien_intact': T._ecrire_atomique(m, {'version': 2, 'calibre': {'commit': 'y', 'n': 3}, 'passe': {'d' * 12: 3}})
            r = subprocess.CompletedProcess([], 0, '', '')
        except SystemExit as e:
            r = subprocess.CompletedProcess([], 1, '', str(e))
        sys.path.remove(base + '/tools')
    reste_tmp = [f for f in os.listdir(os.path.dirname(m)) if f.endswith('.tmp')]
    apres = open(m, 'rb').read() if os.path.exists(m) else None
    res = ('ECRIT' if (r.returncode == 0 and apres != avant) else 'REFUS', (r.stdout + r.stderr)[:400].replace('\n', ' '), avant, apres, reste_tmp)
    shutil.rmtree(base, ignore_errors=True)
    return res


def _ecrit_rouge(base, j):
    f = base + '/rouge.log'
    open(f, 'w', encoding='utf-8').write(j.replace('\n════ TOTAL', '  ❌ B-R01 un rouge\n\n════ TOTAL', 1).replace('0 ❌', '1 ❌'))
    return f


SC_TEM = [
    ('TC1', 'calibrer sans --croiser (appel direct) : REFUS, aucun manifeste écrit', 'REFUS', 'sans_croiser', 'SOURCE INDÉPENDANTE'),
    ('TC2', 'calibrer sans --commit (aucune provenance) : REFUS', 'REFUS', 'sans_commit', 'aucun commit'),
    ('TC3', 'CONTRÔLE POSITIF : calibrer avec la source indépendante et le commit : manifeste ÉCRIT, aucun fichier temporaire oublié', 'ECRIT', 'positif', 'manifeste écrit'),
    ('TC4', 'calibrer sur un journal qui porte un ROUGE : REFUS', 'REFUS', 'journal_rouge', 'ENTIÈREMENT verte'),
    ('TC5', 'écriture d\'un manifeste INCOHÉRENT (N annoncé ≠ somme des comptes) : refusée AVANT d\'écrire, l\'ancien manifeste reste intact', 'REFUS', 'ecriture_invalide', 'N annoncé'),
    ('TC6', 'calibration annexe avec AUCUNE identité : refusée', 'REFUS', 'annexe_vide', 'aucune identité valide'),
    ('TC7', 'calibration annexe SANS manifeste principal : refusée, rien de créé', 'REFUS', 'annexe_sans_principal', 'ne le crée pas'),
    ('TC9', '⛔ calibrer_annexe : un référentiel de suite qui RETIRE une identité est refusé (appel direct), diff lisible, manifeste intact', 'REFUS', 'annexe_retrait', 'RETIRE'),
    ('TC10', '… accepté avec accepter_retraits : écrit, et la provenance de la suite dit combien de retraits ont été acceptés', 'ECRIT', 'annexe_retrait_accepte', ''),
    ('TC11', 'une provenance d\'annexe incohérente (N ≠ somme des comptes) rend le manifeste INVALIDE', 'REFUS', 'prov_incoherente', 'provenance incohérente'),
    ('TC8', 'CONTRÔLE : une réécriture valide REMPLACE l\'ancien manifeste d\'un seul bloc (aucun fichier temporaire laissé)', 'ECRIT', 'ancien_intact', ''),
]


def jouer_temoins(out, arret=False):
    res = []
    for ident, desc, attendu, etape, motif in SC_TEM:
        statut, det, avant, apres, tmp = arene_temoins(ident, out, etape)
        ok = statut == attendu and (motif in det) and not tmp
        if attendu == 'REFUS': ok = ok and avant == apres      # un refus ne touche à RIEN
        res.append({'id': ident, 'description': desc, 'attendu': attendu, 'observe': statut, 'detail': det, 'statut': 'PASS' if ok else 'FAIL'})
        print('%-5s %-5s attendu %-6s observé %-6s %s' % (ident, res[-1]['statut'], attendu, statut, desc[:90]))
        if arret and not ok: break
    return res


# ───────────────────────── recette_annexe.py ─────────────────────────
# Le VRAI script lance de FAUSSES suites (`node suites/fictive.js`) sous le VRAI garde réseau (tests/_garde_reseau.js), dans un dépôt git jetable.
# ⚠️ `process.exit()` TRONQUE la sortie d'un TUBE (mesuré : A19 verte puis rouge sans rien changer) : les fausses suites posent `process.exitCode`.
OKL = "for(let i=1;i<=3000;i++) console.log('  ✅ A-'+String(i).padStart(4,'0')+' témoin réaliste de la suite annexe — état canonique identique après reprise');"
FIN_A = '^[✅❌] \\d+/\\d+$'
CONNU_A = [{'suite': 'fictive', 'temoin': 'défaut accepté', 'statut': 'DÉFAUT CONNU', 'plafonds': {'valeur': 100}}]


def arene_annexe(nom, sortie_dir, suite_js, fin=FIN_A, connus=None, avant=None, delai=None, args=(), manifeste_suite=None, manifeste_principal='auto'):
    base = tempfile.mkdtemp(prefix='arene-annexe-%s-' % nom)
    w = base + '/work'
    os.makedirs(w); sh('git', 'init', '-q', '-b', 'master', cwd=w); sh('git', 'config', 'user.email', 'a@example.test', cwd=w); sh('git', 'config', 'user.name', 'a', cwd=w)
    for d in ('tools', 'tests/recette', 'suites'): os.makedirs(w + '/' + d)
    for f in ('tools/recette_annexe.py', 'tools/temoins.py'): shutil.copy(os.path.join(GARDE, f), w + '/' + f)
    shutil.copy(os.path.join(RACINE, 'tests/_garde_reseau.js'), w + '/tests/_garde_reseau.js')
    json.dump({'suites': [{'id': 'fictive', 'commande': ['node', 'suites/fictive.js'], 'fin': fin, 'couvre': 'suite fictive'}]}, open(w + '/tests/recette/suites-annexes.json', 'w'))
    json.dump({'defauts': connus or []}, open(w + '/tests/recette/defauts-connus.json', 'w', encoding='utf-8'), ensure_ascii=False)
    open(w + '/suites/fictive.js', 'w', encoding='utf-8').write(suite_js); open(w + '/src.js', 'w').write('// suivi\n')
    chemin_m = w + '/tests/recette/temoins-attendus.json'
    if manifeste_principal == 'vide':      # un manifeste principal INVALIDE (« passe » vide) : aucune calibration annexe ne doit le prendre pour valide ni le réparer
        json.dump({'version': 2, 'calibre': {'commit': 'arene', 'n': 0}, 'passe': {}}, open(chemin_m, 'w', encoding='utf-8'))
    elif manifeste_suite is not None or manifeste_principal == 'valide':      # le manifeste PRINCIPAL est valide d'abord (une annexe ne le crée jamais) ; la suite est calibrée sur la suite de RÉFÉRENCE (saine)
        k_, v_ = cle_arene('un témoin de la passe principale')
        json.dump({'version': v_, 'calibre': {'commit': 'arene', 'n': 1, 'date': 'arene'}, 'passe': {k_: 1}}, open(chemin_m, 'w', encoding='utf-8'))
    if manifeste_suite is not None:
        with open(w + '/_ref.log', 'w', encoding='utf-8') as fj: subprocess.run(['node', '-e', manifeste_suite], stdout=fj)
        from temoins import calibrer_annexe, nettoyer, temoins_generiques
        _, _, ids = temoins_generiques(nettoyer(open(w + '/_ref.log', encoding='utf-8').read())); os.remove(w + '/_ref.log')
        calibrer_annexe('fictive', ids, chemin_m)
    sh('git', 'add', '-A', cwd=w); sh('git', 'commit', '-q', '-m', 'base', cwd=w)
    if avant: avant(w)
    e = dict(os.environ)
    if delai: e['RECETTE_DELAI'] = str(delai)
    r = subprocess.run([sys.executable, 'tools/recette_annexe.py'] + list(args), cwd=w, capture_output=True, text=True, env=e)
    s = r.stdout + r.stderr
    s += '\nMANIFESTE_PRINCIPAL_PRESENT=%d\n' % os.path.exists(chemin_m)
    try:
        mm = json.load(open(chemin_m, encoding='utf-8')); s += 'ANNEXE_N=%d RETRAITS_ACCEPTES=%s PROV=%s\n' % (sum((mm.get('annexes') or {}).get('fictive', {}).values()), ((mm.get('annexes_prov') or {}).get('fictive') or {}).get('retraits_acceptes'), ((mm.get('annexes_prov') or {}).get('fictive') or {}).get('commit') is not None)
    except (OSError, ValueError): s += 'ANNEXE_N=? RETRAITS_ACCEPTES=? PROV=?\n'
    open('%s/annexe.%s.out' % (sortie_dir, nom), 'w', encoding='utf-8').write(s)
    shutil.rmtree(base, ignore_errors=True)
    st = re.search(r"^\s+fictive\s+(PASS|DÉFAUT CONNU|TÉMOIN PÉRIMÉ|FAIL|ERREUR D'INFRA)", s, re.M)
    return r.returncode, (st.group(1) if st else '?'), s


SAINE = OKL + "console.log('✅ 3000/3000');"
SC_ANN = [
    # (id, description, statut attendu, code attendu, arguments)
    ('A01', 'CONTRÔLE POSITIF — suite saine (3 000 ✅, « ✅ 3000/3000 », code 0)', 'PASS', 0, dict(suite_js=SAINE)),
    ('A02', 'CONTRÔLE NÉGATIF — un rouge non listé, code 1', 'FAIL', 1, dict(suite_js=OKL.replace('3000', '2999') + "console.log('  ❌ nouvelle régression\\n       → lu 3 attendu 4');console.log('❌ 2999/3000');process.exitCode=(1);")),
    ('A03', 'suite VIDE : « ✅ 0/0 », code 0', "ERREUR D'INFRA", 2, dict(suite_js="console.log('✅ 0/0');")),
    ('A04', 'le total dit « ❌ 2999/3000 » mais aucun rouge lisible, code 0', "ERREUR D'INFRA", 2, dict(suite_js=OKL.replace('3000', '2999') + "console.log('❌ 2999/3000');")),
    ('A05', "un libellé de témoin CITE un total, puis la suite s'arrête, code 0", "ERREUR D'INFRA", 2, dict(suite_js="for(let i=1;i<=1500;i++) console.log('  ✅ a'+i);console.log('  ✅ ✅ 1501/1501');process.exitCode=(0);")),
    ('A06', 'la suite modifie un fichier SUIVI par git', "ERREUR D'INFRA", 2, dict(suite_js="require('fs').appendFileSync('src.js','//x\\n');" + SAINE)),
    ('A07', 'la suite crée un fichier NON SUIVI', "ERREUR D'INFRA", 2, dict(suite_js="require('fs').writeFileSync('residu.tmp','x');" + SAINE)),
    ('A08', 'arbre SALE au départ, avec --strict (preuve de livraison) — suite CALIBRÉE : seul le refus de l\'arbre sale peut sortir 2', "?", 2, dict(suite_js=SAINE, avant=lambda w: open(w + '/src.js', 'a').write('// sale\n'), args=('--strict',), manifeste_suite=SAINE)),
    ('A08b', "CONTRÔLE : arbre sale au départ SANS --strict : la suite tourne et PASS, mais l'avertissement est écrit", 'PASS', 0, dict(suite_js=SAINE, avant=lambda w: open(w + '/src.js', 'a').write('// sale\n'))),
    ('A09', 'délai dépassé (RECETTE_DELAI=2)', "ERREUR D'INFRA", 2, dict(suite_js="setTimeout(()=>{},60000);", delai=2)),
    ('A10', 'défaut CONNU AGGRAVÉ : même libellé, valeur au-delà de son plafond', 'FAIL', 1, dict(suite_js=OKL.replace('3000', '2999') + "console.log('  ❌ défaut accepté\\n       → valeur=250');console.log('❌ 2999/3000');process.exitCode=(1);", connus=CONNU_A)),
    ('A10b', 'CONTRÔLE : défaut connu À son plafond : DÉFAUT CONNU', 'DÉFAUT CONNU', 0, dict(suite_js=OKL.replace('3000', '2999') + "console.log('  ❌ défaut accepté\\n       → valeur=100');console.log('❌ 2999/3000');process.exitCode=(1);", connus=CONNU_A)),
    ('A11', "la ligne de total n'est écrite que sur la SORTIE D'ERREUR, code 0", "ERREUR D'INFRA", 2, dict(suite_js=OKL + "console.error('✅ 3000/3000');")),
    ('A12', 'banc au format « ──── 0 OK / 0 rouge ──── », code 0', "ERREUR D'INFRA", 2, dict(suite_js="console.log('──── 0 OK / 0 rouge ────');", fin='──── \\d+ OK / \\d+ rouge ────')),
    ('A13', 'un fichier DÉJÀ modifié (statut « M » inchangé) est modifié ENCORE par la suite', "ERREUR D'INFRA", 2, dict(suite_js="require('fs').appendFileSync('src.js','//encore\\n');" + SAINE, avant=lambda w: open(w + '/src.js', 'a').write('// déjà sale\n'))),
    ('A13b', 'un fichier NON SUIVI déjà présent (statut « ?? » inchangé) est RÉÉCRIT par la suite : seule l\'empreinte du contenu le voit', "ERREUR D'INFRA", 2, dict(suite_js="require('fs').writeFileSync('notes.tmp','contenu modifié par la suite');" + SAINE, avant=lambda w: open(w + '/notes.tmp', 'w').write('contenu initial'))),
    ('A05b', "banc : un témoin « OK » CITE « ──── 1500 OK / 0 rouge ──── » (nombre = lignes lues), puis arrêt, code 0 — aucun vrai total", "ERREUR D'INFRA", 2,
        dict(suite_js="for(let i=1;i<=1499;i++) console.log('   OK  b'+i);console.log('   OK  cite ──── 1500 OK / 0 rouge ────');process.exitCode=(0);", fin='──── \\d+ OK / \\d+ rouge ────')),
    ('A20', 'code 1 SANS aucun rouge lisible, total cohérent « ✅ 3000/3000 »', "ERREUR D'INFRA", 2, dict(suite_js=SAINE + "process.exitCode=(1);")),
    ('A21', 'code 0 malgré un rouge, total COHÉRENT (« ❌ 2999/3000 », 2 999 ✅ + 1 ❌)', "ERREUR D'INFRA", 2, dict(suite_js=OKL.replace('3000', '2999') + "console.log('  ❌ un rouge réel');console.log('❌ 2999/3000');process.exitCode=(0);")),
    ('A14', 'le total dit « ✅ 2999/3000 » (symbole vert) alors que 2 999 témoins ✅ et AUCUN ❌ sont lus', "ERREUR D'INFRA", 2, dict(suite_js=OKL.replace('3000', '2999') + "console.log('✅ 2999/3000');")),
    ('A15', 'DOUBLON À LA PLACE D\'UNE OMISSION : le témoin 1 500 est remplacé par une copie du 1 501 (même total, suite calibrée)', "ERREUR D'INFRA", 2,
        dict(suite_js=OKL.replace("console.log('  ✅ A-'+String(i).padStart(4,'0')", "console.log(i===1500?'  ✅ A-1501 témoin réaliste de la suite annexe — état canonique identique après reprise':'  ✅ A-'+String(i).padStart(4,'0')") + "console.log('✅ 3000/3000');", manifeste_suite=SAINE)),
    ('A16', 'CONTRÔLE : suite calibrée, identités identiques : PASS', 'PASS', 0, dict(suite_js=SAINE, manifeste_suite=SAINE)),
    ('A17', 'DEUX lignes de total', "ERREUR D'INFRA", 2, dict(suite_js=SAINE + "console.log('✅ 3000/3000');")),
    ('A18', 'DÉFAUT CONNU sans --strict : code 0 mais « PAS tout vert » écrit', 'DÉFAUT CONNU', 0, dict(suite_js=OKL.replace('3000', '2999') + "console.log('  ❌ défaut accepté\\n       → valeur=100');console.log('❌ 2999/3000');process.exitCode=(1);", connus=CONNU_A)),
    ('A19', 'DÉFAUT CONNU avec --strict (suite CALIBRÉE) : code 3 (jamais 0)', 'DÉFAUT CONNU', 3, dict(suite_js=OKL.replace('3000', '2999') + "console.log('  ❌ défaut accepté\\n       → valeur=100');console.log('❌ 2999/3000');process.exitCode=(1);", connus=CONNU_A, args=('--strict',), manifeste_suite=OKL.replace('3000', '2999') + "console.log('  ❌ défaut accepté\\n       → valeur=100');console.log('❌ 2999/3000');")),
    # ── INFRA-QA-01 · L0, 2ᵉ passe (contre-expertise, défauts 1 et 4) ──
    ('A22', '⛔ --strict : suite SAINE mais SANS identités calibrées (sans manifeste) : pas de vert — l\'inconnu bloque (avant : PASS)', "ERREUR D'INFRA", 2, dict(suite_js=SAINE, args=('--strict',))),
    ('A22b', '--publication (synonyme de --strict) : même refus', "ERREUR D'INFRA", 2, dict(suite_js=SAINE, args=('--publication',))),
    ('A22c', '⛔ le cas de la contre-expertise : suite AMPUTÉE (1 000 témoins au lieu de 3 000, total cohérent), sans manifeste, --strict : refusée', "ERREUR D'INFRA", 2, dict(suite_js=OKL.replace('3000', '1000') + "console.log('✅ 1000/1000');", args=('--strict',))),
    ('A22d', 'DIAGNOSTIC (sans --strict) sur une suite sans identités : PASS, mais « DIAGNOSTIC, PAS UNE VALIDATION » est écrit', 'PASS', 0, dict(suite_js=SAINE)),
    ('A22e', 'CONTRÔLE : --strict, suite SAINE et CALIBRÉE : PASS, code 0', 'PASS', 0, dict(suite_js=SAINE, args=('--strict',), manifeste_suite=SAINE)),
    ('A23', '⛔ --calibrer SANS manifeste principal : refusé, AUCUN manifeste créé (avant : un manifeste « passe » vide, ensuite pris pour une référence)', 'PASS', 2, dict(suite_js=SAINE, args=('--calibrer',), manifeste_principal='aucun')),
    ('A23b', '⛔ --calibrer avec un manifeste principal INVALIDE (« passe » vide) : refusé, manifeste intact', 'PASS', 2, dict(suite_js=SAINE, args=('--calibrer',), manifeste_principal='vide')),
    ('A24', '⛔ QA-retrait-annexe : --calibrer d\'une suite AMPUTÉE (1 000 témoins au lieu de 3 000) sur un référentiel qui en porte 3 000 : refusé, diff lisible, référentiel INTACT (avant le 17/11 : remplacé en silence)', 'PASS', 2, dict(suite_js=OKL.replace('3000', '1000') + "console.log('✅ 1000/1000');", args=('--calibrer',), manifeste_suite=SAINE)),
    ('A24b', '… le même retrait, accepté EXPLICITEMENT (--accepter-retraits) : référentiel remplacé (1 000), provenance écrite avec les retraits acceptés', 'PASS', 0, dict(suite_js=OKL.replace('3000', '1000') + "console.log('✅ 1000/1000');", args=('--calibrer', '--accepter-retraits'), manifeste_suite=SAINE)),
    ('A24c', 'CONTRÔLE : recalibrer la MÊME suite sans retrait (identités identiques, ou une addition) : accepté, provenance écrite, aucun retrait', 'PASS', 0, dict(suite_js=SAINE, args=('--calibrer',), manifeste_suite=SAINE)),
    ('A23c', 'CONTRÔLE : --calibrer avec un manifeste principal VALIDE : les identités de la suite sont écrites', 'PASS', 0, dict(suite_js=SAINE, args=('--calibrer',), manifeste_principal='valide')),
]


def jouer_annexe(out, arret=False):
    res = []
    for ident, desc, st_att, code_att, args in SC_ANN:
        code, st, s = arene_annexe(ident, out, **args)
        ok = (st == st_att or st_att == '?') and code == code_att
        if ident == 'A08b': ok = ok and 'ARBRE NON PROPRE' in s
        if ident in ('A18', 'A19'): ok = ok and 'PAS « tout vert »' in s
        if ident in ('A22', 'A22b', 'A22c'): ok = ok and 'IDENTITÉS INCONNUES' in s
        if ident == 'A22d': ok = ok and 'DIAGNOSTIC, PAS UNE VALIDATION' in s
        if ident == 'A23': ok = ok and 'MANIFESTE_PRINCIPAL_PRESENT=0' in s and 'une suite annexe ne le crée pas' in s
        if ident == 'A23b': ok = ok and 'MANIFESTE_PRINCIPAL_PRESENT=1' in s and 'manifeste principal est invalide' in s
        if ident == 'A23c': ok = ok and 'identités calibrées' in s
        if ident == 'A24': ok = ok and 'RETIRE' in s and 'ANNEXE_N=3000' in s and 'retiré :' in s
        if ident == 'A24b': ok = ok and 'ANNEXE_N=1000' in s and 'RETRAITS_ACCEPTES=2000' in s and 'PROV=True' in s
        if ident == 'A24c': ok = ok and 'ANNEXE_N=3000' in s and 'RETRAITS_ACCEPTES=0' in s and 'PROV=True' in s
        res.append({'id': ident, 'description': desc, 'attendu': '%s / code %s' % (st_att, code_att), 'observe': '%s / code %s' % (st, code), 'statut': 'PASS' if ok else 'FAIL'})
        print('%-5s %-5s attendu %-16s observé %-16s %s' % (ident, res[-1]['statut'], res[-1]['attendu'], res[-1]['observe'], desc[:70]))
        if arret and not ok: break
    return res


# ───────────────────────── recette_selecteur.py ─────────────────────────
# Le VRAI sélecteur, dans un dépôt jetable doté d'un MINI-registre (une fonction avec scénario, une sans, deux fichiers déclarés).
REG_MINI = {
    'carrefours': {'liste': [], 'seuil': 20},
    'tests': {n: {'commande': 'echo ' + n, 'controle_negatif': 'echo mutation ' + n} for n in ('banc:x', 'diff-check', 'check-regles', 'selecteur-autotest', 'annexe', 'passe', 'pages')},
    'scenarios': [
        {'id': 'S-X', 'module': 'm', 'scenario': 'la fonction X', 'niveau': 'T1', 'type': 'AUTO', 'criticite': 'haute', 'environnement': 'NODE', 'manuel_si': None, 'notes': '',
         'declencheurs': ['fonctionX', 'fichier:data/ciqual.json', 'fichier:tools/alias.py'], 'tests_associes': {'T1': ['banc:x']}},
        {'id': 'S-M', 'module': 'm', 'scenario': 'un scénario AUTOMATIQUE dont un geste réel reste nécessaire', 'niveau': 'T1', 'type': 'AUTO', 'criticite': 'haute', 'environnement': 'NODE',
         'manuel_si': 'le geste iPhone du repos', 'notes': '', 'declencheurs': ['fonctionM'], 'tests_associes': {'T1': ['banc:x']}},
    ],
}
CODE_MINI = "function fonctionX(){ return 1; }\nfunction fonctionM(){ return 1; }\nfunction fonctionSansScenario(){ return 1; }\n"


def arene_selecteur(nom, sortie_dir, modif, args):
    base = tempfile.mkdtemp(prefix='arene-sel-%s-' % nom)
    w = base + '/work'
    os.makedirs(w); sh('git', 'init', '-q', '-b', 'master', cwd=w); sh('git', 'config', 'user.email', 'arene@example.test', cwd=w); sh('git', 'config', 'user.name', 'arene', cwd=w)
    for d in ('tools', 'tests/recette', 'data'): os.makedirs(w + '/' + d)
    shutil.copy(os.path.join(GARDE, 'tools/recette_selecteur.py'), w + '/tools/recette_selecteur.py')
    json.dump(REG_MINI, open(w + '/tests/recette/registre.json', 'w', encoding='utf-8'), ensure_ascii=False)
    open(w + '/app.js', 'w').write(CODE_MINI); open(w + '/data/ciqual.json', 'w').write('{}\n'); open(w + '/tools/alias.py', 'w').write('# alias\n')
    open(w + '/sw.js', 'w').write("const CACHE = 'ft-v1'; // (!) ft-v1 = test\nself.addEventListener('install', () => {});\n"); open(w + '/README.md', 'w').write('doc\n')
    sh('git', 'add', '-A', cwd=w); sh('git', 'commit', '-q', '-m', 'base', cwd=w)
    modif(w)
    r = subprocess.run([sys.executable, 'tools/recette_selecteur.py'] + list(args), cwd=w, capture_output=True, text=True)
    s = r.stdout + r.stderr
    open('%s/selecteur.%s.out' % (sortie_dir, nom), 'w', encoding='utf-8').write(s)
    shutil.rmtree(base, ignore_errors=True)
    return r.returncode, s


def _ecrit(f, ajout):
    return lambda w: open(w + '/' + f, 'a').write(ajout)


def _remplace(f, ancien, nouveau):
    def _f(w):
        s = open(w + '/' + f).read()
        assert ancien in s, ancien
        open(w + '/' + f, 'w').write(s.replace(ancien, nouveau))
    return _f


def _change_cache(w):
    t = open(w + '/sw.js').read().replace("'ft-v1'", "'ft-v2'").replace('ft-v1 =', 'ft-v2 =')
    open(w + '/sw.js', 'w').write(t)


def _cache_plus_code(w):
    t = open(w + '/sw.js').read().replace("const CACHE = 'ft-v1';", "const CACHE = 'ft-v2'; self.skipWaiting();")
    open(w + '/sw.js', 'w').write(t)


SC_SEL = [
    # (id, description, modif, arguments, code attendu, présents, absents)
    ('S01', 'CONTRÔLE POSITIF — fonctionX modifiée : son scénario est sélectionné, code 0', _remplace('app.js', 'function fonctionX(){ return 1; }', 'function fonctionX(){ return 2; }'), ['--diff', 'HEAD'], 0, ['S-X'], ['MANUEL CONDITIONNEL']),
    ('S02', "RÉFÉRENCE GIT INVALIDE + un fichier non suivi : l'erreur n'est plus perdue (avant : « documentation », code 0)", lambda w: open(w + '/note.md', 'w').write('x\n'), ['--diff', 'refs/inexistant'], 2, ['ÉCHOUÉ'], []),
    ('S03', 'un nom INVENTÉ (faute de frappe) : refusé (avant : « — aucun », code 0)', lambda w: None, ['fonctionQuiNExistePas'], 2, ['INCONNUE'], []),
    ('S04', 'data/ciqual.json SEUL modifié : le scénario qui le déclare est sélectionné (avant : aucune zone)', _ecrit('data/ciqual.json', '\n'), ['--diff', 'HEAD'], 0, ['S-X'], []),
    ('S05', 'tools/alias.py SEUL modifié : le scénario qui le déclare est sélectionné (avant : classé infra-test, ignoré)', _ecrit('tools/alias.py', '# x\n'), ['--diff', 'HEAD'], 0, ['S-X'], []),
    ('S06', 'sw.js : le numéro de cache ET du code exécutable sur la même ligne : « logique », pas « version »', _cache_plus_code, ['--diff', 'HEAD'], 0, ['sw.js:logique'], ['sw.js:version']),
    ('S07', 'CONTRÔLE : sw.js ne change que le numéro (+ commentaire) : « version »', _change_cache, ['--diff', 'HEAD'], 0, ['sw.js:version'], ['sw.js:logique']),
    ('S08', 'un scénario AUTOMATIQUE qui porte un `manuel_si` : le geste manuel est RESTITUÉ (avant : jamais)', _remplace('app.js', 'function fonctionM(){ return 1; }', 'function fonctionM(){ return 2; }'), ['--diff', 'HEAD'], 0, ['MANUEL CONDITIONNEL', 'geste iPhone'], []),
    ('S09', '--publication : une fonction modifiée SANS scénario REFUSE la publication (avant : avertissement, code 0)', _remplace('app.js', 'function fonctionSansScenario(){ return 1; }', 'function fonctionSansScenario(){ return 2; }'), ['--diff', 'HEAD', '--publication'], 1, ['PUBLICATION REFUSÉE'], []),
    ('S10', 'CONTRÔLE : la même chose, acceptée EXPLICITEMENT (--accepter-sans-scenario=…)', _remplace('app.js', 'function fonctionSansScenario(){ return 1; }', 'function fonctionSansScenario(){ return 2; }'), ['--diff', 'HEAD', '--publication', '--accepter-sans-scenario=fonctionSansScenario'], 0, [], ['PUBLICATION REFUSÉE']),
    ('S11', 'CONTRÔLE : documentation seule : code 0, aucune recette métier', _ecrit('README.md', 'x\n'), ['--diff', 'HEAD'], 0, ['documentation'], ['S-X']),
]


def jouer_selecteur(out, arret=False):
    res = []
    for ident, desc, modif, args, code_att, presents, absents in SC_SEL:
        code, s = arene_selecteur(ident, out, modif, args)
        manque = [x for x in presents if x not in s] + ['(ne devrait pas apparaître) ' + x for x in absents if x in s]
        ok = code == code_att and not manque
        res.append({'id': ident, 'description': desc, 'attendu': 'code %s' % code_att, 'observe': 'code %s%s' % (code, (' · ' + '; '.join(manque)) if manque else ''), 'statut': 'PASS' if ok else 'FAIL'})
        print('%-5s %-5s attendu code %s observé code %s %s' % (ident, res[-1]['statut'], code_att, code, desc[:86]))
        if arret and not ok: break
    return res


def verdict_de(code, sortie):
    if 'ÉPREUVE RÉUSSIE' in sortie: return 'EPREUVE'
    return 'VALIDE' if ('PASSE VALIDE' in sortie and 'NON VALIDE' not in sortie) else 'REFUS'


def jouer_valide(out, arret_au_premier_rouge=False):
    res = []
    for ident, desc, attendu, args in SC_VALIDE:
        refus_avant = args.pop('refus_avant', False)       # le garde doit refuser SANS lancer 25 minutes de tests
        manif = args.pop('manifeste_modifie', None)         # (calibrage) le manifeste a-t-il été réécrit ?
        code, sortie, a_tourne = arene(ident, out, **args)
        verdict = verdict_de(code, sortie)
        # attendu 'EPREUVE' : ni « PASSE VALIDE », ni code 0 ; l'épreuve sur journal CASSÉ peut aussi être un REFUS
        if attendu == 'EPREUVE':
            ok = ('PASSE VALIDE' not in sortie or 'NON VALIDE' in sortie) and code != 0
        else:
            ok = verdict == attendu and (code == 0) == (attendu == 'VALIDE') and not (refus_avant and a_tourne)
        if manif is not None: ok = ok and ('MANIFESTE_MODIFIE=%d' % manif) in sortie
        res.append({'id': ident, 'description': desc, 'attendu': attendu, 'observe': verdict, 'code_garde': code, 'statut': 'PASS' if ok else 'FAIL'})
        print('%-5s %-5s attendu %-8s observé %-8s (code %s) %s' % (ident, res[-1]['statut'], attendu, verdict, code, desc[:84]))
        args['refus_avant'] = refus_avant
        if manif is not None: args['manifeste_modifie'] = manif
        if arret_au_premier_rouge and not ok: break
    return res


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'valide'
    out = os.path.abspath(sys.argv[2]) if len(sys.argv) > 2 and not sys.argv[2].startswith('--') else tempfile.mkdtemp(prefix='arene-sortie-')
    os.makedirs(out, exist_ok=True)
    arret = '--arret-premier-rouge' in sys.argv
    if cmd not in ('valide', 'repartie', 'annexe', 'selecteur', 'decoupe', 'temoins', 'tout'):
        print(__doc__); return 2
    res = []
    if cmd in ('valide', 'tout'):
        print('garde éprouvé : ' + empreinte_fichiers(['tools/passe_valide.sh', 'tools/temoins.py']))
        res += jouer_valide(out, arret)
    if cmd in ('repartie', 'tout'):
        print('garde éprouvé : ' + empreinte_fichiers(['tools/passe_repartie.py', 'tools/temoins.py']))
        res += jouer_repartie(out, arret)
    if cmd in ('temoins', 'tout'):
        print('garde éprouvé : ' + empreinte_fichiers(['tools/temoins.py']))
        res += jouer_temoins(out, arret)
    if cmd in ('decoupe', 'tout'):
        print('garde éprouvé : ' + empreinte_fichiers(['tools/decouper_passe.js', 'tools/verifier_decoupe.js']))
        res += jouer_decoupe(out, arret)
    if cmd in ('selecteur', 'tout'):
        print('garde éprouvé : ' + empreinte_fichiers(['tools/recette_selecteur.py']))
        res += jouer_selecteur(out, arret)
    if cmd in ('annexe', 'tout'):
        print('garde éprouvé : ' + empreinte_fichiers(['tools/recette_annexe.py', 'tools/temoins.py']))
        res += jouer_annexe(out, arret)
    json.dump({'scenarios': res}, open(out + '/resultats_%s.json' % cmd, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    ko = [r['id'] for r in res if r['statut'] == 'FAIL']
    sk = [r['id'] for r in res if r['statut'] == 'SKIP']
    print('\n──── %d OK / %d rouge ──── (%s)%s' % (len(res) - len(ko) - len(sk), len(ko), ', '.join(ko) or 'aucun', (' · %d NON JOUÉ(S) (SKIP : %s)' % (len(sk), ', '.join(sk))) if sk else ''))
    return 1 if ko else 0


if __name__ == '__main__':
    sys.exit(main())
