#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""FORCE TRACKER — MIROIR MULTI-APPAREILS ET CONCURRENCE — DIAGNOSTIC AVANT CORRECTION.

MESURER -> COMPRENDRE -> PROPOSER. Pas encore MODIFIER. Aucune correction n'est deployee,
aucune course n'est provoquee, V2 n'est pas fermee, la Douane n'est pas touchee.

[!!] LES CHIFFRES DE CE DOSSIER SONT RECOMPTES DEPUIS LE CODE SERVI, JAMAIS ECRITS A LA MAIN :
     le nombre de champs du corps de sauvegarde, combien sont proteges cote Apps Script,
     combien peuvent etre omis, combien echappent a son traitement. Une seule de ces valeurs
     ecrite de memoire suffirait a faire raisonner de travers celui qui lit — et c'est
     exactement ce qui est arrive avec le libelle « UTC » la veille.

[!!] LA GARDE LA PLUS UTILE EST CELLE DES SEMANTIQUES DE FUSION : le dossier affirme
     « Apps Script conserve un champ absent » et « Supabase le perd ». Les deux se lisent
     dans le code (le `if (body.X !== undefined)` d'un cote, le `set data = excluded.data`
     de l'autre) et le generateur refuse de produire si l'une des deux bouge.

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
                                KeepTogether)

ROOT = os.environ.get('FT_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRATCH = ('/tmp/claude-0/-home-user-forcetracker/'
           '12f61d67-fd14-50ef-8709-99418240fb44/scratchpad')
OUT = os.environ.get('FT_OUT') or os.path.join(
    SCRATCH, 'MIROIR-MULTI-APPAREILS-ET-CONCURRENCE-18-09-2026.pdf')

GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


def sans_com_js(src):
    """Retire les commentaires de bloc et les commentaires de FIN DE LIGNE.

    [!!] LE `[^:"']` N EST PAS UN DETAIL : sans lui, `https://` est pris pour un commentaire
         et la moitie d une ligne disparait. Et retirer les commentaires n est pas un
         raffinement — un garde qui les lit mesure la DOCUMENTATION, pas le code. Ce piege a
         deja rougi ici meme, sur une note qui citait une piste ecartee : or R30 exige
         justement d ecrire la raison a cote du code.
    """
    s = re.sub(r'/\*[\s\S]*?\*/', '', src)
    return re.sub(r'(^|[^:"\'])//[^\n]*', r'\1', s)


SW = lire('sw.js')
VERSION = (re.search(r"const CACHE\s*=\s*'(ft-v\d+)'", SW) or [None, ''])[1]
g(re.match(r'^ft-v\d+$', VERSION), 'la version servie n a pas pu etre lue dans sw.js')

CJ = lire('Code.js')
SETUP = lire('setup.js')
SB = lire('supabase.js')
W = lire('worker.js')
MIG2 = lire('supabase/migrations/20260917_0002_rpc_s2b.sql')

# ══ 1. LE CORPS DE SAUVEGARDE — decoupe par equilibrage, pas par regex approximative ════
_i = SETUP.find('const _corpsSync={')
g(_i > 0, 'le corps de sauvegarde _corpsSync est introuvable dans setup.js')
_j = SETUP.find('{', _i)
_d = 0
_k = _j
for _k in range(_j, len(SETUP)):
    if SETUP[_k] == '{':
        _d += 1
    elif SETUP[_k] == '}':
        _d -= 1
        if not _d:
            break
_B = sans_com_js(SETUP[_j:_k + 1])
CHAMPS = re.findall(r'(?m)^\s{4,6}([A-Za-z_][A-Za-z0-9_]*)\s*:', _B)
N_CHAMPS = len(CHAMPS)
g(N_CHAMPS >= 40, 'le corps de sauvegarde ne porte plus que %d champs : recompter' % N_CHAMPS)

# champs pouvant valoir `undefined`, donc ABSENTS du JSON une fois serialises
OMISSIBLES = [c for c in CHAMPS if re.search(re.escape(c) + r'\s*:[^,\n]*undefined', _B)]
g(OMISSIBLES == ['sessions'],
  'la liste des champs omissibles a change (%s) : le dossier doit etre recompte'
  % ', '.join(OMISSIBLES))

