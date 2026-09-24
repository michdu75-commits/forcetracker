#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTRÔLE NÉGATIF — les témoins de la chaîne Poids peuvent-ils RÉELLEMENT rougir ?

⛔⛔ SUR UN ARBRE CLONÉ, JAMAIS SUR CELUI QU'ON PUBLIE (`BUGS.md` §60).

⭐ Chaque mutation défait UNE garantie que les témoins prétendent protéger. Plusieurs remettent
   le code d'AVANT mot pour mot (M01, M05, M06, M07, M21) : sans leur rouge, rien de ce qui est
   écrit dans le journal ne vaudrait.
⚠️ Les mutations « DÉGUISÉES » remettent le défaut par une forme différente (M02 la virgule par
   `parseFloat` en gardant la borne, M11 un « poids valide » qui accepte 0, M13 l'ordre du tableau).
⛔ Et deux doivent RESTER VERTES : elles ajoutent un COMMENTAIRE citant les mots cherchés — la
   seule preuve qu'on mesure le CODE et non la documentation (les commentaires du correctif citent
   `S.weightLog[0].kg`, `parseFloat(d.bw)` et `bw>20` en toutes lettres, R30).
⛔ M00 d'abord : le clone NON muté doit être vert — un contrôle négatif dont le point de départ est
   faux ne prouve rien.

