#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""S2-B / PHASE 1 — le schema entre dans le depot et il est eprouve. Hors depot (regle #14).

[!!] LES TOTAUX SE LISENT DANS LEUR JOURNAL, JAMAIS A LA MAIN. Lecon de ft-v1201, ou un PDF
     a publie un total pendant que la passe tournait encore. Ici les deux chiffres (banc et
     mutations) sont EXTRAITS de /tmp/banc_s2b.log et /tmp/mut_s2b.log, et le generateur
     refuse de produire si la ligne de total manque ou si le banc n'a pas fini.

[!!] IL REFUSE AUSSI DE PRODUIRE SI V2 N'EST PLUS OUVERTE, ou si une migration pretendait
     toucher ft_comptes / ft_miroir. >> Un dossier qui decrit un etat qu'il n'a pas verifie
     se perime en silence.

CONTRAINTE DE POLICE : WinAnsi/cp1252 — pas d'emoji ; entites decodees AVANT controle.
"""
import html
import os
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                KeepTogether, PageBreak)

ROOT = os.environ.get('FT_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRATCH = ('/tmp/claude-0/-home-user-forcetracker/'
           '12f61d67-fd14-50ef-8709-99418240fb44/scratchpad')
OUT = os.environ.get('FT_OUT') or os.path.join(
    SCRATCH, 'S2B-PHASE1-SCHEMA-VERSIONNE-17-09-2026.pdf')
LOG_BANC = os.environ.get('FT_LOG_BANC') or '/tmp/banc_s2b.log'
LOG_MUT = os.environ.get('FT_LOG_MUT') or '/tmp/mut_s2b.log'

GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


def sans_commentaires(src):
    out, i, n = [], 0, len(src)
    while i < n:
        c = src[i]
        if c == '/' and i + 1 < n and src[i + 1] == '/':
            j = src.find('\n', i)
            i = n if j < 0 else j
        elif c == '/' and i + 1 < n and src[i + 1] == '*':
            j = src.find('*/', i + 2)
            i = n if j < 0 else j + 2
        elif c in '\'"`':
            j, q = i + 1, c
            while j < n and src[j] != q:
                j += 2 if src[j] == '\\' else 1
            out.append(src[i:j + 1])
            i = j + 1
        else:
            out.append(c)
            i += 1
    return ''.join(out)


def sans_sql_commentaires(src):
    """Retire les `-- ...` mais garde les chaines. Sans ca, une garde mesurerait la
    DOCUMENTATION de la migration au lieu de ses instructions."""
    out = []
    for ligne in src.split('\n'):
        i, n, dans = 0, len(ligne), None
        coupe = None
        while i < n:
            c = ligne[i]
            if dans:
                if c == dans:
                    dans = None
            elif c in '\'"':
                dans = c
            elif c == '-' and i + 1 < n and ligne[i + 1] == '-':
                coupe = i
                break
            i += 1
        out.append(ligne if coupe is None else ligne[:coupe])
    return '\n'.join(out)


SB = sans_commentaires(lire('supabase.js'))
SW = lire('sw.js')
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, '?'])[1]
g(re.match(r'^ft-v\d+$', VERSION or ''), 'la version servie n a pas pu etre lue dans sw.js')

# ═══════════════════════════════════════════════════════════════════════════════════════
# I. MESURES
# ═══════════════════════════════════════════════════════════════════════════════════════

# ── V2 est toujours ouverte : tout ce document en depend ──────────────────────────────
g('p_email: email' in SB,
  'le client n envoie plus un p_email libre : V2 serait deja fermee, et ce document affirme '
  'le contraire a chaque page')

# ── les migrations versionnees ────────────────────────────────────────────────────────
DMIG = os.path.join(ROOT, 'supabase', 'migrations')
g(os.path.isdir(DMIG), 'le dossier supabase/migrations n existe pas : ce document le decrit')
MIGS = sorted(f for f in os.listdir(DMIG) if f.endswith('.sql'))
g(len(MIGS) == 2, 'le nombre de migrations n est plus 2 mais %d' % len(MIGS))
SRC = {f: open(os.path.join(DMIG, f), encoding='utf-8').read() for f in MIGS}
CODE = {f: sans_sql_commentaires(s) for f, s in SRC.items()}
TOUT_SQL = '\n'.join(CODE.values())

# ⛔ aucune migration ne touche l'existant — c'est la promesse faite a Michel
for f, c in CODE.items():
    for interdit in ('ft_comptes', 'ft_miroir'):
        for m in re.finditer(interdit, c):
            ligne = c[c.rfind('\n', 0, m.start()) + 1:c.find('\n', m.end())]
            # la seule mention legitime : l'INSERT de la fonction d'ecriture
            g(re.search(r'insert into public\.ft_comptes', ligne)
              or 'values (v_compte' in ligne or ligne.strip().startswith('on conflict')
              or 'set data = excluded' in ligne,
              'la migration %s touche « %s » hors de l insert de la fonction d ecriture : '
              'ligne « %s »' % (f, interdit, ligne.strip()[:80]))
for mot in ('drop table', 'drop function', 'truncate', 'delete from'):
    g(mot not in TOUT_SQL.lower(),
      'une migration contient « %s » : ce document affirme qu elle ne detruit rien' % mot)
g('alter table public.ft_comptes' not in TOUT_SQL.lower(),
  'une migration modifie la table des comptes')

# ── les proprietes que le document affirme, relues DANS le SQL ────────────────────────
F2 = CODE[MIGS[1]]
g('force row level security' not in TOUT_SQL.lower(),
  'une migration pose FORCE ROW LEVEL SECURITY : c est justement la correction que ce '
  'document explique')
g('enable row level security' in TOUT_SQL.lower(),
  'les regles de ligne ne sont plus activees sur le registre')
NB_REVOKE_T = len(re.findall(r'revoke all on table public\.ft_jetons', TOUT_SQL))
g(NB_REVOKE_T == 4, 'le registre n est plus retire a 4 roles mais a %d' % NB_REVOKE_T)
NB_REVOKE_F = len(re.findall(r'revoke all on function', F2))
g(NB_REVOKE_F == 9, 'les fonctions ne sont plus retirees 9 fois mais %d' % NB_REVOKE_F)
NB_GRANT = len(re.findall(r'grant execute on function', F2))
g(NB_GRANT == 3, 'les fonctions ne sont plus accordees 3 fois mais %d' % NB_GRANT)
g('to service_role;' in F2 and 'to anon' not in F2,
  'une fonction est accordee au role du navigateur : ce serait V2 sous un autre nom')
g(F2.count('security definer') == 3, 'les trois fonctions ne sont plus security definer')
g(F2.count('set search_path = public, pg_temp') == 3,
  'les trois fonctions n ont plus un chemin de recherche fixe')
g('on conflict (hachage) do nothing' in F2,
  'l inscription ne fait plus « do nothing » : un jeton pourrait etre re-pointe ou ressuscite')
g(re.search(r'ft_enregistrer_instantane\(p_hachage text, p_data jsonb\)', F2),
  'la fonction d ecriture ne prend plus exactement (hachage, donnees) : une adresse pourrait '
  'etre revenue dans sa signature')
g('email' not in re.search(r'ft_enregistrer_instantane\(([^)]*)\)', F2).group(1),
  'une adresse est revenue dans la signature de la fonction d ecriture')
NB_RETRAITS = len(re.findall(r"- '(?:token|authCode|code|confirmCode|apikey|authorization)'", F2))
g(NB_RETRAITS == 6, 'le retrait defensif ne porte plus 6 cles mais %d' % NB_RETRAITS)
_refus = re.findall(r"raise exception '(\w+)'", F2)
g(_refus.count('identite') == 2,
  'les deux refus d identite ne portent plus le meme mot : le document affirme qu il n y a '
  'aucun oracle')

# ── les totaux, LUS dans les journaux ─────────────────────────────────────────────────
def journal(chemin, motif, quoi):
    g(os.path.exists(chemin), 'journal introuvable (%s) : %s doit etre LU, pas ecrit a la '
                              'main' % (chemin, quoi))
    txt = open(chemin, encoding='utf-8', errors='replace').read()
    m = re.search(motif, txt)
    g(m, 'le journal %s ne porte pas sa ligne de total : une passe interrompue ressemble '
         'trait pour trait a une passe verte' % chemin)
    return m, txt


_m, _txt = journal(LOG_BANC, r'(\d+) OK / (\d+) rouge', 'le total du banc')
BANC_OK, BANC_KO = int(_m.group(1)), int(_m.group(2))
g(BANC_KO == 0, 'le banc porte %d rouge(s) : ce document annonce une phase 1 saine' % BANC_KO)
g(BANC_OK >= 50, 'le banc ne porte que %d temoins : trop peu pour ce qu il affirme' % BANC_OK)
g('Z1 le retour arriere s execute' in _txt,
  'le journal du banc ne montre pas le retour arriere joue : il est annonce comme eprouve')
g('X2 FORCE' in _txt,
  'le journal du banc ne montre pas la mesure du piege FORCE, qui est le coeur de ce dossier')
for _t in ('T1 ', 'T5 ', 'T10 ', 'E1 ', 'I3 ', 'R1 '):
    g(_t in _txt, 'le journal du banc ne montre pas le temoin %s' % _t.strip())

_m2, _txt2 = journal(LOG_MUT, r'(\d+)/(\d+) conformes', 'le total des mutations')
MUT_OK, MUT_TOT = int(_m2.group(1)), int(_m2.group(2))
g(MUT_OK == MUT_TOT, 'les mutations ne sont pas toutes conformes (%d/%d)' % (MUT_OK, MUT_TOT))
g(MUT_TOT >= 15, 'moins de 15 mutations : le controle negatif serait trop maigre')
g('INVALIDE' not in _txt2,
  'une mutation ne s est pas appliquee : une mutation invalide ressemble trait pour trait a '
  'une mutation qui ne mord pas')

# ── le verdict B/D repose sur trois elements, dont un qui est une ABSENCE de preuve ────
DOC_JOIGNABLE = False   # mesure du jour : le proxy du conteneur refuse supabase.com

# ═══════════════════════════════════════════════════════════════════════════════════════
# II. LE DOCUMENT
# ═══════════════════════════════════════════════════════════════════════════════════════
ROUGE = colors.HexColor('#C0392B')
ENCRE = colors.HexColor('#1A1A1A')
GRIS = colors.HexColor('#5A5A5A')
FOND = colors.HexColor('#F4F4F2')
TRAIT = colors.HexColor('#D8D8D4')
VERT = colors.HexColor('#1E7A46')
ORANGE = colors.HexColor('#B26A00')

_ss = getSampleStyleSheet()
ST = {
    'titre': ParagraphStyle('t', parent=_ss['Title'], fontName='Helvetica-Bold',
                            fontSize=15.5, leading=19, textColor=ENCRE, spaceAfter=2),
    'sous': ParagraphStyle('s', parent=_ss['Normal'], fontName='Helvetica',
                           fontSize=8.4, leading=11, textColor=GRIS, spaceAfter=9),
    'h1': ParagraphStyle('h1', parent=_ss['Normal'], fontName='Helvetica-Bold',
                         fontSize=10.6, leading=13, textColor=ROUGE,
                         spaceBefore=10, spaceAfter=4),
    'p': ParagraphStyle('p', parent=_ss['Normal'], fontName='Helvetica',
                        fontSize=8.4, leading=11.5, textColor=ENCRE, spaceAfter=5),
    'petit': ParagraphStyle('pt', parent=_ss['Normal'], fontName='Helvetica',
                            fontSize=7.4, leading=9.8, textColor=GRIS, spaceAfter=4),
    'code': ParagraphStyle('cd', parent=_ss['Normal'], fontName='Courier',
                           fontSize=7.0, leading=8.8, textColor=ENCRE, spaceAfter=2),
    'cell': ParagraphStyle('c', parent=_ss['Normal'], fontName='Helvetica',
                           fontSize=7.6, leading=9.8, textColor=ENCRE),
    'cellg': ParagraphStyle('cg', parent=_ss['Normal'], fontName='Helvetica-Bold',
                            fontSize=7.6, leading=9.8, textColor=ENCRE),
}

TEXTES, CODES = [], []


def _v(s):
    rendu = html.unescape(s)
    try:
        rendu.encode('cp1252')
    except UnicodeEncodeError as e:
        raise SystemExit('POLICE - hors cp1252 apres rendu : %r (dans %r)'
                         % (rendu[e.start:e.end], s[:70]))
    return s


def P(txt, st='p'):
    TEXTES.append(txt)
    return Paragraph(_v(txt), ST[st])


C = '<font face="Courier" size="7.2">%s</font>'


def bloc_code(txt, depuis=None):
    """⭐ `depuis` : le fichier dont chaque ligne NON VIDE doit provenir mot pour mot.
    Sans ca, un extrait du PDF pourrait diverger du fichier versionne — c'est-a-dire
    exactement la dette qu'on repare."""
    if depuis:
        src = SRC[depuis]
        for l in txt.split('\n'):
            if l.strip() and not l.strip().startswith('...'):
                g(l.strip() in src,
                  'l extrait cite une ligne absente de %s : « %s »' % (depuis, l.strip()[:70]))
    CODES.append(txt)
    lignes = [Paragraph(_v(html.escape(l).replace(' ', '&nbsp;')), ST['code'])
              for l in txt.split('\n')]
    t = Table([[lignes]], colWidths=[166 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F7F7F5')),
        ('BOX', (0, 0), (-1, -1), 0.4, TRAIT),
        ('LEFTPADDING', (0, 0), (-1, -1), 6), ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4)]))
    return KeepTogether([t, Spacer(1, 5)])


