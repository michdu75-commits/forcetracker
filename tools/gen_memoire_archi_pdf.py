#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""MEMOIRE LONGUE MILO — ARCHITECTURE DE REFERENCE AVANT PHASE 3 (18/09/2026).

⛔⛔ LES GARDES RECOMPTENT CHAQUE FAIT DEPUIS LE CODE SERVI ET REFUSENT DE PRODUIRE SI L UN
    D EUX TOMBE — et le generateur RELIT sa propre sortie (lecon du 18/09 : un dossier livre
    portait 66 balises en clair, parce que je verifiais les MOTS et jamais la LISIBILITE).

⚠️ AUCUNE LIGNE SERVIE N EST MODIFIEE. Ce dossier fige une architecture ; il ne la construit
   pas. Les 14 decisions de Michel y sont des CONTRAINTES, jamais des questions (regle 15).

⚠️ POLICE : reportlab en WinAnsi/cp1252 — AUCUN emoji.
"""
import os
import re
import sys

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (BaseDocTemplate, Frame, KeepTogether, NextPageTemplate,
                                PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle)

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SORTIE = os.environ.get('ARCHI_PDF',
                        '/tmp/FORCE-TRACKER-MEMOIRE-LONGUE-ARCHITECTURE-18-09-2026.pdf')
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
NUS = {f: t.replace(' ', '') for f, t in NU.items()}
F = {}

# ══ LE MODELE EXISTE DEJA : registre.observations porte les 7 champs ═════════
_OBS = re.search(r"S\.registre\.observations\.push\(\{(.{0,400}?)\}\);", NU['coach.js'], re.S)
g(_OBS is not None, "l ecriture d une observation est introuvable : tout le dossier part de la")
_T = _OBS.group(1) if _OBS else ''
for champ in ('id:', 'key:', 'fact:', 'status:', 'source:', 'proposedAt:', 'validatedAt:'):
    g(champ in _T.replace(' ', ''),
      "une observation ne porte plus le champ %s : le dossier dit que le modele minimal "
      "existe DEJA dans registre.observations" % champ.rstrip(':'))
g("source:'conversation'" in _T.replace(' ', ''),
  "une observation ne declare plus sa provenance : la colonne SOURCE du modele tombe")

# ══ LES TROIS STATUTS D OBSERVATION ═════════════════════════════════════════
# ⛔ AUX SITES, PAS A LA PRESENCE. Premier jet : « 'pending' apparait-il dans le fichier ? » —
#    il y apparait 24 fois, donc le garde restait VERT alors qu on retirait le statut des deux
#    endroits qui le POSENT et le LISENT. Sixieme fois que je paie ce piege dans cette session.
g("status:ok?'validated':'rejected'" in NUS['coach.js'],
  "l ECRITURE d une observation ne pose plus validated/rejected : le dossier s appuie sur ces "
  "statuts pour distinguer ce que la personne dit de ce que Milo interprete")
g("status:'pending'" in NUS['tracking.js'],
  "aucune observation n est plus posee en « pending » : l etat qui empeche une interpretation "
  "de Milo de devenir un fait a disparu")
g("x&&x.status==='pending'" in NUS['tracking.js'],
  "plus personne ne LIT le statut « pending » : un etat qu on pose sans jamais le relire ne "
  "protege rien")

# ══ LES BLESSURES PORTENT DEJA zone + statut + date ══════════════════════════
g("push({zone,status,since:today()})" in NUS['setup.js'],
  "une blessure ne porte plus {zone, status, since} : le dossier dit que le patron "
  "« fait actuel / fait historique » existe DEJA")
# ⚠️ SUR LA SOURCE NON COMPACTEE : un motif qui contient un espace ne peut pas etre
#    cherche dans un texte dont on vient de retirer les espaces. Cinquieme fois que
#    je m y prends les pieds dans cette session — *le nettoyage s applique aux DEUX
#    cotes, ou a aucun*.
_HIS = re.search(r'const _HIS=\[(.*?)\];', NU['setup.js'], re.S)
g(_HIS is not None, "_HIS (les statuts de blessure) est introuvable")
F['statuts_blessure'] = re.findall(r"id:'(\w+)'", _HIS.group(1) if _HIS else '')
g(F['statuts_blessure'] == ['active', 'recente', 'ancienne'],
  "les statuts de blessure ont change (%s ; dossier : active, recente, ancienne)"
  % F['statuts_blessure'])
g('hp.injuries.splice(i,1)' in NUS['setup.js'],
  "une blessure ne se supprime plus par INDICE : le dossier dit qu elle n a pas d identifiant")
g(not re.search(r'injuries.*?\bid\s*:', NUS['setup.js'][:200000]) or
  'push({zone,status,since' in NUS['setup.js'],
  "une blessure porte desormais un identifiant : le manque decrit par le dossier est comble")

# ══ LE PATRON goalLog ═══════════════════════════════════════════════════════
_GS = corps(NU['state.js'], '_goalSet')
g("S.goalLog.push({ date: today(), de: avant, vers: g" in _GS,
  "goalLog ne journalise plus {date, de, vers} : le 2e patron du dossier tombe")
F['goal_max'] = int(re.search(r'_GOAL_LOG_MAX = (\d+)', NU['state.js']).group(1))
g(F['goal_max'] == 20, "goalLog n est plus borne a 20 mais a %d" % F['goal_max'])

# ══ LE CURSEUR : id = ENTREE dans l app, ts = MOMENT du fait ════════════════
g('constsess={id:Date.now(),' in NUS['log.js'],
  "une seance vivante ne porte plus id:Date.now() : le curseur propose par le dossier repose "
  "dessus")
g('id:now+si,' in NUS['log.js'] and 'ts:dateTs+si,' in NUS['log.js'],
  "une seance IMPORTEE ne porte plus id=moment de l import et ts=date du fait : c est la "
  "mesure qui fait choisir le curseur sur id plutot que sur ts")
g('constnow=Date.now();' in NUS['log.js'],
  "l import ne date plus son identifiant a l instant de l import : un identifiant ancien "
  "passerait SOUS la borne du curseur et ne serait jamais traite")
g(sum(NUS[f].count('memoryProcessedUntil') for f in FICH) == 0,
  "un curseur de memoire existe deja : le dossier dit qu il n y en a aucun")

# ══ LES SUPPRESSIONS : aucun fait, une union, un serveur qui garde ══════════
for mot in ('tombstone', 'deletedAt', 'isDeleted'):
    n = sum(NU[f].count(mot) for f in FICH)
    g(n == 0, "« %s » est apparu (%d fois) : le dossier dit qu il n existe AUCUNE pierre "
              "tombale" % (mot, n))
g('S.registre.observations=S.registre.observations.filter(o=>o&&o.id!==id)' in NUS['tracking.js'],
  "la suppression d une observation a change de forme : le dossier la decrit comme un FILTRE "
  "qui laisse un trou")
_FL = corps(NU['state.js'], '_fusionListe')
g('vus.has(k)' in _FL and 'out.push(e)' in _FL,
  "_fusionListe n est plus une UNION : le risque de resurrection decrit change")
# ⛔⛔ CE GARDE MESURAIT UN COMMENTAIRE, ET C EST EXACTEMENT CE QUE JE REPROCHE AUX AUTRES.
#    Premier jet : « le mot registre apparait-il dans le paragraphe NON COUVERTES ? » — une
#    mutation qui REECRIT la phrase en « registre desormais couvert » le laissait vert.
#    *Le fait n est pas ce que la doc dit, c est ce que load() appelle.*
_FUSIONS = set(re.findall(r'S\.(\w+)\s*=\s*_fusionListe\(', NU['state.js']))
F['fusions'] = sorted(_FUSIONS)
g('registre' not in _FUSIONS,
  "registre entre desormais dans la fusion multi-onglets : le cas « deux telephones » du "
  "dossier change")
g(len(_FUSIONS) == 5,
  "la fusion multi-onglets ne couvre plus 5 listes mais %d (%s)"
  % (len(_FUSIONS), F['fusions']))
_PA = re.search(r'function _pa_\(b, e\)\{[^\n]*\}', NU['Code.js'])
g(_PA is not None and 'bi.length>0||ei.length===0' in _PA.group(0).replace(' ', ''),
  "_pa_ a change : « une liste videe n ecrase jamais une liste pleine » n est plus vrai")

# ══ CE QUI PART AU NUAGE ════════════════════════════════════════════════════
_i = NU['setup.js'].find("action:'saveProfile'")
_CORPS = NU['setup.js'][_i - 400:_i + 9000]
_CHAMPS = sorted(set(re.findall(r'(?m)^\s*([a-zA-Z_]\w*)\s*:\s*\(?S\.', _CORPS)))
F['champs_nuage'] = len(_CHAMPS)
g(F['champs_nuage'] >= 40, "la sauvegarde ne porte plus que %d champs" % F['champs_nuage'])
for c in ('sessions', 'prs', 'weightLog', 'sleepLog', 'dayStateLog', 'goalLog', 'foodLog',
          'programmes', 'healthProfile', 'coachMemory'):
    g(c in _CHAMPS, "%s ne part plus au nuage : la cartographie du dossier change" % c)
for c in ('coachConversations', 'mealPlan'):
    g(c not in _CHAMPS, "%s part desormais au nuage : le dossier le compte comme LOCAL" % c)
g('registre:S.registre' in _CORPS.replace(' ', ''),
  "le registre (donc les observations) ne part plus au nuage : c est ce qui rend le modele "
  "propose survivant a un changement de telephone")

# ══ LA MEMOIRE ACTUELLE : une chaine remplacee ══════════════════════════════
g('S.coachMemory=data.summary' in NUS['coach.js'],
  "la memoire n est plus REMPLACEE par le resume : la decision 3 de Michel vise ce mecanisme")
_SC = corps(NU['worker.js'], 'summarizeCoach')
F['mem_fenetre'] = int(re.search(r'\.slice\(-(\d+)\)', _SC).group(1))
F['mem_tokens'] = int(re.search(r'max_tokens: (\d+)', _SC).group(1))
g((F['mem_fenetre'], F['mem_tokens']) == (16, 250),
  "la fenetre ou le plafond du resumeur ont change (%d, %d)"
  % (F['mem_fenetre'], F['mem_tokens']))

# ══ LES BORNES EXISTANTES ═══════════════════════════════════════════════════
F['hist_max'] = int(re.search(r'_HIST_MAX_MSG = (\d+)', NU['coach.js']).group(1))
F['convs_max'] = int(re.search(r'_CONVS_MAX\s+= (\d+)', NU['coach.js']).group(1))
F['sessions_max'] = int(re.search(r"'ft4_sessions',JSON\.stringify\(\(S\.sessions\|\|\[\]\)\.slice\(0,(\d+)\)", NUS['log.js']).group(1))
F['jours_max'] = int(re.search(r'S\.dayStateLog\.length>(\d+)', NUS['screens.js']).group(1))
F['foodlog_max'] = int(re.search(r'foodLog:\(S\.foodLog\|\|\[\]\)\.slice\(-(\d+)\)', _CORPS.replace(' ', '')).group(1))
g((F['hist_max'], F['convs_max'], F['sessions_max'], F['jours_max'], F['foodlog_max'])
  == (400, 30, 1500, 800, 8000),
  "une borne de retention a change : %s" % str((F['hist_max'], F['convs_max'],
                                                F['sessions_max'], F['jours_max'],
                                                F['foodlog_max'])))

# ══ LE REGISTRE IA : 20 actees, 21 apres la decision de Michel ══════════════
F['actions_ia'] = re.findall(r"'(\w+)'", re.search(
    r'AI_PROXY_ACTIONS=\[(.*?)\]', NU['constants.js'], re.S).group(1))
g(len(F['actions_ia']) == 14, "il n y a plus 14 actions IA mais %d" % len(F['actions_ia']))
g('summarizeCoach' in F['actions_ia'],
  "summarizeCoach n est plus une action IA : milo.memory et milo.memory.backfill "
  "l empruntent toutes les deux")
_SMEM = corps(NU['coach.js'], '_saveCoachMemory')
for garde in ('S.premium', 'coachFree', 'showPremiumWall'):
    g(garde not in _SMEM,
      "_saveCoachMemory porte desormais un garde (%s) : le dossier dit qu elle part pour "
      "tout le monde" % garde)

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
H1 = ParagraphStyle('H1', parent=S['Title'], fontName='Helvetica-Bold', fontSize=15.5,
                    leading=19, textColor=NOIR, spaceAfter=4, alignment=TA_LEFT)
H2 = ParagraphStyle('H2', parent=S['Heading2'], fontName='Helvetica-Bold', fontSize=12.5,
                    leading=15, textColor=BLEU, spaceBefore=12, spaceAfter=5)
H3 = ParagraphStyle('H3', parent=S['Heading3'], fontName='Helvetica-Bold', fontSize=10.5,
                    leading=13, textColor=NOIR, spaceBefore=8, spaceAfter=3)
P = ParagraphStyle('P', parent=S['BodyText'], fontName='Helvetica', fontSize=9,
                   leading=12.3, textColor=NOIR, spaceAfter=4)
PET = ParagraphStyle('PET', parent=P, fontSize=7.6, leading=9.8, textColor=GRIS)
CEL = ParagraphStyle('CEL', parent=P, fontSize=7.3, leading=9.2, spaceAfter=0)
CELB = ParagraphStyle('CELB', parent=CEL, fontName='Helvetica-Bold')
MINI = ParagraphStyle('MINI', parent=CEL, fontSize=6.4, leading=8.0)
ENC = ParagraphStyle('ENC', parent=P, fontSize=8.5, leading=11.3, leftIndent=6,
                     rightIndent=6, spaceBefore=3, spaceAfter=3)


def md(t):
    """Echappe pour reportlab SANS manger le balisage que j ecris moi-meme.

    ⛔ Lecon du 18/09 : `esc()` transformait mes `<b>` en texte, et un dossier livre portait
       66 balises en clair. *Un PDF qui affiche `< b >` ressemble de loin a un PDF reussi.*
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


