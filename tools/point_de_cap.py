#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""LE POINT DE CAP - une LECTURE GENEREE du registre des decisions, jamais un exercice refait.

    python3 tools/point_de_cap.py            # la lecture
    python3 tools/point_de_cap.py --check    # le controle (sortie 1 si le registre est malformé)

[!!] POURQUOI IL EST GENERE ET NON ECRIT. Un « point de cap » redige a la main est un exercice
     qu'on saute des qu'on est presse -- et c'est precisement quand on est presse que la
     direction derive. Genere depuis `docs/DECISIONS.md`, il ne peut ni se perimer ni mentir :
     il ne dit que ce que le registre porte.

[!!] CE QU'IL NE FAIT PAS, ET C'EST VOULU : il ne juge pas. Il compte, il classe, et il met en
     avant ce qui merite d'etre relu (les choix pris seul, les tensions, ce qui reste en
     attente). *Le jugement appartient a Michel -- l'outil lui donne de quoi mordre.*

[!!] LE SEUL SEUIL EST UN RAPPEL, PAS UNE BARRIERE : au-dela de RAPPEL_DECISIONS decisions
     prises seul depuis le dernier point de cap, le controle le SIGNALE. Il ne refuse rien.
     *Un controle qui bloque une livraison pour un point de lecture serait de la gouvernance
     qui dessert le produit* (R19).
"""
import os
import re
import sys

ROOT = os.environ.get('FT_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REGISTRE = os.path.join(ROOT, 'docs', 'DECISIONS.md')

# ⭐ VOCABULAIRE ELARGI LE 19/09 SUR UN APPORT DE GPT (decision D-009) : deux origines ne
#   suffisaient pas -- une idee venue d'ailleurs doit rester tracable jusqu'a sa source -- et
#   confondre « decide » et « applique » est la faute exacte que capacites-ia.js a payee.
ORIGINE_OK = {'Michel', 'Claude', 'GPT', 'contrainte technique'}
VISION_OK = {'cohérent', 'neutre', 'cap validé', 'écart à soumettre'}
STATUT_OK = {'VALIDÉ', 'PROPOSÉ', 'À TRANCHER', 'REFUSÉ', 'REMPLACÉE'}
RAPPEL_DECISIONS = 10          # au-dela, le controle rappelle qu'un point de cap serait utile

COLONNES = ['id', 'date', 'sujet', 'origine', 'decision', 'alternative', 'vision', 'statut']


def _nu(c):
    """Le texte d'une cellule, sans le gras, l'italique ni les parentheses d'etat."""
    c = re.sub(r'\*+', '', c).strip()
    return re.sub(r'\s+', ' ', c)


def lire_registre(chemin=REGISTRE):
    """Les lignes du tableau. [!!] On ne lit QUE les lignes dont la 1re cellule ressemble a un
       identifiant D-NNN : le fichier porte d'AUTRES tableaux (l'explication du defaut, la
       correspondance des quatre usages), et les avaler ferait compter des decisions qui
       n'existent pas. *Un parseur qui prend tous les tableaux mesure la mise en page.*"""
    if not os.path.exists(chemin):
        raise SystemExit('registre introuvable : %s' % chemin)
    lignes, erreurs = [], []
    for n, brut in enumerate(open(chemin, encoding='utf-8'), 1):
        if not brut.lstrip().startswith('|'):
            continue
        cells = [_nu(c) for c in brut.strip().strip('|').split('|')]
        if not cells or not re.fullmatch(r'D-\d{3}', cells[0]):
            continue
        if len(cells) != len(COLONNES):
            erreurs.append('ligne %d : %d colonnes au lieu de %d' % (n, len(cells), len(COLONNES)))
            continue
        d = dict(zip(COLONNES, cells))
        d['_ligne'] = n
        # l'etat peut porter une precision entre parentheses : « partielle (ecart ecrit...) »
        # ⛔ « REMPLACÉE → D-0xx » : on garde le LIEN a part. Sans lui on ne sait pas ce qui est
        #    encore actif, et la regle d'or #15 devient invérifiable (D-009).
        d['remplacee_par'] = ''
        m_r = re.match(r'(REMPLACÉE)\s*(?:→|->)\s*(D-\d{3})\s*$', d['statut'])
        if m_r:
            d['statut'], d['remplacee_par'] = m_r.group(1), m_r.group(2)
        d['statut'] = d['statut'].split('(')[0].strip()
        lignes.append(d)
    return lignes, erreurs