def encadre(titre, corps, couleur=ROUGE):
    TEXTES.append(titre)
    TEXTES.append(corps)
    t = Table([[Paragraph(_v('<b>' + titre + '</b>'), ST['cell'])],
               [Paragraph(_v(corps), ST['cell'])]], colWidths=[166 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), FOND),
        ('LINEBEFORE', (0, 0), (0, -1), 2.2, couleur),
        ('LEFTPADDING', (0, 0), (-1, -1), 7), ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    return KeepTogether([t, Spacer(1, 6)])


def tableau(entetes, lignes, largeurs):
    TEXTES.extend(entetes)
    for r in lignes:
        TEXTES.extend(r)
    data = [[Paragraph(_v('<b>' + h + '</b>'), ST['cellg']) for h in entetes]]
    for r in lignes:
        data.append([Paragraph(_v(c), ST['cell']) for c in r])
    t = Table(data, colWidths=largeurs, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), FOND),
        ('GRID', (0, 0), (-1, -1), 0.35, TRAIT),
        ('LEFTPADDING', (0, 0), (-1, -1), 5), ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 4.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 4.5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    return KeepTogether([t, Spacer(1, 6)])


OUI, NON, PART, AVER = ('<b>OUI</b>', '<b>NON</b>', '<b>PARTIEL</b>', '<b>A VERIFIER</b>')

