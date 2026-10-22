#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTRÔLE NÉGATIF — NUTRITION V2, JALON 4 (22/10/2026) : les témoins de la passe complète RÉÉCRITS sur le contrat V2
savent-ils ROUGIR ?

Brancher le moteur V2 a obligé à réécrire ~120 témoins écrits pour V1 (règle d'or #17 : *tout témoin réécrit doit ensuite
rougir sous mutation volontaire*). Chaque mutation casse UNE garantie du branchement (`app.js`), sur une COPIE complète de
l'app (jamais le dépôt, BUGS.md §60), dans un espace réseau isolé (tools/isoler_reseau.py --en-ligne). La passe est
RÉDUITE aux blocs visés (tools/passe_reduite.js) : un contrôle ciblé, ⛔ jamais une passe complète (protocole D-031).
Une mutation est conforme si CHACUN de ses témoins attendus rougit ; un plantage n'est jamais compté comme « attrapé ».
L'arbre sain est rejoué d'abord : tous les témoins attendus y sont VERTS (sinon le contrôle est refusé).
Un libellé attendu finissant par « $ » doit être la ligne ENTIÈRE (deux témoins commencent pareil).
Usage : python3 tools/mut_temoins_v2.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : toutes les lignes rouges)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RE_SECRET = re.compile(r'(KEY|TOKEN|SECRET|PASSW|CREDENTIAL|AUTH|COOKIE|BEARER|SESSION|API_?K|JETON|MOT_?DE_?PASSE|MDP)', re.I)

# Les blocs, par un morceau de leur en-tête (le texte SOURCE du runner : une apostrophe y est « \' »).
B = {
    'LXXXII': "LXXXII. Des propositions", 'CIV': "CIV. Code-barres : quatre chemins", 'LXXXV': "LXXXV. Modifier le poids", 'XCI': "XCI. La quantité pour toutes",
    'XCIV': "BLOC XCIV. La quantite sur une phrase libre", 'CLX': "CLX. La quantité au choix",
    'CLXI': "CLXI. « La dernière fois »", 'CLXXI': "CLXXI. Le choix d", 'CLXXII': "CLXXII. Les 4 routes",
    'CCXIII': "CCXIII. Une valeur fausse", 'CCLVII': "CCLVII. Le champ « poids", 'CCLXXI': "CCLXXI. Portions puis grammes",
    'CCLXXV': "CCLXXV. L\\'invariant", 'CCLXXVII': "CCLXXVII. L\\'exclusivité", 'CCLXXVIII': "CCLXXVIII. P0",
    'CCLXXX': "BLOC CCLXXX —", 'CCLXXXIV': "BLOC CCLXXXIV —", 'CCLXXXV': "BLOC CCLXXXV —", 'CCLXXXVII': "BLOC CCLXXXVII —",
    'CCCIV': "CCCIV. Les 3 constats",      # entraîne CCXC et B-NV2X (sans en-tête propre)
    'BCCCXI': "B-CCCXI. Le RIR",           # entraîne CCCIII (la douane, sans en-tête propre)
    'CCCVI': "BLOC CCCVI —",
}

