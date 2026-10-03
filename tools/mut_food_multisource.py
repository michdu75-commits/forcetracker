#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — FOOD SEMANTICS V1 / FS-05B (corpus multi-source de la recherche d'aliments, 03/10/2026,
session-B) : les temoins distinguent-ils VRAIMENT une source attendue d'une source absente, un bon ordre d'un
mauvais, un vrai rapprochement d'un faux, un resultat vide d'un resultat perime ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque ligne decrit la COPIE MUTEE, jamais le
     comportement reel de l'application : « DANS LA COPIE MUTEE, … ».
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
[!!] Une mutation n'est « gardee » que si au moins un temoin EXECUTE rougit (B-CDXLII : le corpus conduit par la
     vraie frappe · B-CDXLIII : inter-sources). Un rouge des seuls temoins de SOURCE (B-CDXLI) ne suffit pas.
  M00 = le moteur de master (%s) remis mot pour mot · M1..M20 = les defauts utiles (source supprimee, ordre de
  rendu, faux rapprochement, resultat vide / perime, adaptateur Open Food Facts, niveaux du corpus) · EQ = equivalentes
  (temoins verts) · [negatif] = commentaire. Pas de mutation pour gonfler le compte : chacune vise une propriete.
Usage : python3 tools/mut_food_multisource.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = 'f31dc234'
AP, AJ, CO = 'app.js', 'data/alias.json', 'tests/parcours/food_multisource_corpus.js'
FICHIERS = (AP, AJ, CO)
FICHIERS_REV = (AP, AJ)        # le corpus n'existe pas sur master : seul le MOTEUR est remis

FF_DEBUT = "  /* ⭐⭐ LE FAST-FOOD PASSE AVANT LE GÉNÉRIQUE"
CIQ_DEBUT = "  /* ⭐ CIQUAL AVANT OPEN FOOD FACTS, et c'est un choix"
OFF_DEBUT = "  if(_afSuggOff.length){"
MENTION_DEBUT = "  /* ⚠️ LA MENTION DE LA SOURCE N'EST PAS DÉCORATIVE"
MENTION = "  if(_afSuggCiq.length) h+='<div style=\"font-size:10.5px;color:var(--t3);padding:6px 11px 8px;line-height:1.4;\">Données aliments : table Ciqual 2025 — ANSES</div>';\n"
DOUTE = "        + (a[9]? '<br><span style=\"color:var(--orange);\">⚠️ '+_marqueEsc(String(a[9]))+'</span>' : ''),\n"


def bloc(s, debut, fin):
    i = s.index(debut); j = s.index(fin, i)
    return i, j


def ciq_avant_ff(s):
    """M4 : le bloc CIQUAL est rendu AVANT le bloc fast-food (partout, y compris pour une requête de marque)."""
    i, j = bloc(s, FF_DEBUT, CIQ_DEBUT); k = s.index(OFF_DEBUT, j)
    return s[:i] + s[j:k] + s[i:j] + s[k:]


def off_avant_ciq(s):
    """M5 : le bloc Open Food Facts est rendu AVANT le bloc CIQUAL."""
    j = s.index(CIQ_DEBUT); k = s.index(OFF_DEBUT, j); m = s.index(MENTION_DEBUT, k)
    return s[:j] + s[k:m] + s[j:k] + s[m:]


def niveau(cas_id, de, vers):
    """Change le niveau d'UN cas du corpus (ligne bornée au cas, aucun remplacement global)."""
    def f(s):
        deb = s.index('  { id: "%s",' % cas_id); fin = s.index('\n', deb)
        ligne = s[deb:fin]
        assert ligne.count('niveau: "%s"' % de) == 1, (cas_id, de)
        return s[:deb] + ligne.replace('niveau: "%s"' % de, 'niveau: "%s"' % vers) + s[fin:]
    return f


def raison(cas_id, nouvelle):
    def f(s):
        deb = s.index('  { id: "%s",' % cas_id); fin = s.index('\n', deb)
        ligne = s[deb:fin]
        return s[:deb] + re.sub(r'raison: "[^"]*"', 'raison: "%s"' % nouvelle, ligne) + s[fin:]
    return f