def enc(titre, lignes, couleur=ROUGE, larg=168 * mm):
    inner = [[Paragraph(md('<b>%s</b>' % titre), ENC)]] + [[Paragraph(md(l), ENC)] for l in lignes]
    t = Table(inner, colWidths=[larg])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), FOND),
                           ('LINEBEFORE', (0, 0), (0, -1), 2.2, couleur),
                           ('TOPPADDING', (0, 0), (-1, -1), 3),
                           ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
                           ('LEFTPADDING', (0, 0), (-1, -1), 8),
                           ('RIGHTPADDING', (0, 0), (-1, -1), 6)]))
    return t


def tab(entetes, lignes, largeurs, police=CEL):
    data = [[Paragraph(md('<b>%s</b>' % h), CELB) for h in entetes]]
    for l in lignes:
        data.append([c if isinstance(c, Paragraph) else Paragraph(md(c), police) for c in l])
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
    canv.drawString(19 * mm, 10 * mm,
                    'Force Tracker - memoire longue Milo - architecture de reference avant '
                    'phase 3 - 18/09/2026 - aucune ligne servie modifiee')
    canv.drawRightString(canv._pagesize[0] - 17 * mm, 10 * mm, 'p. %d' % doc.page)
    canv.restoreState()


h = []
A = h.append

