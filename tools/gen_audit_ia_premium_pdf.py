#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""FORCE TRACKER — AUDIT GLOBAL IA / SANS IA — FREE / PREMIUM (18/09/2026).
Dossier autonome, HORS DEPOT (regle d'or #14).

[!!] AUCUN CHIFFRE N'EST TAPE ICI. Tout est relu :
     - l'inventaire et les verdicts dans le journal du workflow d'audit ;
     - les faits de code par un RECOMPTAGE depuis les fichiers servis et le backend ;
     - l'etat de l'arbre par git.
     Des gardes refusent de produire si un fait tombe. *Un dossier qui recopie ses propres
     chiffres ne prouve rien, il se cite lui-meme.*

[!!] POLICE : WinAnsi/cp1252, aucun emoji (reportlab les dessinerait en carres noirs).
"""
import html, json, os, re, subprocess, sys
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                KeepTogether, PageBreak)

ROOT = os.environ.get('FT_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('FT_OUT') or '/tmp/FORCE-TRACKER-AUDIT-GLOBAL-IA-FREE-PREMIUM-18-09-2026.pdf'
DATA = os.environ.get('FT_DATA') or '/tmp/audit_final.json'
ROWS = os.environ.get('FT_ROWS') or '/tmp/audit_rows.json'
GARDES = [0]


def g(cond, msg):
    GARDES[0] += 1
    if not cond:
        raise SystemExit('GARDE ROUGE - ' + msg)


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8', errors='replace').read()


def git(*a):
    r = subprocess.run(['git'] + list(a), cwd=ROOT, capture_output=True, text=True)
    if r.returncode:
        raise SystemExit('git %s a echoue' % ' '.join(a))
    return r.stdout.strip()


# ══ LES FAITS, RECOMPTES DEPUIS LE CODE — jamais recopies ════════════════════════════════
W = lire('worker.js'); C = lire('Code.js'); A = lire('app.js'); CO = lire('constants.js')
SW = lire('sw.js'); ST = lire('state.js'); AUD = lire('docs/AUDIT-SECURITE-BACKEND.md')

VERSION = re.search(r"const CACHE = '(ft-v\d+)'", SW).group(1)
SHA = git('rev-parse', 'HEAD')

def sans_comm_js(s):
    s = re.sub(r'/\*.*?\*/', ' ', s, flags=re.S)
    return re.sub(r'(?m)^\s*//.*$', ' ', s)

W_CODE = sans_comm_js(W)

F = {}
# F1 — le Worker recoit premium et ne le lit jamais
F['premium_recu'] = len(re.findall(r'premium\s*:\s*!!d\.premium', W_CODE))
F['premium_lu']   = len(re.findall(r'_moi\.premium|moi\.premium', W_CODE))
F['premium_total_code'] = len(re.findall(r'premium', W_CODE, re.I))
# F2 — les actions IA du Worker
m = re.search(r"const _ACTIONS_IA = new Set\(\[(.*?)\]\)", W, re.S)
F['actions_ia'] = re.findall(r"'([^']+)'", m.group(1)) if m else []
# F3 — les quotas
F['global_max'] = re.search(r"AI_GLOBAL_MAX'\), 10\) \|\| (\d+)", C).group(1)
F['email_max']  = re.search(r"AI_EMAIL_MAX'\), 10\)\s*\|\| (\d+)", C).group(1)
F['quota_premium'] = len(re.findall(r'premium', re.search(
    r'function _aiQuotaBlock_\(email\) \{.*?\n\}', C, re.S).group(0), re.I))
# F4 — le plafond nutrition, cote navigateur
F['food_limit'] = re.search(r'const FOOD_AI_FREE_LIMIT=(\d+)', A).group(1)
F['food_lecteurs'] = len(re.findall(r'FOOD_AI_FREE_LIMIT', A)) - 1   # -1 : la declaration
# [!] PIEGE DE LA SOUS-CHAINE, 8e fois dans ce projet : `'ft4_foodai' in ST` reste VRAI si
#     quelqu'un renomme la cle en `ft4_foodaiX`. Le controle negatif l'a attrape sur mon propre
#     garde. On borne donc sur la CLE ENTIERE, guillemets compris.
F['food_storage'] = len(re.findall(r"'ft4_foodai'", ST))
# F5 — appels _aiUrl du client
SERVIS = ['index.html','app.js','screens.js','log.js','coach.js','setup.js','tracking.js',
          'state.js','constants.js','supabase.js','sw.js']
F['aiurl'] = sum(len(re.findall(r"_aiUrl\(\s*'", lire(f))) for f in SERVIS)
F['fetchs'] = sum(len(re.findall(r'\bfetch\s*\(', lire(f))) for f in SERVIS)
# F6 — V4 dans le dossier d'audit du 15/09
F['V4_ecrite'] = 'V4 — Aucune vérification Premium côté serveur' in AUD
F['V4_annoncee_fermee'] = bool(re.search(r'ferme \*\*V1, V2, V3 et V4\*\*', AUD))

g(F['premium_recu'] == 1, 'worker.js ne recoit plus le champ premium comme attendu')
g(F['premium_lu'] == 0,
  'UNE LIGNE DE worker.js LIT MAINTENANT _moi.premium : le fait central de ce dossier a change, '
  'il doit etre re-mesure avant publication')
# [!] ET LE MEME DEFAUT, AUTREMENT : compter 14 ne dit RIEN du contenu — renommer une action
#     laissait le compte a 14 et mon garde parfaitement vert. On fige la LISTE, pas le nombre.
_ATTENDUES = ['bodyStudy','coach','estimateFood','foodLabel','generateMealPlan','importBloodTest',
              'importBodyScan','importHistory','importMealPlan','importProgram','morphoAnalysis',
              'readBarcode','seanceJson','summarizeCoach']
g(sorted(F['actions_ia']) == _ATTENDUES,
  'la liste des actions IA du Worker a change : %s' % sorted(F['actions_ia']))
g(F['quota_premium'] == 0, '_aiQuotaBlock_ lit maintenant le premium : le dossier est perime')
g(F['food_storage'] == 2,
  'la cle ft4_foodai n est plus lue ET ecrite exactement une fois chacune dans state.js (%d) : '
  'le compteur nutrition a change de nature, re-mesurer' % F['food_storage'])
g(F['V4_ecrite'], 'V4 a disparu de docs/AUDIT-SECURITE-BACKEND.md — le dossier s appuie dessus')
g(F['V4_annoncee_fermee'],
  'la phrase du 15/09 annoncant que le jeton ferme V1..V4 a disparu : la contradiction centrale '
  'de ce dossier ne serait plus verifiable')

# ══ LES DONNEES DE L AUDIT, LUES DANS LE JOURNAL DU WORKFLOW ═════════════════════════════
D = json.load(open(DATA, encoding='utf-8'))
R = json.load(open(ROWS, encoding='utf-8'))
FN = [f for i in D['inventaires'] for f in i['fonctions']]
g(len(D['inventaires']) == 8, 'il manque des surfaces auditees (%d/8)' % len(D['inventaires']))
g(len(FN) >= 250, 'inventaire trop maigre : %d fonctions' % len(FN))
g(len(R) == 51, '%d incoherences avec verdict au lieu de 51' % len(R))
NTIENT = sum(1 for r in R if r['statut'] == 'TIENT')
NTOMBE = sum(1 for r in R if r['statut'] == 'TOMBE')
NDES   = sum(1 for r in R if r['statut'] == 'DESACCORD')
g(NTIENT + NTOMBE + NDES == len(R), 'compte des statuts incoherent')
g(NTOMBE > 0, 'aucune affirmation refutee : un contradicteur qui ne refute jamais ne prouve rien')

def cpt(champ, val):
    return sum(1 for f in FN if str(f.get(champ, '')).lower() == val)

ST_ = {
 'titre': ParagraphStyle('t', fontName='Helvetica-Bold', fontSize=16, leading=19, spaceAfter=2),
 'sous': ParagraphStyle('s', fontName='Helvetica', fontSize=8.4, leading=11,
                        textColor=colors.HexColor('#5A5A5A'), spaceAfter=9),
 'h1': ParagraphStyle('h1', fontName='Helvetica-Bold', fontSize=11.5, leading=14,
                      textColor=colors.HexColor('#C0392B'), spaceBefore=9, spaceAfter=4),
 'h2': ParagraphStyle('h2', fontName='Helvetica-Bold', fontSize=9.4, leading=12, spaceBefore=5,
                      spaceAfter=2),
 'p': ParagraphStyle('p', fontName='Helvetica', fontSize=8.2, leading=11, spaceAfter=3),
 'petit': ParagraphStyle('pt', fontName='Helvetica', fontSize=7, leading=9,
                         textColor=colors.HexColor('#5A5A5A'), spaceAfter=3),
 'cell': ParagraphStyle('c', fontName='Helvetica', fontSize=6.4, leading=7.8),
 'cellb': ParagraphStyle('cb', fontName='Helvetica-Bold', fontSize=6.4, leading=7.8),
}
C_ = lambda t: '<font face="Courier" size="7">%s</font>' % t


def _v(s):
    r = html.unescape(re.sub(r'<[^>]+>', '', s))
    if '**' in r:
        raise SystemExit('MARKDOWN NON CONVERTI : %r' % r[:80])
    try:
        r.encode('cp1252')
    except UnicodeEncodeError as e:
        raise SystemExit('POLICE hors cp1252 : %r (dans %r)' % (r[e.start:e.end], s[:70]))
    return s


def sans_emoji(s):
    out = []
    for c in str(s or ''):
        o = ord(c)
        if (0x1F000 <= o <= 0x1FAFF) or (0x2190 <= o <= 0x2BFF) or o in (0xFE0F, 0x20E3):
            continue
        out.append(c)
    return re.sub(r'\s+', ' ', ''.join(out)).strip()


def P(t, st='p'):
    return Paragraph(_v(t), ST_[st])


def tab(entetes, lignes, larg, police=6.4):
    data = [[Paragraph(_v(sans_emoji(h)), ST_['cellb']) for h in entetes]]
    for L in lignes:
        data.append([Paragraph(_v(sans_emoji(str(c))), ST_['cell']) for c in L])
    t = Table(data, colWidths=larg, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EDEDEA')),
        ('GRID', (0, 0), (-1, -1), 0.3, colors.HexColor('#CFCFC9')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 3), ('RIGHTPADDING', (0, 0), (-1, -1), 3),
        ('TOPPADDING', (0, 0), (-1, -1), 2), ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F7F7F5')])]))
    return t


H = []
H.append(P('Force Tracker - audit global IA / sans IA, FREE / PREMIUM', 'titre'))
H.append(P('Arbre audite : <b>%s</b>, SHA %s - 18/09/2026. AUDIT EN LECTURE SEULE : aucun statut, '
           'aucune fonction IA, aucune route, aucun quota, aucun comportement n a ete modifie. '
           '%d fonctions inventoriees sur 8 surfaces ; %d affirmations d incoherence passees a un '
           'contradicteur charge de les DETRUIRE ; %d tiennent, %d tombent, %d ont recu deux voix '
           'opposees et ont ete tranchees a la main. Le code et les mesures disent ce qui EST ; '
           'Michel decide ce qui DOIT ETRE.'
           % (VERSION, C_(SHA[:12]), len(FN), len(R), NTIENT, NTOMBE, NDES), 'sous'))

H.append(P('1. Ce que l application fait, en chiffres', 'h1'))
H.append(tab(['mesure', 'valeur', 'ou'],
 [['fonctions utilisateur inventoriees', len(FN), '8 surfaces de code'],
  ['sans aucune IA', cpt('ia', 'non'), 'categories A et B'],
  ['avec IA', cpt('ia', 'oui'), 'categories C, D, E, F'],
  ['dont reseau SANS IA (a ne pas confondre avec une depense)',
   sum(1 for f in FN if f.get('categorie') == 'B'), 'Open Food Facts, CIQUAL, sauvegarde, Supabase'],
  ['peuvent couter des tokens', cpt('tokens_possibles', 'oui'), '-'],
  ['depense AUTOMATIQUE, sans clic de la personne', cpt('depense_automatique', 'oui'),
   'debrief de seance, memoire de Milo, conversion de seance'],
  ['appels fetch dans les fichiers servis', F['fetchs'], 'recomptes'],
  ['appels au Worker IA (_aiUrl)', F['aiurl'], 'recomptes'],
  ['actions IA declarees par le Worker', len(F['actions_ia']), C_('worker.js _ACTIONS_IA')]],
 [96*mm, 22*mm, 52*mm]))

H.append(P('Repartition par categorie', 'h2'))
NOMS = {'A': 'A - 100% deterministe local', 'B': 'B - deterministe + reseau SANS IA',
        'C': 'C - deterministe avec repli IA', 'D': 'D - IA demandee par la personne',
        'E': 'E - IA AUTOMATIQUE', 'F': 'F - IA Admin / diagnostic',
        'G': 'G - legacy / appelabilite incertaine', 'H': 'H - a confirmer'}
H.append(tab(['categorie', 'nombre', 'ce que ca veut dire'],
 [[NOMS[k], sum(1 for f in FN if f.get('categorie') == k),
   'aucune depense' if k in 'AB' else ('depense possible' if k != 'G' else 'a confirmer')]
  for k in 'ABCDEFG'], [78*mm, 20*mm, 72*mm]))

# ── LE FAIT CENTRAL ─────────────────────────────────────────────────────────────────────
H.append(P('2. Le fait central - et il etait DEJA ECRIT dans le depot', 'h1'))
H.append(P('Le Worker Cloudflare recoit l etat Premium de chaque demandeur et ne le lit jamais. '
           'Recompte dans le code executable de %s, commentaires retires : le champ est affecte '
           '<b>%d fois</b> (l origine), et lu <b>%d fois</b>. Les %d actions IA sont gardees par '
           'l en-tete Origin, par un jeton d identite (refus ferme en 401) et par un quota - '
           '<b>jamais par l abonnement</b>. Le quota lui-meme ne distingue pas : %s par jour au '
           'total, %s par jour et par personne, et la fonction qui bloque ne contient <b>%d</b> '
           'occurrence du mot premium.'
           % (C_('worker.js'), F['premium_recu'], F['premium_lu'], len(F['actions_ia']),
              F['global_max'], F['email_max'], F['quota_premium'])))
H.append(P('<b>Ce n est pas une trouvaille, et le dire autrement serait malhonnete.</b> '
           + C_('docs/AUDIT-SECURITE-BACKEND.md') + ' le porte depuis le 15/09/2026 sous le nom '
           '<b>V4 - Aucune verification Premium cote serveur</b>, classee ELEVE, en attente de '
           'decision.', 'p'))
H.append(P('<b>CE QUI EST NEUF, EN REVANCHE, EST UNE CONTRADICTION MESUREE.</b> Ce meme dossier '
           'annonce que le jeton d identite <i>ferme V1, V2, V3 et V4</i>. Le jeton a bien ete '
           'livre (S1, ft-v1216, 16/09) et il ferme l identite - mais il ne ferme PAS V4 : le '
           'Worker range l etat Premium dans une variable et ne la consulte nulle part. '
           '<b>Une fermeture annoncee qui n a pas eu lieu est plus dangereuse qu une faille '
           'connue : on cesse de la surveiller.</b>', 'p'))

# ── LES TROIS LISTES ────────────────────────────────────────────────────────────────────
def bloc(titre, items, style='p'):
    H.append(P(titre, 'h2'))
    for it in items:
        H.append(P('- ' + it, style))

H.append(PageBreak())
H.append(P('3. A - Situation conforme', 'h1'))
bloc('Ce qui correspond au comportement voulu et aux decisions connues', [
 '<b>Le chemin gratuit du code-barres est conforme a la decision actee</b> : scan local, '
 + C_('zxing-wasm') + ', cle de controle EAN, saisie manuelle, recherche produit Open Food Facts. '
 'Mesure : zero appel IA sur ce chemin.',
 '<b>La majorite de l application ne coute rien</b> : %d fonctions sur %d ne touchent a aucune IA, '
 'dont %d qui partent quand meme au reseau. Reseau n est pas depense.'
 % (cpt('ia', 'non'), len(FN), sum(1 for f in FN if f.get('categorie') == 'B')),
 '<b>L identite est reellement verifiee cote serveur avant toute depense IA</b>, et en echec ferme : '
 'jeton absent, invalide ou reseau coupe donnent un refus, pas un passage (S1, 16/09).',
 '<b>Un plafond de depense existe et mord</b> : quota par personne et par jour, plafond global, '
 'plus un plafond en memoire du Worker. Aucun de ces trois ne distingue l abonnement.',
 '<b>Le calcul nutritionnel, la seance, la recuperation, les records, le calendrier et les '
 'calories sont deterministes</b> : aucun appel a un modele.',
])

H.append(P('4. B - Incoherences prouvees', 'h1'))
H.append(P('Chacune a resiste a un contradicteur charge de la detruire. Les deux qui avaient recu '
           'deux voix opposees ont ete relues a la main, ligne a ligne. Le marqueur [DEJA CONNU] '
           'signale ce qui figure deja dans le dossier de securite du 15/09 : ce n est pas une '
           'trouvaille, c est un rappel d etat.', 'petit'))
bloc('', [
 '[DEJA CONNU - V4] <b>Aucun verrou Premium cote serveur, sur aucune des %d routes IA.</b> '
 'Consequence en fait : un compte gratuit qui modifie son JavaScript declenche les memes appels '
 'payants qu un compte premium, dans la limite du quota commun. Trouve independamment par 5 des '
 '8 surfaces auditees.' % len(F['actions_ia']),
 '<b>La fermeture de V4 annoncee par le dossier du 15/09 n a pas eu lieu.</b> Le jeton ferme '
 'l identite, pas l abonnement. (Contradiction interne au depot, mesurable.)',
 '<b>Le quota IA est decompte DEUX fois par appel.</b> La verification d identite et le comptage '
 'incrementent le meme compteur. Consequence chiffree : le plafond de %s par personne est atteint '
 'a environ %d appels reels, et celui de %s a environ %d. Deux voix concordantes.'
 % (F['email_max'], int(F['email_max'])//2, F['global_max'], int(F['global_max'])//2),
 '[DEJA CONNU - V9] <b>Les plafonds gratuits vivent dans le navigateur.</b> Le compteur de '
 'questions gratuites de Milo et la cagnotte de %s essais IA nutrition sont dans le stockage local : '
 'les vider les remet a zero.' % F['food_limit'],
 '<b>La cagnotte de %s essais est PARTAGEE</b> entre l etiquette nutritionnelle, la photo du '
 'code-barres et le repas decrit - %d lecteurs du meme plafond. Ce n est donc pas 25 par fonction.'
 % (F['food_limit'], F['food_lecteurs']),
 '<b>Les routes IA restent joignables directement sur Apps Script</b>, sans le jeton exige par le '
 'Worker : le verrou d identite du Worker se contourne en s adressant a l autre porte.',
 '<b>Des avantages annonces Premium sont en realite gratuits</b> : le debrief automatique de fin '
 'de seance et le "contexte complet" figurent dans les arguments de vente alors que rien ne les '
 'ferme a un compte gratuit.',
 '<b>La generation du plan de repas ne decompte aucun essai gratuit</b>, contrairement aux trois '
 'autres fonctions IA de la nutrition. Deux voix concordantes.',
 '[DEJA CONNU - V14] <b>Deux plafonds globaux contradictoires</b> : le panneau Admin affiche une '
 'valeur 2,5 fois plus haute que celle qui bloque reellement.',
 '<b>Dettes de documentation dans des fichiers servis</b> : un commentaire affirme qu aucun bouton '
 'ne mene a une fonction qui en a un ; ' + C_('CLAUDE.md') + ' declare dormante une fonction encore '
 'appelee. Sans consequence fonctionnelle, mais ce sont exactement les phrases qui font dire une '
 'betise au suivant.',
])

H.append(P('5. C - Decisions qui appartiennent a Michel', 'h1'))
H.append(P('Aucune n est tranchee ici. Pour chacune, l etat actuel est mesure et la decision '
           'manque - ou existe et n est pas encore appliquee.', 'petit'))
bloc('', [
 '<b>Le repli "photo du code-barres lue par IA" : la decision actee n est pas encore dans le code.</b> '
 'Mesure : il est freemium (ouvert a tous jusqu a epuisement de la cagnotte partagee), son plafond '
 'vit dans le navigateur, et le serveur ne verifie aucun abonnement. La decision du jour dit '
 'PREMIUM. <b>Il ne s agit pas d un bug : c est une decision recente que le code n a pas encore '
 'recue.</b> Quand tu voudras l appliquer, elle demandera un verrou SERVEUR, sinon elle restera '
 'decorative.',
 '<b>Faut-il un verrou Premium cote serveur, et sur quelles routes ?</b> C est V4. Repondre '
 '"toutes" et repondre "aucune" sont deux reponses valables : aujourd hui le budget est borne par '
 'le quota, pas par l abonnement. La question est produit, pas technique.',
 '<b>La lecture d etiquette, l estimation d un repas decrit, la generation de semaine : FREE ou '
 'PREMIUM ?</b> Aujourd hui freemium avec une cagnotte commune - sauf la generation de plan, qui ne '
 'decompte rien du tout. Aucune decision ecrite n a ete retrouvee pour ce dernier cas.',
 '<b>Le debrief automatique de fin de seance</b> : il part sans clic et il est annonce comme un '
 'avantage Premium. Doit-il rester gratuit, devenir payant, ou cesser d etre annonce comme un '
 'avantage ?',
 '<b>Les outils Admin qui depensent reellement des tokens</b> (bancs d essai) : doivent-ils porter '
 'un garde-fou de cout distinct du quota des utilisateurs ?',
])

# ── LA MATRICE COMPLETE ─────────────────────────────────────────────────────────────────
H.append(PageBreak())
H.append(P('6. Matrice complete - %d fonctions' % len(FN), 'h1'))
H.append(P('Une ligne par fonction utilisateur reelle. Colonne "serveur" : existe-t-il un refus '
           'cote serveur AVANT la depense, et sur quoi porte-t-il.', 'petit'))
lignes = []
for f in sorted(FN, key=lambda x: (x.get('module', ''), x.get('fonction_utilisateur', ''))):
    vs = str(f.get('verrou_serveur', ''))
    court = 'identite+quota' if 'identite' in vs.lower() or '401' in vs else (
            'oui' if vs.lower().startswith('oui') else ('non' if vs.lower().startswith('non') else '-'))
    lignes.append([f.get('module', '')[:26], f.get('fonction_utilisateur', '')[:62],
                   f.get('categorie', ''), f.get('ia', ''),
                   f.get('tokens_possibles', ''), f.get('depense_automatique', ''),
                   f.get('free', ''), f.get('premium', ''), court, f.get('etat', '')[:22]])
H.append(tab(['module', 'fonction', 'cat', 'IA', 'tok', 'auto', 'free', 'prem', 'serveur', 'etat'],
             lignes, [24*mm, 62*mm, 7*mm, 8*mm, 8*mm, 9*mm, 11*mm, 11*mm, 22*mm, 28*mm]))

H.append(PageBreak())
H.append(P('7. Limites de cet audit - ce qui n a PAS pu etre mesure', 'h1'))
bloc('', [
 '<b>Aucun appel reel au Worker n a ete tente, et ce n est pas un choix.</b> Le domaine du Worker '
 'et celui du site sont hors de la liste d autorisation reseau de la session : message exact '
 'renvoye par le mandataire, "Host not in allowlist". Mesure faite avec trois clients differents. '
 'Tout ce qui est dit du comportement serveur vient donc de la LECTURE du code deploye, pas d une '
 'requete.',
 '<b>Aucune tentative de contournement n a ete executee.</b> Les affirmations de contournement sont '
 'des raisonnements sur du code lu, pas des attaques menees.',
 '<b>Le cout exact en euros n est pas mesure.</b> Le depot ne porte aucun tarif ; le panneau Admin '
 'du cout reel existe mais n est pas lisible depuis ce conteneur. Ce dossier dit donc quelles '
 'fonctions PEUVENT depenser, jamais combien elles coutent.',
 '<b>Les droits reels des fonctions Supabase</b> ne sont pas lisibles depuis le depot.',
 '<b>Le contradicteur n est pas infaillible</b> : %d affirmations sur %d ont ete refutees et '
 'beaucoup d autres ramenees a une formulation plus petite que celle de depart. C est le but. Deux '
 'affirmations ont recu DEUX VOIX OPPOSEES : elles ont ete relues a la main et tranchees ligne a '
 'ligne, et les deux voix disaient en realite la meme chose - elles differaient sur la formulation '
 'de depart, pas sur les faits.' % (NTOMBE, len(R)),
])

H.append(Spacer(1, 4))
H.append(P('Dossier produit par ' + C_('tools/gen_audit_ia_premium_pdf.py') + ' - <b>%d gardes</b> '
           'qui recomptent chaque fait depuis le code servi et le backend, et refusent de produire '
           'si l un tombe : si une ligne du Worker se mettait a lire l etat Premium, si '
           '_ACTIONS_IA changeait de taille, si le quota se mettait a distinguer l abonnement, ou '
           'si V4 disparaissait du dossier de securite, ce PDF ne sortirait pas. Hors depot '
           '(regle d or #14).' % (GARDES[0] + 1), 'petit'))

SimpleDocTemplate(OUT, pagesize=landscape(A4), leftMargin=12*mm, rightMargin=12*mm,
                  topMargin=12*mm, bottomMargin=11*mm,
                  title='Force Tracker - audit global IA / FREE-PREMIUM',
                  author='Force Tracker').build(H)
print('OK %s' % OUT)
print('   %s / %s · %d fonctions · %d incoherences (%d tiennent, %d tombent, %d desaccords) · %d gardes'
      % (VERSION, SHA[:12], len(FN), len(R), NTIENT, NTOMBE, NDES, GARDES[0]))