MUT = [
    ('R01 D-099 : « ×2 » SANS le poids d\'une portion multiplie les valeurs (V1)', ['CCLXXI', 'CCLXXX', 'CCLXXXIV', 'XCIV', 'CLX'],
     [('app.js', "  if(!(+poids>0) || !(+n>0) || +n===1){\n    _n2Afficher(pre, {ok:true, valeurs:_n2Presentes(base)}, null);\n  }else{",
       "  if(!(+n>0) || +n===1){\n    _n2Afficher(pre, {ok:true, valeurs:_n2Presentes(base)}, null);\n  }else if(!(+poids>0)){\n"
       "    const _v=_n2Presentes(base), _o={}; Object.keys(_v).forEach(c=>{ _o[c]=Math.round(_v[c]*n); }); _n2Afficher(pre, {ok:true, valeurs:_o}, null);\n  }else{")],
     ['CCLXXI ① ⛔ D-099', 'CCLXXX ① ⛔ D-099', 'CCLXXXIV ⑤', "⛔ D-099 : « ×2 » SANS le poids d'une portion ne multiplie rien$",
      "⛔ D-099 : « ×2 » SANS le poids d'une portion ne multiplie rien (120 kcal"]),
    ('R02 D-099 : une portion SANS poids s\'enregistre (100 g inventés)', ['CCLXXX', 'CCLXXXIV'],
     [('app.js', "    if(!(+_afPortionPoids>0)) return {ok:false, message:'Indique le poids d\\'une portion — sans lui, ce n\\'est pas une quantité. Ou passe en grammes.'};",
       "    if(!(+_afPortionPoids>0)) _afPortionPoids=100;")],
     ['CCLXXX ① ⛔ D-099', 'CCLXXXIV ③']),
    ('R03 garde-fou du 10/09 : des valeurs SANS poids reçoivent 100 g inventés', ['CCLXXVII', 'CCLXXVIII', 'CCLXXX'],
     [('app.js', "  return {ok:false, message:'Combien pesait ce que tu as mangé ? Indique le poids en grammes (ou le volume en ml).'};",
       "  return {ok:true, entree:Object.assign(e, {mode:'declaree', declare:vals, quantite:{val:100, unite:'g'}})};")],
     ['CCLXXVII ②', 'CCLXXVIII ③', 'CCLXXX ⑦']),
    ('R04 D-101 ⑧ : une reprise figée accepte une AUTRE quantité avec les valeurs de l\'ancienne', ['CCLXXV', 'CCLXXVII', 'CCLXXVIII'],
     [('app.js', "    if(R.qte && !_afValeursTapees && !(q.unite===R.qte.unite && q.val===R.qte.val))", "    if(false)")],
     ['CCLXXV ①', 'CCLXXVII ⑫', 'CCLXXVIII ⑫']),
    ('R05 M1 à l\'écran : une ancienne ligne NON vérifiée devient une fiche (son pour-100 g noté repris)', ['CCLXXV', 'CCLXXXIV'],
     [('app.js', "  const q=R.quantite;\n  if(R.fiche){",
       "  const q=R.quantite;\n  if(!R.fiche && src && src.per100 && src.per100.kcal>0) R.fiche={base:'g', p100:src.per100, cle:src.sourceId||null, source:'utilisateur', fiab:'declaree'};\n  if(R.fiche){")],
     ['CCLXXV ⛔ CONTRÔLE — la reprise de l\'ancienne ligne garde le COUPLE', 'CCLXXXIV ⑦']),
    ('R06 M1 hors écran : l\'ajout direct d\'une ancienne ligne reprend son pour-100 g et son code-barres', ['CCLXXV'],
     [('app.js', "  if(R.fiche){\n    e.mode='pesee'; e.fiche=R.fiche;",
       "  if(R.fiche || (src && src.per100 && (R.fiche={base:'g', p100:src.per100, cle:src.sourceId||null, source:'utilisateur', fiab:'declaree'}))){\n    e.mode='pesee'; e.fiche=R.fiche;")],
     ['CCLXXV ④']),
    ('R07 reprise pesée : « la dernière fois » n\'est plus proposée', ['CCLXXV', 'CCLXXX', 'CCLXXXIV', 'CCLXXXV', 'CCLXXXVII'],
     [('app.js', "    _bcProposerDerniere(qDer);", "    _bcProposerDerniere(0);")],
     ['CCLXXX ④', 'CCLXXXIV ⑪', 'CCLXXXV ⑱', 'CCLXXXVII ⑮']),
    ('R08 la référence tapée est arrondie à l\'ENTIER avant le moteur (ft-v1188 rouvert)', ['CCCIV', 'CCLXXXV'],
     [('app.js', "    p100[c]=(ref===100)?(+x):(+x)*100/ref;", "    p100[c]=(ref===100)?(+x):Math.round((+x)*100/ref);")],
     ['B-NV2X ①', 'B-NV2X ②', 'CCLXXXV ⑯']),
    ('R09 « Modifier » s\'ouvre toujours en grammes (la portion d\'une ligne est perdue)', ['CCLXXX', 'CCLXXXV'],
     [('app.js', "  _efUniteDecl=(_efR && _efR.quantite) ? _efR.quantite.unite : 'g';", "  _efUniteDecl='g';")],
     ['CCLXXXV ①', 'CCLXXXV ⑦ ⛔', 'CCLXXX ⑪']),
    ('R10 retour aux portions : l\'ancien poids d\'une portion se recolle en silence', ['CCLXXI'],
     [('app.js', "  if(_afUnite==='portion' && _uAvant!=='portion') _afPortionPoids=0;", "")],
     ['CCLXXI ⑤ ⛔⛔']),
    ('R11 valeur retouchée : le poids de « 1 portion » d\'avant survit', ['CCLXXX'],
     [('app.js', "  if(relit){ if(_afPortions!==1) _afPortionPoids=0; _afPortions=1; _afPortionPose=false; }",
       "  if(relit){ _afPortions=1; _afPortionPose=false; }")],
     ['CCLXXX ⑨']),
    ('R12 « Modifier » : une autre quantité passe avec les valeurs notées (D-101 ⑧, la jumelle)', ['XCI', 'CLXXI'],
     [('app.js', "    if(q0 && !_efValeursTapees && !(q.unite===q0.unite && q.val===q0.val",
       "    if(false && q0 && !_efValeursTapees && !(q.unite===q0.unite && q.val===q0.val")],
     ['⛔⛔ 🥗 V2 (D-101 ⑧) : une AUTRE quantité (300 g)', '⛔⛔ D-101 ⑧ : 40 g SANS retoucher']),
    ('R13 « Modifier » pré-remplit une quantité absente (100)', ['LXXXV', 'CLXXI', 'CCLXXX'],
     [('app.js', "  const val=(q && q.unite===_efUniteDecl) ? q.val : '';", "  const val=(q && q.unite===_efUniteDecl) ? q.val : 100;")],
     ["⛔ ... et on n'invente pas une quantité", '⭐ la quantité est DEMANDÉE, et le champ est VIDE', 'CCLXXX ⑭']),
    ('R14 la reprise à l\'écran d\'une ligne non vérifiée ne dit plus « reprise »', ['LXXXII'],
     [('app.js', "    _afSetSrc({saisie:saisie, origine:'reprise'});\n    _afRef={base:R.valeurs",
       "    _afSetSrc({saisie:saisie, origine:'utilisateur'});\n    _afRef={base:R.valeurs")],
     ["⛔ ... la provenance dit « historique »"]),
    ('R15 l\'écrivain unique ne passe plus par la douane', ['BCCCXI'],
     [('app.js', "  try{ _douaneLigne(r.ligne, porte); }catch(e){}", "")],
     ['CCCIII ⑫']),
    ('R16 une saisie pesée à la main (référence en g) ne s\'enregistre plus', ['CCLXXXV', 'CCLXXXVII'],
     [('app.js', "  if(R && (R.u==='g' || R.u==='ml') && R.q>0){   // ③", "  if(false && R && (R.u==='g' || R.u==='ml') && R.q>0){   // ③")],
     ['CCLXXXVII ⑬', 'CCLXXXV ⑰']),
    ('R17 reprise figée : la quantité posée échappe au contrôle de masse (ft-v1104 rouvert)', ['CCXIII'],
     [('app.js', "  _afCoherence();\n}\nfunction _afPrendreFige(){", "}\nfunction _afPrendreFige(){")],
     ["⛔⛔ … donc l'erreur ne se recopie plus en silence"]),
    ('R18 l\'aliment suivant hérite des portions (unité non remise aux grammes)', ['CLX'],
     [('app.js', "function _afResetUnite(){ _afPropPose=false; _afPropOrigine='tapee'; _afUnite='g';",
       "function _afResetUnite(){ _afPropPose=false; _afPropOrigine='tapee'; _afUnite='portion';")],
     ["⛔ l'unité et le poids déclaré sont REMIS À ZÉRO"]),
    ('R19 une reprise SANS quantité propose un poids inventé (100 g)', ['CLXI'],
     [('app.js', "    _afSetSrc({saisie:saisie, origine:'reprise'});\n    _afRef=null;\n    _afMajAncre(true);",
       "    _afSetSrc({saisie:saisie, origine:'reprise'});\n    _afRef=null; window._afIaGrammes=100; window._afIaDesc=R.nom||'';\n    _afMajAncre(true);")],
     ["⛔ NON-RÉGRESSION : un aliment sans quantité connue n'affiche AUCUNE pastille"]),
    ('R20 le poids supposé (IA, phrase) est INSCRIT dans le champ au lieu d\'être proposé', ['XCIV'],
     [('app.js', "value=\"'+(pose?qAff:'')+'\" placeholder=\"quantité en '+ancre.u+'\"",
       "value=\"'+(pose?qAff:ancre.v)+'\" placeholder=\"quantité en '+ancre.u+'\"")],
     ['⭐⭐ LE CAS DE MICHEL', '⭐ sans IA, le nombre ecrit']),
    ('R21 une route de quantité recalcule elle-même (sans le moteur)', ['CLXXII'],
     [('app.js', "  const _r=(typeof NUT2==='object' && NUT2) ? NUT2.calcule(_n2Fiche(_vals, ref, _u), {val:(v>0? v : ref), unite:_u}) : {ok:false};",
       "  const _f=(v>0? v : ref)/ref, _o={}; Object.keys(_vals).forEach(c=>{ _o[c]=Math.round((+_vals[c]||0)*_f); }); const _r={ok:true, valeurs:_o};")],
     ['⛔ R2 : les 4 routes passent par le MÊME moteur']),
    ('R22 `_ref100` rend un champ de plus', ['CCCIV'],
     [('app.js', "    && !(c==='kcal' && (f.fiab.etat==='ALTERNATIVE_FIABLE' || f.fiab.etat==='DERIVE_ESTIMABLE')));\n  return f;\n}",
       "    && !(c==='kcal' && (f.fiab.etat==='ALTERNATIVE_FIABLE' || f.fiab.etat==='DERIVE_ESTIMABLE')));\n  f.extra=1; return f;\n}")],
     ['CCXC ⛔⛔ `_ref100` rend EXACTEMENT']),
    ('R23 le champ source du résolveur n\'atteint plus la ligne', ['CCCVI'],
     [('app.js', "champ:z.champ, champSource:z.champSource, confiance:z.confiance,", "champ:z.champ, confiance:z.confiance,")],
     ['CCCVI ⑫']),
    ('R24 « Modifier » promet « recalcule » sur une ligne sans fiche vérifiée', ['CCLVII'],
     [('app.js', "tete('Quantité', 'indique combien tu en as mangé')", "tete('Quantité', 'recalcule les macros ci-dessous')")],
     ['CCLVII ⛔⛔ « Modifier » : le sous-titre ne promet pas']),
    ('R25 M1 dans « Modifier » : une ligne non vérifiée enregistrée « pesée » sur son pour-100 g noté', ['CCLXXXV'],
     [('app.js', "    entree=Object.assign(base, {mode:'declaree', declare:vals, quantite:q}, (R.statut==='non-verifiee')?{notes:['reprise-non-verifiee']}:{});",
       "    entree=(e.per100&&e.per100.kcal>0)?Object.assign(base, {mode:'pesee', fiche:{base:'g', p100:e.per100, source:'utilisateur', fiab:'declaree'}, quantite:q})"
       ":Object.assign(base, {mode:'declaree', declare:vals, quantite:q}, (R.statut==='non-verifiee')?{notes:['reprise-non-verifiee']}:{});")],
     ['CCLXXXV ⑦bis', 'CCLXXXV ⑩bis']),
    ('R26 un code-barres lu sans origine dite reprend l\'ancien « scan »', ['CIV'],
     [('app.js', "  _offRemplirFormulaire(p, ean, saisie||'camera-code-local', codeDouteux===true);",
       "  _offRemplirFormulaire(p, ean, saisie||'scan', codeDouteux===true);")],
     ['⭐⭐ les QUATRE chemins écrivent QUATRE provenances distinctes']),
]