def controler(ds, erreurs):
    """Le registre est-il exploitable ? On ne juge pas le CONTENU, seulement la FORME -
       sans quoi la lecture generee dirait n'importe quoi avec aplomb."""
    pb = list(erreurs)
    vus = set()
    for d in ds:
        ou = '%s (ligne %d)' % (d['id'], d['_ligne'])
        if d['id'] in vus:
            pb.append('%s : identifiant en double' % ou)
        vus.add(d['id'])
        if d['origine'] not in ORIGINE_OK:
            pb.append('%s : « origine » vaut « %s » au lieu de %s'
                      % (ou, d['origine'], ' / '.join(sorted(ORIGINE_OK))))
        if d['vision'] not in VISION_OK:
            pb.append('%s : « vision » vaut « %s » — la question de la Vision doit etre '
                      'repondue a chaque ligne' % (ou, d['vision']))
        if d['statut'] not in STATUT_OK:
            pb.append('%s : « statut » vaut « %s » au lieu de %s'
                      % (ou, d['statut'], ' / '.join(sorted(STATUT_OK))))
        if d['statut'] == 'REMPLACÉE' and not d['remplacee_par']:
            pb.append('%s : REMPLACÉE sans lien « → D-0xx » — on ne peut plus savoir ce qui est '
                      'encore actif (regle d or #15)' % ou)
        if not d['alternative'] or d['alternative'] in {'-', '—'}:
            pb.append('%s : aucune alternative ecartee — une decision sans alternative n est '
                      'pas une decision' % ou)
    return pb


def lecture(ds):
    seuls = [d for d in ds if d['origine'] == 'Claude']
    michel = [d for d in ds if d['origine'] == 'Michel']
    externes = [d for d in ds if d['origine'] not in {'Michel', 'Claude'}]
    tensions = [d for d in ds if d['vision'] == 'écart à soumettre']
    caps = [d for d in ds if d['vision'] == 'cap validé']
    attente = [d for d in ds if d['statut'] == 'À TRANCHER']
    partielles = [d for d in ds if d['statut'] == 'REMPLACÉE']

    out = []
    out.append('=' * 78)
    out.append('  POINT DE CAP - lecture generee de docs/DECISIONS.md')
    out.append('=' * 78)
    out.append('')
    out.append('  %d decisions au registre' % len(ds))
    out.append('     %2d tranchees par Michel' % len(michel))
    out.append('     %2d prises par Claude SEUL' % len(seuls))
    out.append('     %2d venues d une source externe (GPT, contrainte technique)' % len(externes))
    out.append('')
    out.append('  Face a la Vision : %d coherentes  ·  %d neutres  ·  %d CAP VALIDE  ·  %d ECART A SOUMETTRE'
               % (sum(1 for d in ds if d['vision'] == 'cohérent'),
                  sum(1 for d in ds if d['vision'] == 'neutre'), len(caps), len(tensions)))
    out.append('  Statut : %d validees  ·  %d a trancher  ·  %d remplacees  ·  %d refusees'
               % (sum(1 for d in ds if d['statut'] == 'VALIDÉ'), len(attente), len(partielles),
                  sum(1 for d in ds if d['statut'] == 'REFUSÉ')))
    out.append('')

    def bloc(titre, items, pourquoi):
        out.append('-' * 78)
        out.append('  ' + titre)
        out.append('  ' + pourquoi)
        out.append('-' * 78)
        if not items:
            out.append('     (aucune)')
        for d in items:
            out.append('   %s  %s' % (d['id'], d['sujet']))
            out.append('        a la place de : %s' % d['alternative'])
        out.append('')

    bloc('CE QUE CLAUDE A TRANCHE SEUL', seuls,
         'Le point le plus important : ce sont les choix que personne n a vus passer.')
    bloc('ECART DE CAP A SOUMETTRE A MICHEL', tensions,
         'A relire en priorite. Un registre ou tout est « coherent » ne mesure plus rien.')
    if caps:
        bloc('CHANGEMENTS DE CAP VALIDES PAR MICHEL', caps,
             'La direction a bouge, et c est assume. C est la memoire du cap.')
    bloc('EN ATTENTE DE DECISION', attente,
         'Ce qui a ete volontairement NON tranche, et qui attend Michel.')
    if partielles:
        bloc('DECISIONS REMPLACEES', partielles,
             'Gardees avec leur raison (R30) : sinon elles reviennent dans six mois.')

    out.append('=' * 78)
    out.append('  Cette lecture ne juge rien : elle rend visible ce qui etait enterre.')
    out.append('  Le jugement appartient a Michel.')
    out.append('=' * 78)
    return '\n'.join(out)


def main():
    ds, erreurs = lire_registre()
    pb = controler(ds, erreurs)
    check = '--check' in sys.argv

    if pb:
        print('REGISTRE MALFORME :')
        for p in pb:
            print('   !! ' + p)
        return 1 if check else 1

    if check:
        seuls = sum(1 for d in ds if d['origine'] == 'Claude')
        print('OK registre des decisions : %d entrees, %d prises par Claude seul, '
              '%d ecart(s) a soumettre' % (len(ds), seuls,
                                           sum(1 for d in ds if d['vision'] == 'écart à soumettre')))
        if seuls >= RAPPEL_DECISIONS:
            # ⛔ UN RAPPEL, PAS UNE BARRIERE : on ne refuse pas une livraison pour ca (R19).
            print('   -> %d decisions prises seul : un point de cap serait utile '
                  '(python3 tools/point_de_cap.py)' % seuls)
        return 0

    print(lecture(ds))
    return 0


if __name__ == '__main__':
    sys.exit(main())
