#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTRÔLE CIBLÉ — l'exception ft-v1263 du contrôle 12 de tools/check_regles.py (03/11/2026).

POURQUOI. L'archive porte deux entrées `**ft-v1263 —` : le CONTENU de la version (commit 68ad9f9a) et la PUBLICATION CONSTATÉE, écrite en « ajout »
(commit 2bf7737d) — deux événements, pas deux copies. Le contrôle 12 les signalait ; il a reçu une exception NOMMÉE ET CIBLÉE. Une exception qu'on ne
teste pas devient un trou : ce fichier vérifie QUE l'exception reste étroite, et QUE ce test sait rougir.

COMMENT. Le VRAI bloc du contrôle 12 est extrait de tools/check_regles.py (jamais recopié : si on le modifie, ce test le lit modifié) et exécuté sur des archives
SYNTHÉTIQUES dans un dossier jetable — le dépôt n'est jamais écrit, l'archive réelle n'est que LUE.
  Conditions de l'exception : (a) exactement DEUX entrées · (b) la DERNIÈRE s'ouvre sur « publication constatée » · (c) AUCUNE autre n'y ouvre.
  Scénarios (ce que le contrôle doit répondre) :
    S0  l'archive réelle                                          -> ✅, « 2 exceptions documentées »
    S1  une TROISIÈME entrée, DIFFÉRENTE, avant l'ajout           -> ❌ « 3 entrées au lieu de 2 » (seule la condition a la voit)
    S2  la dernière entrée REMPLACÉE par une copie de la 1ʳᵉ     -> ❌ « ne s'ouvre pas sur » (condition b : une copie ne passe pas)
    S2b la 1ʳᵉ entrée REMPLACÉE par une copie de la dernière      -> ❌ « s'ouvre aussi sur » (condition c : deux ajouts identiques non plus)
    S3  une copie de l'entrée ft-v1262 en plus                    -> ❌ « écrite(s) DEUX fois — ft-v1262 » (la protection GÉNÉRALE reste active)
    S4  la dernière entrée ft-v1263 SUPPRIMÉE (archive consolidée)-> ✅ (écrite une seule fois : aucune exception à exercer, aucune fausse alerte)
    S5  la dernière entrée ne s'ouvre plus sur « publication constatée » -> ❌ (condition b : l'ajout doit rester identifiable)
  Mutations du CONTRÔLE lui-même (chacune doit faire dévier les scénarios nommés — sinon le test ne mord pas) :
    K1 l'exception est retirée de la liste                        -> S0 doit rougir
    K2 la condition (a) « exactement deux entrées » est retirée   -> S1 doit cesser de rougir
    K3 la condition (b) « la dernière s'ouvre sur la marque » est retirée -> S2 et S5 doivent cesser de rougir
    K4 la condition (c) « aucune autre n'y ouvre » est retirée    -> S2b doit cesser de rougir
    K5 la protection générale est désactivée (plus aucun doublon signalé) -> S3 doit cesser de rougir
