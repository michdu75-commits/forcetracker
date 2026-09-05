#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
📊 L'INVENTAIRE DES DONNÉES — « qu'est-ce que l'app enregistre, et qu'en fait-elle ? »

Demandé par Michel le 05/09/2026 : *« fais-moi un check de tout ce que l'on marque dans
l'application, et tout ce qui est suivi et enregistré, on va passer aux choses sérieuses »*.

⚠️ POURQUOI C'EST UN SCRIPT ET PAS UN DOCUMENT ÉCRIT À LA MAIN.
C'est **R27** appliqué : un inventaire écrit à la main redevient faux en trois semaines, et
personne ne s'en aperçoit — c'est exactement ce qui est arrivé à `docs/INVENTAIRE.md` avant
qu'il soit généré. Ici la source de vérité est le CODE ; ce fichier ne fait que le lire.

⛔ CE QU'IL RÉPOND, ET QUE RIEN D'AUTRE NE RÉPONDAIT :
  · la donnée est-elle **DATÉE** (une série avec un historique) ou juste une valeur écrasée ?
  · **survit-elle** à un changement de téléphone (cloud + restauration) ?
  · **Milo la reçoit-il** ?
Les trois questions sont indépendantes, et c'est le croisement qui est utile : une donnée
*datée* mais *non sauvegardée* est un historique qui disparaîtra sans prévenir.

