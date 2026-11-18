#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""LE BLOC ANNEXE DE LA RECETTE — une commande, toutes les suites hors passe complète (RECETTE-01).

⭐ POURQUOI (D-030, décision de Michel du 28/09/2026) : maximiser ce que Claude exécute lui-même.
Mesuré le 28/09 par TEST-MATRIX-01 : 11 suites vivaient hors de la passe complète et hors de tout
workflow, et personne ne les lançait plus depuis début septembre. Sur 11, deux témoins s'étaient
périmés et un vrai trou d'outillage (le jour UTC des fixtures) n'était vu par personne. *Une suite
qui ne tourne jamais dérive en silence.*

Usage :
  python3 tools/recette_annexe.py                 # tout le bloc (~7 min)
  python3 tools/recette_annexe.py dates,anneau    # un sous-ensemble (pendant le travail)
  python3 tools/recette_annexe.py --auto-test     # éprouve le classement lui-même (secondes)
  python3 tools/recette_annexe.py --strict        # PREUVE DE LIVRAISON (= --publication) : refuse un arbre sale ET une suite sans identités calibrées ; « défaut connu » ne sort plus 0 (code 3)
  python3 tools/recette_annexe.py --calibrer      # écrit, dans tests/recette/temoins-attendus.json, les identités des suites VERTES ; refuse de RETIRER des identités du référentiel précédent (diff lisible)
  python3 tools/recette_annexe.py --calibrer --accepter-retraits   # le même, avec l'accord EXPLICITE du retrait (provenance : retraits acceptés)

⭐ INFRA-QA-01 · L0 (16/11/2026) — ce que les audits ont démontré sur CE script (arène `tests/gardes/arene.py annexe`, 8 faux verts sur 12) :
  · une suite VIDE (« ✅ 0/0 ») ou dont le total ne se recoupe pas avec ses lignes de témoins (« 2/3 », « 0 OK / 3 rouge ») était classée PASS ;
  · une ligne de total citée dans un libellé, ou écrite seulement sur stderr, suffisait ; désormais UNE seule ligne de total, qui n'est pas un témoin, sur stdout ;
  · l'état git (`--untracked-files=no`, comparaison de chaînes) ne voyait ni un fichier déjà modifié qui change encore, ni un fichier créé : désormais statut +
    empreinte du diff + empreinte des fichiers non suivis ; et un arbre sale au départ est signalé (refusé avec --strict) ;
  · un DÉFAUT CONNU AGGRAVÉ (même libellé, valeur pire) restait « accepté » : un défaut connu porte un PLAFOND mesuré (`plafonds`) ;
  · « aucun inattendu » n'est pas « tout vert » : la synthèse le dit, et --strict ne sort 0 que si tout est PASS ;
  · les identités des témoins d'une suite (tools/temoins.py) : un témoin remplacé par un doublon n'est plus invisible (suites calibrées seulement).

Chaque suite reçoit UN statut :
  PASS              sortie 0, aucun rouge, ligne de total présente
  DÉFAUT CONNU      rouges, tous listés dans tests/recette/defauts-connus.json (statut DÉFAUT CONNU)
  TÉMOIN PÉRIMÉ     rouges, tous listés (statut TÉMOIN PÉRIMÉ) — dette déclarée, à réparer
  FAIL              au moins un rouge NON listé → la commande échoue
  ERREUR D'INFRA    plantage, délai dépassé, ligne de total absente, code de sortie incohérent,
                    ou arbre de travail modifié par la suite → la commande échoue