MUT = [
    ('M00 le moteur de master remis mot pour mot (%s : app.js + data/alias.json)' % AVANT, 'REV:' + AVANT, 'GARDE'),
    # — une SOURCE supprimée —
    ('M1 source supprimee : le fast-food n\'est plus cherche', [(AP, "      _afSuggMarq=_marquesChercher(q,4); _afSuggRendu();", "      _afSuggMarq=[]; _afSuggRendu();")], 'GARDE'),
    ('M2 source supprimee : la reponse Open Food Facts est jetee', [(AP, "    _afSuggOff=res; _afSuggRendu();", "    _afSuggOff=[]; _afSuggRendu();")], 'GARDE'),
    ('M3 source supprimee : CIQUAL n\'est plus affiche', [(AP, "      _afSuggCiq=_ciqualChercher(q,6); _afSuggRendu();", "      _afSuggCiq=[]; _afSuggRendu();")], 'GARDE'),
    # — un ORDRE de rendu modifié —
    ('M4 ordre de rendu : CIQUAL au-dessus du fast-food PARTOUT (requetes de marque comprises)', [(AP, ciq_avant_ff)], 'GARDE'),
    ('M5 ordre de rendu : Open Food Facts au-dessus de CIQUAL (contraire a D-042)', [(AP, off_avant_ciq)], 'GARDE'),
    # — un FAUX rapprochement accepté —
    ('M6 faux rapprochement : un seul mot de la frappe suffit pour sortir un produit fast-food', [(AP, "    const r=_afRang(mots, nom);", "    const r=mots.some(m=>nom.indexOf(m)>=0)?[1,0]:null;")], 'GARDE'),
    # — résultat VIDE / PÉRIMÉ —
    ('M7 resultat perime : la frappe n\'efface plus les resultats de la requete precedente', [(AP, "  _afSuggOff=[]; _afSuggCiq=[]; _afSuggMarq=[];\n", "\n")], 'GARDE'),
    ('M8 resultat perime : une reponse Open Food Facts arrivee apres une autre frappe est affichee', [(AP, "    if(_afNorm(apres)!==_afNorm(q)) return;        // ... et on re-vérifie APRÈS l'appel\n", "\n")], 'GARDE'),
    ('M9 resultat vide : une recherche vraiment vide n\'est plus signalee', [(AP, "      _signalerRechercheVide((document.getElementById('af-desc')||{}).value||'','aliment');", "      void 0;")], 'GARDE'),
    # — l'adaptateur OPEN FOOD FACTS —
    ('M10 adaptateur OFF : un produit sans energie est accepte', [(AP, "      return (p.product_name_fr||p.product_name) && (nn['energy-kcal_100g']||nn['energy_100g']);", "      return (p.product_name_fr||p.product_name);")], 'GARDE'),
    ('M11 adaptateur OFF : plafond 6 -> 8', [(AP, "    }).slice(0,6);", "    }).slice(0,8);")], 'GARDE'),
    ('M12 adaptateur OFF : l\'ordre de la reponse n\'est plus conserve (tri par nom)', [(AP, "    }).slice(0,6);", "    }).slice(0,6).sort((x,y)=>String(x.product_name||x.product_name_fr).localeCompare(String(y.product_name||y.product_name_fr)));")], 'GARDE'),
    ('M13 adaptateur OFF : appele des 2 lettres (au lieu de 3)', [(AP, "  if(_afNorm(q).length<3) return;", "  if(_afNorm(q).length<2) return;")], 'GARDE'),
    # — le FAST-FOOD lui-même —
    ('M14 fast-food : plafond 4 -> 6 lignes', [(AP, "      _afSuggMarq=_marquesChercher(q,4); _afSuggRendu();", "      _afSuggMarq=_marquesChercher(q,6); _afSuggRendu();")], 'GARDE'),
    ('M15 fast-food : le doute (decision de Michel du 03/09) n\'est plus affiche', [(AP, DOUTE, "        + '',\n")], 'GARDE'),
    ('M16 fast-food : l\'alias d\'enseigne « bk » (Burger King) retire', [(AP, "  'bk':'burger king', ", "  ")], 'GARDE'),
    ('M17 CIQUAL : la mention de la source (Licence Ouverte) n\'est plus affichee', [(AP, MENTION, "")], 'GARDE'),
    # — les NIVEAUX du corpus (ne pas transformer une limite ou une question en contrat) —
    ('M18 corpus : un ecart a D-042 (« poulet ») promu SHOULD', [(CO, niveau('MS-046', 'KNOWN_LIMITATION', 'SHOULD'))], 'GARDE'),
    ('M19 corpus : la question ouverte Q1 (« big mac ») decidee en MUST', [(CO, niveau('MS-015', 'OBSERVATION', 'MUST'))], 'GARDE'),
    ('M20 corpus : le faux rapprochement « nem » -> Cup Kiri promu SHOULD', [(CO, niveau('MS-086', 'KNOWN_LIMITATION', 'SHOULD'))], 'GARDE'),
    ('DG1 [deguisee] M4 + M5 ensemble : OFF, CIQUAL, puis fast-food', [(AP, ciq_avant_ff), (AP, off_avant_ciq)], 'GARDE'),
    ('EQ1 [equivalente] l\'ordre des trois remises a zero change', [(AP, "  _afSuggOff=[]; _afSuggCiq=[]; _afSuggMarq=[];\n", "  _afSuggMarq=[]; _afSuggCiq=[]; _afSuggOff=[];\n")], 'OK'),
    ('EQ3 [equivalente] l\'alias « mcdo » retire : « mcdo » est deja une SOUS-CHAINE de « mcdonalds », l\'alias est redondant (constat FS-05B)', [(AP, "  'mcdo':\"mcdonald's\", ", "  ")], 'OK'),
    ('EQ2 [equivalente] la raison d\'un cas reformulee', [(CO, raison('MS-001', "KFC nommé : l'enseigne devant"))], 'OK'),
    ('[negatif] commentaire citant fast-food, CIQUAL et Open Food Facts', [(AP, "    _afSuggOff=res; _afSuggRendu();", "    _afSuggOff=res; _afSuggRendu();   // fast-food · CIQUAL · Open Food Facts")], 'OK'),
]


