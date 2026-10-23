#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUT-INVENTAIRE A2 (22/10/2026) : le banc de la carte Admin sait-il ROUGIR, au BON endroit ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque ligne decrit la COPIE MUTEE.
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord (sinon le controle est refuse).
Une mutation GARDE est conforme si `tools/banc_nut_inventaire_admin.js` rougit (code 1) ET si CHACUN des
temoins attendus fait partie des rouges. Une mutation OK (commentaire) est conforme si le banc reste vert.
Un PLANTAGE (code 2) n'est jamais un verdict. Une ancre absente ou multiple arrete tout.
Usage : python3 tools/mut_nut_inventaire_admin.py      (les copies vont dans $TMPDIR)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = 'app.js'
POST = "fetch(S.url,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},\n      body:JSON.stringify({action:action,token:tok}),"
ADMIN = "  if(!_isAdminUnlocked()){ box.innerHTML='<div style=\"color:var(--red);font-size:12.5px;\">Réservé à l\\'admin.</div>'; return; }\n  const tok=_adminTok();"
REFUS = "  const d=await _nutInvAppel(action,tok);\n  if(_adminTokRefuse(d)){ box.innerHTML='<div style=\"color:var(--red);font-size:12.5px;\">Jeton refusé"
BORNE = "' · du '+_escIdea(d.borneMin)+' au '"
RENDU = "  box.innerHTML=action==='nutBackupAudit'?_nutAuditRendu(d):_nutInvRendu(d);\n}"
PARTIEL = "+(d.arretParLeTemps?'<br>⏱️ <b>Arrêt après 4 min 30 : couverture PARTIELLE</b> (les plus anciennes n\\'ont pas été lues).':'')"
PANNE = "  }catch(e){ return {status:'error',error:(e&&e.name==='AbortError')?'trop lent':'réseau'}; }\n}\nfunction _nutInvRendu(d){"
B = lambda *c: ['B-NIA ' + x for x in c]

MUT = [
    ('M1 le jeton part dans l\'adresse (POST conserve)', [(A, POST, POST.replace("fetch(S.url,{method:'POST'", "fetch(S.url+'?action='+action+'&token='+encodeURIComponent(tok),{method:'POST'"))],
     B('③', '⑥', '⑧ ', '⑪ ') + ['B-NIA-S ②'], 'GARDE'),
    ('M2 GET avec le jeton dans l\'adresse (le patron des cartes voisines)',
     [(A, POST, "fetch(S.url+'?action='+action+'&token='+encodeURIComponent(tok),{method:'GET',")], B('③', '⑥') + ['B-NIA-S ②'], 'GARDE'),
    ('M3 le controle « admin » est retire', [(A, ADMIN, "  const tok=_adminTok();")], B('②'), 'GARDE'),
    ('M4 un jeton refuse n\'est plus oublie', [(A, REFUS, REFUS.replace('if(_adminTokRefuse(d)){', "if(d&&d.error==='token'){"))], B('⑨'), 'GARDE'),
    ('M5 une valeur du serveur n\'est plus echappee', [(A, BORNE, "' · du '+d.borneMin+' au '")], B('⑦'), 'GARDE'),
    ('M6 la carte affiche TOUT ce que le serveur rend', [(A, RENDU, "  box.innerHTML=(action==='nutBackupAudit'?_nutAuditRendu(d):_nutInvRendu(d))+'<pre>'+_escIdea(JSON.stringify(d))+'</pre>';\n}")],
     B('⑤', '⑧c'), 'GARDE'),
    ('M7 le resultat est range sur l\'appareil', [(A, RENDU, RENDU[:-2] + "\n  try{ localStorage.setItem('ft4_nutinv_dernier',JSON.stringify(d)); }catch(e){}\n}")], B('⑫'), 'GARDE'),
    ('M8 la couverture partielle n\'est plus dite', [(A, PARTIEL, "")], B('⑧b'), 'GARDE'),
    ('M9 une panne reseau efface le jeton', [(A, PANNE, PANNE.replace("(e&&e.name==='AbortError')?'trop lent':'réseau'", "'token'"))], B('⑩'), 'GARDE'),
    ('MC1 [negatif] commentaire seulement', [(A, RENDU, "  /* commentaire sans effet */\n" + RENDU)], [], 'OK'),
]


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_nut_inventaire_admin.js'], cwd=arbre, capture_output=True, text=True, timeout=900)
    out = r.stdout or ''
    last = [l for l in out.split('\n') if ' OK / ' in l]
    rouges = [l.split('rouge : ', 1)[1] for l in out.split('\n') if l.startswith('  rouge : ')]
    return r.returncode, (last[-1].strip() if last else (r.stderr or '')[-160:]), rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_nia_')
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
    for nom, rempl, attendus, attendu in MUT:
        if seul and not nom.startswith(seul + ' '):
            continue
        total += 1
        tmp, arbre = cloner()
        for f, old, new in rempl:
            p = os.path.join(arbre, f)
            s = open(p, encoding='utf-8').read()
            if s.count(old) != 1:
                print('  !! ANCRE INTROUVABLE OU MULTIPLE (%d) : %s' % (s.count(old), nom)); shutil.rmtree(tmp, ignore_errors=True); return 1
            open(p, 'w', encoding='utf-8').write(s.replace(old, new))
        for f in sorted(set(x[0] for x in rempl)):
            chk = subprocess.run(['node', '--check', f], cwd=arbre, capture_output=True) if f != A else \
                subprocess.run(['node', '-e', "new Function(require('fs').readFileSync('app.js','utf8'))"], cwd=arbre, capture_output=True)
            if chk.returncode != 0:
                print('  !! MUTATION QUI CASSE LA SYNTAXE (refusee) : %s' % nom); shutil.rmtree(tmp, ignore_errors=True); return 1
        rc, res, rouges = banc(arbre)
        shutil.rmtree(tmp, ignore_errors=True)
        if attendu == 'GARDE':
            manquants = [w for w in attendus if not any(r.startswith(w) for r in rouges)]
            ok = rc == 1 and not manquants
        else:
            manquants = []
            ok = rc == 0
        conformes += ok
        print('  %s %-78s attendu %-5s -> %s' % ('OK ' if ok else '!! ', nom[:78], attendu, res))
        if manquants:
            print('       temoin(s) attendu(s) reste(s) VERT(S) : %s' % ' · '.join(manquants))
        if rc == 2:
            print('       PLANTAGE : ce n\'est pas un verdict')
        print('       rouges : %s' % (' · '.join(re.sub(r' → .*| \(.*', '', x)[:40] for x in rouges) or 'aucun'))
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total and total > 0 else 1


if __name__ == '__main__':
    sys.exit(main())
