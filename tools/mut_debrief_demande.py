#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — DEBRIEF-ON-DEMAND-01 (session-B) : les temoins B-OD-* savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
⭐ Une mutation n'est « attrapee » que si un temoin d'ECRAN (OD-*) rougit : un temoin qui lit la source ne
   suffit pas (BUGS.md §64). Les rouges de source (S*) sont affiches a part.
M00 remet les fichiers servis tels qu'ils etaient AVANT le chantier (E5 final, 4ccd5bed), mot pour mot :
    le debrief automatique doit etre attrape.
M-OD1..M-OD8 = le contrat (aucun appel sans clic, une generation par geste, echec sans rien ranger, Voir OU Analyser,
A ne libere pas B) · M-OD9.. = deguisees, negative, equivalente.
Usage : python3 tools/mut_debrief_demande.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = '4ccd5bed'
CO, LO, SE, SC = 'coach.js', 'log.js', 'setup.js', 'screens.js'
FICHIERS = ('coach.js', 'log.js', 'setup.js', 'screens.js', 'index.html', 'style.css')

AUTO = "try{const s=(S.sessions||[]).slice(-1)[0];if(s&&_dbfAnalysable(s)&&!_dbfTexteDe(_dbfCle(s))&&!_dbfEnVol(_dbfCle(s)))_runSeDebrief(s,0,document.createElement('div'));}catch(e){}"
OUBLI = "  try{ ['ft4_pending_debrief','ft4_debrief_recu','ft4_debrief_faits'].forEach(k=>localStorage.removeItem(k)); }catch(e){}\n})();\n"
ECHEC = "    if(_dbfSlotEst(slot,sid)) slot.innerHTML=avec('\\u26a0\\ufe0f Milo n\\'a pas pu analyser ta séance. Rien n\\'est enregistré.',true);\n"
VOIR = "'<button class=\"sess-dbf-btn\" onclick=\"voirDebriefMilo('+_dbfArg+',event)\">💬 Voir le débrief Milo</button>'"