# ══ 2. CE QU APPS SCRIPT FAIT DE CHAQUE CHAMP ═══════════════════════════════════════════
PROTEGES = set(re.findall(r'body\.(\w+)\s*!==\s*undefined', CJ))
N_PROT = len([c for c in CHAMPS if c in PROTEGES])
IGNORES = [c for c in CHAMPS if not re.search(r'body\.' + c + r'\b', CJ)]
SANS_GARDE = [c for c in CHAMPS if c not in PROTEGES and c not in IGNORES]
g(IGNORES == [],
  'des champs du corps ne sont plus lus par Apps Script (%s) : asymetrie inverse a decrire'
  % ', '.join(IGNORES))
g(SANS_GARDE == ['action'],
  'la liste des champs sans garde a change (%s)' % ', '.join(SANS_GARDE))
g(N_PROT == N_CHAMPS - 1,
  'le compte des champs proteges ne colle plus : %d proteges pour %d champs'
  % (N_PROT, N_CHAMPS))

# ⭐ LES DEUX AIDES DE FUSION : champ absent conserve, tableau VIDE refuse.
g('function _pa_(b, e){ if(b===undefined)return e;' in CJ,
  'l aide _pa_ a change : « champ absent = conserver » n est plus prouve')
g('return(bi.length>0||ei.length===0)?bi:ei;' in CJ,
  'l aide _pa_ ne refuse plus un tableau vide : la section suppression est fausse')
g('function _po_(b, e){ if(b===undefined)return e;' in CJ,
  'l aide _po_ a change : le cas des objets n est plus prouve')
# ⛔ ET LE POINT CENTRAL DE LA SECTION « RESURRECTION » : hors sessions, un tableau NON VIDE
#    remplace l existant en entier, sans comparaison de taille.
for _t in ('weightLog', 'sleepLog', 'dayStateLog'):
    _m = re.search(r'if \(body\.' + _t + r' !== undefined\) \{(.*?)\n    \}', CJ, re.S)
    g(_m is not None, 'le traitement de %s est introuvable' % _t)
    g('.length === 0 &&' in _m.group(1) and 'PART_MINI' not in _m.group(1),
      '%s a gagne ou perdu un garde : la section resurrection doit etre recomptee' % _t)
g(re.search(r'const SEUIL_MINI = 30, PART_MINI = 0\.6;', CJ) is not None,
  'le garde anti-retrecissement des seances a disparu')
g(len(re.findall(r'PART_MINI', CJ)) == 2,
  'le garde anti-retrecissement ne protege plus EXACTEMENT un seul champ')

# ══ 3. CE QUE SUPABASE FAIT — remplacement integral, aucun garde ════════════════════════
_FN = (re.search(r'create or replace function public\.ft_enregistrer_instantane\b.*?\n\$\$;',
                 MIG2, re.S) or [''])[0]
g('set data = excluded.data, updated_at = now();' in _FN,
  'le miroir ne remplace plus le blob en entier : tout le dossier est a refaire')
g('||' not in _FN.split('on conflict')[-1],
  'une fusion jsonb est deja en place dans le miroir : la proposition B serait deja faite')
g('where excluded' not in _FN and 'p_revision' not in _FN,
  'un garde de version existe deja dans le miroir : le dossier doit le decrire')

# ══ 4. AUCUN MECANISME DE REVISION N EXISTE — c est ce qui rend l option A couteuse ═════
# ⚠️ ON MESURE LE CODE, PAS LA NOTE QUI EN PARLE : ce dossier ETUDIE justement une revision,
#    donc le mot figure forcement dans les commentaires qui exposent la piste.
_CODE_NU = sans_com_js(SETUP) + sans_com_js(SB) + sans_com_js(W) + sans_com_js(CJ)
g(not re.search(r'\brevision\b|\bclientVersion\b|snapshotVersion', _CODE_NU),
  'un mecanisme de revision existe : l option A doit alors s appuyer dessus, pas en creer un')

