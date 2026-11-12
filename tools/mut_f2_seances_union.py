#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — F2-A' (12/11/2026) : les temoins B-F2A savent-ils ROUGIR quand on casse la fusion des seances ?

[!!] CHAQUE MUTATION EST APPLIQUEE A UN ARBRE COPIE (Code.js + le banc), JAMAIS AU DEPOT (BUGS.md §60). Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
Un mutant est TUE quand AU MOINS UN des tests ATTENDUS (prefixes ci-dessous) passe au rouge — pas « n'importe lequel » : un rouge ailleurs ne prouve pas que la garantie visee est protegee.
Un rouge qui est seulement un PLANTAGE de section (`...-PLANTAGE`) ne compte PAS : un banc qui plante ne prouve rien. Une ancre qui n'apparait pas exactement une fois rend le mutant INVALIDE (pas de mutant creux).
Deux mutants sont VOLONTAIREMENT sans effet attendu : un commentaire (le banc ne doit pas mesurer du texte) et un « equivalent » (remplacer une seance par sa copie identique) — ils doivent rester VERTS, la raison est ecrite.
M00 = le Code.js d'AVANT F2-A' (master fd8bf703, ft-v1266), lu avec `git show` : les temoins doivent ROUGIR sur le comportement qu'on corrige.
Usage : python3 tools/mut_f2_seances_union.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CO = 'Code.js'
COPIES = ('Code.js', 'tests/_garde_reseau.js', 'tests/parcours/nut_secu_p1.js', 'tests/parcours/f2_seances_union.js', 'tools/banc_f2_seances_union.js', 'tools/nut_serveur_proc.js')
SHA_AVANT = 'fd8bf7039fff0aae4564bb585dd5e1f13c84da4e'   # master ft-v1266, juste AVANT F2-A'

APPEL = "        existing.sessions = _sessFusion_(exSess, inSess).liste;\n"
REMPL = "    if (JSON.stringify(liste[j]) !== JSON.stringify(s)) { liste[j] = s; res.remplacees++; }\n"
IDENT = "  if ((t === 'string' && id.trim() !== '') || (t === 'number' && isFinite(id))) return 'i:' + String(id);\n"
AJOUT = "      if (!(k in parId)) { parId[k] = liste.length; liste.push(s); res.ajoutees++; return; }\n"

