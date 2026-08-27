#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Génère la section « ÉTAT DES 8 BRIQUES » de DOSSIER-ATHLETE-SUIVI.md — DEPUIS LE CODE.

POURQUOI CE SCRIPT EXISTE (26/08/2026)
Michel : « il faudrait peut-être penser à la remettre à jour, c'est un peu le socle
de l'application non ? ». Mesuré ce jour-là : le dossier n'avait pas bougé depuis le
29/07 — 28 jours, ~350 versions — et il DISAIT FAUX : les briques 5A et 6A y étaient
marquées « ⏳ EN ATTENTE » alors que le code en compte 39 et 41 usages. Elles sont
construites depuis longtemps.

C'est R23 : *un document d'état qu'on ne met pas à jour fait dire des bêtises à celui
qui le lit* — c'est arrivé deux fois dans la seule journée du 26/08 (le clone « supprimé »,
la faille de la boîte à idées déjà réparée).

PRINCIPE, repris de tools/inventaire.py (R13) : ce qui est DÉRIVABLE du code se génère,
il ne s'écrit pas à la main. Un état écrit à la main redevient faux en trois semaines.

⚠️⚠️ LA LIMITE EST RÉELLE ET ELLE EST ÉCRITE DANS LA SORTIE — ne pas la masquer.
Une brique est une INTENTION, pas une fonction. Ce script sait compter des usages de
symboles ; il ne sait pas juger si une intention est honorée. Il mesure donc des
SIGNAUX (« le socle est-il branché ? ») et il le dit. Le jugement reste humain, et la
colonne qui le porte est marquée comme telle.
⛔ Ne jamais faire dire à ce tableau plus que ce qu'il mesure : ce serait remplacer une
fausse précision par une autre (R29/R32).

USAGE :  python3 tools/briques.py           (réécrit la section dans le dossier)
         python3 tools/briques.py --check   (ne réécrit rien, sort 1 si périmé)
"""
import io, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rp(*p): return os.path.join(ROOT, *p)
def rd(f):
    try: return io.open(rp(f), encoding='utf-8', errors='ignore').read()
    except Exception: return ''

FICHIERS = ('app.js', 'coach.js', 'constants.js', 'log.js', 'screens.js',
            'setup.js', 'state.js', 'tracking.js')
SRC = {f: rd(f) for f in FICHIERS}

def _sans_commentaires(t):
    """⚠️ Les commentaires du projet CITENT abondamment les symboles (« brique 7
       Ton histoire sportive »…). Les compter gonflerait le signal d'une brique
       simplement parce qu'on en a beaucoup PARLÉ. C'est le défaut de ft-v1006,
       attrapé trois fois depuis : on mesure le CODE, pas ce qu'on en dit."""
    t = re.sub(r'/\*[\s\S]*?\*/', '', t)
    return re.sub(r"(^|[^:'\"])//[^\n]*", r'\1', t)

CODE = {f: _sans_commentaires(t) for f, t in SRC.items()}

def usages(motif):
    """Compte les occurrences du motif dans le CODE (commentaires retirés)."""
    rx = re.compile(motif)
    return sum(len(rx.findall(t)) for t in CODE.values())

def fichiers_de(motif):
    rx = re.compile(motif)
    return sorted(f for f, t in CODE.items() if rx.search(t))

# ── LES 8 BRIQUES ────────────────────────────────────────────────────────────
# `signal` = le symbole qui prouve que le socle est BRANCHÉ (pas qu'il est bon).
# `porte`  = ce que la personne voit ; absent → la brique n'a pas d'existence pour elle.
BRIQUES = [
    # ⚠️ MOTIFS CORRIGÉS APRÈS UNE 1re MESURE FAUSSE (26/08). Mon 1er jet cherchait
    #    `renderRegistre` et `S.observations` — deux noms que j'avais SUPPOSÉS. Résultat :
    #    la brique 5 sortait « absente » avec 29 usages de sa porte, ce qui est absurde.
    #    Les observations vivent DANS le registre (`registre.observations`), et le Registre
    #    n'a pas d'écran à lui : sa porte, c'est le contexte de Milo. *On vérifie les noms,
    #    on ne les devine pas* (R28) — même leçon que les 7 équivalences fausses de ft-v1023.
    dict(n='1', nom='Registre Athlète', quoi='la mémoire durable',
         signal=r'S\.registre', porte=r'buildCoachContext|_cloudSync'),
    dict(n='2', nom='Cerveau (faits mesurés)', quoi='les faits injectés dans Milo',
         signal=r'computeRegistreFacts', porte=r'buildCoachContext'),
    dict(n='3', nom='État du jour', quoi='énergie / douleur ponctuelle',
         signal=r'S\.dayState\b', porte=r'_renderDayStateCard'),
    dict(n='4', nom='ADN sportif', quoi='le portrait durable déclaré',
         signal=r'S\.adn\b', porte=r'ov-adn|renderAdn|openAdn'),
    dict(n='5', nom='Observations intelligentes', quoi='Milo propose → la personne valide',
         signal=r'registre\.observations', porte=r'_renderObsCard|obs-card'),
    dict(n='6', nom='Le Gardien', quoi='adapter, pas interdire',
         signal=r'_gardien', porte=r'_gardienRules|_gardienZones'),
    # ⚠️ PORTE CORRIGÉE LE 27/08 : le motif cherchait `histoireSportive`, un nom SUPPOSÉ à
    #    l'époque où la brique n'avait aucune porte. Elle en a une depuis ft-v1039, et elle
    #    s'appelle autrement. *On vérifie les noms, on ne les devine pas* — la même leçon que
    #    la 1re mesure fausse de ce script (voir le commentaire de BRIQUES plus haut).
    dict(n='7', nom='Mémoire vivante', quoi='relier les événements dans le temps',
         signal=r'S\.dayStateLog|calcRecoveryDetail\(refTs\)|recupHistorique',
         porte=r'_souvenirDuJour|_renderSouvenirCard|home-souvenir'),
    # ⚠️ SIGNAL ET PORTE CORRIGÉS LE 27/08 (ft-v1041) : `startPt001Test` est un outil ADMIN,
    #    il n'a jamais été le socle de cette brique — c'était un motif faute de mieux, à l'époque
    #    où elle n'existait pas. Le vrai socle est `_synthConstantes` (les constantes tirées de
    #    l'historique), et la porte est la section « Ce que ton histoire montre » de Progrès.
    #    *On vérifie les noms, on ne les devine pas* — 2ᵉ correction du même genre aujourd'hui.
    dict(n='8', nom='Synthèse', quoi='prendre du recul sur son histoire',
         signal=r'_synthConstantes', porte=r'_renderSynthese|prog-synth'),
]

