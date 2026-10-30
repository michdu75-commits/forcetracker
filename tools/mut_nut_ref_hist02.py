#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUT-REF-HIST-02 (30/10/2026) : le banc `tools/banc_nut_ref_hist02.js` (PRÉPARÉ, JAMAIS EXÉCUTÉ — GO TESTS non accordé) sait-il ROUGIR, et au BON endroit ?

[!!] SUR UNE COPIE JETABLE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque mutation retire UN morceau du controle dans un clone ; le depot n'est
jamais ecrit. Point de depart : 0 rouge sur l'arbre sain. Une mutation est TUEE si le banc rougit (code 1) ET si CHACUN des temoins attendus
fait partie des rouges. Un PLANTAGE (code 2) n'est jamais un verdict. Une ancre absente ou multiple arrete tout. L'extrait ORIGINAL et
l'extrait MUTE sont imprimes.
Usage : python3 tools/mut_nut_ref_hist.py [R01|R02,R05|R10+]   (« R10+ » = de R10 jusqu'a la fin)
"""
import os, re, shutil, subprocess, sys, tempfile, time

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = 'app.js'
S = lambda *c: ['B-NRH2 ' + x + ' ' for x in c]

MUT = [
    ('M01 la douane compte une ligne AVANT la fin de la validation du groupe',
     [(A, "    rs.push(r);\n  }\n  rs.forEach((r,k)=>", "    if(!e.repasSeul){ try{ _douaneLigne(r.ligne, porte); }catch(x){} }\n    rs.push(r);\n  }\n  rs.forEach((r,k)=>")], S('N10'), 'GARDE'),
    ('M02 l insertion n est plus UNE seule operation (une par ligne)',
     [(A, "  }else S.foodLog.push(...rs.map(r=>r.ligne));", "  }else rs.forEach(r=>S.foodLog.push(r.ligne));")], S('N01'), 'GARDE'),
    ('M03 le groupe est ecrit meme si un aliment est refuse a l ecriture',
     [(A, "    if(refus.length) return {ok:false, groupe:true, refus:refus};", "    if(false) return {ok:false, groupe:true, refus:refus};")], S('N11', 'S3'), 'GARDE'),
    ('M04 une identite deja au journal est acceptee par l ecrivain unique',
     [(A, "      if(vus.has(e.id)) return {ok:false, erreur:'ID_EXISTANT', rang:k};", "      /* M04 */")], S('N08b'), 'GARDE'),
    ('M05 un repas a aliment bloque s ecrit quand meme (ajout partiel d office)',
     [(A, "      if(bloques.length && choix!=='autres'){ _habChoix(idx, r, moment, bons, bloques); return; }", "      if(false){ _habChoix(idx, r, moment, bons, bloques); return; }")], S('N02', 'N03'), 'GARDE'),
    ('M06 « Ajouter seulement les autres » inclut aussi les aliments bloques',
     [(A, "      const aEcrire=bloques.length ? bons : r.items;", "      const aEcrire=r.items;")], S('N05'), 'GARDE'),
    ('M07 plus de protection contre le double appui',
     [(A, "  if(_habDernier.cle===cle && Date.now()-_habDernier.t<900) return;   // double appui : déjà fait", "  /* M07 */")], S('N08 '), 'GARDE'),
    ('M08 le panneau se rattache a n importe quelle carte (plus de verification du conteneur)',
     [(A, "  return r.items.every(e=>txt.indexOf(String((e&&e.name)||''))>=0) ? c : null;", "  return c;")], S('N16'), 'GARDE'),
    ('M09 la reprise bloquee ne se declare plus (le message redevient faux)',
     [(A, "        : _N2_REF_NON_VERIFIEE, bloquee:true}", "        : _N2_REF_NON_VERIFIEE}")], S('N17'), 'GARDE'),
    ('M10 le verrou anti-double-appui reste bloque apres une faute',
     [(A, "    }finally{ _habEnCours=0; }", "    }finally{ /* M10 */ }")], S('N09b'), 'GARDE'),
    ('M11 les lignes d un groupe partagent le meme ts',
     [(A, "p.entree.ts=t0+k; prets.push(p.entree);", "p.entree.ts=t0; prets.push(p.entree);")], S('N01'), 'GARDE'),
    ('M12 l ajout partiel est propose meme quand TOUS les aliments sont bloques',
     [(A, "  if(bons.length) bouton('Ajouter seulement '", "  if(true) bouton('Ajouter seulement '")], S('N03b'), 'GARDE'),
    ('M13 le panneau s ouvre par un sélecteur sur onclick (couplage fragile)',
     [(A, "  const c=document.getElementById('hab-m-'+idx);\n  if(!c ||", "  const c=document.querySelector('[onclick*=\"hab-m-'+idx+'\"]');\n  if(!c ||")], S('N13'), 'GARDE'),
    ('M14 la validation du groupe ne passe plus avant la douane et l insertion (ordre inverse)',
     [(A, "    const r=e.repasSeul ? N.changerRepas(e.remplace, e.repas) : N.ligneNouvelle(e);\n    if(!r.ok) return groupe ? Object.assign({}, r, {rang:k}) : r;\n    rs.push(r);", "    const r=e.repasSeul ? N.changerRepas(e.remplace, e.repas) : N.ligneNouvelle(e);\n    if(!r.ok) return groupe ? Object.assign({}, r, {rang:k}) : r;\n    if(!e.repasSeul){ try{ _douaneLigne(r.ligne, porte); }catch(x){} }\n    rs.push(r);")], S('N10'), 'GARDE'),
    ('M15 une exception apres l insertion n est plus lue dans le journal (le faux « Rien n a ete ajoute » revient)',
     [(A, "      if(S.foodLog===journal0 && (S.foodLog||[]).length>n0) inserees=S.foodLog.slice(n0);", "      /* M15 */")], S('A1-T01c'), 'GARDE'),
    ('M16 la sauvegarde durable n est plus relue (persist avale ses erreurs : la panne passe inapercue)',
     [(A, "    return ids.every(i=>lus.has(i));", "    return true;")], S('A1-T02'), 'GARDE'),
    ('M17 une nouvelle tentative ne retente plus la sauvegarde : elle re-insere (doublon)',
     [(A, "  if(_habNonConfirme[cle] && _habReessayer(cle)) return;", "  /* M17 */")], S('A1-T04a'), 'GARDE'),
    ('M18 une sauvegarde confirmee reste « en attente » (la table n est pas purgee par la tentative)',
     [(A, "    _habPurger();\n    try{ renderFoodJournal(); }catch(e){}\n    toast('Enregistrement local", "    try{ renderFoodJournal(); }catch(e){}\n    toast('Enregistrement local")], S('A1-T04c'), 'GARDE'),
    ('M19 apres un echec de rendu, le message dit a tort que rien n a ete ajoute',
     [(A, "  if(!rendu){ toast(quoi+", "  if(!rendu){ toast('Rien n\\'a été ajouté — '+")], S('A1-T03'), 'GARDE'),
    ('M20 la douane est deplacee APRES l insertion (correction A2 hors mandat : les temoins A2 doivent la voir)',
     [(A, "  rs.forEach((r,k)=>{ if(!entrees[k].repasSeul){ try{ _douaneLigne(r.ligne, porte); }catch(e){} } });\n", ""),
      (A, "  }else S.foodLog.push(...rs.map(r=>r.ligne));", "  }else S.foodLog.push(...rs.map(r=>r.ligne));\n  rs.forEach((r,k)=>{ if(!entrees[k].repasSeul){ try{ _douaneLigne(r.ligne, porte); }catch(e){} } });")], S('A2-T02', 'A2-T03'), 'GARDE'),
    ('M21 un seul emplacement d attente : un 2e repas ecrase le 1er (ancienne conception)',
     [(A, "  if(!durable){ _habNonConfirme[cle]=ids; toast(_HAB_MSG_NON_DURABLE,'error'); return; }", "  if(!durable){ _habNonConfirme={}; _habNonConfirme[cle]=ids; toast(_HAB_MSG_NON_DURABLE,'error'); return; }")], S('A1-T04b'), 'GARDE'),
]

def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_nut_ref_hist02.js'], cwd=arbre, capture_output=True, text=True, timeout=900)
    out = r.stdout or ''
    last = [l for l in out.split('\n') if ' OK / ' in l]
    rouges = [l.split('rouge : ', 1)[1] for l in out.split('\n') if l.startswith('  rouge : ')]
    return r.returncode, (last[-1].strip() if last else (r.stderr or '')[-160:]), rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_refhist02_')
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