Usage : python3 tools/mut_check_regles_archive.py
"""
import contextlib, io, os, pathlib, re, sys, tempfile

RACINE = pathlib.Path(__file__).resolve().parent.parent
DEBUT = "# ── CONTRÔLE 12 — L'ARCHIVE NE PORTE JAMAIS DEUX FOIS LA MÊME ENTRÉE"
FIN = "# ══ 🩹 AUCUN MARQUEUR DE CONFLIT NE PART EN PRODUCTION"
ENTREE = r"(?ms)^\*\*%s —.*?(?=^\*\*ft-v\d+ —|\Z)"


def bloc(src):
    if src.count(DEBUT) != 1 or src.count(FIN) != 1:
        print('  !! BORNES DU CONTRÔLE 12 INTROUVABLES OU MULTIPLES dans tools/check_regles.py — le test ne peut rien dire'); sys.exit(2)
    a, b = src.index(DEBUT), src.index(FIN)
    if a >= b:
        print('  !! BORNES INVERSÉES'); sys.exit(2)
    return src[a:b]


def jouer(code, archive):
    """Exécute le bloc sur UNE archive synthétique ; rend (sortie, code de sortie ou None)."""
    with tempfile.TemporaryDirectory(prefix='mut_archive_') as t:
        (pathlib.Path(t) / 'docs').mkdir()
        (pathlib.Path(t) / 'docs' / 'JOURNAL-ARCHIVE.md').write_text(archive, encoding='utf-8')
        ns = {'re': re, 'sys': sys, 'racine': pathlib.Path(t), 'pathlib': pathlib}
        tampon, sortie = io.StringIO(), None
        with contextlib.redirect_stdout(tampon):
            try:
                exec(compile(code, 'controle12', 'exec'), ns)
            except SystemExit as e:
                sortie = e.code if e.code is not None else 0
        return tampon.getvalue(), sortie


def entrees(archive, v):
    return [(m.start(), m.end()) for m in re.finditer(ENTREE % re.escape(v), archive)]


def scenarios(reelle):
    e = entrees(reelle, 'ft-v1263')
    assert len(e) == 2, 'l\'archive réelle doit porter DEUX entrées ft-v1263 (elle en porte %d) — l\'exception n\'a plus d\'objet' % len(e)
    (a1, b1), (a2, b2) = e
    e62 = entrees(reelle, 'ft-v1262')
    assert len(e62) == 1, 'ft-v1262 doit être écrite une fois (%d)' % len(e62)
    S = {}
    S['S0'] = (reelle, 'ok', '2 exceptions documentées')
    S['S1'] = (reelle[:a2] + "**ft-v1263 — essai d'une TROISIÈME entrée (avant l'ajout).** Corps différent, ajouté par ce test.\n\n" + reelle[a2:], 'rouge', '3 entrées au lieu de 2')
    S['S2'] = (reelle[:a2] + reelle[a1:b1].rstrip('\n') + '\n' + reelle[b2:], 'rouge', "ne s'ouvre pas sur")
    S['S2b'] = (reelle[:a1] + reelle[a2:b2].rstrip('\n') + '\n\n' + reelle[b1:], 'rouge', "s'ouvre aussi sur")
    S['S3'] = (reelle.rstrip('\n') + '\n\n' + reelle[e62[0][0]:e62[0][1]].strip('\n') + '\n', 'rouge', 'DEUX fois — ft-v1262')
    S['S4'] = (reelle[:a2] + reelle[b2:], 'ok', 'aucune écrite deux fois')
    S['S5'] = (reelle[:a2] + reelle[a2:b2].replace('**ft-v1263 — publication constatée', '**ft-v1263 — complément', 1) + reelle[b2:], 'rouge', "ne s'ouvre pas sur")
    return S


def verdict(code, archive, attendu, motif):
    sortie, rc = jouer(code, archive)
    if attendu == 'ok':
        bon = rc is None and '✅ archive' in sortie and '❌' not in sortie and motif in sortie
    else:
        bon = rc == 1 and '❌ archive' in sortie and motif in sortie
    return bon, (sortie.strip().split('\n')[0] if sortie.strip() else '(aucune sortie)'), rc


def main():
    src = (RACINE / 'tools' / 'check_regles.py').read_text(encoding='utf-8')
    code = bloc(src)
    reelle = (RACINE / 'docs' / 'JOURNAL-ARCHIVE.md').read_text(encoding='utf-8')
    S = scenarios(reelle)
    ko = 0
    print('── scénarios, sur le contrôle 12 TEL QU\'IL EST ──')
    for nom, (arch, attendu, motif) in S.items():
        bon, ligne, rc = verdict(code, arch, attendu, motif)
        print('  %s %s attendu=%-5s code=%s | %s' % ('OK    ' if bon else 'ROUGE ', nom, attendu, rc, ligne[:120]))
        ko += not bon
    if ko:
        print('  !! LE CONTRÔLE NE FAIT PAS CE QU\'ON ATTEND SUR L\'ARBRE SAIN — les mutations ne diraient rien'); return 1
    MUT = [
        ('K1 l\'exception ft-v1263 est retirée de la liste', '_EXCEPTIONS = {"ft-v887"} | set(_CIBLEES)', '_EXCEPTIONS = {"ft-v887"}', ['S0']),
        ('K2 la condition (a) « exactement deux entrées » est retirée', 'if len(_corps) != _c["entrees"]:', 'if False:', ['S1']),
        ('K3 la condition (b) « la dernière s\'ouvre sur la marque » est retirée', 'if not _corps[-1].startswith(_c["marque"]):', 'if False:', ['S2', 'S5']),
        ('K4 la condition (c) « aucune autre n\'y ouvre » est retirée', 'if any(_x.startswith(_c["marque"]) for _x in _corps[:-1]):', 'if False:', ['S2b']),
        ('K5 la protection générale est désactivée (plus aucun doublon signalé)', '_dbl = sorted({v for v in _vus if _vus.count(v) > 1} - _EXCEPTIONS,', '_dbl = sorted({v for v in _vus if _vus.count(v) > 1000000} - _EXCEPTIONS,', ['S3']),
    ]
    print('── mutations du contrôle (chacune doit faire dévier le scénario nommé) ──')
    conformes = 0
    for nom, old, new, attendus in MUT:
        if code.count(old) != 1:
            print('  !! ANCRE INTROUVABLE OU MULTIPLE (%d) : %s' % (code.count(old), nom)); return 1
        mute = code.replace(old, new)
        devies = []
        for sc, (arch, attendu, motif) in S.items():
            bon, ligne, rc = verdict(mute, arch, attendu, motif)
            if not bon:
                devies.append(sc)
        ok = all(a in devies for a in attendus)
        conformes += ok
        print('  %s %s -> scénario(s) qui dévient : %s' % ('TUEE      ' if ok else 'SURVIVANTE', nom, ' '.join(devies) or 'aucun'))
    print('\n%d/%d tuées (conformes)' % (conformes, len(MUT)))
    return 0 if conformes == len(MUT) else 1


if __name__ == '__main__':
    sys.exit(main())