# (nom, ancre | liste de (ancre, remplacement) | 'AVANT', remplacement, tests ATTENDUS (prefixes), sections a rejouer, attendu 'GARDE' | 'OK')
MUT = [
    ("M00 le Code.js d'AVANT F2-A' (master fd8bf703) : remplacement + garde de taille (60 % des 30)", 'AVANT', None,
     ['F2A-A·C02a', 'F2A-A·C02b', 'F2A-A·C04', 'F2A-A·C05', 'F2A-A2a', 'F2A-A3a', 'F2A-F1'], 'Z,A,B,C,D,E,F', 'GARDE'),
    ("M01 remplacement pur : `existing.sessions = envoi` (le comportement d'avant, sans la fusion)", APPEL,
     "        existing.sessions = inSess;\n", ['F2A-A·C02a', 'F2A-A·C04', 'F2A-A2a', 'F2A-A3a', 'F2A-E01e', 'F2A-F1'], 'A,E,F', 'GARDE'),
    ("M02 la base n'est plus conservee : la liste de depart est VIDE (seul l'envoi reste)", "  var liste = stockees.slice(), parId = Object.create(null), libres = Object.create(null);\n",
     "  var liste = [], parId = Object.create(null), libres = Object.create(null);\n", ['F2A-A·C02a', 'F2A-A·C08a', 'F2A-A·C08b', 'F2A-A3a'], 'A', 'GARDE'),
    ("M03 un identifiant connu n'est plus remplace : la version de la BASE gagne toujours", REMPL,
     "    if (false) { liste[j] = s; res.remplacees++; }\n", ['F2A-B01', 'F2A-B02', 'F2A-B04', 'F2A-A3a'], 'A,B', 'GARDE'),
    ("M04 aucune deduplication par identifiant : tout identifiant est de nouveau AJOUTE (un rejeu duplique)", AJOUT,
     "      if (true) { parId[k] = liste.length; liste.push(s); res.ajoutees++; return; }\n", ['F2A-A·C13', 'F2A-A·C01', 'F2A-A3c', 'F2A-F4'], 'A,F', 'GARDE'),
    ("M05 l'identifiant n'est pas normalise : 1700000000000 (nombre) et \"1700000000000\" (texte) deviennent DEUX seances", IDENT,
     "  if ((t === 'string' && id.trim() !== '') || (t === 'number' && isFinite(id))) return 'i:' + t + ':' + String(id);\n", ['F2A-B05'], 'B', 'GARDE'),
    ("M06 l'identifiant est « normalise » trop loin (minuscules, espaces) : deux seances distinctes fusionnent", IDENT,
     "  if ((t === 'string' && id.trim() !== '') || (t === 'number' && isFinite(id))) return 'i:' + String(id).trim().toLowerCase();\n", ['F2A-B06'], 'B', 'GARDE'),
    ("M07 un identifiant VIDE est pris pour un identifiant : toutes les seances d'id « » se confondent", IDENT,
     "  if ((t === 'string') || (t === 'number' && isFinite(id))) return 'i:' + String(id);\n", ['F2A-B07a', 'F2A-B07b'], 'B', 'GARDE'),
    ("M08 l'identifiant 0 n'en est plus un (test « vrai/faux » au lieu de « nombre fini »)", IDENT,
     "  if ((t === 'string' && id.trim() !== '') || (t === 'number' && isFinite(id) && id)) return 'i:' + String(id);\n", ['F2A-B07c'], 'B', 'GARDE'),
    ("M09 un objet, une liste ou un booleen est pris pour un identifiant (« [object Object] »)", IDENT,
     "  if (id !== null && id !== undefined && id !== '') return 'i:' + String(id);\n", ['F2A-B07b'], 'B', 'GARDE'),
    ("M10 les entrees invalides sont ECRITES (une liste ou un nombre dans la liste est accepte comme seance)", "  function valide(s) { return !!s && typeof s === 'object' && !Array.isArray(s); }\n",
     "  function valide(s) { return !!s && typeof s === 'object'; }\n", ['F2A-C05'], 'C', 'GARDE'),
    ("M11 une liste invalide (objet, texte...) n'est plus ecartee : on la traite comme une liste", "      if (body.sessions !== null && !Array.isArray(body.sessions)) {\n",
     "      if (false) {\n", ['F2A-C04'], 'C', 'GARDE'),
    ("M12 l'empreinte des seances SANS identifiant inclut « synced » : un drapeau qui bascule cree un DOUBLON", "  return 'e:' + _sessCanon_(s, true);\n",
     "  return 'e:' + _sessCanon_(s, false);\n", ['F2A-A·C11', 'F2A-B04'], 'A,B', 'GARDE'),
    ("M13 multi-ensemble perdu : sans identifiant, plusieurs copies identiques s'ecrasent en une", "      j = libres[k].shift();\n",
     "      j = libres[k][0];\n", ['F2A-B11'], 'B', 'GARDE'),
    ("M14 l'ANCIEN GARDE-FOU DE TAILLE revient : un envoi < 60 % d'une base >= 30 n'est pas fusionne (les neuves sont perdues)", APPEL,
     "        if (!retreci) existing.sessions = _sessFusion_(exSess, inSess).liste;\n", ['F2A-A·C05', 'F2A-A2b', 'F2A-A3a', 'F2A-F3'], 'A,F', 'GARDE'),
    ("M15 le SIGNAL « appareil amputé » n'est plus ecrit (HIST_SHRINK)", "          _logHistShrink_(email, inSess.length, exSess.length);\n",
     "", ['F2A-C03', 'F2A-G06'], 'C,G', 'GARDE'),
    ("M16 l'envoi VIDE efface la base", APPEL,
     "        existing.sessions = inSess.length === 0 ? [] : _sessFusion_(exSess, inSess).liste;\n", ['F2A-A·C08a', 'F2A-C03'], 'A,C', 'GARDE'),
    ("M17 une seance remplacee CHANGE DE PLACE (retiree puis ajoutee a la fin)", REMPL,
     "    if (JSON.stringify(liste[j]) !== JSON.stringify(s)) { liste.splice(j, 1); liste.push(s); res.remplacees++; }\n", ['F2A-B01', 'F2A-A3a'], 'A,B', 'GARDE'),
    ("M18 la telemetrie parle a chaque envoi (plus de seuil)", "        const retreci = exSess.length >= SEUIL_SIGNAL && inSess.length < exSess.length * PART_SIGNAL;\n",
     "        const retreci = true;\n", ['F2A-G05'], 'G', 'GARDE'),
    ("M19 l'erreur d'ecriture du compte est AVALEE (la reponse dit « ok » alors que rien n'est ecrit)", "    saveUserData_(email, existing);\n    // ⚙️ NUT-SYNC-01 FINAL : l'écriture durable est faite",
     "    try { saveUserData_(email, existing); } catch (eSilence) {}\n    // ⚙️ NUT-SYNC-01 FINAL : l'écriture durable est faite", ['F2A-E01', 'F2A-E02'], 'E', 'GARDE'),
    ("M20 le VERROU ne verrouille plus rien (un faux verrou toujours accorde) : deux envois simultanes se perdent", "    verrou = _nutVerrouPrendre_();\n    if (!verrou) return json_({status:'error', ok:false, code:'NUT_LOCK_BUSY'",
     "    verrou = { v: { releaseLock: function() {} }, t0: 0, rendu: false, ms: 0 };\n    if (!verrou) return json_({status:'error', ok:false, code:'NUT_LOCK_BUSY'", ['F2A-F1', 'F2A-F3', 'F2A-F4'], 'F', 'GARDE'),
    ("M21 les seances INCONNUES de la base ne sont plus ajoutees (l'envoi n'apporte rien de neuf)", AJOUT,
     "      if (!(k in parId)) { res.ignorees++; return; }\n", ['F2A-A·C01', 'F2A-A·C04', 'F2A-A·C05', 'F2A-C10'], 'A,C', 'GARDE'),
    ("M22 la fusion modifie la liste de la base EN PLACE (plus de copie) — equivalent en production, mais la pureté de la fonction est un invariant", "  var liste = stockees.slice(), parId = Object.create(null), libres = Object.create(null);\n",
     "  var liste = stockees, parId = Object.create(null), libres = Object.create(null);\n", ['F2A-A4a'], 'A', 'GARDE'),
    ("M23 le journal du serveur recopie l'adresse du compte dans la ligne « envoi plus court » (fuite de donnee)", "                     exSess.length + ' en base — aucune séance retirée, les neuves sont ajoutées');\n",
     "                     exSess.length + ' en base — aucune séance retirée, les neuves sont ajoutées (' + email + ')');\n", ['F2A-C04b'], 'C', 'GARDE'),
    ("M24 (commentaire) un mot du commentaire de F2-A' est modifie : le banc doit rester VERT", "   · Rejouer le même envoi ne change plus rien (idempotent)",
     "   · Rejouer le même envoi ne modifie plus rien (idempotent)", [], 'Z,A,B,C', 'OK'),
    ("M25 (EQUIVALENT, attendu VERT) une seance identique est « remplacee » par sa copie : aucun effet observable, ni sur le contenu ni sur l'ordre", REMPL,
     "    if (true) { liste[j] = s; res.remplacees++; }\n", [], 'A,B', 'OK'),
]


