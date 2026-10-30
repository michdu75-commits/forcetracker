#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUT-REF-HIST-01 (30/10/2026) : le banc `tools/banc_nut_ref_hist.js` sait-il ROUGIR, et au BON endroit ?

[!!] SUR UNE COPIE JETABLE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque mutation retire UN morceau du controle dans un clone ; le depot n'est
jamais ecrit. Point de depart : 0 rouge sur l'arbre sain. Une mutation est TUEE si le banc rougit (code 1) ET si CHACUN des temoins attendus
fait partie des rouges. Un PLANTAGE (code 2) n'est jamais un verdict. Une ancre absente ou multiple arrete tout. L'extrait ORIGINAL et
l'extrait MUTE sont imprimes.
Usage : python3 tools/mut_nut_ref_hist.py [R01|R02,R05|R10+]   (« R10+ » = de R10 jusqu'a la fin)
"""
import os, re, shutil, subprocess, sys, tempfile, time

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = 'app.js'
S = lambda *c: ['B-NRH ' + x + ' ' for x in c]

MUT = [
    ('R01 le controle ne voit plus l energie impossible (le plancher 4P + 9L)',
     [(A, "    if(k>0){ if(_nrjPlancher(k, pr, f)) return {etat:'suspect', raison:'energie_impossible'}; }", "    if(k>0){ /* R01 */ }")], S('C1', 'P7', 'P10'), 'GARDE'),
    ('R02 le controle ne voit plus la masse impossible',
     [(A, "    if(fiche.base==='g' && ['prot','carbs','fat'].every(c=>typeof p[c]==='number') && _masseImpossibleVals(100, p.prot, p.carbs, p.fat))", "    if(false && _masseImpossibleVals(100, p.prot, p.carbs, p.fat))")], S('C7'), 'GARDE'),
    ('R03 la preuve de source est ignoree (jamais admissible)',
     [(A, "  return {etat:'admissible'};\n}", "  return {etat:'non_verifiee', raison:'source_non_confirmee'};\n}")], S('C2', 'C4', 'C9'), 'GARDE'),
    ('R04 une fiche coherente est declaree admissible sans preuve independante',
     [(A, "    return {etat:'non_verifiee', raison:'source_non_confirmee'};\n  }\n  return {etat:'admissible'};", "    return {etat:'admissible'};\n  }\n  return {etat:'admissible'};")], S('C2', 'C3'), 'GARDE'),
    ('R05 la formule 4P + 4G + 9L sert de veto (trop strict : fibres, polyols, alcool)',
     [(A, "    return {etat:'non_verifiee', raison:'source_non_confirmee'};\n  }\n  return {etat:'admissible'};", "    if(Math.abs(k-(4*pr+4*(+p.carbs||0)+9*f))>20) return {etat:'suspect', raison:'ecart_atwater'};\n    return {etat:'non_verifiee', raison:'source_non_confirmee'};\n  }\n  return {etat:'admissible'};")], S('C8b'), 'GARDE'),
    ('R06 l arithmetique passe de nouveau AVANT la preuve (une source independante est jugee comme une copie)',
     [(A, "  if(!preuveSource){\n    const k=p.kcal,", "  if(true){\n    const k=p.kcal,")], S('C9', 'C2', 'C4'), 'GARDE'),
    ('R07 la tolerance devient stricte (aucune marge d arrondi)',
     [(A, "    if(k>0){ if(_nrjPlancher(k, pr, f)) return {etat:'suspect', raison:'energie_impossible'}; }", "    if(k>0){ if(k < 4*pr+9*f) return {etat:'suspect', raison:'energie_impossible'}; }")], S('C5'), 'GARDE'),
    ('R08 0 kcal avec des proteines n est plus impossible',
     [(A, "    else if(pr>0 || f>0){   // 0 kcal est un vrai zéro seulement sans protéines ni lipides", "    else if(false){   // R08")], S('C4'), 'GARDE'),
    ('R09 une valeur negative est acceptee',
     [(A, "if(typeof x!=='number' || !isFinite(x) || x<0) return {etat:'suspect', raison:'valeur_invalide'};", "if(typeof x!=='number' || !isFinite(x)) return {etat:'suspect', raison:'valeur_invalide'};")], S('C6'), 'GARDE'),
    ('R10 des calories absentes sont lues comme un zero',
     [(A, "  if(typeof p.kcal!=='number') return {etat:'non_verifiee', raison:'energie_absente'};", "  if(typeof p.kcal!=='number') p.kcal=0;")], S('C4'), 'GARDE'),
    ('R11 le lecteur unique ne coupe plus la fiche suspecte',
     [(A, "  if(c.etat==='suspect')\n    return Object.assign({}, R, {fiche:null,", "  if(false)\n    return Object.assign({}, R, {fiche:null,")], S('P7', 'P8', 'P10', 'P14'), 'GARDE'),
    ('R12 le code-barres retrouve de nouveau sa fiche dans le journal (copie prise pour une preuve)',
     [(A, "  return (v && v.preuve) ? v.fiche : null;", "  return v ? v.fiche : null;")], S('P2', 'P3'), 'GARDE'),   # P5 reste vert : la frontiere (non_verifiee) ferme aussi cette porte
    ('R13 les fiches « verifiees » du journal reprennent la fiche suspecte (lecture brute)',
     [(A, "    const R=_n2Reprise(l); if(!R.ok || !R.fiche || R.fiche.fiab!=='source') return;   // NUT-REF-HIST-01", "    const R=N.reprise(l, _n2Ctx()); if(!R.ok || !R.fiche || R.fiche.fiab!=='source') return;   // NUT-REF-HIST-01")], S('P1'), 'GARDE'),   # P6 reste vert : `differe` exige maintenant preuve:true (deux gardes)
    ('R14 l incoherence ne connait plus la fiche suspecte',
     [(A, "  if(R.ficheSuspecte) return {code:'suspecte', texte:_N2_REF_SUSPECTE};", "  /* R14 */")], S('P7', 'P8'), 'GARDE'),
    ('R15 le re-ajout / repas habituel relit la fiche brute',
     [(A, "  const R=_n2Reprise(src);\n  if(!R || !R.ok) return R || {ok:false, erreur:'REPRISE_INVALIDE'};", "  const R=NUT2.reprise(src, _n2Ctx());\n  if(!R || !R.ok) return R || {ok:false, erreur:'REPRISE_INVALIDE'};")], S('P7', 'P8'), 'GARDE'),
    ('R16 la reprise a l ecran recopie les macros de la fiche suspecte',
     [(A, "(c in R.valeurs && !bloquee)?R.valeurs[c]:''", "(c in R.valeurs)?R.valeurs[c]:''")], S('P14'), 'GARDE'),
    ('R17 la reprise a l ecran emporte l identite de la fiche suspecte',
     [(A, "    if(_sid && _afSrc && !bloquee) _afSrc.sourceId=_sid.slice(0,32);", "    if(_sid && _afSrc) _afSrc.sourceId=_sid.slice(0,32);")], S('P14'), 'GARDE'),
    ('R18 la reprise a l ecran ne prend plus le chemin « saisie libre » pour une fiche suspecte',
     [(A, "  }else if(!q || bloquee){", "  }else if(!q){")], S('P14'), 'GARDE'),
    ('R19 la phrase de la regle n est plus dite sur l ecran d ajout',
     [(A, "_escFood(_afRepriseVide.texte||_N2_VIDE)", "_escFood(_N2_VIDE)")], S('P14'), 'GARDE'),
    ('R20 « Modifier » relit la fiche brute',
     [(A, "  _efR=_n2Reprise(e); if(_efR && !_efR.ok) _efR=null;", "  _efR=(typeof NUT2==='object'&&NUT2)?NUT2.reprise(e, _n2Ctx()):null; if(_efR && !_efR.ok) _efR=null;")], S('P10', 'P11'), 'GARDE'),
    ('R21 « Enregistrer » recalcule une ligne a fiche suspecte (chemin coupe)',
     [(A, "  if(R.ficheSuspecte){\n    if(!_editFoodMeal)", "  if(false && R.ficheSuspecte){\n    if(!_editFoodMeal)")], S('P12'), 'GARDE'),
    ('R22 la fiche suspecte ne verrouille plus l ecran « Modifier »',
     [(A, "|| _efR.ficheSuspecte));   // NUT-REF-HIST-01 : une fiche suspecte verrouille aussi", "));   // NUT-REF-HIST-01 : une fiche suspecte verrouille aussi")], S('P10'), 'GARDE'),
    ('R23 la preuve CIQUAL est toujours refusee',
     [(A, "  return !!ref && _n2MemesValeurs(fiche.p100, ref.p100);\n}\n/* La table, elle, DIT", "  return false;\n}\n/* La table, elle, DIT")], S('P17'), 'GARDE'),
    ('R24 la preuve est accordee sans verifier la table (toute copie de journal devient « prouvee »)',
     [(A, "  const ref=_n2RefTable(sid);\n  return !!ref && _n2MemesValeurs(fiche.p100, ref.p100);\n}\n/* La table, elle, DIT", "  return true;\n}\n/* La table, elle, DIT")], S('P2', 'P4'), 'GARDE'),
    ('R25 la copie d un code-barres est annoncee comme fiche du produit (proposition de candidat)',
     [(A, "dispo:ok, nomFiche:'', kcal:p ? p.kcal : null};", "dispo:!!v, nomFiche:'', kcal:(v && v.fiche && v.fiche.p100) ? v.fiche.p100.kcal : null};")], S('P3b'), 'GARDE'),
    ('R26 la fiche CIQUAL par identifiant n est plus rendue',
     [(A, "    return _n2ControlerReference(F, true).etat==='suspect' ? null : F;   // la table fait foi (preuve) ; seule une valeur invalide l'écarte", "    return null;")], S('P17'), 'GARDE'),
    ('R27 le re-ajout d une ligne coherente est bloque a tort (parcours conforme casse)',
     [(A, "  if(c.etat==='suspect')\n    return Object.assign({}, R, {fiche:null,", "  if(c.etat!=='admissible')\n    return Object.assign({}, R, {fiche:null,")], S('P13', 'P19'), 'GARDE'),
    # ── CORRECTIF FINAL : la frontière non_verifiee (30/10) ──
    ('R28 le re-ajout / favori / repas habituel recree une ligne depuis une fiche OFF non verifiee (garde coupee)',
     [(A, "  if(_n2FicheNonVerifiee(R)){\n    const raison={code:'source_non_confirmee'", "  if(false && _n2FicheNonVerifiee(R)){\n    const raison={code:'source_non_confirmee'")], S('P9', 'P9b', 'P9c'), 'GARDE'),
    ('R29 l apercu fabrique une ligne (calories comptees dans la carte du repas habituel)',
     [(A, "return apercu ? {ok:true, ligne:null, R:R, raison:raison} :", "return apercu ? {ok:true, ligne:{kcal:129, prot:20, carbs:2, fat:5}, R:R, raison:raison} :")], S('P9c'), 'GARDE'),
    ('R30 le refus pose aussi aCompleter (les appelants testent aCompleter AVANT incoherente : mauvais message)',
     [(A, "{ok:false, incoherente:true, raison:raison};\n  }\n  if(!R.quantite)", "{ok:false, incoherente:true, aCompleter:true, raison:raison};\n  }\n  if(!R.quantite)")], S('P9'), 'GARDE'),
    ('R31 la frontiere ne reconnait plus aucune fiche non verifiee',
     [(A, "  return (R.fiche.source==='off' && R.controleReference.etat==='non_verifiee') || R.controleReference.contredite===true;", "  return false;")], S('P9', 'P9e', 'P13a', 'P13b'), 'GARDE'),
    ('R32 la frontiere s etend a TOUTE source (fiche declaree et enseigne bloquees a tort)',
     [(A, "  return (R.fiche.source==='off' && R.controleReference.etat==='non_verifiee') || R.controleReference.contredite===true;", "  return R.controleReference.etat==='non_verifiee' || R.controleReference.contredite===true;")], S('P9d'), 'GARDE'),
    ('R33 l ecran d ajout hydrate de nouveau _bcNutr avec une fiche non verifiee (contournement)',
     [(A, "  const bloquee=!!R.ficheSuspecte || _n2FicheNonVerifiee(R);", "  const bloquee=!!R.ficheSuspecte;")], S('P9e', 'P9f'), 'GARDE'),
    ('R34 _n2Verifiee accepte de nouveau fiab:source seul',
     [(A, " && a.R.controleReference && a.R.controleReference.etat==='admissible'); }", "); }")], S('P9h'), 'GARDE'),
    ('R35 une simple copie du journal juge de nouveau une autre saisie (cause differe sans preuve)',
     [(A, "  if(fv && fv.preuve===true && fv.id!==src.id", "  if(fv && fv.id!==src.id")], S('P6b'), 'GARDE'),
    ('R36 la ligne modifiee n est plus marquee « non verifiee »',
     [(A, "    if(nonVerifiee) entree.notes=['reprise-non-verifiee'];", "    /* R36 */")], S('P13'), 'GARDE'),
    ('R37 « Modifier » met a jour un favori depuis une fiche non verifiee',
     [(A, "  if(!nonVerifiee) _majDefFavori(r.ligne);", "  _majDefFavori(r.ligne);")], S('P13'), 'GARDE'),
    ('R38 l avertissement de recalcul n est plus dit quand la quantite change',
     [(A, "(change ? _N2_NV_QTE : _N2_NV_GARDE)", "_N2_NV_GARDE")], S('P13b'), 'GARDE'),
    ('R39 le verdict du controle n est plus attache a la reprise (rien ne le voit)',
     [(A, "  return Object.assign({}, R, {controleReference:ctl});", "  return R;")], S('P9', 'P9c', 'P9e', 'P13a'), 'GARDE'),
    ('R40 la ligne modifiee devient une fiche prouvee (promotion de confiance)',
     [(A, "const preuve=_n2PreuveSource(R.fiche, sid), ts=+l.ts||0;", "const preuve=true, ts=+l.ts||0;")], S('P13c', 'P2'), 'GARDE'),
    # ── PUBLICATION ft-v1263 : bases locales (enseigne, CIQUAL), priorité de la preuve, reprise OFF en ligne ──
    ('R41 la fiche d enseigne n est plus prouvee par sa base locale',
     [(A, "  if(sid.indexOf('marque:')===0 && typeof _marques==='object' && _marques && Array.isArray(_marques.a)){", "  if(false && sid.indexOf('marque:')===0 && typeof _marques==='object' && _marques && Array.isArray(_marques.a)){")], S('P20a'), 'GARDE'),
    ('R42 une copie CIQUAL que la table contredit n est plus detectee',
     [(A, "  return !!ref && !_n2MemesValeurs(fiche.p100, ref.p100);", "  return false;")], S('P20b', 'P20c'), 'GARDE'),
    ('R43 la preuve ne passe plus avant la date dans les fiches verifiees',
     [(A, "if(!o[sid] || (preuve && !o[sid].preuve) || (preuve===o[sid].preuve && ts>o[sid].ts))", "if(!o[sid] || ts>o[sid].ts)")], S('P20d'), 'GARDE'),
    ('R44 la frontiere ignore la contradiction de la table',
     [(A, " || R.controleReference.contredite===true;", " || false;")], S('P20b'), 'GARDE'),
    ('R45 une copie contredite n est plus remplacee par la table a l ecran',
     [(A, " && !(R0.controleReference && R0.controleReference.contredite))) return R0;", ")) return R0;")], S('P20c'), 'GARDE'),
    ('R46 la reponse d un AUTRE code-barres est appliquee a la reprise',
     [(A, "  if(p && p.code && String(p.code).replace(/^0+/,'')!==String(ean).replace(/^0+/,'')){", "  if(false && p && p.code){")], S('P9j'), 'GARDE'),
    ('R47 l ecart avec l ancienne saisie et l ancienne quantite ne sont plus transmis a la reprise en ligne',
     [(A, "(q && (q.unite==='g' || q.unite==='ml')) ? q.val : 0, R.nom||'', q && q.unite, R.valeurs);", "0, R.nom||'');")], S('P9i'), 'GARDE'),
    ('R48 la table CIQUAL absente fabrique une preuve (copie declaree prouvee)',
     [(A, "  return !!ref && _n2MemesValeurs(fiche.p100, ref.p100);", "  return !ref || _n2MemesValeurs(fiche.p100, ref.p100);")], S('P17a'), 'GARDE'),
]

def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_nut_ref_hist.js'], cwd=arbre, capture_output=True, text=True, timeout=900)
    out = r.stdout or ''
    last = [l for l in out.split('\n') if ' OK / ' in l]
    rouges = [l.split('rouge : ', 1)[1] for l in out.split('\n') if l.startswith('  rouge : ')]
    return r.returncode, (last[-1].strip() if last else (r.stderr or '')[-160:]), rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_refhist_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'audits', 'worktrees'))
    return tmp, a


def main():
    seul = sys.argv[1] if len(sys.argv) > 1 else None
    tmp0, a0 = cloner()
    rc, res, _ = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rc != 0:
        print('  !! ARBRE SAIN DEJA ROUGE OU PLANTE — controle refuse :', res); return 1
    print('  arbre sain : %s (point de depart valide)\n' % res)
    conformes, total = 0, 0
    depuis = bool(seul and seul.endswith('+'))
    if depuis:
        seul = seul[:-1]
    actif = not depuis
    for nom, rempl, attendus, attendu in MUT:
        if depuis and nom.startswith(seul + ' '):
            actif = True
        if seul and not depuis and not any(nom.startswith(x + ' ') for x in seul.split(',')):
            continue
        if depuis and not actif:
            continue
        total += 1
        tmp, arbre = cloner()
        print('--- %s' % nom)
        for f, old, new in rempl:
            p = os.path.join(arbre, f)
            s = open(p, encoding='utf-8').read()
            if s.count(old) != 1:
                print('  !! ANCRE INTROUVABLE OU MULTIPLE (%d) : %s' % (s.count(old), nom)); shutil.rmtree(tmp, ignore_errors=True); return 1
            open(p, 'w', encoding='utf-8').write(s.replace(old, new))
            print('     [%s] ORIGINAL : %s' % (f, old.strip().replace('\n', ' ⏎ ')[:230]))
            print('     [%s] MUTE     : %s' % (f, new.strip().replace('\n', ' ⏎ ')[:230]))
        for f in sorted(set(x[0] for x in rempl)):
            chk = subprocess.run(['node', '-e', "new Function(require('fs').readFileSync('%s','utf8'))" % f], cwd=arbre, capture_output=True)
            if chk.returncode != 0:
                print('  !! MUTATION QUI CASSE LA SYNTAXE (refusee) : %s' % nom); shutil.rmtree(tmp, ignore_errors=True); return 1
        rc, res, rouges = banc(arbre)
        shutil.rmtree(tmp, ignore_errors=True)
        manquants = [w for w in attendus if not any(r.startswith(w) for r in rouges)]
        ok = rc == 1 and not manquants
        conformes += ok
        print('  %s %s -> %s  [%s]' % ('TUEE      ' if ok else 'SURVIVANTE', nom[:60], res, 'code %d' % rc))
        if manquants:
            print('       temoin(s) attendu(s) reste(s) VERT(S) : %s' % ' · '.join(manquants))
        if rc == 2:
            print('       PLANTAGE : ce n\'est pas un verdict')
        print('       rouges : %s\n' % (' · '.join(re.sub(r' (⭐|—|:|\().*', '', x)[:24] for x in rouges) or 'aucun'))
    print('\n%d/%d tuees (conformes)' % (conformes, total))
    return 0 if conformes == total and total > 0 else 1


if __name__ == '__main__':
    sys.exit(main())