MUT = [
    ("M00 code d'AVANT le chantier remis mot pour mot (E5 final 4ccd5bed : debrief automatique)", 'AVANT', 'GARDE'),
    ('M-OD1 la fin de seance relance l\'appel toute seule',
     [(LO, "  slot.innerHTML=_seDebriefChiffres(sess,prCount)+_dbfActionHtml(sess);\n}",
           "  slot.innerHTML=_seDebriefChiffres(sess,prCount)+_dbfActionHtml(sess);\n  _runSeDebrief(sess,prCount);\n}")], 'GARDE'),
    ('M-OD2 le demarrage (rechargement) relance l\'analyse de la derniere seance',
     [(CO, OUBLI, OUBLI + "window.addEventListener('load',()=>setTimeout(()=>{" + AUTO + "},3000));\n")], 'GARDE'),
    ('M-OD3 ouvrir le Coach relance l\'analyse',
     [(SC, "/* DEBRIEF-ON-DEMAND-01 : ouvrir le Coach ne lance plus aucun débrief (il se demande, voir coach.js) */", AUTO)], 'GARDE'),
    ('M-OD4 plus de verrou « en vol » : un double clic paie deux generations',
     [(LO, "  if(_dbfEnVol(sid)){ slot.innerHTML=chiffres+'<p class=\"se-dbf-off\"><span class=\"se-load\">Milo analyse déjà cette séance…</span></p>'; return; }\n", "")], 'GARDE'),
    ('M-OD5 complete:false / repli accepte comme debrief (un echec est range)',
     [(LO, "    if(typeof _dbfReponseValide==='function' && !_dbfReponseValide(data))throw new Error('non confirmé');\n", "")], 'GARDE'),
    ('M-OD6 un nouvel essai CACHE part tout seul apres un echec',
     [(LO, ECHEC, ECHEC + "    setTimeout(()=>{ try{ _runSeDebrief(sess,prCount,slot); }catch(_){} },1200);\n")], 'GARDE'),
    ('M-OD7 Progres montre « Voir » ET « Analyser » pour une seance deja debriefee',
     [(SE, VOIR, VOIR + "+'<button class=\"sess-dbf-go\" onclick=\"analyserSeanceMilo('+_dbfArg+',event)\">✨ Analyser avec Milo</button>'")], 'GARDE'),
    ('M-OD8 la reponse de A libere TOUT « en vol » (B est relancable pendant son appel)',
     [(LO, "    _dbfVolRetirer(sid);   // seulement CETTE séance", "    localStorage.removeItem(_DBF_ENCOURS);   // seulement CETTE séance")], 'GARDE'),
    ('M-OD9 [deguisee] une analyse coupee par un rechargement n\'est jamais dite « interrompue »',
     [(CO, "  return !!(e && e.page!==_DBF_PAGE) && !_dbfTexteDe(id);", "  return false;")], 'GARDE'),
    ('M-OD10 [deguisee] supprimer une seance laisse son etat « en vol »',
     [(CO, "  const k=String(id);\n  _dbfVolRetirer(k);\n", "  const k=String(id);\n")], 'GARDE'),
    ('M-OD11 [deguisee] le geste retrouve la seance par sa DATE (la 1re du jour), pas par son identifiant',
     [(SE, "  const s=(S.sessions||[]).find(x=>x&&typeof _dbfCle==='function'&&_dbfCle(x)===String(id))||null;\n  if(!s){toast('Séance introuvable dans l\\'historique','error');return;}\n  const fin=",
           "  const s=(S.sessions||[]).find(x=>x&&x.date===((S.sessions||[]).find(y=>_dbfCle(y)===String(id))||{}).date)||null;\n  if(!s){toast('Séance introuvable dans l\\'historique','error');return;}\n  const fin=")], 'GARDE'),
    # ⚠️ Premiere version inerte : elle lisait S.sessions au chargement de coach.js, AVANT load() — la seance n'y
    # etait pas encore, donc rien ne partait. Une mutation qui ne peut rien casser ne mesure rien : differee au `load`.
    ('M-OD12 [deguisee] la mise a jour relance l\'ancienne file au lieu de l\'oublier',
     [(CO, OUBLI, "  try{ const f=JSON.parse(localStorage.getItem('ft4_pending_debrief')||'[]'); window.addEventListener('load',()=>setTimeout(()=>{ try{ const s=(S.sessions||[]).find(x=>(Array.isArray(f)?f:[f]).map(String).indexOf(_dbfCle(x))>=0); if(s) _runSeDebrief(s,0,document.createElement('div')); }catch(e){} },2500)); }catch(e){}\n" + OUBLI)], 'GARDE'),
    ('M-OD15 la page qui s\'en va efface « en vol » (la seance dit « Analyser » au lieu de « interrompue »)',
     [(LO, "    if(typeof _dbfQuitte!=='undefined' && _dbfQuitte) return;   // laisser « en vol » : la page suivante dira « interrompue »\n", "")], 'GARDE'),
    ('M-OD13 [negatif] commentaire citant les motifs (automatisme, file, minuteur, rattrapage)',
     [(LO, "function _seDebriefChiffres(sess,prCount){", "// _maybeAutoDebrief _dbfRattraper setTimeout(()=>_runSeDebrief ft4_pending_debrief _dbfPrendre : cite, jamais execute\nfunction _seDebriefChiffres(sess,prCount){")], 'OK'),
    ('M-OD14 [equivalente] la cle « en vol » passee en texte explicite (meme sens)',
     [(LO, "  if(_dbfEnVol(sid)){", "  if(_dbfEnVol(String(sid))){")], 'OK'),
]


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_debrief_demande.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
                       env=dict(os.environ, TZ='Europe/Paris'))
    out = r.stdout + r.stderr
    rouges = [l.strip()[:130] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_od_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    avant = {f: subprocess.run(['git', 'show', AVANT + ':' + f], cwd=SRC, capture_output=True, text=True).stdout for f in FICHIERS}
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
        ecran = [x for x in rouges if 'ROUGE OD-' in x or 'PLANTAGE' in x]
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
