#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — D-087 (18/10/2026) : les temoins B-NOTE-* savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord ; l'arbre sain est REJOUE a la fin (banc stable).
M00 remet les fichiers servis tels qu'ils etaient AVANT D-087 (6a1b2b9e), mot pour mot : les temoins de la note de la
derniere fois (point bleu, fiche en lecture seule, date) y rougissent ; ceux qui protegent l'EXISTANT (conservation des
notes, commentaires de serie, types, contexte de Milo) y restent verts — ce sont des invariants, pas la nouveaute.
Les autres mutations visent un INVARIANT ou un rouage precis, chacune avec SON temoin (4e champ).
[deguisee] = casse l'invariant sans toucher la ligne evidente ; [equivalente] = ne doit PAS rougir.
Un PLANTAGE du banc (code hors 0/1, ligne PLANTAGE, pas de ligne de total) n'est jamais « garde ».
⛔ Aucune mutation ne fait d'appel reel : le banc coupe toute requete hors du serveur local (M16 en fabrique une, coupee).
Usage : python3 tools/mut_notes_d087.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_J=1 par defaut)
"""
import os, re, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = '6a1b2b9e'
LO, CS, CO = 'log.js', 'style.css', 'coach.js'
FICHIERS = ('log.js', 'style.css', 'coach.js')

MUT = [
    ("M00 code d'AVANT D-087 remis mot pour mot (6a1b2b9e)", 'AVANT', 'GARDE', 'B-NOTE-⑧a'),
    # ── ③ · aucun indicateur trompeur
    ('M1 [deguisee] l\'indicateur s\'allume des qu\'il y a une seance precedente, meme sans note',
     [(LO, "  return t?{texte:t, date:String(v.sess&&v.sess.date||''), nom:String(v.ex.name||'')}:null;",
           "  return v?{texte:t, date:String(v.sess&&v.sess.date||''), nom:String(v.ex.name||'')}:null;")], 'GARDE', 'B-NOTE-③a'),
    ('M2 [deguisee] on va chercher la derniere seance QUI A une note (une note plus ancienne remonte)',
     [(LO, "function _noteExPrecedente(ex){\n  const v=ex&&_prevSeance(ex.name);",
           "function _noteExPrecedente(ex){\n  const v=ex&&(()=>{for(const s of (S.sessions||[])){const e=(s.exs||[]).find(x=>x&&x.name===ex.name&&x.note&&(x.sets||[]).some(z=>z&&z.done));if(e)return{sess:s,ex:e};}return null;})();")], 'GARDE', 'B-NOTE-③b'),
    ('M3 [deguisee] la note lue est celle de la seance EN COURS (pas de l\'historique)',
     [(LO, "function _noteExPrecedente(ex){\n  const v=ex&&_prevSeance(ex.name);",
           "function _noteExPrecedente(ex){\n  const v=ex&&{sess:{date:today()},ex:ex};")], 'GARDE', 'B-NOTE-⑧a'),
    # ── ② · lecture seule : jamais recopiee, jamais preremplie
    ('M4 « Note perso » est preremplie avec la note de la derniere fois',
     [(LO, "min-height:26px;outline:none;caret-color:var(--red);\">${(ex.note||'').replace(",
           "min-height:26px;outline:none;caret-color:var(--red);\">${(ex.note||(_noteExPrev&&_noteExPrev.texte)||'').replace(")], 'GARDE', 'B-NOTE-②a'),
    ('M5 [deguisee] ouvrir la fiche preremplit la note du jour QUAND ELLE EST VIDE',
     [(LO, "  ov.classList.add('open');\n}\nfunction closeExNotePrev(){",
           "  ov.classList.add('open');\n  if(!ex.note){ex.note=np.texte;persist();}\n}\nfunction closeExNotePrev(){")], 'GARDE', 'B-NOTE-①b'),
    ('M6 ouvrir la fiche remplace la note du jour',
     [(LO, "  ov.classList.add('open');\n}\nfunction closeExNotePrev(){",
           "  ov.classList.add('open');\n  ex.note=np.texte;persist();renderExBlocks();\n}\nfunction closeExNotePrev(){")], 'GARDE', 'B-NOTE-②d'),
    ('M7 la fiche devient modifiable (un champ a la place du texte)',
     [(LO, '<div class="sn-prev-x" style="white-space:pre-wrap;">« ${_escNote(np.texte)} »</div>',
           '<textarea class="sn-prev-x" rows="3">« ${_escNote(np.texte)} »</textarea>')], 'GARDE', 'B-NOTE-②c'),
    ('M8 [deguisee] la fiche porte la date du JOUR, pas celle de la seance',
     [(LO, 'Séance du ${_dateNoteFR(np.date)} · ${_escNote(np.nom)}', 'Séance du ${_dateNoteFR(today())} · ${_escNote(np.nom)}')], 'GARDE', 'B-NOTE-②b'),
    ('M9 « Fermer » ne referme plus la fiche',
     [(LO, "function closeExNotePrev(){const ov=document.getElementById('ov-ex-note-prev');if(ov)ov.classList.remove('open');}",
           "function closeExNotePrev(){}")], 'GARDE', 'B-NOTE-②f'),
    ('M10 [deguisee] lire la note ecrit dans le stockage',
     [(LO, "  ov.classList.add('open');\n}\nfunction closeExNotePrev(){",
           "  ov.classList.add('open');\n  try{localStorage.setItem('ft4_d087_vu','1');}catch(e){}\n}\nfunction closeExNotePrev(){")], 'GARDE', 'B-NOTE-⑨a'),
    ('M11 [deguisee] lire la note appelle Milo (requete coupee par le banc, aucune ne part)',
     [(LO, "  ov.classList.add('open');\n}\nfunction closeExNotePrev(){",
           "  ov.classList.add('open');\n  try{fetch(AI_PROXY_URL,{method:'POST',body:JSON.stringify({action:'coach',message:'note'})}).catch(()=>{});}catch(e){}\n}\nfunction closeExNotePrev(){")], 'GARDE', 'B-NOTE-⑨b'),
    # ── ⑧ · affichage iPhone
    ('M12 la zone d\'appui retombe a 24 px',
     [(CS, 'justify-content:flex-start;width:44px;height:44px;margin:-4px -6px -6px -8px;', 'justify-content:flex-start;width:24px;height:24px;margin:-4px -6px -6px -8px;')], 'GARDE', 'B-NOTE-⑧b'),
    ('M13 [deguisee] le point est masque (display:none, la couleur reste)',
     [(CS, '.exn-prev .exn-pt{position:absolute;', '.exn-prev .exn-pt{display:none;position:absolute;')], 'GARDE', 'B-NOTE-⑧a'),
    ('M14 l\'indicateur ne dit plus ce qu\'il ouvre (aucune date)',
     [(LO, 'aria-label="Note de la dernière fois, séance du ${_dateNoteFR(_noteExPrev.date)} — touche pour la lire"', 'aria-label="Note"')], 'GARDE', 'B-NOTE-⑧f'),
    # ── ① · conservation
    ('M15 [deguisee] la fin de seance range les exercices SANS leur note',
     [(LO, "const sess={id:Date.now(),date:S.wkt.date||today(),exs:S.wkt.exs,",
           "const sess={id:Date.now(),date:S.wkt.date||today(),exs:S.wkt.exs.map(({note,...e})=>e),")], 'GARDE', 'B-NOTE-①a'),
    # ── ④ ⑤ · commentaires de serie et types
    ('M16 [deguisee] la note d\'EXERCICE est pretee a la 1re serie (contamination)',
     [(LO, "  return _prevAligneDetail(v.sets, ex.sets).map(d=>{\n    const t=(d.exact&&d.p&&typeof d.p.note==='string')?d.p.note.trim():'';",
           "  return _prevAligneDetail(v.sets, ex.sets).map((d,i)=>{\n    const t=(d.exact&&d.p&&typeof d.p.note==='string')?d.p.note.trim():(i===0&&v.ex.note?String(v.ex.note):'');")], 'GARDE', 'B-NOTE-④a'),
    ('M17 [deguisee] changer le type d\'une serie efface son commentaire',
     [(LO, "  s.type=SET_TYPES[(cur===-1?0:cur+1)%SET_TYPES.length];\n",
           "  s.type=SET_TYPES[(cur===-1?0:cur+1)%SET_TYPES.length];\n  delete s.note;\n")], 'GARDE', 'B-NOTE-⑤a'),
    # ── ⑦ · Milo (simule)
    ('M18 Milo ne recoit plus la note d\'exercice dans l\'historique',
     [(CO, "${uni}${e.note?' [note: '+e.note+']':''}${_verdictMontee(e, ds)}", "${uni}${_verdictMontee(e, ds)}")], 'GARDE', 'B-NOTE-⑦a'),
    ('M19 Milo ne recoit plus la note de la seance EN COURS',
     [(CO, "      if(e.note)l+=` [note: ${e.note}]`;\n", "")], 'GARDE', 'B-NOTE-⑦c'),
    # ── equivalente
    ('M20 [equivalente] les deux regles CSS du point echangees (meme rendu)',
     [(CS, ".exn-prev{position:relative;flex-shrink:0;display:flex;align-items:flex-start;justify-content:flex-start;width:44px;height:44px;margin:-4px -6px -6px -8px;padding:9px 0 0 8px;border:none;border-radius:10px;background:none;font-size:14px;line-height:1;color:var(--t3);cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;}\n.exn-prev .exn-pt{position:absolute;top:5px;left:22px;width:8px;height:8px;border-radius:50%;background:var(--sea);box-shadow:0 0 0 2px var(--bg2);}\n",
           ".exn-prev .exn-pt{position:absolute;top:5px;left:22px;width:8px;height:8px;border-radius:50%;background:var(--sea);box-shadow:0 0 0 2px var(--bg2);}\n.exn-prev{position:relative;flex-shrink:0;display:flex;align-items:flex-start;justify-content:flex-start;width:44px;height:44px;margin:-4px -6px -6px -8px;padding:9px 0 0 8px;border:none;border-radius:10px;background:none;font-size:14px;line-height:1;color:var(--t3);cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;}\n")], 'OK'),
]


def banc(arbre):
    """Rend (rouges, plantage). Un plantage n'est jamais un rouge : il n'attrape rien."""
    try:
        r = subprocess.run(['node', 'tools/banc_notes_d087.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
                           env=dict(os.environ, TZ='Europe/Paris'))
    except subprocess.TimeoutExpired:
        return [], 'PLANTAGE (delai depasse)'
    out = r.stdout + r.stderr
    rouges = [l.strip()[:160] for l in out.split('\n') if 'ROUGE' in l]
    plantage = None
    if r.returncode not in (0, 1):
        plantage = 'PLANTAGE (code %d)' % r.returncode
    elif 'PLANTAGE' in out:
        plantage = 'PLANTAGE (' + next(l.strip()[:120] for l in out.split('\n') if 'PLANTAGE' in l) + ')'
    elif not any(l.startswith('────') and 'OK /' in l for l in out.split('\n')):
        plantage = 'PLANTAGE (aucune ligne de total)'
    return rouges, plantage


def temoin_present(rouges, temoin):
    pat = re.compile(re.escape(temoin) + r'(?![0-9A-Za-z])')
    return any(pat.search(l) for l in rouges)


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_d087_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def une(m, avant):
    nom, remplacements, attendu = m[0], m[1], m[2]
    temoin = m[3] if len(m) > 3 else None
    tmp, arbre = cloner()
    try:
        if remplacements == 'AVANT':
            cur = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
            if any(not avant[f] for f in FICHIERS) or all(avant[f] == cur[f] for f in FICHIERS):
                return nom, None, "INVALIDE (code d'avant introuvable ou identique)", []
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
                return nom, None, 'INVALIDE (ancre absente ou multiple : %s)' % invalide, []
            for f in FICHIERS:
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(srcs[f])
            # une mutation qui casse la SYNTAXE ne prouve rien (elle rougit tout) : on la refuse
            for f in FICHIERS:
                if f.endswith('.js'):
                    chk = subprocess.run(['node', '-e', "new Function(require('fs').readFileSync(process.argv[1],'utf8'))", os.path.join(arbre, f)], capture_output=True, text=True)
                    if chk.returncode:
                        return nom, None, 'INVALIDE (syntaxe cassee dans %s)' % f, []
        rouges, plantage = banc(arbre)
        if plantage:
            return nom, False, 'PLANTAGE', [plantage] + rouges
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu
        if ok and temoin and not temoin_present(rouges, temoin):
            ok, obtenu = False, 'GARDE sans ' + temoin
        return nom, ok, obtenu, rouges
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    avant = {f: subprocess.run(['git', 'show', AVANT + ':' + f], cwd=SRC, capture_output=True, text=True).stdout for f in FICHIERS}
    tmp0, a0 = cloner()
    rouges, plantage = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rouges or plantage:
        print('  !! ARBRE SAIN DEJA ROUGE OU EN PLANTAGE — controle refuse :', ([plantage] if plantage else []) + rouges[:3]); return 1
    print('  arbre sain : 0 rouge (point de depart valide) · MUT_J=%s\n' % os.environ.get('MUT_J', '1'))
    choix = [m for m in MUT if not filtres or any(m[0].startswith(f) for f in filtres)]
    with ThreadPoolExecutor(max_workers=int(os.environ.get('MUT_J', '1'))) as ex:
        res = list(ex.map(lambda m: une(m, avant), choix))
    conformes = 0
    for nom, ok, obtenu, rouges in res:
        if ok is None:
            print('  INVALIDE  %s %s' % (nom, obtenu)); continue
        conformes += ok
        print('  %s  %-100s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0] if rouges else ''))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges[1:]:
                print('        ' + r)
    # rejeu de l'arbre sain APRES la campagne : un banc instable aurait pu « attraper » par hasard
    tmp1, a1 = cloner()
    rouges1, plantage1 = banc(a1)
    shutil.rmtree(tmp1, ignore_errors=True)
    if rouges1 or plantage1:
        print('\n  !! ARBRE SAIN ROUGE AU REJEU FINAL — campagne refusee (banc instable) :', ([plantage1] if plantage1 else []) + rouges1[:3])
        return 1
    print('\n  arbre sain rejoue a la fin : 0 rouge (banc stable)')
    print('\n%d/%d conformes' % (conformes, len(choix)))
    return 0 if conformes == len(choix) else 1


if __name__ == '__main__':
    raise SystemExit(main())