def etat(b):
    """Trois états SEULEMENT, et aucun n'est un jugement de qualité.
       ⛔ On ne dit jamais « la brique est bonne » : on dit si elle est branchée et
       si la personne peut l'atteindre. Le reste est du ressort de l'humain."""
    s, p = usages(b['signal']), usages(b['porte'])
    if s and p:  return '✅ branchée', s, p
    if s:        return '🟠 socle seul', s, p
    return '🔴 absente', s, p

def tableau():
    L = []
    L.append('<!-- ⚙️ SECTION GÉNÉRÉE PAR tools/briques.py — NE PAS ÉDITER À LA MAIN.')
    L.append('     Toute retouche manuelle sera écrasée à la prochaine génération, et')
    L.append('     `check_regles.py` refuse la livraison si elle est périmée. -->')
    L.append('')
    L.append('| # | Brique | Ce qu\'elle fait | État | Signal | Porte |')
    L.append('|---|---|---|---|---|---|')
    for b in BRIQUES:
        e, s, p = etat(b)
        L.append('| **%s** | **%s** | %s | %s | `%d` | `%d` |' % (b['n'], b['nom'], b['quoi'], e, s, p))
    L.append('')
    L.append('**Comment lire ce tableau — et surtout ce qu\'il NE dit PAS :**')
    L.append('')
    L.append('- **Signal** = occurrences, dans le CODE (commentaires retirés), du symbole qui prouve')
    L.append('  que le socle de la brique est **branché**.')
    L.append('- **Porte** = ce que la personne peut **atteindre**. Signal sans porte = la donnée')
    L.append('  existe, personne ne la voit — c\'est le trou le plus fréquent du projet (**R3**).')
    L.append('- ⛔⛔ **AUCUNE de ces colonnes ne dit que la brique est BONNE.** Une brique est une')
    L.append('  *intention* ; un script compte des symboles. Il mesure qu\'elle est **là**, jamais')
    L.append('  qu\'elle **tient sa promesse** — ça, seul un humain le juge (**R29**).')
    L.append('- ⚠️ Les commentaires sont retirés avant de compter : sans ça, une brique dont on a')
    L.append('  beaucoup *parlé* paraîtrait construite (le défaut de ft-v1006, revu 3 fois depuis).')
    return '\n'.join(L)

DEB = '<!-- BRIQUES:DEBUT -->'
FIN = '<!-- BRIQUES:FIN -->'

def main():
    check = '--check' in sys.argv
    f = 'DOSSIER-ATHLETE-SUIVI.md'
    doc = rd(f)
    if not doc:
        print('❌ %s introuvable' % f); return 1
    bloc = DEB + '\n\n' + tableau() + '\n\n' + FIN
    if DEB in doc and FIN in doc:
        neuf = doc[:doc.index(DEB)] + bloc + doc[doc.index(FIN) + len(FIN):]
    else:
        print('❌ marqueurs %s / %s absents de %s' % (DEB, FIN, f)); return 1
    if check:
        if neuf != doc:
            print('❌ DOSSIER-ATHLETE-SUIVI.md : le tableau des 8 briques est PÉRIMÉ.')
            print('   → relancer : python3 tools/briques.py')
            return 1
        print('✅ briques : le tableau est à jour (%d briques mesurées)' % len(BRIQUES))
        return 0
    io.open(rp(f), 'w', encoding='utf-8').write(neuf)
    print(tableau())
    print('\n✅ %s mis à jour.' % f)
    return 0

if __name__ == '__main__':
    sys.exit(main())
