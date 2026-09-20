#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTRÔLE NÉGATIF — les témoins des mensurations peuvent-ils RÉELLEMENT rougir ?

⛔⛔ SUR UN ARBRE CLONÉ, JAMAIS SUR CELUI QU'ON PUBLIE (`BUGS.md` §60 : on ne modifie pas
    l'arbre pendant qu'on le mesure).

⭐ Chaque mutation défait UN fait que les témoins prétendent protéger. ⛔ Et deux doivent
   RESTER VERTES : elles ajoutent un COMMENTAIRE citant les mots cherchés — c'est la seule
   preuve qu'on mesure le CODE et non la documentation. Elle est indispensable ici : les
   commentaires du correctif citent `persist`, `numFR` et `S.bw` en toutes lettres (R30).

⚠️ Et une mutation « DÉGUISÉE » (M03) remet le défaut en passant par une forme différente :
   un témoin qui ne chercherait que le ternaire d'origine resterait vert dessus.

Usage : python3 tools/mut_mensurations.py [racine du clone]
"""
import os
import subprocess
import sys

R = sys.argv[1] if len(sys.argv) > 1 else '/tmp/mutmens'
TR = 'tracking.js'

MUT = [
    # ── LA RACINE : le persist() de la sortie « pas de poids » ────────────────────
    ('M01', TR,
     "      if(_nMens>0){ persist(); renderWeightTab();\n"
     "        toast(_nMens+' mesure'",
     "      if(_nMens>0){ renderWeightTab();\n"
     "        toast(_nMens+' mesure'",
     'rouge', 'la sortie « pas de poids » ne sauvegarde plus'),

    # ⚠️ M02 A ÉTÉ RÉ-VISÉE : ma 1ʳᵉ version retirait le `toast` du cas où il n'y a RIEN à
    #    garder — donc elle ne cassait aucune garantie, et sortait verte à juste titre.
    #    *Une mutation doit défaire ce que les témoins PROMETTENT, pas ce qui se trouve à côté.*
    ('M02', TR,
     "        toast(_nMens+' mesure'+(_nMens>1?'s':'')+' enregistrée'+(_nMens>1?'s':'')+' ✅ — entre ton poids pour enregistrer aussi le %','success'); }",
     "        toast('Enregistre d\\'abord ton poids du jour','info'); }",
     'rouge', 'le message cesse de dire ce qui a été gardé'),

    # ── LE REPLI SUR LE POIDS DU PROFIL ───────────────────────────────────────────
    ('M03', TR,
     "    if(!kg)kg=numFR(S.bw)||0;",
     "    if(!kg&&!S.weightLog.length)kg=numFR(S.bw)||0;",
     'rouge', 'DÉGUISÉE : le repli redevient inatteignable dès qu une pesée existe'),

    ('M04', TR,
     "    const _kgUtil=x=>{const v=numFR(x&&x.kg);return (isFinite(v)&&v>0)?v:0;};",
     "    const _kgUtil=x=>(x&&x.kg)||0;",
     'rouge', 'le poids de secours ne sait plus lire une chaîne « 85,9 »'),

    # ── LA LECTURE DES NOMBRES (le séparateur décimal) ────────────────────────────
    ('M05', TR,
     "  neck=numFR(neck);waist=numFR(waist);hip=numFR(hip);ht=numFR(ht);",
     "  neck=parseFloat(neck);waist=parseFloat(waist);hip=parseFloat(hip);ht=parseFloat(ht);",
     'rouge', 'la virgule retronque les centimètres'),

    # ── LES ACQUIS QU ON NE DOIT PAS CASSER ───────────────────────────────────────
    ('M06', TR,
     "    if(!brut) return;                       // vide ≠ effacer",
     "    if(!brut){ mensAjouter(m.k,0,'manuel'); return; }",
     'rouge', 'un champ vidé détruit la valeur enregistrée'),

    ('M07', TR,
     "  const _nMens=_mensEnregistrerSaisie();",
     "  const _nMens=0;",
     'rouge', 'plus aucune mensuration n est enregistrée'),

    ('M08', TR,
     "    const el=document.getElementById(idPour[m.k]||('mens-'+m.k));",
     "    const el=document.getElementById(idPour[m.k]||'');",
     'rouge', 'les 6 autres mensurations ne sont plus lues'),

    ('M09', TR,
     "    if(mensAjouter(m.k,numFR(brut),'manuel')) n++;",
     "    if(mensAjouter(m.k,parseFloat(brut),'manuel')) n++;",
     'rouge', 'la virgule retronque la mensuration ENREGISTRÉE'),

    # ── LE CALCUL LUI-MÊME (il ne doit pas bouger) ────────────────────────────────
    ('M10', TR, "bf=495/(1.0324-0.19077", "bf=495/(1.0500-0.19077",
     'rouge', 'la formule US Navy homme a changé'),

    ('M11', TR, "bf=495/(1.29579-0.35004", "bf=495/(1.30000-0.35004",
     'rouge', 'la formule US Navy femme a changé'),

    # ── L UNIQUE PROPRIÉTAIRE DES MENSURATIONS (R2) ───────────────────────────────
    ('M12', TR,
     "  e.bf=Math.round(bf*10)/10;",
     "  e.bf=Math.round(bf*10)/10;S.neck=nk||S.neck;",
     'rouge', 'saveBodyFat réécrit une mensuration en direct'),

    # ── LA DÉDUPLICATION PAR JOUR (state.js) ──────────────────────────────────────
    ('M13', 'state.js',
     "  if(i>=0) S.mensLog[i]=entree; else S.mensLog.unshift(entree);",
     "  S.mensLog.unshift(entree);",
     'rouge', 'deux mesures du même jour empilent au lieu de corriger'),

    ('M14', 'state.js',
     "  if(def.bf) S[def.bf]=val;",
     "  if(false) S[def.bf]=val;",
     'rouge', 'la valeur courante ne suit plus le journal'),

    ('M15', 'state.js',
     "    localStorage.setItem('ft4_mens',JSON.stringify(S.mensLog||[]));",
     "    localStorage.setItem('ft4_mens',JSON.stringify([]));",
     'rouge', 'le journal des mensurations n atteint plus le disque'),

    # ── LE RETOUR DE CHRISTOPHE : la derniere valeur notee ───────────────────────
    ('M16', TR,
     "  const _prec=bfDerniere(savedToday?d:null);",
     "  const _prec=null;",
     'rouge', 'l ecran cesse de montrer la derniere valeur notee'),

    ('M17', TR,
     "  const _rappel=_prec?(' · dernière notée : '+_prec.bf+' % le '+_bfJourCourt(_prec.date)):'';",
     "  const _rappel=_prec?(' · dernière notée : '+_prec.bf+' %'):'';",
     'rouge', 'le rappel perd sa DATE : on ne sait plus de quand date la valeur'),

    ('M18', TR,
     ":(navyNow!=null?('Estimée ~'+navyNow+' % d\\'après tes mesures'+_rappel)",
     ":(navyNow!=null?('Estimée ~'+navyNow+' %'+_rappel)",
     'rouge', 'le chiffre propose ne dit plus d ou il vient'),

    # ⚠️ DEGUISEE : elle remet un tri implicite (l ordre du tableau) au lieu du tri par date.
    #    Un temoin qui ne chercherait que le nom `bfDerniere` resterait VERT dessus.
    ('M19', TR,
     "  const l=(S.weightLog||[]).filter(w=>w&&w.bf!=null&&w.date\n              &&(!avantJour||String(w.date)<String(avantJour)))\n    .sort((a,b)=>String(b.date).localeCompare(String(a.date)));",
     "  const l=(S.weightLog||[]).filter(w=>w&&w.bf!=null&&w.date\n              &&(!avantJour||String(w.date)<String(avantJour)));",
     'rouge', 'DEGUISEE : bfDerniere se fie a l ordre du tableau au lieu de trier'),

    ('M20', TR,
     "  return l.length?{date:l[0].date,bf:l[0].bf}:null;",
     "  return l.length?{date:l[0].date,bf:l[0].bf}:{date:'',bf:0};",
     'rouge', 'bfDerniere rend 0 au lieu de « je ne sais pas » (R29)'),

    ('M21', TR,
     "  const m=/^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(String(iso||''));\n  return m?(m[3]+'/'+m[2]):String(iso||'');",
     "  const d=new Date(String(iso||''));\n  return isNaN(d)?String(iso||''):(d.getDate()+'/'+(d.getMonth()+1));",
     'rouge', 'la date repasse par new Date (piege des fuseaux horaires)'),

    # ⛔ LA DECISION NON TRANCHEE (D-013) : si quelqu un change le prefill « en passant ».
    ('M22', TR,
     "  const prefill=savedToday?todayW.bf:(navyNow!=null?navyNow:'');",
     "  const prefill=savedToday?todayW.bf:((bfDerniere(null)||{}).bf||'');",
     'rouge', 'le prefill change alors que D-013 n est pas tranchee'),

    # ── ⭐ LES DEUX QUI DOIVENT RESTER VERTES ─────────────────────────────────────
    ('V01', TR,
     "function _bfNavy(neck,waist,hip,ht,gender){",
     "/* note : persist, numFR, S.bw, last?last.kg:, parseFloat, _kgUtil, 1.0324,\n   bfDerniere, apres tes mesures, derniere notee, _bfJourCourt, sort, localeCompare */\n"
     "function _bfNavy(neck,waist,hip,ht,gender){",
     'vert', 'un COMMENTAIRE citant tous les mots cherchés ne doit rien changer'),

    ('V02', 'state.js',
     "function mensAjouter(k,v,src){",
     "/* note : ft4_mens, S.neck, def.bf, persist sont cités ici, en commentaire */\n"
     "function mensAjouter(k,v,src){",
     'vert', 'idem côté state.js'),
]


def lancer():
    p = subprocess.run(['node', 'tools/banc_mensurations.js'],  # noqa
                       capture_output=True, text=True, cwd=R,
                       env=dict(os.environ, TZ='Europe/Paris'))
    return p.returncode, (p.stdout + p.stderr)


def main():
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
    print('=== conformes=%d nonconformes=%d ancres=%d ===' % (ok, nc, anc))
    return 1 if (nc or anc) else 0


if __name__ == '__main__':
    sys.exit(main())