# ══ 5. L ETAT DU CHANTIER — rien n a ete modifie ════════════════════════════════════════
g('p_email: email' in sans_com_js(SB), 'V2 serait fermee : ce dossier decrit un etat ouvert')
g("const SB_VOIE = 'worker'" in SB, 'la voie servie n est plus le Worker')
g('sessions:S.histTronque?undefined:' in sans_com_js(SETUP),
  'l omission volontaire des seances a disparu : la section asymetrie est fausse')

# ── mise en page ───────────────────────────────────────────────────────────────────────
ROUGE = colors.HexColor('#C0392B')
ENCRE = colors.HexColor('#1A1A1A')
GRIS = colors.HexColor('#5A5A5A')
FOND = colors.HexColor('#F4F4F2')
TRAIT = colors.HexColor('#D8D8D4')

_ss = getSampleStyleSheet()
ST = {
    'titre': ParagraphStyle('t', parent=_ss['Title'], fontName='Helvetica-Bold',
                            fontSize=14.5, leading=18, textColor=ENCRE, spaceAfter=2),
    'sous': ParagraphStyle('s', parent=_ss['Normal'], fontName='Helvetica',
                           fontSize=8.2, leading=10.8, textColor=GRIS, spaceAfter=9),
    'h1': ParagraphStyle('h1', parent=_ss['Normal'], fontName='Helvetica-Bold',
                         fontSize=10.6, leading=13, textColor=ROUGE,
                         spaceBefore=10, spaceAfter=4),
    'p': ParagraphStyle('p', parent=_ss['Normal'], fontName='Helvetica',
                        fontSize=8.2, leading=11.2, textColor=ENCRE, spaceAfter=5),
    'petit': ParagraphStyle('pt', parent=_ss['Normal'], fontName='Helvetica',
                            fontSize=7.3, leading=9.6, textColor=GRIS, spaceAfter=4),
    'code': ParagraphStyle('cd', parent=_ss['Normal'], fontName='Courier',
                           fontSize=6.6, leading=8.2, textColor=ENCRE, spaceAfter=2),
    'cell': ParagraphStyle('c', parent=_ss['Normal'], fontName='Helvetica',
                           fontSize=7.4, leading=9.5, textColor=ENCRE),
    'cellg': ParagraphStyle('cg', parent=_ss['Normal'], fontName='Helvetica-Bold',
                            fontSize=7.4, leading=9.5, textColor=ENCRE),
}

TEXTES, CODES = [], []


def _v(s):
    rendu = html.unescape(s)
    try:
        rendu.encode('cp1252')
    except UnicodeEncodeError as e:
        raise SystemExit('POLICE - hors cp1252 : %r (dans %r)' % (rendu[e.start:e.end], s[:70]))
    return s


def P(txt, st='p'):
    TEXTES.append(txt)
    return Paragraph(_v(txt), ST[st])


def bloc_code(txt):
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
        ('LEFTPADDING', (0, 0), (-1, -1), 4), ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    return KeepTogether([t, Spacer(1, 6)])


PC = '<font color="#1E7A46"><b>PROUVE PAR CODE</b></font>'
NP = '<font color="#C0392B"><b>NON PROUVE</b></font>'
DE = '<font color="#B26A00"><b>DEDUIT</b></font>'

H = []
H.append(P('Miroir multi-appareils et concurrence - diagnostic avant correction', 'titre'))
H.append(P('Force Tracker - 18 septembre 2026 - base servie ' + VERSION + ' - hors depot '
           '(regle d or #14) - <b>MESURER, COMPRENDRE, PROPOSER. Aucune modification, aucune '
           'course provoquee, V2 non fermee, Douane non touchee.</b>', 'sous'))

# ══════════════════ BLOC A ═════════════════════════════════════════════════════════════
H.append(P('A - S2-B : les agregats, et la preuve ACTUELLE de leur absence', 'h1'))
H.append(P('La regle « aucune impossibilite sans preuve » a ete appliquee <b>a neuf</b>, pas '
           'recopiee de la passe precedente. <b>Cinq verifications, faites maintenant :</b>',
           'p'))