A(Paragraph('FORCE TRACKER - MEMOIRE LONGUE MILO - ARCHITECTURE DE REFERENCE AVANT '
            'PHASE 3 - 18-09-2026', H1))
A(Paragraph("Les 14 decisions de Michel y sont des <b>contraintes</b>, pas des questions "
            "(regle d'or 15). Aucune ligne servie n'est modifiee : ce dossier fige une "
            "architecture, il ne la construit pas.", PET))
A(Spacer(1, 6))
A(enc("LE RESULTAT PRINCIPAL : LE MODELE DEMANDE EXISTE DEJA DANS LE CODE",
      ["Michel decrit une entree de memoire portant <b>id, type, valeur, date, source, statut, "
       "derniereConfirmation</b>. <b>Six de ces sept champs sont deja ecrits</b>, dans "
       "<b>registre.observations</b> :",
       "<font face='Courier'>{ id, key, fact, status, source:'conversation', proposedAt, "
       "validatedAt }</font>",
       "Avec les <b>trois statuts</b> qu'il demande - <b>pending</b>, <b>validated</b>, "
       "<b>rejected</b> - qui sont exactement sa distinction B (dit par la personne) / C "
       "(interprete par Milo, a confirmer).",
       "<b>Et le patron « fait actuel / fait historique » existe DEUX fois</b> : les blessures "
       "portent <b>{zone, status, since}</b> avec les statuts <b>%s</b> ; et <b>goalLog</b> "
       "ecrit <b>{date, de, vers, source}</b> au lieu de remplacer."
       % ', '.join(F['statuts_blessure']),
       "<b>Il ne s'agit donc pas d'inventer un modele, mais d'en GENERALISER un qui tourne "
       "deja</b> - et qui part deja au nuage, puisque <b>registre</b> est dans la sauvegarde. "
       "C'est la reponse la plus directe au « pas d'usine a gaz »."], VERT))

# ── A. CARTOGRAPHIE ──────────────────────────────────────────────────────────
A(NextPageTemplate('paysage'))
A(PageBreak())
A(Paragraph('A. Cartographie de ce qui existe reellement', H2))
A(Paragraph("Une ligne par source utile. <b>« sans IA »</b> = l'information est deja "
            "structuree, la lire ne coute aucun appel (decision 10 de Michel).", PET))
