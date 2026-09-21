#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTRÔLE NÉGATIF — les témoins de « le repas décrit passe par `_ref100` » mordent-ils ?

⛔⛔ SUR UN ARBRE CLONÉ, JAMAIS SUR CELUI QU'ON PUBLIE (`BUGS.md` §60).

⛔⛔ M01 EST LA MUTATION QUE MICHEL A DEMANDÉE NOMMÉMENT : elle retire le passage par
   `_ref100` et remet le code d'avant. Si elle ne rougit pas, rien de ce qui est écrit ici
   ne vaut.

⚠️ QUATRE MUTATIONS SONT « DÉGUISÉES », et ce sont celles qui comptent :
   · M02 réimplémente la loi SUR PLACE au lieu de la demander — un témoin qui ne chercherait
     que « `_ref100` est appelé » resterait vert dessus, avec deux résolveurs dans l'app ;
   · M07 fait MENTIR la trace sans rien casser d'autre (`retenu` ≠ ce que la ligne porte) ;
   · M10 protège l'estimation en la déclarant `manuel` — le résolveur cesse alors de résoudre,
     en silence, et tout le reste du code a l'air correct ;
   · M15 remet la référence AVANT `_afOublierAliment()` — le défaut d'ORDRE que j'ai
     réellement commis, et qui efface la trace dans la milliseconde sans lever d'erreur.