H = []
# @@DEBUT@@
H.append(P('S2-B phase 1 - le schema entre dans le depot, et il est eprouve', 'titre'))
H.append(P('Force Tracker - 17 septembre 2026 - base servie ' + VERSION + ' - hors depot '
           '(regle d or #14) - <b>aucun fichier servi modifie, aucune mutation Supabase, '
           'V2 encore ouverte</b>', 'sous'))

H.append(encadre(
    'OU ON EN EST, EN TROIS PHRASES',
    'Le schema Supabase de S2-B existe desormais <b>dans le depot</b>, et il a ete applique '
    'tel quel sur un <b>vrai PostgreSQL</b> pour verifier non pas qu il se lit bien, mais '
    'qu il <b>REFUSE</b> ce qu il doit refuser. Rien n a encore ete applique chez Supabase : '
    'la prochaine action est une manipulation de Michel, et elle est decrite en derniere '
    'page. <b>V2 - le navigateur qui choisit son identite en envoyant une adresse - est '
    'toujours ouverte</b>, et ce dossier refuse de produire si ce n est plus le cas.'))

# ── 1 ────────────────────────────────────────────────────────────────────────────────
H.append(P('1. Option B ou D : tranche, et sur trois elements separes', 'h1'))
H.append(tableau(
    ['element', 'ce qu il dit', 'statut'],
    [['ce que Michel voit dans son tableau de bord',
      'quatre entrees - un role serveur, une cle publique, une cle secrete par defaut, une cle '
      'publiable par defaut. <b>Aucun mecanisme visible</b> pour rattacher une cle secrete a '
      'un role de base de donnees choisi',
      'observe'],
     ['ce que le depot peut dire', 'rien : il ne connait que la cle publique', 'mesure'],
     ['la documentation de l editeur',
      '<b>injoignable depuis le conteneur</b> - le mandataire reseau refuse le domaine. '
      'Essaye, pas suppose',
      '<b>pas de preuve</b>']],
    [44 * mm, 98 * mm, 24 * mm]))