A(Spacer(1, 2))
CARTO = [
 ('sessions', 'ft4_sessions', 'oui', '%d' % F['sessions_max'], 'date + ts', '<b>id</b>',
  'oui (ecran Progres)', '<b>historise</b>', '<b>oui, sans IA</b>',
  "porte <b>id</b> (entree dans l'app) ET <b>ts</b> (moment du fait) - la base du curseur"),
 ('prs (records)', 'ft4_prs', 'oui', '-', 'date', 'nom d exercice', 'indirect',
  'ecrase (le meilleur)', '<b>oui, sans IA</b>', 'un record remplace le precedent'),
 ('weightLog', 'ft4_weights', 'oui', '<b>aucune</b>', 'date', 'date', 'oui',
  '<b>historise</b>', '<b>oui, sans IA</b>', 'la serie EST l historique'),
 ('sleepLog', 'ft4_sleep', 'oui', '<b>aucune</b>', 'date', 'date', 'non',
  '<b>historise</b>', '<b>oui, sans IA</b>', ''),
 ('dayStateLog', 'ft4_dayslog', 'oui', '%d (~2 ans)' % F['jours_max'], 'date', 'date', 'non',
  '<b>historise</b>', '<b>oui, sans IA</b>', 'etat temporaire : energie, moral, gene'),
 ('goalLog', 'ft4_goallog', 'oui', '<b>%d</b>' % F['goal_max'], 'date', '-', 'non',
  '<b>historise</b> {date, de, vers, src}', '<b>oui, sans IA</b>',
  '<b>patron de reference pour « fait remplace »</b>'),
 ('foodLog', 'ft4_foodlog', 'oui', '%d' % F['foodlog_max'], 'ts', '<b>id</b> (ft-v1218)',
  'oui', '<b>historise</b>', '<b>oui, sans IA</b>', ''),
 ('programmes', 'ft4_progs', 'oui', '-', 'date', '-', 'oui', 'ecrase', '<b>oui, sans IA</b>',
  '<b>« programme commence » n est PAS journalise</b>'),
 ('healthProfile.injuries', 'dans healthProfile', 'oui', '-', '<b>since</b>',
  '<b>aucun</b> (supprime par indice)', 'oui', '<b>statut, pas suppression</b>',
  '<b>oui, sans IA</b>',
  '<b>{zone, status, since}</b> - le patron de la decision 6, a un identifiant pres'),
 ('registre.observations', 'ft4_registre', 'oui', '-', '<b>proposedAt / validatedAt</b>',
  '<b>id</b>', 'oui (filtre)', '<b>statut</b> pending/validated/rejected',
  'produite PAR l IA, relue sans IA', '<b>LE MODELE MINIMAL, deja ecrit</b>'),
 ('registre.facts', 'ft4_registre', 'oui', '-', '-', '-', 'non',
  '<b>recalcule a chaque fois</b>', '<b>oui, sans IA</b>',
  'derive : jamais perime, jamais historique'),
 ('adn', 'ft4_adn', 'oui', '-', '<b>aucune</b>', '-', 'indirect', '<b>ecrase</b>',
  '<b>oui, sans IA</b>', 'motivation, mode de vie, preferences, experience'),
 ('bodyScans / bloodTests', 'divers', 'oui', '-', 'date', 'indice', 'oui',
  '<b>historise</b>', '<b>oui, sans IA</b>', ''),
 ('coachMemory', 'ft4_coach_mem', 'oui', '<b>%d jetons</b>' % F['mem_tokens'], '<b>aucune</b>',
  '<b>aucun</b>', 'non', '<b>REMPLACE a chaque appel</b>', 'produite par IA',
  '<b>chaine plate : ni date, ni source, ni statut</b>'),
 ('fil de conversation', 'ft4_coach_hist', '<b>NON</b>', '<b>%d msg</b>' % F['hist_max'],
  'ts par message', '-', 'oui', 'glissant', '<b>non - langage naturel</b>',
  '<b>decision ecrite : ne quitte jamais le telephone</b>'),
 ('discussions rangees', 'ft4_coach_convs', '<b>NON</b>', '<b>%d</b>' % F['convs_max'],
  'ts', 'id', 'oui', 'glissant', '<b>non - langage naturel</b>', 'idem'),
]
A(tab(['source', 'stockage local', 'nuage', 'borne', 'date', 'identifiant', 'suppression',
       'historise / ecrase', 'exploitable sans IA', 'remarque'],
      [[cel if False else c for c in ligne] for ligne in CARTO],
      [30 * mm, 26 * mm, 13 * mm, 22 * mm, 22 * mm, 26 * mm, 20 * mm, 30 * mm, 26 * mm,
       45 * mm], police=MINI))
A(Spacer(1, 3))
A(Paragraph("<b>%d champs au total partent au nuage.</b> Ce qui n'y part pas se compte sur une "
            "main : le fil, les discussions rangees, le plan de repas du jour, les rates de "
            "Milo, les series de photos." % F['champs_nuage'], PET))

A(NextPageTemplate('portrait'))
A(PageBreak())

# ── B. LE MODELE ─────────────────────────────────────────────────────────────
A(Paragraph('B. Le modele minimal propose', H2))
A(Paragraph("<b>Une seule structure neuve</b>, generalisee depuis <b>registre.observations</b>, "
            "plus <b>un</b> curseur. Rien d'autre.", P))
A(tab(['champ', 'valeur', 'd ou il vient', 'pourquoi il est indispensable'],
      [['<b>id</b>', 'identifiant stable', '<b>existe</b> (observations)',
        "sans lui, une suppression ne peut pas etre nommee, donc pas propagee"],
       ['<b>type</b>', 'blessure · preference · objectif · historique · observation · '
        'interpretation · etat temporaire', '<b>MANQUE</b>',
        "c'est lui qui porte la politique de conservation (section C) : sans type, une seule "
        "duree pour tout, ce que Michel refuse"],
       ['<b>valeur</b>', 'le fait, en clair', '<b>existe</b> (fact)', ''],
       ['<b>date</b>', 'quand le fait a ete etabli', '<b>existe</b> (proposedAt)',
        "un fait sans date devient une verite eternelle"],
       ['<b>source</b>', "conversation · interface · deduction · import",
        '<b>existe</b> (source)',
        "distingue B (dit par la personne) de C (interprete par Milo) - decision 4"],
       ['<b>statut</b>', 'propose · valide · rejete · <b>remplace</b> · <b>resolu</b> · '
        '<b>supprime</b>', '<b>existe a moitie</b>',
        "les 3 premiers existent ; les 3 derniers portent la decision 6 (changer le statut, "
        "pas supprimer) et la decision 7 (la suppression est un fait)"],
       ['<b>derniereConfirmation</b>', 'date', '<b>existe</b> (validatedAt)',
        "permet de dire « confirme il y a 2 ans » sans le presenter comme actuel"],
       ['<b>remplacePar</b>', "id de l'entree qui lui succede", '<b>MANQUE</b>',
        "c'est le chainage de goalLog rendu general : l'ancien objectif reste vrai a sa date"]],
      [34 * mm, 38 * mm, 32 * mm, 64 * mm]))
