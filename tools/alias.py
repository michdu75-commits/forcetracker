#!/usr/bin/env python3
"""
🥗 CONVERTIT LA TABLE D'ALIAS ALIMENTAIRES EN `data/alias.json`.

Michel : *« il faut que je puisse trouver les noms comme big Mac ou pizza 4 fromages »* pour le
fast-food (ft-v1114) — et, le même jour, pour les aliments courants : quelqu'un tape
« tortiglioni », « sticky rice » ou « riz jasmin », et l'app ne rend RIEN alors que l'aliment
générique est dans le téléphone.

La table vient de **GPT**, construite sur l'export CSV de notre propre base (le rapport d'audit du
03/09). ⭐⭐ ELLE NE CRÉE AUCUNE VALEUR NUTRITIONNELLE : un alias est une **porte** vers un code
CIQUAL existant, jamais une fiche. Vérifié ligne à ligne à l'import — voir les garde-fous.

⛔⛔ LES CINQ GARDE-FOUS, ET CHACUN A ATTRAPÉ QUELQUE CHOSE OU PEUT LE FAIRE :
  ① le code doit EXISTER dans `data/ciqual.json` ;
  ② les 4 macros doivent être IDENTIQUES aux nôtres — c'est ce qui prouve qu'aucune valeur n'a
     été réécrite en chemin (mesuré à l'import de la V2 : 0 écart sur 569 lignes) ;
  ③ ⚠️ LA CIBLE DOIT ÊTRE PROPOSABLE (kcal non `null`). **Ce contrôle a attrapé une vraie erreur** :
     `tomate` visait `20189 · Tomate, séchée`, dont les calories sont « non déterminées » dans
     CIQUAL — l'app ne peut JAMAIS la proposer. *Un alias qui ouvre une porte fermée est pire
     qu'un alias absent : la personne croit avoir cherché.*
  ④ un alias ne doit PAS être déjà dans `FOOD_SYNONYMES` (R2 : une information, un propriétaire).
     Les deux tables répondent à deux questions différentes — « traduire les mots tapés »
     (query → query, les familles et les marques) et « ce mot EST cet aliment » (query → code) —
     mais un même mot ne peut pas relever des deux ;
  ⑤ les lignes `HORS_CIQUAL` (sans code) sont ÉCARTÉES et LISTÉES : ce sont de vrais trous de la
     table nationale (whey, créatine, naan…), pas des erreurs. On les nomme au lieu de les taire.

⭐ POURQUOI UN CODE ET NON UNE REQUÊTE. `FOOD_SYNONYMES` (ft-v1113) traduit une frappe en une autre
frappe, puis laisse la recherche classer. Ça marche pour ouvrir une FAMILLE (« mcdo »), pas pour
désigner UN aliment : le classement trie par longueur de nom, et c'est ainsi que « steak haché
15 % » remonte du **veau** avant le **bœuf**. Un alias qui porte le CODE ne subit aucun classement.

⛔ LES CORRECTIONS APPORTÉES À LA TABLE sont ci-dessous, nommées, avec leur raison. Elles ne sont
pas silencieuses : le script les imprime à chaque exécution.

Usage : python3 tools/alias.py <fichier.xlsx>   → écrit data/alias.json
"""
import sys, json, re, os, unicodedata

# ⛔ CORRECTIONS EXPLICITES DE LA TABLE FOURNIE — chacune avec sa raison, jamais en silence.
#    On ne « répare » que ce qui est démontrablement faux, et on l'écrit (R30).
CORRECTIONS = {
    # `tomate` visait 20189 « Tomate, séchée » : kcal non déterminées → jamais proposable, et une
    # tomate n'est pas une tomate séchée. CIQUAL porte l'aliment moyen, c'est sa convention même
    # pour un mot générique — on ne choisit pas une variété à la place de la personne (R29).
    'tomate':  (20385, 'GPT visait « Tomate, séchée » (kcal non déterminées, jamais proposable)'),
    'tomates': (20385, 'idem'),
}