H.append(P('<b>Verdict : option D</b> - une cle secrete serveur, detenue par le Worker seul, '
           'et une fonction bornee comme unique chose que ce Worker sait appeler. '
           'C est la consigne de Michel appliquee a la lettre : <i>« Si tu ne peux PAS prouver '
           'B : retiens D. Ne construis pas toute l architecture autour d une capacite '
           'hypothetique. »</i>', 'p'))
H.append(encadre(
    'CE QUE L OPTION D N ACHETE PAS - ET LE DIRE EST PLUS UTILE QUE DE LA VENDRE',
    'Une fonction bornee <b>ne reduit pas</b> le rayon d un secret vole : qui detient le secret '
    'parle a la base directement, sans passer par le code du Worker. Ce qu elle reduit, c est '
    'le rayon d une <b>erreur de programme</b> - une variable prise pour une autre, une route '
    'oubliee. >> Les deux risques sont reels et ne se remplacent pas. <i>Dire « avec une '
    'fonction bornee, la cle serveur devient sans danger » serait faux, et c est le genre de '
    'phrase qui clot une question pour des mois.</i> '
    'Ce qui rend D acceptable est ailleurs : le Worker n appellera <b>qu une</b> fonction '
    'nommee, donc le jour ou un secret moins privilegie existerait, on remplace le secret et '
    '<b>rien d autre ne bouge</b>.'))

