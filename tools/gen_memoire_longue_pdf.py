#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ETUDE — MEMOIRE LONGUE DE MILO : conservation, construction, rattrapage (18/09/2026).

⛔⛔ LES GARDES RECOMPTENT CHAQUE FAIT DEPUIS LE CODE SERVI ET REFUSENT DE PRODUIRE SI L UN
    D EUX TOMBE. Patron fixe du projet depuis ft-v1196.

⚠️ CE DOSSIER N EST PAS UN PLAN D EXECUTION : aucune ligne servie n a ete modifiee, aucune
   decision produit n a ete prise. Il mesure ce qui EST, et pose les questions a Michel.

⚠️ POLICE : reportlab en WinAnsi/cp1252 — AUCUN emoji.
"""
import os
import re
import sys

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (KeepTogether, PageBreak, Paragraph, SimpleDocTemplate,
                                Spacer, Table, TableStyle)

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SORTIE = os.environ.get('MEM_PDF',
                        '/tmp/FORCE-TRACKER-MEMOIRE-LONGUE-MILO-18-09-2026.pdf')
_ECHECS = []


def g(c, libelle):
    if not c:
        _ECHECS.append(libelle)


def lire(n):
    with open(os.path.join(RACINE, n), encoding='utf-8') as f:
        return f.read()


def sans_comm(src):
    """Neutralise les commentaires EN CONNAISSANT LES CHAINES, longueur exacte conservee."""
    out = list(src)
    i, n = 0, len(src)
    while i < n:
        c = src[i]
        if c in ('"', "'", '`'):
            q = c
            i += 1
            while i < n and src[i] != q:
                i += 2 if src[i] == '\\' else 1
            i += 1
            continue
        if c == '/' and i + 1 < n and src[i + 1] == '*':
            j = src.find('*/', i + 2)
            j = n if j < 0 else j + 2
            for k in range(i, j):
                out[k] = ' '
            i = j
            continue
        if c == '/' and i + 1 < n and src[i + 1] == '/':
            j = src.find('\n', i)
            j = n if j < 0 else j
            for k in range(i, j):
                out[k] = ' '
            i = j
            continue
        i += 1
    return ''.join(out)


def corps(src, nom):
    m = re.search(r'(?m)^(?:async\s+)?function\s+' + re.escape(nom) + r'\s*\(', src)
    if not m:
        return ''
    i = src.index('{', m.start())
    d, j = 0, i
    while j < len(src):
        if src[j] == '{':
            d += 1
        elif src[j] == '}':
            d -= 1
            if d == 0:
                break
        j += 1
    return src[m.start():j + 1]


FICH = ('worker.js', 'Code.js', 'constants.js', 'app.js', 'coach.js', 'log.js',
        'setup.js', 'tracking.js', 'state.js', 'screens.js')
SRC = {f: lire(f) for f in FICH}
NU = {f: sans_comm(t) for f, t in SRC.items()}
F = {}

# ══ 1. LA MEMOIRE EST UNE CHAINE, ET ELLE EST REMPLACEE A CHAQUE APPEL ═══════
_SM = corps(NU['coach.js'], '_resumeCoachUn')
g(_SM != '', "_resumeCoachUn introuvable")
g('S.coachMemory=data.summary' in _SM.replace(' ', ''),
  "la memoire n est plus REMPLACEE par le resume : tout le raisonnement du dossier part de la")
g("localStorage.getItem('ft4_coach_mem')" in NU['state.js'],
  "la memoire ne vit plus dans ft4_coach_mem")
_SC = corps(NU['worker.js'], 'summarizeCoach')
g(_SC != '', "summarizeCoach introuvable dans worker.js")
F['mem_fenetre'] = int(re.search(r'body\.history \|\| \[\]\)\.slice\(-(\d+)\)', _SC).group(1))
F['mem_tokens'] = int(re.search(r'max_tokens: (\d+)', _SC).group(1))
g((F['mem_fenetre'], F['mem_tokens']) == (16, 250),
  "la fenetre ou le plafond du resumeur ont change (%d messages, %d jetons ; dossier : 16 et 250)"
  % (F['mem_fenetre'], F['mem_tokens']))
g('2-3 phrases max' in _SC,
  "le resumeur ne demande plus « 2-3 phrases max » : la mesure centrale du dossier change")
g('existingMemory' in _SM and 'existingMemory' in _SC,
  "la memoire existante n est plus renvoyee au resumeur : le caractere de RECOMPRESSION tombe")

# ══ 2. C NE COUTE AUCUN APPEL : c est un CHAMP, pas une capacite ═════════════
F['mem_champ'] = len(re.findall(r'coachMemory\s*:\s*S\.coachMemory', NU['coach.js']))
g(F['mem_champ'] >= 2,
  "coachMemory n est plus un champ de la charge utile de coach : l argument « C est un champ, "
  "pas une capacite » ne tient plus (%d occurrences)" % F['mem_champ'])

# ══ 3. LE FIL NE QUITTE JAMAIS LE TELEPHONE — et c est une DECISION ══════════
for f in ('setup.js', 'Code.js'):
    g(NU[f].count('coachConversations') == 0,
      "coachConversations part desormais dans %s : le fait central « le fil ne quitte jamais "
      "le telephone » tombe" % f)
    g(NU[f].count('ft4_coach_hist') == 0,
      "ft4_coach_hist est desormais reference dans %s : le fil part au cloud" % f)
g('il ne part ni' in SRC['coach.js'] and 'Drive' in SRC['coach.js'],
  "la raison ecrite du choix (« il ne part ni chez Google, ni sur le Drive, ni chez Supabase ») "
  "a disparu : R30 veut qu une decision reste ecrite a cote du code")
F['hist_max'] = int(re.search(r'_HIST_MAX_MSG = (\d+)', NU['coach.js']).group(1))
F['convs_max'] = int(re.search(r'_CONVS_MAX\s+= (\d+)', NU['coach.js']).group(1))
g((F['hist_max'], F['convs_max']) == (400, 30),
  "les plafonds du fil ont change (%d messages, %d discussions ; dossier : 400 et 30)"
  % (F['hist_max'], F['convs_max']))

# ══ 4. LA COUCHE A EXISTE DEJA, ET ELLE EST DEJA DANS LE NUAGE ═══════════════
# ⚠️ LE LITTERAL ENTIER, PAS UNE TRANCHE. Premier jet : je lisais 6 000 caracteres a partir
#    de `action:'saveProfile'` et j ai conclu que `foodLog` ne partait PAS au nuage — il part,
#    a 600 caracteres au-dela de ma fenetre. *Une fenetre trop courte ne rend pas un resultat
#    partiel : elle rend un resultat FAUX, et de signe oppose.* C est mon propre garde qui l a
#    attrape (R23 : verifier dans le code avant d affirmer qu une chose n existe pas).
_i = NU['setup.js'].find("action:'saveProfile'")
_CORPS = NU['setup.js'][_i - 400:_i + 9000]
_CHAMPS_NUAGE = sorted(set(re.findall(r'(?m)^\s*([a-zA-Z_]\w*)\s*:\s*\(?S\.', _CORPS)))
F['champs_nuage'] = len(_CHAMPS_NUAGE)
g(F['champs_nuage'] >= 40,
  "la sauvegarde ne porte plus qu %d champs : le dossier en compte plus de 40"
  % F['champs_nuage'])
for champ in ('sessions', 'prs', 'weightLog', 'sleepLog', 'dayStateLog', 'goalLog',
              'foodLog', 'programmes', 'savedFoods', 'bodyScans', 'bloodTests',
              'healthProfile', 'missedLog', 'cycle', 'coachMemory'):
    g(champ in _CHAMPS_NUAGE,
      "%s ne part plus dans la sauvegarde : le dossier dit que la couche factuelle est deja "
      "conservee cote nuage" % champ)
for champ in ('coachConversations', 'mealPlan', 'miloRates', 'bodySeries'):
    g(champ not in _CHAMPS_NUAGE,
      "%s part desormais au nuage : le dossier le compte parmi ce qui reste LOCAL" % champ)
F['foodlog_max'] = int(re.search(r'foodLog:\(S\.foodLog\|\|\[\]\)\.slice\(-(\d+)\)',
                                _CORPS.replace(' ', '')).group(1))
g(F['foodlog_max'] == 8000,
  "le plafond du journal alimentaire a change (%d ; dossier : 8000)" % F['foodlog_max'])

# ══ 5. LES PLAFONDS DE RETENTION ════════════════════════════════════════════
F['sessions_max'] = int(re.search(r"'ft4_sessions',JSON\.stringify\(\(S\.sessions\|\|\[\]\)\.slice\(0,(\d+)\)",
                                  NU['log.js'].replace(' ', '')).group(1))
F['jours_max'] = int(re.search(r'S\.dayStateLog\.length>(\d+)', NU['screens.js'].replace(' ', '')).group(1))
F['goal_max'] = int(re.search(r'_GOAL_LOG_MAX = (\d+)', NU['state.js']).group(1))
g((F['sessions_max'], F['jours_max'], F['goal_max']) == (1500, 800, 20),
  "les plafonds de retention ont change (%d seances, %d jours, %d objectifs ; dossier : "
  "1500, 800, 20)" % (F['sessions_max'], F['jours_max'], F['goal_max']))

# ══ 6. LES OBJECTIFS SONT HISTORISES, LE RESTE EST ECRASE ═══════════════════
_GS = corps(NU['state.js'], '_goalSet')
g("S.goalLog.push({ date: today(), de: avant, vers: g" in _GS,
  "goalLog ne journalise plus {date, de, vers} : l exemple « janvier perte, avril maintien, "
  "juillet force » n est plus mesurable")
g("src === 'inscription'" in _GS,
  "la premiere declaration n est plus exclue du journal d objectifs : la nuance du dossier tombe")
for var in ('S.discipline=', 'S.level=', 'S.height=', 'S.activityLevel='):
    g(var in NU['setup.js'].replace(' ', ''),
      "%s n est plus affecte dans setup.js : le dossier dit que ces champs sont ECRASES" % var)
g(NU['state.js'].count('LevelLog') == 0 and NU['state.js'].count('disciplineLog') == 0,
  "un journal de changement de profil est apparu : le dossier dit qu il n en existe aucun")

# ══ 7. AUCUNE PIERRE TOMBALE, ET LA FUSION EST UNE UNION ════════════════════
for mot in ('tombstone', 'deletedAt', 'isDeleted'):
    total = sum(NU[f].count(mot) for f in FICH)
    g(total == 0,
      "« %s » est apparu dans le code (%d fois) : le dossier dit qu il n existe AUCUNE pierre "
      "tombale" % (mot, total))
_FL = corps(NU['state.js'], '_fusionListe')
g('vus.has(k)' in _FL and 'out.push(e)' in _FL,
  "_fusionListe n est plus une UNION : le risque de resurrection decrit par le dossier change")
_PA = re.search(r'function _pa_\(b, e\)\{[^\n]*\}', NU['Code.js'])
g(_PA is not None and 'bi.length>0||ei.length===0' in _PA.group(0).replace(' ', ''),
  "_pa_ a change : l affirmation « une liste VIDEE n ecrase jamais une liste pleine cote "
  "serveur » n est plus verifiable")
F['pa_listes'] = len(re.findall(r'_pa_\(body\.', NU['Code.js']))
g(F['pa_listes'] >= 8,
  "moins de listes passent par _pa_ (%d) : le dossier en compte au moins 8" % F['pa_listes'])

# ══ 8. LE CURSEUR N EXISTE PAS — mais son precedent, si ═════════════════════
# ⛔ LE GARDE COMPTE LES SITES, PAS LA PRESENCE. Premier jet : « updatedAt:'' in state.js » —
#    reste VERT si on le retire du CHARGEMENT, parce que la SAUVEGARDE le porte encore.
#    *Un champ qu on ecrit sans le charger n est plus un curseur, c est un dechet.* Quatrieme
#    fois de cette session que je paie le meme piege (famille des temoins de forme).
F['updatedat_sites'] = NU['state.js'].replace(' ', '').count("updatedAt:''")
g(F['updatedat_sites'] == 2,
  "S.registre.updatedAt n est plus pose aux DEUX sites (chargement et sauvegarde) mais a %d : "
  "le dossier s appuie sur ce precedent de curseur" % F['updatedat_sites'])
g(sum(NU[f].count('memoryProcessedUntil') for f in FICH) == 0,
  "un curseur de memoire existe deja dans le code : le dossier dit qu il n y en a aucun")
F['sess_id'] = ("id:Date.now()" in NU['log.js'].replace(' ', '')
                and "ts:Date.now()" in NU['log.js'].replace(' ', ''))
g(F['sess_id'],
  "une seance ne porte plus id ET ts : le dossier dit qu un curseur deterministe est "
  "possible sans rien ajouter")

if _ECHECS:
    print('REFUS DE PRODUIRE — %d garde(s) tombe(s) :' % len(_ECHECS))
    for e in _ECHECS:
        print('  - ' + e)
    sys.exit(1)

NB = len(re.findall(r'(?m)^\s*g\(',
                    sans_comm(open(os.path.abspath(__file__), encoding='utf-8').read())))

# ══════════════════════════════════════════════════════════════════════════════
NOIR = colors.HexColor('#1a1a1a')
GRIS = colors.HexColor('#6b6b6b')
ROUGE = colors.HexColor('#c0392b')
BLEU = colors.HexColor('#1f5f8b')
VERT = colors.HexColor('#1e7a4b')
FOND = colors.HexColor('#f4f4f4')
SEP = colors.HexColor('#d8d8d8')
S = getSampleStyleSheet()
H1 = ParagraphStyle('H1', parent=S['Title'], fontName='Helvetica-Bold', fontSize=16,
                    leading=20, textColor=NOIR, spaceAfter=4, alignment=TA_LEFT)
H2 = ParagraphStyle('H2', parent=S['Heading2'], fontName='Helvetica-Bold', fontSize=12.5,
                    leading=15, textColor=BLEU, spaceBefore=12, spaceAfter=5)
H3 = ParagraphStyle('H3', parent=S['Heading3'], fontName='Helvetica-Bold', fontSize=10.5,
                    leading=13, textColor=NOIR, spaceBefore=8, spaceAfter=3)
P = ParagraphStyle('P', parent=S['BodyText'], fontName='Helvetica', fontSize=9,
                   leading=12.3, textColor=NOIR, spaceAfter=4)
PET = ParagraphStyle('PET', parent=P, fontSize=7.6, leading=9.8, textColor=GRIS)
CEL = ParagraphStyle('CEL', parent=P, fontSize=7.4, leading=9.3, spaceAfter=0)
CELB = ParagraphStyle('CELB', parent=CEL, fontName='Helvetica-Bold')
ENC = ParagraphStyle('ENC', parent=P, fontSize=8.5, leading=11.3, leftIndent=6,
                     rightIndent=6, spaceBefore=3, spaceAfter=3)


def esc(t):
    return str(t).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def md(t):
    """Echappe pour reportlab SANS manger le balisage que j ecris moi-meme.

    ⛔⛔ DEFAUT REEL, TROUVE EN RELISANT LE PDF PRODUIT : `esc()` transformait mes `<b>` en
        texte, et le dossier Phase 2 livre portait **66 balises en clair** dans ses tableaux.
        *Un PDF qui affiche `< b >` ressemble de loin a un PDF reussi* — c est exactement la
        famille « un PDF muet », et seule une relecture du rendu l attrape.
    ⛔ On n autorise QUE les balises qu on ecrit : b, i, br, font. Tout autre `<` est echappe,
        pour qu une donnee contenant un chevron ne casse pas la mise en page.
    """
    t = str(t).replace('&', '&amp;')
    t = re.sub(r'&amp;(amp|lt|gt|nbsp|laquo|raquo|bull|#\d+);', r'&\1;', t)
    jetons = []

    def garde(m):
        jetons.append(m.group(0))
        return '\x00%d\x00' % (len(jetons) - 1)

    t = re.sub(r'</?(?:b|i|br\s*/?|font[^<>]*)>', garde, t)
    t = t.replace('<', '&lt;').replace('>', '&gt;')
    return re.sub(r'\x00(\d+)\x00', lambda m: jetons[int(m.group(1))], t)


def cel(t, st=CEL):
    return Paragraph(esc(t), st)


def rich(t, st=CEL):
    return Paragraph(t, st)


def enc(titre, lignes, couleur=ROUGE):
    inner = [[Paragraph('<b>%s</b>' % esc(titre), ENC)]] + [[Paragraph(md(l), ENC)] for l in lignes]
    t = Table(inner, colWidths=[168 * mm])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), FOND),
                           ('LINEBEFORE', (0, 0), (0, -1), 2.2, couleur),
                           ('TOPPADDING', (0, 0), (-1, -1), 3),
                           ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
                           ('LEFTPADDING', (0, 0), (-1, -1), 8),
                           ('RIGHTPADDING', (0, 0), (-1, -1), 6)]))
    return t


def tab(entetes, lignes, largeurs):
    data = [[Paragraph('<b>%s</b>' % esc(h), CELB) for h in entetes]]
    for l in lignes:
        data.append([c if isinstance(c, Paragraph) else Paragraph(md(c), CEL)
                     for c in l])
    t = Table(data, colWidths=largeurs, repeatRows=1)
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e8e8e8')),
                           ('GRID', (0, 0), (-1, -1), 0.4, SEP),
                           ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                           ('TOPPADDING', (0, 0), (-1, -1), 2.5),
                           ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
                           ('LEFTPADDING', (0, 0), (-1, -1), 3.5),
                           ('RIGHTPADDING', (0, 0), (-1, -1), 3.5)]))
    return t


def pied(canv, doc):
    canv.saveState()
    canv.setFont('Helvetica', 6.6)
    canv.setFillColor(GRIS)
    canv.drawString(20 * mm, 10 * mm,
                    'Force Tracker - memoire longue de Milo - etude d architecture - '
                    '18/09/2026 - aucune ligne servie modifiee')
    canv.drawRightString(190 * mm, 10 * mm, 'p. %d' % doc.page)
    canv.restoreState()


h = []
A = h.append

A(Paragraph('FORCE TRACKER - MEMOIRE LONGUE DE MILO - ETUDE D ARCHITECTURE - 18-09-2026', H1))
A(Paragraph("Question de Michel : un compte gratuit pendant six mois ne doit pas voir Milo "
            "repartir de zero le jour ou il passe Premium. Cette etude mesure ce que "
            "l'application conserve reellement aujourd'hui, avant toute proposition. "
            "Aucune ligne servie n'a ete modifiee.", PET))
A(Spacer(1, 6))
A(enc("LE FAIT QUI RETOURNE LA QUESTION",
      ["La memoire de Milo n'est <b>pas une accumulation</b>. C'est une <b>chaine de texte "
       "unique</b> que chaque appel <b>REMPLACE</b> : <b>S.coachMemory = data.summary</b>. "
       "Le resumeur recoit la memoire existante plus les <b>%d derniers messages</b>, et rend "
       "<b>2 a 3 phrases</b> (plafond <b>%d jetons</b>)."
       % (F['mem_fenetre'], F['mem_tokens']),
       "<b>Donc six mois de gratuit ne produiraient pas une memoire riche</b> : ils "
       "produiraient les memes deux ou trois phrases, passees par des centaines de "
       "recompressions successives. <b>Chaque passage perd un peu de ce que le precedent "
       "avait garde.</b>",
       "<b>La question n'est donc pas d'abord FREE ou PREMIUM.</b> Meme en Premium, meme "
       "gratuite pour tout le monde, la structure actuelle ne peut pas porter six mois. "
       "C'est un probleme de <b>forme</b> avant d'etre un probleme de <b>politique d'acces</b>."],
      ROUGE))

# ── 1. ETAT ACTUEL ───────────────────────────────────────────────────────────
A(Paragraph('1. Etat actuel - ce qui serait reellement disponible apres 6 mois de gratuit', H2))
A(Paragraph("<b>La bonne nouvelle est plus large que prevu : la couche A existe deja, sans IA, "
            "pour tout le monde, et elle est deja dans le nuage - %d champs y partent.</b> "
            "Ce qui n'y part pas se compte sur une main : les <b>conversations</b>, le plan de "
            "repas du jour, les ratés de Milo et les series de photos." % F['champs_nuage'], P))
A(tab(['donnee', 'ou elle vit', 'plafond', 'dans le nuage ?', 'exploitable pour une memoire ?'],
      [['<b>sessions</b> (exercices, series, charges, volume, duree, heure de debut)',
        'ft4_sessions', '%d' % F['sessions_max'], '<b>oui</b>',
        "<b>oui</b> - chacune porte <b>id</b> ET <b>ts</b>"],
       ['<b>prs</b> (records)', 'ft4_prs', '-', '<b>oui</b>', 'oui - chaque record est date'],
       ['<b>weightLog</b>', 'ft4_weights', '<b>aucun</b>', '<b>oui</b>', 'oui'],
       ['<b>sleepLog</b>', 'ft4_sleep', '<b>aucun</b>', '<b>oui</b>', 'oui'],
       ['<b>dayStateLog</b> (energie, moral, gene du jour)', 'ft4_dayslog',
        '%d (~2 ans)' % F['jours_max'], '<b>oui</b>', 'oui'],
       ['<b>goalLog</b> (changements d objectif)', 'ft4_goallog',
        '<b>%d</b>' % F['goal_max'], '<b>oui</b>',
        "<b>oui</b> - et c'est deja la forme {date, de, vers, source}"],
       ['<b>registre</b> (faits recalcules + observations validees)', 'ft4_registre', '-',
        '<b>oui</b>', 'oui, mais les faits sont <b>recalcules</b>, jamais historises'],
       ['<b>adn</b> (motivation, mode de vie, preferences, experience)', 'ft4_adn', '-',
        '<b>oui</b>', 'oui - mais ecrase, aucune date'],
       ['<b>badges</b>, programmes, bilans corporels, prises de sang', 'divers', '-',
        '<b>oui</b>', 'oui'],
       ['<b>foodLog</b> (journal alimentaire)', 'ft4_foodlog',
        '<b>%d</b>' % F['foodlog_max'], '<b>oui</b>', 'oui'],
       ['<b>programmes</b>, savedFoods, cycle, seances manquees, questionnaire',
        'divers', '-', '<b>oui</b>', 'oui'],
       [cel('le FIL DES CONVERSATIONS', CELB), 'ft4_coach_hist',
        '<b>%d messages</b>' % F['hist_max'], '<b>NON, par decision</b>',
        "<b>c'est precisement la matiere d'une memoire</b>"],
       [cel('les discussions rangees', CELB), 'ft4_coach_convs',
        '<b>%d</b>' % F['convs_max'], '<b>NON, par decision</b>', 'idem']],
      [44 * mm, 26 * mm, 20 * mm, 30 * mm, 48 * mm]))
A(Spacer(1, 4))
A(enc("LE FIL NE QUITTE JAMAIS LE TELEPHONE, ET C'EST UNE DECISION ECRITE",
      ["Le code le dit en toutes lettres : <i>&laquo; Le fil des echanges vit UNIQUEMENT sur le "
       "telephone : il ne part ni chez Google, ni sur le Drive, ni chez Supabase. C'est un CHOIX "
       "de conception - les gens parlent a Milo de leur corps, de leur moral, de leurs "
       "blessures - pas un oubli. &raquo;</i>",
       "<b>Consequence directe pour le rattrapage</b> : un backfill Premium <b>ne peut pas</b> "
       "reconstruire six mois de conversations depuis le nuage. Il ne le peut que depuis "
       "<b>l'appareil qui les porte encore</b>. Un changement de telephone ou un vidage de cache "
       "les a deja effacees - le code le dit aussi.",
       "<b>C'est la contrainte la plus forte de tout le sujet</b>, et elle vient de la "
       "Constitution (P3), pas d'un defaut technique."], ROUGE))

# ── 2. CE QUI MANQUE ─────────────────────────────────────────────────────────
A(PageBreak())
A(Paragraph('2. Ce qui manque - ce qu on ne pourrait PAS reconstruire aujourd hui', H2))
A(tab(['manque', 'mesure', 'consequence pour une memoire longue'],
      [['<b>Aucun journal des changements de profil</b>',
        "discipline, niveau, taille, poids de reference, niveau d'activite, poids cible : "
        "tous <b>ecrases</b> dans setup.js. Seul <b>goal</b> a un journal.",
        "Milo ne pourra jamais dire <i>&laquo; tu as change de discipline en mars &raquo;</i>. "
        "Le fait est perdu au moment ou il change."],
       ['<b>goalLog plafonne a %d</b>' % F['goal_max'],
        "borne volontaire (<i>une memoire, pas une archive</i>, lecon du reservoir plein du 29/07)",
        "Suffisant en pratique : %d changements d'objectif en six mois serait deja beaucoup."
        % F['goal_max']],
       ['<b>Aucun journal d evenements produit</b>',
        "aucun <b>eventLog</b> : pas de trace de &laquo; programme commence &raquo;, "
        "&laquo; decision prise &raquo;, &laquo; conseil suivi &raquo;",
        "<b>C'est le vrai trou.</b> Les faits d'entrainement sont la ; les <b>decisions</b> "
        "ne le sont pas."],
       ['<b>Aucun curseur</b>',
        "<b>memoryProcessedUntil</b> : 0 occurrence dans tout le code",
        "Impossible aujourd'hui de savoir jusqu'ou une memoire a ete construite."],
       ['<b>Aucune pierre tombale</b>',
        "<b>tombstone</b>, <b>deletedAt</b>, <b>isDeleted</b> : 0 occurrence",
        "Une suppression n'est representee nulle part : elle est un <b>trou</b>, pas un fait."],
       ['<b>La memoire elle-meme est une chaine plate</b>',
        "aucune structure : ni date, ni source, ni statut, ni confiance",
        "Impossible de dire &laquo; ce fait est ancien &raquo; ou &laquo; celui-la a ete "
        "remplace &raquo;."]],
      [40 * mm, 60 * mm, 68 * mm]))

# ── 3. ARCHITECTURE ──────────────────────────────────────────────────────────
A(Paragraph('3. Architecture - ce que les mesures suggerent', H2))
A(Paragraph("Le schema propose par Michel (<i>faits deterministes -&gt; backlog -&gt; backfill "
            "-&gt; memoire active -&gt; delta</i>) <b>tient</b>, avec une correction que les "
            "mesures imposent : <b>la couche A n'est pas a construire, elle existe</b>. Ce qui "
            "manque n'est pas la conservation des faits d'entrainement - c'est un "
            "<b>journal des decisions</b>, et un <b>curseur</b>.", P))
A(Spacer(1, 3))
A(tab(['couche', 'existe aujourd hui ?', 'ce qu il faudrait', 'IA ?'],
      [['<b>A - faits deterministes</b>', '<b>OUI, en grande partie</b> : sessions, records, '
        'poids, sommeil, etat du jour, objectifs, registre - et deja dans le nuage',
        "un <b>journal d'evenements</b> pour ce qui est aujourd'hui ecrase (changements de "
        "profil, programme commence, decision prise). <b>Append-only, borne, date, avec "
        "source.</b>", '<b>non</b>'],
       ['<b>B - construction de la memoire</b>',
        '<b>OUI mais inadaptee</b> : une chaine remplacee a chaque appel',
        "une memoire <b>structuree</b> : des entrees {fait, date, source, statut, derniere "
        "confirmation} plutot qu'une chaine. C'est deja la forme de "
        "<b>registre.observations</b> et de <b>goalLog</b> - <b>le patron existe dans le "
        "projet</b>.", '<b>oui</b>'],
       ['<b>C - utilisation dans les reponses</b>',
        "<b>OUI, et elle ne coute AUCUN appel</b> : <b>coachMemory</b> est un <b>champ</b> de "
        "la charge utile de l'action <b>coach</b>",
        "rien de technique. <b>C n'est pas une capacite, c'est un champ</b> - le facturer "
        "separement n'aurait aucun sens.", '<b>non</b>'],
       ['<b>D - rattrapage Premium</b>', '<b>NON</b>',
        "une passe par <b>periodes</b> (mois ou blocs de seances) plutot qu'un seul appel, "
        "avec reprise apres interruption.", '<b>oui</b>'],
       ['<b>E - delta</b>', '<b>NON</b> - mais le precedent existe',
        "un curseur. <b>Les seances portent deja id ET ts</b> : un curseur deterministe est "
        "possible <b>sans rien ajouter aux donnees</b>.", '<b>non</b>']],
      [30 * mm, 46 * mm, 76 * mm, 16 * mm]))
A(Spacer(1, 4))
A(enc("LE CURSEUR A DEJA UN PRECEDENT DANS CE PROJET, ET IL FAUT LE CONNAITRE",
      ["<b>S.registre.updatedAt</b> existe, est ecrit a chaque changement... et n'est "
       "<b>jamais lu</b>. L'audit des donnees mortes du 27/07/2026 l'a trouve et a decide de "
       "<b>le garder et de le NOMMER</b> plutot que de le retirer, parce qu'il a un usage futur "
       "precis : departager deux appareils qui synchronisent le registre.",
       "<b>C'est exactement le curseur dont parle Michel</b>, et la decision de le garder est "
       "deja prise. <b>R3</b> : un comportement peut etre differe, il doit etre nommable.",
       "<b>Et le temps seul ne suffit pas</b> : une seance <b>importee</b> porte une date "
       "ancienne mais arrive aujourd'hui. Un curseur purement chronologique la manquerait. "
       "Le curseur doit donc porter <b>ce qui a ete traite</b> (des identifiants), pas "
       "seulement <b>jusqu'a quand</b>."], BLEU))

# ── 4 et 5. LES FLUX ─────────────────────────────────────────────────────────
A(PageBreak())
A(Paragraph('4. Passage gratuit -&gt; Premium', H2))
A(tab(['etape', 'ce qui se passe', 'cout IA'],
      [['1. avant le passage', "la couche A s'accumule normalement, sans IA, hors ligne compris. "
        "<b>C'est deja le cas aujourd'hui.</b>", '<b>0</b>'],
       ['2. au passage', "on lit ce qui est <b>reellement disponible</b> : les faits (nuage + "
        "local) et, <b>si l'appareil les porte encore</b>, les conversations.", '<b>0</b>'],
       ['3. rattrapage', "construction par <b>periodes</b>, de la plus recente a la plus "
        "ancienne, avec un curseur pose apres chaque periode reussie.",
        '<b>1 appel par periode</b>'],
       ['4. arret propre', "si la personne ferme l'application ou perd le reseau, le curseur "
        "dit ou reprendre. <b>Rien n'est refait.</b>", '0'],
       ['5. ensuite', "mise a jour <b>incrementale</b> : seules les periodes nouvelles sont "
        "traitees.", '1 appel par periode neuve']],
      [26 * mm, 108 * mm, 34 * mm]))
A(Spacer(1, 3))
A(Paragraph("<b>Ce que le rattrapage ne peut PAS faire, et il faut le dire a la personne</b> : "
            "si elle a change de telephone ou vide son cache pendant la periode gratuite, ses "
            "conversations n'existent plus nulle part. Milo pourra reconstruire son "
            "entrainement, pas ce qu'elle lui a dit. <b>Un rattrapage qui fait semblant d'avoir "
            "tout retrouve est pire qu'un rattrapage honnete</b> (Principe 18 : ne jamais faire "
            "semblant de savoir).", P))

A(Paragraph('5. Premium -&gt; gratuit -&gt; Premium', H2))
A(tab(['moment', 'memoire deja construite', 'faits', 'IA'],
      [['<b>Premium -&gt; gratuit</b>', "<b>conservee et gelee</b> - on ne detruit pas ce que "
        "la personne a paye ; elle cesse simplement d'etre enrichie",
        "continuent de s'accumuler, comme pour tout compte gratuit", '<b>aucune</b>'],
       ['<b>pendant le gratuit</b>', "inchangee ; elle peut devenir <b>perimee</b>, et c'est "
        "pourquoi chaque entree doit porter sa date",
        "s'accumulent normalement, hors ligne compris", '<b>aucune</b>'],
       ['<b>retour Premium</b>', "<b>reprise</b>, pas reconstruite",
        "seul le <b>delta</b> depuis le curseur est traite",
        '1 appel par periode neuve']],
      [30 * mm, 66 * mm, 50 * mm, 22 * mm]))
A(Spacer(1, 3))
A(Paragraph("<b>Une seule reconstruction complete se justifierait</b> : si la structure de la "
            "memoire elle-meme change. C'est une decision de version, pas un evenement "
            "d'abonnement.", PET))

# ── 6. SUPPRESSION ───────────────────────────────────────────────────────────
A(PageBreak())
A(Paragraph('6. Suppression et rectification', H2))
A(enc("LE RISQUE DE RESURRECTION EXISTE DEJA AUJOURD'HUI, AVANT TOUT BACKFILL",
      ["Ce n'est pas le rattrapage qui creerait ce risque : <b>il est deja la</b>, et c'est "
       "mesure a trois endroits.",
       "<b>① Les suppressions sont des trous, pas des faits.</b> Tout se fait par "
       "<b>splice</b> ou <b>filter</b> : conversation, pesee, bilan corporel, prise de sang, "
       "observation. <b>Aucune pierre tombale</b> nulle part (0 occurrence de tombstone, "
       "deletedAt, isDeleted).",
       "<b>② La fusion locale est une UNION.</b> <b>_fusionListe</b> ajoute tout ce qui est "
       "sur le disque et n'est pas en memoire. Une entree supprimee dans un onglet peut donc "
       "revenir par le disque.",
       "<b>③ Cote serveur, une liste VIDEE n'ecrase jamais une liste pleine.</b> <b>_pa_</b> "
       "garde l'ancienne valeur si la nouvelle est vide - et il est applique a <b>%d listes</b>, "
       "dont bodyScans, bloodTests et foodLog. <b>Supprimer sa derniere prise de sang ne la "
       "supprime donc pas du nuage.</b>" % F['pa_listes'],
       "<b>Ce n'est pas un defaut de conception : c'est une protection</b> (elle empeche un "
       "client vide d'effacer un compte plein). Mais elle rend la suppression <b>non "
       "propagee</b>, et un futur rattrapage relirait ce que le nuage a garde."], ROUGE))
A(Spacer(1, 4))
A(Paragraph("<b>Ce que cela impose a toute architecture de memoire</b> : une suppression doit "
            "devenir un <b>fait</b> (date + identifiant de ce qui est supprime), sinon elle ne "
            "peut ni voyager, ni etre respectee six mois plus tard. <b>Et ce fait doit etre "
            "consulte AVANT la construction</b>, pas apres.", P))
A(Paragraph("<b>La rectification est un cas different de la suppression</b>, et le projet a "
            "deja le bon patron : <b>goalLog</b> ne remplace pas l'objectif, il ecrit "
            "<b>{date, de, vers, source}</b>. <b>Un fait remplace n'est pas un fait faux</b> - "
            "il est vrai a sa date. C'est ce qui permet a Milo de dire <i>&laquo; tu visais la "
            "perte de poids en janvier &raquo;</i> sans le presenter comme l'objectif "
            "d'aujourd'hui.", P))

# ── 7. COUT ──────────────────────────────────────────────────────────────────
A(Paragraph('7. Cout', H2))
A(Paragraph("<b>Estimation, pas mesure</b> : fabriquee a partir des structures reelles lues "
            "dans le code, sur un profil de 3 seances par semaine pendant 6 mois. Aucun appel "
            "IA reel n'a ete emis pour cette etude.", PET))
A(tab(['donnee sur 6 mois', 'volume estime', 'jetons estimes'],
      [['78 seances completes', '~149 000 caracteres', '~37 000'],
       ['journal alimentaire (6 lignes/jour)', '~216 000 caracteres', '~54 000'],
       ['fil de conversation (%d messages)' % F['hist_max'], '~142 000 caracteres', '~36 000'],
       ['poids, sommeil, etat du jour', '~23 000 caracteres', '~6 000'],
       [cel('TOTAL', CELB), cel('~530 000 caracteres', CELB), cel('~132 000', CELB)]],
      [60 * mm, 50 * mm, 40 * mm]))
A(Spacer(1, 3))
A(Paragraph("<b>Ce que ce chiffre dit</b> : six mois tiennent dans un ordre de grandeur "
            "raisonnable, mais <b>pas dans le resumeur actuel</b> - qui lit %d messages et rend "
            "%d jetons. Un rattrapage en un seul appel n'est pas la question ; la question est "
            "de ne pas <b>payer plusieurs fois la meme periode</b>." % (F['mem_fenetre'],
                                                                       F['mem_tokens']), P))
A(Paragraph("<b>Et le cout du GRATUIT doit tomber a zero</b>, ce qui n'est pas le cas "
            "aujourd'hui : <b>_saveCoachMemory</b> n'a aucun garde et part des que la "
            "conversation atteint 4 messages, pour tout le monde. <b>C'est la seule depense "
            "que la conservation factuelle permettrait de supprimer entierement.</b>", P))

# ── 8. IMPACT PHASE 3 ────────────────────────────────────────────────────────
A(PageBreak())
A(Paragraph('8. Impact sur la phase 3 (registre central)', H2))
A(Paragraph("<b>Le nombre de 20 capacites n'est pas remis en cause</b> : il est acte, et rien "
            "dans ces mesures ne le contredit. La question est de savoir si "
            "<b>milo.memory</b> doit rester UNE capacite.", P))
A(tab(['operation', 'appelle une IA ?', 'politique d acces envisageable', 'capacite distincte ?'],
      [['collecte factuelle', '<b>non</b>', 'gratuite pour tous',
        "<b>non</b> - ce n'est pas une capacite IA, elle n'a rien a faire dans un registre IA"],
       ['construction / mise a jour', '<b>oui</b>', 'a decider',
        "<b>oui</b> - c'est ce que milo.memory designe aujourd'hui"],
       ['<b>rattrapage</b>', '<b>oui</b>', 'a decider',
        "<b>question ouverte</b> : meme action serveur, mais un profil de cout totalement "
        "different (rafale au passage Premium contre un appel diffus). "
        "<b>Une politique distincte est concevable, donc le critere acte s'applique.</b>"],
       ['utilisation dans les reponses', '<b>non</b>', 'suit la politique du chat',
        "<b>non</b> - c'est un <b>champ</b> de la charge utile de l'action coach, pas un appel"]],
      [34 * mm, 22 * mm, 34 * mm, 78 * mm]))
A(Spacer(1, 4))
A(enc("CE QUE LE CRITERE ACTE DIT ICI",
      ["<i>&laquo; Une capacite = un besoin produit distinct pouvant avoir une politique "
       "d'acces distincte &raquo;</i>, et <i>&laquo; route technique != capacite produit "
       "&raquo;</i>.",
       "<b>Applique tel quel</b> : la collecte et l'utilisation <b>ne sont pas</b> des "
       "capacites IA. La construction en est une - elle existe deja. <b>Le rattrapage pourrait "
       "en etre une seconde</b>, parce qu'on peut vouloir l'autoriser sans autoriser la "
       "maintenance continue, ou l'inverse.",
       "<b>Consequence chiffree si le rattrapage devient une capacite</b> : on passerait de "
       "<b>20 a 21</b>. <b>Cette decision appartient a Michel</b> - le dossier la pose, il ne "
       "la prend pas.",
       "<b>Et cela ne change rien a la phase 3 elle-meme</b> : un registre central capable de "
       "porter 20 entrees en porte 21. <b>Ce qui changerait, c'est de devoir le refaire plus "
       "tard</b> si la decision arrive apres."], BLEU))

# ── CONCLUSION ───────────────────────────────────────────────────────────────
A(Paragraph('Conclusion memoire longue', H2))
A(Paragraph('PROUVE', H3))
for t in [
    "La memoire actuelle est une <b>chaine unique remplacee a chaque appel</b> "
    "(S.coachMemory = data.summary), construite a partir des <b>%d derniers messages</b> et "
    "bornee a <b>%d jetons</b>, avec la consigne <i>2-3 phrases max</i>."
    % (F['mem_fenetre'], F['mem_tokens']),
    "<b>La couche factuelle existe deja</b>, sans IA, pour tous les comptes, et elle est "
    "<b>deja synchronisee</b> : <b>%d champs</b> partent au nuage - seances (%d), records, "
    "poids, sommeil, etat du jour (%d), objectifs (%d), journal alimentaire (%d), programmes, "
    "registre, ADN." % (F['champs_nuage'], F['sessions_max'], F['jours_max'], F['goal_max'],
                        F['foodlog_max']),
    "<b>Le fil des conversations ne quitte jamais le telephone</b>, par decision ecrite - "
    "%d messages plus %d discussions rangees, absents de toute sauvegarde."
    % (F['hist_max'], F['convs_max']),
    "<b>Les changements de profil sont ecrases</b> : seul l'objectif a un journal.",
    "<b>Il n'existe ni curseur ni pierre tombale</b> : 0 occurrence de memoryProcessedUntil, "
    "tombstone, deletedAt, isDeleted.",
    "<b>L'utilisation de la memoire ne coute aucun appel</b> : c'est un champ de la charge "
    "utile de l'action coach.",
]:
    A(Paragraph('&bull; ' + t, P))

A(Paragraph('ARCHITECTURE ACTUELLE INSUFFISANTE SUR', H3))
for t in [
    "<b>La forme de la memoire</b> : une chaine plate ne peut porter ni date, ni source, ni "
    "statut - donc ni <i>fait actuel</i>, ni <i>fait remplace</i>.",
    "<b>La recompression</b> : chaque passage perd un peu du precedent. Six mois ne "
    "s'accumulent pas, ils s'erodent.",
    "<b>L'absence de journal des decisions</b> : les faits d'entrainement sont conserves, "
    "<b>ce qui a ete decide ne l'est pas</b>.",
    "<b>L'absence de curseur</b> : impossible de savoir jusqu'ou la memoire a ete construite.",
    "<b>Les suppressions</b> : non representees, non propagees (une liste videe n'ecrase pas "
    "une liste pleine), et une fusion locale qui est une <b>union</b>.",
    "<b>Le cout du gratuit</b> : la memoire part aujourd'hui pour tout le monde, sans garde.",
]:
    A(Paragraph('&bull; ' + t, P))

A(Paragraph('PROPOSITION', H3))
A(Paragraph("<b>faits deterministes (existe deja) + journal des decisions (a creer) -&gt; "
            "curseur -&gt; construction par periodes -&gt; memoire structuree et datee -&gt; "
            "mises a jour delta</b>", P))
A(Paragraph("Avec trois principes que les mesures imposent : <b>un fait remplace se date, il "
            "ne s'efface pas</b> (patron goalLog) ; <b>une suppression devient un fait</b>, "
            "sinon elle ne voyage pas ; <b>le rattrapage dit ce qu'il n'a pas pu retrouver</b> "
            "plutot que de faire semblant.", P))

A(Paragraph('RISQUES', H3))
for t in [
    "<b>Le plus grave</b> : rendre le fil de conversation synchronisable pour permettre le "
    "rattrapage. Ce serait revenir sur une decision de la Constitution (P3), et le code "
    "nomme deja la raison de ne pas le faire.",
    "<b>L'usine a gaz</b> : un journal d'evenements sans borne devient le reservoir plein du "
    "29/07. Toute liste ajoutee doit etre bornee des le premier jour.",
    "<b>Le faux souvenir</b> : une memoire construite a partir de faits sans date ferait dire "
    "a Milo des choses vraies il y a six mois et fausses aujourd'hui.",
    "<b>Le double paiement</b> : sans curseur pose <b>apres</b> chaque periode reussie, une "
    "interruption fait tout recommencer.",
]:
    A(Paragraph('&bull; ' + t, P))

A(Paragraph('DECISIONS MICHEL REQUISES', H3))
for n, t in enumerate([
    "<b>La conservation factuelle est-elle gratuite pour tous ?</b> Elle l'est deja de fait ; "
    "la question est de l'assumer comme une promesse.",
    "<b>Le journal des decisions : que journalise-t-on, et jusqu'ou ?</b> Changements de "
    "profil, programme commence, conseil suivi - chacun a un cout de place, et la borne se "
    "decide avant d'ecrire la premiere ligne.",
    "<b>La construction IA devient-elle Premium ?</b> Aujourd'hui elle part pour tout le monde, "
    "par une decision ecrite dans le code. La changer contredirait cette decision - c'est "
    "exactement le cas ou la regle 15 demande votre arbitrage.",
    "<b>Le rattrapage est-il une capacite distincte</b> dans le registre central (20 -&gt; 21) ?",
    "<b>Que fait-on des conversations qui ne sont que sur le telephone ?</b> Trois options : "
    "ne rien changer et le dire au moment du rattrapage ; proposer a la personne d'exporter "
    "son fil elle-meme ; ou construire une memoire <b>au fil de l'eau</b> pendant le gratuit, "
    "sur l'appareil, sans IA.",
    "<b>Au passage gratuit, la memoire deja construite est-elle gelee ou effacee ?</b>",
], start=1):
    A(Paragraph('<b>D%d.</b> %s' % (n, t), P))

A(Paragraph("FAUT-IL INTEGRER CETTE ARCHITECTURE AVANT DE CODER LA PHASE 3", H3))
A(enc("OUI pour la granularite, NON pour le reste - et la raison est precise",
      ["<b>OUI sur un point, et un seul</b> : savoir si le <b>rattrapage</b> est une capacite "
       "distincte change le contenu du registre central (20 ou 21 entrees). "
       "<b>Poser la question apres l'avoir ecrit obligerait a le refaire.</b>",
       "<b>NON pour tout le reste.</b> Le journal des decisions, le curseur, la memoire "
       "structuree et le rattrapage sont un <b>chantier de donnees</b>, pas un chantier de "
       "politique d'acces. Ils ne changent <b>pas</b> ce que le registre central doit contenir : "
       "une capacite, son action, sa politique, son garde.",
       "<b>Et les attendre bloquerait deux choses qui ne dependent d'aucune decision</b> : la "
       "correction du double comptage, et la separation du pot de 25 usages.",
       "<b>Autrement dit</b> : une seule question a trancher avant la phase 3 (D4), les cinq "
       "autres peuvent se decider pendant ou apres."], VERT))

A(Spacer(1, 8))
A(Paragraph("Etude produite par un script qui recompte ses %d faits depuis le code servi et "
            "refuse de produire si l'un d'eux tombe. Aucune ligne servie modifiee, aucun appel "
            "reseau, aucun appel IA depense, aucune decision prise." % NB, PET))

doc = SimpleDocTemplate(SORTIE, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm,
                        topMargin=16 * mm, bottomMargin=16 * mm,
                        title='Force Tracker - memoire longue de Milo - etude d architecture',
                        author='Force Tracker')
doc.build(h, onFirstPage=pied, onLaterPages=pied)

# ⛔⛔ LE GARDE QUI MANQUAIT, ET IL EST NE D UN DEFAUT LIVRE : on RELIT le PDF qu on vient
#    d ecrire. Un generateur qui ne regarde jamais sa propre sortie ne peut pas voir qu il
#    a publie « < b > » en toutes lettres — c est arrive, 66 fois, dans un dossier deja remis.
#    *Verifier apres generation n est pas une formalite : c est la seule etape qui voit le
#    RESULTAT et non l INTENTION* (regle d or #14).
def _relire(chemin):
    import base64 as _b64, zlib as _z
    brut = open(chemin, 'rb').read()
    flux = []
    for _m in re.finditer(rb'stream\r?\n', brut):
        _d = brut.find(b'endstream', _m.end())
        if _d < 0:
            continue
        _s = brut[_m.end():_d].strip()
        for _essai in (lambda b: _z.decompress(_b64.a85decode(b, adobe=True)),
                       lambda b: _z.decompress(b)):
            try:
                flux.append(_essai(_s))
                break
            except Exception:
                continue
    _t = b'\n'.join(flux).decode('latin-1')
    _mots = re.findall(r'\((?:[^()\\]|\\.)*\)', _t)
    return ' '.join(re.sub(r'\\(.)', r'\1',
                           re.sub(r'\\([0-7]{3})', lambda m: chr(int(m.group(1), 8)), x[1:-1]))
                    for x in _mots)


_PAGE = _relire(SORTIE)
_BALISES = sum(_PAGE.count(x) for x in ('< b >', '< /b >', '< i >', '< font ', '&lt;b&gt;'))
if _BALISES:
    os.remove(SORTIE)
    sys.exit('REFUS — le PDF produit porte %d balise(s) en clair : le fichier est supprime, '
             'un dossier illisible ne doit pas exister.' % _BALISES)
if len(_PAGE) < 12000:
    os.remove(SORTIE)
    sys.exit('REFUS — le PDF produit ne contient que %d caracteres lisibles : il est muet.'
             % len(_PAGE))
print('   relu : %d caracteres, 0 balise en clair' % len(_PAGE))

print('OK %s (%d gardes, %d octets)' % (SORTIE, NB, os.path.getsize(SORTIE)))