H.append(tableau(
    ['ce qui a ete verifie', 'resultat mesure'],
    [['reseau vers Supabase (HTTPS)',
      '<font face="Courier">CONNECT tunnel failed, response 403</font> - sur le domaine du '
      'projet <b>et</b> sur l API Supabase'],
     ['connexion PostgreSQL directe',
      "l hote <font face=\"Courier\">db.&lt;ref&gt;.supabase.co</font> n a <b>aucune "
      "adresse</b> (<font face=\"Courier\">No address associated with hostname</font>) ; le "
      "pooler repond par un <b>delai depasse</b>"],
     ['outils presents dans le conteneur',
      '<font face="Courier">psql</font> et <font face="Courier">pg_dump</font> sont '
      '<b>installes</b> - donc l outil n est pas le probleme ; aucun serveur local n ecoute'],
     ['automatisation deja existante (workflows)',
      'trois workflows, <b>aucun secret Supabase</b> : seulement '
      '<font face="Courier">CLASPRC_JSON</font> (Apps Script) et '
      '<font face="Courier">CLOUDFLARE_API_TOKEN</font> (Worker)'],
     ['droits effectifs, meme avec la cle du Worker',
      '<b>c est le point decisif</b> : <font face="Courier">ft_jetons</font> est retiree a '
      '<font face="Courier">service_role</font>. <b>La cle que detient le Worker ne peut pas '
      'lire cette table.</b> Fabriquer une lecture automatisee imposerait donc de '
      '<b>changer les droits</b> - ce que cette passe interdit.']],
    [46 * mm, 120 * mm]))
H.append(encadre(
    'CONCLUSION DU BLOC A : LES AGREGATS RESTENT NON MESURES, ET LA RAISON N EST PAS UN MANQUE '
    'D OUTIL',
    'Ce n est pas <i>« je ne peux pas »</i> : c est que la table a ete deliberement rendue '
    'illisible a tout ce qui n est pas le proprietaire, et que le seul chemin restant est '
    'l editeur SQL du tableau de bord. <b>Les huit agregats et la distribution attendent donc '
    'une execution manuelle</b>, avec les requetes deja publiees dans le dossier precedent. '
    '<b>Consequence directe : on ne peut ni preparer ni ecarter la fermeture de V2 aujourd hui, '
    'faute du chiffre <font face="Courier">comptes_sans_jeton_actif</font>.</b> '
    '<i>Aucune case n est remplie par deduction.</i>'))

# ══════════════════ BLOC B ═════════════════════════════════════════════════════════════
H.append(P('B - le miroir aujourd hui : les deux destinations, cote a cote', 'h1'))
H.append(P('Le corps de sauvegarde porte <b>' + str(N_CHAMPS) + ' champs</b>, construit '
           '<b>une seule fois</b> et servi aux deux destinations (R2). Ce sont les '
           'destinations qui en font deux choses differentes.', 'p'))
H.append(tableau(
    ['', 'Apps Script (<font face="Courier">saveProfile</font>)',
     'Supabase (<font face="Courier">ft_enregistrer_instantane</font>)'],
    [['ecriture', 'fusion <b>champ par champ</b> dans le profil existant',
      '<font face="Courier">insert ... on conflict (email) do update set data = '
      'excluded.data</font> - <b>le blob entier est remplace</b>'],
     ['champ absent',
      '<b>conserve l existant</b> - ' + str(N_PROT) + ' des ' + str(N_CHAMPS) +
      ' champs sont gardes par <font face="Courier">if (body.X !== undefined)</font> '
      '(le seul restant est <font face="Courier">action</font>, qui est le mot de routage)',
      '<b>le champ disparait de la copie</b>'],
     ['tableau vide explicite',
      '<b>refuse</b> - <font face="Courier">_pa_</font> garde l existant si l envoi est vide '
      '(idem <font face="Courier">_po_</font> pour les objets), et trois journaux le tracent',
      '<b>accepte</b> - le vide est ecrit tel quel'],
     ['retrecissement brutal',
      'refuse <b>pour les seances uniquement</b> (seuils 30 / 60 %)', '<b>aucun garde</b>'],
     ['horodatage / version', 'aucun',
      '<font face="Courier">updated_at = now()</font>, <b>jamais relu a l ecriture</b>'],
     ['multi-appareils', 'dernier ecrivain gagnant, <b>champ par champ</b>',
      'dernier ecrivain gagnant, <b>blob entier</b>'],
     ['statut', PC, PC]],
    [26 * mm, 70 * mm, 70 * mm]))