Usage : python3 tools/mut_ia_ref100.py [racine du clone]
"""
import os
import subprocess
import sys

R = sys.argv[1] if len(sys.argv) > 1 else '/tmp/mutia'
AP = 'app.js'

MUT = [
    # ⛔⛔ LA MUTATION CENTRALE : le code d'AVANT ce chantier.
    ('M01', AP,
     "    const _iaRef=_ref100(d.name||desc, _iaV(d.kcal), _iaV(d.prot), _iaV(d.carbs), _iaV(d.fat),\n"
     "                         {normaliser:false, origine:'ia', champ:'estimation-ia', maxNom:80});",
     "    const _iaRef=null;",
     'rouge', 'LE REPAS DECRIT REPASSE HORS DU RESOLVEUR (code d avant)'),

    ('M02', AP,
     "    const _iaRef=_ref100(d.name||desc, _iaV(d.kcal), _iaV(d.prot), _iaV(d.carbs), _iaV(d.fat),\n"
     "                         {normaliser:false, origine:'ia', champ:'estimation-ia', maxNom:80});",
     "    const _iaPl=4*(+d.prot||0)+9*(+d.fat||0);\n"
     "    const _iaRef={name:String(d.name||desc),kcal100:+d.kcal||0,prot100:+d.prot||0,\n"
     "      carbs100:+d.carbs||0,fat100:+d.fat||0,\n"
     "      fiab:((+d.kcal||0)<_iaPl)?{kcal:_iaPl,etat:'DERIVE_ESTIMABLE',methode:'derive_macros',\n"
     "        raison:'plancher_energetique',brut:+d.kcal||0,champ:'P/G/L',champSource:'estimation-ia',\n"
     "        confiance:'derivee',origine:'ia'}:{kcal:+d.kcal||0,etat:'COHERENT',methode:'source',\n"
     "        raison:'',brut:+d.kcal||0,champ:'estimation-ia',champSource:'estimation-ia',\n"
     "        confiance:'source',origine:'ia'}};",
     'rouge', 'DEGUISEE : un SECOND resolveur est ecrit sur place (la loi dupliquee)'),

    # ── L ABSENCE NE DOIT PAS DEVENIR UN ZERO ────────────────────────────────────
    ('M03', AP,
     "    const _iaV=x=>_iaLa(x)?(_iaG?_per100d1((+x)*100/_iaG):+x):undefined;",
     "    const _iaV=x=>(_iaG?_per100d1((+x||0)*100/_iaG):(+x||0));",
     'rouge', 'une macro ABSENTE redevient un zero legitime (R29)'),

    ('M04', AP,
     "    const _iaLa=x=>(x!==undefined&&x!==null&&x!==''&&isFinite(+x));",
     "    const _iaLa=x=>(x!==undefined);",
     'rouge', 'la presence cesse d exiger un nombre'),

    # ── LES DEUX BRANCHES ────────────────────────────────────────────────────────
    ('M05', AP,
     "      _afFiab=(_zf&&_zf.etat!=='COHERENT')",
     "      _bcNutr=_iaRef;\n"
     "      _afFiab=(_zf&&_zf.etat!=='COHERENT')",
     'rouge', 'un pour-100 g est INVENTE alors que l IA n a donne aucun poids'),

    ('M06', AP,
     "      const _zf=(_iaRef&&_iaRef.fiab)||null;",
     "      const _zf=(_iaRef&&_iaRef.fiab)||null;\n"
     "      if(_zf&&_zf.etat!=='COHERENT')document.getElementById('af-kcal').value=Math.round(_zf.kcal);",
     'rouge', 'CORRECTION SILENCIEUSE : on reecrit sans qu aucun ecran l explique'),

    ('M07', AP,
     "        ? Object.assign({}, _zf, {etat:'NON_RESOLU', methode:'observation',\n"
     "                                  kcal:_zf.brut, confiance:'source'})",
     "        ? Object.assign({}, _zf, {etat:'NON_RESOLU', methode:'observation'})",
     'rouge', 'DEGUISEE : la trace annonce un `retenu` que la ligne ne porte pas'),

    ('M08', AP,
     "  try{ _afFiab=null; }catch(e){}",
     "  try{ ; }catch(e){}",
     'rouge', 'R15 : le verdict du repas PRECEDENT se colle au suivant'),

    ('M09', AP,
     "    const _z=(typeof _bcNutr==='object' && _bcNutr && _bcNutr.fiab) ? _bcNutr.fiab\n"
     "            : ((typeof _afFiab==='object' && _afFiab) ? _afFiab : null);",
     "    const _z=((typeof _afFiab==='object' && _afFiab) ? _afFiab\n"
     "            : ((typeof _bcNutr==='object' && _bcNutr && _bcNutr.fiab) ? _bcNutr.fiab : null));",
     'rouge', 'la priorite s inverse : un verdict sans pour-100 g passe devant celui qui en a un'),

    # ── L ORIGINE : le point le plus silencieux ──────────────────────────────────
    ('M10', AP,
     "{normaliser:false, origine:'ia', champ:'estimation-ia', maxNom:80});",
     "{normaliser:false, origine:'manuel', champ:'estimation-ia', maxNom:80});",
     'rouge', 'DEGUISEE : l estimation se declare « manuel », donc le resolveur cesse de resoudre'),

    ('M11', AP,
     "const NRJ_ORIGINES_UTILISATEUR = ['manuel', 'reprise', 'historique'];",
     "const NRJ_ORIGINES_UTILISATEUR = ['manuel', 'reprise', 'historique', 'ia'];",
     'rouge', '« ia » devient une origine utilisateur (le resolveur ne la touche plus)'),

    # ── LA TRACE QUI PART AVEC LA LIGNE ──────────────────────────────────────────
    ('M12', AP,
     "    if(_z && _z.etat!=='COHERENT'){",
     "    if(_z){",
     'rouge', 'toute ligne porte desormais une trace (elle ne doit pas grossir pour rien)'),

    ('M13', AP,
     "      p.fiab={ etat:z.etat, methode:z.methode, raison:z.raison,",
     "      p.fiab={ etat:z.etat, methode:z.methode, raison:'',",
     'rouge', 'la raison ne part plus avec la ligne'),

    ('M14', AP,
     "      (_iaG&&_iaRef)?{per100:_per100De(_iaRef)}:{},",
     "      {},",
     'rouge', 'REGRESSION : la ligne reperd son pour-100 g'),

    # ⚠️ LE DEFAUT D ORDRE QUE J AI REELLEMENT COMMIS : l oubli apres la pose efface la trace
    #    dans la milliseconde, sans lever la moindre erreur.
    ('M15', AP,
     "    _afCoherence();        // une estimation IA incohérente se voit tout de suite",
     "    try{ _afOublierAliment(); }catch(e){}\n"
     "    _afCoherence();        // une estimation IA incohérente se voit tout de suite",
     'rouge', 'DEGUISEE : l oubli passe APRES la pose et efface la trace en silence (R15)'),

    ('M16', AP,
     "      if(_iaRef.fiab&&(_iaRef.fiab.etat==='ALTERNATIVE_FIABLE'||_iaRef.fiab.etat==='DERIVE_ESTIMABLE'))\n"
     "        document.getElementById('af-kcal').value=Math.round(_iaRef.fiab.kcal*_iaG/100);",
     "      ;",
     'rouge', 'la valeur resolue n atteint plus le champ (l ecran et la donnee divergent)'),

    ('M17', AP,
     "        document.getElementById('af-kcal').value=Math.round(_iaRef.fiab.kcal*_iaG/100);",
     "        document.getElementById('af-kcal').value=Math.round(_iaRef.fiab.kcal);",
     'rouge', 'DEGUISEE : on oublie de remultiplier par le poids (pour-100 g pris pour un total)'),

    # ── LE PERIMETRE ─────────────────────────────────────────────────────────────
    ('M18', AP,
     "  if(f.fiab.etat==='ALTERNATIVE_FIABLE' || f.fiab.etat==='DERIVE_ESTIMABLE') f.kcal100 = f.fiab.kcal;",
     "  if(f.fiab.etat==='ALTERNATIVE_FIABLE') f.kcal100 = f.fiab.kcal;",
     'rouge', '`_ref100` a ete modifie (interdit par le brief)'),

    ('M19', AP, "const NRJ_PROT = 4, NRJ_LIP = 9;", "const NRJ_PROT = 4, NRJ_LIP = 8;",
     'rouge', 'les facteurs UE 1169/2011 ont change'),

    ('M20', AP, "const DOUANE_OBS_CLE = 'ft4_douane_obs';", "const DOUANE_OBS_CLE = 'ft4_douane_obs2';",
     'rouge', 'la douane a ete touchee (hors perimetre)'),

    # ── ⭐ LES DEUX QUI DOIVENT RESTER VERTES ─────────────────────────────────────
    ('V01', AP,
     "function _afSetSrc(o){ _afSrc=o||null; }",
     "/* note : _ref100, origine:'ia', NON_RESOLU, observation, _afFiab, _bcNutr, _per100De,\n"
     "   plancher_energetique, DERIVE_ESTIMABLE, _resoudreNutrition, NRJ_PROT, NRJ_LIP,\n"
     "   estimation-ia, ft4_douane_obs sont cites ici, en commentaire */\n"
     "function _afSetSrc(o){ _afSrc=o||null; }",
     'vert', 'un COMMENTAIRE citant tous les mots cherches ne doit rien changer'),

    ('V02', AP,
     "function _ref100(nom, kcal, prot, carbs, fat, opts){",
     "/* note : 4*prot, 9*fat, _nrjPlancher, _nrjAtwater, ALTERNATIVE_FIABLE, kcal100,\n"
     "   NRJ_ORIGINES_UTILISATEUR sont cites ici, juste au-dessus du proprietaire */\n"
     "function _ref100(nom, kcal, prot, carbs, fat, opts){",
     'vert', 'idem au-dessus du proprietaire unique'),
]


def lancer():
    p = subprocess.run(['node', 'tools/banc_ia_ref100.js'],  # noqa
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