A(Spacer(1, 4))
A(enc("LE CURSEUR : SUR id, PAS SUR LA DATE - ET C'EST UNE MESURE",
      ["Michel a raison de dire qu'un horodatage ne suffit pas. <b>Mais la mesure donne une "
       "reponse plus simple que prevu.</b>",
       "Une seance vivante s'ecrit <b>{id: Date.now(), ts: Date.now()}</b>. Une seance "
       "<b>IMPORTEE</b> s'ecrit <b>{id: now + i, ts: dateDuFait + i}</b>, ou <b>now</b> est "
       "l'instant de l'import.",
       "<b>Donc id repond a « quand cet enregistrement est-il ENTRE dans l'application », et ts "
       "a « quand le fait s'est-il produit ».</b> Une seance de 2019 importee aujourd'hui porte "
       "un <b>id d'aujourd'hui</b> : <b>elle passe donc AU-DESSUS d'une borne posee hier, et "
       "sera traitee</b>. Le cas que Michel craignait est deja couvert, sans champ nouveau.",
       "<b>Le curseur minimal</b> : par source, <b>la borne haute des id traites</b> + <b>le "
       "nombre d'enregistrements traites</b>. Le compte sert de temoin : s'il y a plus "
       "d'enregistrements sous la borne qu'on n'en a traites, quelque chose est arrive "
       "d'ailleurs (restauration, second telephone) et une relecture bornee se declenche. "
       "<b>Un entier de plus, pas une liste.</b>"], BLEU))

# ── C. CONSERVATION ──────────────────────────────────────────────────────────
A(PageBreak())
A(Paragraph('C. Politique de conservation, par categorie', H2))
A(tab(['categorie', 'duree', 'mecanisme', 'existe aujourd hui ?'],
      [['<b>conversation brute</b>', 'bornee : %d messages, %d discussions'
        % (F['hist_max'], F['convs_max']),
        'glissant, local, jamais synchronise', '<b>OUI, tel quel</b>'],
       ['<b>etat temporaire</b> (fatigue, gene du jour, disponibilite)',
        'court - %d jours d etat du jour (~2 ans) suffisent deja' % F['jours_max'],
        'liste datee bornee', '<b>OUI</b> (dayStateLog)'],
       ['<b>fait deterministe</b> (seance, poids, record, repas)',
        'sa politique metier actuelle - on ne la touche pas',
        'bornes existantes (%d seances, %d lignes de repas)'
        % (F['sessions_max'], F['foodlog_max']), '<b>OUI</b>'],
       ['<b>preference durable</b> (« je n aime pas les flocons »)',
        "jusqu'a modification ou contradiction",
        "entree de memoire, statut <b>valide</b>, remplacee et non effacee", '<b>NON</b>'],
       ['<b>objectif</b>', 'longue - l ancien reste vrai a sa date',
        'goalLog, borne a %d' % F['goal_max'], '<b>OUI</b>'],
       ['<b>blessure / chirurgie / limitation</b>',
        '<b>tres longue - dix ans peuvent rester pertinents</b>',
        "statut <b>active -&gt; recente -&gt; ancienne</b>, jamais supprime",
        '<b>OUI a 90 %</b> - il manque un identifiant et une date de resolution'],
       ['<b>observation validee</b>', 'longue, avec date de derniere confirmation',
        'registre.observations', '<b>OUI</b>'],
       ['<b>interpretation de Milo</b>',
        "courte tant qu'elle n'est pas confirmee ; longue une fois validee",
        "statut <b>propose</b>, jamais promu automatiquement", '<b>OUI</b> (pending)']],
      [40 * mm, 40 * mm, 48 * mm, 40 * mm]))
A(Spacer(1, 4))
A(enc("LE PRINCIPE QUI EVITE L'USINE A GAZ",
      ["<b>Rien n'est conserve « au cas ou ».</b> Une entree de memoire n'existe que si elle a "
       "un <b>type</b>, et c'est le type qui dit combien de temps elle vit. Sans type, pas "
       "d'entree.",
       "<b>Et l'entree ne remplace jamais la source</b> : la seance reste la seance, le poids "
       "reste le poids. La memoire ne recopie pas les faits - <b>elle pointe dessus</b>. "
       "C'est ce qui empeche la copie eternelle de chaque phrase que Michel refuse (section 16)."],
      VERT))

# ── D. COUT ──────────────────────────────────────────────────────────────────
A(Paragraph('D. Cout', H2))
A(tab(['poste', 'statut de la mesure', 'valeur'],
      [['<b>stockage</b>', '<b>ESTIME</b> (structures reelles, 3 seances/semaine, 6 mois)',
        '~530 000 caracteres pour 6 mois, dont ~142 000 pour le seul fil de conversation'],
       ['<b>donnees deterministes</b>', '<b>MESURE</b> - decision 10 de Michel',
        '<b>0 appel IA</b>, par construction : elles sont deja structurees'],
       ['<b>IA de maintenance</b> (milo.memory)', '<b>MESURE</b>',
        "aujourd'hui <b>aucun garde</b> : elle part des 4 messages, <b>pour tout le monde</b>. "
        "C'est la seule depense que la conservation factuelle supprimerait entierement."],
       ['<b>IA de rattrapage</b> (milo.memory.backfill)', '<b>NON MESURE</b>',
        "depend de la taille des periodes, qui n'est pas decidee. <b>Ce qui est mesure</b> : "
        "le resumeur actuel lit %d messages et rend %d jetons - il ne peut pas porter une "
        "periode de six mois." % (F['mem_fenetre'], F['mem_tokens'])],
       ['<b>volume reel chez les utilisateurs</b>', '<b>NON MESURE</b>',
        "les donnees vivent dans leur localStorage ; le conteneur ne joint pas Apps Script"]],
      [42 * mm, 44 * mm, 82 * mm]))