⛔ Rien n'est jamais « accepté » par ressemblance : un libellé doit correspondre EXACTEMENT.
⛔ Un défaut connu qui ne rougit plus est SIGNALÉ (à retirer de la liste), jamais ignoré.
Code de sortie : 0 = rien d'inattendu · 1 = au moins un FAIL · 2 = au moins une ERREUR D'INFRA · 3 = (--strict seulement) tout est sain SAUF des défauts connus.
"""
import hashlib, json, os, re, subprocess, sys, time

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(RACINE, 'tools'))
sys.dont_write_bytecode = True      # ⛔ jamais de tools/__pycache__ : un fichier non suivi fausserait le contrôle de l'arbre
import temoins
CONF = os.path.join(RACINE, 'tests', 'recette', 'suites-annexes.json')
CONNUS = os.path.join(RACINE, 'tests', 'recette', 'defauts-connus.json')
DELAI = int(os.environ.get('RECETTE_DELAI', '900'))
GARDE = os.path.join(RACINE, 'tests', '_garde_reseau.js')


def _env_garde():
    """⛔ D-031-SÉCURITÉ-01 (décision de Michel du 19/10/2026 : la protection réseau est OBLIGATOIRE) : chaque suite
    tourne SOUS LE GARDE RÉSEAU sans être modifiée — Node le charge avant la suite (`--require`) ; il refuse toute sortie
    et se PROUVE à chaque lancement de navigateur. Fermé par défaut : sans le fichier du garde, on s'arrête ici, et une
    suite dont Node ne trouve pas le garde ne démarre pas (ERREUR D'INFRA)."""
    if not os.path.exists(GARDE):
        raise SystemExit('⛔ garde réseau introuvable (' + GARDE + ') : aucune suite ne tourne sans lui.')
    e = dict(os.environ)
    e['NODE_OPTIONS'] = ('--require "' + GARDE + '" ' + e.get('NODE_OPTIONS', '')).strip()
    return e


def rouges_de(sortie):
    """Les libellés des témoins rouges. Une ligne de TOTAL (« ❌ 24/25 », « ❌ ÉCHEC ») n'en est pas un.
    Formats reconnus : « ❌ libellé » (suites), « ❌ ROUGE libellé  >> détail » (bancs)."""
    out = []
    for l in sortie.split('\n'):
        s = l.strip()
        if not s.startswith('❌'):
            continue
        r = s[1:].strip()
        # ⚠️ un LIBELLÉ peut commencer par un chiffre (« 3 tuiles affichées ») : seul « 24/25 » est un total
        if not r or re.fullmatch(r'\d+\s*/\s*\d+', r) or r == 'ÉCHEC':
            continue
        if r.startswith('ROUGE '):
            r = r[6:].strip()
        r = r.split('  >>')[0].strip()
        out.append(r)
    return out


def detail_de(sortie, libelle):
    """La ligne « → … » qui suit un rouge (la valeur mesurée), pour la réafficher."""
    lignes = sortie.split('\n')
    for i, l in enumerate(lignes):
        if libelle in l:
            if '  >>' in l:
                return l.split('  >>', 1)[1].strip()[:160]
            if i + 1 < len(lignes) and lignes[i + 1].strip().startswith('→'):
                return lignes[i + 1].strip()[1:].strip()[:160]
    return ''


# les lignes de TOTAL connues : (motif, (ok, ko) lus)
TOTAUX = [
    (re.compile(r'^([✅❌]) (\d+)/(\d+)$'), lambda m: (int(m.group(2)), int(m.group(3)) - int(m.group(2)))),
    (re.compile(r'Total (\d+) · ✅ (\d+) · ❌ (\d+)'), lambda m: (int(m.group(2)), int(m.group(3)))),
    (re.compile(r'TOTAL LINÉAIRE : (\d+) ✅ · (\d+) ❌'), lambda m: (int(m.group(1)), int(m.group(2)))),
    (re.compile(r'(\d+) OK / (\d+) rouge'), lambda m: (int(m.group(1)), int(m.group(2)))),
]


def lignes_de_total(sortie, suite):
    """Les lignes qui sont le TOTAL de la suite : le motif `fin` ET pas un témoin (un libellé qui cite le total n'en est pas un)."""
    fin = re.compile(suite['fin'])
    return [l for l in sortie.split('\n') if fin.search(l.strip()) and not (temoins.RE_T_GEN.match(l) or temoins.RE_B_GEN.match(l))]


def total_lu(ligne):
    for rx, f in TOTAUX:
        m = rx.search(ligne.strip())
        if m:
            return f(m)
    return None


def valeurs_mesurees(detail):
    """« maison=71801 salle=76720 » → {'maison': 71801, 'salle': 76720}."""
    return {k.strip(): int(v) for k, v in re.findall(r'([^\s=→][^=→]*?)=(\d+)', detail)}


def aggraves(deja, listes, sortie):
    """Les défauts connus dont la valeur mesurée dépasse leur PLAFOND (ou dont la valeur n'est plus lisible : l'inconnu BLOQUE)."""
    out = []
    for r in deja:
        plafonds = listes[r].get('plafonds')
        if not plafonds:
            continue
        mes = valeurs_mesurees(detail_de(sortie, r))
        for nom, pl in plafonds.items():
            if nom not in mes or mes[nom] > pl:
                out.append('%s : %s (plafond %d)' % (r, ('%s=%d' % (nom, mes[nom])) if nom in mes else '« %s » ILLISIBLE' % nom, pl))
    return out


def classer(suite, code, sortie, connus, delai_depasse=False, arbre_modifie=False, stdout=None):
    """Rend (statut, rouges_non_listés, rouges_listés, connus_absents, raison). `stdout` : la sortie standard seule (le total n'y est
    pas remplacé par un total écrit sur stderr) ; à défaut, `sortie`."""
    out = sortie if stdout is None else stdout
    rouges = rouges_de(sortie)
    listes = {d['temoin']: d for d in connus if d['suite'] == suite['id']}
    non_listes = [r for r in rouges if r not in listes]
    deja = [r for r in rouges if r in listes]
    absents = [t for t in listes if t not in rouges]
    if delai_depasse:
        return "ERREUR D'INFRA", non_listes, deja, absents, 'délai dépassé (%d s)' % DELAI
    if arbre_modifie:
        return "ERREUR D'INFRA", non_listes, deja, absents, 'la suite a modifié l\'arbre (fichier suivi ou non suivi) ou l\'état git est illisible'
    if code not in (0, 1):
        return "ERREUR D'INFRA", non_listes, deja, absents, 'code de sortie %s (plantage)' % code
    fins = lignes_de_total(out, suite)
    if not fins:
        autre = lignes_de_total(sortie, suite)
        return "ERREUR D'INFRA", non_listes, deja, absents, ('ligne de total UNIQUEMENT sur stderr' if autre else 'ligne de total absente : la suite ne s\'est pas terminée')
    if len(fins) > 1:
        return "ERREUR D'INFRA", non_listes, deja, absents, '%d lignes de total (une suite n\'en porte qu\'UNE)' % len(fins)
    n_ok, n_ko, _ids = temoins.temoins_generiques(out)
    tot = total_lu(fins[0])
    if tot is not None:
        if tot[0] + tot[1] == 0:
            return "ERREUR D'INFRA", non_listes, deja, absents, 'suite VIDE : le total annonce 0 témoin'
        if (n_ok, n_ko) != tot:
            return "ERREUR D'INFRA", non_listes, deja, absents, 'total incohérent : annonce %d ✅ · %d ❌, le journal porte %d ✅ · %d ❌' % (tot[0], tot[1], n_ok, n_ko)
    elif n_ok + n_ko == 0:
        return "ERREUR D'INFRA", non_listes, deja, absents, 'aucun témoin lu dans la sortie'
    if code == 1 and not rouges:
        return "ERREUR D'INFRA", non_listes, deja, absents, 'code 1 sans aucun rouge lisible'
    if code == 0 and rouges:
        return "ERREUR D'INFRA", non_listes, deja, absents, 'code 0 malgré des rouges'
    if non_listes:
        return 'FAIL', non_listes, deja, absents, '%d rouge(s) non listé(s)' % len(non_listes)
    ag = aggraves(deja, listes, sortie)
    if ag:
        return 'FAIL', ag, deja, absents, 'défaut connu AGGRAVÉ (au-delà de son plafond mesuré)'
    if deja:
        statuts = {listes[r]['statut'] for r in deja}
        st = 'TÉMOIN PÉRIMÉ' if 'TÉMOIN PÉRIMÉ' in statuts else 'DÉFAUT CONNU'
        return st, non_listes, deja, absents, '%d rouge(s) listé(s)' % len(deja)
    return 'PASS', non_listes, deja, absents, ''


def etat_git():
    """L'état de l'arbre, SANS angle mort : statut (fichiers non suivis compris) + empreinte du diff + empreinte du CONTENU des fichiers non suivis.
    Un fichier déjà modifié qui change encore garde le même statut « M » : seule l'empreinte du diff le voit. (rc, statut, empreinte)"""
    st = subprocess.run(['git', 'status', '--porcelain', '--untracked-files=all'], cwd=RACINE, capture_output=True, text=True)
    d = subprocess.run(['git', 'diff', 'HEAD'], cwd=RACINE, capture_output=True)
    h = hashlib.sha256(d.stdout)
    nouveaux = subprocess.run(['git', 'ls-files', '--others', '--exclude-standard'], cwd=RACINE, capture_output=True, text=True).stdout.split('\n')
    for f in sorted(x for x in nouveaux if x):
        try:
            h.update(f.encode('utf-8')); h.update(open(os.path.join(RACINE, f), 'rb').read())
        except OSError:
            h.update(b'<illisible>')
    return (st.returncode or d.returncode, st.stdout, h.hexdigest())


def lancer(suite):
    avant = etat_git()
    t0 = time.time()
    try:
        r = subprocess.run(suite['commande'], cwd=RACINE, capture_output=True, text=True, timeout=DELAI, env=_env_garde())
        code, sortie, stdout, depasse = r.returncode, r.stdout + r.stderr, r.stdout, False
    except subprocess.TimeoutExpired as e:
        code, depasse = None, True
        stdout = (e.stdout or b'').decode('utf-8', 'replace') if isinstance(e.stdout, bytes) else (e.stdout or '')
        sortie = stdout
    duree = time.time() - t0
    apres = etat_git()
    return code, sortie, depasse, (apres != avant or avant[0] != 0 or apres[0] != 0), duree, stdout


def auto_test():
    """Le classement s'éprouve lui-même sur des sorties fabriquées (aucune suite n'est lancée). ⚠️ Les sorties fabriquées doivent être COHÉRENTES :
    depuis L0, un total qui ne se recoupe pas avec les lignes de témoins est une ERREUR D'INFRA (elles annonçaient 3 en n'en portant qu'un)."""
    s = {'id': 'x', 'fin': '^[✅❌] \\d+/\\d+$'}
    b = {'id': 'y', 'fin': '──── \\d+ OK / \\d+ rouge ────'}
    k = [{'suite': 'x', 'temoin': 'défaut accepté', 'statut': 'DÉFAUT CONNU'},
         {'suite': 'x', 'temoin': 'vieux témoin', 'statut': 'TÉMOIN PÉRIMÉ'},
         {'suite': 'x', 'temoin': 'taille bornée', 'statut': 'DÉFAUT CONNU', 'plafonds': {'maison': 71801, 'salle': 76720}}]
    V3 = '  ✅ a\n  ✅ b\n  ✅ c\n'
    cas = [
        ('tout vert', s, 0, V3 + '✅ 3/3', 'PASS'),
        ('un rouge connu seul', s, 1, '  ✅ a\n  ✅ b\n  ❌ défaut accepté\n       → 71735\n❌ 2/3', 'DÉFAUT CONNU'),
        ('un rouge inconnu', s, 1, '  ✅ a\n  ✅ b\n  ❌ nouvelle régression\n❌ 2/3', 'FAIL'),
        ('connu + inconnu : l\'inconnu gagne', s, 1, '  ✅ a\n  ❌ défaut accepté\n  ❌ autre chose\n❌ 1/3', 'FAIL'),
        ('libellé presque identique : refusé', s, 1, '  ✅ a\n  ✅ b\n  ❌ défaut accepté !\n❌ 2/3', 'FAIL'),
        ('témoin périmé déclaré', s, 1, '  ✅ a\n  ✅ b\n  ❌ vieux témoin\n❌ 2/3', 'TÉMOIN PÉRIMÉ'),
        ('plantage (code 2)', s, 2, 'Error: Cannot find module', "ERREUR D'INFRA"),
        ('suite interrompue sans total', s, 0, '  ✅ a\n  ✅ b', "ERREUR D'INFRA"),
        ('code 1 sans rouge lisible', s, 1, 'boom\n❌ 2/3', "ERREUR D'INFRA"),
        ('code 0 malgré un rouge', s, 0, '  ✅ a\n  ✅ b\n  ❌ quelque chose\n✅ 2/3', "ERREUR D'INFRA"),
        ('libellé qui commence par un chiffre', s, 1, '  ✅ a\n  ✅ b\n  ❌ 3 tuiles affichées\n❌ 2/3', 'FAIL'),
        ('format banc : rouge inconnu', b, 1, '   OK  a\n❌ ROUGE T4 truc  >> détail\n\n──── 1 OK / 1 rouge ────', 'FAIL'),
        ('format banc : vert', b, 0, '   OK  a\n\n──── 1 OK / 0 rouge ────', 'PASS'),
        # ── L0 (INFRA-QA-01) : chaque ligne est un FAUX VERT mesuré sur l'ancien classement ──
        ('suite VIDE « ✅ 0/0 »', s, 0, '✅ 0/0', "ERREUR D'INFRA"),
        ('banc VIDE « 0 OK / 0 rouge »', b, 0, '──── 0 OK / 0 rouge ────', "ERREUR D'INFRA"),
        ('total « 3 » mais UN seul témoin', s, 0, '  ✅ a\n✅ 3/3', "ERREUR D'INFRA"),
        ('total « ❌ 24/25 » sans aucun rouge lisible, code 0', s, 0, '  ✅ a\n  ✅ b\n❌ 2/3', "ERREUR D'INFRA"),
        ('banc « 0 OK / 3 rouge » sans rouge ni vert lisible', b, 0, '──── 0 OK / 3 rouge ────', "ERREUR D'INFRA"),
        ('libellé de témoin qui CITE un total, puis arrêt', s, 0, '  ✅ a\n  ✅ ✅ 3/3\n', "ERREUR D'INFRA"),
        ('DEUX lignes de total', s, 0, V3 + '✅ 3/3\n✅ 3/3', "ERREUR D'INFRA"),
        ('total présent seulement sur stderr', s, 0, '  ✅ a\n✅ 1/1', "ERREUR D'INFRA"),
        ('défaut connu AGGRAVÉ au-delà de son plafond', s, 1, '  ✅ a\n  ✅ b\n  ❌ taille bornée\n       → maison=80000 salle=76720\n❌ 2/3', 'FAIL'),
        ('défaut connu à son plafond exact', s, 1, '  ✅ a\n  ✅ b\n  ❌ taille bornée\n       → maison=71801 salle=76720\n❌ 2/3', 'DÉFAUT CONNU'),
        ('défaut connu dont la valeur n\'est plus lisible', s, 1, '  ✅ a\n  ✅ b\n  ❌ taille bornée\n       → mesure absente\n❌ 2/3', 'FAIL'),
    ]
    ok = 0
    for nom, su, code, sortie, attendu in cas:
        out = '' if nom == 'total présent seulement sur stderr' else None       # stdout vide : tout est venu de stderr
        st = classer(su, code, sortie, k, stdout=out if out is not None else None)[0]
        if nom == 'total présent seulement sur stderr':
            st = classer(su, code, sortie, k, stdout='  ✅ a')[0]
        bon = st == attendu
        ok += bon
        print('  %s %-52s → %-15s (attendu %s)' % ('✅' if bon else '❌', nom, st, attendu))
    st, _, _, absents, _ = classer(s, 0, V3 + '✅ 3/3', k)
    signale = st == 'PASS' and 'défaut accepté' in absents
    ok += signale
    print('  %s %-52s → %s' % ('✅' if signale else '❌', 'défaut connu disparu : signalé', absents))
    total = len(cas) + 1
    print('──── %d OK / %d rouge ────' % (ok, total - ok))
    return 0 if ok == total else 1


def sh_git(*a):
    r = subprocess.run(['git'] + list(a), cwd=RACINE, capture_output=True, text=True)
    return r.stdout.strip() if r.returncode == 0 else ''


def main():
    args = [a for a in sys.argv[1:]]
    if '--auto-test' in args:
        return auto_test()
    strict, calibrer = '--strict' in args or '--publication' in args, '--calibrer' in args      # --publication : synonyme de --strict (preuve de livraison)
    args = [a for a in args if not a.startswith('--')]
    conf = json.load(open(CONF, encoding='utf-8'))['suites']
    connus = json.load(open(CONNUS, encoding='utf-8'))['defauts']
    filtre = [f for a in args for f in a.split(',') if f]
    suites = [s for s in conf if not filtre or s['id'] in filtre]
    inconnues = [f for f in filtre if f not in {s['id'] for s in conf}]
    if inconnues:
        print('suite(s) inconnue(s) : %s — connues : %s' % (inconnues, ', '.join(s['id'] for s in conf)))
        return 2
    depart = etat_git()
    sale = depart[0] != 0 or bool(depart[1].strip())
    print('═══ BLOC ANNEXE DE LA RECETTE — %d suite(s) ═══' % len(suites))
    if sale:
        print('  %s ARBRE NON PROPRE au départ%s : ce résultat décrit l\'arbre de travail, PAS un commit — il ne vaut pas preuve de livraison.' % ('❌' if strict else '⚠️ ', ' (--strict : refus)' if strict else ''))
        if strict:
            return 2
    manifeste = temoins.charger_manifeste()
    annexes = (manifeste or {}).get('annexes', {})
    jour = temoins.jour_passe()
    lignes, t_total, sans_identites = [], 0.0, []
    for su in suites:
        code, sortie, depasse, modifie, duree, stdout = lancer(su)
        t_total += duree
        st, nl, deja, absents, raison = classer(su, code, sortie, connus, depasse, modifie, stdout)
        _, _, ids = temoins.temoins_generiques(stdout, jour)
        note = ''
        if st in ('PASS', 'DÉFAUT CONNU', 'TÉMOIN PÉRIMÉ'):
            if su['id'] in annexes:
                # en --calibrer, c'est `calibrer_annexe` qui juge ce que le nouveau référentiel RETIRE (diff lisible, --accepter-retraits) — pas l'erreur d'identité, qui empêcherait de recalibrer
                manque = {} if calibrer else temoins.comparer(ids, annexes[su['id']])[0]
                if manque:
                    st, raison = "ERREUR D'INFRA", 'IDENTITÉS : %d témoin(s) attendu(s) absent(s) ou en moins (un doublon ne remplace pas une omission) — ex. %s' % (len(manque), ', '.join(sorted(manque)[:3]))
            elif strict:
                # ⛔ INFRA-QA-01 · L0 (2ᵉ passe, défaut 1) : en --strict / --publication, une suite dont les identités sont inconnues N'EST PAS VALIDÉE — elle acceptait une suite amputée (1/1 au lieu de 2/2)
                st, raison = "ERREUR D'INFRA", 'IDENTITÉS INCONNUES : aucun manifeste valide pour cette suite — l\'inconnu BLOQUE (calibrer : python3 tools/recette_annexe.py --calibrer, après le manifeste principal)'
            else:
                sans_identites.append(su['id'])
                note = ' (DIAGNOSTIC : identités non calibrées, aucun contrôle d\'omission — ce n\'est pas une validation)'
        lignes.append((su, st, nl, deja, absents, raison, duree, sortie))
        print('  %-16s %-15s %5.0f s  %s%s' % (su['id'], st, duree, raison, note))
        for r in nl:
            d = detail_de(sortie, r)
            print('      ❌ %s%s' % (r, ('  → ' + d) if d else ''))
        for r in deja:
            d = detail_de(sortie, r)
            print('      ⚠️  %s%s' % (r, ('  → ' + d) if d else ''))
        for r in absents:
            print('      ℹ️  défaut connu qui NE rougit PLUS — à retirer de defauts-connus.json : %s' % r)
        if st == "ERREUR D'INFRA":
            print('      dernières lignes : %s' % ' | '.join([x for x in sortie.strip().split('\n') if x.strip()][-3:])[:300])
        if calibrer and st in ('PASS', 'DÉFAUT CONNU', 'TÉMOIN PÉRIMÉ'):
            try:
                temoins.calibrer_annexe(su['id'], ids, commit=sh_git('rev-parse', 'HEAD'), accepter_retraits='--accepter-retraits' in sys.argv)
            except SystemExit as e:
                print('      %s' % e); return 2
            print('      ✅ identités calibrées pour « %s » (%d témoins) — à relire (git diff) puis à committer' % (su['id'], sum(ids.values())))
    compte = {}
    for l in lignes:
        compte[l[1]] = compte.get(l[1], 0) + 1
    print('──── %s · durée totale %d min %02d s ────' % (
        ' · '.join('%d %s' % (v, k) for k, v in sorted(compte.items())), t_total // 60, t_total % 60))
    if sans_identites:
        print('  ⚠️  RÉSULTAT DIAGNOSTIC, PAS UNE VALIDATION : %d suite(s) sans identités calibrées (%s) — un témoin omis ou remplacé par un doublon y serait invisible. Preuve de livraison : --strict (refuse).' % (len(sans_identites), ', '.join(sans_identites)))
    if compte.get("ERREUR D'INFRA"):
        return 2
    if compte.get('FAIL'):
        return 1
    connus_n = compte.get('DÉFAUT CONNU', 0) + compte.get('TÉMOIN PÉRIMÉ', 0)
    if connus_n:
        print('  ⚠️  RIEN D\'INATTENDU, mais %d suite(s) AVEC DÉFAUT CONNU ou TÉMOIN PÉRIMÉ : ce n\'est PAS « tout vert »%s.' % (connus_n, ' — code 3 (--strict)' if strict else ' (--strict : code 3)'))
        return 3 if strict else 0
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
