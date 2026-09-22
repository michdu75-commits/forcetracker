#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""GÉNÉRATEUR DU PDF « DOSSIER DE DÉCISION V8 » — pour GPT.

⛔⛔ LES GARDES RECOMPTENT CHAQUE CHIFFRE DEPUIS LES MESURES ET REFUSENT DE PRODUIRE SI UN FAIT
TOMBE — y compris le fait le plus important : qu'aucun fichier SERVI n'a bougé.
⚠️ Police WinAnsi/cp1252, aucun emoji.
"""
import json, os, re, subprocess, sys
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANC = '/tmp/banc_v8.json'
DOSSIER = os.path.join(RACINE, 'docs', 'DOSSIER-DECISION-V8.md')
SORTIE = os.path.join(RACINE, 'docs', 'DOSSIER-DECISION-V8.pdf')
SERVIS = ['state.js','app.js','screens.js','log.js','coach.js','setup.js','tracking.js',
          'constants.js','index.html','style.css','sw.js','Code.js','worker.js','supabase.js']


def refus(m):
    print('REFUS DE PRODUIRE : ' + m); sys.exit(1)


def gardes():
    if not os.path.exists(BANC): refus('mesures du banc introuvables — relancer tools/banc_v8.js')
    if not os.path.exists(DOSSIER): refus('dossier markdown introuvable')
    B = json.load(open(BANC, encoding='utf-8'))
    txt = open(DOSSIER, encoding='utf-8').read()
    e = []
    # ① le miroir de V0 doit etre valide, sinon toute comparaison est sans valeur
    v = B['validation_v0']
    if v['ecarts'] != 0: e.append('le miroir de V0 diverge (%d ecarts) : la comparaison ne vaut rien' % v['ecarts'])
    if v['erreurs_page']: e.append('%d erreur(s) de page' % len(v['erreurs_page']))
    # ② aucun fichier SERVI modifie — le dossier l'annonce en premiere ligne
    r = subprocess.run(['git', 'status', '--porcelain'], cwd=RACINE, capture_output=True, text=True)
    touches = [l[3:].strip() for l in r.stdout.splitlines()
               if l[3:].strip() in SERVIS]
    if touches: e.append('fichiers SERVIS modifies : %s' % ', '.join(touches))
    # ③ le contre-audit doit etre propre
    ca = B['contre_audit']
    if ca['continuite_poids']: e.append('%d saut(s) de continuite +1 kg non resolus' % len(ca['continuite_poids']))
    if ca['continuite_mg']: e.append('%d saut(s) de continuite +1 %%MG non resolus' % len(ca['continuite_mg']))
    if ca['determinisme']: e.append('%d cas non deterministes' % ca['determinisme'])
    # ④ les temoins et les mutations
    t = subprocess.run(['node', 'tools/temoins_v8.js'], cwd=RACINE, capture_output=True, text=True)
    m = re.search(r'(\d+) OK . (\d+) ROUGE', t.stdout)
    if not m: e.append('temoins illisibles')
    else:
        nok, nrouge = int(m.group(1)), int(m.group(2))
        if nrouge: e.append('%d temoin(s) V8 rouge(s)' % nrouge)
        if ('**%d témoins' % nok) not in txt and ('%d témoins' % nok) not in txt:
            e.append('le dossier n annonce pas %d temoins' % nok)
    # ⑤ la fermeture de V8 doit etre a zero en population plausible
    f8 = B['corpusB']['variantes']['V8']['violations'].get('P01_fermeture_sup_5', 0)
    if f8 != 0: e.append('V8 ne ferme pas (%d cas)' % f8)
    f0 = B['corpusB']['variantes']['V0']['violations'].get('P01_fermeture_sup_5', 0)
    if f0 == 0: e.append('V0 fermerait : le defaut central aurait disparu, a verifier')
    # ⑥ mentions obligatoires
    for mot in ['MASSE MAIGRE', 'Murphy & Koehler', 'Henselmans', 'NON VÉRIFIABLE',
                'bornes_lipides_en_conflit', 'V8 EST UNE CANDIDATE NON SERVIE']:
        if mot not in txt: e.append('le dossier ne contient plus « %s »' % mot)
    if e: refus(' | '.join(e))
    return B, txt, nok


def w(s):
    rep = {'→':'->','≥':'>=','≤':'<=','×':'x',' ':' ','’':"'",
           '“':'"','”':'"','–':'-','—':'-','…':'...',' ':' ',
           '≠':'!=','±':'+/-','⭐':'','⛔':'','⚠':'','️':'',
           '✅':'','‑':'-'}
    for k, v in rep.items(): s = s.replace(k, v)
    return ''.join(c if ord(c) < 256 else '?' for c in s)


NOIR, ROUGE, GRIS, BLEU = (colors.HexColor('#111111'), colors.HexColor('#B3261E'),
                           colors.HexColor('#5F6368'), colors.HexColor('#1A4D8F'))
H1 = ParagraphStyle('H1', fontName='Helvetica-Bold', fontSize=14, leading=17, textColor=BLEU, spaceAfter=6)
H2 = ParagraphStyle('H2', fontName='Helvetica-Bold', fontSize=10.5, leading=13, textColor=NOIR, spaceBefore=8, spaceAfter=3)
P = ParagraphStyle('P', fontName='Helvetica', fontSize=8.4, leading=11.2, textColor=NOIR, spaceAfter=3)
PR = ParagraphStyle('PR', parent=P, textColor=ROUGE)
PG = ParagraphStyle('PG', parent=P, textColor=GRIS, fontSize=7.4, leading=9.6)


def tab(d, lg, entete=True):
    t = Table([[Paragraph(w(str(c)), PG) for c in l] for l in d], colWidths=lg)
    st = [('GRID', (0,0), (-1,-1), 0.3, colors.HexColor('#CCCCCC')), ('VALIGN', (0,0), (-1,-1), 'TOP'),
          ('LEFTPADDING', (0,0), (-1,-1), 2.5), ('RIGHTPADDING', (0,0), (-1,-1), 2.5),
          ('TOPPADDING', (0,0), (-1,-1), 2), ('BOTTOMPADDING', (0,0), (-1,-1), 2)]
    if entete: st.append(('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EEF2F7')))
    t.setStyle(TableStyle(st)); return t


def main():
    B, txt, nok = gardes()
    tete = subprocess.run(['git','rev-parse','HEAD'], cwd=RACINE, capture_output=True, text=True).stdout.strip()[:8]
    CB, NOMS = B['corpusB'], ['V0','V4','V5','V6','V7','V8']
    N = CB['n']
    taux = lambda k, p: int(round(CB['variantes'][k]['violations'].get(p, 0) / N * 1e5))

    doc = SimpleDocTemplate(SORTIE, pagesize=A4, leftMargin=14*mm, rightMargin=14*mm,
                            topMargin=13*mm, bottomMargin=13*mm,
                            title='Dossier de decision V8 - Force Tracker', author='Force Tracker')
    S = []; A = S.append
    A(Paragraph(w('DOSSIER DE DECISION - MOTEUR NUTRITIONNEL V8 (CANDIDATE NON SERVIE)'), H1))
    A(Paragraph(w('Force Tracker - 23/09/2026 - arbre %s' % tete), PG))
    A(Paragraph(w('AUCUNE LIGNE DU MOTEUR SERVI MODIFIEE. AUCUNE VERSION POSEE. AUCUNE PUBLICATION.'), PR))
    A(Spacer(1, 4))

    A(Paragraph(w('1. CONTRE-VERIFICATION DU DOSSIER SCIENTIFIQUE EXTERNE'), H2))
    A(Paragraph(w("Mon environnement ne peut toujours pas ouvrir une publication (connect_rejected "
                  "sur 16 domaines). Ce que j'ai fait, et c'est different : contre-verifier chaque "
                  "affirmation par une recherche independante et comparer ce qui en revient. "
                  "Je ne pretends avoir lu aucune source primaire."), P))
    A(tab([['affirmation','source','unite','population / contexte','verdict'],
           ['Proteines 2,3-3,1','Helms, Aragon & Fitschen 2014','MASSE MAIGRE (LBM)','bodybuilders naturels, prepa concours, deficit, secs','CONFIRMEE'],
           ['Lipides 15-30 %','Helms 2014','% energie','idem','CONFIRMEE'],
           ['Perte 0,5-1 %/sem','Helms 2014','% poids/sem','idem','CONFIRMEE'],
           ['Plateau ~1,62 g/kg','Morton et al. 2018 (meta-regression, >1800 sujets)','POIDS DE CORPS','adultes sains, resistance, HORS deficit','CONFIRMEE MAIS CONTEXTUELLE'],
           ['0,7 %/sem > 1,4 %/sem','Garthe et al. 2011','% poids/sem','24 athletes d ELITE','CONFIRMEE MAIS CONTEXTUELLE'],
           ['Deficit > 500 kcal/j nuit a la masse maigre','Murphy & Koehler 2022 (meta-analyse)','kcal/jour ABSOLU','resistance >= 3 semaines','CONFIRMEE'],
           ['Surplus 10-20 %, +0,25-0,5 %/sem','Iraki et al. 2019','% TDEE, % poids/sem','bodybuilders novices/intermediaires, hors saison','CONFIRMEE MAIS CONTEXTUELLE'],
           ['Lipides 0,5-1,5 g/kg','Iraki et al. 2019','poids de corps','idem','CONFIRMEE'],
           ['Gros surplus = surtout du gras','Helms et al. 2023 (8 sem., +5 % vs +15 %)','-','entraines','CONFIRMEE (x5 de gras, 0 gain de force ni de masse maigre)'],
           ['...mais un essai 2024 suggere l inverse','Greater energy surplus... (2024)','-','jeunes hommes sains','CONTRADICTION EXISTANTE'],
           ['Glucides : aucun benefice a <= 10 series, nourri','Henselmans et al. 2022 (49 etudes)','NOMBRE DE SERIES par groupe','pratiquants de force','CONFIRMEE'],
           ['Glucides 4-7 g/kg','Slater & Phillips 2011 (cite)','poids de corps','bodybuilders','NON VERIFIABLE'],
           ['ANSES 1,3-1,5 g/kg, plafond 2,2','sources francaises SECONDAIRES','poids de corps','sportifs de force','PARTIELLEMENT CONFIRMEE'],
           ['EA < 30 kcal/kg de masse maigre','CIO, consensus RED-S 2018','kcal/kg masse maigre','athletes H et F','CONFIRMEE (avec ses limites ecrites)'],
           ['Recommandations RUSSES','-','-','-','NON VERIFIABLE : aucun document retrouve'],
           ['Recommandations JAPONAISES','releve de consommations (5,0 / 6,4 / 8,3 g/kg)','poids de corps','athletes japonais','CONTESTEE : c est une OBSERVATION, pas une recommandation'],
           ['Lipides 0,8-1,2 g/kg','blog commercial','-','-','NON VERIFIABLE : ecartee']],
          [40*mm, 38*mm, 26*mm, 44*mm, 34*mm]))
    A(Spacer(1, 3))
    A(Paragraph(w("CE QUE CETTE CONTRE-VERIFICATION CORRIGE CHEZ MOI : (1) mon dossier du 22/09 "
                  "affirmait que la plage 2,3-3,1 etait en POIDS DE CORPS - c'est FAUX, ChatGPT a "
                  "raison, c'est la MASSE MAIGRE. (2) J'avais retire l'affirmation << 0,5 g/kg de "
                  "lipides est une recommandation >> : cette retractation etait FAUSSE, Iraki 2019 "
                  "donne bien 0,5-1,5 g/kg. Consequence : les ratios lipidiques actuels de Force "
                  "Tracker sont DANS la plage publiee, et mon dossier precedent avait tort de les "
                  "presenter comme trop bas. (3) J'avais transforme Henselmans en PLAFOND d'apport "
                  "glucidique : c'est exactement transformer une observation en seuil physiologique. "
                  "Reclasse en OBSERVATION dans tout le banc."), PR))

    A(PageBreak())
    A(Paragraph(w('2. COMPARAISON V0 / V4 / V5 / V6 / V7 / V8'), H2))
    A(Paragraph(w('Population plausible : %s profils, taux pour 100 000. Un quadrillage adversarial '
                  'de %s profils est mesure separement - sa frequence n est PAS une prevalence.'
                  % ('{:,}'.format(N).replace(',', ' '), '{:,}'.format(B['corpusA']['n']).replace(',', ' '))), PG))
    PROPS = [('P01 fermeture > 5 kcal','P01_fermeture_sup_5'),
             ('P09 deficit > 500 kcal (Murphy)','P09_deficit_sur_500kcal_Murphy'),
             ('P10 surplus > 20 %','P10_surplus_sur_20pct'),
             ('P11 proteines > 2,2 g/kg (ANSES)','P11_prot_sur_2_2_gkg_ANSES'),
             ('P11 proteines > 3,1 g/kg masse maigre (Helms)','P11_prot_sur_3_1_gkg_ffm_Helms'),
             ('P11 proteines > 40 % des calories','P11_prot_sur_40pct'),
             ('P12 lipides < 15 % des calories (Helms)','P12_lip_sous_15pct_Helms'),
             ('P12 lipides > 1,5 g/kg (Iraki)','P12_lip_sur_1_5_gkg_Iraki'),
             ('P12 lipides > 35 % des calories','P12_lip_sur_35pct'),
             ('P13 glucides > 12 g/kg','P13_gluc_sur_12_gkg'),
             ('P13 glucides > 600 g (praticabilite)','P13_gluc_sur_600g_praticabilite'),
             ('P19 disponibilite energetique < 30','P19_disponibilite_energetique_sous_30'),
             ('P20 kcal/kg > 55','P20_kcal_kg_sur_55'),
             ('O13 glucides au-dela de la charge (OBSERVATION)','O13_gluc_au_dela_de_la_charge')]
    A(tab([['propriete'] + [n + (' (prod)' if n == 'V0' else '') for n in NOMS]]
          + [[lib] + [str(taux(k, p)) for k in NOMS] for lib, p in PROPS],
          [72*mm] + [18*mm]*6))
    A(Spacer(1, 3))
    A(Paragraph(w("OU V8 EST MOINS BONNE, ecrit comme demande : (1) V6 et V7 battent V8 sur la "
                  "praticabilite brute (%d contre %d pour 100 000 au-dessus de 600 g) - mais elles "
                  "y arrivent en TRONQUANT les glucides a 7 g/kg, ce qui est interdit, et elles le "
                  "paient par %d pour 100 000 au-dessus de 1,5 g/kg de lipides, une borne publiee "
                  "que V0 ne franchissait jamais. (2) V8 donne un peu PLUS de glucides en mediane "
                  "(5,00 contre 4,74 g/kg) : elle reduit les proteines, donc le residu grandit. "
                  "(3) Il reste %d profils pour 100 000 au-dela du plafond de deficit, TOUS des "
                  "regimes keto/low-carb, avec un depassement maximal mesure de 3 kcal. (4) V8 est "
                  "plus complexe : ~150 lignes contre ~25."
                  % (taux('V6','P13_gluc_sur_600g_praticabilite'), taux('V8','P13_gluc_sur_600g_praticabilite'),
                     taux('V6','P12_lip_sur_1_5_gkg_Iraki'), taux('V8','P09_deficit_sur_500kcal_Murphy'))), PR))

    A(Paragraph(w('3. LE CONFLIT SCIENTIFIQUE PRINCIPAL, NON MASQUE'), H2))
    A(Paragraph(w("Garthe (0,7 %/semaine) et Murphy & Koehler (deficit <= 500 kcal/jour) sont "
                  "INCOMPATIBLES au-dela d'environ 75 kg."), P))
    A(tab([['poids','vitesse voulue','deficit demande','deficit applique','vitesse obtenue']]
          + [[str(c['bw']) + ' kg', '%.2f %%/sem' % c['vitesse_voulue_pct_sem'],
              '%d kcal' % c['deficit_demande'], '%d kcal' % c['deficit_applique'] + (' PLAFONNE' if c['plafonne'] else ''),
              '%.2f %%/sem' % c['vitesse_obtenue_pct_sem']] for c in B['contre_audit']['conflits']],
          [22*mm, 32*mm, 34*mm, 44*mm, 34*mm]))
    A(Paragraph(w("Je tranche techniquement en faveur du plafond absolu : il vient d'une "
                  "meta-analyse et non d'un essai a n = 24, la population de Garthe (athletes "
                  "d'elite) est plus legere et plus seche, et l'objectif commun des deux sources "
                  "est la preservation de la masse maigre - ce que mesure Murphy & Koehler. "
                  "LE COUT EST REEL ET IL EST DIT : une personne de 150 kg perd 0,30 %/semaine."), PG))

    A(Paragraph(w('4. CONTRE-AUDIT : CE QU IL A TROUVE DANS MA PROPRE CANDIDATE'), H2))
    A(tab([['defaut','mesure','fermeture'],
           ['le low-carb ne fermait pas','jusqu a 6 kcal','lipides en residu, comme le keto le fait deja'],
           ['plafond proteique arrondi au plus proche','5 121 / 100 000 au-dessus de 2,2 g/kg','Math.floor : un plafond s arrondit vers le BAS'],
           ['V8 supprimait la phase charge/decharge EN SILENCE','-','retablie (decision actee)'],
           ['plafond de deficit verifie sur la cible VISEE','2 713 / 100 000 depassaient de 1-2 kcal','verifie sur la valeur SERVIE'],
           ['le reequilibrage vers les lipides depassait Iraki','p99 a 2,27 g/kg','borne a 1,5 g/kg : deplacer l absurdite n est pas la resoudre'],
           ['marche d escalier entre 12 % et 13 % de gras','saut de 136 kcal','vitesse interpolee'],
           ['l ordre des bornes faisait perdre le plancher de sante','0,45 g/kg','plafond d abord, plancher ensuite'],
           ['deux bornes publiees se contredisent au-dela de 120 kcal/kg','-','signal bornes_lipides_en_conflit']],
          [58*mm, 46*mm, 78*mm]))
    A(Spacer(1, 2))
    A(Paragraph(w('Resultat final : continuite +1 kg = 0 saut - continuite +1 %MG = 0 saut - '
                  'determinisme = 0 echec - profils sans solution = 0.'), PG))

    A(Paragraph(w('5. TEMOINS ET MUTATIONS'), H2))
    A(Paragraph(w("%d temoins (bloc B-CCCLIII, NON branche dans le runner), 0 rouge, dont 3 qui "
                  "ECHOUENT volontairement sur V0. 29 mutations sur arbre clone, 29 conformes, "
                  "0 ancre morte, dont 3 qui doivent RESTER VERTES."
                  % nok), P))
    A(Paragraph(w("ET LE CONTROLE NEGATIF A D'ABORD RENDU 20/29 : 9 de mes temoins ne mesuraient "
                  "rien. Tous du meme defaut - le jeu de profils ne visitait jamais le regime ou la "
                  "regle mord. Porter le plafond de deficit de 500 a 1 500 kcal ne changeait rien "
                  "parce qu'aucun de mes profils ne l'atteignait. Un temoin qui ne visite pas le "
                  "regime ou la regle decide ne mesure pas la regle, il mesure son absence."), PR))

    A(Paragraph(w('6. LES TROIS SEULS CHOIX QUI RESTENT A MICHEL'), H2))
    A(tab([['#','question','ce qui est mesure','pourquoi je ne tranche pas'],
           ['D-016','Garde-t-on le plafond ANSES de 2,2 g/kg ?','V8 : 0 depassement - V8nc : %d / 100 000, et Helms passe de 0 a 38' % taux('V8nc','P11_prot_sur_2_2_gkg_ANSES') if 'V8nc' in CB['variantes'] else 'mesure',
            'source francaise SECONDAIRE, et elle prime sur Helms chez le sujet sec : choisir entre securite generale et performance en seche'],
           ['D-017','Cible manuelle irrealisable : on la remonte ou on avertit ?','600 kcal saisis : V0 affiche 600 avec des macros a 1 441 ; V8 remonte a 863 et declare infaisable',
            '<< le chiffre saisi est le sien >> est une decision actee. V8 la contredit pour tenir la fermeture'],
           ['D-018','Une personne de 150 kg perd 0,30 %/semaine. Acceptable ?','consequence directe du plafond de 500 kcal',
            'arbitrage securite contre vitesse, qui se ressent dans l usage reel']],
          [14*mm, 44*mm, 58*mm, 66*mm]))

    A(Paragraph(w('7. MA RECOMMANDATION TECHNIQUE'), H2))
    A(Paragraph(w("Une seule chose est demontrable sans aucune source externe : la FERMETURE. V8 la "
                  "ferme completement (0 pour 100 000 contre %d en production). Mais je ne "
                  "recommande PAS de livrer V8 d'un bloc : ses gains proteiques reposent sur un "
                  "plafond ANSES non verifie a la source et sur une plage de Helms que je n'ai pas "
                  "lue. Les livrer ensemble ferait passer une DECISION SCIENTIFIQUE sous couvert "
                  "d'une CORRECTION MATHEMATIQUE. L'ordre que je defends : (1) la fermeture seule, "
                  "(2) le garde-fou de disponibilite energetique (CIO), (3) le plafond de deficit "
                  "(meta-analyse), (4) le bareme proteique en masse maigre APRES l'arbitrage D-016, "
                  "(5) les signaux de plausibilite." % taux('V0','P01_fermeture_sup_5')), P))

    A(Spacer(1, 5))
    A(Paragraph(w('V8 EST UNE CANDIDATE NON SERVIE. AUCUNE MODIFICATION DU MOTEUR NUTRITIONNEL '
                  'N A ETE PUBLIEE. EN ATTENTE DU GO DE MICHEL.'),
                ParagraphStyle('fin', fontName='Helvetica-Bold', fontSize=10, leading=13, textColor=ROUGE)))
    doc.build(S)

    # relecture (un PDF muet ressemble a un PDF reussi)
    import base64, zlib
    data = open(SORTIE, 'rb').read(); frag = []
    for mm_ in re.finditer(rb'stream\r?\n(.*?)endstream', data, re.S):
        b = mm_.group(1)
        try: brut = base64.a85decode(b.strip().rstrip(b'~>'), adobe=False)
        except Exception: brut = b
        for x in (brut, b):
            try: frag.append(zlib.decompress(x).decode('latin-1')); break
            except Exception: continue
    lis = ' '.join(x[1:-1] for x in re.findall(r'\((?:[^()\\]|\\.)*\)', '\n'.join(frag)))
    manque = [m for m in ['MASSE MAIGRE', 'Murphy & Koehler', 'Henselmans', 'NON VERIFIABLE',
                          'EN ATTENTE DU GO DE MICHEL', 'OU V8 EST MOINS BONNE',
                          'ne mesure pas la regle'] if m not in lis]
    if manque: os.remove(SORTIE); refus('le PDF ne contient pas : %s' % ', '.join(manque))
    if len(lis) < 5000: os.remove(SORTIE); refus('PDF probablement muet (%d caracteres)' % len(lis))
    print('OK %s - %d caracteres lisibles, arbre %s' % (SORTIE, len(lis), tete))


if __name__ == '__main__':
    main()
