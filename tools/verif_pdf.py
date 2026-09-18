#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Relit un PDF PRODUIT et cherche dedans les mots qu'il doit porter.

POURQUOI CE FICHIER EXISTE (regle d or #14) : *un PDF muet ressemble a un PDF reussi.* Un
generateur qui s'acheve sur « OK » ne prouve que son propre parcours, pas que la page porte
quelque chose. Ici on rouvre le fichier ecrit sur le disque et on lit son contenu.

[!!] LE PIEGE QUI M'A EU. Ma premiere version cherchait les chaines dans les flux bruts, et
     n'essayait que zlib. Or reportlab ecrit ses flux en ASCII85 PUIS Flate : la decompression
     echouait, l'extraction rendait 0 caractere, et j'ai failli conclure que le document etait
     vide alors qu'il etait complet. >> *Un outil de verification casse accuse le travail
     qu'il verifie.* On essaie donc les deux enveloppes, dans l'ordre, et on REFUSE de rendre
     un verdict si aucun texte n'a pu etre extrait — au lieu de dire « mot absent ».

Usage : python3 tools/verif_pdf.py <fichier.pdf> "mot 1" "mot 2" ...
"""
import base64
import re
import os
import sys
import zlib


def texte_du_pdf(chemin):
    b = open(chemin, 'rb').read()
    morceaux = []
    for m in re.finditer(rb'stream\r?\n(.*?)endstream', b, re.S):
        d = m.group(1)
        # ASCII85 (avec ou sans le marqueur de fin), puis Flate. Chaque etape est optionnelle.
        for _essai in (lambda x: base64.a85decode(x, adobe=True, ignorechars=b' \n\r\t'),
                       lambda x: base64.a85decode(x.split(b'~>')[0], adobe=False,
                                                  ignorechars=b' \n\r\t')):
            try:
                d = _essai(d)
                break
            except Exception:
                continue
        try:
            d = zlib.decompress(d)
        except Exception:
            pass
        for s in re.findall(rb'\((?:\\.|[^()\\])*\)', d):
            morceaux.append(s[1:-1].decode('cp1252', 'replace'))
    t = ' '.join(morceaux)
    for a, b2 in (('\\(', '('), ('\\)', ')'), ('\\\\', '\\')):
        t = t.replace(a, b2)
    return re.sub(r'\s+', ' ', t)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    chemin, attendus = sys.argv[1], sys.argv[2:]
    if not os.path.exists(chemin):
        print('ABSENT : ' + chemin)
        return 1
    pages = len(re.findall(rb'/Type\s*/Page[^s]', open(chemin, 'rb').read()))
    t = texte_du_pdf(chemin)
    print('%s\n  %d octets, %d pages, %d caracteres relus'
          % (chemin, os.path.getsize(chemin), pages, len(t)))
    # ⛔ AUCUN VERDICT SUR UNE EXTRACTION VIDE : ce serait accuser le document d'un defaut
    #    de l'outil. On le dit et on sort en echec.
    if len(t) < 200:
        print('  !! extraction vide ou quasi vide : outil suspect, AUCUN verdict rendu')
        return 1
    manquants = [m for m in attendus if m not in t]
    for m in attendus:
        print(('  OK   ' if m in t else '  !!   ') + m)
    if manquants:
        print('\n%d mot(s) manquant(s)' % len(manquants))
        return 1
    print('\n%d/%d presents' % (len(attendus), len(attendus)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