# ── 2 ────────────────────────────────────────────────────────────────────────────────
H.append(P('2. Deux corrections a mon propre dossier d architecture', 'h1'))
H.append(encadre(
    'CORRECTION 1 - JE RECOMMANDAIS `FORCE ROW LEVEL SECURITY`, ET LA RAISON QUE JE DONNAIS '
    'ETAIT FAUSSE',
    '<b>Le mecanisme est reel, et il vient d etre mesure</b> : avec un proprietaire ordinaire, '
    'une table en <b>FORCE</b> fait voir <b>zero ligne</b> a une fonction qui tourne en son '
    'nom, la ou <b>ENABLE seul</b> lui en fait voir une. Applique au registre des jetons, tout '
    'jeton deviendrait « inconnu » et le nouveau chemin refuserait tout le monde. '
    '<b>MAIS</b> le proprietaire de ce projet a ete mesure le 17/09 avec le droit de passer '
    'outre les regles de ligne - et ce droit passe outre <b>meme forcees</b>. Donc, '
    'aujourd hui, <b>FORCE ne casserait rien</b>, et mon dossier presentait un danger certain '
    'la ou il y a une dependance. >> <b>On ne le pose pas quand meme, et le vrai argument est '
    'celui-la</b> : il n apporterait rien une fois tous les privileges retires, et il ferait '
    'dependre le nouveau chemin d un attribut de role qu on ne controle pas. <i>Le jour ou cet '
    'attribut changerait, tout le monde serait refuse - en silence.</i>', ORANGE))
H.append(encadre(
    'CORRECTION 2 - LA SEQUENCE NE TENAIT PAS ENSEMBLE',
    'La premiere version faisait de la phase 2 un essai <b>par le pont</b> et de la phase 3 une '
    '<b>recopie</b> du registre. Or une fonction qui cherche un hachage dans une table encore '
    'vide ne peut pas aboutir : l essai de la phase 2 n aurait rien prouve. >> Corrige avant '
    'd ecrire une ligne de SQL, par le <b>remplissage a l usage</b> - le Worker inscrit le '
    'hachage au moment ou le pont vient de resoudre l identite. <i>C etait une incoherence '
    'd ordre, pas de principe, et elle se serait vue au premier essai reel, c est-a-dire au '
    'pire moment.</i>', ORANGE))

# ── 3 ────────────────────────────────────────────────────────────────────────────────
H.append(PageBreak())
H.append(P('3. Ce que le depot contient maintenant', 'h1'))
H.append(tableau(
    ['fichier', 'ce qu il pose'],
    [[C % MIGS[0],
      'la table ' + (C % 'ft_jetons') + ' (hachage, compte, date, revoque, date de revocation, '
      'libelle d appareil), son index par compte, deux contraintes de coherence, le retrait '
      'des privileges a <b>' + str(NB_REVOKE_T) + ' roles</b>, et les regles de ligne activees'],
     [C % MIGS[1],
      'trois fonctions bornees : ecrire l instantane, inscrire un jeton, revoquer un jeton. '
      '<b>' + str(NB_REVOKE_F) + '</b> retraits de droit et <b>' + str(NB_GRANT) + '</b> '
      'attributions - au seul role serveur'],
     [C % 'supabase/README.md',
      'la convention, et surtout <b>ce qui reste NON versionne</b> : les deux objets crees a '
      'la main en aout. <i>Les recrire de memoire fabriquerait une source de verite supposee - '
      'le pire des deux mondes, parce qu elle aurait l air fiable.</i>']],
    [46 * mm, 120 * mm]))
H.append(P('<b>Le coeur du chantier tient dans une signature</b>, et c est pour ca qu elle est '
           'citee ici mot pour mot depuis le fichier :', 'p'))
H.append(bloc_code(
    'create or replace function public.ft_enregistrer_instantane(p_hachage text, p_data jsonb)',
    depuis=MIGS[1]))
H.append(P('Il n y a <b>aucune adresse</b>. Ce n est pas un controle qu on ajoute sur une '
           'entree dangereuse : <b>c est l entree qui disparait</b>. Le compte est retrouve a '
           'partir du jeton, et de rien d autre.', 'p'))

# ── 4 ────────────────────────────────────────────────────────────────────────────────
H.append(P('4. Ce que le SQL refuse, mesure sur un vrai PostgreSQL', 'h1'))
H.append(P('Le conteneur porte un PostgreSQL 16. Les migrations y ont donc ete appliquees '
           '<b>telles quelles</b>, et les scenarios joues pour de vrai. <b>' + str(BANC_OK) +
           ' temoins, ' + str(BANC_KO) + ' rouge</b> - chiffres lus dans le journal du banc, '
           'jamais recopies a la main.', 'p'))