H.append(P('B.1 - les champs pouvant subir l asymetrie du champ omis', 'h1'))
H.append(P('La recherche a ete faite sur <b>tous</b> les champs du corps, pas seulement '
           '<font face="Courier">sessions</font> : on cherche ceux qui peuvent valoir '
           '<font face="Courier">undefined</font>, donc <b>disparaitre du JSON</b> une fois '
           'serialises.', 'p'))
H.append(tableau(
    ['champ', 'peut etre omis ?', 'pourquoi', 'Apps Script', 'Supabase', 'risque'],
    [['<font face="Courier">sessions</font>', '<b>OUI</b>',
      'omission <b>volontaire</b> quand le stockage local a sature et que l historique a ete '
      'tronque a 50 seances', 'conserve l historique complet - <b>c est le but</b>',
      '<b>le champ disparait du miroir</b>',
      'miroir <b>incomplet</b>'],
     ['les ' + str(N_CHAMPS - 1) + ' autres', 'non',
      'chacun porte un repli explicite (<font face="Courier">||</font>, une valeur par defaut '
      'ou une conversion), donc la cle est toujours presente', 'conserve si absent',
      'sans objet', 'aucun'],
     ['<i>(inverse)</i> champ envoye mais ignore', 'sans objet',
      '<b>aucun</b> : les ' + str(N_CHAMPS) + ' champs sont lus par Apps Script - '
      'il n y a pas d asymetrie dans l autre sens', '-', '-', 'aucun']],
    [26 * mm, 20 * mm, 56 * mm, 26 * mm, 22 * mm, 16 * mm]))
H.append(P('<b>Un seul champ est concerne, et c est un resultat, pas une chance</b> : le corps '
           'de sauvegarde a ete ecrit avec des replis partout. <i>La regle implicite qui '
           'protege le projet est donc « tout champ porte un repli » - elle n est ecrite nulle '
           'part, et rien ne la verifie.</i>', 'petit'))

H.append(P('B.2 - la suppression, et la reponse a « la donnee peut-elle revenir ? »', 'h1'))
H.append(encadre(
    'OUI - ET PAS SEULEMENT DANS LE MIROIR. C EST LE POINT LE PLUS IMPORTANT DE CE DOSSIER.',
    'Le constat acte disait <i>« le risque de course est limite au miroir »</i>. C est vrai '
    '<b>pour la valeur d un champ</b>. Ce ne l est <b>pas pour une suppression a l interieur '
    'd un tableau</b>, et la mesure le montre : hors <font face="Courier">sessions</font>, un '
    'tableau <b>non vide</b> remplace l existant <b>en entier, sans comparaison de taille</b> '
    '- <font face="Courier">weightLog</font>, <font face="Courier">sleepLog</font> et '
    '<font face="Courier">dayStateLog</font> ne refusent que le tableau <b>vide</b>. '
    '<b>Donc : le telephone A supprime une pesee (10 -> 9) et sauvegarde ; le telephone B, '
    'reste a 10, sauvegarde ensuite - et les 10 reviennent dans Apps Script comme dans '
    'Supabase.</b> <i>La resurrection n est pas un defaut du miroir : elle est inherente au '
    'fait qu un instantane complet et ancien ecrase un instantane recent, des deux cotes.</i>'))
H.append(P('<b>Et le garde-fou anti-vidage a un revers qu il faut dire</b> : supprimer '
           '<i>toutes</i> ses pesees volontairement produit un tableau vide, que Apps Script '
           '<b>refuse</b>. La suppression totale ne remonte donc pas au cloud, et une '
           'restauration la defait. <i>Ce comportement protege d un effacement accidentel et '
           'empeche un effacement voulu - c est un arbitrage deja pris (02/08/2026), pas un '
           'bug, et il n est pas rouvert ici.</i>', 'p'))