# ⛔ AJOUTS QUI NE VIENNENT PAS DU CLASSEUR — nommés, avec leur raison, jamais silencieux.
#    ⚠️ ILS VIVENT ICI ET NON DANS `data/alias.json` : ce fichier est GÉNÉRÉ, donc une retouche
#    à la main y disparaîtrait à la prochaine exécution, sans bruit (R27 : ce qui est généré ne
#    s'édite pas à la main).
AJOUTS = {
    # 🥤 LE CAS QUI LES A FAIT NAÎTRE (03/09/2026, ft-v1116) — signalé par Michel en notant son
    #    repas. `coca zéro` rendait « Cola, SUCRÉ, avec édulcorants » (18037, **24 kcal/100 g**)
    #    AVANT « Cola, SANS SUCRES AJOUTÉS, avec édulcorants » (18060, **1 kcal/100 g**).
    #    ⛔⛔ Sur une canette de 50 cl : **120 kcal enregistrées au lieu de 5**.
    #    👉 Cause : `zero`/`light` sont traduits en « édulcorants », et les DEUX lignes portent ce
    #    mot ; c'est alors le tri par NOM LE PLUS COURT qui tranche — et il tranche mal.
    #    *Un mot traduit désigne une famille, pas un aliment : quand la famille contient le
    #    contraire de ce qu'on cherche, il faut le code.*
    #    ⚠️ On ne retire PAS 18037 : c'est le bon aliment pour un cola sucré aux édulcorants
    #    (type stévia). On l'empêche seulement de répondre à la place du zéro.
    'coca zero':      (18060, 'rendait « Cola, sucré, avec édulcorants » (24 kcal/100 g) — 120 kcal au lieu de 5 sur 50 cl'),
    'coca light':     (18060, 'idem'),
    'coke zero':      (18060, 'idem'),
    'coke light':     (18060, 'idem'),
    'cola zero':      (18060, 'idem'),
    'cola light':     (18060, 'idem'),
    'coca sans sucre':(18060, 'rendait « Cola, sucré, SANS CAFÉINE » (41 kcal/100 g) — encore pire'),
    'cola sans sucre':(18060, 'idem'),
    'pepsi max':      (18060, 'même famille : un cola sans sucres ajoutés, aux édulcorants'),
    'pepsi zero':     (18060, 'idem'),
    'pepsi light':    (18060, 'idem'),
    # ⛔ Et la variante sans caféine a SA propre entrée dans la table nationale : on ne la
    #    confond pas avec la précédente, elles ne portent pas les mêmes valeurs.
    'coca zero sans cafeine': (18068, 'CIQUAL distingue la version sans caféine — on ne fusionne pas'),
    'coca sans cafeine':      (18067, 'le cola sucré sans caféine, qui existe aussi'),
}

def norm(t):
    """La MÊME normalisation que `_afNorm` dans app.js — sinon la clé ne serait jamais trouvée."""
    t = str(t or '').lower()
    t = unicodedata.normalize('NFD', t)
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn')
    t = t.replace('œ', 'oe').replace('æ', 'ae')
    return re.sub(r"['’‘`´ʼ]", '', t).strip()

def synonymes_existants(app_js):
    """Les clés de FOOD_SYNONYMES, pour interdire qu'un mot relève des deux tables (R2)."""
    s = open(app_js, encoding='utf-8').read()
    i = s.find('const FOOD_SYNONYMES')
    if i < 0: return set()
    bloc = s[i:s.index('\n};', i)]
    bloc = re.sub(r'/\*.*?\*/', '', bloc, flags=re.S)
    return {norm(m) for m in re.findall(r"'([^']+)'\s*:", bloc)}

