#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — AIDES (audit des aides du clone du 17/10, verifie sur le code D-093 ; lot final ft-v1257, 20/10/2026) :
les temoins B-AID-* savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord ; l'arbre sain est REJOUE a la fin (banc stable).
M00 remet les 4 fichiers d'aide tels qu'ils etaient AVANT la correction (9b51d6fb), mot pour mot : tous les temoins de contenu
y rougissent, le temoin d'hygiene (B-AID-⑤) y reste vert.
M-<id> : UNE phrase corrigee redevient l'ancienne (texte exact) — son temoin doit rougir. Les textes viennent de la table des
corrections, octet pour octet (generes, jamais recopies a la main).
F-* : c'est l'ECRAN qui change, pas l'aide — le temoin qui confronte l'aide a l'ecran doit rougir aussi.
[equivalente] : une reformulation qui ne change aucune affirmation ne doit PAS rougir.
Un PLANTAGE du banc (code hors 0/1, ligne PLANTAGE, pas de ligne de total) n'est jamais « garde ».
⛔ Aucune mutation ne fait d'appel reel : le banc coupe toute requete hors du serveur local ; Milo n'est jamais appele.
Usage : python3 tools/mut_aides_audit.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_J=1 par defaut)
"""
import os, re, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = '9b51d6fb'          # le code d'avant la correction des aides (lot final : 4 corrections + D-031 Securite)
FICHIERS = ('screens.js', 'coach.js', 'app.js', 'constants.js')
FICHIERS_MUT = FICHIERS + ('index.html', 'style.css')
CONTENU = ('B-AID-①a', 'B-AID-①b', 'B-AID-②a', 'B-AID-②b', 'B-AID-②c', 'B-AID-②d', 'B-AID-②e', 'B-AID-②f', 'B-AID-②g',
           'B-AID-②h', 'B-AID-②i', 'B-AID-③a', 'B-AID-③b', 'B-AID-③c', 'B-AID-④a', 'B-AID-④b', 'B-AID-④c')

MUT = [
    ("M00 les 4 fichiers d'aide d'AVANT la correction (9b51d6fb), mot pour mot", 'AVANT', 'GARDE', CONTENU),
    ('M-A1-NN la phrase fausse revient (screens.js)', [('screens.js', 'Ton score de récup (noté sur 100) estime', 'Ton score de récup (sur NN/100) estime')], 'GARDE', ('B-AID-①b',)),
    ('M-A1-NN-AD la phrase fausse revient (coach.js)', [('coach.js', "Ton score de récupération (sur l\\'Accueil, noté sur 100) estime", "Ton score de récupération (sur l\\'Accueil, NN/100) estime")], 'GARDE', ('B-AID-①b',)),
    ('M-A2-BIG3 la phrase fausse revient (screens.js)', [('screens.js', 'Tes records (PRs) se mettent à jour automatiquement — retrouve-les dans Progrès → <b>Exercices</b>.', 'Les PRs se mettent à jour automatiquement. Le Big 3 (Squat + DC + SDT) est ton indicateur de force globale.')], 'GARDE', ('B-AID-③b',)),
    ('M-A3-CYCLE la phrase fausse revient (screens.js)', [('screens.js', 'se configure dans Menu ☰ → <b>Tes outils</b> → <b>Cycle de force</b>.', 'se configure dans Profil → Cycle de force.')], 'GARDE', ('B-AID-③c',)),
    ('M-A4-BADGES la phrase fausse revient (screens.js)', [('screens.js', 'Tes badges sont dans Menu ☰ → <b>Ton suivi</b> → <b>Badges</b>.', 'Tes badges débloqués récemment apparaissent ici. Pour tout voir : Menu ☰ → <b>Ton suivi</b> → <b>Badges</b>.')], 'GARDE', ('B-AID-③a',)),
    ('M-S2-MENU la phrase fausse revient (screens.js)', [('screens.js', '(pause, date, tout dérouler, grouper, programmes, importer un historique, aide, vider, abandonner)', '(pause, date, tout dérouler, grouper, programmes, aide, vider, abandonner)')], 'GARDE', ('B-AID-②g',)),
    ('M-S2-REGLER la phrase fausse revient (screens.js)', [('screens.js', 'touche le temps (✎) pour <b>régler</b> : 30 s · 45 s · 1:00 · 1:30 · 2:00 ou une durée exacte', 'touche le temps (✎) pour <b>régler</b> : 1:00 · 1:30 · 2:00 ou une durée exacte')], 'GARDE', ('B-AID-②h',)),
    ('M-S3-ASTER la phrase fausse revient (screens.js)', [('screens.js', "t:'<b>Le cardio d\\'un programme va dans le bloc Cardio</b>, plus", "t:'\\ud83c\\udfc3 **Le cardio d\\'un programme va dans le bloc Cardio**, plus")], 'GARDE', ('B-AID-①a',)),
    ('M-S4-ICONE la phrase fausse revient (screens.js)', [('screens.js', "t:'L\\'aper\\u00e7u d\\'import", "t:'\\u26a0\\ufe0f L\\'aper\\u00e7u d\\'import")], 'GARDE', ('B-AID-①a',)),
    ('M-S7-ROUGE la phrase fausse revient (screens.js)', [('screens.js', 'le <b>gros bouton bleu du bas</b>', 'le <b>gros bouton rouge du bas</b>')], 'GARDE', ('B-AID-②a',)),
    ('M-S12-REGLER la phrase fausse revient (screens.js)', [('screens.js', 'les presets 30 s/45 s/1:00/1:30/2:00 sont dans « Régler »', 'les presets 1:00/1:30/2:00 sont dans « Régler »')], 'GARDE', ('B-AID-②h',)),
    ('M-S13-DROP la phrase fausse revient (screens.js)', [('screens.js', "Sur la carte ouverte d\\'un exercice : 📉 Drop (série dégressive) et 📈 +% (pyramide montante) — tu choisis le nombre de paliers et le pourcentage.", 'Boutons 📉 Drop / 📈 +10% / 📉 −10% pour pyramides et drop sets.')], 'GARDE', ('B-AID-②d',)),
    ('M-S19-STATS la phrase fausse revient (screens.js)', [('screens.js', "⋯ d\\'un exercice → « 📊 Statistiques » : graphique du poids max sur les 5 dernières séances.", 'Bouton 📊 sur chaque exercice → graphique du poids max sur les 5 dernières séances.')], 'GARDE', ('B-AID-②b',)),
    ('M-S20-1RM la phrase fausse revient (screens.js)', [('screens.js', "Le 1RM estimé (Brzycki) s\\'affiche en temps réel dans sa colonne « 1RM » — utilise-le pour calibrer tes charges. L\\'aide sur les types : ⋯ d\\'un exercice → « ℹ️ Types de série ».", "Le 1RM (Brzycki) s\\'affiche en temps réel sous le type — utilise-le pour calibrer tes charges. Appuie sur ℹ️ pour l\\'aide sur les types.")], 'GARDE', ('B-AID-②c',)),
    ('M-S21-PHOTO la phrase fausse revient (screens.js)', [('screens.js', "« ℹ️ Types de série ».'},\n", "« ℹ️ Types de série ».'},\n      {i:'📸',t:'Bouton 📸 pour importer un programme depuis une photo, un fichier Word ou Excel — l\\'IA le convertit en séance automatiquement.'},\n")], 'GARDE', ('B-AID-②e',)),
    ('M-AD16-ROUGE la phrase fausse revient (coach.js)', [('coach.js', "⭐ <b>Un seul bouton enregistre : le grand bouton bleu du bas de l\\'écran Séance</b> (le même que « Terminer » en haut) :", "⭐ <b>Un seul bouton rouge par écran, et c\\'est celui qui enregistre.</b> En bas de l\\'écran Séance :")], 'GARDE', ('B-AID-②a',)),
    ('M-AD16-AVANT la phrase fausse revient (coach.js)', [('coach.js', 'Avant le 04/09/2026 le bouton du bloc avait la même couleur et disait', 'Avant le 04/09/2026 le bouton du bloc était rouge lui aussi et disait')], 'GARDE', ('B-AID-②a',)),
    ('M-GUIDE-ROUGE la phrase fausse revient (app.js)', [('app.js', "C\\'est le <b>gros bouton bleu du bas</b> (le même que « Terminer » en haut) qui inscrit la séance dans ton historique — un seul bouton enregistre, et c\\'est toujours celui-là.", "C\\'est le <b>gros bouton rouge du bas</b> qui inscrit la séance dans ton historique — un seul bouton rouge par écran, et c\\'est toujours celui-là.")], 'GARDE', ('B-AID-②a',)),
    ('M-AD17-PLUS la phrase fausse revient (coach.js)', [('coach.js', "Bouton rouge central « + » en bas de l\\'écran.", "Bouton rouge central ⚡ en bas de l\\'écran (le « + »).")], 'GARDE', ('B-AID-②i',)),
    ('M-AD18-MENU la phrase fausse revient (coach.js)', [('coach.js', '(pause, date, tout dérouler, grouper, programmes, importer un historique, vider, abandonner)', '(pause, date, tout dérouler, grouper, programmes, vider, abandonner)')], 'GARDE', ('B-AID-②g',)),
    ('M-AD18-REGLER la phrase fausse revient (coach.js)', [('coach.js', '; 30 s · 45 s · 1:00 · 1:30 · 2:00 sont dans <b>Régler</b>', '; 1:00 · 1:30 · 2:00 sont dans <b>Régler</b>')], 'GARDE', ('B-AID-②h',)),
    ('M-AD21-DROP la phrase fausse revient (coach.js)', [('coach.js', "Sur la carte ouverte d\\'un exercice : 📉 Drop (série dégressive, −20 % par palier par défaut) · 📈 +% (pyramide montante, +10 % par défaut) — tu choisis le nombre de paliers et le pourcentage.", 'Sous chaque exercice : 📉 Drop set (−10% auto) · 📈 Pyramide + (+10%) · 📉 Pyramide − (−10%).')], 'GARDE', ('B-AID-②d',)),
    ('M-AD29-STATS la phrase fausse revient (coach.js)', [('coach.js', "En séance, ⋯ d\\'un exercice → « 📊 Statistiques » : graphique du poids max sur les 5 dernières séances.", 'Bouton 📊 sur chaque exercice en séance → graphique du poids max sur les 5 dernières séances.')], 'GARDE', ('B-AID-②b',)),
    ('M-AD32-CARDIO la phrase fausse revient (coach.js)', [('coach.js', 'Bloc cardio sous tes exercices (replié par défaut).', 'Bloc cardio en haut de séance (replié par défaut).')], 'GARDE', ('B-AID-②f',)),
    ('M-AD33-ASTER la phrase fausse revient (coach.js)', [('coach.js', "\\ud83c\\udfc3 <b>Le cardio d\\'un programme va dans le bloc Cardio</b>, plus", "\\ud83c\\udfc3 **Le cardio d\\'un programme va dans le bloc Cardio**, plus")], 'GARDE', ('B-AID-①a',)),
    ('M-AD33-PREM la phrase fausse revient (coach.js)', [('coach.js', 'Bouton 🤖 (Premium) pour une analyse IA de ton programme.', 'Bouton 🤖 pour une analyse IA de ton programme.')], 'GARDE', ('B-AID-④a',)),
    ('M-AD37-IMPORT la phrase fausse revient (coach.js)', [('coach.js', "📋 Mes Programmes → « 📷 Importer un programme » : une photo ou un PDF. L\\'IA en extrait les exercices, séries et charges, et garde tes jours.", 'Bouton 📸 dans la séance pour importer depuis une photo, un fichier Word (.docx) ou Excel (.xlsx). Le Coach IA extrait automatiquement les exercices, séries et charges.')], 'GARDE', ('B-AID-②e',)),
    ('M-GUIDE-ASTER la phrase fausse revient (app.js)', [('app.js', "\\ud83c\\udfc3 <b>Le cardio d\\'un programme va dans le bloc Cardio</b>, plus", "\\ud83c\\udfc3 **Le cardio d\\'un programme va dans le bloc Cardio**, plus")], 'GARDE', ('B-AID-①a',)),
    ('M-AD55-ICONE la phrase fausse revient (coach.js)', [('coach.js', "{ic:'\\ud83d\\udcc5',", "{ic:'\\U0001F4C5',")], 'GARDE', ('B-AID-①a',)),
    ('M-AD55-TEXTE la phrase fausse revient (coach.js)', [('coach.js', '\\ud83d\\udd0b Tout est calcul', '\\U0001F50B Tout est calcul')], 'GARDE', ('B-AID-①a',)),
    ('M-GUIDE-ICONE la phrase fausse revient (app.js)', [('app.js', "{icon:'\\ud83d\\udcc5', t:'On te demande", "{icon:'\\U0001F4C5', t:'On te demande")], 'GARDE', ('B-AID-①a',)),
    ('M-NF-ICONE la phrase fausse revient (constants.js)', [('constants.js', "desc:'\\ud83d\\udcc5 Quand une s", "desc:'\\U0001F4C5 Quand une s")], 'GARDE', ('B-AID-①a',)),
    ('M-C16-PREM la phrase fausse revient (screens.js)', [('screens.js', 'Analyse de programme IA (Premium — bouton 🤖 dans Programmes)', 'Analyse de programme IA (bouton 🤖 dans Programmes)')], 'GARDE', ('B-AID-④a',)),
    ('M-P1-15 la phrase fausse revient (screens.js)', [('screens.js', 'les 15 entrées sont toutes là', 'les 14 entrées sont toutes là')], 'GARDE', ('B-AID-④b',)),
    ('M-P4-SECTIONS la phrase fausse revient (screens.js)', [('screens.js', '(Identité · Objectif · Discipline · Mon ADN sportif · Composition corporelle · Morphologie · Santé · Cycle menstruel pour un profil femme · Accessibilité)', '(Identité · Objectif · Discipline · Composition · Morphologie · Santé · Cycle · Accessibilité)')], 'GARDE', ('B-AID-④c',)),
    # ── c'est l'ECRAN qui change : l'aide devient fausse, le temoin qui confronte doit rougir
    ("F-REGLER le preset « 30 s » de « Regler » devient « 35 s » (l'aide promet toujours 30 s)",
     [('index.html', 'onclick="setRestPreset(30);closeRestEdit()">30&nbsp;s</button>', 'onclick="setRestPreset(30);closeRestEdit()">35&nbsp;s</button>')], 'GARDE', ('B-AID-②h',)),
    ("F-FIN le « Terminer » du bas redevient rouge (l'aide le dit bleu)",
     [('style.css', '.lf-fin{margin-top:12px;font-size:17px;padding:16px;letter-spacing:.3px;background:var(--sea-fill);',
       '.lf-fin{margin-top:12px;font-size:17px;padding:16px;letter-spacing:.3px;background:var(--red);')], 'GARDE', ('B-AID-②a',)),
    # ── [equivalente] : une reformulation sans nouvelle affirmation ne doit PAS rougir
    ("E-RIR [equivalente] « Un tap, c'est tout » devient « Un seul tap »",
     [('screens.js', "Un tap, c\\'est tout, et c\\'est facultatif.", "Un seul tap, et c\\'est facultatif.")], 'OK', ()),
]


def banc(arbre):
    """Rend (rouges, plantage). Un plantage n'est jamais un rouge : il n'attrape rien."""
    try:
        r = subprocess.run(['node', 'tools/banc_aides_audit.js'], cwd=arbre, capture_output=True, text=True, timeout=900,
                           env=dict(os.environ, TZ='Europe/Paris'))
    except subprocess.TimeoutExpired:
        return [], 'PLANTAGE (delai depasse)'
    out = r.stdout + r.stderr
    rouges = [l.strip()[:170] for l in out.split('\n') if 'ROUGE' in l]
    plantage = None
    if r.returncode not in (0, 1):
        plantage = 'PLANTAGE (code %d)' % r.returncode
    elif 'PLANTAGE' in out:
        plantage = 'PLANTAGE (' + next(l.strip()[:120] for l in out.split('\n') if 'PLANTAGE' in l) + ')'
    elif not any(l.startswith('────') and 'OK /' in l for l in out.split('\n')):
        plantage = 'PLANTAGE (aucune ligne de total)'
    return rouges, plantage


def temoin_present(rouges, temoin):
    pat = re.compile(re.escape(temoin) + r'(?![0-9A-Za-z])')
    return any(pat.search(l) for l in rouges)


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_aid_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'clone'))
    return tmp, a


def une(m, avant):
    nom, remplacements, attendu = m[0], m[1], m[2]
    temoins = m[3] if len(m) > 3 else ()
    tmp, arbre = cloner()
    try:
        if isinstance(remplacements, str) and remplacements == 'AVANT':
            cur = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
            if any(not avant[f] for f in FICHIERS) or all(avant[f] == cur[f] for f in FICHIERS):
                return nom, None, "INVALIDE (code d'avant introuvable ou identique)", []
            for f in FICHIERS:
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(avant[f])
        else:
            srcs = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS_MUT}
            invalide = []
            for f, av, ap in remplacements:
                if srcs[f].count(av) != 1:
                    invalide.append('%s:%s (x%d)' % (f, av[:50], srcs[f].count(av)))
                else:
                    srcs[f] = srcs[f].replace(av, ap, 1)
            if invalide:
                return nom, None, 'INVALIDE (ancre absente ou multiple : %s)' % invalide, []
            for f in FICHIERS_MUT:
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(srcs[f])
            # une mutation qui casse la SYNTAXE ne prouve rien (elle rougit tout) : on la refuse
            for f in FICHIERS:
                chk = subprocess.run(['node', '--check', os.path.join(arbre, f)], capture_output=True, text=True)
                if chk.returncode:
                    return nom, None, 'INVALIDE (syntaxe cassee dans %s)' % f, []
        rouges, plantage = banc(arbre)
        if plantage:
            return nom, False, 'PLANTAGE', [plantage] + rouges
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu
        manque = [t for t in temoins if not temoin_present(rouges, t)]
        if ok and manque:
            ok, obtenu = False, 'GARDE sans ' + ', '.join(manque)
        # M00 : le temoin d'hygiene doit rester vert (une mutation qui casse la page ne prouve rien)
        if ok and temoin_present(rouges, 'B-AID-⑤'):
            ok, obtenu = False, 'GARDE avec hygiene rouge'
        return nom, ok, obtenu, rouges
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    avant = {f: subprocess.run(['git', 'show', AVANT + ':' + f], cwd=SRC, capture_output=True, text=True).stdout for f in FICHIERS}
    tmp0, a0 = cloner()
    rouges, plantage = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rouges or plantage:
        print('  !! ARBRE SAIN DEJA ROUGE OU EN PLANTAGE — controle refuse :', ([plantage] if plantage else []) + rouges[:3]); return 1
    print('  arbre sain : 0 rouge (point de depart valide) · MUT_J=%s\n' % os.environ.get('MUT_J', '1'))
    choix = [m for m in MUT if not filtres or any(m[0].startswith(f) for f in filtres)]
    with ThreadPoolExecutor(max_workers=int(os.environ.get('MUT_J', '1'))) as ex:
        res = list(ex.map(lambda m: une(m, avant), choix))
    conformes = 0
    for nom, ok, obtenu, rouges in res:
        if ok is None:
            print('  INVALIDE  %s %s' % (nom, obtenu)); continue
        conformes += ok
        print('  %s  %-90s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0] if rouges else ''))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges[1:]:
                print('        ' + r)
    tmp1, a1 = cloner()
    rouges1, plantage1 = banc(a1)
    shutil.rmtree(tmp1, ignore_errors=True)
    if rouges1 or plantage1:
        print('\n  !! ARBRE SAIN ROUGE AU REJEU FINAL — campagne refusee (banc instable) :', ([plantage1] if plantage1 else []) + rouges1[:3])
        return 1
    print('\n  arbre sain rejoue a la fin : 0 rouge (banc stable)')
    print('\n%d/%d conformes' % (conformes, len(choix)))
    return 0 if conformes == len(choix) else 1


if __name__ == '__main__':
    raise SystemExit(main())