H.append(tableau(
    ['scenario', 'resultat'],
    [['un jeton du compte A ecrit le compte A', 'ecrit A'],
     ['jeton A, et une adresse B glissee dans la charge utile',
      '<b>aucune ligne B creee</b> - la charge ne decide de rien'],
     ['sans jeton / jeton inconnu / jeton revoque',
      '<b>refus</b>, et le <b>meme</b> mot pour les trois : aucun oracle qui apprendrait a un '
      'inconnu quels jetons existent'],
     ['deux appareils du compte A, puis on en revoque un',
      'le second continue, le compte reste utilisable'],
     ['on reinscrit un jeton revoque', '<b>il ne ressuscite pas</b>'],
     ['on reinscrit un jeton vers un autre compte', '<b>il n est pas re-pointe</b>'],
     ['une charge utile hostile : adresse, identifiant de compte, drapeau premium',
      'l identite resolue ne bouge pas'],
     ['une charge utile portant un jeton et un code perso',
      '<b>ni l un ni l autre n est stocke</b>, le reste des donnees est intact'],
     ['les droits du navigateur sur le registre',
      'aucun - ni lecture, ni ecriture, ni suppression'],
     ['le role serveur lui-meme', 'aucun droit direct : il ne parle qu aux fonctions'],
     ['le retour arriere', 'joue, et les comptes existants sont toujours la apres']],
    [74 * mm, 92 * mm]))
H.append(encadre(
    'ET LE CONTROLE NEGATIF : ' + str(MUT_OK) + '/' + str(MUT_TOT) + ' MUTATIONS CONFORMES',
    'Chaque garantie ci-dessus a ete <b>cassee expres</b> pour verifier qu elle rougit : le '
    're-pointage autorise, le jeton revoque reaccepte, l identite reprise de la charge utile, '
    'le retrait defensif supprime, la cle publique qui recoit le droit d executer, les refus '
    'qui se distinguent, le chemin de recherche libere, la fonction qui reprend une adresse. '
    '>> <i>Une garantie qu on n a jamais vue refuser n a pas ete testee, elle a ete relue.</i>',
    VERT))
H.append(encadre(
    'DEUX DE MES MUTATIONS ETAIENT FAUSSES, ET C EST LE BANC QUI L A DIT',
    'La premiere ajoutait un <b>troisieme argument</b> a la fonction : la signature changeait, '
    'les lignes qui la nomment plus bas ne la trouvaient plus, et la migration echouait '
    '<b>avant</b> d atteindre le temoin vise. Elle etait attrapee - mais par le mauvais, donc '
    'elle ne prouvait rien. La seconde comparait une sortie entiere la ou l outil echote aussi '
    'les etiquettes de commande : <b>elle rougissait sur une mesure juste</b>. '
    '>> <i>Un instrument mal regle produit exactement les deux erreurs qu on redoute : il '
    'rassure sur ce qui est casse, et il accuse ce qui est sain.</i>', ORANGE))

# ── 5 ────────────────────────────────────────────────────────────────────────────────
H.append(P('5. Ce que ce banc ne prouve pas', 'h1'))
H.append(P('PostgreSQL local <b>n est pas</b> l instance de Michel. Les roles y sont recrees a '
           'la main, la table des comptes y est reconstruite d apres la definition '
           '<b>mesuree</b> le 17/09, et le proprietaire local est superutilisateur - ce qui '
           'masque justement certains effets des regles de ligne, raison pour laquelle le '
           'piege du FORCE a ete prouve <b>a part</b>, avec un proprietaire ordinaire. '
           '>> <b>C est un banc de semantique SQL, pas une preuve de deploiement.</b> Ce qui '
           'se passera dans le tableau de bord reste a mesurer la-bas, et nulle part '
           'ailleurs.', 'p'))
H.append(tableau(
    ['question', 'aujourd hui', 'preuve'],
    [['le navigateur peut-il choisir le compte avec une adresse ?', OUI,
      'mesure a l instant dans le fichier servi'],
     ['l ancienne fonction est-elle encore appelable publiquement ?', OUI,
      'droit mesure le 17/09, et rien ne l a change'],
     ['un secret privilegie est-il dans les fichiers servis ?', NON,
      'mesure : le mot n apparait que dans un commentaire d avertissement'],
     ['le schema de S2-B est-il versionne ?', OUI,
      str(len(MIGS)) + ' migrations dans le depot, appliquees telles quelles au banc'],
     ['les deux objets crees a la main le sont-ils ?', NON,
      'dette assumee et ecrite plutot que comblee par une reconstitution'],
     ['V2 est-elle fermee ?', NON,
      '<b>et elle ne peut pas l etre par ce document</b> : il faudra un refus reseau reel']],
    [66 * mm, 20 * mm, 80 * mm]))