def main(src):
    import openpyxl
    ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ciq = json.load(open(os.path.join(ROOT, 'data', 'ciqual.json'), encoding='utf-8'))
    base = {a[0]: a for a in ciq['a']}
    deja = synonymes_existants(os.path.join(ROOT, 'app.js'))

    wb = openpyxl.load_workbook(src, read_only=True, data_only=True)
    lignes = []
    for feuille in wb.sheetnames:
        ws = wb[feuille]
        it = ws.iter_rows(values_only=True)
        try: cols = next(it)
        except StopIteration: continue
        if not cols or 'alias' not in [str(c) for c in cols]: continue
        if 'code_ciqual' not in [str(c) for c in cols]: continue
        if 'libellé_CIQUAL' not in [str(c) for c in cols]: continue   # feuille d'import allégée
        for r in it:
            if r and r[0]: lignes.append(dict(zip(cols, r)))

    out, vus = {}, {}
    rej = {'hors_ciqual': [], 'inconnu': [], 'non_proposable': [], 'macro': [],
           'collision': [], 'doublon': [], 'court': []}
    corrigees, ajoutees = [], []

    for l in lignes:
        a = norm(l['alias'])
        if len(a) < 3:                    rej['court'].append(l['alias']); continue
        if a in deja:                     rej['collision'].append(l['alias']); continue

        code, raison = l.get('code_ciqual'), None
        if a in CORRECTIONS:
            code, raison = CORRECTIONS[a][0], CORRECTIONS[a][1]
        try: code = int(code)
        except (TypeError, ValueError):
            rej['hors_ciqual'].append((l['alias'], l.get('cible_affichée'))); continue

        e = base.get(code)
        if not e:                         rej['inconnu'].append((l['alias'], code)); continue
        # ③ la cible doit pouvoir être PROPOSÉE : sans calories, la ligne ne peut pas être notée.
        if e[3] is None:                  rej['non_proposable'].append((l['alias'], code, e[1])); continue

        # ② aucune valeur n'a été réécrite en chemin (sauté pour une correction : la ligne du
        #    classeur décrit alors un AUTRE aliment, c'est justement pour ça qu'on la corrige).
        if raison is None:
            ecart = False
            for cle, idx in (('kcal_100g', 3), ('prot_100g', 4), ('glucides_100g', 5), ('lipides_100g', 6)):
                v = l.get(cle)
                try: v = float(str(v).replace(',', '.'))
                except (TypeError, ValueError): v = None
                n = e[idx]
                if (v is None) != (n is None) or (v is not None and n is not None and abs(v - n) > 0.001):
                    ecart = True
            if ecart:                     rej['macro'].append((l['alias'], code)); continue
        else:
            corrigees.append((l['alias'], code, e[1], raison))

        if a in vus:
            # ⛔ deux cibles pour le même mot tapé = ambiguïté : on refuse les DEUX, on ne
            #    tranche pas au hasard (R29). Un doublon à l'identique, lui, est inoffensif.
            if vus[a] != code: rej['doublon'].append((l['alias'], vus[a], code)); out.pop(a, None)
            continue
        vus[a] = code
        out[a] = code

    # ⛔ LES AJOUTS PASSENT LES MÊMES GARDE-FOUS QUE LE CLASSEUR — sinon ils seraient une porte
    #    dérobée par laquelle une cible morte pourrait entrer.
    for a0, (code, raison) in AJOUTS.items():
        a = norm(a0)
        if a in deja:   rej['collision'].append(a0); continue
        e = base.get(code)
        if not e:       rej['inconnu'].append((a0, code)); continue
        if e[3] is None: rej['non_proposable'].append((a0, code, e[1])); continue
        if a in vus and vus[a] != code:
            rej['doublon'].append((a0, vus[a], code)); out.pop(a, None); continue
        vus[a] = code; out[a] = code
        ajoutees.append((a0, code, e[1], raison))

    dst = os.path.join(ROOT, 'data', 'alias.json')
    with open(dst, 'w', encoding='utf-8') as f:
        json.dump({'source': 'Alias FR → codes Ciqual 2025 (ANSES) — aucune valeur nutritionnelle créée',
                   'n': len(out), 'a': out}, f, ensure_ascii=False, separators=(',', ':'), sort_keys=True)

    ko = os.path.getsize(dst) / 1024
    import gzip as _gz
    kz = len(_gz.compress(open(dst, 'rb').read())) / 1024
    print(f'{len(out)} alias → {dst} ({ko:.0f} Ko · {kz:.0f} Ko gzippé)')
    if ajoutees:
        print(f'\n⭐ {len(ajoutees)} AJOUT(S) HORS CLASSEUR — nommés, avec leur raison :')
        for a, c, lib, r in ajoutees: print(f'   · « {a} » → {c} {lib}\n     raison : {r}')
    if corrigees:
        print(f'\n⛔ {len(corrigees)} CORRECTION(S) APPORTÉE(S) À LA TABLE — jamais en silence :')
        for a, c, lib, r in corrigees: print(f'   · « {a} » → {c} {lib}\n     raison : {r}')
    for cle, titre in (('hors_ciqual',   "écartés — ABSENTS de CIQUAL (vrais trous de la table nationale)"),
                       ('non_proposable', "écartés — cible sans calories déterminées (jamais proposable)"),
                       ('inconnu',       "écartés — code introuvable dans notre base"),
                       ('macro',         "écartés — macros divergentes (la valeur aurait été réécrite)"),
                       ('collision',     "écartés — déjà dans FOOD_SYNONYMES (R2, un propriétaire)"),
                       ('doublon',       "écartés — DEUX cibles pour le même mot (ambigu, on ne tranche pas)"),
                       ('court',         "écartés — moins de 3 caractères")):
        v = rej[cle]
        if not v: continue
        print(f'\n⚠️ {len(v)} {titre} :')
        for x in v[:14]: print('   ·', x)
        if len(v) > 14: print(f'   … et {len(v)-14} autres')

if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'Force_Tracker_Alias_CIQUAL_V2_Elargie.xlsx')