def env_propre():
    e = {k: v for k, v in os.environ.items() if not RE_SECRET.search(k) and not re.match(r'(?i)(https?|all|no)_proxy$', k) and k != 'NODE_OPTIONS'}
    e['TZ'] = os.environ.get('TZ', '')
    if not e['TZ']: e.pop('TZ')
    return e


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_tv2_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'clone', 'audits', 'worktrees'))
    return tmp, a


def jouer(arbre, blocs):
    red = os.path.join(arbre, 'tests', 'parcours', 'runner.reduit.js')
    subprocess.run(['node', os.path.join(arbre, 'tools', 'passe_reduite.js'), os.path.join(arbre, 'tests', 'parcours', 'runner.js'), red]
                   + [B[k] for k in blocs], check=True, capture_output=True, text=True)
    r = subprocess.run([sys.executable, os.path.join(arbre, 'tools', 'isoler_reseau.py'), '--en-ligne', '--', 'node', red],
                       cwd=arbre, capture_output=True, text=True, timeout=1800, env=env_propre())
    out = r.stdout + r.stderr
    if 'isolement prouve' not in out:
        raise SystemExit('  !! ISOLEMENT NON PROUVÉ — contrôle arrêté :\n' + out[-500:])
    return out, ('TOTAL CROISÉ' in out)


