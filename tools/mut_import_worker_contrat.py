#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — IMPORT-IA-FIDELITE-01 · LOT A : le banc du contrat d'import du Worker sait-il ROUGIR ?

[!!] Chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60) : on copie les 5 fichiers que le banc
lit (worker.js, Code.js, le garde reseau, le test, le lanceur) — un arbre MINIMAL, pas les 136 Mo du depot, parce que le
banc ne lit rien d'autre (il conduit worker.js dans un `vm`, reseau SIMULE : aucun navigateur, aucun appel reel).
Le depot lui-meme est empreint avant et apres : s'il bouge, le controle echoue.

Protocole :
  1. le banc sur le code SAIN doit etre VERT — AVANT (sous trois fuseaux horaires de l'hote : le banc fige son horloge),
  2. chaque mutation doit faire apparaitre AU MOINS UN temoin ROUGE (un plantage du banc n'est PAS un temoin rouge),
  3. les mutations « NEUTRE » (changement que le contrat tolere) doivent laisser le banc VERT — sinon les temoins epinglent
     une implementation au lieu d'un invariant,
  4. le banc sur le code SAIN doit etre VERT — APRES (la copie n'a rien pollue).

Usage : tools/sous_garde.sh python3 tools/mut_import_worker_contrat.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import hashlib, os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FICHIERS = ('worker.js', 'Code.js', 'tests/_garde_reseau.js', 'tests/parcours/import_worker_contrat.js',
            'tools/banc_import_worker_contrat.js')
W = 'worker.js'
MORT = 'http://127.0.0.1:9'

# (nom, [(ancre exacte et UNIQUE, remplacement)], attendu)  —  attendu : 'GARDE' (au moins un rouge) ou 'NEUTRE' (aucun rouge)
MUT = [
    # ── le prompt ─────────────────────────────────────────────────────────────────────────────────────────────────
    ('M01 l\'exemple de structure redevient « weeks 7 / 2026-03-23 » (recopiable)',
     [('"weeks":0,"startDate":"","days"', '"weeks":7,"startDate":"2026-03-23","days"')], 'GARDE'),
    ('M02 la règle des PLAGES disparaît du prompt',
     [('écris la valeur TELLE QUE DANS LE DOCUMENT', 'écris la valeur')], 'GARDE'),
    ('M03 la règle des repos « TEL QU\'ÉCRIT » disparaît (retour à « reporte-la, sauf plage »)',
     [("Recopie le texte TEL QU\\'ÉCRIT dans le document", 'Reporte le texte du document')], 'GARDE'),
    ('M04 la règle semaine A / semaine B disparaît du prompt',
     [('"J3A - <titre> - Semaine A", puis "J3B - <titre> - Semaine B"', '"<titre> - Semaine A", puis "<titre> - Semaine B"')], 'GARDE'),
    ('M05 une règle de Code.js disparaît du prompt (le tri-set) — c\'est le témoin de PARITÉ',
     [('- Tri-set C1/C2/C3 → tous', '- Tri → tous')], 'GARDE'),
    ('M06 la règle « fidélité d\'abord » disparaît (n\'omets jamais une ligne)',
     [("N\\'omets JAMAIS une ligne, une série ni un exercice.", 'Résume.')], 'GARDE'),
    ('M07 le prompt redevient la règle de Code.js « une plage de repos n\'est pas un repos »',
     [("- Un repos écrit dans le TITRE", "- Une valeur VARIABLE ou FLOUE n\\'est PAS un repos : rien. Un repos écrit dans le TITRE")], 'GARDE'),
    ('M08 « UNE LIGNE = UN EXERCICE » sans colonne de type disparaît',
     [('et UNE LIGNE = UN EXERCICE, même quand', 'et fusionne, même quand')], 'GARDE'),
    # ── le catalogue ──────────────────────────────────────────────────────────────────────────────────────────────
    ('M09 le catalogue n\'est plus jamais envoyé',
     [('if (cat) userContent.push(', 'if (false) userContent.push(')], 'GARDE'),
    ('M10 le catalogue part aussi avec l\'import d\'HISTORIQUE',
     [("if (kind === 'program') { const cat = _blocCatalogueProg(body);", "if (kind) { const cat = _blocCatalogueProg(body);")], 'GARDE'),
    ('M11 la règle « même MATÉRIEL » disparaît du bloc catalogue',
     [('ET le même matériel (machine ≠ barre ≠ haltères ≠ poulie ≠ Smith)', '(machine ≠ barre)')], 'GARDE'),
    ('M12 le catalogue n\'a plus de plafond de taille',
     [('if (taille + ajout > PROG_CATALOGUE_MAX) break;', 'if (false) break;')], 'GARDE'),
    ('M13 le catalogue n\'est plus dédoublonné',
     [('if (!n || vus.has(n)) continue;', 'if (!n) continue;')], 'GARDE'),
    ('M14 les noms du catalogue ne sont plus tronqués à 80 caractères',
     [('.trim().slice(0, 80).trim();', '.trim();')], 'GARDE'),
    ('M15 les blancs / sauts de ligne d\'un nom du catalogue ne sont plus normalisés',
     [("const n = l[i].replace(/\\s+/g, ' ').trim()", "const n = l[i].trim()")], 'GARDE'),
    # ── l'appel ───────────────────────────────────────────────────────────────────────────────────────────────────
    ('M16 max_tokens redescend à 8192 pour le programme',
     [('max_tokens: 16000', 'max_tokens: 8192')], 'GARDE'),
    ('M17 une réponse coupée (max_tokens) n\'est plus détectée',
     [("if (d.stopReason === 'max_tokens') return", "if (false && d.stopReason === 'max_tokens') return")], 'GARDE'),
    ('M18 le modèle change : Haiku pour tout',
     [("const model = (kind === 'history' || images.length > 1 || hasText || hasPdf) ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001';",
       "const model = 'claude-haiku-4-5-20251001';")], 'GARDE'),
    ('M19 la 2e chance du JSON (guillemets typographiques) disparaît',
     [('try { JSON.parse(autre); return autre; } catch (e) {}', 'try { JSON.parse(autre); return legacy; } catch (e) {}')], 'GARDE'),
    ('M20 la normalisation du programme n\'est plus appelée (retour à la réponse brute du modèle)',
     [("const r = _normaliserProgramme(data);\n    if (!r.ok) return { status: 'error', error: r.error };",
       "const r = { ok: true, data };\n    if (!r.ok) return { status: 'error', error: r.error };")], 'GARDE'),
    ('M21 `normalisation` redevient servie en DOUBLE (dans data ET à la racine) : deux endroits pour la même information',
     [("return { status: 'ok', data: r.data };\n  }\n  return { status: 'ok', data };", "return { status: 'ok', data: r.data, normalisation: r.data.normalisation };\n  }\n  return { status: 'ok', data };")], 'GARDE'),
    # ── les nombres ───────────────────────────────────────────────────────────────────────────────────────────────
    ('M22 « 8-10 » redevient 810 (replace(/[^0-9]/g,\'\') sur les plages)',
     [("  const s = v.replace(/\\s+/g, ' ').trim();\n  if (!s) return { t: 'vide' };",
       "  const s = v.replace(/\\s+/g, ' ').trim();\n  if (!s) return { t: 'vide' };\n  if (/\\d\\s*[-–]\\s*\\d/.test(s)) return { t: 'n', n: parseInt(s.replace(/[^0-9]/g, ''), 10), txt: s };")], 'GARDE'),
    ('M23 la virgule décimale n\'est plus lue (« 87,5 » ne se lit plus)',
     [("const NB = '(\\\\d+(?:[.,]\\\\d+)?)'", "const NB = '(\\\\d+(?:[.]\\\\d+)?)'")], 'GARDE'),
    ('M24 `|| 10` réintroduit : des répétitions inventées',
     [('reps: rp.nums.length ? rp.nums[rp.nums.length - 1] : r1.n,', 'reps: rp.nums.length ? rp.nums[rp.nums.length - 1] : (r1.n || 10),')], 'GARDE'),
    ('M25 `|| 3` réintroduit : des séries inventées',
     [('if (!(sets >= 1)) { sets = 1; c.setsInconnus++; }', 'if (!(sets >= 1)) { sets = 3; c.setsInconnus++; }')], 'GARDE'),
    ('M26 l\'arrondi au 0,5 kg disparaît',
     [('arrondi: (x) => Math.round(x * 2) / 2,', 'arrondi: (x) => x,')], 'GARDE'),
    ('M27 la borne haute des répétitions saute (999 → illimité)',
     [('min: 0, max: 999,  arrondi: Math.round', 'min: 0, max: 99999,  arrondi: Math.round')], 'GARDE'),
    ('M28 une charge non chiffrée n\'est plus comptée',
     [("cpt: 'chargesNonChiffrees'", "cpt: ''")], 'GARDE'),
    ('M29 la longueur de repsPerSet ne décide plus du nombre de séries',
     [('if (rp.nums.length) sets = rp.nums.length;\n  else {', 'if (false) sets = rp.nums.length;\n  if (true) {')], 'GARDE'),
    # ── les types ─────────────────────────────────────────────────────────────────────────────────────────────────
    ('M30 le type par série accepte « ECH » (tout ce qui n\'est pas vide devient W)',
     [("return s === 'W' ? 'W' : '';", "return s !== '' ? 'W' : '';")], 'GARDE'),
    ('M31 setType accepte W et E',
     [("setType: st === 'D' ? 'D' : '',", "setType: (st === 'D' || st === 'W' || st === 'E') ? st : '',")], 'GARDE'),
    ('M32 un setTypePerSet mal dimensionné est conservé (au lieu de [])',
     [('else if (tps.length !== sets) {', 'else if (false) {')], 'GARDE'),
    # ── les tableaux, les repos, les noms, les jours ──────────────────────────────────────────────────────────────
    ('M33 kgPerSet n\'est plus complété / rogné',
     [('kgPerSet: _aligner(kp.nums, sets, k1.n, c),', 'kgPerSet: kp.nums,')], 'GARDE'),
    ('M34 restPerSet n\'est plus réaligné',
     [("restPerSet: _aligner(rps, sets, '', c),", 'restPerSet: rps,')], 'GARDE'),
    ('M35 les repos sont convertis en nombre (« 3-4 min » → 3)',
     [('  return _texteCourt(v, 40);\n}', "  return String(parseInt(_texteCourt(v, 40), 10) || '');\n}")], 'GARDE'),
    ('M36 les repos en plage sont jetés (la règle de Code.js)',
     [('  return _texteCourt(v, 40);\n}', "  return /\\d\\s*(?:-|à)\\s*\\d/.test(_texteCourt(v, 40)) ? '' : _texteCourt(v, 40);\n}")], 'GARDE'),
    ('M37 les repos ne sont plus limités à 40 caractères',
     [('  return _texteCourt(v, 40);\n}', '  return _texteCourt(v, 400);\n}')], 'GARDE'),
    ('M38 un exercice sans nom est jeté',
     [("if (!name) { name = '(exercice sans nom)'; c.exercicesSansNom++; }", 'if (!name) { c.exercicesSansNom++; return null; }')], 'GARDE'),
    ('M39 un jour sans exercice est conservé',
     [('if (!exos.length) { c.joursEcartes++; return; }', 'if (!exos.length) { c.joursEcartes++; }')], 'GARDE'),
    ('M40 les exercices de même nom sont dédoublonnés',
     [('.map((e) => _exercice(e, c)).filter(Boolean)', '.map((e) => _exercice(e, c)).filter(Boolean).filter((e, i, a) => a.findIndex((x) => x.name === e.name) === i)')], 'GARDE'),
    ('M41 la mention de plage s\'écrit deux fois (plus de « sans doublon »)',
     [("bas.indexOf(m.toLowerCase().replace(/\\s+/g, ' ')) < 0", "true")], 'GARDE'),
    ('M42 la note n\'est plus plafonnée à 1 500 caractères',
     [('const _NOTE_MAX = 1500;', 'const _NOTE_MAX = 150000;')], 'GARDE'),
    ('M43 `normalisation` transporte du texte du document',
     [('days, normalisation: c } };', 'days, normalisation: Object.assign({ nom: _texteCourt(data.name, 120) }, c) } };')], 'GARDE'),
    # ── les dates ─────────────────────────────────────────────────────────────────────────────────────────────────
    ('M44 la date de début périmée n\'est plus refusée',
     [('if (weeks > 0 && new Date(', 'if (false && new Date(')], 'GARDE'),
    ('M45 une date de calendrier impossible est acceptée (30 février)',
     [("  if (new Date(t0).toISOString().slice(0, 10) !== s) return '';", '')], 'GARDE'),
    ('M46 décalage d\'un jour : un cycle qui finit AUJOURD\'HUI est déclaré fini',
     [('(weeks * 7 - 1) * 86400000', '(weeks * 7 - 2) * 86400000')], 'GARDE'),
    ('M47 décalage d\'un jour : un cycle fini HIER est déclaré en cours',
     [('(weeks * 7 - 1) * 86400000', '(weeks * 7) * 86400000')], 'GARDE'),
    ('M48 « aujourd\'hui » est le jour UTC et non le jour de Paris',
     [('_dateDebutValide(data.startDate, weeks, _jourParis())', '_dateDebutValide(data.startDate, weeks, new Date().toISOString().slice(0, 10))')], 'GARDE'),
    ('M49 l\'année n\'est plus bornée (2000..2100)',
     [('if (y < 2000 || y > 2100) return \'\';', '')], 'GARDE'),
    ('M55 la mention de plage n\'est plus protégée de la coupe des 1 500 caractères (on rogne la fin, mention comprise)',
     [('_NOTE_MAX - (ajout ? ajout.length + 3 : 0)', '_NOTE_MAX')], 'GARDE'),
    ('M56 les réalignements de tableaux ne sont plus comptés',
     [('  c.tableauxRealignes++;\n  return tab.length > sets', '  return tab.length > sets')], 'GARDE'),
    ('M57 les séries inconnues ne sont plus comptées',
     [('sets = 1; c.setsInconnus++; }', 'sets = 1; }')], 'GARDE'),
    ('M58 la durée n\'est plus bornée à 104 semaines',
     [('w >= 0 && w <= 104', 'w >= 0 && w <= 1040')], 'GARDE'),
    ('M59 le groupe de superset n\'est plus limité à 2 lettres',
     [('.replace(/[^A-Z]/g, \'\').slice(0, 2)', '.replace(/[^A-Z]/g, \'\').slice(0, 5)')], 'GARDE'),
    ('M60 specialSets accepte des indices au-delà des séries',
     [('n >= 0 && n < sets && ss.indexOf(n) < 0', 'n >= 0 && ss.indexOf(n) < 0')], 'GARDE'),
    ('M61 une date de début refusée n\'est plus comptée',
     [('if (ecrite && !startDate) c.startDateRefusee++;', 'if (ecrite && !startDate) { }')], 'GARDE'),
    ('M62 un repos numérique n\'est plus converti en chaîne',
     [('return (isFinite(v) && v >= 0) ? String(v) : \'\';', "return '';")], 'GARDE'),
    ('M63 un restPerSet sans aucune valeur n\'est plus ramené à []',
     [("if (rps.every((x) => x === '')) rps = [];", '')], 'GARDE'),
    ('M64 un setTypePerSet sans aucun W n\'est plus ramené à []',
     [("if (!tps.some((x) => x === 'W')) tps = [];", "if (false) tps = [];")], 'GARDE'),
    ('M65 « 0 série » n\'est plus lu comme « inconnu » (une note parasite « Séries : 0 »)',
     [("(l.t === 'n' && l.n === 0 && cfg.min > 0)", 'false')], 'GARDE'),
    ('M66 l\'unité « kg » collée au nombre n\'est plus lue (« 20 kg » devient du texte)',
     [("U = '(?:\\\\s*(?:' + unite + '))?';", "U = '';")], 'GARDE'),
    ('M67 une chaîne seule n\'est plus lue comme un exercice (elle est écartée)',
     [("  if (typeof brut === 'string') brut = { name: brut };\n", '')], 'GARDE'),
    ('M68 la plage de séries (« 3-4 ») n\'est plus comptée à part',
     [("cptPlage: 'plagesSeries'", "cptPlage: 'plagesReps'")], 'GARDE'),
    ('M69 le séparateur des plages par série change (« / » devient « , »)',
     [("etiq + ' ' + lot.join(' / ') + (suffixe || '')", "etiq + ' ' + lot.join(', ') + (suffixe || '')")], 'GARDE'),
    ('M70 la mention de texte perd son « : » (« Charge à calibrer » au lieu de « Charge : à calibrer »)',
     [("etiq + ' : ' + lot.join(' / ')", "etiq + ' ' + lot.join(' / ')")], 'GARDE'),
    ('M71 une chaîne vide / blanche n\'est plus une valeur absente (elle devient du « texte » à garder en note)',
     [("  if (!s) return { t: 'vide' };\n  const NB", "  const NB")], 'GARDE'),
    ('M72 un booléen / objet / tableau à la place d\'un nombre n\'est plus écarté (plantage)',
     [("  if (typeof v !== 'string') return { t: 'vide' };\n  const s = v.replace", "  const s = v.replace")], 'GARDE'),
    ('M73 une note numérique est perdue',
     [("  if (typeof v === 'number' && isFinite(v)) return String(v);\n  return typeof v === 'string' ? v.trim() : '';", "  return typeof v === 'string' ? v.trim() : '';")], 'GARDE'),
    ('M74 un nom numérique est perdu (« (exercice sans nom) »)',
     [("function _texteCourt(v, max) {\n  if (typeof v === 'number' && isFinite(v)) v = String(v);\n", "function _texteCourt(v, max) {\n")], 'GARDE'),
    ('M75 specialSets qui n\'est pas un tableau fait planter le normaliseur (seul le test hostile le voit)',
     [("(Array.isArray(brut.specialSets) ? brut.specialSets : []).forEach", "(brut.specialSets || []).forEach")], 'GARDE'),
    ('M76 restPerSet qui n\'est pas un tableau fait planter le normaliseur (seul le test hostile le voit)',
     [("let rps = Array.isArray(brut.restPerSet) ? brut.restPerSet.map(_repos) : [];", "let rps = (brut.restPerSet || []).map(_repos);")], 'GARDE'),
    # ── ce que le lot ne doit PAS toucher (les témoins de non-régression doivent mordre) ───────────────────────────
    ('M50 le prompt d\'import d\'HISTORIQUE change',
     [('JAMAIS "E" ni "W".\\n\\n4. NOMS', 'JAMAIS "E".\\n\\n4. NOMS')], 'GARDE'),
    ('M51 la normalisation de l\'historique change (le type W est gardé)',
     [("s.type = s.type === 'D' ? 'D' : '';", 's.type = s.type;')], 'GARDE'),
    ('M52 le pont d\'identité S1 devient fail-OPEN',
     [("catch (e) { return { ok: false, raison: 'reseau' }; }", "catch (e) { return { ok: true, email: 'x@x.x', premium: false, blocked: false }; }")], 'GARDE'),
    ('M53 le relais attrape-tout perd le corps de la requête',
     [('        body: raw,', "        body: '{}',")], 'GARDE'),
    ('M54 le budget de la conversation (coach) change',
     [('const d = await callClaudeDiag(apiKey, { model, max_tokens: 1024, system, messages }, meta);',
       'const d = await callClaudeDiag(apiKey, { model, max_tokens: 4096, system, messages }, meta);')], 'GARDE'),
    # ── les témoins ne doivent PAS épingler l'implémentation : ces changements, tolérés par le contrat, restent verts ─
    ('N01 [neutre] plafond de la liste à 11 000 au lieu de 12 000 (« ≈ 12 000 »)',
     [('const PROG_CATALOGUE_MAX = 12000;', 'const PROG_CATALOGUE_MAX = 11000;')], 'NEUTRE'),
    ('N02 [neutre] le nombre d\'entrées examinées du catalogue passe de 5000 à 4000',
     [('i < l.length && i < 5000', 'i < l.length && i < 4000')], 'NEUTRE'),
]


def empreinte():
    h = hashlib.sha256()
    for f in FICHIERS:
        h.update(open(os.path.join(SRC, f), 'rb').read())
    return h.hexdigest()


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_iif_')
    for f in FICHIERS:
        d = os.path.join(tmp, f)
        os.makedirs(os.path.dirname(d), exist_ok=True)
        shutil.copy2(os.path.join(SRC, f), d)
    return tmp


def banc(arbre, tz=None):
    env = dict(os.environ, HTTP_PROXY=MORT, HTTPS_PROXY=MORT, ALL_PROXY=MORT, http_proxy=MORT, https_proxy=MORT, all_proxy=MORT)
    if tz:
        env['TZ'] = tz
    r = subprocess.run(['node', 'tools/banc_import_worker_contrat.js'], cwd=arbre, capture_output=True, text=True, timeout=300, env=env)
    out = r.stdout + r.stderr
    rouges = [l.strip()[:150] for l in out.split('\n') if l.startswith('❌ ROUGE')]
    total = re.search(r'──── (\d+) OK / (\d+) rouge ────', out)
    plantage = 'PLANTAGE' in out
    return {'rouges': rouges, 'ok': int(total.group(1)) if total else None, 'ko': int(total.group(2)) if total else None,
            'plantage': plantage, 'code': r.returncode}


def sain(etiquette, tz=None):
    tmp = cloner()
    try:
        b = banc(tmp, tz)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    vert = b['ko'] == 0 and not b['plantage'] and b['code'] == 0 and b['ok'] and b['ok'] > 150
    print('  %s  banc sain %-26s %s' % ('OK ' if vert else '!! ', etiquette, '%s OK / %s rouge' % (b['ok'], b['ko'])))
    if not vert:
        print('        ', b['rouges'][:3], 'plantage' if b['plantage'] else '')
    return vert


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    avant = empreinte()
    ok_sain = True
    ok_sain &= sain('AVANT (fuseau de l\'hote)')
    ok_sain &= sain('AVANT (TZ=UTC)', 'UTC')
    ok_sain &= sain('AVANT (TZ=Pacific/Kiritimati)', 'Pacific/Kiritimati')
    if not ok_sain:
        print('\n  !! BANC SAIN DEJA ROUGE — controle refuse'); return 1
    print()
    conformes = total = invalides = 0
    for nom, remplacements, attendu in MUT:
        if filtres and not any(nom.startswith(f) for f in filtres):
            continue
        total += 1
        tmp = cloner()
        try:
            src = open(os.path.join(tmp, W), encoding='utf-8').read()
            ko = []
            for av, ap in remplacements:
                n = src.count(av)
                if n != 1:
                    ko.append('%s (x%d)' % (av[:60].replace('\n', '\\n'), n))
                else:
                    src = src.replace(av, ap, 1)
            if ko:
                print('  INVALIDE  %s (ancre absente ou multiple : %s)' % (nom, ko)); invalides += 1; continue
            open(os.path.join(tmp, W), 'w', encoding='utf-8').write(src)
            b = banc(tmp)
        finally:
            shutil.rmtree(tmp, ignore_errors=True)
        if b['ko'] is None:
            print('  INVALIDE  %s (le banc n\'a pas fini : code %s)' % (nom, b['code'])); invalides += 1; continue
        # un PLANTAGE n'est pas un temoin rouge : il faut au moins une ligne ROUGE ecrite par un temoin
        obtenu = 'GARDE' if b['rouges'] else 'OK'
        conforme = (obtenu == 'GARDE') if attendu == 'GARDE' else (obtenu == 'OK' and not b['plantage'])
        conformes += conforme
        print('  %s  %-100s %-5s %3d rouge  %s' % ('OK ' if conforme else '!! ', nom, obtenu, len(b['rouges']),
              (b['rouges'][0][9:110] if b['rouges'] else ('PLANTAGE' if b['plantage'] else ''))))
        if os.environ.get('MUT_DETAIL'):
            for r in b['rouges']:
                print('        ' + r)
    print()
    apres_ok = sain('APRES (fuseau de l\'hote)')
    depot_intact = (empreinte() == avant)
    print('  %s  le depot n\'a pas bouge (empreinte des 5 fichiers identique avant / apres)' % ('OK ' if depot_intact else '!! '))
    print('\n%d/%d conformes (%d invalide(s))' % (conformes, total, invalides))
    return 0 if (conformes == total and invalides == 0 and apres_ok and depot_intact) else 1


if __name__ == '__main__':
    raise SystemExit(main())