def banc(arbre):
    env = dict(os.environ, TZ='Europe/Paris')
    r = subprocess.run(['node', 'tools/banc_food_multisource.js'], cwd=arbre, capture_output=True, text=True, timeout=900, env=env)
    out = r.stdout + r.stderr
    rouges = [l.strip()[:170] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def executes(rouges):
    return [x for x in rouges if re.match(r'❌ ROUGE B-CDXLII |❌ ROUGE B-CDXLIII ', x) or x.startswith('PLANTAGE')]


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_food_multisource_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    tmp0, a0 = cloner()
    rouges = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rouges:
        print('  !! ARBRE SAIN DEJA ROUGE — controle refuse :', rouges[:3]); return 1
    print('  arbre sain : 0 rouge (point de depart valide)\n')
    conformes = total = 0
    for nom, remplacements, attendu in MUT:
        if filtres and not any(nom.startswith(f) for f in filtres):
            continue
        total += 1
        tmp, arbre = cloner()
        if isinstance(remplacements, str) and remplacements.startswith('REV:'):
            rev = remplacements[4:]; diff = 0; ok = True
            for f in FICHIERS_REV:
                av = subprocess.run(['git', 'show', rev + ':' + f], cwd=SRC, capture_output=True, text=True).stdout
                if not av:
                    print('  INVALIDE  %s (%s introuvable dans %s)' % (nom, f, rev)); ok = False; break
                if av != open(os.path.join(arbre, f), encoding='utf-8').read(): diff += 1
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(av)
            if not ok or not diff:
                if ok: print('  INVALIDE  %s (code de %s identique)' % (nom, rev))
                shutil.rmtree(tmp, ignore_errors=True); continue
        else:
            srcs = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
            invalide = []
            for r in remplacements:
                f = r[0]
                if callable(r[1]):
                    try:
                        nv = r[1](srcs[f])
                        if nv == srcs[f]: invalide.append('%s: transformation sans effet' % f)
                        srcs[f] = nv
                    except Exception as e:
                        invalide.append('%s: %s' % (f, e))
                else:
                    av, ap = r[1], r[2]
                    if srcs[f].count(av) != 1:
                        invalide.append('%s:%s (x%d)' % (f, av[:50], srcs[f].count(av)))
                    else:
                        srcs[f] = srcs[f].replace(av, ap, 1)
            if invalide:
                print('  INVALIDE  %s (%s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
            for f in FICHIERS:
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(srcs[f])
        rouges = banc(arbre)
        ex = executes(rouges)
        obtenu = 'GARDE' if ex else ('SOURCE' if rouges else 'OK')
        ok = obtenu == attendu; conformes += ok
        montre = (ex or rouges or [''])[0]
        print('  %s  DANS LA COPIE MUTEE — %-82s %-6s %3d rouge(s), %3d execute(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), len(ex), montre))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                if r != montre:
                    print('        ' + r)
        sys.stdout.flush()
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    sys.exit(main())