def etat(out, total, libelle):
    exact = libelle.endswith('$')
    lib = libelle[:-1] if exact else libelle
    for l in out.split('\n'):
        m = re.match(r'^\s*(✅|❌) (.*)$', l)
        if not m: continue
        txt = m.group(2).rstrip()
        if (txt == lib) if exact else txt.startswith(lib):
            return 'vert' if m.group(1) == '✅' else 'rouge'
    return 'plantage' if not total else 'absent'


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    choisies = [m for m in MUT if not filtres or any(m[0].startswith(f) for f in filtres)]
    blocs = sorted({b for m in choisies for b in m[1]}, key=list(B).index)
    tmp0, a0 = cloner()
    out, tot = jouer(a0, blocs)
    shutil.rmtree(tmp0, ignore_errors=True)
    sains = {lib: etat(out, tot, lib) for m in choisies for lib in m[3]}
    pas_vert = {k: v for k, v in sains.items() if v != 'vert'}
    print('  arbre SAIN : %d témoin(s) attendu(s), %d vert(s)' % (len(sains), len(sains) - len(pas_vert)))
    if pas_vert:
        print('  !! un témoin attendu n\'est pas VERT sur l\'arbre sain — contrôle refusé :', pas_vert); return 1
    conformes = 0
    for nom, bl, edits, attendus in choisies:
        tmp, arbre = cloner()
        invalide = []
        for f, av, ap in edits:
            p = os.path.join(arbre, f); s = open(p, encoding='utf-8').read()
            if s.count(av) != 1: invalide.append('%s x%d' % (f, s.count(av))); continue
            open(p, 'w', encoding='utf-8').write(s.replace(av, ap, 1))
        if invalide:
            print('  INVALIDE  %s (ancre : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
        if subprocess.run(['node', '--check', os.path.join(arbre, edits[0][0])], capture_output=True).returncode:
            print('  INVALIDE  %s (syntaxe cassée)' % nom); shutil.rmtree(tmp, ignore_errors=True); continue
        out, tot = jouer(arbre, bl)
        res = {lib: etat(out, tot, lib) for lib in attendus}
        ok = tot and all(v == 'rouge' for v in res.values())
        conformes += bool(ok)
        rouges = [l.strip()[2:90] for l in out.split('\n') if '❌' in l]
        print('  %s  %s\n        attendus : %s\n        rouges (%d) : %s' % ('OK ' if ok else '!! ', nom, res, len(rouges),
              ' | '.join(rouges) if os.environ.get('MUT_DETAIL') else ' | '.join(rouges[:6])))
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, len(choisies)))
    return 0 if conformes == len(choisies) else 1


if __name__ == '__main__':
    raise SystemExit(main())
