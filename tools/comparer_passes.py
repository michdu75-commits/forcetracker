#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""COMPARE une passe RÉPARTIE (tools/passe_repartie.py) à une passe SÉQUENTIELLE (tools/passe_valide.sh) du MÊME commit,
témoin par témoin — PROPOSITION (OPTI-TEST-02 · FINALISATION), à n'adopter qu'avec la passe répartie.
Une passe = un journal (.log, passe séquentielle) ou un dossier (p0.log … p<K-1>.log, et banc-*.log s'il y en a).

On compare des MULTIENSEMBLES de (libellé, verdict) — un même libellé peut revenir (boucles). ⛔ AUCUNE normalisation.
Ce que la répartition change, et SEULEMENT ça, est attendu et vérifié :
  · les témoins de l'INFRASTRUCTURE DU GARDE (D031S-I : preuve au début ; D031S-II : vérification à la fermeture) sont
    joués dans CHAQUE processus : chaque processus doit les porter TOUS, exactement comme la référence les porte, et la
    réunion les porte donc K fois ;
  · tout le reste doit être IDENTIQUE : même nombre, mêmes libellés, mêmes verdicts.
Les bancs (« contrôles particuliers », lignes OK / !!) se comparent à part, banc par banc.
⚠️ NORMALISATION : AUCUNE par défaut. --normaliser regles.json ([[regex, remplacement, raison], …]) ne sert qu'à neutraliser
une valeur d'HORLOGE affichée dans un libellé, et seulement si la règle a été ÉTABLIE en comparant deux passes SÉQUENTIELLES
(R0 ↔ R1) — jamais pour faire disparaître un écart de la passe répartie. Chaque libellé touché est compté dans la sortie.
Usage : python3 tools/comparer_passes.py <référence : journal ou dossier> <candidat : dossier ou journal> [--normaliser regles.json] [--json sortie.json]   (code 0 = identique)"""
import collections, json, os, re, sys

RE_T = re.compile(r'^\s+(✅|❌) (.*)$')
RE_B = re.compile(r'^\s+(OK|!!)\s+(.*?)(?:\s{3}.*)?$')
RE_INFRA = re.compile(r'^D031S-II? ')          # « D031S-I » et « D031S-II » (pas « D031S-III »)


REGLES = []; TOUCHES = collections.Counter()


def norm(lib):
    for rx, rep, _ in REGLES:
        n = re.sub(rx, rep, lib)
        if n != lib: TOUCHES[rx] += 1; lib = n
    return lib


def temoins(f):
    out = []
    for l in open(f, encoding='utf-8', errors='replace'):
        m = RE_T.match(l.rstrip('\n'))
        if m: out.append((norm(m.group(2)), 'ok' if m.group(1) == '✅' else 'ko'))
    return out


def banc(f):
    out = []
    for l in open(f, encoding='utf-8', errors='replace'):
        m = RE_B.match(l.rstrip('\n'))
        if m: out.append((m.group(2).strip(), 'ok' if m.group(1) == 'OK' else 'ko'))
    return out


def passe(d):
    if os.path.isfile(d): return [temoins(d)], {}
    fs = sorted(x for x in os.listdir(d) if re.match(r'p\d+\.log$', x))
    bs = sorted(x for x in os.listdir(d) if x.startswith('banc-') and x.endswith('.log'))
    return [temoins(os.path.join(d, f)) for f in fs], {b[5:-4]: banc(os.path.join(d, b)) for b in bs}


def ecarts(A, B):
    CA, CB = collections.Counter(A), collections.Counter(B)
    LA, LB = collections.Counter(l for l, _ in A), collections.Counter(l for l, _ in B)
    seulA = {k for k, v in CA.items() if v > CB[k]}; seulB = {k for k, v in CB.items() if v > CA[k]}
    verdict = sorted({l for (l, _) in seulA | seulB if LA[l] == LB[l]})
    return {'identiques': CA == CB,
            'verdict_change': [{'lib': l[:200], 'ref': {v: CA[(l, v)] for v in ('ok', 'ko') if CA[(l, v)]},
                                'cand': {v: CB[(l, v)] for v in ('ok', 'ko') if CB[(l, v)]}} for l in verdict],
            'manquants': [{'lib': l[:200], 'ref': LA[l], 'cand': LB[l]} for l in sorted({l for l, _ in seulA if LA[l] > LB[l]})],
            'en_plus': [{'lib': l[:200], 'ref': LA[l], 'cand': LB[l]} for l in sorted({l for l, _ in seulB if LB[l] > LA[l]})]}


def main():
    ref, cand = sys.argv[1], sys.argv[2]
    sortie = sys.argv[sys.argv.index('--json') + 1] if '--json' in sys.argv else None
    if '--normaliser' in sys.argv:
        REGLES.extend(json.load(open(sys.argv[sys.argv.index('--normaliser') + 1], encoding='utf-8')))
    PR, BR = passe(ref); PC, BC = passe(cand)
    if len(PR) != 1: print('la référence doit être une passe classique (un seul processus)'); return 2
    R = PR[0]; K = len(PC)
    infra_ref = collections.Counter(x for x in R if RE_INFRA.match(x[0]))
    res = {'reference': ref, 'candidat': cand, 'K': K,
           'ref': {'temoins': len(R), 'ok': sum(v == 'ok' for _, v in R), 'ko': sum(v == 'ko' for _, v in R), 'infra_garde': sum(infra_ref.values())}}
    # ① chaque processus porte TOUTE l'infrastructure du garde, verts
    par_proc = []
    for i, P in enumerate(PC):
        ip = collections.Counter(x for x in P if RE_INFRA.match(x[0]))
        par_proc.append({'p': i, 'temoins': len(P), 'infra_garde': sum(ip.values()), 'infra_identique': ip == infra_ref})
    res['processus'] = par_proc
    res['garde_dans_chaque_processus'] = all(x['infra_identique'] for x in par_proc) and all(v == 'ok' for (_, v) in infra_ref)
    # ② la réunion, moins (K-1) copies de l'infrastructure du garde, est IDENTIQUE à la référence
    U = collections.Counter(x for P in PC for x in P)
    for k, v in infra_ref.items(): U[k] -= (K - 1) * v
    neg = {k: v for k, v in U.items() if v < 0}
    Ul = [x for x, n in U.items() for _ in range(max(n, 0))]
    e = ecarts(R, Ul)
    res['union'] = {'temoins_bruts': sum(len(P) for P in PC), 'apres_infra': len(Ul), 'ok': sum(v == 'ok' for _, v in Ul), 'ko': sum(v == 'ko' for _, v in Ul)}
    res['infra_negative'] = [k[0][:160] for k in neg]
    res['runner'] = e
    # ③ les bancs, un par un
    res['bancs'] = {}
    if not BR and BC:          # référence = un journal séquentiel seul : les bancs du candidat ne sont pas comparés (dit, pas caché)
        print('   (bancs du candidat NON comparés : la référence n\'en a pas) : ' + ', '.join(sorted(BC)))
        BC = {}
    for b in sorted(set(BR) | set(BC)):
        if b not in BR or b not in BC: res['bancs'][b] = {'identiques': False, 'absent': 'référence' if b not in BR else 'candidat'}; continue
        eb = ecarts(BR[b], BC[b]); eb['ref'] = len(BR[b]); eb['cand'] = len(BC[b]); res['bancs'][b] = eb
    res['normalisation'] = {'regles': [[r[0], r[1], r[2]] for r in REGLES], 'libelles_touches': dict(TOUCHES)}
    res['identique'] = bool(res['garde_dans_chaque_processus'] and e['identiques'] and not neg and all(x['identiques'] for x in res['bancs'].values()))
    print('référence : %(temoins)d témoins (%(ok)d ✅ · %(ko)d ❌), dont %(infra_garde)d de l\'infrastructure du garde' % res['ref'])
    print('candidat  : K=%d · %d témoins bruts → %d après les %d copies attendues du garde (%d ✅ · %d ❌)' % (
        K, res['union']['temoins_bruts'], res['union']['apres_infra'], (K - 1) * res['ref']['infra_garde'], res['union']['ok'], res['union']['ko']))
    for x in par_proc: print('   processus %(p)d : %(temoins)d témoins, garde %(infra_garde)d, identique à la référence : %(infra_identique)s' % x)
    for b, eb in res['bancs'].items(): print('   banc %s : %s' % (b, 'IDENTIQUE (%d)' % eb['ref'] if eb.get('identiques') else 'DIFFÉRENT ' + json.dumps({k: eb[k] for k in eb if k not in ('identiques',)}, ensure_ascii=False)[:300]))
    if REGLES: print('normalisation : %d règle(s), %d libellé(s) touché(s) au total (référence + candidat)' % (len(REGLES), sum(TOUCHES.values())))
    print('IDENTIQUE témoin par témoin :', 'OUI' if res['identique'] else 'NON')
    for k, t in (('verdict_change', 'verdict changé'), ('manquants', 'manquants dans le candidat'), ('en_plus', 'en plus dans le candidat')):
        if e[k]:
            print('  %s : %d' % (t, len(e[k])))
            for x in e[k][:15]: print('     ·', json.dumps(x, ensure_ascii=False)[:300])
    if neg: print('  infrastructure du garde MANQUANTE dans un processus :', res['infra_negative'][:5])
    if sortie: json.dump(res, open(sortie, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return 0 if res['identique'] else 1


if __name__ == '__main__':
    sys.exit(main())