H.append(P('<b>Lien avec les tombstones du chantier memoire Milo, sans le construire :</b> '
           'un marqueur de suppression reglerait les deux cas d un coup, parce qu il '
           'transforme « ce qui n est plus la » en <b>fait positif transportable</b> au lieu '
           'd une absence - et une absence, par construction, ne peut pas gagner contre une '
           'presence ancienne. <b>Interaction a retenir : toute correction du miroir faite '
           'maintenant devra pouvoir cohabiter avec des marqueurs de suppression plus tard, '
           'donc ne pas supposer que le tableau recu est la verite complete.</b>', 'p'))

H.append(P('B.3 - deux appareils qui ecrivent a quelques secondes d intervalle', 'h1'))
H.append(tableau(
    ['donnee', 'ce qui se passe si B (etat ancien) ecrit apres A', 'classement'],
    [['un champ que <b>ni</b> A ni B n a touche', 'identique des deux cotes : <b>correct</b>',
      PC],
     ['un champ modifie par A seulement',
      '<b>revient a la version anterieure</b> dans le miroir et chez Apps Script', PC],
     ['une entree <b>ajoutee</b> par A', '<b>disparait</b> jusqu a la prochaine ecriture de A',
      PC],
     ['une entree <b>supprimee</b> par A', '<b>revient</b> (voir B.2)', PC],
     ['les seances', 'protegees du <b>rétrecissement brutal</b> chez Apps Script uniquement',
      PC],
     ['recuperation ensuite',
      'la prochaine sauvegarde de A <b>reecrase</b> avec son etat a jour : l app est '
      'local-first, chaque appareil re-emet son etat complet', DE],
     ['le comportement <b>observe</b> de deux telephones reels',
      'personne ne l a mesure - et aucune course n a ete provoquee, conformement a la consigne',
      NP]],
    [40 * mm, 104 * mm, 22 * mm]))

# ══════════════════ BLOC C ═════════════════════════════════════════════════════════════
H.append(P('C - les risques, classes', 'h1'))
H.append(tableau(
    ['risque', 'classement', 'mesure ?'],
    [['champ <font face="Courier">sessions</font> omis absent du miroir',
      '<b>miroir incomplet</b>', '<b>mesure</b> (code)'],
     ['instantane ancien qui ecrase un recent, valeurs de champs',
      '<b>miroir ancien</b> (la source reste juste apres la prochaine sauvegarde)',
      '<b>mesure</b> (code)'],
     ['entree supprimee qui revient',
      '<b>resurrection</b> - <b>et elle atteint Apps Script, pas seulement le miroir</b>',
      '<b>mesure</b> (code)'],
     ['suppression totale d une liste jamais propagee',
      '<b>resurrection</b>, par un garde-fou volontaire', '<b>mesure</b> (code)'],
     ['perte reelle de donnees',
      '<b>aucune</b> - les deux destinations sont independantes et aucune ne vide l autre',
      '<b>mesure</b> (code)'],
     ['course reelle entre deux telephones', '<b>uniquement theorique a ce stade</b>',
      '<b>non mesure</b>'],
     ['comptes non couverts par un jeton', '<b>non mesure</b> - voir bloc A', '<b>non mesure</b>']],
    [72 * mm, 62 * mm, 32 * mm]))