Lancer : python3 tools/donnees.py
"""
import re, io, os, json, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def lire(f):
    p = os.path.join(ROOT, f)
    return io.open(p, encoding='utf-8').read() if os.path.exists(p) else ''

STATE  = lire('state.js')
SETUP  = lire('setup.js')
CODEJS = lire('Code.js')
CLASSE = json.loads(lire('tests/donnees/donnees-milo.json'))

TRANSMIS = set(CLASSE['transmis'])
EXCLU    = CLASSE['exclu']
MANQUANT = CLASSE['manquant']
TOUS     = sorted(TRANSMIS | set(EXCLU) | set(MANQUANT))

# ── Où la donnée vit dans le téléphone (la clé localStorage) ────────────────────────────
def cle_locale(k):
    m = re.search(r'S\.' + re.escape(k) + r'\s*=\s*_?ls\w*\(\s*[\'"](ft4_\w+)[\'"]', STATE)
    if m: return m.group(1)
    m = re.search(r'localStorage\.setItem\(\s*[\'"](ft4_\w+)[\'"]\s*,\s*JSON\.stringify\(\s*S\.' + re.escape(k), STATE)
    if m: return m.group(1)
    m = re.search(r'localStorage\.setItem\(\s*[\'"](ft4_\w+)[\'"]\s*,\s*S\.' + re.escape(k), STATE)
    if m: return m.group(1)
    return ''

# ── Est-ce une SÉRIE (un historique daté) ou une valeur unique ? ────────────────────────
# ⛔ On ne devine pas sur le nom : on regarde si la donnée est initialisée comme un TABLEAU,
#    puis si le code qui l'alimente écrit un champ de date (`d:` ou `date:`).
def est_serie(k):
    e = re.escape(k)
    tableau = bool(re.search(r'S\.' + e + r'\s*=\s*(?:_lsJson\([^)]*\[\]\s*\)|\[\])', STATE)) \
           or bool(re.search(r'^\s*' + e + r'\s*:\s*\[\]', STATE, re.M))
    return tableau

_CORPUS = None
def _corpus():
    global _CORPUS
    if _CORPUS is None:
        _CORPUS = STATE + lire('tracking.js') + lire('log.js') + lire('app.js') + lire('screens.js') + SETUP + lire('coach.js')
    return _CORPUS

_DATE_CHAMP = r"\b(?:d|date|day)\s*:"

def est_datee(k):
    """Une série est DATÉE si ses ENTRÉES portent un jour.

    ⚠️⚠️ MA PREMIÈRE VERSION NE MORDAIT PAS, ET ELLE ANNONÇAIT « 0 historique daté hors
    sauvegarde » — c'est-à-dire *exactement la bonne nouvelle qu'on espérait lire*, alors que
    `mensLog` était dans ce cas. Elle ne regardait que les insertions d'un OBJET LITTÉRAL
    (`push({date:…})`) ; or la moitié du projet construit l'entrée dans une variable d'abord
    (`push(entree)`, `push(sess)`, `push(entry)`). *Un détecteur qui ne trouve rien ressemble
    à un projet sans problème* — c'est le vert qui ne peut pas rougir de `BUGS.md`.

    Trois signaux, dans l'ordre du plus sûr au plus indirect :
      ① l'insertion porte un littéral daté ;
      ② l'insertion porte une VARIABLE, et cette variable est construite juste avant avec un jour ;
      ③ la série est RELUE par jour quelque part (`e.d===`, `w.date>=`…) — si du code trie ou
         filtre ces entrées par date, c'est qu'elles en ont une.
    """
    if not est_serie(k): return False
    c, e = _corpus(), re.escape(k)
    for m in re.finditer(r'S\.' + e + r'\.(?:push|unshift)\(\s*([A-Za-z_$][\w$]*|\{)', c):
        jeton = m.group(1)
        if jeton == '{':                                    # ① littéral
            if re.search(_DATE_CHAMP, c[m.end():m.end()+400]): return True
            continue
        # ② variable : on cherche sa construction dans les 1200 caractères qui précèdent
        avant = c[max(0, m.start()-1200):m.start()]
        d = re.search(r'\b(?:const|let|var)\s+' + re.escape(jeton) + r'\s*=\s*\{([^;]{0,400})', avant)
        if d and re.search(_DATE_CHAMP, d.group(1)): return True
    # ③ la série est lue PAR JOUR ailleurs dans le code
    if re.search(r'S\.' + e + r'[^;\n]{0,120}\b\w+\.(?:d|date)\b', c): return True
    return False

# ── Survit-elle à un changement de téléphone ? ──────────────────────────────────────────
# ⚠️⚠️ MES DEUX PREMIERS DÉTECTEURS ONT CRIÉ AU LOUP, ET C'EST PIRE QU'UN OUBLI.
# Ils marquaient `weightLog`, `sleepLog` et `goalLog` « envoyée, jamais relue » — alors que
# `_applyRestoreData` les repose bel et bien (`setup.js`, `S.weightLog=weightLog`). Ma règle
# n'acceptait que `S.x = d.x` / `raw.x` / `srv.x`, or la restauration extrait d'abord dans des
# VARIABLES LOCALES avant de reposer. *Un inventaire qui annonce une perte de données là où il
# n'y en a pas fait perdre confiance dans tous ses autres chiffres.*
# 👉 On borne désormais la recherche à la FONCTION de restauration, et on y accepte n'importe
#    quelle écriture `S.<donnée> =`. C'est plus large, mais c'est le bon périmètre : tout ce
#    qui s'écrit là-dedans vient du serveur, par construction.
def _bloc_fonction(src, nom):
    """Le corps d'une fonction, par comptage d'accolades — pas une fenêtre de N caractères."""
    m = re.search(r'function\s+' + re.escape(nom) + r'\s*\([^)]*\)\s*\{', src)
    if not m: return ''
    i, prof = m.end(), 1
    while i < len(src) and prof:
        if src[i] == '{': prof += 1
        elif src[i] == '}': prof -= 1
        i += 1
    return src[m.end():i]

_RESTORE = None
def _restore_src():
    global _RESTORE
    if _RESTORE is None:
        _RESTORE = _bloc_fonction(SETUP, '_applyRestoreData')
        if not _RESTORE:
            sys.stderr.write("⛔ `_applyRestoreData` INTROUVABLE — la colonne « survit » ne "
                             "mesurerait plus rien. Renommée ? Corriger tools/donnees.py.\n")
            sys.exit(2)
    return _RESTORE

_SYNC = None
def _sync_src():
    """Le corps de `_cloudSync` : le seul endroit qui décide ce qui part au serveur."""
    global _SYNC
    if _SYNC is None:
        _SYNC = _bloc_fonction(SETUP, '_cloudSync')
        if not _SYNC:
            sys.stderr.write("⛔ `_cloudSync` INTROUVABLE — corriger tools/donnees.py.\n")
            sys.exit(2)
    return _SYNC

def envoyee(k):
    """Envoyée = citée comme valeur dans le payload de `_cloudSync`, quelle que soit la forme
       (`k:S.k`, `k:(S.k||[]).slice(...)`, `k:S.histTronque?undefined:...`)."""
    e = re.escape(k)
    return bool(re.search(r'\b' + e + r'\s*:[^,\n]{0,120}S\.' + e, _sync_src()))

def restauree(k):
    e = re.escape(k)
    return bool(re.search(r'S\.' + e + r'\s*=', _restore_src()))
def connue_backend(k):
    return k in CODEJS

def statut_milo(k):
    if k in MANQUANT: return '⚠️ trou connu'
    if k in TRANSMIS: return '✅ oui'
    return '—'

def relue_ailleurs(k):
    """⚠️ TOUT NE PASSE PAS PAR `_cloudSync`, et l'ignorer fabrique une 2ᵉ fausse alerte.
       `healthDaily` (le raccourci iOS) est POUSSÉ au serveur par une autre route et relu
       dans `app.js` (`S.healthDaily=d2.healthDaily`). Il est donc parfaitement sauvegardé —
       le marquer « serveur seulement » avec un ⚠️ laisserait croire à un risque inexistant."""
    e = re.escape(k)
    corpus = lire('app.js') + lire('screens.js') + lire('tracking.js') + lire('coach.js')
    return bool(re.search(r'S\.' + e + r'\s*=\s*\w+\.' + e, corpus))

def statut_survie(k):
    env, res, back = envoyee(k), restauree(k), connue_backend(k)
    if env and res: return '✅ oui'
    if back and relue_ailleurs(k): return '✅ oui (autre route)'
    if env and not res: return '⚠️ envoyée, jamais relue'
    if back: return '⚠️ côté serveur seulement'
    return '⛔ NON — locale'

lignes = []
for k in TOUS:
    lignes.append({
        'nom': k,
        'cle': cle_locale(k),
        'forme': 'série datée' if est_datee(k) else ('série' if est_serie(k) else 'valeur'),
        'survie': statut_survie(k),
        'milo': statut_milo(k),
        'raison': (EXCLU.get(k) or MANQUANT.get(k) or '')
    })

perdues = [l for l in lignes if l['survie'].startswith('⛔')]
perdues_datees = [l for l in perdues if l['forme'] == 'série datée']
series = [l for l in lignes if l['forme'].startswith('série')]

out = []
w = out.append
w('# 📊 Inventaire des DONNÉES — ce que l\'app enregistre, et ce qu\'elle en fait\n')
w('> ⚙️ **GÉNÉRÉ depuis le code** par `python3 tools/donnees.py` — ne pas éditer à la main.')
w('> Un inventaire écrit à la main redevient faux en trois semaines et personne ne le voit (**R27**).')
w('> Demandé par Michel le 05/09/2026 : *« un check de tout ce que l\'on marque dans l\'application,')
w('> et tout ce qui est suivi et enregistré »*.\n')
w('## Comment lire ce tableau\n')
w('Les trois colonnes répondent à **trois questions indépendantes**, et c\'est leur croisement')
w('qui est utile :\n')
w('| Colonne | La question |')
w('|---|---|')
w('| **Forme** | est-ce un **historique daté** (on peut tracer une courbe) ou une **valeur écrasée** (seul le dernier état existe) ? |')
w('| **Survit au changement de téléphone** | est-elle envoyée au cloud **ET** relue à la restauration ? |')
w('| **Milo la reçoit** | atterrit-elle dans le contexte du coach ? (source : `tests/donnees/donnees-milo.json`, vérifié à chaque livraison) |\n')
w('⛔ **Le croisement qui fait mal** : une donnée **datée** mais **non sauvegardée** est un')
w('historique qui disparaîtra sans prévenir, le jour d\'un changement de téléphone ou d\'un')
w('vidage de navigateur. C\'est la règle d\'or #3 appliquée ailleurs que sur une séance.\n')
w('---\n')
w('## ⚠️ CE QUI SE PERDRAIT AUJOURD\'HUI (à lire en premier)\n')
w('**%d données sur %d ne quittent jamais le téléphone.** La plupart sont des réglages ou de' % (len(perdues), len(lignes)))
w('l\'état passager, et c\'est très bien. Celles qui posent problème sont les **historiques** :\n')
if perdues_datees:
    # ⛔ PAS de colonne « ce que c'est » : la seule source disponible est la RAISON
    #    D'EXCLUSION de `donnees-milo.json`, qui est vide justement pour les données
    #    TRANSMISES — donc elle serait vide PILE pour les deux lignes qui comptent.
    #    Une colonne vide fait croire qu'on n'a rien à dire ; la clé locale est vérifiable.
    w('| Donnée | Clé sur le téléphone | Milo la reçoit |')
    w('|---|---|---|')
    for l in perdues_datees:
        w('| **`%s`** | `%s` | %s |' % (l['nom'], l['cle'] or '—', l['milo']))
else:
    w('*Aucun historique daté n\'est aujourd\'hui hors sauvegarde.*')
w('')
w('Les autres pertes possibles (séries non datées et valeurs) :')
w('`' + '` · `'.join(l['nom'] for l in perdues if l['forme'] != 'série datée') + '`\n')
w('---\n')
w('## 📈 LES HISTORIQUES (%d séries)\n' % len(series))
w('Ce sont eux qui portent la mémoire du produit — *« tu ne repars jamais de zéro »*.\n')
w('| Donnée | Forme | Clé locale | Survit | Milo |')
w('|---|---|---|---|---|')
for l in series:
    w('| **`%s`** | %s | `%s` | %s | %s |' % (l['nom'], l['forme'], l['cle'] or '—', l['survie'], l['milo']))
w('')
w('---\n')
w('## 📋 TOUT (%d données)\n' % len(lignes))
w('| Donnée | Forme | Clé locale | Survit | Milo |')
w('|---|---|---|---|---|')
for l in lignes:
    w('| `%s` | %s | `%s` | %s | %s |' % (l['nom'], l['forme'], l['cle'] or '—', l['survie'], l['milo']))
w('')
w('---\n')
w('## 🔢 Le compte\n')
w('- **%d données** suivies au total' % len(lignes))
w('- **%d historiques** (dont **%d datés**)' % (len(series), len([l for l in series if l['forme'] == 'série datée'])))
w('- **%d** survivent à un changement de téléphone · **%d** ne le survivraient pas' %
  (len([l for l in lignes if l['survie'].startswith('✅')]), len(perdues)))
w('- **%d** atteignent Milo · **%d** en sont exclues **avec leur raison écrite** · **%d trous connus**' %
  (len(TRANSMIS), len(EXCLU), len(MANQUANT)))
w('')
w('⛔ **Aucune donnée n\'est « non classée »** : `tests/donnees/runner.js` fait échouer la')
w('livraison si une donnée nouvelle n\'a pas été rangée. *On ne peut plus oublier — on peut')
w('seulement décider* (**R4a**).')

dest = os.path.join(ROOT, 'docs', 'INVENTAIRE-DONNEES.md')
io.open(dest, 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print('✅ docs/INVENTAIRE-DONNEES.md régénéré')
print('   %d données · %d historiques (%d datés) · %d hors sauvegarde (dont %d datés)' %
      (len(lignes), len(series), len([l for l in series if l['forme'] == 'série datée']),
       len(perdues), len(perdues_datees)))
if perdues_datees:
    print('   ⚠️ historiques datés NON sauvegardés : ' + ', '.join(l['nom'] for l in perdues_datees))
