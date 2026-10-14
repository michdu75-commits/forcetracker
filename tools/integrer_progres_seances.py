#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""INTÉGRATION DIFFÉRÉE — PROGRES-SEANCES-01 → tests/parcours/runner.js et tests/recette/registre.json.

POURQUOI CE N'EST PAS DÉJÀ DANS CES FICHIERS : le 14/10/2026, ils étaient en cours de modification par le LOT 0
Nutrition (claude/nut-lot0-contrat). La mission interdisait d'y toucher (cohabitation) : le correctif est donc
livré comme un OUTIL, à exécuter UNE fois par la session qui intègre en dernier, après le LOT 0.

CE QU'IL FAIT (R30 — chaque témoin garde sa garantie, sur le nouvel invariant ; aucun n'est assoupli) :
  ① réécrit 8 blocs du runner qui supposaient l'ancienne organisation de Progrès (historique dans « Exercices »,
     20 cartes visibles, volume affiché sur 14 jours) : XIII, CXLV, CLXIV, CLXIX, CLXXII, CLXXIII, CCXXVI ter,
     CCXXXIX — et durcit les 3 témoins qui restaient VERTS SANS RIEN MESURER après le déplacement (CLXXII ①,
     CLXXIII ④, CCXXVI ter « 0 kg ») ;
  ② enregistre le banc B-PS01 (tests/parcours/progres_seances.js) dans le runner ;
  ③ ajoute le banc et le scénario PROGRES-SEANCES-01 au registre de recette.
