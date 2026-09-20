#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTRÔLE NÉGATIF — les témoins de « mesurée vs estimée » peuvent-ils RÉELLEMENT rougir ?

⛔⛔ SUR UN ARBRE CLONÉ, JAMAIS SUR CELUI QU'ON PUBLIE (`BUGS.md` §60 : on ne modifie pas
    l'arbre pendant qu'on le mesure).

⭐ Chaque mutation défait UN fait que les témoins prétendent protéger. ⛔ Et deux doivent
   RESTER VERTES : elles ajoutent un COMMENTAIRE citant les mots cherchés — c'est la seule
   preuve qu'on mesure le CODE et non la documentation. Indispensable ici : les commentaires
   du correctif citent `bfSrc`, `estime`, `mesure`, `i.value=navy` et « ne remplace pas » en
   toutes lettres (R30).

⚠️ ET LA MUTATION QUI COMPTE LE PLUS EST LA DÉGUISÉE (M02) : elle remet l'écriture dans le
   champ de saisie **par une autre forme** (`setAttribute('value',…)`). Un témoin qui ne
   chercherait que `.value=navy` resterait vert dessus, et le défaut d'origine serait revenu.

Usage : python3 tools/mut_masse_grasse.py [racine du clone]
"""
import os
import subprocess
import sys

R = sys.argv[1] if len(sys.argv) > 1 else '/tmp/mutbf'
TR = 'tracking.js'

MUT = [
    # ── LA CAUSE : l'estimation ne doit plus écrire dans le champ de saisie ────────
    ('M01', TR,
     "  const el=document.getElementById('bf-navy-val');if(el)el.innerHTML=navy==null?"
     "'<span style=\"font-size:12px;color:var(--t3);\">—</span>':('~'+navy+' %');\n}",
     "  const el=document.getElementById('bf-navy-val');if(el)el.innerHTML=navy==null?"
     "'<span style=\"font-size:12px;color:var(--t3);\">—</span>':('~'+navy+' %');\n"
     "  if(navy!=null){const i=document.getElementById('bf-inp');if(i)i.value=navy;}\n}",
     'rouge', 'le defaut d origine revient : l estimation remplit la case'),

    ('M02', TR,
     "  const el=document.getElementById('bf-navy-val');if(el)el.innerHTML=navy==null?"
     "'<span style=\"font-size:12px;color:var(--t3);\">—</span>':('~'+navy+' %');\n}",
     "  const el=document.getElementById('bf-navy-val');if(el)el.innerHTML=navy==null?"
     "'<span style=\"font-size:12px;color:var(--t3);\">—</span>':('~'+navy+' %');\n"
     "  if(navy!=null){const i=document.getElementById('bf-inp');"
     "if(i)i.setAttribute('value',String(navy));}\n}",
     'rouge', 'DEGUISEE : la meme ecriture par setAttribute au lieu de .value'),

    # ── LA GARANTIE : une estimation n ecrase jamais une mesure ───────────────────
    ('M03', TR,
     "  if(bfSrc===BF_ESTIME&&!_bfRemplacableParEstime(e)){",
     "  if(false&&bfSrc===BF_ESTIME&&!_bfRemplacableParEstime(e)){",
     'rouge', 'le garde ne se declenche plus'),

    ('M04', TR,
     "function _bfRemplacableParEstime(e){ return !e || e.bf==null || e.bfSrc===BF_ESTIME; }",
     "function _bfRemplacableParEstime(e){ return true; }",
     'rouge', 'tout devient remplacable par une estimation'),

    ('M05', TR,
     "function _bfRemplacableParEstime(e){ return !e || e.bf==null || e.bfSrc===BF_ESTIME; }",
     "function _bfRemplacableParEstime(e){ return !e || e.bf==null || e.bfSrc!==BF_MESURE; }",
     'rouge', 'DEGUISEE : une provenance INCONNUE redevient ecrasable'),

    # ── LA PROVENANCE ELLE-MEME ──────────────────────────────────────────────────
    ('M06', TR,
     "  let bfSrc=(_brutBf&&bf)?BF_MESURE:null;",
     "  let bfSrc=null;",
     'rouge', 'une valeur tapee n est plus marquee comme mesure'),

    ('M07', TR,
     "if(navy!=null){bf=navy;bfSrc=BF_ESTIME;}}",
     "if(navy!=null){bf=navy;bfSrc=BF_MESURE;}}",
     'rouge', 'l estimation se declare comme une mesure'),

    ('M08', TR,
     "  if(!_garderSrc) e.bfSrc=bfSrc||BF_MESURE;",
     "  e.bfSrc=bfSrc||BF_MESURE;",
     'rouge', 'une revalidation a l identique INVENTE une provenance'),

    ('M09', TR,
     "  const _garderSrc=(_memeValeur&&bfSrc===BF_MESURE&&e.bfSrc!==BF_ESTIME);",
     "  const _garderSrc=_memeValeur;",
     'rouge', 'DEGUISEE : une estimation revalidee garde sa provenance a tort'),

    ('M10', TR,
     "const BF_MESURE='mesure', BF_ESTIME='estime';",
     "const BF_MESURE='mesure', BF_ESTIME='mesure';",
     'rouge', 'les deux provenances deviennent la meme'),

    # ── D-013 : le prefill ───────────────────────────────────────────────────────
    ('M11', TR,
     "  const prefill=mesureDuJour?todayW.bf:'';",
     "  const prefill=mesureDuJour?todayW.bf:(navyNow!=null?navyNow:'');",
     'rouge', 'le champ repropose l estimation (D-013 rouverte)'),

    ('M12', TR,
     "  const prefill=mesureDuJour?todayW.bf:'';",
     "  const prefill=mesureDuJour?todayW.bf:((bfDerniere(null)||{}).bf||'');",
     'rouge', 'le champ repropose la mesure d un AUTRE jour'),

    ('M13', TR,
     "  const mesureDuJour=(savedToday&&todayW.bfSrc!==BF_ESTIME);",
     "  const mesureDuJour=savedToday;",
     'rouge', 'une estimation du jour prerempli le champ'),

    # ── LA DERNIERE MESURE ───────────────────────────────────────────────────────
    ('M14', TR,
     "  const l=(S.weightLog||[]).filter(w=>w&&w.bf!=null&&w.date&&w.bfSrc!==BF_ESTIME",
     "  const l=(S.weightLog||[]).filter(w=>w&&w.bf!=null&&w.date",
     'rouge', 'une estimation est presentee comme « derniere mesure »'),

    ('M15', TR,
     "  return l.length?{date:l[0].date,bf:l[0].bf,src:l[0].bfSrc||null}:null;",
     "  return l.length?{date:l[0].date,bf:l[0].bf}:null;",
     'rouge', 'la provenance ne remonte plus avec la valeur'),

    ('M16', TR,
     "  return l.length?{date:l[0].date,bf:l[0].bf,src:l[0].bfSrc||null}:null;",
     "  return l.length?{date:l[0].date,bf:l[0].bf,src:BF_MESURE}:null;",
     'rouge', 'DEGUISEE : toute valeur est annoncee comme une mesure saisie'),

    ('M17', TR,
     "  const _motPrec=(_prec&&_prec.src===BF_MESURE)?'Dernière mesure saisie':'Dernière valeur notée';",
     "  const _motPrec='Dernière mesure saisie';",
     'rouge', 'on affirme une provenance qu on ignore'),

    # ── L ECRAN DOIT DIRE LES DEUX ───────────────────────────────────────────────
    ('M18', TR,
     "  const sub=mesureDuJour?('✓ Mesure du jour : '+todayW.bf+' % · '+_estim+_rappel)\n"
     "    :(_estim+_rappel);",
     "  const sub=mesureDuJour?('✓ Mesure du jour : '+todayW.bf+' %'+_rappel)\n"
     "    :(_estim+_rappel);",
     'rouge', 'l estimation disparait des qu une mesure existe'),

    ('M19', TR,
     "  const _estim=navyNow!=null?('Estimation d\\'après tes mensurations : ~'+navyNow+' %')",
     "  const _estim=navyNow!=null?('~'+navyNow+' %')",
     'rouge', 'l estimation ne dit plus qu elle en est une'),

    # ── LES AUTRES ECRIVAINS ─────────────────────────────────────────────────────
    ('M20', TR,
     "    entry.bfSrc=(_anc&&_anc.bf===bfv&&_anc.bfSrc)?_anc.bfSrc:BF_MESURE; }",
     "    entry.bfSrc=BF_MESURE; }",
     'rouge', 'rouvrir une pesee PROMEUT une estimation en mesure'),

    ('M21', TR,
     "  if(obj.bf!=null){wentry.bf=obj.bf;wentry.bfSrc=BF_MESURE;}",
     "  if(obj.bf!=null){wentry.bf=obj.bf;}",
     'rouge', 'le bilan corporel ecrit un % sans dire d ou il vient'),

    # ── LE PERIMETRE : la formule ne bouge pas ───────────────────────────────────
    ('M22', TR, "bf=495/(1.0324-0.19077", "bf=495/(1.0500-0.19077",
     'rouge', 'la formule US Navy homme a change'),

    ('M23', TR, "bf=495/(1.29579-0.35004", "bf=495/(1.30000-0.35004",
     'rouge', 'la formule US Navy femme a change'),

    # ── ⭐ LES DEUX QUI DOIVENT RESTER VERTES ─────────────────────────────────────
    ('V01', TR,
     "function _bfNavy(neck,waist,hip,ht,gender){",
     "/* note : bfSrc, estime, mesure, i.value=navy, ne remplace pas, prefill, mesureDuJour,\n"
     "   Derniere mesure saisie, Derniere valeur notee, _bfRemplacableParEstime sont cites ici */\n"
     "function _bfNavy(neck,waist,hip,ht,gender){",
     'vert', 'un COMMENTAIRE citant tous les mots cherchés ne doit rien changer'),

    ('V02', TR,
     "function bfDerniere(avantJour){",
     "/* note : BF_MESURE, BF_ESTIME, bfSrc, src:l[0].bfSrc, Estimation d apres tes mensurations */\n"
     "function bfDerniere(avantJour){",
     'vert', 'idem juste au-dessus du proprietaire de la derniere mesure'),
]


def lancer():
    p = subprocess.run(['node', 'tools/banc_masse_grasse.js'],  # noqa
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
