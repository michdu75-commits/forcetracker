#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — AUTH-NEW-DEVICE-01 (session-B) : les temoins B-AN-E savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord. Protocole jour : 3 mutations au plus.
Usage : python3 tools/mut_auth_new_device.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AP, SE = 'app.js', 'setup.js'
FICHIERS = ('app.js', 'setup.js', 'index.html', 'state.js', 'tracking.js')

MUT = [
    ('M1 needsCode redevient traite comme un compte neuf (« COMMENCER » termine l\'inscription)',
     [(AP, "    }else if(data&&data.error==='auth'){\n      /* \U0001f510 AUTH-NEW-DEVICE-01", "    }else if(data&&data.error==='auth'){ finishOnboarding(); return;\n      /* \U0001f510 AUTH-NEW-DEVICE-01")], 'GARDE'),
    ('M2 le jeton rendu par verifyConfirmCode est de nouveau jete',
     # Ancre mise a jour (qualification ft-v1251) : AUTH-CLOUD-CLOSURE-01 range le jeton avec le compte DEMANDE.
     [(AP, "if(d&&d.status==='ok'){ if(d.token&&S.email===_compteVerifie)_setFtToken(d.token); S.emailVerified=true;", "if(d&&d.status==='ok'){ S.emailVerified=true;")], 'GARDE'),
    ('M3 restauration sans code : on redemande un code inexistant au lieu de proposer la securisation',
     # Ancre mise a jour (qualification ft-v1251) : AUTH-SIGNUP-STRICT-01 note d'ou vient la protection.
     [(AP, "  if(sansCode){ window._obProtectionDepuis='restaurer'; el.innerHTML=_obTexteSansCode(); return; }\n", ""),
      (SE, "      if(data.needsCode&&st){", "      if(false&&data.needsCode&&st){")], 'GARDE'),
]

def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_auth_new_device.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
                       env=dict(os.environ, TZ='Europe/Paris'))
    out = r.stdout + r.stderr
    rouges = [l.strip()[:130] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_an_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    avant = {}   # pas de M00 ici (protocole jour, 5 mutations)
    tmp0, a0 = cloner()
    rouges = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rouges:
        print('  !! ARBRE SAIN DEJA ROUGE — controle refuse :', rouges[:3]); return 1
    print('  arbre sain : 0 rouge (point de depart valide)\n')
    conformes = total = 0
    for nom, remplacements, attendu in MUT:
        if filtres and not any(nom.startswith(f) for f in filtres):
            continue
        total += 1
        tmp, arbre = cloner()
        if remplacements == 'AVANT':
            cur = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
            if any(not avant[f] for f in FICHIERS) or all(avant[f] == cur[f] for f in FICHIERS):
                print('  INVALIDE  %s (code d\'avant introuvable ou identique)' % nom); shutil.rmtree(tmp, ignore_errors=True); continue
            for f in FICHIERS:
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(avant[f])
        else:
            srcs = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
            invalide = []
            for f, av, ap in remplacements:
                if srcs[f].count(av) != 1:
                    invalide.append('%s:%s (x%d)' % (f, av[:50], srcs[f].count(av)))
                else:
                    srcs[f] = srcs[f].replace(av, ap, 1)
            if invalide:
                print('  INVALIDE  %s (ancre absente ou multiple : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
            for f in FICHIERS:
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(srcs[f])
        rouges = banc(arbre)
        # Ecran = tout temoin conduit (OD-, F1-, C1-, T1..T5, CF-) ; source = les S1..S9 de B-OD-S. (06/10 : seuls les OD-
        # etaient comptes, et M-J1..M-J3, attrapes par F1/C1/T1, s'affichaient « non attrapes ».)
        import re as _re
        ecran = [x for x in rouges if 'PLANTAGE' in x or not _re.search(r'ROUGE S\d', x)]
        obtenu = 'GARDE' if ecran else 'OK'
        ok = obtenu == attendu; conformes += ok
        print('  %s  %-96s %-6s %2d ecran / %2d source  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(ecran), len(rouges) - len(ecran), ecran[0] if ecran else (rouges[0] if rouges else '')))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
