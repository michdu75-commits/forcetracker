#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""DOSSIER PHASE 2 — POLITIQUE IA FREE / FREEMIUM / PREMIUM (18/09/2026).

⛔⛔ LES GARDES RECOMPTENT CHAQUE CHIFFRE DEPUIS LE CODE SERVI ET REFUSENT DE PRODUIRE
    SI UN FAIT TOMBE. *Un dossier qui publie un chiffre perime fait decider sur du faux.*
    Patron fixe du projet depuis ft-v1196 (consigne de Michel du 13/09).

⚠️ POLICE : reportlab en WinAnsi/cp1252 — AUCUN emoji, aucun caractere hors cp1252.

⚠️ LE NETTOYEUR DE COMMENTAIRES CONNAIT LES CHAINES. Sans ca, `accept="image/*"` dans une
   chaine de setup.js avale 90 lignes de vrai code (defaut mesure en phase 1), et un mot
   cite dans un commentaire se compte comme du code (famille ft-v1193/1203/1205/1210/1216).

⭐ STRUCTURE IMPOSEE PAR MICHEL : resume chiffre · matrice · decisions actees · incoherences
   · decisions requises · quotas · routes · appels automatiques · limites · conclusion.
"""
import json
import os
import re
import sys

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (KeepTogether, NextPageTemplate, PageBreak, Paragraph,
                                BaseDocTemplate, Frame, PageTemplate, Spacer, Table,
                                TableStyle)

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SORTIE = os.environ.get('PH2_PDF',
                        '/tmp/FORCE-TRACKER-PHASE-2-POLITIQUE-IA-18-09-2026.pdf')
sys.path.insert(0, '/tmp')

_ECHECS = []


def g(condition, libelle):
    """Un garde. Il ne previent pas : il EMPECHE de produire."""
    if not condition:
        _ECHECS.append(libelle)


def lire(nom):
    with open(os.path.join(RACINE, nom), encoding='utf-8') as f:
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


def corps_fonction(src, nom):
    """Rend le corps exact d une fonction nommee, accolades equilibrees."""
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


# ══════════════════════════════════════════════════════════════════════════════
#  LES GARDES — chaque fait du dossier est RECOMPTE ici, depuis le code servi
# ══════════════════════════════════════════════════════════════════════════════
SRC = {f: lire(f) for f in ('worker.js', 'Code.js', 'constants.js', 'app.js',
                            'coach.js', 'log.js', 'setup.js', 'tracking.js',
                            'state.js', 'screens.js', 'index.html')}
NU = {f: sans_comm(t) for f, t in SRC.items() if f.endswith('.js')}
F = {}

# ── le serveur : ce qu il connait, et ce qu il ne connait pas ─────────────────
F['worker_moi_premium'] = NU['worker.js'].count('_moi.premium')
g(F['worker_moi_premium'] == 0,
  "worker.js lit desormais _moi.premium (%d fois) : le serveur CONNAIT le premium, "
  "tout le dossier dit le contraire" % F['worker_moi_premium'])

# ⭐ LES DEUX MOITIES DU FAIT, FIGEES SEPAREMENT : le Worker RECOIT le premium (_identiteIA
#    le rend) et ne le LIT jamais. Sans le premier garde, « le serveur connait le statut et
#    ne s en sert pas » ne serait qu une moitie de phrase.
_ID = corps_fonction(NU['worker.js'], '_identiteIA')
g('premium: !!d.premium' in _ID,
  "_identiteIA ne rend plus le premium : le dossier dit que le serveur le CONNAIT")
g("catch (e) { return { ok: false, raison: 'reseau' }; }" in _ID,
  "_identiteIA n est plus FERMEE sur une panne reseau : le dossier dit qu elle l est")
_CI = corps_fonction(NU['worker.js'], '_compterIA')
g('_capDate = _jourParis()' in _CI,
  "_compterIA ne pose plus le plafond local du Worker : la description du plafond d abus change")

_QB = corps_fonction(NU['Code.js'], '_aiQuotaBlock_')
g(_QB != '', "_aiQuotaBlock_ introuvable dans Code.js")
F['quota_premium'] = _QB.lower().count('premium')
g(F['quota_premium'] == 0,
  "_aiQuotaBlock_ mentionne desormais 'premium' (%d fois) : le quota serveur n est plus "
  "aveugle au statut" % F['quota_premium'])
F['q_incr'] = (_QB.count('q.global++'), _QB.count('q.byEmail[e] = ec + 1'))
g(F['q_incr'] == (1, 1),
  "_aiQuotaBlock_ n incremente plus exactement une fois chaque compteur %s" % (F['q_incr'],))
F['quota_global_max'] = int(re.search(r"getProperty\('AI_GLOBAL_MAX'\), 10\) \|\| (\d+)", _QB).group(1))
F['quota_email_max'] = int(re.search(r"getProperty\('AI_EMAIL_MAX'\), 10\)\s+\|\| (\d+)", _QB).group(1))
F['quota_dev_max'] = int(re.search(r'AI_MAX_DEV_ = (\d+)', NU['Code.js']).group(1))
g((F['quota_global_max'], F['quota_email_max'], F['quota_dev_max']) == (600, 50, 150),
  "les plafonds par defaut ont bouge : global=%d, email=%d, dev=%d (dossier : 600 / 50 / 150)"
  % (F['quota_global_max'], F['quota_email_max'], F['quota_dev_max']))
g('return { blocked: false };' in _QB.split('catch')[-1],
  "le repli de _aiQuotaBlock_ n est plus OUVERT : le dossier dit qu une erreur laisse passer")

# ── le double comptage : les DEUX sites, sur le chemin d un seul appel ────────
g('await _identiteIA(body.token, env)' in NU['worker.js'],
  "worker.js n appelle plus _identiteIA sur le chemin des actions IA")
g(bool(re.search(r'_compterIA\(body\.action', NU['worker.js'])),
  "worker.js n appelle plus _compterIA sur le chemin des actions IA")
_AI = corps_fonction(NU['Code.js'], 'handleAuthIdentity_')
g(_AI != '' and '_aiQuotaBlock_(' in _AI,
  "handleAuthIdentity_ n appelle plus _aiQuotaBlock_ : le 1er des deux comptages a disparu, "
  "donc le bug decrit par le dossier est corrige (R30 : on ne publie pas un dossier perime)")
g('_aiQuotaBlock_(body.email)' in NU['Code.js'].split("body.action === 'aiCount'")[-1][:2000],
  "la route aiCount n appelle plus _aiQuotaBlock_ : le 2e comptage a disparu")
F['quota_appels_code'] = len(re.findall(r'_aiQuotaBlock_\(', NU['Code.js']))
g(F['quota_appels_code'] == 4,
  "_aiQuotaBlock_ n est plus appelee 4 fois dans Code.js mais %d" % F['quota_appels_code'])

# ── les deux listes d actions IA ──────────────────────────────────────────────
F['proxy_actions'] = re.findall(r"'(\w+)'", re.search(
    r'AI_PROXY_ACTIONS=\[(.*?)\]', NU['constants.js'], re.S).group(1))
F['worker_actions'] = re.findall(r"'(\w+)'", re.search(
    r'_ACTIONS_IA = new Set\(\[(.*?)\]\)', NU['worker.js'], re.S).group(1))
g(sorted(F['proxy_actions']) == sorted(F['worker_actions']),
  "AI_PROXY_ACTIONS et _ACTIONS_IA ont diverge : client=%d, worker=%d"
  % (len(F['proxy_actions']), len(F['worker_actions'])))
g(len(F['proxy_actions']) == 14,
  "il n y a plus 14 actions IA mais %d — tout le dossier compte 14" % len(F['proxy_actions']))

# ── la 2e porte Apps Script ───────────────────────────────────────────────────
_routees = sorted({a for a in re.findall(r"body\.action\s*===?\s*'(\w+)'", NU['Code.js'])
                   if a in F['proxy_actions']})
F['porte2_routees'] = _routees
F['porte2_fermees'] = sorted(set(F['proxy_actions']) - set(_routees))
g(len(_routees) == 13 and F['porte2_fermees'] == ['seanceJson'],
  "la 2e porte Apps Script a change : %d routees, fermees=%s (dossier : 13 et seanceJson)"
  % (len(_routees), F['porte2_fermees']))
_DP = corps_fonction(NU['Code.js'], 'doPost')
g('_aiQuotaBlock_(body.email)' in _DP,
  "doPost n emploie plus l e-mail DU CORPS pour le quota : l affirmation « aucun jeton exige "
  "sur la 2e porte » n est plus verifiable telle quelle")

# ── les plafonds freemium du client ───────────────────────────────────────────
for nom, fic, motif, attendu in (
        ('COACH_FREE_LIMIT', 'coach.js', r'COACH_FREE_LIMIT = (\d+)', 10),
        ('FOOD_AI_FREE_LIMIT', 'app.js', r'FOOD_AI_FREE_LIMIT=(\d+)', 25),
        ('PROG_FREE_LIMIT', 'log.js', r'PROG_FREE_LIMIT=(\d+)', 2),
        ('HIST_FREE_LIMIT', 'log.js', r'HIST_FREE_LIMIT=(\d+)', 1),
        ('BODYSCAN_FREE_LIMIT', 'tracking.js', r'BODYSCAN_FREE_LIMIT=(\d+)', 2)):
    F[nom] = int(re.search(motif, NU[fic]).group(1))
    g(F[nom] == attendu, "%s vaut %d, le dossier annonce %d" % (nom, F[nom], attendu))

# ── les capacites SANS garde : le coeur des incoherences ──────────────────────
_GARDES = ('S.premium', '_premiumPending', 'showPremiumWall', 'showFoodWall',
           '_isAdminUnlocked', '_isSuperTester', 'foodAiUses', 'coachFree',
           'FOOD_AI_FREE_LIMIT', 'regenCount', '_isSuperTester', 'Unlimited')
for fic, fn in (('log.js', '_runSeDebrief'), ('coach.js', '_saveCoachMemory'),
                ('coach.js', '_cerveletSeance'), ('app.js', 'analyzeMealImport'),
                ('app.js', 'openImportMeal'), ('tracking.js', 'openBodyScanForm'),
                ('coach.js', '_pt001Run')):
    b = corps_fonction(NU[fic], fn)
    g(b != '', "%s introuvable dans %s" % (fn, fic))
    trouves = [x for x in _GARDES if x in b]
    g(not trouves, "%s (%s) porte desormais un garde (%s) : le dossier la classe SANS GARDE"
      % (fn, fic, ', '.join(trouves)))

# ── les capacites AVEC garde, la ou le dossier le dit ─────────────────────────
for fic, fn, garde in (('coach.js', 'sendToCoach', 'S.premium'),
                       ('log.js', 'analyzeImportPhotos', 'S.premium'),
                       ('log.js', 'analyzeHistPhotos', 'S.premium'),
                       ('log.js', 'analyzeProgIa', 'S.premium'),
                       ('setup.js', 'openMorphoAnalysis', 'S.premium'),
                       ('setup.js', 'openBodyStudy', 'S.premium'),
                       ('setup.js', 'openBodySeries', '_isSuperTester'),
                       ('setup.js', '_bserStartCapture', '_BSER_MONTHLY_LIMIT'),
                       ('tracking.js', 'onBodyScanPhoto', 'Unlimited'),
                       ('coach.js', 'startEvalBench', '_isAdminUnlocked'),
                       ('coach.js', 'startPt001Test', '_isAdminUnlocked')):
    b = corps_fonction(NU[fic], fn)
    g(b != '', "%s introuvable dans %s" % (fn, fic))
    g(garde in b, "%s (%s) ne porte plus son garde %s : le dossier le decrit comme ferme"
      % (fn, fic, garde))

# ── generateMealPlan : le scope choisi par le CLIENT ──────────────────────────
_GM = corps_fonction(NU['app.js'], 'generateMealPlan')
g("scope:isPrem?'week':'day'" in _GM.replace(' ', ''),
  "generateMealPlan ne choisit plus le scope cote client : l incoherence I4 a change")
g(_GM.count('S.premium') == 1,
  "generateMealPlan porte desormais %d gardes S.premium (dossier : 1, et il ne sert qu au scope)"
  % _GM.count('S.premium'))
# ⛔ LE GARDE VISE LE SITE, PAS LE MOT. Premier jet : `'regenCount:0' in _GM` — il restait
# VERT sous mutation, parce que `regenCount:0` apparait TROIS fois dans app.js, dont une
# dans la branche isRegen de la meme fonction. *Un garde qui cherche une PRESENCE ne mesure
# pas L ENDROIT* — famille des temoins de forme (ft-v1207, 1212, 1216, 1219).
g(bool(re.search(r"S\.mealPlan=\{days:data\.plan\.days\|\|\[\],generatedAt:td,"
                r"regenDate:null,regenCount:0\}", _GM.replace(' ', ''))),
  "la generation complete ne remet plus regenCount a 0 au meme endroit : la remarque sur le "
  "plafond qui se leve par la capacite voisine n est plus exacte")

# ── le chip qui rend un message gratuit ───────────────────────────────────────
F['premium_client_emails'] = len(re.findall(
    r"'[^']+'", re.search(r'PREMIUM_CLIENT_EMAILS=\[(.*?)\]', NU['constants.js'], re.S).group(1)))
F['super_tester_emails'] = len(re.findall(
    r"'[^']+'", re.search(r'SUPER_TESTER_EMAILS=\[(.*?)\]', NU['constants.js'], re.S).group(1)))
g(F['premium_client_emails'] == 5 and F['super_tester_emails'] == 3,
  "les listes d e-mails du client ont change (%d premium, %d super-testeurs ; dossier : 5 et 3)"
  % (F['premium_client_emails'], F['super_tester_emails']))
g('if(typeof_isClientPremium===' in NU['state.js'].replace(' ', '') and
  "S.premium=localStorage.getItem('ft4_premium')==='1';" in NU['state.js'],
  "S.premium n a plus ses DEUX sources client (localStorage + liste d e-mails) : le dossier "
  "le dit")
_SUP = re.findall(r"'([^']+)'", re.search(
    r'SUPER_TESTER_EMAILS=\[(.*?)\]', NU['constants.js'], re.S).group(1))
_PRE = re.findall(r"'([^']+)'", re.search(
    r'PREMIUM_CLIENT_EMAILS=\[(.*?)\]', NU['constants.js'], re.S).group(1))
g(set(_SUP) <= set(_PRE),
  "les super-testeurs ne sont plus un sous-ensemble des premium client : le second chemin vers "
  "l action bodyStudy cesse d etre inoffensif, et le dossier dit qu il l est")

_RD_AVANT = corps_fonction(NU['log.js'], '_runSeDebrief')
# ⚠️ SANS `.replace(' ','')` ICI : je m y suis pris les pieds TROIS fois dans cette passe —
#    un motif qui contient des espaces ne peut pas etre cherche dans un texte dont on vient de
#    retirer les espaces. *Le nettoyage doit s appliquer aux DEUX cotes, ou a aucun.*
g('for(let a=1;a<=2;a++)' in _RD_AVANT,
  "_runSeDebrief n a plus sa boucle de reessai : l affirmation « jusqu a 2 appels payants pour "
  "une seule fin de seance » ne tient plus")
# ⭐ LES FAITS APPORTES PAR LA PASSE ADVERSARIALE, FIGES A LEUR TOUR. Sans ces gardes, une
#    correction future rendrait le dossier faux en silence — et ce sont precisement les
#    points ou mes premieres affirmations etaient TROP FORTES.
# ⛔ LE GARDE VISE L AFFECTATION, PAS LE MOT. Premier jet : « _dbfPrendreCible in _RD » —
#    reste VERT si l on casse le test tout en laissant le nom plus loin dans la meme ligne.
g("const_pid=(typeof_dbfPrendreCible==='function')?_dbfPrendreCible(" in
  _RD_AVANT.replace(' ', ''),
  "_runSeDebrief ne prend plus de jeton de seance au meme endroit : la correction « ce n est "
  "pas illimite, c est plafonne a 1 par seance » ne tient plus")
g('_maybeAutoDebrief' in NU['screens.js'],
  "la navigation vers l onglet Coach ne declenche plus de debrief automatique : le dossier "
  "compte ce chemin parmi les depenses sans clic")
g("setTimeout(()=>{" in NU['coach.js'] and '_dbfRattraper()' in NU['coach.js'],
  "le rattrapage automatique des debriefs a disparu : le dossier le compte comme un chemin "
  "de depense sans geste")
g(bool(re.search(r'function _pn_\(b, e\)\{ if\(b===undefined\)return e; '
                r'return \(b&&b!==0\)\?b:\(e\|\|b\|\|0\); \}', NU['Code.js'])),
  "_pn_ a change : l affirmation « le serveur ne refuse que la valeur 0, donc un compteur "
  "peut etre ABAISSE » n est plus verifiable telle quelle")
g(NU['setup.js'].count('coachFree') == 0 and NU['Code.js'].count('coachFree') == 0,
  "S.coachFree part desormais au cloud : le dossier dit qu il est le seul compteur a ne "
  "jamais quitter le telephone")
# ⛔ ICI C EST LE NOMBRE QUI PORTE LE FAIT : il y a DEUX boutons qui appellent
#    generateMealPlan() sans argument — celui du plan absent et celui de l en-tete. Un garde
#    de presence resterait vert si l un des deux disparaissait, et c est justement celui de
#    l en-tete qui fait le contournement.
F['boutons_genmp'] = SRC['screens.js'].count('onclick="generateMealPlan()"')
g(F['boutons_genmp'] == 2,
  "il n y a plus deux boutons appelant generateMealPlan() sans argument mais %d : le "
  "contournement visible decrit par le dossier a change" % F['boutons_genmp'])
g('canRegen' in SRC['screens.js'],
  "canRegen a disparu de l ecran Nutrition : l opposition « le bouton de regeneration est "
  "conditionne, celui de l en-tete ne l est pas » n est plus mesurable")

_SM = corps_fonction(NU['coach.js'], '_saveCoachMemory')
g('_memFile' in _SM and '.then(' in _SM,
  "_saveCoachMemory n emploie plus la file de promesses _memFile : la description de la "
  "concurrence (serialisee, non dedoublonnee) n est plus exacte")
g('plus de barri' in corps_fonction(SRC['coach.js'], '_saveCoachMemory'),
  "le commentaire « plus de barriere premium » a disparu de _saveCoachMemory : la preuve que "
  "le garde a ete RETIRE EXPRES ne tient plus")

_SC = corps_fonction(NU['coach.js'], 'sendToCoach')
g('.coach-qr' in _SC and 'opts.noQuota = true' in _SC,
  "la regle « un chip present rend le message gratuit » n est plus dans sendToCoach")

# ── le debrief part bien par un fetch direct, hors sendToCoach ────────────────
_RD = corps_fonction(NU['log.js'], '_runSeDebrief')
g("_aiUrl('coach')" in _RD and 'sendToCoach' not in _RD,
  "_runSeDebrief ne fait plus un fetch direct hors de sendToCoach : l incoherence I1 a change")

# ── deux capacites sur UNE action : la preuve de « route != capacite » ────────
g(NU['setup.js'].count("action:'bodyStudy'") >= 2,
  "l action bodyStudy n est plus employee par deux capacites distinctes : l exemple de "
  "« route technique != capacite produit » tombe")
_PROG = corps_fonction(NU['log.js'], 'analyzeProgIa')
g("_aiUrl('coach')" in _PROG,
  "analyzeProgIa n emploie plus l action coach : le compte des capacites sur l action coach change")

# ── les compteurs freemium et leur stockage ───────────────────────────────────
for cle in ("'ft4_coachFree'", "'ft4_foodai'", "'ft4_progimports'", "'ft4_histImp'",
            "'ft4_bsimports'"):
    g(NU['state.js'].count(cle) == 2,
      "la cle %s n est plus lue ET ecrite exactement une fois dans state.js (%d)"
      % (cle, NU['state.js'].count(cle)))
_RESTORE = NU['setup.js']
for champ in ('histImports', 'bodyScanImports', 'progImports'):
    g('Math.max(S.%s||0' % champ in _RESTORE.replace(' ', ''),
      "la restauration cloud de %s ne prend plus le MAX : le dossier le dit" % champ)

# ── ce que l interface DIT : les promesses de PREMIUM_PERKS ──────────────────
_PP = re.search(r'const PREMIUM_PERKS=\[(.*?)\n\];', SRC['constants.js'], re.S).group(1)
F['perks'] = len(re.findall(r'\{i:', _PP))
for promesse in ('Le récap de chaque séance', 'Milo en illimité',
                 '1 offert en gratuit', '2 offerts en gratuit', '2 offertes',
                 'Contexte complet', 'plan de repas'):
    g(promesse in _PP,
      "PREMIUM_PERKS ne promet plus « %s » : le niveau « ce que l interface DIT » a change"
      % promesse)
g('Gratuit : repas du jour' in SRC['screens.js'],
  "l ecran Nutrition n annonce plus « Gratuit : repas du jour » : l incoherence I4 a change")
g('estimations IA gratuites du journal' in SRC['index.html'],
  "le mur ov-food-wall ne dit plus « estimations IA gratuites du journal »")

# ── le jeu de donnees lui-meme ────────────────────────────────────────────────
import ph2_data as D  # noqa: E402

g(len(D.MATRICE) == 20, "la matrice ne porte plus 20 capacites mais %d" % len(D.MATRICE))
_IDS = [m['id'] for m in D.MATRICE]
g(len(set(_IDS)) == 20, "deux capacites portent le meme identifiant")
_ATTENDUS = sorted(['milo.chat', 'milo.debrief', 'milo.memory', 'milo.sessionToJson',
                    'nutrition.label.ai', 'nutrition.barcode.aiFallback',
                    'nutrition.mealEstimate.ai', 'nutrition.mealPlan.ai',
                    'nutrition.mealPlan.regen', 'nutrition.mealPlanImport.ai',
                    'training.programImport.ai', 'training.historyImport.ai',
                    'training.programAnalysis.ai', 'profile.morphology.ai',
                    'profile.bodyStudy.ai', 'profile.bodySeries.ai',
                    'profile.bodyScanImport.ai', 'health.bloodTest.ai',
                    'admin.bench.milo', 'admin.bench.pt001'])
g(sorted(_IDS) == _ATTENDUS,
  "la LISTE des capacites a change (pas seulement le nombre) : %s"
  % (set(_IDS) ^ set(_ATTENDUS)))
g(sorted({m['action'].split(' ')[0] for m in D.MATRICE}) == sorted(F['proxy_actions']),
  "les actions citees par la matrice ne correspondent plus aux 14 actions du code")

# ── les comptes du resume chiffre, calcules et non ecrits ─────────────────────
def _st(m):
    return m['statut'].split(' ')[0]


F['n_free'] = sum(1 for m in D.MATRICE if _st(m) == 'FREE')
F['n_freemium'] = sum(1 for m in D.MATRICE if _st(m) == 'FREEMIUM')
F['n_premium'] = sum(1 for m in D.MATRICE if _st(m) == 'PREMIUM')
F['n_admin'] = sum(1 for m in D.MATRICE if _st(m) == 'ADMIN')
F['n_interne'] = sum(1 for m in D.MATRICE if _st(m) == 'INTERNE')
F['n_nondecidee'] = sum(1 for m in D.MATRICE if _st(m) == 'NON')
F['n_auto'] = sum(1 for m in D.MATRICE if m['auto'] == 'OUI')
F['n_porte2'] = sum(1 for m in D.MATRICE if m['porte2'].startswith('oui'))
F['n_verrou_serveur'] = sum(1 for m in D.MATRICE if 'aucune verification' not in m['serveur'])
F['n_client_seul'] = sum(1 for m in D.MATRICE
                         if _st(m) in ('FREEMIUM', 'PREMIUM', 'ADMIN', 'INTERNE'))
F['n_incoh'] = sum(1 for m in D.MATRICE if 'INCOH' in m['etat'] or 'ECART' in m['etat'])
g(F['n_free'] + F['n_freemium'] + F['n_premium'] + F['n_admin'] + F['n_interne']
  + F['n_nondecidee'] == 20, "les statuts de la matrice ne totalisent pas 20")
g(F['n_verrou_serveur'] == 0,
  "une capacite declare desormais un verrou serveur : le resultat central du dossier change")
g(F['n_auto'] == 3, "il n y a plus 3 capacites automatiques mais %d" % F['n_auto'])
g(F['n_porte2'] == 19, "il n y a plus 19 capacites a double porte mais %d" % F['n_porte2'])

# ── le contradicteur ──────────────────────────────────────────────────────────
CONTRA = json.load(open('/tmp/ph2_contradicteur.json', encoding='utf-8'))
g(len(CONTRA) == 7, "le contradicteur n a pas rendu 7 verdicts mais %d" % len(CONTRA))
g(all(c.get('final') for c in CONTRA), "un verdict du contradicteur est vide")

# ══════════════════════════════════════════════════════════════════════════════
if _ECHECS:
    print('REFUS DE PRODUIRE — %d garde(s) tombe(s) :' % len(_ECHECS))
    for e in _ECHECS:
        print('  - ' + e)
    sys.exit(1)


def _compte_gardes():
    return len(re.findall(r'(?m)^\s*g\(',
                          sans_comm(open(os.path.abspath(__file__), encoding='utf-8').read())))


NB_GARDES = _compte_gardes()

# ══════════════════════════════════════════════════════════════════════════════
#  LE DOCUMENT
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
CEL = ParagraphStyle('CEL', parent=P, fontSize=7.2, leading=9.0, spaceAfter=0)
CELB = ParagraphStyle('CELB', parent=CEL, fontName='Helvetica-Bold')
MINI = ParagraphStyle('MINI', parent=CEL, fontSize=6.3, leading=7.8, textColor=GRIS)
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


def cel(t, style=CEL):
    return Paragraph(esc(t), style)


def rich(t, style=CEL):
    return Paragraph(t, style)


def encadre(titre, lignes, couleur=ROUGE, largeur=168 * mm):
    inner = [[Paragraph('<b>%s</b>' % esc(titre), ENC)]]
    for l in lignes:
        inner.append([Paragraph(md(l), ENC)])
    t = Table(inner, colWidths=[largeur])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), FOND),
        ('LINEBEFORE', (0, 0), (0, -1), 2.2, couleur),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    return t


def tableau(entetes, lignes, largeurs, teintes=None, police=CEL):
    data = [[Paragraph('<b>%s</b>' % esc(h), CELB) for h in entetes]]
    for l in lignes:
        data.append([c if isinstance(c, Paragraph) else Paragraph(md(c), police)
                     for c in l])
    t = Table(data, colWidths=largeurs, repeatRows=1)
    st = [('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e8e8e8')),
          ('GRID', (0, 0), (-1, -1), 0.4, SEP),
          ('VALIGN', (0, 0), (-1, -1), 'TOP'),
          ('TOPPADDING', (0, 0), (-1, -1), 2.5),
          ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
          ('LEFTPADDING', (0, 0), (-1, -1), 3.5),
          ('RIGHTPADDING', (0, 0), (-1, -1), 3.5)]
    for i, l in enumerate(lignes, start=1):
        if teintes and teintes(l):
            st.append(('BACKGROUND', (0, i), (-1, i), colors.HexColor('#fdeeec')))
    t.setStyle(TableStyle(st))
    return t


def pied(canv, doc):
    canv.saveState()
    canv.setFont('Helvetica', 6.6)
    canv.setFillColor(GRIS)
    canv.drawString(19 * mm, 10 * mm,
                    'Force Tracker - Phase 2 - politique IA FREE / FREEMIUM / PREMIUM - '
                    '18/09/2026 - lecture seule, aucun fichier servi modifie')
    canv.drawRightString(canv._pagesize[0] - 17 * mm, 10 * mm, 'p. %d' % doc.page)
    canv.restoreState()


hist = []
A = hist.append

# ─────────────────────────── EN-TETE ──────────────────────────────────────────
A(Paragraph('FORCE TRACKER - PHASE 2 - POLITIQUE IA FREE / FREEMIUM / PREMIUM - '
            '18-09-2026', H1))
A(Paragraph(
    "Cartographie des 20 capacites IA actees en phase 1, sur trois niveaux tenus separes : "
    "ce que l'interface DIT, ce que le CLIENT autorise, ce que le SERVEUR impose. "
    "Lecture seule : aucun statut modifie, aucun verrou pose, aucun quota corrige, aucune "
    "route fermee, aucune fonctionnalite touchee.", PET))
A(Spacer(1, 6))
A(encadre("CE QUI TIENT TOUT LE DOSSIER, EN UNE PHRASE",
          ["Le serveur ne sait pas ce qu'est une capacite Premium. Mesure : "
           "<b>_moi.premium est lu 0 fois dans worker.js</b>, et le mot <i>premium</i> a "
           "<b>0 occurrence dans _aiQuotaBlock_</b>. Le serveur ne connait que trois choses : "
           "QUI (le jeton), COMBIEN (%d appels/jour par e-mail, %d au total) et D'OU (l'Origin). "
           "<b>Aucune des 20 capacites n'est Premium cote serveur</b> - les 20, sans exception. "
           "Tout ce qui separe un compte gratuit d'un compte Premium vit dans le navigateur."
           % (F['quota_email_max'], F['quota_global_max']),
           "Et il compte des <b>ACTIONS</b> (%d), pas des <b>capacites</b> (20). "
           "L'action <b>coach</b> porte a elle seule 5 capacites, l'action <b>bodyStudy</b> "
           "en porte 2 : c'est &laquo; route technique != capacite produit &raquo; vu depuis "
           "le serveur." % len(F['proxy_actions'])], ROUGE))

# ─────────────────────────── 1. RESUME CHIFFRE ────────────────────────────────
A(Paragraph('1. Resume chiffre', H2))
A(tableau(['mesure', 'valeur', 'ce que ca veut dire'],
          [['capacites analysees', '<b>20</b>', 'la liste actee en phase 1, inchangee'],
           ['FREE actuelles', '<b>%d</b>' % F['n_free'],
            'milo.debrief, milo.memory, nutrition.mealPlan.ai, nutrition.mealPlanImport.ai'],
           ['FREEMIUM', '<b>%d</b>' % F['n_freemium'],
            'X essais gratuits puis mur ou refus - tous comptes dans le navigateur'],
           ['PREMIUM', '<b>%d</b>' % F['n_premium'],
            'programAnalysis, morphology, bodyStudy, bloodTest - fermees cote client seulement'],
           ['ADMIN', '<b>%d</b>' % F['n_admin'], 'les deux bancs d essai'],
           ['INTERNE', '<b>%d</b>' % F['n_interne'],
            'milo.sessionToJson (le cervelet) et profile.bodySeries.ai (super-testeurs)'],
           ['sans decision produit', '<b>%d</b>' % F['n_nondecidee'],
            "aucune capacite n'est sans decision : celles qui divergent ont une decision "
            "et un code qui ne la suit pas"],
           [cel('AVEC VERROU SERVEUR REEL', CELB), '<b>%d</b>' % F['n_verrou_serveur'],
            "<b>zero</b>. Le serveur n'applique aucune politique de statut."],
           ['protegees cote client seulement', '<b>%d</b>' % F['n_client_seul'],
            "toutes celles qui ne sont pas FREE : leur protection est un test JavaScript "
            "dans le navigateur"],
           ['avec seconde porte Apps Script', '<b>%d</b>' % F['n_porte2'],
            "seule milo.sessionToJson (action seanceJson) n'en a pas"],
           ['automatiques', '<b>%d</b>' % F['n_auto'],
            "milo.debrief, milo.memory, milo.sessionToJson - aucun clic requis"],
           ['incoherences prouvees', '<b>%d</b>' % (F['n_incoh'] + 2),
            "ecart mesure entre ce que l'interface dit et ce que le code fait, plus le double comptage et les deux sources de S.premium"]],
          [42 * mm, 18 * mm, 108 * mm]))

# ─────────────────────────── 2. MATRICE ───────────────────────────────────────
A(NextPageTemplate('paysage'))
A(PageBreak())
A(Paragraph('2. Matrice complete des 20 capacites', H2))
A(Paragraph("Une ligne par capacite. Les lignes teintees portent une incoherence ou un ecart "
            "prouve. <b>La colonne SERVEUR est identique pour les 20</b> : aucune "
            "verification de statut - elle est reportee ici pour qu'aucune ligne ne laisse "
            "croire le contraire.", PET))
A(Spacer(1, 2))
lignes = []
for m in D.MATRICE:
    lignes.append([
        rich('<b>%s</b><br/><font size="5.8" color="#6b6b6b">%s - %s</font>'
             % (esc(m['id']), esc(m['module']),
                'AUTO' if m['auto'] == 'OUI' else 'manuel'), CEL),
        cel(m['dit'], MINI),
        rich('<b>%s</b>' % esc(m['client']), MINI),
        cel('aucune verif. de statut', MINI),
        cel(m['gratuits'], MINI),
        cel(m['quota_local'], MINI),
        cel(m['verite'], MINI),
        cel(m['contournement'], MINI),
        cel(m['porte2'], MINI),
        rich('<b>%s</b>' % esc(m['statut']), MINI),
        cel(m['etat'], MINI),
    ])
A(tableau(['capacite', "l'interface DIT", 'le CLIENT fait', 'le SERVEUR impose',
           'usages gratuits', 'quota local', 'source de verite', 'contournement client',
           '2e porte', 'statut', 'etat'],
          lignes,
          [26 * mm, 36 * mm, 26 * mm, 19 * mm, 18 * mm, 21 * mm, 17 * mm, 34 * mm,
           19 * mm, 22 * mm, 22 * mm],
          teintes=lambda l: 'INCOH' in l[10].text or 'ECART' in l[10].text,
          police=MINI))
A(Spacer(1, 3))
A(Paragraph("Champs complementaires, mesures mais non tenables dans le tableau : "
            "<b>action Worker</b> et <b>point(s) d'entree</b> de chaque capacite - ils "
            "figurent en section 7 et dans les fiches ci-dessous. "
            "<b>Quota serveur</b> : le meme pour les 20 (%d/jour/e-mail, %d/jour au total), "
            "aveugle au statut. <b>Reset</b> : aucun compteur freemium n'a de remise a zero "
            "prevue, sauf regenCount (chaque jour, et a chaque plan regenere). "
            "<b>Appel direct Apps Script</b> : possible pour les %d capacites a double porte."
            % (F['quota_email_max'], F['quota_global_max'], F['n_porte2']), PET))

A(NextPageTemplate('portrait'))
A(PageBreak())

# ─────────────────────────── 3. DECISIONS ACTEES ──────────────────────────────
A(Paragraph('3. Decisions deja actees - rappelees, jamais rouvertes', H2))
A(Paragraph("Elles sont des <b>contraintes du projet</b> (regle d'or 15). Aucune ligne de ce "
            "dossier ne les remet en question ; elles servent de reference pour mesurer "
            "l'ecart avec le code.", PET))
A(tableau(['decision', 'portee', 'etat du code'],
          [['<b>20 capacites IA</b> distinctes', 'phase 1, validee ce jour',
            'conforme - la matrice porte exactement ces 20'],
           ['<b>Une capacite = un besoin produit distinct</b> pouvant avoir une politique '
            "d'acces distincte ; <b>route technique != capacite produit</b>",
            'regle d architecture',
            "conforme - et le code le demontre : %d actions portent 20 capacites "
            "(coach en porte 5, bodyStudy 2, generateMealPlan 2)" % len(F['proxy_actions'])],
           ['<b>nutrition.barcode.aiFallback = PREMIUM</b>', 'acte par Michel',
            "<b>ECART</b> - le code le laisse dans le pot freemium de %d usages, partage "
            "avec deux autres capacites" % F['FOOD_AI_FREE_LIMIT']],
           ['<b>Scanner local, zxing-wasm, validation EAN, saisie manuelle, recherche '
            'deterministe = FREE</b>', 'acte par Michel',
            'conforme - aucun de ces chemins ne porte de garde de statut'],
           ['<b>2 imports de programme gratuits</b>, illimite en Premium', 'Michel, 31/07',
            'conforme (PROG_FREE_LIMIT=%d)' % F['PROG_FREE_LIMIT']],
           ['<b>1 import de journal gratuit</b>', 'decision produit',
            'conforme (HIST_FREE_LIMIT=%d)' % F['HIST_FREE_LIMIT']],
           ['<b>2 lectures photo de balance gratuites</b>', 'Michel, 31/07',
            'conforme (BODYSCAN_FREE_LIMIT=%d)' % F['BODYSCAN_FREE_LIMIT']],
           ['<b>Prise de sang : carte visible par tous, analyse IA reservee aux Premium</b>',
            'Michel, 31/07',
            'conforme - _isBloodBeta() rend true, le garde est dans _analyzeBloodRedacted'],
           ['<b>La memoire de Milo est un acquis pour TOUS</b>, gratuit compris',
            'ecrite dans le code',
            "conforme cote code - mais PREMIUM_PERKS la vend comme un avantage Premium"]],
          [50 * mm, 32 * mm, 86 * mm]))

# ─────────────────────────── 4. INCOHERENCES ──────────────────────────────────
A(PageBreak())
A(Paragraph('4. Incoherences techniques prouvees', H2))
A(Paragraph("Uniquement des faits, chacun avec sa fonction et son mecanisme. "
            "<b>Aucune n'est corrigee ici.</b>", PET))

INC = [
    ("I1 - Le recap de seance est vendu Premium et il est gratuit pour tous, sans quota",
     ["PREMIUM_PERKS promet <i>&laquo; Le recap de chaque seance - Milo debriefe tes perfs et "
      "fixe le prochain objectif &raquo;</i>.",
      "<b>_runSeDebrief</b> (log.js) ne porte <b>aucun garde</b> et ne passe pas par "
      "<b>sendToCoach</b> : il appelle <b>fetch(_aiUrl('coach'))</b> en direct. Ni mur, "
      "ni compteur, ni decompte de question gratuite.",
      "Il part <b>automatiquement</b> a chaque fin de seance, donc sur tous les comptes, "
      "y compris ceux qui ont epuise leurs %d questions." % F['COACH_FREE_LIMIT'],
      "<b>Correction apportee par la passe adversariale</b> : dire &laquo; aucun plafond &raquo; "
      "serait trop fort. Il n'y a <b>aucun garde de statut</b>, mais il y a un <b>plafond dur</b> - "
      "un jeton par seance (<b>_dbfPrendreCible</b>, peremption 36 h) qui empeche de payer deux "
      "fois le meme debrief. <b>Mais ce jeton borne le debrief LOGIQUE, pas l'appel PAYANT</b> : "
      "une boucle <b>for(a=1;a&lt;=2)</b> reessaie le fetch sur coupure reseau - y compris une "
      "coupure survenue APRES que le Worker a deja appele le modele, cas ou la seconde tentative "
      "est facturee une seconde fois.",
      "<b>Et deux chemins de depense sans clic ont ete trouves en plus</b> : la simple "
      "<b>navigation vers l'onglet Coach</b> declenche <b>_maybeAutoDebrief</b>, qui appelle "
      "sendToCoach avec <b>noQuota:true</b> - le drapeau qui desactive nommement le garde "
      "free/premium ; et un <b>rattrapage 3 s apres chaque chargement</b> (_dbfRattraper) "
      "re-arme une seance revenue par restauration cloud si elle a moins de 36 h."]),
    ("I2 - La memoire de Milo est vendue Premium et elle est construite pour tous",
     ["PREMIUM_PERKS promet <i>&laquo; Contexte complet - il te connait vraiment &raquo;</i>.",
      "<b>_saveCoachMemory</b> (coach.js) ne porte aucun garde, et il est appele depuis "
      "<b>deux</b> endroits des que l'historique atteint 4 messages.",
      "<b>C'est une decision assumee, pas un oubli</b> : la ligne porte le commentaire "
      "<i>&laquo; construite pour TOUS (memoire = acquis) - plus de barriere premium &raquo;</i>. "
      "<b>Le garde a ete retire expres.</b> L'incoherence n'est donc pas dans le code, elle est "
      "dans le <b>texte de vente</b>."]),
    ("I3 - L'import d'un plan de dieteticien est vendu Premium et n'a aucune porte",
     ["PREMIUM_PERKS promet <i>&laquo; Nutrition IA en illimite - ... plan de repas &raquo;</i>.",
      "Ni l'ouvreur <b>openImportMeal</b> ni le porteur <b>analyzeMealImport</b> (app.js) ne "
      "verifient quoi que ce soit : pas de S.premium, pas de compteur, pas de mur. Le bouton "
      "est rendu sans condition dans l'ecran Nutrition, a deux emplacements."]),
    ("I4 - La generation d'un plan de repas n'a AUCUN plafond, et le perimetre est choisi "
     "par le navigateur",
     ["L'ecran annonce <i>&laquo; Gratuit : repas du jour - 1 regeneration/j &raquo;</i>.",
      "Mesure : la <b>1re generation</b> n'a aucun compteur. Un compte gratuit peut appuyer "
      "sur &laquo; Generer &raquo; autant de fois qu'il veut, <b>un appel IA a chaque fois</b>. "
      "Seule la <b>regeneration d'un repas</b> est limitee a 1/jour.",
      "Et le perimetre part dans la charge utile : <b>scope: isPrem ? 'week' : 'day'</b>. "
      "<b>Le serveur ne le verifie pas</b> - il ne sait meme pas qu'il existe deux perimetres.",
      "Enfin, regenerer le plan entier remet <b>regenCount a 0</b>, puisque le compteur vit "
      "<i>dans</i> S.mealPlan. <b>Le plafond de la regeneration se leve donc en utilisant la "
      "capacite voisine, qui n'a, elle, aucun plafond.</b>"]),
    ("I5 - Un chip affiche rend n'importe quel message gratuit",
     ["<b>sendToCoach</b> (coach.js) : si un element <b>.coach-qr</b> est present dans le DOM, "
      "<b>opts.noQuota</b> passe a true - et le message ne decompte plus de question gratuite.",
      "L'intention est ecrite et elle est juste (<i>repondre a une question posee par Milo ne "
      "doit pas couter</i>). Mais la condition porte sur la <b>presence d'un chip a l'ecran</b>, "
      "pas sur le fait que le message reponde a ce chip : tant que des chips sont affiches, "
      "tout texte tape est gratuit."]),
    ("I6 - Le repli IA du code-barres est ACTE Premium et vit dans le pot gratuit partage",
     ["Decision actee : <b>nutrition.barcode.aiFallback = PREMIUM</b>. Ce n'est pas une "
      "decision ouverte, c'est un <b>ecart a combler</b>.",
      "Etat du code : il partage le pot de <b>%d usages gratuits</b> (FOOD_AI_FREE_LIMIT) "
      "avec l'etiquette photo et le repas decrit. Les trois puisent dans le <b>meme "
      "compteur</b> S.foodAiUses." % F['FOOD_AI_FREE_LIMIT'],
      "Consequence mesurable de ce partage : quelqu'un qui note %d etiquettes n'a plus "
      "<b>aucun</b> repli code-barres, et reciproquement. <b>Un pot unique pour trois besoins "
      "ne permet pas de leur donner trois politiques.</b>" % F['FOOD_AI_FREE_LIMIT']]),
    ("I7 - Trois compteurs jumeaux, trois formes differentes",
     ["<b>progImports</b> et <b>bodyScanImports</b> ne s'incrementent que si le compte n'est "
      "pas Premium. <b>histImports</b> s'incremente <b>toujours</b> (log.js).",
      "Sans consequence visible aujourd'hui (le Premium est illimite dans les trois cas), "
      "mais c'est une divergence de forme entre trois mecanismes qui font le meme metier - "
      "exactement le terrain ou naissent les divergences (R2).",
      "<b>Et leur copie au cloud ne les protege pas</b> : la restauration prend le MAX des deux "
      "valeurs, mais cote serveur <b>_pn_</b> ne refuse que la valeur <b>0</b>. Un client peut "
      "donc <b>abaisser</b> la valeur enregistree a n'importe quel nombre non nul, ce qui vide "
      "ce MAX de son sens. <b>S.coachFree</b>, lui, ne part jamais au cloud : c'est le seul "
      "compteur qui ne quitte pas le telephone."]),
]
for titre, lignes_i in INC:
    A(KeepTogether([encadre(titre, lignes_i, ROUGE), Spacer(1, 4)]))

A(Spacer(1, 2))
A(encadre("I9 - S.premium a DEUX sources cote client, dont une liste d'e-mails dans un "
          "fichier public",
          ["<b>state.js</b> pose <b>S.premium</b> depuis <b>localStorage.ft4_premium</b>, puis "
           "le force a <b>true</b> si l'adresse saisie figure dans <b>PREMIUM_CLIENT_EMAILS</b> "
           "- une liste de <b>%d adresses ecrite en dur dans constants.js</b>, fichier servi "
           "depuis un depot public." % F['premium_client_emails'],
           "C'est une <b>decision assumee</b> (le commentaire dit <i>&laquo; Fondateurs/testeurs "
           "premium a vie : premium accorde cote client, independant du serveur &raquo;</i>), "
           "mais elle a une consequence mesurable : <b>saisir l'une de ces adresses dans "
           "Profil ouvre les 4 capacites Premium</b>, sans console et sans aucune verification.",
           "<b>Second chemin vers l'action bodyStudy</b> : <b>analyzeBodySeries</b> (setup.js) "
           "poste la meme action serveur que la voie Premium, gardee seulement par "
           "<b>_isSuperTester()</b>. <b>Aujourd'hui c'est inoffensif</b> - les %d super-testeurs "
           "sont un sous-ensemble des %d premium client, donc ils sont deja Premium. Mais les "
           "deux listes sont independantes : si elles divergent, le chemin devient un "
           "contournement." % (F['super_tester_emails'], F['premium_client_emails']),
           "<b>Ce n'est pas un defaut de la decision, c'est un fait de conception a connaitre</b> : "
           "une politique d'acces dont une source vit dans un fichier public ne peut pas etre "
           "plus forte que ce fichier."], ROUGE))
A(Spacer(1, 4))
A(encadre("I8 - LE DOUBLE COMPTAGE DU QUOTA : chaque appel IA consomme DEUX unites",
          ["<b>1er comptage</b> - %s" % esc(D.DOUBLE['appel_1']),
           "<b>2e comptage</b> - %s" % esc(D.DOUBLE['appel_2']),
           "<b>_aiQuotaBlock_ n'est pas une lecture : elle ECRIT.</b> Mesure : elle contient "
           "exactement un <b>q.global++</b> et un <b>q.byEmail[e] = ec + 1</b>, puis elle "
           "enregistre. Elle est appelee <b>%d fois</b> dans Code.js, dont <b>deux sur le "
           "chemin d'un seul appel IA venu du Worker</b>." % F['quota_appels_code'],
           "<b>Plafonds reels, donc :</b> %s." % esc(D.DOUBLE['plafond_reel']),
           "<b>Statut : documente, non corrige</b>, conformement a la consigne de cette phase."],
          ROUGE))

# ─────────────────────────── 5. DECISIONS MICHEL ──────────────────────────────
A(PageBreak())
A(Paragraph('5. Decisions Michel requises', H2))
A(Paragraph("Chacune donne le comportement actuel, les choix reellement possibles et la "
            "consequence de chaque choix. <b>Aucune recommandation, ni explicite ni cachee "
            "dans le libelle</b> : le code dit ce qui EST, Michel decide ce qui DOIT ETRE "
            "(regle d'or 15).", PET))

DEC = [
    ('D1', 'milo.debrief',
     "Vendu Premium, gratuit pour tous, sans quota, et il part automatiquement a chaque "
     "fin de seance.",
     [("Poser un garde Premium",
       "les comptes gratuits perdent l'avis de Milo en fin de seance ; le socle chiffre "
       "reste (il ne depend d'aucun reseau). Baisse du nombre d'appels IA automatiques."),
      ("Retirer la promesse de PREMIUM_PERKS",
       "le code ne bouge pas ; l'argumentaire Premium perd un element ; le cout automatique "
       "reste tel quel."),
      ("Le rendre freemium (X debriefs gratuits)",
       "demande un compteur qui n'existe pas aujourd'hui ; c'est la seule option qui exige "
       "du code neuf.")]),
    ('D2', 'milo.memory',
     "Vendue Premium par PREMIUM_PERKS, donnee a tous par une decision ecrite dans le code.",
     [("Reformuler la promesse",
       "le code ne bouge pas ; la decision ecrite (&laquo; la memoire est un acquis &raquo;) "
       "reste tenue."),
      ("Fermer la memoire aux comptes gratuits",
       "contredit une decision deja ecrite dans le code ; au passage Premium, Milo repartirait "
       "de zero - ce que la decision d'origine cherchait precisement a eviter.")]),
    ('D3', 'nutrition.mealPlanImport.ai',
     "Vendu Premium, aucune porte ni sur l'ouvreur ni sur le porteur.",
     [("Poser un garde Premium", "aligne le code sur la promesse ; les comptes gratuits "
       "perdent l'import de plan."),
      ("Le passer en freemium avec un compteur",
       "meme forme que les trois autres imports ; demande un compteur neuf."),
      ("Retirer la promesse", "le code ne bouge pas ; la capacite devient officiellement "
       "gratuite.")]),
    ('D4', 'nutrition.mealPlan.ai',
     "La generation complete n'a aucun plafond ; le perimetre (jour / semaine) est choisi "
     "par le navigateur et le serveur ne le verifie pas.",
     [("Poser un plafond sur la generation complete",
       "borne le cout ; change ce que vivent les comptes gratuits actuels, qui peuvent "
       "generer sans limite aujourd'hui."),
      ("Ne rien changer au nombre, corriger seulement l'annonce",
       "le cout reste ouvert ; l'ecran cesse de laisser croire a une limite."),
      ("Faire decider le perimetre par le serveur",
       "suppose que le serveur connaisse le statut - donc la phase 3.")]),
    ('D5', 'le pot partage de %d usages' % F['FOOD_AI_FREE_LIMIT'],
     "Trois capacites (etiquette, repli code-barres, repas decrit) puisent dans le meme "
     "compteur S.foodAiUses. La decision actee &laquo; barcode.aiFallback = PREMIUM &raquo; "
     "ne peut pas s'appliquer tant que le pot est commun.",
     [("Separer en trois compteurs",
       "prealable technique a toute politique differenciee ; chaque capacite peut alors "
       "recevoir son propre statut."),
      ("Garder un pot commun et en sortir le code-barres",
       "le repli code-barres devient Premium, les deux autres gardent les %d usages."
       % F['FOOD_AI_FREE_LIMIT']),
      ("Garder tel quel", "la decision actee reste non appliquee.")]),
    ('D6', 'le double comptage (I8)',
     "Chaque appel IA consomme deux unites de quota : les plafonds reels sont la moitie "
     "des plafonds annonces.",
     [("Corriger maintenant",
       "double la capacite reelle sans changer aucun reglage ; ne depend d'aucune decision "
       "produit."),
      ("Mesurer l'usage reel d'abord",
       "demande de lire la Script Property ai_quota, ce que le conteneur ne peut pas faire "
       "(NON MESURE) ; le correctif attend."),
      ("Relever les plafonds a la place",
       "meme effet apparent, mais laisse deux ecritures la ou une suffit.")]),
    ('D7', 'la 2e porte Apps Script (%d routes)' % len(F['porte2_routees']),
     "13 des 14 actions IA sont encore routees dans Code.js, sans jeton ni verification de "
     "statut. Le client ne les emprunte qu'en repli, si AI_PROXY_URL etait vide.",
     [("Fermer les 13 routes",
       "supprime la porte sans jeton ; fait perdre le repli si le Worker tombe."),
      ("Les garder et exiger le jeton",
       "conserve le repli et ferme la porte anonyme ; demande du code cote Apps Script."),
      ("Ne rien changer",
       "la porte reste ouverte ; son usage reel est aujourd'hui NON MESURE.")]),
]
for ref, cap, actuel, choix in DEC:
    lignes_d = ["<b>Comportement actuel</b> : %s" % actuel]
    for i, (opt, cons) in enumerate(choix, start=1):
        lignes_d.append("<b>Choix %d - %s</b> : %s" % (i, opt, cons))
    A(KeepTogether([encadre("%s - %s" % (ref, cap), lignes_d, BLEU), Spacer(1, 4)]))

# ─────────────────────────── 6. QUOTAS ────────────────────────────────────────
A(PageBreak())
A(Paragraph('6. Quotas - les compteurs et leur source de verite', H2))
A(tableau(['compteur', 'plafond', 'stockage', 'remise a zero', 'qui peut le changer'],
          [['S.coachFree', '%d questions (total, pas par jour)' % F['COACH_FREE_LIMIT'],
            'localStorage ft4_coachFree', "aucune - c'est un total a vie",
            'le navigateur ; le banc admin le remet a 0'],
           ['S.foodAiUses', '%d usages, <b>pot partage par 3 capacites</b>' % F['FOOD_AI_FREE_LIMIT'],
            'localStorage ft4_foodai', 'aucune', 'le navigateur'],
           ['S.progImports', '%d imports' % F['PROG_FREE_LIMIT'],
            'localStorage ft4_progimports <b>+ cloud</b>', 'aucune',
            'le navigateur ; la restauration cloud prend le <b>max</b> des deux'],
           ['S.histImports', '%d import' % F['HIST_FREE_LIMIT'],
            'localStorage ft4_histImp <b>+ cloud</b>', 'aucune', 'idem'],
           ['S.bodyScanImports', '%d lectures photo' % F['BODYSCAN_FREE_LIMIT'],
            'localStorage ft4_bsimports <b>+ cloud</b>', 'aucune', 'idem'],
           ['S.mealPlan.regenCount', '1 par jour', "dans l'objet S.mealPlan (localStorage)",
            'chaque jour <b>et</b> a chaque plan regenere', 'le navigateur'],
           [cel('ai_quota (serveur)', CELB),
            '<b>%d/jour/e-mail, %d/jour au total</b> ; %d pour le compte de developpement'
            % (F['quota_email_max'], F['quota_global_max'], F['quota_dev_max']),
            'Script Property Apps Script', 'chaque jour (fuseau du projet)',
            '<b>le serveur seul</b> - la seule limite que le navigateur ne peut pas toucher']],
          [26 * mm, 33 * mm, 36 * mm, 31 * mm, 42 * mm]))
A(Spacer(1, 4))
A(encadre("DEUX QUOTAS, ET LES CONFONDRE EST LE PIEGE",
          ["Dire &laquo; le quota est serveur &raquo; est <b>trop fort</b> : il y a deux quotas "
           "qui ne font pas le meme metier.",
           "<b>Le plafond d'ABUS est bien serveur</b>, et il est reel : %d/jour/e-mail, "
           "%d/jour au total. Il est rendu <b>avant</b> l'appel payant, et l'identite est "
           "<b>fermee</b> (401 si le jeton est absent, faux, ou si Apps Script est injoignable). "
           "Son metier est de <b>borner la facture</b>." % (F['quota_email_max'],
                                                            F['quota_global_max']),
           "<b>Le quota PRODUIT - celui qui decide qui doit payer - n'est impose que par le "
           "navigateur.</b> Les %d questions gratuites, les %d usages Nutrition, les imports : "
           "tout vient du localStorage. Le serveur <b>connait</b> le statut premium "
           "(handleAuthIdentity_ le renvoie, le Worker le recoit) et <b>ne s'en sert nulle "
           "part</b>." % (F['COACH_FREE_LIMIT'], F['FOOD_AI_FREE_LIMIT']),
           "<b>Consequence mesurable dans la source</b> : un appareil porteur d'un jeton valide "
           "qui remet son compteur a zero obtient l'action <b>coach</b> jusqu'au plafond "
           "d'abus, sans jamais croiser de controle de statut.",
           "<b>Et le plafond d'abus ne mesure pas le cout</b> : _aiQuotaBlock_ incremente de 1 "
           "qu'il s'agisse d'une question en texte ou d'un <b>bodyStudy multi-images</b>. "
           "Une unite de quota ne vaut donc pas une unite de depense."], ROUGE))
A(Spacer(1, 4))
A(encadre("LE SEUL QUOTA SERVEUR NE DISTINGUE PAS LES CAPACITES, ET SON REPLI EST OUVERT",
          ["Il compte des <b>actions</b> (%d), pas des capacites (20) : trois capacites "
           "Nutrition passent par trois actions differentes mais cinq capacites partagent "
           "l'action <b>coach</b> - le serveur ne peut pas savoir laquelle a ete demandee."
           % len(F['proxy_actions']),
           "Son repli est <b>ouvert</b> : toute erreur dans <b>_aiQuotaBlock_</b> rend "
           "<b>{blocked:false}</b>. C'est un choix ecrit (une erreur de configuration ne doit "
           "jamais couper Milo) - mais il faut le savoir : <b>si les Script Properties sont "
           "pleines, le plafond disparait en silence</b>. C'est la panne du 29/07/2026 "
           "(stockage a 102 %), appliquee cette fois au garde-fou du cout.",
           "<b>Les compteurs freemium synchronises au cloud ne sont jamais verifies</b> : "
           "saveProfile enregistre la valeur que le client envoie."], ROUGE))

# ─────────────────────────── 7. ROUTES ────────────────────────────────────────
A(PageBreak())
A(Paragraph('7. Routes Worker / Apps Script - les deux portes', H2))
A(Paragraph(
    "Les deux listes d'actions IA sont <b>identiques</b> (%d de chaque cote) : "
    "<b>AI_PROXY_ACTIONS</b> cote client, <b>_ACTIONS_IA</b> cote Worker. Aucun appel IA du "
    "client ne part donc vers Apps Script - <b>sauf</b> par le repli de <b>_aiUrl</b>, qui "
    "retombe sur S.url si AI_PROXY_URL etait vide." % len(F['proxy_actions']), P))
A(tableau(['action Worker', 'capacites qui l empruntent', 'route Apps Script', 'classement'],
          [[a,
            ', '.join(m['id'] for m in D.MATRICE if m['action'].split(' ')[0] == a),
            'oui' if a in F['porte2_routees'] else '<b>non</b>',
            'SERVEUR SEULEMENT' if a in F['porte2_routees'] else '<b>FERMEE</b>']
           for a in sorted(F['proxy_actions'])],
          [30 * mm, 74 * mm, 24 * mm, 36 * mm]))
A(Spacer(1, 4))
A(tableau(['classement', 'combien', 'ce que ca veut dire'],
          [['ACTIVE COTE CLIENT', '<b>0</b>',
            "aucune capacite n'emprunte Apps Script en fonctionnement normal"],
           ['SERVEUR SEULEMENT', '<b>%d actions</b>' % len(F['porte2_routees']),
            "encore routees et fonctionnelles dans Code.js, mais le client ne les y envoie "
            "jamais : la porte est <b>ouverte et inutilisee</b>"],
           ['LEGACY PROBABLE', '<b>0</b>',
            "aucune route IA n'est morte : les 13 repondraient si on les appelait"],
           ['FERMEE', '<b>1 action</b> (seanceJson)',
            "la seule action IA absente de Code.js"],
           ['USAGE NON MESURE', '<b>%d actions</b>' % len(F['porte2_routees']),
            "savoir si le repli de _aiUrl a deja servi en production demande les journaux du "
            "Worker, injoignable depuis le conteneur"]],
          [36 * mm, 26 * mm, 102 * mm]))
A(Spacer(1, 4))
A(encadre("CETTE 2e PORTE N'EXIGE NI JETON NI PREMIUM",
          ["<b>doPost</b> (Code.js) traite les %d actions IA en appelant "
           "<b>_aiQuotaBlock_(body.email)</b> - avec <b>l'e-mail du corps de la requete</b>. "
           "Pas de jeton, pas de verification de statut." % len(F['proxy_actions']),
           "Le commentaire du code le dit lui-meme : <i>&laquo; l'URL Apps Script est publique "
           "(elle est dans constants.js, depot public) &raquo;</i>.",
           "<b>Consequence etablie par lecture de la source</b> : la seule borne sur cette "
           "porte est un quota par e-mail, et l'e-mail est choisi par l'appelant. C'est l'ecart "
           "le plus net entre <i>ce que le client fait</i> et <i>ce que le serveur impose</i> - "
           "et il ne concerne aucune capacite en particulier : il les concerne <b>toutes</b>.",
           "<b>Aucun test offensif n'a ete conduit</b> (consigne explicite). Ce paragraphe est "
           "etabli par lecture, pas par une requete."], ROUGE))

# ─────────────────────────── 8. APPELS AUTOMATIQUES ───────────────────────────
A(PageBreak())
A(Paragraph('8. Appels automatiques - ce qui consomme de l IA sans clic', H2))
A(Paragraph("Ces trois capacites ne sont declenchees par <b>aucun bouton</b> : la personne ne "
            "les demande pas et ne peut pas les refuser. <b>Un mur ne peut pas s'afficher "
            "devant une chose que personne n'a demandee.</b>", P))
A(tableau(['capacite', 'quand l appel part', 'combien de fois', 'anti-double appel / retry',
           'quota', 'statut', 'la personne peut-elle l empecher ?'],
          [['milo.debrief',
            "fin de seance (_showSessionEnd) ; <b>navigation vers l'onglet Coach</b> "
            "(_maybeAutoDebrief) ; <b>rattrapage 3 s apres chaque chargement</b> (_dbfRattraper)",
            "<b>jusqu'a 2 APPELS PAYANTS par seance</b> (boucle de reessai sur coupure "
            "reseau), <b>+ 1 par clic sur Reessayer</b>",
            "<b>jeton par seance</b> (_dbfPrendreCible, peremption 36 h) - un vrai plafond dur ; "
            "le jeton se libere sur echec propre",
            '<b>aucun garde de statut</b> ; le chemin de navigation passe noQuota:true', 'FREE',
            "non - et une seance revenue par restauration cloud peut re-armer un appel"],
           ['milo.memory', "des que la conversation atteint 4 messages ; appele depuis "
            "<b>2</b> endroits (coach.js et log.js)",
            'potentiellement a chaque echange au-dela de 4',
            "<b>file de promesses (_memFile)</b> : les appels sont SERIALISES, jamais "
            "paralleles - mais ils ne sont pas DEDOUBLONNES : deux declencheurs = deux appels",
            '<b>aucun</b> cote client', 'FREE',
            'non - sauf a ne pas parler a Milo'],
           ['milo.sessionToJson', "texte dicte reconnu comme une seance (_cerveletSeance)",
            '1 par texte reconnu',
            "delai maximum de 12 s (AbortController) puis repli local",
            '<b>aucun</b> cote client', 'INTERNE',
            'non - mais le repli local rend le service meme sans appel']],
          [24 * mm, 34 * mm, 26 * mm, 32 * mm, 18 * mm, 14 * mm, 20 * mm]))
A(Spacer(1, 4))
A(encadre("CE QUE CA IMPLIQUE POUR LA DECISION",
          ["Ces trois-la sont les seules dont le cout ne depend d'aucun geste de la personne. "
           "<b>Un compte gratuit qui s'entraine et parle a Milo genere des appels IA sans "
           "jamais toucher a ses %d questions gratuites.</b>" % F['COACH_FREE_LIMIT'],
           "<b>milo.debrief</b> est celle qui pese le plus : elle est vendue Premium (I1) et "
           "elle part a chaque seance.",
           "<b>Le serveur ne distingue pas l'abonnement</b> pour ces trois-la, comme pour les "
           "17 autres : elles consomment le meme quota que tout le reste."], BLEU))

A(Spacer(1, 6))
A(Paragraph('Les deux capacites Admin', H3))
A(tableau(['capacite', 'qui peut la lancer', 'meme quota que les utilisateurs ?',
           'combien d appels', 'garde specifique', 'peut-elle fausser les statistiques ?'],
          [['admin.bench.milo', '<b>_isAdminUnlocked</b> (5 taps sur le logo)',
            '<b>oui</b> - le meme ai_quota serveur',
            'fourchette calculee et annoncee avant le lancement, pas ecrite en dur',
            "<b>oui</b> cote client ; <b>aucun</b> cote serveur",
            "<b>oui</b> - et il pose S.premium=true + S.coachFree=0 pendant le test, "
            "s'affranchissant des deux compteurs du client (volontaire, ecrit sur place)"],
           ['admin.bench.pt001', '<b>_isAdminUnlocked</b>',
            '<b>oui</b> - le meme ai_quota serveur',
            "n+1 appels pour n seances, annonces dans une confirmation",
            "<b>oui</b> cote client ; verrou de concurrence _pt001Running ; "
            "<b>aucun</b> cote serveur",
            "<b>oui</b> - une grosse passe rapproche le plafond global"]],
          [24 * mm, 30 * mm, 26 * mm, 28 * mm, 28 * mm, 32 * mm]))
A(Paragraph("Aucun quota Admin separe n'est propose ici : ce serait une decision, pas une "
            "mesure.", PET))

# ─────────────────────────── 9. LIMITES ───────────────────────────────────────
A(PageBreak())
A(Paragraph('9. Limites de la mesure', H2))
A(Paragraph("Ce qui n'a pas pu etre mesure est dit avec sa cause technique, jamais remplace "
            "par une probabilite (regle d'or 16).", PET))
A(tableau(['ce qui n a pas ete mesure', 'pourquoi', 'ce qu il faudrait'],
          [["La <b>valeur actuelle</b> de la Script Property <b>ai_quota</b>",
            "la lire demande un appel a Apps Script ; le conteneur ne joint ni le Worker ni "
            "script.google.com (hors liste d'autorisation reseau)",
            "un appel depuis un navigateur connecte, ou le panneau Admin de l'app"],
           ["L'<b>usage reel</b> de la 2e porte Apps Script (a-t-elle deja servi ?)",
            "il faudrait les journaux du Worker et ceux d'Apps Script",
            "les journaux du Worker Cloudflare"],
           ["Qu'un compte gratuit obtienne <b>en pratique</b> un scope 'week'",
            "c'est vrai dans la source (le serveur ne lit pas le scope) mais aucune requete "
            "n'a ete emise : consigne explicite, aucun test offensif, aucun appel IA depense",
            "une requete de test sur un compte de test"],
           ["Le <b>volume</b> des 3 capacites automatiques dans la facture",
            "le panneau Admin compte par action, et 5 capacites partagent l'action coach",
            "un compteur par capacite - c'est precisement l'objet de la phase 3"],
           ["Combien de comptes ont deja <b>contourne</b> un compteur freemium",
            "les compteurs vivent dans le localStorage de chaque appareil",
            "une comparaison serveur entre usage reel et compteur declare"]],
          [46 * mm, 66 * mm, 52 * mm]))

# ─────────────────────────── 10. CONTRADICTEUR ────────────────────────────────
A(Spacer(1, 6))
A(Paragraph('Passe adversariale', H2))
A(Paragraph("Sept affirmations de ce dossier ont ete soumises a <b>trois contradicteurs "
            "independants chacun</b> (angles : second chemin / faille de raisonnement / cas "
            "limite), avec pour consigne de les <b>refuter</b>. En cas de desaccord, un "
            "arbitre relit chaque preuve citee dans le code avant de trancher.", P))
lignes = []
for c in CONTRA:
    v = c['final']
    coul = VERT if v == 'TIENT' else ROUGE
    lignes.append([cel(c['t'], CEL),
                   rich('<font color="#%s"><b>%s</b></font>' % (coul.hexval()[2:], v), CEL),
                   cel(c.get('motif', ''), MINI)])
A(tableau(['affirmation soumise', 'verdict', 'ce que le contradicteur a trouve'],
          lignes, [56 * mm, 20 * mm, 92 * mm]))

# ─────────────────────────── CONCLUSION ───────────────────────────────────────
A(PageBreak())
A(Paragraph('Conclusion Phase 2', H2))

A(Paragraph('PROUVE', H3))
for t in [
    "Le <b>serveur n'applique aucune politique Premium</b> : 0 lecture de <b>_moi.premium</b> "
    "dans worker.js, 0 mention de <i>premium</i> dans <b>_aiQuotaBlock_</b>. Les 20 capacites "
    "sont FREE cote serveur.",
    "Il y a <b>deux quotas</b> : le <b>plafond d'abus</b> est bien serveur et reel ; le "
    "<b>quota produit</b> - celui qui decide qui doit payer - vit <b>entierement dans le "
    "navigateur</b> : "
    "6 compteurs, tous dans localStorage, dont 3 synchronises au cloud mais <b>jamais "
    "verifies</b> par le serveur.",
    "Le serveur compte des <b>actions (%d)</b>, pas des <b>capacites (20)</b> : l'action "
    "<b>coach</b> porte a elle seule 5 capacites. Il ne peut donc pas appliquer une politique "
    "par capacite, meme s'il connaissait le statut." % len(F['proxy_actions']),
    "<b>%d capacites</b> sur 20 n'ont <b>aucun garde</b> cote client, dont trois vendues "
    "Premium." % F['n_free'],
    "La <b>2e porte Apps Script</b> route encore %d des %d actions IA, <b>sans jeton ni "
    "verification de statut</b> ; le client ne l'emprunte qu'en repli."
    % (len(F['porte2_routees']), len(F['proxy_actions'])),
    "Le <b>double comptage du quota</b> est etabli sur la source : deux appels a "
    "_aiQuotaBlock_ par requete IA, donc des plafonds reels de moitie (%s)."
    % esc(D.DOUBLE['plafond_reel']),
]:
    A(Paragraph('&bull; ' + t, P))

A(Paragraph('INCOHERENCES PROUVEES', H3))
for titre, _ in INC:
    A(Paragraph('&bull; <b>%s</b>' % esc(titre), P))
A(Paragraph('&bull; <b>I8 - Le double comptage du quota : chaque appel IA consomme deux '
            'unites.</b>', P))
A(Paragraph("&bull; <b>I9 - S.premium a deux sources cote client, dont une liste d'e-mails "
            "dans un fichier public.</b>", P))

A(Paragraph('RESTE NON PROUVE', H3))
for t in [
    "La <b>valeur actuelle</b> de ai_quota, donc de combien les plafonds sont entames "
    "aujourd'hui - le conteneur ne joint pas Apps Script.",
    "L'<b>usage reel</b> de la 2e porte Apps Script : a-t-elle deja servi en production ?",
    "Qu'un compte gratuit obtienne <b>en pratique</b> un scope 'week' - vrai dans la source, "
    "aucune requete emise (consigne : aucun test offensif).",
    "Le <b>volume</b> que representent les 3 capacites automatiques dans la facture.",
    "Combien de comptes ont deja contourne un compteur freemium.",
]:
    A(Paragraph('&bull; ' + t, P))

A(Paragraph('DECISIONS MICHEL REQUISES', H3))
for ref, cap, _, _ in DEC:
    A(Paragraph('&bull; <b>%s - %s</b>' % (ref, esc(cap)), P))

A(Paragraph('PEUT-ON PASSER A LA PHASE 3 - SOURCE DE VERITE CENTRALE', H3))
A(encadre("OUI - et la raison est precise",
          ["<b>OUI pour le registre central lui-meme.</b> Les 20 capacites sont etablies avec, "
           "pour chacune, son module, son declenchement, ses points d'entree, son action "
           "Worker, sa route Apps Script, son garde actuel et l'emplacement exact de ce garde. "
           "C'est exactement ce qu'un registre central doit contenir, et rien n'y manque.",
           "<b>La raison precise pour laquelle c'est possible maintenant</b> : la phase 2 a "
           "montre que le serveur ne peut pas distinguer les capacites parce qu'il ne connait "
           "que les actions. <b>Un registre central est donc le prealable technique</b>, pas "
           "une etape d'organisation - sans lui, aucun verrou serveur par capacite n'est "
           "exprimable.",
           "<b>NON, en revanche, pour poser les verrous Premium dans la foulee</b> : cela "
           "demande d'abord D1 a D5. Le code ne peut pas les deviner, et trois d'entre elles "
           "changeraient ce que vivent des comptes gratuits existants.",
           "<b>Deux chantiers sont prets sans aucune decision produit</b> : la correction du "
           "double comptage (D6) et la separation du pot de %d usages (D5), prealable "
           "technique a la decision deja actee sur le code-barres."
           % F['FOOD_AI_FREE_LIMIT']], VERT))

A(Spacer(1, 8))
A(Paragraph(
    "Dossier genere par un script qui recompte ses %d faits depuis le code servi et refuse de "
    "produire si l'un d'eux tombe. Aucun fichier servi n'a ete modifie, aucun appel reseau "
    "emis, aucun appel IA depense, aucun compte reel touche." % NB_GARDES, PET))

# ── construction avec deux orientations ───────────────────────────────────────
doc = BaseDocTemplate(SORTIE, pagesize=A4,
                      title='Force Tracker - Phase 2 - politique IA FREE / FREEMIUM / PREMIUM',
                      author='Force Tracker')
portrait_frame = Frame(20 * mm, 16 * mm, 170 * mm, A4[1] - 32 * mm, id='p')
paysage_frame = Frame(16 * mm, 14 * mm, landscape(A4)[0] - 32 * mm,
                      landscape(A4)[1] - 28 * mm, id='l')
doc.addPageTemplates([
    PageTemplate(id='portrait', frames=[portrait_frame], pagesize=A4, onPage=pied),
    PageTemplate(id='paysage', frames=[paysage_frame], pagesize=landscape(A4), onPage=pied),
])
doc.build(hist)

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

print('OK %s (%d gardes, %d octets)' % (SORTIE, NB_GARDES, os.path.getsize(SORTIE)))
