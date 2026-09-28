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

Chaque suite reçoit UN statut :
  PASS              sortie 0, aucun rouge, ligne de total présente
  DÉFAUT CONNU      rouges, tous listés dans tests/recette/defauts-connus.json (statut DÉFAUT CONNU)
  TÉMOIN PÉRIMÉ     rouges, tous listés (statut TÉMOIN PÉRIMÉ) — dette déclarée, à réparer
  FAIL              au moins un rouge NON listé → la commande échoue
  ERREUR D'INFRA    plantage, délai dépassé, ligne de total absente, code de sortie incohérent,
                    ou arbre de travail modifié par la suite → la commande échoue
⛔ Rien n'est jamais « accepté » par ressemblance : un libellé doit correspondre EXACTEMENT.
⛔ Un défaut connu qui ne rougit plus est SIGNALÉ (à retirer de la liste), jamais ignoré.
Code de sortie : 0 = rien d'inattendu · 1 = au moins un FAIL · 2 = au moins une ERREUR D'INFRA.
"""
import json, os, re, subprocess, sys, time

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONF = os.path.join(RACINE, 'tests', 'recette', 'suites-annexes.json')
CONNUS = os.path.join(RACINE, 'tests', 'recette', 'defauts-connus.json')
DELAI = int(os.environ.get('RECETTE_DELAI', '900'))


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


def classer(suite, code, sortie, connus, delai_depasse=False, arbre_modifie=False):
    """Rend (statut, rouges_non_listés, rouges_listés, connus_absents, raison)."""
    rouges = rouges_de(sortie)
    listes = {d['temoin']: d for d in connus if d['suite'] == suite['id']}
    non_listes = [r for r in rouges if r not in listes]
    deja = [r for r in rouges if r in listes]
    absents = [t for t in listes if t not in rouges]
    fin = re.compile(suite['fin'])
    a_fin = any(fin.search(l.strip()) for l in sortie.split('\n'))
    if delai_depasse:
        return "ERREUR D'INFRA", non_listes, deja, absents, 'délai dépassé (%d s)' % DELAI
    if arbre_modifie:
        return "ERREUR D'INFRA", non_listes, deja, absents, 'la suite a modifié un fichier suivi par git'
    if code not in (0, 1):
        return "ERREUR D'INFRA", non_listes, deja, absents, 'code de sortie %s (plantage)' % code
    if not a_fin:
        return "ERREUR D'INFRA", non_listes, deja, absents, 'ligne de total absente : la suite ne s\'est pas terminée'
    if code == 1 and not rouges:
        return "ERREUR D'INFRA", non_listes, deja, absents, 'code 1 sans aucun rouge lisible'
    if code == 0 and rouges:
        return "ERREUR D'INFRA", non_listes, deja, absents, 'code 0 malgré des rouges'
    if non_listes:
        return 'FAIL', non_listes, deja, absents, '%d rouge(s) non listé(s)' % len(non_listes)
    if deja:
        statuts = {listes[r]['statut'] for r in deja}
        st = 'TÉMOIN PÉRIMÉ' if 'TÉMOIN PÉRIMÉ' in statuts else 'DÉFAUT CONNU'
        return st, non_listes, deja, absents, '%d rouge(s) listé(s)' % len(deja)
    return 'PASS', non_listes, deja, absents, ''


def etat_git():
    r = subprocess.run(['git', 'status', '--porcelain', '--untracked-files=no'], cwd=RACINE,
                       capture_output=True, text=True)
    return r.stdout


def lancer(suite):
    avant = etat_git()
    t0 = time.time()
    try:
        r = subprocess.run(suite['commande'], cwd=RACINE, capture_output=True, text=True, timeout=DELAI)
        code, sortie, depasse = r.returncode, r.stdout + r.stderr, False
    except subprocess.TimeoutExpired as e:
        code, sortie, depasse = None, (e.stdout or b'').decode('utf-8', 'replace') if isinstance(e.stdout, bytes) else (e.stdout or ''), True
    duree = time.time() - t0
    return code, sortie, depasse, etat_git() != avant, duree


def auto_test():
    """Le classement s'éprouve lui-même sur des sorties fabriquées (aucune suite n'est lancée)."""
    s = {'id': 'x', 'fin': '^[✅❌] \\d+/\\d+$'}
    b = {'id': 'y', 'fin': '──── \\d+ OK / \\d+ rouge ────'}
    k = [{'suite': 'x', 'temoin': 'défaut accepté', 'statut': 'DÉFAUT CONNU'},
         {'suite': 'x', 'temoin': 'vieux témoin', 'statut': 'TÉMOIN PÉRIMÉ'}]
    cas = [
        ('tout vert', s, 0, '  ✅ a\n✅ 3/3', 'PASS'),
        ('un rouge connu seul', s, 1, '  ❌ défaut accepté\n       → 71735\n❌ 2/3', 'DÉFAUT CONNU'),
        ('un rouge inconnu', s, 1, '  ❌ nouvelle régression\n❌ 2/3', 'FAIL'),
        ('connu + inconnu : l\'inconnu gagne', s, 1, '  ❌ défaut accepté\n  ❌ autre chose\n❌ 1/3', 'FAIL'),
        ('libellé presque identique : refusé', s, 1, '  ❌ défaut accepté !\n❌ 2/3', 'FAIL'),
        ('témoin périmé déclaré', s, 1, '  ❌ vieux témoin\n❌ 2/3', 'TÉMOIN PÉRIMÉ'),
        ('plantage (code 2)', s, 2, 'Error: Cannot find module', "ERREUR D'INFRA"),
        ('suite interrompue sans total', s, 0, '  ✅ a\n  ✅ b', "ERREUR D'INFRA"),
        ('code 1 sans rouge lisible', s, 1, 'boom\n❌ 2/3', "ERREUR D'INFRA"),
        ('code 0 malgré un rouge', s, 0, '  ❌ quelque chose\n✅ 3/3', "ERREUR D'INFRA"),
        ('libellé qui commence par un chiffre', s, 1, '  ❌ 3 tuiles affichées\n❌ 2/3', 'FAIL'),
        ('format banc : rouge inconnu', b, 1, '   OK  a\n❌ ROUGE T4 truc  >> détail\n\n──── 1 OK / 1 rouge ────', 'FAIL'),
        ('format banc : vert', b, 0, '   OK  a\n\n──── 1 OK / 0 rouge ────', 'PASS'),
    ]
    ok = 0
    for nom, su, code, sortie, attendu in cas:
        st = classer(su, code, sortie, k)[0]
        bon = st == attendu
        ok += bon
        print('  %s %-40s → %-15s (attendu %s)' % ('✅' if bon else '❌', nom, st, attendu))
    st, _, _, absents, _ = classer(s, 0, '✅ 3/3', k)
    signale = st == 'PASS' and 'défaut accepté' in absents
    ok += signale
    print('  %s %-40s → %s' % ('✅' if signale else '❌', 'défaut connu disparu : signalé', absents))
    total = len(cas) + 1
    print('──── %d OK / %d rouge ────' % (ok, total - ok))
    return 0 if ok == total else 1


def main():
    args = [a for a in sys.argv[1:]]
    if '--auto-test' in args:
        return auto_test()
    conf = json.load(open(CONF, encoding='utf-8'))['suites']
    connus = json.load(open(CONNUS, encoding='utf-8'))['defauts']
    filtre = [f for a in args for f in a.split(',') if f]
    suites = [s for s in conf if not filtre or s['id'] in filtre]
    inconnues = [f for f in filtre if f not in {s['id'] for s in conf}]
    if inconnues:
        print('suite(s) inconnue(s) : %s — connues : %s' % (inconnues, ', '.join(s['id'] for s in conf)))
        return 2
    print('═══ BLOC ANNEXE DE LA RECETTE — %d suite(s) ═══' % len(suites))
    lignes, t_total = [], 0.0
    for su in suites:
        code, sortie, depasse, modifie, duree = lancer(su)
        t_total += duree
        st, nl, deja, absents, raison = classer(su, code, sortie, connus, depasse, modifie)
        lignes.append((su, st, nl, deja, absents, raison, duree, sortie))
        print('  %-16s %-15s %5.0f s  %s' % (su['id'], st, duree, raison))
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
    compte = {}
    for l in lignes:
        compte[l[1]] = compte.get(l[1], 0) + 1
    print('──── %s · durée totale %d min %02d s ────' % (
        ' · '.join('%d %s' % (v, k) for k, v in sorted(compte.items())), t_total // 60, t_total % 60))
    if compte.get("ERREUR D'INFRA"):
        return 2
    if compte.get('FAIL'):
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