# ── 6 ────────────────────────────────────────────────────────────────────────────────
H.append(PageBreak())
H.append(P('6. La seule action demandee a Michel - ECRITURE SUPABASE, phase 1', 'h1'))
H.append(P('<b>Ou</b> : tableau de bord Supabase, menu de gauche, <b>SQL Editor</b>. '
           '<b>Quoi</b> : coller le contenu des deux fichiers du depot, dans l ordre, chacun '
           'dans sa propre requete. Le second a besoin de la table creee par le premier.',
           'p'))
H.append(tableau(
    ['', 'fichier', 'resultat attendu'],
    [['1', C % ('supabase/migrations/' + MIGS[0]), C % 'Success. No rows returned'],
     ['2', C % ('supabase/migrations/' + MIGS[1]), C % 'Success. No rows returned']],
    [8 * mm, 96 * mm, 62 * mm]))
H.append(encadre(
    'ON COLLE LE FICHIER ENTIER, COMMENTAIRES COMPRIS - ET CE N EST PAS UN DETAIL',
    'Toute la dette qu on repare vient de la : du SQL tape dans une console et jamais '
    'retrouve ensuite. <b>Ce qui est colle doit etre exactement ce qui est dans le depot</b>, '
    'sinon le depot ne decrit plus la base et on a remplace une dette par une illusion. '
    '<i>Les lignes qui commencent par deux tirets sont des commentaires : elles ne font rien, '
    'et elles expliquent pourquoi chaque ligne est la.</i>'))
H.append(P('<b>Ce que ca cree</b> : une table vide, un index, deux contraintes, trois '
           'fonctions. <b>Ce que ca ne touche pas</b> : la table des comptes, l ancienne '
           'fonction, les dix lignes existantes, un droit existant, une regle existante. '
           '<b>Aucun appelant n existe encore</b> - donc rien ne change pour personne, et '
           'l application se comporte exactement comme avant.', 'p'))
RETOUR_TXT = ('<b>Retour arriere</b>, si quoi que ce soit cloche. Il est ecrit en fin de '
              'chaque fichier, il a ete <b>joue</b> au banc, et il ne touche rien d autre :')
RETOUR_SQL = ('drop function if exists public.ft_revoquer_jeton(text);\n'
              'drop function if exists public.ft_inscrire_jeton(text, text, text);\n'
              'drop function if exists public.ft_enregistrer_instantane(text, jsonb);\n'
              'drop table if exists public.ft_jetons;')
# [!!] CONTROLE SUR SA PROPRE PHRASE, PAS SUR LE DOCUMENT. « retour arriere » figure aussi
#      dans le tableau des scenarios, donc une garde globale reste verte alors que l etape
#      d ecriture aurait perdu son filet. Troisieme fois que cette faiblesse apparait dans ce
#      chantier : elle se ferme en nommant la phrase, jamais en cherchant un mot.
g('Retour arriere' in RETOUR_TXT and 'joue' in RETOUR_TXT,
  'la phrase qui accompagne l etape d ecriture ne parle plus de retour arriere joue : une '
  'instruction de production sans filet explicite ne se donne pas')
for _d in ('ft_revoquer_jeton', 'ft_inscrire_jeton', 'ft_enregistrer_instantane', 'ft_jetons'):
    g('drop ' in RETOUR_SQL and _d in RETOUR_SQL,
      'le retour arriere ne defait plus « %s » : il serait incomplet, donc inutilisable' % _d)
g(RETOUR_SQL.count('if exists') == 4,
  'le retour arriere n est plus integralement conditionnel : il echouerait sur un objet deja '
  'absent, c est-a-dire au moment ou on en a besoin')
g('ft_comptes' not in RETOUR_SQL and 'ft_miroir' not in RETOUR_SQL,
  'le retour arriere toucherait l existant')
H.append(P(RETOUR_TXT, 'p'))
H.append(bloc_code(RETOUR_SQL))
H.append(encadre(
    'ET APRES ? RIEN, TANT QUE MICHEL N A PAS REPONDU',
    'La suite - la route du Worker, la cle secrete a configurer, la bascule du client, puis '
    'seulement le retrait du droit sur l ancienne fonction - viendra <b>une etape a la '
    'fois</b>. <b>V2 ne sera declaree fermee que sur un refus reseau reel</b>, pas sur un code '
    'qui a l air bon. <i>Nouveau chemin operationnel et V2 fermee sont deux choses '
    'differentes, et les confondre serait la seule vraie facon de rater ce chantier.</i>',
    VERT))