# ══════════════════ BLOC D ═════════════════════════════════════════════════════════════
H.append(P('D - la correction minimale proposee', 'h1'))
H.append(tableau(
    ['option', 'ce qu elle corrige', 'ce qu elle coute', 'verdict'],
    [['<b>A</b> - garder le remplacement, ajouter un garde de version',
      'l instantane ancien',
      '<b>aucun mecanisme de revision n existe dans le projet</b> (verifie : zero occurrence). '
      'Il faudrait en creer un cote client, le transporter, ajouter une colonne a '
      '<font face="Courier">ft_comptes</font> - <b>table non versionnee</b> - et gerer le '
      'premier envoi des anciens clients. <b>Et un refus d ecriture doit rester silencieux '
      'pour ne pas gener l usage local.</b>',
      '<b>differe</b>'],
     ['<b>B</b> - fusion cote Supabase : « champ absent = ne pas modifier »',
      'le champ omis',
      '<b>une ligne</b> dans la fonction RPC. Aucun changement client, aucun changement '
      'Worker, aucune migration de <font face="Courier">ft_comptes</font>, retour arriere en '
      'une ligne.', '<b>RETENUE</b>'],
     ['<b>C</b> - les deux', 'les deux', 'la somme des deux, dont le cout de A',
      '<b>plus tard</b>'],
     ['<b>D</b> - autre',
      'le client cesse d omettre <font face="Courier">sessions</font>',
      '<b>ecarte, et la raison compte</b> : l omission existe justement pour ne pas envoyer un '
      'historique ampute. La retirer ferait ecraser le cloud par la version tronquee - '
      'c est le bug du 02/08/2026, re-cree.', '<b>ecartee</b>']],
    [40 * mm, 30 * mm, 76 * mm, 20 * mm]))

H.append(encadre(
    'POURQUOI B ET RIEN D AUTRE POUR L INSTANT',
    'B ne fait pas de Supabase une deuxieme source de verite : elle lui donne <b>exactement la '
    'semantique qu Apps Script applique deja</b> - <i>champ absent, champ conserve</i>. C est '
    'donc une <b>mise en coherence</b>, pas une regle nouvelle. Elle ne demande rien au client, '
    'donc elle ne peut pas gener le fonctionnement hors ligne, ni pendant une panne du Worker, '
    'ni une sauvegarde differee (point 10). Et elle ne touche <b>ni Apps Script ni son '
    'independance</b>. <i>A l inverse, A repare un risque deja borne au miroir, au prix d un '
    'mecanisme qui n existe pas - c est le rapport cout/benefice qui la fait attendre, pas sa '
    'valeur.</i>'))
H.append(P('Forme conceptuelle de B, <b>non deployee</b> :', 'p'))
H.append(bloc_code(
    "on conflict (email) do update\n"
    "   set data = public.ft_comptes.data || excluded.data,   -- fusion de surface\n"
    "       updated_at = now();"))
H.append(tableau(
    ['aspect', 'option B'],
    [['fichiers touches',
      'une <b>nouvelle</b> migration <font face="Courier">supabase/migrations/</font> (les '
      'migrations ne se reecrivent pas) - <b>et rien d autre</b>'],
     ['fonctions touchees', '<font face="Courier">ft_enregistrer_instantane</font> seulement'],
     ['migration necessaire', 'oui, une seule, et <b>elle ne touche aucune table</b>'],
     ['impact client / Worker / Apps Script', '<b>aucun, aucun, aucun</b>'],
     ['anciens clients', '<b>compatibles</b> : ils envoient toujours toutes les cles'],
     ['rollback', '<b>une migration inverse qui remet la ligne d origine</b>'],
     ['ce que B ne corrige PAS',
      "l instantane ancien, la resurrection d une entree supprimee, et la suppression totale "
      "d une liste. <b>Elle ne doit pas etre presentee comme les reglant.</b>"],
     ['effet secondaire a connaitre',
      '<b>des cles zombies</b> : une cle qu une future version cesserait d envoyer resterait '
      'dans le miroir indefiniment. Consequence faible (le miroir grossit), mais elle doit '
      'etre <b>ecrite</b> pour que personne ne la redecouvre.']],
    [40 * mm, 126 * mm]))

H.append(P('D.1 - comportement en panne, pour chaque option', 'h1'))
H.append(tableau(
    ['scenario', 'aujourd hui', 'avec B'],
    [['Supabase tombe', 'la sauvegarde Apps Script part quand meme ; le miroir est saute et '
      'l etat le dit', '<b>identique</b>'],
     ['Apps Script tombe', 'le miroir recoit toujours ; <b>mais un appareil sans ligne au '
      'registre ne peut plus etre inscrit</b> (le pont passe par Apps Script)', '<b>identique</b>'],
     ['les deux reviennent avec des etats differents',
      '<b>Apps Script fait foi</b> : c est lui que la restauration lit', '<b>identique</b>'],
     ['risque de resurrection d anciennes donnees',
      'present des deux cotes (B.2)', '<b>inchange - B ne le traite pas</b>']],
    [42 * mm, 86 * mm, 38 * mm]))

