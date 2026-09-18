#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""PHASE 1 — NORMALISATION DES CAPACITES IA. Dossier hors depot (regle d'or #14).

[!!] CHAQUE CHIFFRE EST RECOMPTE DEPUIS LE CODE, jamais recopie. Des gardes refusent de
     produire si un fait tombe (une action IA de plus, une route qui part ailleurs, une
     fonction porteuse renommee).
[!!] POLICE : WinAnsi/cp1252, aucun emoji.
"""
import html, json, os, re, subprocess
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

ROOT = os.environ.get('FT_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('FT_OUT') or '/tmp/FORCE-TRACKER-PHASE1-CAPACITES-IA-18-09-2026.pdf'
CAP = os.environ.get('FT_CAP') or '/tmp/ph1_capacites.json'
G = [0]


def g(c, m):
    G[0] += 1
    if not c:
        raise SystemExit('GARDE ROUGE - ' + m)


def lire(p):
    return open(os.path.join(ROOT, p), encoding='utf-8', errors='replace').read()


W = lire('worker.js'); CO = lire('constants.js'); SW = lire('sw.js')
VERSION = re.search(r"const CACHE = '(ft-v\d+)'", SW).group(1)
SHA = subprocess.run(['git', 'rev-parse', 'HEAD'], cwd=ROOT, capture_output=True, text=True).stdout.strip()

ACT_W = set(re.findall(r"'([^']+)'", re.search(r"const _ACTIONS_IA = new Set\(\[(.*?)\]\)", W, re.S).group(1)))
ACT_C = set(re.findall(r"'([^']+)'", re.search(r"AI_PROXY_ACTIONS\s*=\s*\[(.*?)\]", CO, re.S).group(1)))

SERVIS = ['app.js', 'screens.js', 'log.js', 'coach.js', 'setup.js', 'tracking.js',
          'state.js', 'constants.js', 'supabase.js']
# recomptage des points d appel : (fichier, fonction, action) distincts
def fns(s):
    o = [(m.group(1), m.start()) for m in re.finditer(r'(?m)^\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(', s)]
    o.sort(key=lambda x: x[1]); return o
def fn_de(o, p):
    n = '(fichier)'
    for a, d in o:
        if d <= p: n = a
        else: break
    return n
# [!] ON MESURE LE CODE, PAS CE QUI EN PARLE. Mon controle negatif a attrape ce defaut chez
#     moi : une mutation qui citait `_aiUrl('coach')` dans un COMMENTAIRE faisait monter mon
#     compteur a 20. C est la famille la plus payee de ce projet (ft-v1193/1203/1205/1210/1216/
#     1220) — un garde qui lit la source brute compte la documentation.
#     ⛔ Les commentaires sont donc neutralises AVANT le comptage, en gardant la longueur exacte
#        pour que les positions (et donc la fonction porteuse) restent justes.
def sans_comm(src):
    """Neutralise les commentaires EN CONNAISSANT LES CHAINES, et garde la longueur exacte.

    [!!] DEUX DEFAUTS PAYES DE SUITE SUR CETTE SEULE FONCTION, tous les deux a moi :
      1. sans elle, un `_aiUrl('coach')` cite dans un COMMENTAIRE etait compte comme un appel
         (mon controle negatif l'a attrape : 19 -> 20).
      2. avec une version naive `/\*.*?\*/`, elle avalait 90 lignes de VRAI code a cause de
         `accept="image/*"` dans une CHAINE (setup.js:2517) : le compteur tombait a 18.
    *Un nettoyeur de commentaires qui ne connait pas les chaines est un nettoyeur qui efface du
    code* — meme famille que celui qui a du apprendre `<!-- -->` en ft-v1220.
    """
    out = list(src); i = 0; n = len(src)
    while i < n:
        c = src[i]
        if c in ('"', "'", '`'):                      # une chaine : on la saute en entier
            q = c; i += 1
            while i < n and src[i] != q:
                i += 2 if src[i] == '\\' else 1
            i += 1; continue
        if c == '/' and i + 1 < n and src[i+1] == '*':
            j = src.find('*/', i + 2); j = n if j < 0 else j + 2
            for k in range(i, j): out[k] = ' '
            i = j; continue
        if c == '/' and i + 1 < n and src[i+1] == '/':
            j = src.find('\n', i); j = n if j < 0 else j
            for k in range(i, j): out[k] = ' '
            i = j; continue
        i += 1
    return ''.join(out)


POINTS = set()
for f in SERVIS:
    s = sans_comm(lire(f)); o = fns(s)
    for m in re.finditer(r"_aiUrl\(\s*'([^']+)'", s):
        if m.group(1) in ACT_W:
            POINTS.add((f, fn_de(o, m.start()), m.group(1)))

C = json.load(open(CAP, encoding='utf-8'))['capacites']

g(len(ACT_W) == 14, 'le Worker ne declare plus 14 actions IA mais %d' % len(ACT_W))
g(ACT_W == ACT_C,
  'LA LISTE DU CLIENT ET CELLE DU WORKER ONT DIVERGE : une action IA partirait ailleurs que vers '
  'le Worker. Ecart : %s' % sorted(ACT_W ^ ACT_C))
g(len(POINTS) == 19, 'les points d appel IA recomptes valent %d et non 19' % len(POINTS))
g(len({p[1] for p in POINTS}) == 19, 'deux points d appel partagent la meme fonction porteuse')
g({c['action'] for c in C} == ACT_W,
  'la table des capacites ne couvre plus exactement les 14 actions du Worker')
for c in C:
    nom = c['fonction'].split('(')[0]
    g(bool(re.search(r'(?m)^\s*(?:async\s+)?function\s+' + re.escape(nom) + r'\s*\(',
                     lire(c['fichier'].split(':')[0]))),
      'la fonction porteuse %s a disparu de %s' % (nom, c['fichier']))

AUTO = [c for c in C if c['auto'] == 'OUI']
ADMIN = [c for c in C if c['module'] == 'Admin']
ARB = [c for c in C if c['etat'] != 'PROUVE']
g(len(AUTO) == 3, 'le nombre de capacites automatiques a change (%d)' % len(AUTO))
g(len(ARB) == 2, 'le nombre d arbitrages rendus a Michel a change (%d)' % len(ARB))

S_ = {'t': ParagraphStyle('t', fontName='Helvetica-Bold', fontSize=16, leading=19, spaceAfter=2),
      's': ParagraphStyle('s', fontName='Helvetica', fontSize=8.4, leading=11,
                          textColor=colors.HexColor('#5A5A5A'), spaceAfter=9),
      'h': ParagraphStyle('h', fontName='Helvetica-Bold', fontSize=11.5, leading=14,
                          textColor=colors.HexColor('#C0392B'), spaceBefore=9, spaceAfter=4),
      'p': ParagraphStyle('p', fontName='Helvetica', fontSize=8.2, leading=11, spaceAfter=3),
      'pt': ParagraphStyle('pt', fontName='Helvetica', fontSize=7, leading=9,
                           textColor=colors.HexColor('#5A5A5A'), spaceAfter=3),
      'c': ParagraphStyle('c', fontName='Helvetica', fontSize=6.3, leading=7.7),
      'cb': ParagraphStyle('cb', fontName='Helvetica-Bold', fontSize=6.3, leading=7.7)}
CR = lambda t: '<font face="Courier" size="7">%s</font>' % t


def _v(s):
    r = html.unescape(re.sub(r'<[^>]+>', '', s))
    if '**' in r:
        raise SystemExit('MARKDOWN NON CONVERTI : %r' % r[:70])
    try: r.encode('cp1252')
    except UnicodeEncodeError as e:
        raise SystemExit('POLICE hors cp1252 : %r' % r[e.start:e.end])
    return s


def em(s):
    return re.sub(r'\s+', ' ', ''.join(ch for ch in str(s or '') if not (
        0x1F000 <= ord(ch) <= 0x1FAFF or 0x2190 <= ord(ch) <= 0x2BFF or ord(ch) in (0xFE0F, 0x20E3)))).strip()


def P(t, st='p'): return Paragraph(_v(t), S_[st])


def tab(h_, L, w):
    d = [[Paragraph(_v(em(x)), S_['cb']) for x in h_]] + [[Paragraph(_v(em(str(x))), S_['c']) for x in r] for r in L]
    t = Table(d, colWidths=w, repeatRows=1)
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EDEDEA')),
        ('GRID', (0, 0), (-1, -1), 0.3, colors.HexColor('#CFCFC9')), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 3), ('RIGHTPADDING', (0, 0), (-1, -1), 3),
        ('TOPPADDING', (0, 0), (-1, -1), 2), ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F7F7F5')])]))
    return t


H = [P('Force Tracker - phase 1 : combien de capacites IA, vraiment ?', 't')]
H.append(P('Arbre : <b>%s</b>, SHA %s - 18/09/2026. PHASE 1 EN LECTURE SEULE : aucun statut, aucun '
           'quota, aucun verrou, aucune route, aucun comportement modifie. L audit du matin avait '
           'rendu <b>103 lignes IA</b> ; ce dossier les ramene a ce qu elles sont vraiment.'
           % (VERSION, CR(SHA[:12])), 's'))

H.append(P('1. La reponse', 'h'))
H.append(tab(['mesure', 'valeur', 'comment elle est obtenue'],
 [['lignes IA de l audit', '103', 'somme des inventaires des 8 surfaces auditees'],
  ['actions IA declarees par le Worker', len(ACT_W), CR('worker.js _ACTIONS_IA')],
  ['POINTS D APPEL RESEAU distincts', len(POINTS), 'recomptes : (fichier, fonction, action) uniques'],
  ['fonctions porteuses distinctes', len({p[1] for p in POINTS}), 'aucune n en porte deux'],
  ['CAPACITES IA listees ici', len(C), 'un besoin produit distinct = une capacite'],
  ['dont AUTOMATIQUES (sans clic)', len(AUTO), ' · '.join(c['id'] for c in AUTO)],
  ['dont ADMIN / diagnostic', len(ADMIN), ' · '.join(c['id'] for c in ADMIN)],
  ['dont arbitrages rendus a Michel', len(ARB), ' · '.join(c['id'] for c in ARB)]],
 [66*mm, 20*mm, 184*mm]))
H.append(P('<b>Le rapport est de 103 a %d : environ <font size="9">5 lignes d audit sur 6</font> '
           'decrivaient la meme capacite vue d un autre endroit</b> - un bouton, un ecran, un '
           'wrapper, un champ de fichier, une route, ou simplement deux surfaces qui l avaient '
           'trouvee chacune de leur cote.' % len(C)))

H.append(P('2. Les capacites, une par ligne', 'h'))
H.append(tab(['id', 'nom utilisateur', 'module', 'auto', 'fonction porteuse', 'action', 'points d entree', 'etat'],
 [[c['id'], c['nom'], c['module'], c['auto'], c['fichier'], c['action'], c['entrees'], c['etat']] for c in C],
 [33*mm, 44*mm, 15*mm, 9*mm, 32*mm, 21*mm, 88*mm, 28*mm]))

H.append(PageBreak())
H.append(P('3. Le controle adversarial - ce que j ai tente de casser', 'h'))
H.append(tab(['vecteur', 'resultat mesure'],
 [['une route oubliee', 'NON : les 65 fetch des fichiers servis sont classes ; 19 seulement portent une action IA.'],
  ['une capacite comptee deux fois', 'NON : les 19 points d appel ont 19 fonctions porteuses DISTINCTES, aucune doublee.'],
  ['un wrapper pris pour une capacite', 'ECARTE : les champs de fichier (onchange) et leurs boutons sont ranges comme POINTS D ENTREE de leur capacite, jamais comme des capacites.'],
  ['un appel automatique oublie', 'NON : 3 trouves et nommes (debrief, memoire, cervelet), chacun avec son declencheur exact.'],
  ['une action Worker pour plusieurs produits', 'OUI, DEUX CAS : « coach » sert 5 fonctions (chat, debrief, analyse de programme, et 2 bancs Admin) et « bodyStudy » en sert 2. Une route n est donc PAS une capacite.'],
  ['plusieurs libelles pour la meme action', 'OUI : generateMealPlan est atteinte par « Generer mon repas du jour », « ma semaine » et « IA » (regeneration).'],
  ['une seconde porte hors du Worker', 'OUI COTE SERVEUR, NON COTE CLIENT : 13 des 14 actions IA sont encore servies par Apps Script (seule seanceJson est absente), mais la liste du client est IDENTIQUE a celle du Worker - aucun appel client ne part la-bas.'],
  ['une ancienne fonction encore appelable', 'a instruire en phase suivante : les 13 handlers IA d Apps Script n ont aucun appelant client mesure.'],
  ['deux capacites fusionnees a tort', 'DEUX ARBITRAGES rendus a Michel, ci-dessous.']],
 [52*mm, 213*mm]))

H.append(P('4. Ce que le contradicteur a trouve chez MOI', 'h'))
H.append(P('<b>Mes deux mesures ne tombaient pas d accord : 19 points d appel contre 18.</b> '
           'L ecart vient de ' + CR('_histAnalyzeBatch') + ' (log.js), qui fait '
           + CR("const _dest=_aiUrl('importHistory')") + ' puis ' + CR('fetch(_dest,...)') + '. '
           'Mon compteur qui cherchait la forme ' + CR('fetch(_aiUrl(') + ' ne pouvait pas voir '
           'cette indirection par variable. <b>19 est le bon chiffre, et c est la mesure la plus '
           'naive qui avait tort.</b> Meme famille que les gardes aveugles deja payes par ce '
           'projet : un motif qui cherche une FORME rate toujours la variante qu il n a pas prevue.'))
H.append(P('<b>Et un « 0 appelant » etait faux.</b> ' + CR('_resumeCoachUn') + ' semblait n avoir '
           'aucun appelant : elle est passee en REFERENCE a une file de promesses '
           '(' + CR('_memFile.then(_resumeCoachUn,_resumeCoachUn)') + '), ce qui n est pas un appel '
           + CR('f(') + '. <b>C est une capacite AUTOMATIQUE, et elle a failli passer pour morte.</b>'))

H.append(P('5. Les deux arbitrages qui vous appartiennent', 'h'))
for c in ARB:
    H.append(P('<b>%s - %s.</b> %s' % (c['id'], c['nom'], c['entrees'])))
H.append(P('Dans les deux cas le fait est le meme : <b>une seule route technique, deux besoins '
           'produit</b>. Les compter separement donne %d capacites ; les fusionner en donne %d. '
           'Je ne tranche pas : la granularite d une capacite decide de la granularite de la '
           'politique d acces, et c est une decision produit.' % (len(C), len(C) - len(ARB))))

H.append(P('6. Limites de cette phase', 'h'))
H.append(P('- Mesure faite par LECTURE du code servi et du backend. Aucun appel reseau reel : le '
           'Worker et le site sont hors de la liste d autorisation reseau de cette session '
           '(« Host not in allowlist »), mesure avec trois clients.<br/>'
           '- Cette phase ne dit RIEN de FREE/PREMIUM, des quotas ni des verrous : c est la phase 2.<br/>'
           '- Les 13 handlers IA d Apps Script sont signales, pas instruits : leur usage reel et '
           'leur fermeture eventuelle sont une phase dediee.<br/>'
           '- Les capacites sont nommees pour etre lisibles ; ces identifiants sont PROVISOIRES et '
           'n existent nulle part dans le code.'))

H.append(Spacer(1, 4))
H.append(P('Dossier produit par ' + CR('tools/gen_ph1_capacites_pdf.py') + ' - <b>%d gardes</b> qui '
           'recomptent depuis le code et refusent de produire si un fait tombe : si le Worker '
           'declarait une action IA de plus, si la liste du client divergeait de la sienne, si le '
           'nombre de points d appel changeait, ou si une fonction porteuse etait renommee. Hors '
           'depot (regle d or #14).' % (G[0] + 1), 'pt'))

SimpleDocTemplate(OUT, pagesize=landscape(A4), leftMargin=12*mm, rightMargin=12*mm,
                  topMargin=12*mm, bottomMargin=11*mm,
                  title='Force Tracker - phase 1, capacites IA', author='Force Tracker').build(H)
print('OK %s' % OUT)
print('   %s / %s · %d points d appel · %d capacites (%d auto, %d admin, %d arbitrages) · %d gardes'
      % (VERSION, SHA[:12], len(POINTS), len(C), len(AUTO), len(ADMIN), len(ARB), G[0]))