H.append(P('Document produit par ' + str(GARDES[0]) + ' gardes qui recomptent chaque fait '
           'depuis le code servi ' + VERSION + ', depuis les migrations et depuis les journaux '
           'des deux bancs - et qui refusent de produire si l un tombe, y compris celle qui '
           'verifie que V2 est encore ouverte.', 'petit'))
# @@FIN@@

# ═══════════════════════════════════════════════════════════════════════════════════════
# III. GARDES DE FIN
# ═══════════════════════════════════════════════════════════════════════════════════════
TOUT = ' '.join(TEXTES)
_bt = TOUT.lower()
_rendu = (TOUT + ' ' + ' '.join(CODES)).lower()

g('sb_publishable' not in _rendu and 'supabase.co' not in _rendu,
  'une cle ou l URL du projet apparait dans le document')
for m in re.finditer(r'[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}', _rendu):
    g(False, 'une adresse e-mail apparait dans le document : %s' % m.group(0))
for _i in ('service_role', 'secret key', 'sb_secret'):
    g(_i not in _rendu,
      'le document nomme un justificatif serveur (« %s ») : il doit parler de « cle secrete » '
      'sans jamais designer ni exposer une valeur' % _i)


def _mentionnee(txt, i):
    o = txt.rfind('«', 0, i)
    return o >= 0 and txt.find('»', o) > i


INTERDITS = [
    (r'v2 est (desormais )?fermee|v2 a ete fermee|v2 est corrigee',
     'le document AFFIRME que V2 est fermee : elle est ouverte a l instant ou il est produit'),
    (r'le sql a ete applique dans supabase|la migration a ete appliquee chez',
     'le document AFFIRME une application chez Supabase qui n a pas eu lieu'),
    (r'l option b est disponible|un secret moins privilegie est disponible',
     'le document AFFIRME la disponibilite de l option B : elle n a pas pu etre prouvee'),
    (r'ce banc prouve le deploiement|preuve de deploiement obtenue',
     'le document AFFIRME une preuve de deploiement : le banc est local'),
    (r'force ne casserait rien nulle part|force est sans danger',
     'le document banalise FORCE : le mecanisme est reel, c est la dependance qui est le sujet'),
]
for _bloc in TEXTES:
    _b = _bloc.lower()
    for _mot, _msg in INTERDITS:
        for m in re.finditer(_mot, _b):
            deb = max([_b.rfind(c, 0, m.start()) for c in '.?!']
                      + [_b.rfind('<br/>', 0, m.start()) + 4]) + 1
            fin = min([i for i in (_b.find(c, m.end()) for c in '.?!') if i != -1]
                      or [len(_b)])
            interro = _b[deb:fin + 1].rstrip().endswith('?')
            citee = _mentionnee(_b, m.start())
            niee = re.search(r"\bne\b|\bn\b|\bpas\b|\bjamais\b|\bni\b|\bnon\b|\bsi\b"
                             r"|\baucune?\b|\brien\b|\bsans\b|\btant que\b", _b[deb:m.start()])
            g(interro or citee or niee is not None, _msg)

for _mot, _pourquoi in (
        ('option d', 'c est le verdict de privilege'),
        ('injoignable depuis le conteneur', 'c est pourquoi B ne peut pas etre prouve'),
        ('zero ligne', 'c est la mesure du piege FORCE'),
        ('oracle', 'c est la raison du message de refus unique'),
        ('ne ressuscite pas', 'c est la propriete de securite du « do nothing »'),
        ('semantique sql', 'c est la borne du banc local'),
        ('refus reseau reel', 'c est la seule preuve qui fermera V2'),
        ('source de verite supposee', 'c est pourquoi on ne recree pas l existant'),
        ('retour arriere', 'il doit etre donne avec l etape d ecriture')):
    g(_mot in _bt, 'le document ne parle plus de « %s » : %s' % (_mot, _pourquoi))

# les chiffres du document viennent bien des journaux, pas d'une saisie
g(str(BANC_OK) in TOUT and str(MUT_OK) + '/' + str(MUT_TOT) in TOUT,
  'les totaux lus dans les journaux n apparaissent pas dans le document')

SimpleDocTemplate(OUT, pagesize=A4,
                  leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='S2-B phase 1 - schema versionne et eprouve',
                  author='Force Tracker').build(H)

print('OK %s  (%s, %d gardes, banc %d OK / %d rouge [lu], mutations %d/%d [lu], '
      'migrations %d, V2 ouverte : True)'
      % (OUT, VERSION, GARDES[0], BANC_OK, BANC_KO, MUT_OK, MUT_TOT, len(MIGS)))