Usage : python3 tools/mut_poids_chaine.py [racine du clone]
"""
import os
import subprocess
import sys

R = sys.argv[1] if len(sys.argv) > 1 else '/tmp/mutpoids'
TR, SE, ST = 'tracking.js', 'setup.js', 'state.js'

MUT = [
    # ── F003 : la restauration ────────────────────────────────────────────────────────────
    ('M01', SE,
     "  try{const _b=numFR(d.bw); if(_poidsValide(_b))S.bw=_b;}catch(e){console.warn('[FT restore] bw',e);}",
     "  try{if(d.bw)S.bw=parseFloat(d.bw)||S.bw;}catch(e){console.warn('[FT restore] bw',e);}",
     'rouge', 'LE CODE D AVANT : restauration sans borne'),
    ('M02', SE,
     "  try{const _b=numFR(d.bw); if(_poidsValide(_b))S.bw=_b;}",
     "  try{const _b=parseFloat(d.bw); if(_poidsValide(_b))S.bw=_b;}",
     'rouge', 'DÉGUISÉE : la borne reste, la virgule retronque (85,9 → 85)'),

    # ── F004 : l'import balance ───────────────────────────────────────────────────────────
    ('M03', TR,
     "    if(!r||!_dateImportValide(r.date)||!_poidsValide(r.weight)){ ecartes++; return; }",
     "    if(!r||!_dateImportValide(r.date)){ ecartes++; return; }",
     'rouge', 'l import accepte de nouveau 500, 0 et −10 kg'),
    ('M04', TR,
     "    if(!r||!_dateImportValide(r.date)||!_poidsValide(r.weight)){ ecartes++; return; }",
     "    if(!r||!r.date||!_poidsValide(r.weight)){ ecartes++; return; }",
     'rouge', 'une date impossible ou future repasse en tête du journal'),
    ('M05', TR,
     "  _bwSurDernierePesee();\n  if(typeof persist==='function')persist();\n  if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();\n  return {days:days.length, ecartes};",
     "  const latest=days[days.length-1]; if(byDay[latest]&&byDay[latest].weight)S.bw=Math.round(byDay[latest].weight*10)/10;\n  if(typeof persist==='function')persist();\n  if(typeof _cloudSyncDebounced==='function')_cloudSyncDebounced();\n  return {days:days.length, ecartes};",
     'rouge', 'LE CODE D AVANT : le poids courant = le dernier jour du fichier'),
    ('M21', TR,
     "    const ec=r.ecartes?(' — '+r.ecartes+' ligne'+(r.ecartes>1?'s':'')+' écartée'+(r.ecartes>1?'s':'')+' (poids hors 20–300 kg ou date impossible)'):'';",
     "    const ec='';",
     'rouge', 'les lignes écartées disparaissent sans un mot'),

    # ── F005 : une seule règle ────────────────────────────────────────────────────────────
    ('M06', SE,
     "    if(!_poidsValide(bw)){toast('Poids invalide (20–300 kg)','error');return;}",
     "    if(!(bw>20&&bw<300)){toast('Poids invalide (20–299 kg)','error');return;}",
     'rouge', 'LE CODE D AVANT : le Profil refuse 20 et 300 kg'),
    ('M16', TR,
     "  const kg=numFR(inp?inp.value:0);\n  if(!_poidsValide(kg)){",
     "  const kg=numFR(inp?inp.value:0);\n  if(!kg||kg<20||kg>300){",
     'rouge', 'R2 : la pesée du jour reprend SA propre copie de la règle (même comportement)'),
    ('M25', SE,
     "    if(!_poidsValide(bw)){toast('Poids invalide (20–300 kg)','error');return;}",
     "    if(!_poidsValide(bw)){return;}",
     'rouge', 'le Profil refuse sans rien dire'),

    # ── F011 : le Profil écrit une pesée ──────────────────────────────────────────────────
    ('M07', SE,
     "    if(typeof _enregistrerPesee==='function')_enregistrerPesee(bw);else S.bw=bw;",
     "    S.bw=bw;",
     'rouge', 'LE CODE D AVANT : le Profil écrit S.bw sans pesée'),
    ('M08', SE,
     "  if(_bwTouche&&bw){",
     "  if(bw){",
     'rouge', 'un champ prérempli (non touché) fabrique une pesée / fait revenir un poids périmé'),
    ('M09', SE,
     "    bwEl.dataset.touche='';\n  }",
     "  }",
     'rouge', 'le champ reste « touché » après l enregistrement'),
    ('M10', SE,
     "  if(bwEl){ bwEl.value=S.bw||''; bwEl.dataset.touche=''; bwEl.oninput",
     "  if(bwEl){ bwEl.value=S.bw||''; bwEl.oninput",
     'rouge', 'une saisie abandonnée reste « touchée » au retour sur le Profil'),

    # ── Le poids courant après une écriture qui n'est pas « maintenant » ──────────────────
    ('M22', TR,
     "    _bwSurDernierePesee();\n    persist();closeWeighEdit();renderWeightTab();renderHome();\n    toast('Pesée supprimée','info');",
     "    if(S.weightLog[0])S.bw=S.weightLog[0].kg;\n    persist();closeWeighEdit();renderWeightTab();renderHome();\n    toast('Pesée supprimée','info');",
     'rouge', 'LE CODE D AVANT : supprimer met le poids courant à 0'),
    ('M23', TR,
     "  _bwSurDernierePesee();        // ⛔ même propriétaire que l'édition et la suppression (24/09)",
     "  if(S.weightLog[0])S.bw=S.weightLog[0].kg;",
     'rouge', 'LE CODE D AVANT dans le bilan corporel (vu par la source)'),
    ('M11', ST,
     "  const l=(S.weightLog||[]).filter(w=>w&&w.date&&_poidsValide(numFR(w.kg))",
     "  const l=(S.weightLog||[]).filter(w=>w&&w.date&&w.kg!=null",
     'rouge', 'DÉGUISÉE : « poids valide » accepte 0 kg'),
    ('M12', ST,
     "      &&_dateImportValide(w.date)&&(!avantJour",
     "      &&(!avantJour",
     'rouge', 'une ligne à date impossible redevient « la dernière pesée »'),
    ('M13', ST,
     "      &&_dateImportValide(w.date)&&(!avantJour||String(w.date)<String(avantJour)))\n    .sort((a,b)=>String(b.date).localeCompare(String(a.date)));",
     "      &&_dateImportValide(w.date)&&(!avantJour||String(w.date)<String(avantJour)));",
     'rouge', 'DÉGUISÉE : la position dans le tableau au lieu de la date'),
    ('M14', TR,
     "  try{ const el=document.getElementById('bw-inp');\n       if(el&&el.dataset.touche!=='1')el.value=kg; }catch(e){}",
     "",
     'rouge', 'le Profil affiché n est plus rafraîchi'),
    ('M15', TR,
     "       if(el&&el.dataset.touche!=='1')el.value=kg; }catch(e){}",
     "       if(el)el.value=kg; }catch(e){}",
     'rouge', 'le rafraîchissement écrase une saisie en cours'),

    # ── « même valeur » ≠ « rien à enregistrer » ─────────────────────────────────────────
    ('M17', TR,
     "function _enregistrerPesee(kg){\n  if(!_poidsValide(kg)) return false;",
     "function _enregistrerPesee(kg){\n  if(!_poidsValide(kg)) return false;\n  if(kg===S.bw) return false;",
     'rouge', 'la même valeur ne crée plus de pesée'),

    # ── L'UX « DERNIÈRE MESURE » (B-CCCLVII) ─────────────────────────────────────────────
    ('MU1', TR,
     '<input type="text" id="wentry-inp" value="" placeholder="kg"',
     '<input type="text" id="wentry-inp" value="${pd?pd.kg:\'\'}" placeholder="kg"',
     'rouge', 'LE DÉFAUT D AVANT : le champ est de nouveau prérempli'),
    ('MU2', TR,
     '<input type="text" id="wentry-inp" value="" placeholder="kg"',
     '<input type="text" id="wentry-inp" value="" placeholder="${S.bw||80}"',
     'rouge', 'DÉGUISÉE : le champ est vide mais le poids d avant revient en gris'),
    ('MU3', TR,
     "  const pd=(typeof poidsDernier==='function')?poidsDernier():null;\n  const pp=",
     "  const pd=(S.weightLog&&S.weightLog.length)?(()=>{const w=S.weightLog.slice().sort((a,b)=>b.date.localeCompare(a.date))[0];return {date:w.date,kg:+w.kg||0};})():null;\n  const pp=",
     'rouge', 'DÉGUISÉE : une 2ᵉ lecture de « la dernière pesée », qui accepte une ligne à 0 kg'),
    ('MU4', TR,
     "  if(!inp||!String(inp.value).trim()){toast('Entre ton poids du jour','info');return;}",
     "  if(!inp||!String(inp.value).trim()){const _p=poidsDernier();if(_p)inp.value=_p.kg;}",
     'rouge', 'un ✓ sur le champ vide fabrique de nouveau une pesée'),
    ('MU5', TR,
     "  return 'Écart : '+(r>0?'+':(r<0?'−':''))+_kgFR1(Math.abs(r))+' kg';",
     "  return 'Écart : '+(r>0?'+':'')+_kgFR1(Math.abs(r))+' kg';",
     'rouge', 'une baisse s affiche comme une hausse (signe perdu)'),
    ('MU6', TR,
     "  _enregistrerPesee(kg);\n  persist();\n  renderWeightTab();renderHome();",
     "  _enregistrerPesee(kg);\n  (S.weightLog.find(w=>w.date===today())||{}).ecart=1;\n  persist();\n  renderWeightTab();renderHome();",
     'rouge', 'l écart devient une donnée enregistrée'),
    ('MU7', TR,
     "  el.textContent=(_poidsValide(v)&&pd)?_ecartPoidsTxt(v-pd.kg):(el.dataset.apres||'');",
     "  el.textContent=(isFinite(v)&&pd)?_ecartPoidsTxt(v-pd.kg):(el.dataset.apres||'');",
     'rouge', 'une saisie partielle affiche un écart absurde (−78 kg)'),

    # ── LES COMMENTAIRES NE COMPTENT PAS : ces trois-là doivent RESTER VERTES ────────────
    ('MU8', TR,
     "function _kgFR1(k){",
     "/* value=\"${prefill}\" placeholder=\"${S.bw||80}\" S.weightLog persist( */\nfunction _kgFR1(k){",
     'vert', 'un commentaire qui cite le préremplissage ne change rien'),
    ('M19', TR,
     "function _bwSurDernierePesee(){",
     "/* S.bw=S.weightLog[0].kg ; parseFloat(d.bw) ; kg<20||kg>300 ; if(kg===S.bw) return */\nfunction _bwSurDernierePesee(){",
     'vert', 'un commentaire qui cite tous les mots cherchés ne change rien'),
    ('M20', SE,
     "  const _bwTouche=!!(bwEl&&bwEl.dataset.touche==='1');",
     "  const _bwTouche=!!(bwEl&&bwEl.dataset.touche==='1'); // if(bw){if(bw>20&&bw<300)S.bw=bw;} S.bw=parseFloat(d.bw)",
     'vert', 'idem côté Profil'),
]


def lancer():
    p = subprocess.run(['node', 'tools/banc_poids_chaine.js'],  # noqa
                       capture_output=True, text=True, cwd=R,
                       env=dict(os.environ, TZ='Europe/Paris'))
    return p.returncode, (p.stdout + p.stderr)


def main():
    rc, out = lancer()
    if rc != 0:
        der = [l for l in out.strip().split('\n') if l.strip()][-1:] or ['']
        print('M00 le clone NON muté n est pas vert (%d) — contrôle refusé >> %s' % (rc, der[0][:120]))
        return 1
    print('M00 vert     attendu=vert  OK   — le clone non muté est vert (point de départ sain)')
    ok = nc = anc = 0
    for mid, fic, avant, apres, att, quoi in MUT:
        chemin = os.path.join(R, fic)
        src = open(chemin, encoding='utf-8').read()
        if src.count(avant) != 1:
            print('%s ANCRE invalide (%d occurrences) dans %s — %s'
                  % (mid, src.count(avant), fic, quoi))
            anc += 1
            continue
        open(chemin, 'w', encoding='utf-8').write(src.replace(avant, apres, 1))
        rc, out = lancer()
        open(chemin, 'w', encoding='utf-8').write(src)
        obt = 'vert' if rc == 0 else ('rouge' if rc == 1 else 'PLANTAGE')
        if obt == att:
            ok += 1
            print('%s %-8s attendu=%-5s OK   — %s' % (mid, obt, att, quoi))
        else:
            nc += 1
            der = [l for l in out.strip().split('\n') if l.strip()][-1:] or ['']
            print('%s %-8s attendu=%-5s NON CONFORME — %s >> %s'
                  % (mid, obt, att, quoi, der[0][:90]))
    rc, out = lancer()
    fin = 'vert' if rc == 0 else 'NON VERT'
    print('M99 %s après restauration de toutes les mutations' % fin)
    print('=== conformes=%d nonconformes=%d ancres=%d ===' % (ok, nc, anc))
    return 1 if (nc or anc or rc) else 0


if __name__ == '__main__':
    sys.exit(main())