MESURÉ AVANT LIVRAISON (sur une copie, runner réduit aux 8 blocs) : branche 57 ✅ / 15 ❌ avant → 73 ✅ / 0 ❌ après ;
code de master : 14 ❌ (les nouveaux invariants n'y existent pas) ; 5 mutations du code : 5/5 attrapées.
Chaque ancre doit exister UNE fois : sinon l'outil s'arrête sans rien écrire (le runner a bougé — relire).
Usage : python3 tools/integrer_progres_seances.py            (écrit)
        python3 tools/integrer_progres_seances.py --verifier  (n'écrit rien, dit si chaque ancre est trouvée)
"""
import json, os, sys
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RUNNER = os.path.join(RACINE, 'tests', 'parcours', 'runner.js')
REGISTRE = os.path.join(RACINE, 'tests', 'recette', 'registre.json')
VERIF = '--verifier' in sys.argv
s = open(RUNNER, encoding='utf-8').read()
if 'progres_seances.js' in s:
    print('déjà intégré (le runner appelle progres_seances.js) — rien à faire'); sys.exit(0)


def rep(a, b, n=1):
    global s
    c = s.count(a)
    if c != n:
        print("⛔ ANCRE introuvable ou multiple (x%d) — rien n'est écrit :\n   %s" % (c, a[:110])); sys.exit(2)
    s = s.replace(a, b)


OUVRIR = "(S.sessions||[]).forEach(x=>_sessOuvrir([_sessMoisDe(x)]));"

# ── XIII : l'historique est rangé par mois (repliés) → on déplie avant de lire ──
rep("""    goScreen('progress'); renderSessions();
    const liste=document.getElementById('sess-list').innerText;""",
"""    /* 🗂️ PROGRES-SEANCES-01 (R30) : l'historique est rangé par année puis par mois, mois REPLIÉS par défaut.
       On déplie les mois des séances avant de lire la liste — la garantie (la durée se lit sur la carte) est la même. */
    goScreen('progress'); """+OUVRIR+""" renderSessions();
    const liste=document.getElementById('sess-list').innerText;""")

# ── CXLV : la synthèse vit dans « Séances » — masquée sur Exercices, Poids, Badges ; revient intacte sur Séances ──
rep("""    o.masqueeHorsExo=!_vuSynth();
    switchProgTab('exo',document.getElementById('ptab-exo'));
    await new Promise(r=>setTimeout(r,250));
    o.surviteOnglet=""",
"""    o.masqueeHorsExo=!_vuSynth();
    /* 🗂️ PROGRES-SEANCES-01 (R30, décision de Michel du 14/10) : la carte a quitté « Exercices » pour « Séances ».
       Même garantie, sur son nouvel onglet : masquée ailleurs (Exercices COMPRIS), et elle revient intacte. */
    switchProgTab('exo',document.getElementById('ptab-exo'));
    await new Promise(r=>setTimeout(r,250));
    o.masqueeSurExo=!_vuSynth();
    switchProgTab('seances',document.getElementById('ptab-seances'));
    await new Promise(r=>setTimeout(r,250));
    o.surviteOnglet=""")
rep("""    t('⛔ elle est MASQUÉE hors de l\\'onglet Exercices (Poids et Badges parlent d\\'autre chose)',
      G.masqueeHorsExo===true, 'masquée = '+G.masqueeHorsExo);
    t('⛔ … et elle REVIENT intacte quand on retourne sur Exercices (elle ne se perd pas)',""",
"""    t('⛔ elle est MASQUÉE hors de l\\'onglet Séances (Exercices, Poids et Badges parlent d\\'autre chose)',
      G.masqueeHorsExo===true && G.masqueeSurExo===true, 'masquée Poids = '+G.masqueeHorsExo+' · Exercices = '+G.masqueeSurExo);
    t('⛔ … et elle REVIENT intacte quand on retourne sur Séances (elle ne se perd pas)',""")

# ── CLXIV : le témoin des 14 jours CHOISIT 14 jours (28 est le défaut depuis le 14/10, témoigné par B-PS01) ──
rep("""    // ── L'ECRAN ──
    goScreen('progress');
    const c=document.getElementById('prog-volume');""",
"""    // ── L'ECRAN ──
    /* 🗂️ PROGRES-SEANCES-01 (R30, décision de Michel du 14/10) : l'écran propose 14 | 28 jours, 28 par défaut.
       Ce bloc protège la fenêtre de 14 jours et l'unité « par semaine » : il CHOISIT donc 14 jours, comme la
       personne le ferait. Le défaut à 28 et la moyenne ÷ 4 sont témoignés par B-PS01-E (PS-E17 → PS-E19). */
    goScreen('progress'); choisirVolumeJours(14);
    const c=document.getElementById('prog-volume');""")
rep("""    persist(); goScreen('progress');
    const n=(document.querySelector('#prog-volume .vol-n')||{}).textContent||'';""",
"""    persist(); goScreen('progress'); choisirVolumeJours(14);   // PROGRES-SEANCES-01 : 14 jours choisi (voir plus haut)
    const n=(document.querySelector('#prog-volume .vol-n')||{}).textContent||'';""")
rep("""    t('⭐⭐ ⑦ Milo reçoit la MÊME grandeur que l\\'écran (6/semaine), jamais le brut',""",
"""    t('⭐⭐ ⑦ Milo reçoit la MÊME grandeur que l\\'écran réglé sur 14 jours (6/semaine), jamais le brut',""")

# ── CLXIX : l'écran ne défile que si l'historique est déplié (mois repliés par défaut) ──
rep("""    goScreen('progress');
    const ep=document.getElementById('s-progress');
    ep.scrollTop=ep.scrollHeight;                       // comme Michel : tout en bas""",
"""    /* 🗂️ PROGRES-SEANCES-01 (R30) : l'historique est rangé par mois, REPLIÉS par défaut — 30 séances repliées ne
       font plus défiler. On les déplie (ce que fait la personne qui va tout en bas) : même garantie, écran défilé. */
    goScreen('progress'); """+OUVRIR+""" renderSessions();
    const ep=document.getElementById('s-progress');
    ep.scrollTop=ep.scrollHeight;                       // comme Michel : tout en bas""")

# ── CLXXII : les cartes d'entraînement ne s'affichent que sur « Séances » ──
rep("""console.log('\\n-- CLXXII. Les cartes d\\'entraînement ne s\\'affichent que sur « Exercices » (ft-v1065) --');""",
"""console.log('\\n-- CLXXII. Les cartes d\\'entraînement ne s\\'affichent que sur « Séances » (ft-v1065 → PROGRES-SEANCES-01) --');""")
rep("""    const o={};
    o.exo={synth:vis('prog-synth'), volume:vis('prog-volume'),
           px:haut('prog-synth')+haut('prog-volume'), ongletsY:y('ptab-exo')};""",
"""    const o={};
    /* 🗂️ PROGRES-SEANCES-01 (R30, décision de Michel du 14/10) : les deux cartes parlent de TOUT l'entraînement ;
       elles ont quitté « Exercices » (l'analyse d'UN exercice) pour « Séances ». Même garantie, sur le bon onglet :
       là sur Séances, absentes partout ailleurs — Exercices COMPRIS —, et elles reviennent intactes. */
    switchProgTab('seances',document.getElementById('ptab-seances'));
    o.exo={synth:vis('prog-synth'), volume:vis('prog-volume'),
           px:haut('prog-synth')+haut('prog-volume'), ongletsY:y('ptab-seances')};""")
rep("""    const refSynth=(document.getElementById('prog-synth').textContent||'').trim();
    switchProgTab('poids',document.getElementById('ptab-poids'));""",
"""    const refSynth=(document.getElementById('prog-synth').textContent||'').trim();
    switchProgTab('exo',document.getElementById('ptab-exo'));
    o.surExo={synth:vis('prog-synth'), volume:vis('prog-volume'), contenuVisible:vis('prog-exo'), contenuY:y('prog-exo')};
    switchProgTab('poids',document.getElementById('ptab-poids'));""")
rep("""    switchProgTab('exo',document.getElementById('ptab-exo'));
    o.retour={synth:vis('prog-synth'), volume:vis('prog-volume'),""",
"""    switchProgTab('seances',document.getElementById('ptab-seances'));
    o.retour={synth:vis('prog-synth'), volume:vis('prog-volume'),""")
rep("""    t('⛔ ① les deux cartes sont bien LÀ sur Exercices (sinon le reste ne mesure rien)',
      W.exo.synth===true && W.exo.volume===true && W.exo.px>300,
      JSON.stringify(W.exo));""",
"""    t('⛔ ① les deux cartes sont bien LÀ sur Séances (sinon le reste ne mesure rien)',
      W.exo.synth===true && W.exo.volume===true && W.exo.px>300,
      JSON.stringify(W.exo));
    /* ⭐⭐ PROGRES-SEANCES-01 : « Exercices » ne garde que l'analyse d'UN exercice — les cartes n'y sont plus. */
    t('⭐⭐ ①bis sur EXERCICES, elles ne s\\'affichent plus — et l\\'analyse d\\'un exercice commence en haut',
      W.surExo.synth===false && W.surExo.volume===false && W.surExo.contenuVisible===true && W.surExo.contenuY < 250,
      JSON.stringify(W.surExo));""")
rep("""    t('⛔ ④ … et elles REVIENNENT intactes sur Exercices (elles ne se perdent pas, R30)',""",
"""    t('⛔ ④ … et elles REVIENNENT intactes sur Séances (elles ne se perdent pas, R30)',""")

# ── CLXXIII : onglets mesurés sur Séances ; progression et recherche mesurées SUR EXERCICES (et visibles) ──
rep("""    const o={ecran:844, onglets:R('ptab-exo'), synth:R('prog-synth-acc'), vol:R('prog-volume-acc'),
             progression:R('big4-chips'), recherche:R('prog-search'),
             lignesVolume:document.querySelectorAll('#prog-volume .vol-l').length};""",
"""    /* 🗂️ PROGRES-SEANCES-01 (R30) : les cartes repliables vivent dans « Séances » (onglet par défaut) ; la
       progression et la recherche, dans « Exercices ». Chacune se mesure sur SON onglet — mesurer un élément
       masqué rend y = 0 et le témoin était vert sans rien voir (trouvé par la passe de diagnostic du 14/10). */
    switchProgTab('seances',document.getElementById('ptab-seances'));
    const o={ecran:844, onglets:R('ptab-seances'), synth:R('prog-synth-acc'), vol:R('prog-volume-acc'),
             lignesVolume:document.querySelectorAll('#prog-volume .vol-l').length};
    switchProgTab('exo',document.getElementById('ptab-exo'));
    o.progression=R('big4-chips'); o.recherche=R('prog-search');
    switchProgTab('seances',document.getElementById('ptab-seances'));""")
rep("""      W.progression.y<450 && W.recherche.y<500,""",
"""      W.progression.h>0 && W.recherche.h>0 && W.progression.y<450 && W.recherche.y<500,""")

# ── CCXXVI ter : la liste se lit dépliée ──
rep("""    const lire=()=>{ renderSessions(); const el=document.getElementById('sess-list');""",
"""    /* 🗂️ PROGRES-SEANCES-01 (R30) : mois repliés par défaut — on déplie ceux des séances avant de lire la carte. */
    const lire=()=>{ """+OUVRIR+""" renderSessions(); const el=document.getElementById('sess-list');""")

# ── CCXXXIX : « Séances ce mois » vise le MOIS EN COURS dans Séances (l'arrivée nue est Séances, mois repliés) ──
rep("""      return {ecran:(document.querySelector('.screen.active')||{}).id||'?',
              onglet:onglet?onglet.textContent.trim():'—',
              ancre:anc?Math.round(anc.getBoundingClientRect().top):null};""",
"""      /* 🗂️ PROGRES-SEANCES-01 (R30) : Progrès s'ouvre désormais SUR Séances, mois repliés. « Ciblé » se lit alors
         au mois déplié : la tuile « Séances ce mois » ouvre le mois en cours, l'arrivée nue n'en ouvre aucun. */
      const mo=document.querySelector('#sess-list .sess-mois[aria-expanded="true"]');
      return {ecran:(document.querySelector('.screen.active')||{}).id||'?',
              onglet:onglet?onglet.textContent.trim():'—',
              ancre:anc?Math.round(anc.getBoundingClientRect().top):null,
              moisOuvert:mo?mo.getAttribute('data-mois'):null, moisCourant:today().slice(0,7)};""")
rep("""    const cible=x=> x.ecran==='s-progress' &&
      ( x.onglet!==nue.onglet ||
        (x.ancre!==null && nue.ancre!==null && (nue.ancre-x.ancre)>=100) );""",
"""    const cible=x=> x.ecran==='s-progress' &&
      ( x.onglet!==nue.onglet ||
        (x.moisOuvert===x.moisCourant && nue.moisOuvert!==x.moisCourant) ||
        (x.ancre!==null && nue.ancre!==null && (nue.ancre-x.ancre)>=100) );""")
rep("""      +d.map(x=>x.titre+' → '+x.onglet+' / ancre '+x.ancre).join(' | '));""",
"""      +d.map(x=>x.titre+' → '+x.onglet+' / ancre '+x.ancre+' / mois '+x.moisOuvert).join(' | '));""")


# ── ② enregistrement du banc B-PS01 ──
rep("""  await require('./debrief_demande.js').ecran(t, b, PORT);""",
"""  await require('./debrief_demande.js').ecran(t, b, PORT);
  /* 🗂️ PROGRES-SEANCES-01 (session-B, 14/10/2026) — Progrès : Séances | Exercices | Corps & santé | Badges ; historique
     Année → Mois sans plafond de 20 ; Accueil et calendrier → Séances ; volume 14 | 28 (28 par défaut), Milo inchangé.
     Blocs B-PS01-*. Banc : tools/banc_progres_seances.js · contrôle négatif : tools/mut_progres_seances.py. */
  await require('./progres_seances.js').ecran(t, b, PORT);""")
rep("""require('./debrief_demande.js').source(t, ROOT, fs, path);""",
"""require('./debrief_demande.js').source(t, ROOT, fs, path);
require('./progres_seances.js').source(t, ROOT, fs, path);""")

# ── ③ registre de recette ──
r = open(REGISTRE, encoding='utf-8').read()
A1 = '    "banc:debrief_demande": {"niveau": "T1", "environnement": "PLAYWRIGHT", "commande": "node tools/banc_debrief_demande.js", "controle_negatif": "python3 tools/mut_debrief_demande.py"},'
A2 = '    {"id": "PROG-EDITEUR-01", "module": "programmes",'
for a in (A1, A2):
    if r.count(a) != 1:
        print("⛔ ANCRE du registre introuvable ou multiple — rien n'est écrit :\n   %s" % a[:110]); sys.exit(2)
B1 = A1 + '\n    "banc:progres_seances": {"niveau": "T1", "environnement": "PLAYWRIGHT", "commande": "node tools/banc_progres_seances.js", "controle_negatif": "python3 tools/mut_progres_seances.py"},'
B2 = ('    {"id": "PROGRES-SEANCES-01", "module": "progrès", "scenario": "Progrès s\'ouvre sur Séances (Séances | Exercices | Corps & santé | Badges) ; '
      'tout l\'historique est atteignable, rangé par année puis par mois, sans plafond ; l\'Accueil et le calendrier mènent à la bonne séance par sa clé ; '
      'le volume se lit sur 14 ou 28 jours (28 par défaut) et Milo garde 14 jours ; consulter ne modifie jamais S.sessions", "niveau": "T1", "type": "AUTO", "criticite": "haute",\n'
      '     "declencheurs": ["switchProgTab", "renderProgress", "renderSessions", "_sessCarteHtml", "goSessionsHistory", "basculerSessAnnee", "basculerSessMois", "_volumeParMuscle", "_renderVolumeSemaine", "choisirVolumeJours", "_calDayPanel", "_renderHomeCalendar"],\n'
      '     "tests_associes": {"T1": ["banc:progres_seances"], "T2": ["banc:session_integrity", "banc:debrief_demande", "passe"]}, "environnement": "PLAYWRIGHT", "manuel_si": null,\n'
      '     "notes": "PROGRES-SEANCES-01 (14/10/2026). Blocs B-PS01-S / B-PS01-E. Milo : prompt identique à master (généré des deux côtés). Non couverts : Safari iOS, séparation lecture / modification du détail (non décidée), destination de Badges (non décidée)."},\n'
      + A2)
r = r.replace(A1, B1).replace(A2, B2)
try:
    json.loads(r)
except Exception as e:
    print("⛔ le registre ne serait plus du JSON valide — rien n'est écrit : %s" % e); sys.exit(2)
if VERIF:
    print("✅ toutes les ancres sont trouvées une fois — rien n'est écrit (--verifier)"); sys.exit(0)
open(RUNNER, 'w', encoding='utf-8').write(s)
open(REGISTRE, 'w', encoding='utf-8').write(r)
print('✅ runner.js et registre.json mis à jour (8 blocs réécrits, banc B-PS01 enregistré)')
