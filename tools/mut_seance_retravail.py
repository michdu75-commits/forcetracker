#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — MILO-SEANCE-RETRAVAIL : les temoins B-CCCXCIII / B-CCCXCIV savent-ils ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
M00 remet coach.js tel qu'il etait AVANT le correctif (commit 2f5ccdb5, ft-v1238), mot pour mot.
Usage : python3 tools/mut_seance_retravail.py [PREFIXE]
"""
import os, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CO = 'coach.js'
AVANT_C3 = '2f5ccdb5b9f526f548f6314aebaf0d4cfc232582'   # le code servi AVANT ce correctif (ft-v1238)

CTX = "      return !!(a.seance&&typeof a.seance==='object') || (typeof a.content==='string'&&_ressembleASeance(a.content));\n"
DES_BTN = "  if(msg) _desactiverVersionsPrecedentes(msg);  // RETRAVAIL : une seule version active par chaîne\n"
DES_Q = "    if(msg) _desactiverVersionsPrecedentes(msg);   // RETRAVAIL : on travaille sur CETTE version, plus sur la précédente\n"
DES_CORPS = "if(b) b.querySelectorAll('.coach-seance-carte').forEach(c=>c.remove());"
REL = "        try{ relue=!!_appendStartSessionBtn(m.seance, bulle); }catch(e){ relue=false; }\n"
TXT = "        _appendStartSessionBtn(dsx.sess, bulle);\n"
RENDU = ("    else if(t) renderCoachMsg('coach', t, {coupee: m.coupee});   // MILO-PDF1 : le marqueur revient avec la bulle\n"
         "    if(m.role !== 'user' && t) _bulleDe.set(m, _derniereBulleCoach());   // RETRAVAIL : la bulle de CE message\n")
STOP = "        if(demande&&(!u||_seanceEncoreDuJour(u.ts))){ _appendSeanceQuestion(txt, bulle, m); pose=true; _remplacer(m); continue; }\n"
BREAK = "        if(relue){ pose=true; _remplacer(m); continue; }\n"
SKIP = "      if(_remplacees.has(m))continue;   // une version plus récente de la même chaîne est proposée : historique seulement\n"
TXTC = "        pose=true; _remplacer(m);\n        continue;              // RETRAVAIL : une carte par séance — la version la plus récente de chaque chaîne\n"
CHAINE = "    return motif || !(typeof _demandeUneSeance==='function'&&_demandeUneSeance(t));\n"
VERS = "    _versionsPrecedentes(coachHistory, msg).forEach(v=>{\n"
COUPEE = "    if (_coupee && typeof _desactiverVersionsPrecedentes === 'function') _desactiverVersionsPrecedentes(_msgA);\n"
LIT = "      if(m.seance&&typeof _appendStartSessionBtn==='function'){\n"
DEM = "          || (_retravail && typeof _ressembleASeance === 'function' && _ressembleASeance(reply)));\n"
SIL = "      for(let j=k-1;j>=0;j--){ const p=hist[j]; if(p&&p.role==='user'){ if(p._silent)return false; break; } }\n"

MUT = [
    ('M00 code d\'AVANT le correctif remis mot pour mot (coach.js de 2f5ccdb5)', 'AVANT', 'GARDE'),
    ('M01 le contexte de retravail n\'est plus reconnu', [(CTX, "      return false;\n")], 'GARDE'),
    ('M02 la nouvelle carte ne desactive plus l\'ancienne (deux cartes actives)', [(DES_BTN, '')], 'GARDE'),
    ('M03 la question sous la nouvelle reponse laisse l\'ancienne carte active', [(DES_Q, '')], 'GARDE'),
    ('M04 [deguisee] desactivation qui ne retire plus rien', [(DES_CORPS, "if(b&&b.closest('.msg-user')) b.querySelectorAll('.coach-seance-carte').forEach(c=>c.remove());")], 'GARDE'),
    ('M05 rechargement : retour a la « derniere bulle » (sans cible)', [(REL, REL.replace('(m.seance, bulle)', '(m.seance)')), (TXT, TXT.replace('(dsx.sess, bulle)', '(dsx.sess)'))], 'GARDE'),
    ('M06 [deguisee] la bulle est capturee AVANT le rendu (carte sous le mauvais message)', [(RENDU, RENDU.split('\n')[1] + '\n' + RENDU.split('\n')[0] + '\n')], 'GARDE'),
    ('M07 rechargement : on remonte vers A au lieu de proposer B', [(STOP, '')], 'GARDE'),
    # M08 : 1re formulation (break seul retire) EQUIVALENTE ; 2e (continue) devenue LE comportement voulu (une carte
    # par chaine) — l'intention reste : une ancienne version de la meme chaine ne doit pas revenir au rechargement.
    ('M08 rechargement / Mes discussions : une version remplacee de la chaine n\'est plus sautee', [(SKIP, '')], 'GARDE'),
    ('M09 reponse coupee d\'un retravail : A reste active', [(COUPEE, '')], 'GARDE'),
    ('M10 message.seance ignore au rechargement (retraduction au tap)', [(LIT, "      if(false&&m.seance&&typeof _appendStartSessionBtn==='function'){\n")], 'GARDE'),
    ('M11 la question du rechargement n\'attache plus la seance lue a SON message', [(STOP, STOP.replace('(txt, bulle, m)', '(txt, bulle, null)'))], 'GARDE'),
    ('M12 un appel de traduction en plus au rechargement', [(STOP, STOP.replace('{ _appendSeanceQuestion', '{ try{ _cerveletSeance(txt); }catch(e){} _appendSeanceQuestion'))], 'GARDE'),
    ('M13 [deguisee] le contexte seul suffit (sans allure de seance)', [(DEM, "          || (_retravail));\n")], 'GARDE'),
    ('M14 [deguisee] une reponse a une consigne interne compte comme proposition', [(SIL, "      for(let j=k-1;j>=0;j--){ const p=hist[j]; if(p&&p.role==='user'){ break; } }\n")], 'GARDE'),
    ('N1 [chaine] desactivation de TOUTES les autres seances du fil (regle trop globale)', [(VERS, "    coachHistory.filter(v=>v&&v!==msg&&v.role==='assistant').forEach(v=>{\n")], 'GARDE'),
    ('N2 [chaine][deguisee] une nouvelle demande prolonge la chaine precedente', [(CHAINE, "    return true;\n")], 'GARDE'),
    ('N3 [chaine] rechargement : on s\'arrete a la premiere seance (une seance independante est perdue)',
     [(BREAK, "        if(relue){ pose=true; _remplacer(m); break; }\n"), (TXTC, TXTC.replace('continue;  ', 'break;     '))], 'GARDE'),
    ('[negatif] commentaire citant tous les mots cherches',
     [(STOP, "        // _suitUnePropositionDeSeance _desactiverAutresCartesSeance _bulleDe coach-seance-carte _silent break\n" + STOP)], 'OK'),
]


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_seance_retravail.js'], cwd=arbre, capture_output=True, text=True, timeout=1200,
                       env=dict(os.environ, TZ='Europe/Paris'))
    out = r.stdout + r.stderr
    rouges = [l.strip()[:110] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_rt_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def main():
    filtres = [x for x in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if x]   # plusieurs prefixes : M02,M03,...
    avant = subprocess.run(['git', 'show', AVANT_C3 + ':' + CO], cwd=SRC, capture_output=True, text=True).stdout
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
        cible = os.path.join(arbre, CO); src = open(cible, encoding='utf-8').read()
        if remplacements == 'AVANT':
            if not avant or avant == src:
                print('  INVALIDE  %s (code d\'avant introuvable ou identique)' % nom); shutil.rmtree(tmp, ignore_errors=True); continue
            src = avant
        else:
            invalide = [av[:50] for av, _ in remplacements if src.count(av) != 1]
            if invalide:
                print('  INVALIDE  %s (ancre absente ou multiple : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
            for av, ap in remplacements:
                src = src.replace(av, ap, 1)
        open(cible, 'w', encoding='utf-8').write(src)
        rouges = banc(arbre)
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu; conformes += ok
        print('  %s  %-92s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0] if rouges else ''))
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
