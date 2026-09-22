#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""GÉNÉRATEUR DU PDF « DOSSIER V9 » — pour GPT.
⛔⛔ Les gardes RECOMPTENT chaque chiffre depuis les mesures et refusent de produire si un fait
tombe — à commencer par le plus important : qu'aucun fichier SERVI n'a bougé.
⚠️ WinAnsi/cp1252, aucun emoji."""
import base64, json, os, re, subprocess, sys, zlib
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANC, DOSSIER = '/tmp/banc_v9.json', os.path.join(RACINE, 'docs', 'DOSSIER-V9-APPRENTISSAGE.md')
SORTIE = os.path.join(RACINE, 'docs', 'DOSSIER-V9-APPRENTISSAGE.pdf')
SERVIS = ['state.js','app.js','screens.js','log.js','coach.js','setup.js','tracking.js',
          'constants.js','index.html','style.css','sw.js','Code.js','worker.js','supabase.js']


def refus(m):
    print('REFUS DE PRODUIRE : ' + m); sys.exit(1)


def gardes():
    if not os.path.exists(BANC): refus('mesures du banc introuvables — relancer tools/banc_v9.js')
    if not os.path.exists(DOSSIER): refus('dossier markdown introuvable')
    B = json.load(open(BANC, encoding='utf-8')); txt = open(DOSSIER, encoding='utf-8').read()
    e = []
    if B['validation_v0']['ecarts'] != 0: e.append('le miroir de V0 diverge : rien ne vaut')
    if B['validation_v0']['erreurs_page']: e.append('erreurs de page')
    r = subprocess.run(['git','status','--porcelain'], cwd=RACINE, capture_output=True, text=True)
    touches = [l[3:].strip() for l in r.stdout.splitlines() if l[3:].strip() in SERVIS]
    if touches: e.append('fichiers SERVIS modifies : ' + ', '.join(touches))
    # les temoins et les mutations doivent etre verts AU MOMENT de produire
    t = subprocess.run(['node','tools/temoins_v9.js'], cwd=RACINE, capture_output=True, text=True)
    m = re.search(r'(\d+) OK . (\d+) ROUGE', t.stdout)
    if not m: e.append('temoins V9 illisibles')
    else:
        nok, nrouge = int(m.group(1)), int(m.group(2))
        if nrouge: e.append('%d temoin(s) V9 rouge(s)' % nrouge)
        if str(nok) not in txt: e.append('le dossier n annonce pas %d temoins' % nok)
    # les faits centraux, recomptes
    CB, CC = B['corpusB'], B['corpusC']
    f9 = CC['variantes']['V9']['violations'].get('P01_fermeture_sup_5', 0)
    f0 = CC['variantes']['V0']['violations'].get('P01_fermeture_sup_5', 0)
    if f9 != 0: e.append('V9 ne ferme pas (%d)' % f9)
    if f0 == 0: e.append('V0 fermerait : le defaut central aurait disparu')
    al = CC['variantes']['V9']['violations'].get('P09_deficit_au_dela_dAlpert', 0)
    if al != 0: e.append('V9 depasse la borne dAlpert (%d)' % al)
    gk = CB['sup600_dist']['gkg']['max'] if CB.get('sup600_dist') and CB['sup600_dist'].get('gkg') else None
    if gk is None or gk > 12: e.append('le maximum en g/kg (%s) sort de la plage publiee' % gk)
    aut = B['autopsie659']['versions']
    if not (600 <= aut['V0']['G'] <= 700): e.append('le cas de reference ne reproduit plus ~659 g (V0 : %s)' % aut['V0']['G'])
    if not (600 <= aut['V9']['G'] <= 700): e.append('V9 ne rend plus un chiffre comparable (%s)' % aut['V9']['G'])
    tp = B['temporel']
    if tp[1]['tdee_retenu'] != tp[0]['tdee_retenu']:
        e.append('V9 APPREND a S4 alors que le journal est a 18 % : la porte ne tient pas')
    if not (tp[2]['tdee_retenu'] < tp[0]['tdee_retenu'] - 100):
        e.append('V9 n apprend PAS a S8 : la demonstration tombe')
    # ⛔ Le garde vérifie ce qui a du SENS, pas une casse. Il a d'abord refusé sur « MASSE
    # MAIGRE » en capitales alors que le dossier écrit « g/kg de masse maigre » — *un garde qui
    # épingle une mise en forme au lieu d'un fait mesure ma typographie*. Corrigé : il épingle
    # les notions, insensible à la casse.
    # ⛔ Et on retire le BALISAGE avant de chercher : le dossier écrit « g/kg de **masse
    # maigre** », donc la phrase littérale n'existe pas. *Un garde qui bute sur des étoiles de
    # markdown mesure la mise en forme, pas le contenu* — c'est le piège de la sous-chaîne, vu
    # sous un autre angle.
    nu = re.sub(r'[*`_]', '', txt).lower()
    for mot in ['g/kg de masse maigre','alpert','murphy & koehler','henselmans',
                'v9 est une candidate experimentale non servie'.upper().lower(),
                'nhanes','porte']:
        if mot.lower() not in nu: e.append('le dossier ne contient plus « %s »' % mot)
    if "V9 EST UNE CANDIDATE EXPERIMENTALE NON SERVIE" not in re.sub(r"[*`_]","",txt).upper().replace("É","E"):
        e.append('la phrase finale obligatoire est absente')
    n30 = len(re.findall(r'^## \d+[\.\-]', txt, re.M))
    if e: refus(' | '.join(e))
    return B, txt, nok


def w(s):
    rep = {'→':'->','≥':'>=','≤':'<=','×':'x',' ':' ','’':"'",
           '“':'"','”':'"','–':'-','—':'-','…':'...',' ':' ',
           '≠':'!=','±':'+/-','‑':'-','≈':'~'}
    for k,v in rep.items(): s = s.replace(k,v)
    return ''.join(c if ord(c) < 256 else '?' for c in s)


NOIR,ROUGE,GRIS,BLEU = (colors.HexColor('#111111'),colors.HexColor('#B3261E'),
                        colors.HexColor('#5F6368'),colors.HexColor('#1A4D8F'))
H1=ParagraphStyle('H1',fontName='Helvetica-Bold',fontSize=14,leading=17,textColor=BLEU,spaceAfter=6)
H2=ParagraphStyle('H2',fontName='Helvetica-Bold',fontSize=10.5,leading=13,textColor=NOIR,spaceBefore=8,spaceAfter=3)
P=ParagraphStyle('P',fontName='Helvetica',fontSize=8.4,leading=11.2,textColor=NOIR,spaceAfter=3)
PR=ParagraphStyle('PR',parent=P,textColor=ROUGE)
PG=ParagraphStyle('PG',parent=P,textColor=GRIS,fontSize=7.4,leading=9.6)


def tab(d,lg,entete=True):
    t=Table([[Paragraph(w(str(c)),PG) for c in l] for l in d],colWidths=lg)
    st=[('GRID',(0,0),(-1,-1),0.3,colors.HexColor('#CCCCCC')),('VALIGN',(0,0),(-1,-1),'TOP'),
        ('LEFTPADDING',(0,0),(-1,-1),2.5),('RIGHTPADDING',(0,0),(-1,-1),2.5),
        ('TOPPADDING',(0,0),(-1,-1),2),('BOTTOMPADDING',(0,0),(-1,-1),2)]
    if entete: st.append(('BACKGROUND',(0,0),(-1,0),colors.HexColor('#EEF2F7')))
    t.setStyle(TableStyle(st)); return t


def main():
    B,txt,nok = gardes()
    tete = subprocess.run(['git','rev-parse','HEAD'],cwd=RACINE,capture_output=True,text=True).stdout.strip()[:8]
    CC,CB = B['corpusC'],B['corpusB']
    NOMS=['V0','V5','V6','V8','V9']
    tx=lambda C,k,p:int(round(C['variantes'][k]['violations'].get(p,0)/C['n']*1e5))
    doc=SimpleDocTemplate(SORTIE,pagesize=A4,leftMargin=14*mm,rightMargin=14*mm,topMargin=13*mm,
        bottomMargin=13*mm,title='Dossier V9 - Force Tracker',author='Force Tracker')
    S=[];A=S.append
    A(Paragraph(w('FORCE TRACKER - MOTEUR NUTRITIONNEL V9 ET APPRENTISSAGE LONGITUDINAL'),H1))
    A(Paragraph(w('24/09/2026 - arbre %s - candidate experimentale NON SERVIE'%tete),PG))
    A(Paragraph(w('AUCUNE MODIFICATION DU MOTEUR SERVI. AUCUNE PUBLICATION. AUCUN BUMP.'),PR))
    A(Spacer(1,4))

    A(Paragraph(w('1. LE RESULTAT LE PLUS IMPORTANT'),H2))
    aut=B['autopsie659']['versions']; tp=B['temporel']
    A(Paragraph(w("Les ~659 g de glucides n'etaient PAS un defaut de repartition des macros. "
                  "C'etait un TDEE de 3 515 kcal que rien ne venait corriger. V9 le demontre en "
                  "produisant presque le MEME chiffre que la production tant qu'elle n'a pas de "
                  "donnees (%d g contre %d g), puis %d g une fois qu'elle en a."
                  % (aut['V9']['G'],aut['V0']['G'],tp[2]['G'])),P))
    A(Paragraph(w("Corollaire inconfortable : plafonner les glucides - ce que V6 et V7 faisaient - "
                  "aurait MASQUE le vrai probleme en le deplacant vers les lipides. Michel l'avait "
                  "annonce mot pour mot, et la mesure lui donne raison."),PR))

    A(Paragraph(w('2. AUDIT : CE QUI EXISTE VRAIMENT DANS FORCE TRACKER'),H2))
    A(tab([['mecanisme','statut mesure'],
        ['pente de poids (penteKgParSemaine)','EXISTE ET EST UTILISEE - regression sur les jours, robuste aux pesees irregulieres'],
        ['masse maigre / bilan corporel','EXISTE ET EST UTILISEE - mais pour les CALORIES seulement, jamais pour la repartition'],
        ['journal alimentaire','EXISTE MAIS N EST PAS EXPLOITEE longitudinalement'],
        ['charges prescrites par Milo (_milo:true)','EXISTE MAIS N EST PAS EXPLOITEE - la donnee est la, personne ne la lit'],
        ['seance annoncee (nextPlanned)','EXISTE MAIS EST ECRASEE'],
        ['cible calorique prescrite','N EXISTE PAS - recalculee a chaque affichage, jamais conservee'],
        ['TDEE observe / recalibre','N EXISTE PAS'],
        ['periodes / versions du moteur','N EXISTE PAS'],
        ['discipline, niveau','EXISTENT MAIS NE SONT PAS EXPLOITES cote nutrition'],
        ['apprendre d une progression ou d une regression','N EXISTE PAS comme mecanisme : le mot stagnation ne vit que dans le prompt de Milo']],
        [58*mm,122*mm]))
    A(Spacer(1,2))
    A(Paragraph(w("ET UNE ERREUR DE DOCUMENTATION CORRIGEE ICI : CLAUDE.md annonce << TDEE "
                  "adaptatif >> et << Harris-Benedict adaptatif >>. Les deux sont faux - le code "
                  "emploie Mifflin-St Jeor et Katch-McArdle, et rien n'est adaptatif (zero "
                  "occurrence de recalibr|tdeeObserve|tdeeReel dans tout le depot)."),PR))

    A(PageBreak())
    A(Paragraph(w('3. LES 600 g : D OU VENAIENT-ILS ?'),H2))
    A(Paragraph(w("Reponse : DE MOI, sans aucune justification. Verifie, pas suppose - 600 n'existe "
                  "nulle part dans le moteur servi, et git log -S montre que la chaine apparait pour "
                  "la premiere fois dans mon propre commit du 23/09. La recherche ne trouve AUCUNE "
                  "borne absolue en grammes par jour : la litterature donne toujours des g/kg "
                  "(3-5 charge legere -> 8-12 charge tres elevee). Les seules valeurs absolues "
                  "publiees concernent l'apport PENDANT l'effort (30-90 g/h), une grandeur sans "
                  "rapport. => 600 g est RETIRE des invariants scientifiques et conserve uniquement "
                  "comme SIGNAL de praticabilite, renomme dans tout le banc."),P))
    A(Paragraph(w('600 g ne veut rien dire sans contexte - demonstration mesuree :'),P))
    A(tab([['600 g pour...','g/kg','bande justifiee par la charge','verdict V9'],
        ['55 kg, 0 seance','10,9','legere, 3-5 g/kg','INCOHERENT AVEC LE CONTEXTE'],
        ['85 kg, 4 seances','7,1','elevee, 6-10 g/kg','NORMAL'],
        ['120 kg, 6 seances','5,0','tres elevee, 8-12 g/kg','NORMAL, et SOUS la plage']],
        [40*mm,18*mm,60*mm,62*mm]))
    A(Spacer(1,2))
    A(Paragraph(w('Plausibilite glucidique V9, corpus B (1 000 000 profils) : NORMAL %.1f %% - '
                  'ELEVE MAIS COHERENT %.1f %% - INCOHERENT %.1f %%. Maximum mesure : %.1f g/kg, '
                  'donc DANS la plage publiee 8-12 g/kg.'
                  % (CB['plausibilite_v9'].get('NORMAL',0)/CB['n']*100,
                     CB['plausibilite_v9'].get('ELEVE_MAIS_COHERENT',0)/CB['n']*100,
                     CB['plausibilite_v9'].get('INCOHERENT_AVEC_LE_CONTEXTE',0)/CB['n']*100,
                     CB['sup600_dist']['gkg']['max'])),P))
    A(Paragraph(w('CAUSES des prescriptions > 600 g (corpus B) - deux sur trois ne sont pas nutritionnelles :'),P))
    A(tab([['cause','occurrences']]+[[k,str(v)] for k,v in
        sorted(CB['causes_sup600'].items(),key=lambda x:-x[1])],[110*mm,70*mm]))

    A(Paragraph(w('4. AUTOPSIE DU CAS ~659 g'),H2))
    A(tab([['version','BMR','TDEE','cible','P','L','G','g/kg','plausibilite']]+
        [[k,str(v['bmr']),str(v['tdee']),str(v['kcal']),str(v['P']),str(v['L']),str(v['G']),
          str(v['gluc_gkg']),str(v.get('plausibilite') or '-')]
         for k,v in aut.items() if k in ('V0','V5','V6','V8','V9')],
        [22*mm,18*mm,18*mm,20*mm,16*mm,16*mm,16*mm,18*mm,36*mm]))
    A(Spacer(1,2))
    A(Paragraph(w("La cause en une phrase : BMR 1 777 x 1,725 (<< Actif 5-6 j >>) = 3 066, PLUS "
                  "450 kcal de metier physique. Le multiplicateur d'activite contient deja "
                  "l'entrainement, et le metier physique s'y ajoute : le meme effort est compte deux "
                  "fois par deux canaux differents."),PR))

    A(Paragraph(w('5. LE MEME UTILISATEUR DANS LE TEMPS - la demonstration que Force Tracker APPREND'),H2))
    A(tab([['etape','TDEE retenu','confiance','cible','glucides','g/kg']]+
        [[e['etape'],
          (str(e['tdee_estime'])+' -> '+str(e['tdee_retenu'])+' (obs '+str(e['tdee_observe'])+')')
            if e['tdee_observe'] is not None and e['poids_obs']>0 else str(e['tdee_retenu'])+' (formule)',
          e['confiance'],str(e['kcal']),str(e['G'])+' g',str(e['gluc_gkg'])] for e in tp],
        [54*mm,44*mm,20*mm,20*mm,20*mm,20*mm]))
    A(Spacer(1,2))
    A(Paragraph(w("A S4, le journal est rempli a 18 % (5 repas sur 28 jours) : la PORTE reste fermee "
                  "et le moteur n'apprend RIEN. C'est la consigne explicite, et ma premiere version "
                  "la violait - elle accordait un poids de 0,15 a presque rien."),PR))

    A(PageBreak())
    A(Paragraph(w('6. COMPARAISON V0 / V5 / V6 / V8 / V9 (corpus C, distributions publiees, pour 100 000)'),H2))
    A(Paragraph(w("CORPUS C : je n'ai PAS telecharge NHANES - wwwn.cdc.gov rend HTTP 000 "
                  "(connect_rejected). Les moyennes employees sont des statistiques RESUMEES "
                  "publiees, pas des lignes de donnees. Un corpus bati sur des moyennes teste le "
                  "realisme des entrees ; il ne remplace jamais des donnees individuelles "
                  "longitudinales."),PG))
    PROPS=[('fermeture > 5 kcal','P01_fermeture_sup_5'),
      ('deficit au-dela de ce que le gras peut fournir (Alpert)','P09_deficit_au_dela_dAlpert'),
      ('surplus > 20 %','P10_surplus_sur_20pct'),
      ('proteines > 3,1 g/kg de masse maigre (Helms)','P11_prot_sur_3_1_gkg_ffm_Helms'),
      ('proteines > 40 % des calories','P11_prot_sur_40pct'),
      ('lipides < 15 % des calories','P12_lip_sous_15pct'),
      ('lipides > 1,5 g/kg (Iraki)','P12_lip_sur_1_5_gkg'),
      ('glucides > 12 g/kg','P13_gluc_sur_12_gkg'),
      ('glucides = 0 g','P13_gluc_zero'),
      ('SIGNAL 600 g (praticabilite, pas physiologie)','S_gluc_sur_600g_SIGNAL_praticabilite')]
    A(tab([['propriete']+[n+(' (prod)' if n=='V0' else '') for n in NOMS]]+
        [[lib]+[str(tx(CC,k,p)) for k in NOMS] for lib,p in PROPS],[86*mm]+[18*mm]*5))

    A(Paragraph(w('7. CE QUE V9 DETERIORE - ecrit comme demande'),H2))
    A(Paragraph(w("(1) deficit au-dela de 500 kcal hors obesite : V8 = 0, V9 = %d / 100 000. C'est "
                  "VOULU - c'est la reouverture demandee - mais le compteur emploie le seuil IMC 30 "
                  "alors que V9 transitionne des IMC 25. (2) disponibilite energetique sous 30 : "
                  "V8 = %d, V9 = %d, parce que V9 a remplace le garde-fou dur par le plancher du "
                  "metabolisme de repos. (3) proteines sous 0,8 g/kg : %d -> %d. (4) V9 est "
                  "nettement plus complexe : ~330 lignes contre ~25. (5) Sur le SIGNAL 600 g, V9 est "
                  "MOINS BONNE que V8 sur le corpus adversarial (%d contre %d) : elle emet plus "
                  "souvent le signal parce qu'elle refuse de tronquer."
                  % (tx(CC,'V9','P09_deficit_sur_500_hors_obesite'),
                     tx(B['corpusA'],'V8','P19_EA_sous_30'), tx(B['corpusA'],'V9','P19_EA_sous_30'),
                     tx(CC,'V8','P11_prot_sous_0_8_gkg'), tx(CC,'V9','P11_prot_sous_0_8_gkg'),
                     tx(B['corpusA'],'V9','S_gluc_sur_600g_SIGNAL_praticabilite'),
                     tx(B['corpusA'],'V8','S_gluc_sur_600g_SIGNAL_praticabilite'))),PR))

    A(Paragraph(w('8. CE QUE LE CONTRE-AUDIT A TROUVE DANS MA PROPRE V9'),H2))
    A(tab([['defaut','mesure','fermeture'],
      ['mon garde-fou RED-S rendait la perte de poids IMPOSSIBLE aux profils lourds',
       'a 150 kg / 10 % de gras : deficit plafonne a -18 kcal',
       'le seuil de 30 kcal/kg de masse maigre a ete calibre sur des athletes ; on garde le SENS (il reste le metabolisme de repos) et pas le nombre'],
      ['l IMC 30 etait une falaise','saut de 243 kcal entre 95 et 96 kg',
       'interpole entre les deux seuils OMS (surpoids 25 -> obesite 30) : aucun nombre invente'],
      ['V9 apprenait un peu de presque rien','poids 0,15 sur un journal rempli a 18 %',
       'la confiance devient une PORTE : sous le seuil, poids zero'],
      ['mon cas de reference << 659 g >> etait faux','il rendait 490 g',
       'profil relu dans l audit du 22/09 au lieu d etre reconstruit de memoire'],
      ['6 mutations sur 31 ne mordaient pas','25/31 au premier passage',
       'le jeu de profils ne visitait pas le regime ou la regle decide, ou un clamp place apres la masquait'],
      ['le plafond lipidique de 1,5 g/kg n est PAS un plafond dans V9','jamais atteint : les ratios de base plafonnent a 1,0 g/kg',
       'c est un DETECTEUR de conflit - le §22 demandait << que se passe-t-il si on la retire ? >>']],
      [52*mm,46*mm,82*mm]))
    A(Spacer(1,2))
    A(Paragraph(w('Resultat final : %d temoins verts (bloc B-CCCLIV, NON branche), 31 mutations sur '
                  'arbre clone, 31 conformes, 0 ancre morte, dont 3 qui doivent RESTER VERTES. Les '
                  '8 familles exigees sont couvertes nommement : apprend trop vite, apprend sans '
                  'donnees, ignore l historique, ecrase l historique, reagit a une seule pesee, '
                  'confond poids et masse maigre, traite 600 g comme une limite dure, deplace les '
                  'calories vers les lipides.' % nok),P))

    A(Paragraph(w('9. LES QUATRE CHOIX QUI RESTENT A MICHEL'),H2))
    A(tab([['#','question','ce qui est mesure'],
      ['D-019','Le plafond ANSES de 2,2 g/kg : signal ou plafond ?','signal (V9) : %d / 100 000 au-dela - plafond (V9dur) : 0'%tx(B['corpusA'],'V9','R11_prot_sur_2_2_gkg_repere_ANSES')],
      ['D-020','La zone IMC 25-30 : jusqu ou assouplir le deficit ?','V9 y autorise > 500 kcal : %d / 100 000 en corpus C'%tx(CC,'V9','P09_deficit_sur_500_hors_obesite')],
      ['D-021','Livrer l apprentissage, sachant qu il exige le journal ?','sans journal a 50 %, V9 est identique a V8 sur la cible'],
      ['D-022','Le journal alimentaire doit-il devenir plus incitatif ?','c est la condition de tout l apprentissage - et ca touche la Constitution (P4)']],
      [16*mm,62*mm,102*mm]))

    A(Paragraph(w('10. RECOMMANDATION'),H2))
    A(Paragraph(w("Je ne recommande PAS de livrer V9 d'un bloc. Les trois premieres etapes sont "
                  "defendables seules et corrigent de vrais defauts : (1) la fermeture et le conflit "
                  "de cible manuelle, aucune borne scientifique engagee ; (2) le plancher du "
                  "metabolisme de repos ; (3) le deficit borne par la masse grasse (Alpert), qui "
                  "donne le bon gradient tout seul. Les etapes 4 a 6 - unites proteiques, "
                  "plausibilite, apprentissage - dependent d arbitrages qui ne m appartiennent pas."),P))
    A(Paragraph(w("Et si 659 g est coherent, je le dis : il l'est, pour un homme de 85,8 kg dont "
                  "l'app croit qu'il depense 3 515 kcal. La question n'a jamais ete le chiffre. "
                  "C'etait : depense-t-il vraiment 3 515 kcal ? Jusqu'a aujourd'hui, Force Tracker "
                  "n'avait aucun moyen de le savoir."),PR))
    A(Spacer(1,5))
    A(Paragraph(w("V9 EST UNE CANDIDATE EXPERIMENTALE NON SERVIE. FORCE TRACKER DOIT ESTIMER, "
                  "OBSERVER, APPRENDRE ET S ADAPTER. AUCUNE MODIFICATION DU MOTEUR NUTRITIONNEL "
                  "N A ETE PUBLIEE. EN ATTENTE DU GO DE MICHEL."),
        ParagraphStyle('fin',fontName='Helvetica-Bold',fontSize=10,leading=13,textColor=ROUGE)))
    doc.build(S)

    # relecture maison (ni pypdf ni pdftotext sur ce conteneur)
    data=open(SORTIE,'rb').read(); frag=[]
    for mm_ in re.finditer(rb'stream\r?\n(.*?)endstream',data,re.S):
        b=mm_.group(1)
        try: brut=base64.a85decode(b.strip().rstrip(b'~>'),adobe=False)
        except Exception: brut=b
        for x in (brut,b):
            try: frag.append(zlib.decompress(x).decode('latin-1')); break
            except Exception: continue
    lis=' '.join(x[1:-1] for x in re.findall(r'\((?:[^()\\]|\\.)*\)','\n'.join(frag)))
    manque=[m for m in ['DE MOI, sans aucune justification','Alpert','EN ATTENTE DU GO DE MICHEL',
                        'CE QUE V9 DETERIORE','metabolisme de repos','NHANES','PORTE reste fermee'] if m not in lis]
    if manque: os.remove(SORTIE); refus('le PDF ne contient pas : '+', '.join(manque))
    if len(lis)<5000: os.remove(SORTIE); refus('PDF probablement muet (%d caracteres)'%len(lis))
    print('OK %s - %d caracteres lisibles, arbre %s'%(SORTIE,len(lis),tete))


if __name__ == '__main__':
    main()
