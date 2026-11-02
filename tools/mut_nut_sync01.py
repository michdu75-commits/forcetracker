#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUT-SYNC-01 (01/11/2026) : le banc `tools/banc_nut_sync01.js` (identités stables, suppressions explicites, plusieurs appareils indépendants, vrai client,
vrai Code.js) sait-il ROUGIR, et au BON endroit ?

[!!] SUR UNE COPIE JETABLE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque mutation retire UN morceau du controle dans un clone ; le depot n'est jamais ecrit.
Point de depart : 0 rouge sur l'arbre sain. Une mutation est TUEE si le banc rougit (code 1) ET si CHACUN des temoins attendus fait partie des rouges.
Un PLANTAGE (code 2) n'est jamais un verdict. Une ancre absente ou multiple arrete tout. L'extrait ORIGINAL et l'extrait MUTE sont imprimes.
Usage : python3 tools/mut_nut_sync01.py [K01|K02,K05|K10+]   (« K10+ » = de K10 jusqu'a la fin)
"""
import os, re, shutil, subprocess, sys, tempfile, time

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = 'app.js'
ST = 'state.js'
SU = 'setup.js'
CO = 'Code.js'
G = lambda *c: ['B-NS01 ' + x + ' ' for x in c]

MUT = [
    # ── identité ──
    ('K01 l identite d une ancienne ligne redevient ALEATOIRE (avant la brique)',
     [(ST, "    do{ id='m1-'+h+(r>1?'-'+r:''); r++; }while(pris.has(id));", "    do{ id=_foodLineId(); r++; }while(pris.has(id));")], G('T04b', 'T06b'), 'GARDE'),
    ('K02 l identite ne repose que sur le nom, les calories et la date (deux repas distincts se confondent)',
     [(ST, "  const emp=l=>_empreinteFood(l);", "  const emp=l=>JSON.stringify([l.name,l.kcal,l.date]);")], G('T04c'), 'GARDE'),
    ('K03 deux lignes indiscernables recoivent LA MEME identite (fusionnees)',
     [(ST, "    do{ id='m1-'+h+(r>1?'-'+r:''); r++; }while(pris.has(id));", "    do{ id='m1-'+h; r++; }while(false);")], G('T04', 'T04c'), 'GARDE'),
    ('K04 une identite deja posee est regeneree',
     [(ST, "  const valide=l=>typeof l.id==='string' && l.id.length>=8;", "  const valide=l=>false;")], G('T03', 'T17'), 'GARDE'),
    ('K05 la migration arrondit les calories (donnee metier modifiee)',
     [(ST, "    rang[h]=r-1; pris.add(id); l.id=id; n++;", "    rang[h]=r-1; pris.add(id); l.id=id; n++; if(typeof l.kcal==='number') l.kcal=Math.round(l.kcal);")], G('T04', 'T18'), 'GARDE'),
    # ── suppressions, client ──
    ('K06 la suppression est consideree faite meme si le registre n a pas pu etre ecrit',
     [(ST, "  if(!_ecrireSuppressionsLocal()){ S.foodSupprimes=avant; return false; }", "  _ecrireSuppressionsLocal();")], G('T09'), 'GARDE'),
    ('K07 la ligne est retiree AVANT que la suppression soit enregistree',
     [(A, "  if(!_foodSupprimer(id)){ renderFoodJournal(); toast(_N_MSG_SUPPRESSION,'error'); return; }\n  S.foodLog.splice(i,1);", "  S.foodLog.splice(i,1);\n  if(!_foodSupprimer(id)){ renderFoodJournal(); toast(_N_MSG_SUPPRESSION,'error'); return; }")], G('T09', 'G01'), 'GARDE'),
    ('K08 le chargement n applique plus le registre au journal',
     [(ST, "catch(e){ S.foodSupprimes=[]; }\n    _foodAppliquerSuppressions();", "catch(e){ S.foodSupprimes=[]; }")], G('T09d'), 'GARDE'),
    ('K09 appliquer le registre ne fait plus rien',
     [(ST, "  const reg=S.foodSupprimes||[]; if(!reg.length || !Array.isArray(S.foodLog)) return 0;", "  return 0;\n  const reg=S.foodSupprimes||[];")], G('T09d', 'T10c', 'T10f'), 'GARDE'),
    ('K10 persist() n ecrit plus le registre',
     [(ST, "  _ecrireSuppressionsLocal();   // NUT-SYNC-01 : le registre des suppressions AVANT le journal — si le journal est écrit, les suppressions qu'il suppose le sont aussi\n", "")], G('G02'), 'GARDE'),
    # K11 (« la restauration ignore les suppressions du compte ») est DEPLACEE dans tools/mut_nut_sync02.py (K52), AVEC SA RAISON (R30 : un controle retire s'ecrit) : depuis NUT-SYNC-01 FINAL, le serveur
    # RENVOIE a un appareil en retard « supprime ailleurs » dans la reponse de sa synchronisation (voie `rejets`), si bien que T10/T10f retirent la ligne par cette voie meme quand la restauration
    # n'applique plus le registre : la mutation laissait ce banc VERT. Le chemin de restauration est isole, lui, par E03c (nut_sync02), qui ne passe par aucune synchronisation.
    ('K12 le demarrage n applique plus les suppressions venues d un autre appareil',
     [(A, "if(Array.isArray(_s)&&_s.length){ S.foodSupprimes=_foodSupprimesFusion(S.foodSupprimes,_s,true); _foodAppliquerSuppressions(); }", "")], G('T14'), 'GARDE'),   # ancre rafraichie le 01/11/2026 (NUT-SYNC-01 FINAL), meme intention. ATTENDU AJUSTE (T10c retire, T14 seul rougit) : la voie « rejets » de la reponse de synchronisation compense dans T10/T10c ; le DEMARRAGE seul est isole par E03d (nut_sync02, mutation K53).
    ('K13 la synchro n envoie plus le registre',
     [(SU, "      foodSupprimes:_foodSupprimesPourEnvoi(),\n", "")], G('T10', 'T10b'), 'GARDE'),   # ancre rafraichie le 01/11/2026 (NUT-SYNC-01 FINAL : le registre voyage dans `_corpsSync`, le constructeur UNIQUE du corps d'envoi — R2), meme intention : la synchro n'envoie plus le registre
    ('K14 la synchro ne declare plus le drapeau V2',
     [(SU, "foodLogV:3, requestId:_requestId,", "foodLogV:1, requestId:_requestId,")], G('T12'), 'GARDE'),   # ancre rafraichie le 01/11/2026 (NUT-SYNC-01 FINAL : transport lisible, registre dans le corps d'envoi, volet Nutrition dans `_nutSynchroniser_`), meme intention
    ('K15 le registre expire (suppressions de plus de 90 jours oubliees) cote telephone',
     [(ST, "    const t=(isFinite(+o2.t) && +o2.t>0) ? Math.floor(+o2.t) : 0;\n", "    const t=(isFinite(+o2.t) && +o2.t>0) ? Math.floor(+o2.t) : 0;\n    if(t && t<Date.now()-90*86400000) return;\n")], G('T11'), 'GARDE'),   # ancre rafraichie le 01/11/2026 (NUT-SYNC-01 FINAL : transport lisible, registre dans le corps d'envoi, volet Nutrition dans `_nutSynchroniser_`), meme intention
    # ── serveur ──
    ('K16 le serveur REMPLACE son registre au lieu de l additionner',
     [(CO, "  (Array.isArray(actuel) ? actuel : []).forEach(function(e) { ajouter(e, false); });\n", "")], G('S03'), 'GARDE'),
    ('K17 le serveur accepte une ligne dont la suppression est declaree',
     [(CO, "    recu = recu.filter(function(l) { return !estSupp(l); });\n", "")], G('T10', 'T16'), 'GARDE'),
    ('K18 le serveur ignore le drapeau V2 (une absence redevient une suppression)',
     [(CO, "  var v2j = v2 && nom === 'foodLog';", "  var v2j = false;")], G('S01', 'S02'), 'GARDE'),   # ancre rafraichie le 01/11/2026 (NUT-SYNC-01 FINAL), meme intention. ATTENDU AJUSTE (T12 retire) : depuis NUT-SYNC-01 FINAL un SECOND etage protege aussi les lignes deja REVISEES (un appareil sans revision ne retire pas ce que le serveur a revise) et celles de T12 le sont — l'absence reste donc protegee pour elles meme quand le drapeau est ignore. Pour les lignes NON revisees, seul le drapeau protege : S01/S02 (niveau serveur) rougissent, et la mutation reste TUEE.
    ('K19 le serveur laisse dans son journal une ligne dont la suppression est declaree',
     [(CO, "    actuel = actuel.filter(function(l) { return !estSupp(l); });\n", "")], G('S02'), 'GARDE'),
    ('K20 le serveur lit le journal AVANT le registre de la meme requete',
     [(CO, "  if (body.foodSupprimes !== undefined) profile.foodSupprimes = _nutSupprimesFusion_(profile.foodSupprimes, body.foodSupprimes, email);\n", ""),
      (CO, "  if (body.savedFoods !== undefined) profile.savedFoods = _nutProtegerListe_(existing, profile, 'savedFoods', body.savedFoods, email, false, ctx);", "  if (body.savedFoods !== undefined) profile.savedFoods = _nutProtegerListe_(existing, profile, 'savedFoods', body.savedFoods, email, false, ctx);\n  if (body.foodSupprimes !== undefined) profile.foodSupprimes = _nutSupprimesFusion_(profile.foodSupprimes, body.foodSupprimes, email);")], G('G03', 'S02'), 'GARDE'),   # ancre rafraichie le 01/11/2026 (NUT-SYNC-01 FINAL : transport lisible, registre dans le corps d'envoi, volet Nutrition dans `_nutSynchroniser_`), meme intention
    ('K21 le serveur n a plus de plafond de registre',
     [(CO, "    if (nouvelle && out.length >= NUT_SUPPR_MAX_) { refusees++; return; }\n", "")], G('S06'), 'GARDE'),
    ('K22 le serveur accepte n importe quelle identite',
     [(CO, "    if (typeof i !== 'string' || i.length < 8 || i.length > 64 || !/^[0-9A-Za-z-]+$/.test(i)) return;", "    if (typeof i !== 'string' || !i) return;")], G('S03'), 'GARDE'),
    ('K23 un envoi vide renvoie le journal ANCIEN (avec ses lignes supprimees)',
     [(CO, "    recu = actuel.slice();", "    recu = (profile[nom] || []).slice();")], G('S04'), 'GARDE'),   # ancre rafraichie le 01/11/2026 (NUT-SYNC-01 FINAL : transport lisible, registre dans le corps d'envoi, volet Nutrition dans `_nutSynchroniser_`), meme intention
    ('K24 les lignes supprimees ne sont plus copiees en zone de recuperation',
     [(CO, "  supprimees.forEach(function(l) { garder(l, 'supprimee'); });\n", "")], G('S02'), 'GARDE'),
    ('K25 le serveur garde l instant de suppression le plus RECENT (au lieu du plus ancien)',
     [(CO, "    if (idx[i] !== undefined) { var o = out[idx[i]]; if (t && (!o.t || t < o.t)) o.t = t; return; }\n    if (nouvelle", "    if (idx[i] !== undefined) { var o = out[idx[i]]; if (t && (!o.t || t > o.t)) o.t = t; return; }\n    if (nouvelle")], G('S03'), 'GARDE'),
    ('K26 le registre expire cote serveur (suppressions de plus de 90 jours oubliees)',
     [(CO, "    if (idx[i] !== undefined) { var o = out[idx[i]]; if (t && (!o.t || t < o.t)) o.t = t; return; }\n    if (nouvelle", "    if (t && t < Date.now() - 90 * 86400000) return;\n    if (idx[i] !== undefined) { var o = out[idx[i]]; if (t && (!o.t || t < o.t)) o.t = t; return; }\n    if (nouvelle")], G('T11'), 'GARDE'),
]

def banc(arbre):
    env = dict(os.environ, FT_DEPOT_GIT=SRC)   # la copie n'a pas de .git : le témoin relit `persist()` de master dans le vrai dépôt
    r = subprocess.run(['node', 'tools/banc_nut_sync01.js'], cwd=arbre, capture_output=True, text=True, timeout=900, env=env)
    out = r.stdout or ''
    last = [l for l in out.split('\n') if ' OK / ' in l]
    rouges = [l.split('rouge : ', 1)[1] for l in out.split('\n') if l.startswith('  rouge : ')]
    return r.returncode, (last[-1].strip() if last else (r.stderr or '')[-160:]), rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_ns01_')
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