H.append(P('D.2 - matrice de tests a prevoir (aucun destructif sur donnees reelles)', 'h1'))
H.append(P('1 un telephone - 2 deux telephones meme compte - 3 A puis B - 4 B puis A - '
           '5 champ absent - 6 champ vide explicite - 7 instantane ancien - 8 suppression sur '
           'A puis sauvegarde ancienne sur B - 9 panne Supabase - 10 panne Apps Script - '
           '11 retour reseau - 12 historique local tronque - 13 stockage sature - '
           '14 restauration cloud - 15 compte a plusieurs jetons actifs - 16 revocation d un '
           'seul telephone.', 'p'))
H.append(P('<b>Les 16 sont jouables sur une base PostgreSQL locale</b> : le depot porte deja un '
           'banc qui eprouve les migrations sur un vrai serveur (<font face="Courier">'
           'tools/test_migrations_s2b.py</font>), et <font face="Courier">psql</font> est '
           'installe. <b>Les cas 5, 6, 7, 8 et 12 sont ceux qui distinguent reellement '
           'l avant et l apres</b> ; les autres sont des non-regressions. '
           '<i>Et le banc devra etre eprouve par mutation avant de servir : un test qui ne peut '
           'pas rougir ne mesure rien.</i>', 'petit'))

H.append(P('E - ce que cette passe ne fait pas', 'h1'))
H.append(P('<b>Aucune modification.</b> V2 non fermee, aucun jeton revoque, '
           '<font face="Courier">sbMirror</font> intacte, aucun droit Supabase change, '
           '<b>aucune regle Douane touchee</b> (verdict inchange : <b>continuer '
           'l observation</b>), rien sur FREE/PREMIUM, rien sur le registre des capacites IA, '
           'rien sur Milo. Aucune course provoquee entre deux telephones. <b>Aucune correction '
           'du miroir deployee</b> - l option B est <b>proposee</b>, elle attend une decision.',
           'p'))

# ── controles de sortie ────────────────────────────────────────────────────────────────
_bt = ' '.join(TEXTES).lower()
_rendu = _bt + ' ' + ' '.join(CODES).lower()
for _mot, _msg in [
        ('v2 est fermee', 'le document annonce une fermeture qui n a pas eu lieu'),
        ('perte reelle de donnees est', 'aucune perte reelle n est demontree'),
        ('regle inutile', 'aucune regle n est declaree inutile')]:
    g(_mot not in _bt, _msg)
for _mot, _pourquoi in (
        ('pas seulement dans le miroir', 'la correction au constat acte, sur preuve nouvelle'),
        ('changer les droits', 'la raison decisive de l impossibilite de lecture'),
        ('connect tunnel failed', 'la cause technique precise'),
        ('cles zombies', 'l effet secondaire de l option B'),
        ('continuer l observation', 'le verdict Douane, conserve'),
        ('non deployee', 'la nature de la proposition')):
    g(_mot in _bt, 'le document ne porte plus « %s » : %s' % (_mot, _pourquoi))
g(re.search(r'\b[0-9a-f]{32,}\b', _rendu) is None, 'un hexadecimal long figure dans le document')
g('@' not in _rendu, 'une adresse semble figurer dans le document')

SimpleDocTemplate(OUT, pagesize=A4, leftMargin=21 * mm, rightMargin=21 * mm,
                  topMargin=16 * mm, bottomMargin=14 * mm,
                  title='Miroir multi-appareils et concurrence',
                  author='Force Tracker').build(H)
print('OK %s  (%s, %d gardes, %d champs / %d proteges / %d omissible, aucune modification)'
      % (OUT, VERSION, GARDES[0], N_CHAMPS, N_PROT, len(OMISSIBLES)))
