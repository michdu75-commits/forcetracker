#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 LES IDENTITÉS DES TÉMOINS — ce qui prouve qu'une passe a joué CE QU'ELLE DEVAIT JOUER  (INFRA-QA-01 · lot L0)
 ⭐ POURQUOI (audits des 15-16/11/2026, `BUGS.md`) : un compteur vert ne prouve pas la couverture. Un témoin OMIS et
    remplacé par un DOUBLON garde le même total, le même code de sortie et zéro rouge. Les gardes ne savaient compter
    que des LIGNES ; ils ne savaient pas dire QUELS témoins avaient tourné.
 CE QUE CE MODULE FAIT (une seule source de vérité pour passe_valide.sh, passe_repartie.py et recette_annexe.py) :
  · lit un journal comme il est (couleurs ANSI retirées, fins de ligne normalisées) et en tire les lignes de témoins ;
  · RECOUPE le journal avec lui-même : une seule ligne de total, ancrée ; lignes ✅ = N annoncé ; lignes ❌ = K annoncé ;
    zéro rouge à QUELQUE indentation que ce soit (mesuré sur 5 vrais journaux : 8 200 à 8 249 ✅, ✅ = N et ❌ = K exacts) ;
  · compare le MULTIENSEMBLE des identités au manifeste `tests/recette/temoins-attendus.json` :
      – une identité ABSENTE, ou moins fréquente que dans le manifeste = BLOQUANT (omission, même compensée par un doublon) ;
      – une identité EN PLUS = signalée, jamais bloquante (on peut ajouter un témoin librement ; en retirer ou en
        renommer un se voit, s'écrit — R30 — et passe par `--calibrer`, donc par un diff Git relu).
 IDENTITÉ = le libellé SANS ses dates (et sans l'heure collée à une date), plus ses JETONS DE DATE sous deux formes — le littéral et le décalage en
   jours par rapport au jour de la passe : une date relative garde son décalage, une date fixe garde son littéral (voir `squelette`, `comparer`). Une durée
   ou une heure seule reste LITTÉRALE : « 1:30 » et « 0:30 » sont deux témoins. ⚠️ Un libellé n'est pas unique (13 doublons exacts sur 8 249) : l'identité est
   donc un COMPTE, pas un ensemble. Toute règle de normalisation de plus s'ÉTABLIT en comparant deux passes du MÊME commit ; jamais pour faire disparaître un écart.
 LE MANIFESTE ne contient que des EMPREINTES (sha-256 tronqué) et des comptes : ~115 Ko pour 8 300 témoins. Pour savoir
   QUEL témoin manque : `python3 tools/temoins.py expliquer <empreinte> <journal>`.
 ⛔ Sans manifeste, les identités sont INCONNUES : l'état inconnu BLOQUE (jamais « pas de manifeste, donc pas de contrôle »).
    Le manifeste s'écrit par `tools/passe_valide.sh --calibrer --croiser <dossier>`, seulement après une passe VALIDE ET recoupée par une passe RÉPARTIE
    du même commit (deux exécutions indépendantes : une référence tirée du seul journal à certifier ne voit pas un témoin omis dont le total est ajusté).
Usage :
  python3 tools/temoins.py controler <journal> [--epreuve] [--manifeste F] [--jour AAAA-MM-JJ]   # conditions ① ⑤ ⑥ ⑦ (code 0 = tout vert)
  python3 tools/temoins.py calibrer  <journal> --commit SHA --croiser <dossier passe répartie> [--manifeste F] [--accepter-retraits]\n                                                                                  # écrit le manifeste : DEUX exécutions indépendantes qui se recoupent, ou rien
  python3 tools/temoins.py expliquer <empreinte> <journal>
══════════════════════════════════════════════════════════════════════════════════════════════════════════════
"""
import collections, datetime, hashlib, json, os, re, sys, tempfile

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFESTE = os.path.join(RACINE, 'tests', 'recette', 'temoins-attendus.json')
RE_ANSI = re.compile(r'\x1b\[[0-9;?]*[ -/]*[@-~]')
RE_TOTAL = re.compile(r'^════ TOTAL CROISÉ : (\d+) ✅ · (\d+) ❌ ════$')
RE_TEMOIN = re.compile(r'^\s+(✅|❌) (.*)$')
RE_T_GEN = re.compile(r'^\s*(✅|❌) (?!\d+\s*/\s*\d+$)(?!Toutes les données)(?!ÉCHEC)(.*)$')
RE_B_GEN = re.compile(r'^\s+(OK)\s+(.*?)(?:\s{3}.*)?$')
RE_ROUGE = re.compile(r'^\s*❌')                      # à QUELQUE indentation que ce soit (colonne 0 comprise)
RE_INFRA = re.compile(r'^D031S-II? ')
# Les SUITES ANNEXES (tools/recette_annexe.py) n'ont pas toutes le format de la passe : « ✅ libellé » en colonne 0 (calendrier, milo-noyau), à 2 espaces
# (la plupart), « OK  libellé » (bancs). Une ligne de TOTAL (« ✅ 24/24 », « Total 10 · … ») n'est pas un témoin.                 # l'infrastructure du garde réseau (jouée dans CHAQUE processus répartis)
# ⭐ L'IDENTITÉ D'UN TÉMOIN (INFRA-QA-01 · L0, 2ᵉ passe, 16/11/2026 — contre-expertise défaut 5) : un libellé est un SQUELETTE (le texte, dates et heures
#   de date retirées) + la liste de ses JETONS DE DATE, chacun noté sous DEUX formes : le littéral (« 2025-08-31 ») ET son décalage en jours par rapport au jour
#   de la passe (« -426 »). Deux passes à des jours différents ne sont pas comparables par le seul texte : une date RELATIVE (aujourd'hui − 14) change de
#   littéral mais garde son décalage ; une date FIXE garde son littéral mais change de décalage. Un jeton est donc le MÊME si son littéral OU son décalage
#   concorde (voir `comparer`). Avant : TOUTES les dates et TOUTES les heures devenaient « ‹date› » / « ‹heure› » — deux libellés distincts (« 1:30 » et « 0:30 »,
#   mesuré sur un vrai journal : 36 libellés d'heures sans date) devenaient la même identité, et un témoin remplacé par un doublon passait.
#   ⛔ Une HEURE n'est normalisée que collée à une date (« 17/10/2026 · 07:32 ») : une durée ou une heure seule reste LITTÉRALE.
RE_DATE_HEURE = re.compile(r'(?P<d>(?<![\d-])\d{4}-\d{2}-\d{2}(?![\d-])|(?<![\d/])\d{2}/\d{2}/\d{4}(?![\d/]))(?P<h>\s*(?:·|,|@|à|-)?\s*(?<!\d)\d{1,2}:\d{2}(?::\d{2})?(?![\d:]))?')


def jour_passe(jour=None):
    """Le jour de la passe : argument, sinon FT_JOUR_PASSE (AAAA-MM-JJ, utilisé par les arènes qui pilotent l'horloge), sinon aujourd'hui."""
    j = jour or os.environ.get('FT_JOUR_PASSE')
    return datetime.date.fromisoformat(j) if isinstance(j, str) and j else (j or datetime.date.today())


def _date_de(texte):
    try:
        if '-' in texte: return datetime.date.fromisoformat(texte)
        jj, mm, aaaa = texte.split('/'); return datetime.date(int(aaaa), int(mm), int(jj))
    except ValueError:
        return None


def lire(chemin):
    with open(chemin, encoding='utf-8', errors='replace') as f:
        return nettoyer(f.read())


def nettoyer(texte):
    return RE_ANSI.sub('', texte).replace('\r\n', '\n').replace('\r', '\n')


# ⭐ L'HEURE COLLÉE À UNE DATE EST SIGNIFICATIVE (contre-expertise ciblée du 17/11/2026, `QA-heure-liee-date`) : « départ 2026-11-17 à 07:30 » et « … à 08:30 » sont DEUX témoins. L'heure devient un JETON à part entière
#   (littéral, littéral) : elle doit concorder EXACTEMENT d'une passe à l'autre (une heure n'a pas de « décalage relatif » qu'on puisse comparer). Avant, elle était jetée avec la date : un témoin remplacé par un doublon qui ne diffère que
#   par l'heure passait.
# ⛔ SEULE EXCEPTION, ÉCRITE ET NOMMÉE : un libellé qui DIT lui-même porter l'heure de l'horloge de la passe (« jamais l'heure de consultation (30/10/2026 · 10:58) », mesuré sur un vrai journal) a une heure qui change à chaque
#   passe par construction : elle seule est neutralisée (voir `LIBELLES_A_HORLOGE`). Ce n'est pas une exemption de test : c'est la déclaration que la valeur de CE libellé est l'horloge ; tout autre libellé garde son heure.
LIBELLES_A_HORLOGE = (re.compile(r"l'heure de consultation"),)


def squelette(libelle, jour):
    """(texte sans dates ni heures de date, [(littéral, décalage en jours)…]). Une date impossible (31/02) n'a pas de décalage : '?' (jamais égal à un autre '?'). L'heure collée à une date est un jeton (heure, heure) :
    jamais jetée, sauf pour un libellé qui déclare porter l'horloge de la passe."""
    jetons = []
    horloge = any(rx.search(libelle) for rx in LIBELLES_A_HORLOGE)
    def r(m):
        d = _date_de(m.group('d'))
        jetons.append((m.group('d'), str((d - jour).days) if d else '?'))
        if m.group('h') and not horloge:
            h = re.search(r'\d{1,2}:\d{2}(?::\d{2})?', m.group('h')).group(0)
            jetons.append((h, h))
        return '‹date›' + ('‹heure›' if m.group('h') else '')
    return RE_DATE_HEURE.sub(r, libelle), jetons


def empreinte(libelle, jour=None):
    """L'empreinte du SQUELETTE (12 hexa) : ce que `expliquer` retrouve ; deux dates différentes y sont le même squelette."""
    return hashlib.sha256(squelette(libelle, jour_passe(jour))[0].encode('utf-8')).hexdigest()[:12]


def cle(libelle, jour=None):
    """La CLÉ d'identité : empreinte du squelette + ses jetons « littéral~décalage ». C'est elle que le manifeste compte."""
    sq, jt = squelette(libelle, jour_passe(jour))
    return hashlib.sha256(sq.encode('utf-8')).hexdigest()[:12] + ''.join('|%s~%s' % j for j in jt)


def _decouper(k):
    h, *jt = k.split('|')
    return h, tuple(tuple(j.split('~', 1)) for j in jt)


def _compatibles(a, b):
    """Deux séries de jetons de MÊME squelette désignent le même témoin si, jeton par jeton, le littéral OU le décalage concorde."""
    return len(a) == len(b) and all(la == lb or (oa == ob and oa != '?') for (la, oa), (lb, ob) in zip(a, b))


def analyser(texte, jour=None):
    """Tout ce qu'un journal dit de lui-même. Aucun jugement ici : seulement des faits lus."""
    lignes = texte.split('\n')
    totaux = [(int(m.group(1)), int(m.group(2))) for m in map(RE_TOTAL.match, lignes) if m]
    ok, ko = collections.Counter(), []
    n_ok = n_ko = 0
    for l in lignes:
        m = RE_TEMOIN.match(l)
        if not m:
            continue
        if m.group(1) == '✅':
            n_ok += 1
            ok[m.group(2)] += 1
        else:
            n_ko += 1
            ko.append(m.group(2))
    jour = jour_passe(jour)
    ids = collections.Counter()
    for lib, c in ok.items():
        ids[cle(lib, jour)] += c
    return {'jour': jour, 'totaux': totaux, 'n_ok': n_ok, 'n_ko': n_ko, 'rouges': sum(1 for l in lignes if RE_ROUGE.match(l)),
            'ids': ids, 'libelles': ok, 'infra': sum(c for lib, c in ok.items() if RE_INFRA.match(lib))}


def temoins_generiques(texte, jour=None):
    """(n_ok, n_ko, Counter d'identités des ✅) pour un journal de SUITE ANNEXE (tous formats)."""
    jour = jour_passe(jour)
    ok, ko, ids = 0, 0, collections.Counter()
    for l in texte.split('\n'):
        m = RE_T_GEN.match(l) or RE_B_GEN.match(l)
        if not m:
            continue
        if m.group(1) == '❌':
            ko += 1
        else:
            ok += 1
            ids[cle(m.group(2), jour)] += 1
    return ok, ko, ids


VERSION_MANIFESTE = 2


def _compteurs_valides(d):
    """Un dictionnaire clé d'identité → entier ≥ 1, non vide, dont chaque clé est « 12 hexa » suivie de jetons « littéral~décalage »."""
    return (isinstance(d, dict) and bool(d) and all(isinstance(k, str) and re.fullmatch(r'[0-9a-f]{12}(\|[^|~]+~[^|~]+)*', k) and isinstance(v, int) and not isinstance(v, bool) and v >= 1 for k, v in d.items()))


def valider_manifeste(m):
    """⛔ Un manifeste n'est CRU que s'il est complet : version, passe non vide, calibrage nommant le commit, et N = somme des comptes.
    Rend None si valide, sinon la raison. (Défaut 4 de la contre-expertise : une calibration annexe pouvait créer un manifeste « passe » VIDE,
    que ⑦ prenait ensuite pour une référence.)"""
    if not isinstance(m, dict) or m.get('version') != VERSION_MANIFESTE:
        return 'version %s inattendue (attendue %d : relancer le calibrage)' % (m.get('version') if isinstance(m, dict) else '?', VERSION_MANIFESTE)
    if not _compteurs_valides(m.get('passe')):
        return '« passe » vide ou mal formée'
    cal = m.get('calibre')
    if not isinstance(cal, dict) or not cal.get('commit') or not isinstance(cal.get('n'), int):
        return '« calibre » incomplet (commit et n obligatoires : sans provenance, pas de référence)'
    if sum(m['passe'].values()) != cal['n']:
        return 'N annoncé (%s) ≠ somme des comptes (%d)' % (cal['n'], sum(m['passe'].values()))
    an = m.get('annexes', {})
    if not isinstance(an, dict) or not all(_compteurs_valides(d) for d in an.values()):
        return '« annexes » mal formées ou vides'
    pv = m.get('annexes_prov')
    if pv is not None:
        # provenance de chaque calibration d'annexe (17/11) : une suite, un commit, une date, un N égal à la somme de SES comptes
        if not isinstance(pv, dict) or any(s not in an or not isinstance(x, dict) or not isinstance(x.get('commit'), str) or x.get('n') != sum(an[s].values()) for s, x in pv.items()):
            return '« annexes_prov » incohérente avec « annexes » (suite inconnue, commit absent ou N ≠ somme des comptes)'
    return None


def charger_manifeste(chemin=MANIFESTE):
    """Le manifeste VALIDE, ou None (absent, illisible, ancienne version, incomplet) : l'inconnu BLOQUE."""
    try:
        with open(chemin, encoding='utf-8') as f:
            m = json.load(f)
        if valider_manifeste(m) is not None:
            return None
        return {'calibre': m['calibre'], 'passe': collections.Counter(m['passe']),
                'annexes': {s: collections.Counter(d) for s, d in (m.get('annexes') or {}).items()}}
    except (OSError, ValueError, KeyError, TypeError):
        return None


def _apparier(E, R):
    """Plus grand appariement entre deux listes de séries de jetons (algorithme des chemins augmentants) : rend le nombre d'appariés."""
    lien = [-1] * len(R)
    def essayer(i, vus):
        for j, r in enumerate(R):
            if j in vus or not _compatibles(E[i], r):
                continue
            vus.add(j)
            if lien[j] < 0 or essayer(lien[j], vus):
                lien[j] = i
                return True
        return False
    return sum(1 for i in range(len(E)) if essayer(i, set()))


def comparer(ids, attendu):
    """(manquants, en_plus) — manquants : {squelette: (attendu, apparié)} ; en_plus : nombre de témoins vus non attendus.
    Les clés portent leurs jetons de date : au sein d'un même squelette, un témoin vu apparie un témoin attendu si chaque jeton concorde par le littéral OU
    par le décalage de jour. Un doublon d'un autre libellé du même squelette (une AUTRE date fixe) n'apparie donc rien : c'est une omission."""
    att, vu = collections.defaultdict(list), collections.defaultdict(list)
    for k, c in attendu.items():
        h, jt = _decouper(k); att[h] += [jt] * c
    for k, c in ids.items():
        h, jt = _decouper(k); vu[h] += [jt] * c
    manquants, apparies = {}, 0
    for h, E in att.items():
        R = vu.get(h, [])
        n = min(len(E), len(R)) if not E[0] and all(not x for x in E) else _apparier(E, R)
        apparies += n
        if n < len(E):
            manquants[h] = (len(E), n)
    return manquants, sum(len(v) for v in vu.values()) - apparies


def conditions(a, manifeste, epreuve=False, fusion=None):
    """Les conditions de LECTURE du journal, sous la forme de lignes « ✅/❌ n° texte » + le verdict.
    `fusion` : pour la passe répartie, le Counter d'identités déjà ramené à l'équivalent séquentiel."""
    ok, sortie = True, []
    t = a['totaux']
    if len(t) == 1:
        sortie.append('  ✅ ① ligne de total unique et ancrée : ════ TOTAL CROISÉ : %d ✅ · %d ❌ ════' % t[0])
        n, k = t[0]
    elif not t:
        sortie.append('  ❌ ① AUCUNE LIGNE DE TOTAL ANCRÉE — la passe n\'a pas fini. NE RIEN CONCLURE.')
        n, k, ok = None, None, False
    else:
        sortie.append('  ❌ ① %d lignes de total ancrées (%s) : un journal n\'en porte qu\'UNE — NE RIEN CONCLURE.' % (len(t), ' ; '.join('%d ✅ · %d ❌' % x for x in t)))
        n, k, ok = None, None, False
    sortie.append('  ·  rouges réels (ancrés en début de ligne) : %d  (à toute indentation, colonne 0 comprise)' % a['rouges'])
    if a['rouges'] != 0:
        ok = False
    if n is not None:
        if a['n_ok'] == n and a['n_ko'] == k and a['rouges'] == k:
            sortie.append('  ✅ ⑥ le journal se recoupe : %d lignes ✅ = N annoncé, %d lignes ❌ = K annoncé' % (a['n_ok'], a['n_ko']))
        else:
            sortie.append('  ❌ ⑥ INCOHÉRENCE : total annoncé %d ✅ · %d ❌, mais le journal porte %d lignes ✅, %d lignes ❌ (%d rouges ancrés) — journal tronqué, fabriqué ou total faux' % (n, k, a['n_ok'], a['n_ko'], a['rouges']))
            ok = False
    if epreuve:
        sortie.append('  ·  ⑦ identités des témoins : NON ÉVALUÉES en mode d\'épreuve (journal rejoué : jamais une preuve de livraison)')
        return ok, sortie
    ids = fusion if fusion is not None else a['ids']
    ok_id, l_id = identites(ids, manifeste)
    return ok and ok_id, sortie + l_id


def identites(ids, manifeste):
    """⑦ — les identités attendues ont-elles TOUTES tourné ? (rend (ok, lignes))."""
    sortie = []
    if manifeste is None:
        sortie.append('  ❌ ⑦ MANIFESTE DES IDENTITÉS ABSENT, illisible ou INVALIDE (%s) : on ne sait pas QUELS témoins devaient tourner — l\'inconnu BLOQUE. → premier lancement : tools/passe_valide.sh --calibrer' % os.path.relpath(MANIFESTE, RACINE))
        return False, sortie
    manquants, en_plus = comparer(ids, manifeste['passe'])
    n_att = sum(manifeste['passe'].values())
    if not manquants:
        sortie.append('  ✅ ⑦ identités : les %d témoins attendus (manifeste du %s) ont tous tourné%s' % (n_att, (manifeste['calibre'] or {}).get('date', '?'), (' ; %d témoin(s) NOUVEAU(X) non encore au manifeste' % en_plus) if en_plus else ''))
        return True, sortie
    manque_tot = sum(c - v for c, v in manquants.values())
    sortie.append('  ❌ ⑦ IDENTITÉS : %d témoin(s) attendu(s) ABSENT(S) ou en moins (%d occurrence(s) manquante(s)), %d témoin(s) en plus — un doublon ne remplace pas une omission' % (len(manquants), manque_tot, en_plus))
    for h, (c, v) in sorted(manquants.items())[:8]:
        sortie.append('       manque %s : attendu %d fois, vu %d fois    (→ python3 tools/temoins.py expliquer %s <journal de référence>)' % (h, c, v, h))
    if len(manquants) > 8:
        sortie.append('       … et %d autre(s)' % (len(manquants) - 8))
    return False, sortie


def _ecrire_atomique(chemin, man):
    """Écrit le manifeste SANS jamais laisser un fichier à moitié écrit ni invalide : fichier temporaire voisin, fsync, validation du CONTENU, puis remplacement."""
    raison = valider_manifeste(man)
    if raison:
        raise SystemExit('⛔ manifeste refusé avant écriture : ' + raison)
    dossier = os.path.dirname(os.path.abspath(chemin))
    os.makedirs(dossier, exist_ok=True)
    fd, tmp = tempfile.mkstemp(prefix='.temoins-', suffix='.tmp', dir=dossier)
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as f:
            json.dump(man, f, ensure_ascii=False, indent=0, sort_keys=False)
            f.write('\n'); f.flush(); os.fsync(f.fileno())
        relu = json.load(open(tmp, encoding='utf-8'))
        if relu != json.loads(json.dumps(man)) or valider_manifeste(relu):
            raise SystemExit('⛔ manifeste relu différent de ce qui devait être écrit : rien n\'est remplacé.')
        os.replace(tmp, chemin)
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)


def lire_repartie(dossier, commit, jour=None):
    """La SOURCE INDÉPENDANTE du calibrage : les journaux d'une passe RÉPARTIE (K processus) du MÊME commit, écrits par passe_repartie.py avec leur provenance
    (`PASSE.json` : commit, K, verdict hors identités, empreinte de chaque journal). Rend (analyses, fusion, meta) ou lève SystemExit avec la cause."""
    try:
        meta = json.load(open(os.path.join(dossier, 'PASSE.json'), encoding='utf-8'))
    except (OSError, ValueError):
        raise SystemExit('⛔ calibrage refusé : %s/PASSE.json absent ou illisible — la source indépendante (passe répartie du même commit) est obligatoire.' % dossier)
    k = meta.get('K')
    if not isinstance(k, int) or k < 2:
        raise SystemExit('⛔ calibrage refusé : la passe répartie de référence doit avoir K ≥ 2 processus (K=%s).' % k)
    if meta.get('commit') != commit:
        raise SystemExit('⛔ calibrage refusé : la passe répartie porte le commit %s, le calibrage porte %s — deux arbres différents ne se recoupent pas.' % (meta.get('commit'), commit))
    if meta.get('verdict_hors_identites') is not True:
        raise SystemExit('⛔ calibrage refusé : la passe répartie de référence n\'a pas été VALIDE (hors identités) — une référence se tire d\'une passe saine.')
    analyses = []
    for i in range(k):
        nom = 'p%d.log' % i
        chemin = os.path.join(dossier, nom)
        try:
            brut = open(chemin, 'rb').read()
        except OSError:
            raise SystemExit('⛔ calibrage refusé : journal %s introuvable.' % chemin)
        if hashlib.sha256(brut).hexdigest() != (meta.get('journaux') or {}).get(nom):
            raise SystemExit('⛔ calibrage refusé : %s ne correspond plus à l\'empreinte consignée dans PASSE.json (journal modifié après la passe).' % nom)
        a = analyser(nettoyer(brut.decode('utf-8', 'replace')), jour)
        ok_i, lignes = conditions(a, None, epreuve=True)
        if not ok_i:
            raise SystemExit('⛔ calibrage refusé : le journal %s de la passe répartie ne se recoupe pas :\n%s' % (nom, '\n'.join(lignes)))
        analyses.append(a)
    fusion, anomalies = fusion_repartie(analyses)
    if anomalies:
        raise SystemExit('⛔ calibrage refusé : la passe répartie est incohérente : ' + ' ; '.join(anomalies))
    return analyses, fusion, meta


def calibrer(texte, chemin=MANIFESTE, commit='', croiser=None, accepter_retraits=False, jour=None):
    """Écrit le manifeste. ⛔ DEUX SOURCES INDÉPENDANTES OU RIEN (défaut 3 de la contre-expertise : un runner qui omettait un témoin ET ajustait son total passait
    le calibrage, car la référence était déduite du SEUL journal qu'elle devait certifier). La passe séquentielle (`texte`) et la passe RÉPARTIE du même commit
    (`croiser` : dossier de ses journaux) sont deux exécutions différentes ; leurs identités doivent être EXACTEMENT les mêmes. Un témoin omis dans l'une seulement ne
    passe plus. ⚠️ Limite écrite : un témoin retiré du CODE disparaît des deux passes — il se voit dans le diff du manifeste (jamais écrasé en silence : tout retrait
    exige `accepter_retraits`)."""
    jour = jour_passe(jour)
    a = analyser(texte, jour)
    if len(a['totaux']) != 1 or a['totaux'][0][1] != 0 or a['n_ok'] != a['totaux'][0][0] or a['rouges'] != 0:
        raise SystemExit('⛔ calibrage refusé : le journal n\'est pas une passe ENTIÈREMENT verte et cohérente (total unique, 0 rouge, lignes = total).')
    if not commit:
        raise SystemExit('⛔ calibrage refusé : aucun commit : sans provenance, pas de référence.')
    if not croiser:
        raise SystemExit('⛔ calibrage refusé : aucune SOURCE INDÉPENDANTE. Une référence déduite du seul journal à certifier ne détecte pas un témoin omis dont le total a été ajusté. '
                         'Fournir le dossier d\'une passe répartie du même commit : --croiser <dossier> (journaux écrits par tools/passe_repartie.py).')
    analyses, fusion, meta = lire_repartie(croiser, commit, jour)
    m1, p1 = comparer(a['ids'], fusion)          # ce que la passe répartie a joué et que la séquentielle n'a pas joué
    m2, p2 = comparer(fusion, a['ids'])          # et inversement
    if m1 or m2 or p1 or p2:
        msg = ['⛔ calibrage refusé : les deux exécutions ne jouent pas les mêmes témoins (séquentielle %d, répartie ramenée à l\'équivalent séquentiel %d) :' % (sum(a['ids'].values()), sum(fusion.values()))]
        msg.append('   · joués par la répartie seulement : %d identité(s), %d occurrence(s) en trop côté séquentiel' % (len(m1), p1))
        msg.append('   · joués par la séquentielle seulement : %d identité(s), %d occurrence(s) en trop côté répartie' % (len(m2), p2))
        for h in sorted(set(m1) | set(m2))[:8]:
            msg.append('       %s  (→ python3 tools/temoins.py expliquer %s <journal>)' % (h, h))
        raise SystemExit('\n'.join(msg))
    anciens, retires = {}, {}
    ancien = None
    if os.path.exists(chemin):
        try:
            brut = json.load(open(chemin, encoding='utf-8'))
            ancien = brut
            anciens = (brut.get('annexes') or {}) if valider_manifeste(brut) is None else {}
        except (OSError, ValueError):
            pass
    if ancien is not None and valider_manifeste(ancien) is None:
        manq, _ = comparer(a['ids'], collections.Counter(ancien['passe']))
        retires = manq
        if retires and not accepter_retraits:
            raise SystemExit('⛔ calibrage refusé : %d identité(s) du manifeste précédent ne sont plus jouées (%d occurrence(s)). Retirer ou renommer un témoin est une décision '
                             '(R30) : la justifier, puis relancer avec --accepter-retraits. Voir : python3 tools/temoins.py expliquer <empreinte> <ancien journal>.'
                             % (len(retires), sum(c - v for c, v in retires.values())))
    man = {'_lisez_moi': ('Identités attendues d\'une passe D-031 COMPLÈTE : clé = empreinte (sha-256 tronqué à 12) du libellé SANS ses dates, suivie de ses jetons de date « littéral~décalage en jours » → '
                          'nombre d\'occurrences. Écrit par `tools/passe_valide.sh --calibrer --croiser <passe répartie du même commit>` ; lu par passe_valide.sh, passe_repartie.py. '
                          'Un témoin absent ou moins fréquent = passe NON VALIDE ; un témoin en plus = signalé. Retirer ou renommer un témoin s\'écrit (R30). Voir tools/temoins.py.'),
           'version': VERSION_MANIFESTE,
           'calibre': {'commit': commit, 'date': datetime.date.today().isoformat(), 'jour': jour.isoformat(), 'n': a['totaux'][0][0],
                       'mode': 'croisé : séquentielle + répartie (K=%d)' % meta['K'], 'sources': {'repartie': meta.get('journaux')}},
           'passe': dict(sorted(a['ids'].items())), 'annexes': anciens}
    _ecrire_atomique(chemin, man)
    man['_retires'] = retires
    return man


def calibrer_annexe(suite, ids, chemin=MANIFESTE, commit='', accepter_retraits=False):
    """Écrit (ou remplace) les identités d'UNE suite annexe en préservant tout le reste. ⛔ Elle ne CRÉE JAMAIS le manifeste principal et ne le répare pas :
    sans manifeste principal VALIDE, elle refuse (défaut 4 : une annexe calibrée seule fabriquait un manifeste « passe » vide, ensuite pris pour une référence).
    ⛔ ET ELLE NE SUPPRIME RIEN SANS ACCORD (contre-expertise ciblée du 17/11, `QA-retrait-annexe`) : remplacer le référentiel d'une suite par un ensemble qui LUI RETIRE des identités est refusé, avec un diff lisible
    (identité, attendu / vu), sauf `accepter_retraits` (un retrait de témoin est une décision, R30). Chaque calibration laisse sa PROVENANCE (`annexes_prov` : commit, date, N, retraits acceptés, commit du manifeste principal)."""
    try:
        man = json.load(open(chemin, encoding='utf-8'))
    except (OSError, ValueError):
        raise SystemExit('⛔ calibrage annexe refusé : le manifeste principal %s est absent ou illisible — une suite annexe ne le crée pas.' % chemin)
    raison = valider_manifeste(man)
    if raison:
        raise SystemExit('⛔ calibrage annexe refusé : le manifeste principal est invalide (%s) — le calibrer d\'abord (tools/passe_valide.sh --calibrer).' % raison)
    if not _compteurs_valides(dict(ids)):
        raise SystemExit('⛔ calibrage annexe refusé : aucune identité valide pour « %s ».' % suite)
    ancien = (man.get('annexes') or {}).get(suite)
    retires = {}
    if ancien:
        retires, _ = comparer(collections.Counter(ids), collections.Counter(ancien))
        if retires and not accepter_retraits:
            lignes = ['⛔ calibrage annexe refusé : le nouveau référentiel de « %s » RETIRE %d identité(s) du précédent (%d occurrence(s)) — un retrait de témoin est une décision (R30), jamais un effet de bord :' % (suite, len(retires), sum(a - v for a, v in retires.values()))]
            for h in sorted(retires)[:10]:
                lignes.append('       retiré : %s — attendu %d fois, vu %d fois    (→ python3 tools/temoins.py expliquer %s <ancien journal de la suite>)' % (h, retires[h][0], retires[h][1], h))
            if len(retires) > 10:
                lignes.append('       … et %d autre(s)' % (len(retires) - 10))
            lignes.append('   Si le retrait est voulu et justifié : relancer avec --accepter-retraits (le diff du manifeste sera relu avant commit).')
            raise SystemExit('\n'.join(lignes))
    man.setdefault('annexes', {})[suite] = dict(sorted(ids.items()))
    man.setdefault('annexes_prov', {})[suite] = {'commit': commit or '', 'date': datetime.date.today().isoformat(), 'n': sum(ids.values()),
                                                 'retraits_acceptes': sum(a - v for a, v in retires.values()), 'commit_principal': (man.get('calibre') or {}).get('commit')}
    _ecrire_atomique(chemin, man)


def fusion_repartie(analyses):
    """K journaux de la passe répartie → l'équivalent SÉQUENTIEL : l'infrastructure du garde (D031S-I/II) est jouée dans CHAQUE processus, donc comptée une seule
    fois (on retire (K−1) × ses témoins). Rend (Counter d'identités, [anomalies])."""
    k = len(analyses)
    total = collections.Counter()
    for a in analyses:
        total.update(a['ids'])
    infra = [collections.Counter({cle(l, a['jour']): c for l, c in a['libelles'].items() if RE_INFRA.match(l)}) for a in analyses]
    anomalies = []
    for i, x in enumerate(infra[1:], 1):
        if x != infra[0]:
            anomalies.append('p%d ne porte pas les mêmes témoins d\'infrastructure que p0' % i)
    for h, c in infra[0].items():
        total[h] -= c * (k - 1)
    return +total, anomalies


def _cli(argv):
    if len(argv) < 3:
        print(__doc__); return 2
    cmd, journal = argv[1], argv[2]
    opts = argv[3:]
    man = MANIFESTE
    if '--manifeste' in opts:
        man = opts[opts.index('--manifeste') + 1]
    jour = opts[opts.index('--jour') + 1] if '--jour' in opts else None
    if cmd == 'controler':
        a = analyser(lire(journal), jour)
        ok, lignes = conditions(a, charger_manifeste(man), epreuve='--epreuve' in opts)
        print('\n'.join(lignes))
        return 0 if ok else 1
    if cmd == 'calibrer':
        commit = opts[opts.index('--commit') + 1] if '--commit' in opts else ''
        croiser = opts[opts.index('--croiser') + 1] if '--croiser' in opts else None
        avant = charger_manifeste(man)
        m = calibrer(lire(journal), man, commit, croiser=croiser, accepter_retraits='--accepter-retraits' in opts, jour=jour)
        print('✅ manifeste écrit : %s (%d témoins, %d identités ; sources croisées : séquentielle + répartie) — à RELIRE (git diff) puis à committer' % (man, m['calibre']['n'], len(m['passe'])))
        if avant:   # ce que le calibrage CHANGE : un témoin retiré ou renommé est une décision, pas un détail (R30)
            nouveau = collections.Counter(m['passe'])
            ajoutes = max(0, sum(nouveau.values()) - sum(avant['passe'].values()) + sum(c - v for c, v in m['_retires'].values()))
            print('   · par rapport au manifeste précédent : %d témoin(s) AJOUTÉ(S), %d identité(s) RETIRÉE(S) ou en moins (%d occurrence(s)) — chaque retrait est à justifier'
                  % (ajoutes, len(m['_retires']), sum(c - v for c, v in m['_retires'].values())))
            for h in sorted(m['_retires'])[:10]:
                print('       retiré : %s    (→ python3 tools/temoins.py expliquer %s <ancien journal>)' % (h, h))
        return 0
    if cmd == 'expliquer':
        h, ref = argv[2], argv[3]
        for lib in analyser(lire(ref), jour)['libelles']:
            if empreinte(lib, jour) == h:
                print(lib)
                return 0
        print('empreinte %s introuvable dans %s' % (h, ref)); return 1
    print(__doc__); return 2


if __name__ == '__main__':
    sys.exit(_cli(sys.argv))