# ── E. REGISTRE ──────────────────────────────────────────────────────────────
A(Paragraph('E. Impact exact sur le registre central : 21 capacites', H2))
A(tab(['capacite', 'action serveur', 'declenchement', 'frequence', 'cout par appel',
       'ce qui la distingue'],
      [['<b>milo.memory</b>', '<b>summarizeCoach</b>', 'automatique, des 4 messages',
        '<b>diffuse</b> - potentiellement a chaque echange',
        'un resume court',
        "entretient une memoire qui existe deja ; son cout suit l'usage du chat"],
       ['<b>milo.memory.backfill</b>', '<b>summarizeCoach</b> (la meme)',
        '<b>un evenement</b> : le passage Premium, ou un retour apres interruption',
        '<b>rafale</b> - N appels d affilee, puis plus rien',
        'plusieurs appels, bornes par le nombre de periodes',
        "<b>construit une memoire qui n existe pas</b>. Frequence, cout, declenchement et "
        "plafond souhaitable sont tous differents - c est exactement le critere acte"]],
      [32 * mm, 26 * mm, 34 * mm, 30 * mm, 24 * mm, 24 * mm]))
A(Spacer(1, 3))
A(Paragraph("<b>Meme action serveur, deux capacites produit</b> : c'est <i>route technique != "
            "capacite produit</i> applique une fois de plus. Le registre en portait deja deux "
            "exemples (l'action <b>coach</b> porte 5 capacites, <b>bodyStudy</b> en porte 2).", P))
A(Paragraph("<b>Ce que cela change concretement pour la phase 3</b> : le registre doit prevoir "
            "<b>21 lignes</b> et non 20. Aucun autre arbitrage FREE/PREMIUM n'est touche.", P))

# ── TEST ADVERSARIAL ─────────────────────────────────────────────────────────
A(PageBreak())
A(Paragraph('Test adversarial - les 15 cas', H2))
CAS = [
 ("1. FREE pendant 3 ans puis Premium",
  "Milo reconstruit a partir des faits, et dit ce qu'il n'a pas.",
  "les faits sont deja conserves et synchronises (%d champs)" % F['champs_nuage'],
  "<b>couvert pour les faits</b> ; le fil de conversation de 3 ans n'existe plus (borne %d "
  "messages) - <b>c'est assume</b>" % F['hist_max']),
 ("2. changement de telephone apres 2 ans",
  "les blessures, objectifs, preferences et observations survivent ; le texte des anciennes "
  "conversations, non.",
  "<b>registre part au nuage</b>, donc les observations aussi",
  "<b>couvert</b> par le modele propose - c'est meme son argument principal"),
 ("3. blessure de 10 ans toujours pertinente",
  "Milo sait « ancienne blessure connue » sans croire « active ».",
  "les statuts <b>%s</b> existent deja, avec <b>since</b>" % ', '.join(F['statuts_blessure']),
  "<b>couvert a 90 %</b> - il manque un <b>identifiant</b> (aujourd'hui supprimee par indice)"),
 ("4. blessure ancienne desormais resolue",
  "le statut change, l'entree reste.",
  "c'est exactement ce que fait <b>_HIS</b>",
  "<b>couvert</b> ; il manque une date de resolution (on a <b>since</b>, pas <b>until</b>)"),
 ("5. Milo extrait mal une information",
  "l'entree naeit en <b>propose</b>, jamais en fait.",
  "le statut <b>pending</b> existe, et la promotion passe par la personne",
  "<b>couvert</b> - et c'est la decision 4 de Michel, deja implementee"),
 ("6. la personne corrige Milo",
  "l'ancienne entree passe en <b>remplace</b>, la neuve la referencee.",
  "le patron existe dans <b>goalLog</b> ({de, vers})",
  "<b>manque</b> : le champ <b>remplacePar</b> sur une entree de memoire"),
 ("7. la personne supprime une information",
  "la suppression devient un <b>fait date</b>, pas un trou.",
  "-",
  "<b>MANQUE ENTIEREMENT</b> : 0 pierre tombale, la suppression est un <b>filter</b>"),
 ("8. la donnee supprimee existe encore dans une ancienne sauvegarde",
  "elle ne revient pas.",
  "-",
  "<b>MANQUE, et le risque est deja la</b> : <b>_pa_</b> fait qu'une liste videe n'ecrase "
  "jamais une liste pleine, et <b>_fusionListe</b> est une <b>union</b>"),
 ("9. Premium -> FREE un an -> Premium",
  "memoire gelee, faits accumules, delta seul au retour.",
  "-",
  "<b>manque le curseur</b> ; tout le reste (accumulation des faits) fonctionne deja"),
 ("10. ancienne seance importee aujourd'hui",
  "elle est traitee, bien que sa date soit ancienne.",
  "<b>l'import pose id = instant de l'import</b>, donc au-dessus de toute borne anterieure",
  "<b>couvert nativement</b> si le curseur porte sur <b>id</b> et non sur <b>ts</b>"),
 ("11. deux telephones modifient le meme compte",
  "aucune entree n'est perdue, aucune n'est traitee deux fois.",
  "<b>_fusionListe</b> couvre 5 listes datees",
  "<b>MANQUE</b> : <b>registre</b> est nommement <b>hors</b> de cette fusion. Deux telephones "
  "divergent aujourd'hui sur les observations - <b>le temoin de comptage du curseur le "
  "detecte, il ne le repare pas</b>"),
 ("12. conversation supprimee, souvenir important conserve",
  "le texte part, l'entree reste.",
  "les deux vivent dans des structures <b>separees</b> : <b>ft4_coach_hist</b> d'un cote, "
  "<b>registre.observations</b> de l'autre",
  "<b>couvert par construction</b> - c'est la separation que Michel demande, elle existe deja"),
 ("13. memoire structuree perdue, faits toujours la",
  "un rattrapage la reconstruit depuis les faits.",
  "les faits sont au nuage",
  "<b>couvert</b>, a condition que le curseur soit remis a zero - donc qu'il soit "
  "<b>effacable</b>, pas seulement incrementable"),
 ("14. interruption au milieu d'un backfill",
  "on reprend ou on s'est arrete.",
  "-",
  "<b>manque le curseur</b> ; sa regle est simple : <b>pose APRES</b> chaque periode reussie, "
  "jamais avant"),
 ("15. reprise sans repayer les periodes traitees",
  "seules les periodes neuves coutent.",
  "-",
  "<b>meme manque</b> - c'est le meme mecanisme que le 14"),
]
A(tab(['cas', 'comportement attendu', 'ce qui le garantit aujourd hui', 'etat / manque'],
      [[c[0], c[1], c[2], c[3]] for c in CAS],
      [32 * mm, 42 * mm, 42 * mm, 52 * mm], police=MINI))