def syntaxe_ok(chemin):
    r = subprocess.run(['node', '-e', "new (require('vm').Script)(require('fs').readFileSync(process.argv[1],'utf8'))", chemin], capture_output=True, text=True)
    return r.returncode == 0


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_f2a_')
    for f in COPIES:
        d = os.path.join(tmp, f)
        os.makedirs(os.path.dirname(d), exist_ok=True)
        shutil.copy2(os.path.join(SRC, f), d)
    return tmp


def banc(arbre, sections):
    r = subprocess.run(['node', 'tools/banc_f2_seances_union.js'], cwd=arbre, capture_output=True, text=True, timeout=900,
                       env=dict(os.environ, TZ='Europe/Paris', F2A_SEULEMENT=sections))
    out = r.stdout + r.stderr
    rouges = []
    for l in out.split('\n'):
        if l.startswith('❌ ROUGE'):
            rouges.append((l[len('❌ ROUGE '):].strip().split(' ')[0], l.strip()[:150]))
        elif 'PLANTAGE :' in l and not l.startswith('❌'):
            rouges.append(('PLANTAGE', l.strip()[:150]))
    if r.returncode not in (0, 1) and not rouges:
        rouges = [('PLANTAGE', 'code %d' % r.returncode)]
    return rouges, out


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    av = subprocess.run(['git', 'show', SHA_AVANT + ':' + CO], cwd=SRC, capture_output=True, text=True)
    AVANT = av.stdout if av.returncode == 0 else ''
    a0 = cloner()
    rouges, out0 = banc(a0, '')
    shutil.rmtree(a0, ignore_errors=True)
    if rouges:
        print('  !! ARBRE SAIN DEJA ROUGE — controle refuse :', [r[1] for r in rouges[:3]]); return 1
    m = re.search(r'(\d+) OK / (\d+) rouge', out0)
    print('  arbre sain : 0 rouge (%s OK) — point de depart valide\n' % (m.group(1) if m else '?'))
    conformes = total = 0
    for spec in MUT:
        nom, ancre, remplace, attendus, sections, attendu = spec
        if filtres and not any(nom.startswith(f) for f in filtres):
            continue
        total += 1
        arbre = cloner()
        chemin = os.path.join(arbre, CO)
        src = open(chemin, encoding='utf-8').read()
        if ancre == 'AVANT':
            if not AVANT or AVANT == src:
                print('  INVALIDE  %s (code d\'avant introuvable : `git show` indisponible, ou identique)' % nom); shutil.rmtree(arbre, ignore_errors=True); continue
            src = AVANT
        else:
            n = src.count(ancre)
            if n != 1:
                print('  INVALIDE  %s (ancre trouvee %d fois, 1 attendue)' % (nom, n)); shutil.rmtree(arbre, ignore_errors=True); continue
            src = src.replace(ancre, remplace, 1)
        open(chemin, 'w', encoding='utf-8').write(src)
        if not syntaxe_ok(chemin):
            print('  INVALIDE  %s (syntaxe cassee par la mutation)' % nom); shutil.rmtree(arbre, ignore_errors=True); continue
        rouges, out = banc(arbre, sections)
        shutil.rmtree(arbre, ignore_errors=True)
        vrais = [r for r in rouges if r[0] != 'PLANTAGE' and not r[0].endswith('-PLANTAGE')]
        plante = len(vrais) != len(rouges)
        touche = [a for a in attendus if any(r[0].startswith(a) for r in vrais)]
        ok = (attendu == 'GARDE' and bool(touche)) or (attendu == 'OK' and not rouges)
        conformes += 1 if ok else 0
        print('  %s %s -> %d rouge(s)%s%s' % ('CONFORME   ' if ok else 'NON CONFORME', nom, len(rouges), ' (dont un PLANTAGE : il ne prouve rien)' if plante else '',
                                           ('  [attendu parmi : %s ; rouge : %s]' % (', '.join(attendus), ', '.join(touche))) if attendu == 'GARDE' and attendus else ''))
        for r in (rouges if os.environ.get('MUT_DETAIL') else rouges[:2]):
            print('        ' + r[1])
    print('\n  ==== %d / %d mutations conformes ====' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    sys.exit(main())