A(Spacer(1, 4))
A(enc("CE QUE LE TEST ADVERSARIAL APPREND",
      ["<b>Sur 15 cas, 7 sont deja couverts</b> par ce qui existe (2, 3, 4, 5, 10, 12, et 1 "
       "pour sa partie factuelle). <b>Le modele propose n'invente donc pas grand-chose : il "
       "comble.</b>",
       "<b>Et les manques se concentrent sur DEUX mecanismes seulement</b> : <b>la suppression "
       "comme fait</b> (cas 7 et 8) et <b>le curseur</b> (cas 9, 13, 14, 15). Plus deux champs : "
       "<b>type</b> et <b>remplacePar</b>.",
       "<b>Le cas 11 est le seul qui reste partiellement ouvert</b> : deux telephones divergent "
       "deja sur le registre, aujourd'hui, avant toute memoire longue. Le temoin de comptage le "
       "<b>detecte</b> ; le reparer est un autre chantier, et il faut le dire plutot que de "
       "laisser croire que la memoire le resout."], BLEU))

# ── RAPPORT FINAL ────────────────────────────────────────────────────────────
A(PageBreak())
A(Paragraph('Rapport final', H2))

A(Paragraph('CE QUI EXISTE DEJA', H3))
for t in [
    "<b>Le modele d'entree de memoire</b> : registre.observations porte <b>id, key, fact, "
    "status, source, proposedAt, validatedAt</b> - six des sept champs demandes.",
    "<b>Les trois statuts</b> pending / validated / rejected, qui portent deja la distinction "
    "entre ce que la personne dit et ce que Milo interprete.",
    "<b>Le patron « fait actuel / fait historique », deux fois</b> : blessures "
    "<b>{zone, status, since}</b> avec <b>%s</b>, et <b>goalLog {date, de, vers, src}</b>."
    % ', '.join(F['statuts_blessure']),
    "<b>La conservation factuelle</b> : <b>%d champs</b> au nuage, sans IA, pour tous - "
    "y compris <b>registre</b>, donc les observations." % F['champs_nuage'],
    "<b>La separation conversation / memoire</b> : le fil est local et borne, les observations "
    "sont structurees et synchronisees. <b>C'est exactement la separation demandee.</b>",
    "<b>De quoi batir le curseur sans champ nouveau</b> : chaque seance porte <b>id</b> "
    "(entree dans l'app) et <b>ts</b> (moment du fait), et un import date son <b>id</b> du jour.",
]:
    A(Paragraph('&bull; ' + t, P))

A(Paragraph('CE QUI MANQUE', H3))
for t in [
    "<b>Le champ type</b> sur une entree de memoire - c'est lui qui porte la politique de "
    "conservation par categorie.",
    "<b>Le champ remplacePar</b> - le chainage de goalLog rendu general.",
    "<b>La suppression comme fait</b> : 0 pierre tombale, et le risque de resurrection existe "
    "<b>deja aujourd'hui</b> (une liste videe n'ecrase pas une liste pleine ; la fusion locale "
    "est une union).",
    "<b>Le curseur</b> : 0 occurrence dans tout le code.",
    "<b>Un identifiant sur une blessure</b> (supprimee par indice aujourd'hui) et une date de "
    "resolution.",
    "<b>Un journal des changements de profil</b> : discipline, niveau, taille sont ecrases.",
]:
    A(Paragraph('&bull; ' + t, P))

A(Paragraph('DECISIONS DESORMAIS ACTEES (rappelees, jamais rouvertes)', H3))
A(tab(['decision', 'consequence architecturale'],
      [['<b>D1</b> - les faits deterministes sont conserves pour tous',
        'aucune ligne a ecrire : <b>c est deja le cas</b>, et sans IA'],
       ['<b>Les conversations brutes ne sont pas une memoire</b>',
        'le fil reste local et borne ; seule la memoire structuree voyage'],
       ['<b>Un resume IA ne devient jamais la source de verite</b>',
        'la chaine plate <b>coachMemory</b> cesse d etre le support ; elle devient au mieux '
        'une vue'],
       ['<b>Trois niveaux A / B / C</b>',
        'portes par <b>source</b> (interface, conversation, deduction) et <b>status</b> '
        '(propose vs valide)'],
       ['<b>Ancien != supprime</b>', "porte par <b>status</b> + <b>type</b>, jamais par une "
        "purge liee a l age"],
       ['<b>Fait actuel et fait historique coexistent</b>',
        'porte par <b>remplacePar</b> - le seul champ vraiment neuf'],
       ['<b>Une suppression importante est un evenement explicite</b>',
        "<b>le plus gros manque</b> : rien n'existe aujourd'hui"],
       ['<b>Le rattrapage est une capacite distincte</b>',
        '<b>le registre central prevoit 21 lignes</b>']],
      [58 * mm, 110 * mm]))

A(Paragraph('RISQUES', H3))
for t in [
    "<b>Le plus grave</b> : elargir la synchronisation au fil de conversation pour faciliter le "
    "rattrapage. Ce serait revenir sur une decision de la Constitution, et le code en nomme "
    "deja la raison.",
    "<b>Le faux souvenir</b> : promouvoir automatiquement une interpretation de Milo en fait. "
    "Le statut <b>pending</b> existe pour l'empecher - il ne doit jamais etre court-circuite.",
    "<b>L'accumulation</b> : une entree sans <b>type</b> n'a pas de duree de vie. "
    "<b>Pas de type, pas d'entree.</b>",
    "<b>Le double paiement</b> : un curseur pose avant la fin d'une periode fait tout "
    "recommencer a la premiere interruption.",
    "<b>La fausse promesse</b> : annoncer un rattrapage complet a quelqu'un dont les "
    "conversations n'existent plus. Le rattrapage doit <b>dire ce qu'il n'a pas retrouve</b>.",
]:
    A(Paragraph('&bull; ' + t, P))

A(Paragraph('IMPACT EXACT SUR LA PHASE 3', H3))
A(enc("TROIS CHOSES, ET RIEN DE PLUS",
      ["<b>1. Le registre central prevoit 21 capacites</b>, avec <b>milo.memory.backfill</b> "
       "distincte de <b>milo.memory</b> : meme action serveur <b>summarizeCoach</b>, mais "
       "declenchement, frequence, cout et plafond souhaitable differents.",
       "<b>2. Le registre doit pouvoir porter une capacite dont le plafond n'est pas un "
       "compteur d'usage mais un nombre d'appels par evenement</b> - le rattrapage se compte "
       "en periodes, pas en usages. C'est une colonne de plus dans le registre, pas une "
       "architecture de plus.",
       "<b>3. Rien d'autre ne change.</b> Les 19 autres capacites gardent leurs arbitrages, "
       "et les deux chantiers sans decision produit (le double comptage, la separation du pot "
       "de %d usages) restent disponibles immediatement." % 25], VERT))

A(Paragraph('CE QUI NECESSITE ENCORE UNE DECISION DE MICHEL', H3))
for n, t in enumerate([
    "<b>La liste des types</b> retenus pour une entree de memoire. La proposition est : "
    "blessure, preference, objectif, historique, observation, interpretation, etat temporaire. "
    "<b>Chaque type ajoute est une duree de vie a decider</b> - c'est le seul endroit ou "
    "l'usine a gaz peut entrer.",
    "<b>La taille d'une periode de rattrapage</b> (un mois ? vingt seances ?). Elle decide du "
    "nombre d'appels, donc du cout. <b>NON MESURE</b> aujourd'hui : elle depend de ce que le "
    "resumeur peut avaler, qui n'est pas encore fixe.",
    "<b>milo.memory devient-elle Premium ?</b> Elle est gratuite <b>par une decision ecrite "
    "dans le code</b>. La question reste ouverte et n'est pas tranchee par cette passe.",
    "<b>Le journal des changements de profil</b> : le fait-on, et sur quels champs ? "
    "Aujourd'hui seul l'objectif est journalise.",
    "<b>La divergence entre deux telephones sur le registre</b> (cas 11) : on la detecte, on "
    "la repare, ou on la laisse ecrite comme limite connue ?",
], start=1):
    A(Paragraph('<b>Q%d.</b> %s' % (n, t), P))

A(Spacer(1, 8))
A(Paragraph("Dossier produit par un script qui recompte ses %d faits depuis le code servi, "
            "refuse de produire si l'un d'eux tombe, et <b>relit sa propre sortie</b>. Aucune "
            "ligne servie modifiee, aucun appel reseau, aucun appel IA depense, aucune decision "
            "prise a la place de Michel." % NB, PET))

doc = BaseDocTemplate(SORTIE, pagesize=A4,
                      title='Force Tracker - memoire longue Milo - architecture de reference',
                      author='Force Tracker')
doc.addPageTemplates([
    PageTemplate(id='portrait',
                 frames=[Frame(20 * mm, 16 * mm, 170 * mm, A4[1] - 32 * mm, id='p')],
                 pagesize=A4, onPage=pied),
    PageTemplate(id='paysage',
                 frames=[Frame(15 * mm, 14 * mm, landscape(A4)[0] - 30 * mm,
                               landscape(A4)[1] - 28 * mm, id='l')],
                 pagesize=landscape(A4), onPage=pied),
])
doc.build(h)


# ⛔⛔ ON RELIT LE PDF QU ON VIENT D ECRIRE (lecon du 18/09 : 66 balises livrees en clair).
def _relire(chemin):
    import base64 as _b64
    import zlib as _z
    brut = open(chemin, 'rb').read()
    flux = []
    for _m in re.finditer(rb'stream\r?\n', brut):
        _d = brut.find(b'endstream', _m.end())
        if _d < 0:
            continue
        _s = brut[_m.end():_d].strip()
        for _e in (lambda b: _z.decompress(_b64.a85decode(b, adobe=True)),
                   lambda b: _z.decompress(b)):
            try:
                flux.append(_e(_s))
                break
            except Exception:
                continue
    _t = b'\n'.join(flux).decode('latin-1')
    _mots = re.findall(r'\((?:[^()\\]|\\.)*\)', _t)
    return ' '.join(re.sub(r'\\(.)', r'\1',
                           re.sub(r'\\([0-7]{3})', lambda m: chr(int(m.group(1), 8)), x[1:-1]))
                    for x in _mots)


_PAGE = _relire(SORTIE)
_BAL = sum(_PAGE.count(x) for x in ('< b >', '< /b >', '< i >', '< font ', '&lt;b&gt;'))
if _BAL:
    os.remove(SORTIE)
    sys.exit('REFUS — le PDF produit porte %d balise(s) en clair : le fichier est supprime.'
             % _BAL)
if len(_PAGE) < 14000:
    os.remove(SORTIE)
    sys.exit('REFUS — le PDF produit ne contient que %d caracteres lisibles : il est muet.'
             % len(_PAGE))
for _att in ('Cartographie', 'modele minimal', 'Politique de conservation', 'Cout',
             'registre central', 'Test adversarial', 'Rapport final',
             'milo.memory.backfill', 'remplacePar', 'pierre tombale'):
    if _att not in _PAGE:
        os.remove(SORTIE)
        sys.exit('REFUS — le PDF produit ne contient pas « %s ».' % _att)
print('   relu : %d caracteres, 0 balise en clair, 10 reperes presents' % len(_PAGE))
print('OK %s (%d gardes, %d octets)' % (SORTIE, NB, os.path.getsize(SORTIE)))
