#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — D-086 (18/10/2026) : les temoins B-D086-* savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord ; l'arbre sain est REJOUE a la fin (banc stable).
M00 remet les fichiers servis tels qu'ils etaient AVANT D-086 (source D-085 @ 6d9b6c90), mot pour mot : les temoins des
corrections (type visible, Precedent, commentaire, dock, Passer, bandeau, heure des messages) y rougissent.
Les autres mutations visent un INVARIANT ou un rouage precis, chacune avec SON temoin (4e champ).
[deguisee] = casse l'invariant sans toucher la ligne evidente ; [equivalente] = ne doit PAS rougir.
Un PLANTAGE du banc (code hors 0/1, ligne PLANTAGE, pas de ligne de total) n'est jamais « garde ».
Usage : python3 tools/mut_ux_d086.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_J=1 par defaut)
"""
import os, re, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = '6d9b6c90'
LO, IX, CS, CO = 'log.js', 'index.html', 'style.css', 'coach.js'
FICHIERS = ('log.js', 'index.html', 'style.css', 'coach.js')

MUT = [
    ("M00 code d'AVANT D-086 remis mot pour mot (source D-085 @ 6d9b6c90)", 'AVANT', 'GARDE', 'B-D086-①b'),
    # ── ① / ④ · le type visible
    ('M1 la pastille de type ne dit plus rien (lettre absente)',
     [(LO, '<span class="tbtn ${_tt}">${_tt}</span>', '<span class="tbtn ${_tt}"></span>')], 'GARDE', 'B-D086-①b'),
    ('M2 [deguisee] la pastille affiche toujours « N » (l\'etat choisi n\'est plus visible)',
     [(LO, '<span class="tbtn ${_tt}">${_tt}</span>', '<span class="tbtn ${_tt}">N</span>')], 'GARDE', 'B-D086-①c'),
    ('M3 la zone d\'appui du type retombe a 34 px',
     [(CS, '.set-row .stype{display:flex;align-items:center;justify-content:center;width:44px;height:44px;', '.set-row .stype{display:flex;align-items:center;justify-content:center;width:34px;height:34px;')], 'GARDE', 'B-D086-④a'),
    ('M4 l\'en-tete perd « Type » (colonnes decalees)',
     [(LO, '<span>#</span><span>Type</span><span>Précédent</span>', '<span>#</span><span>Précédent</span>')], 'GARDE', 'B-D086-①a'),
    # ── ③ · Precedent
    ('M5 « Precedent » retombe en petit et en gris (13 px, --t3)',
     [(CS, 'font-family:var(--font-cond);font-size:15px;font-weight:600;line-height:1.2;letter-spacing:-.01em;font-variant-numeric:tabular-nums;color:#C3C7D0;}',
           'font-family:var(--font-cond);font-size:13px;font-weight:600;line-height:1.2;letter-spacing:-.01em;font-variant-numeric:tabular-nums;color:var(--t3);}')], 'GARDE', 'B-D086-③b'),
    ('M6 [deguisee] la taille reduite des petits ecrans disparait (le nombre deborde a 360 px)',
     [(CS, "@media (max-width:374px){ #s-log .sprev{font-size:14px;letter-spacing:-.02em;} }", "")], 'GARDE', 'B-D086-③e'),
    ('M7 [deguisee] le marqueur ne peut plus passer a la ligne (il deborde de la case)',
     [(LO, '<span class="sprev-n">${p.reps}×${p.kg}</span><wbr>${_prevTypeBadge(p)}<wbr>${_prevRirBadge(p)}', '<span class="sprev-n">${p.reps}×${p.kg}${_prevTypeBadge(p)}${_prevRirBadge(p)}</span>')], 'GARDE', 'B-D086-③e'),
    ('M8 les marqueurs E / X retombent a 9 px',
     [(LO, 'return `<sup style="font-size:11px;font-weight:800;color:${col};margin-left:2px;line-height:0;">${t}</sup>`;', 'return `<sup style="font-size:9px;font-weight:800;color:${col};margin-left:2px;line-height:0;">${t}</sup>`;')], 'GARDE', 'B-D086-③c'),
    # ── ⑩ · le commentaire de la derniere fois
    ('M9 [deguisee] le point ignore la correspondance EXACTE (la ligne du repli recoit la note)',
     [(LO, "const t=(d.exact&&d.p&&typeof d.p.note==='string')?d.p.note.trim():'';", "const t=(d.p&&typeof d.p.note==='string')?d.p.note.trim():'';")], 'GARDE', 'B-D086-⑩a'),
    ('M10 [deguisee] la note de l\'EXERCICE est pretee a la 1re serie',
     [(LO, "  return _prevAligneDetail(v.sets, ex.sets).map(d=>{\n    const t=(d.exact&&d.p&&typeof d.p.note==='string')?d.p.note.trim():'';",
           "  return _prevAligneDetail(v.sets, ex.sets).map((d,i)=>{\n    const t=(d.exact&&d.p&&typeof d.p.note==='string')?d.p.note.trim():(i===0&&v.ex.note?String(v.ex.note):'');")], 'GARDE', 'B-D086-⑩a'),
    ('M11 [deguisee] l\'origine affichee est la date du jour (pas celle de la seance)',
     [(LO, 'Séance du ${_dateNoteFR(_np.date)}', 'Séance du ${_dateNoteFR(today())}')], 'GARDE', 'B-D086-⑩d'),
    ('M12 le commentaire s\'ecrit de nouveau DANS la ligne',
     [(LO, "function _setPrevNote(set,p){\n  if(set&&set.note)", "function _setPrevNote(set,p){\n  if(p&&p.note)return `<div>💬 ${_escNote(p.note)}</div>`;\n  if(set&&set.note)")], 'GARDE', 'B-D086-⑩b'),
    # ── ⑤ ⑥ ⑦ · le repos
    ('M13 le temps n\'est plus au centre (+15 s passe avant lui)',
     [(IX, '      <button class="rbtn" id="rest-btn-minus" onclick="addRT(-_restStep)">−15&nbsp;s</button>\n',
           '      <button class="rbtn" id="rest-btn-minus" onclick="addRT(-_restStep)">−15&nbsp;s</button>\n      <button class="rbtn" id="rest-btn-plus" onclick="addRT(_restStep)">+15&nbsp;s</button>\n'),
      (IX, '<span class="vh">Régler le repos</span></button>\n      <button class="rbtn" id="rest-btn-plus" onclick="addRT(_restStep)">+15&nbsp;s</button>\n',
           '<span class="vh">Régler le repos</span></button>\n')], 'GARDE', 'B-D086-⑤a'),
    ('M14 le temps du dock redevient petit (22 px)',
     [(CS, '#rest-bar #rest-time{font-size:32px;line-height:1;}', '#rest-bar #rest-time{font-size:22px;line-height:1;}'),
      (CS, '  #rest-bar #rest-time{font-size:28px;}', '  #rest-bar #rest-time{font-size:20px;}')], 'GARDE', 'B-D086-⑤b'),
    ('M15 30 s et 45 s ne sont pas proposes',
     [(IX, '      <button class="rbtn" id="rp-30" onclick="setRestPreset(30);closeRestEdit()">30&nbsp;s</button>\n      <button class="rbtn" id="rp-45" onclick="setRestPreset(45);closeRestEdit()">45&nbsp;s</button>\n', '')], 'GARDE', 'B-D086-⑥a'),
    ('M16 [deguisee] la duree choisie n\'est plus memorisee pour l\'exercice (pas reprise a la serie suivante)',
     [(LO, 'if(_restEx){S.exRestPref=S.exRestPref||{};S.exRestPref[_restEx]=sec;persist();}', '')], 'GARDE', 'B-D086-⑥d'),
    ('M17 « Passer » du plein ecran redevient gris',
     [(IX, 'border-radius:50px;background:var(--sea-fill);color:#fff;font-size:15px', 'border-radius:50px;background:rgba(255,255,255,.09);color:rgba(255,255,255,.55);font-size:15px')], 'GARDE', 'B-D086-⑦b'),
    # ── ⑨ · le bandeau
    ('M18 le bandeau est de nouveau force sur une ligne (il deborde)',
     [(CS, 'white-space:normal;width:max-content;max-width:calc(100% - 32px);', 'white-space:nowrap;')], 'GARDE', 'B-D086-⑨a'),
    # ── ⑪ ⑫ ⑬ · les messages de Milo
    ('M19 [deguisee] un message sans heure prend l\'heure de CONSULTATION',
     [(CO, "  if (!isFinite(n) || n < Date.UTC(2020, 0, 1)) return 'Date indisponible';", "  if (!isFinite(n) || n < Date.UTC(2020, 0, 1)) return _heureMsgTxt(Date.now());")], 'GARDE', 'B-D086-⑫a'),
    ('M20 le fil reconstruit n\'affiche plus l\'heure enregistree',
     [(CO, "    if(m.role === 'user') renderCoachMsg('user', t || '[photo]', {ts: m.ts});", "    if(m.role === 'user') renderCoachMsg('user', t || '[photo]');")], 'GARDE', 'B-D086-⑪a'),
    ('M21 [deguisee] l\'heure est ecrite DANS le texte de la bulle (le 👎, le partage et le PDF la reliraient)',
     [(CO, "  if (opts && Object.prototype.hasOwnProperty.call(opts, 'ts')) div.dataset.heure = _heureMsgTxt(opts.ts);",
           "  if (opts && Object.prototype.hasOwnProperty.call(opts, 'ts')) { div.dataset.heure = _heureMsgTxt(opts.ts); setTimeout(()=>{ const s=document.createElement('small'); s.textContent=' '+div.dataset.heure; div.appendChild(s); },0); }")], 'GARDE', 'B-D086-⑬a'),
    ('M22 [deguisee] le fil s\'affiche a l\'envers (ordre de l\'historique perdu)',
     [(CO, "  coachHistory.forEach(m=>{", "  coachHistory.slice().reverse().forEach(m=>{")], 'GARDE', 'B-D086-⑬a'),
    ('M23 [deguisee] afficher le fil appelle le reseau',
     [(CO, "  coachHistory.forEach(m=>{", "  try{ fetch('/ping-d086').catch(()=>{}); }catch(e){}\n  coachHistory.forEach(m=>{")], 'GARDE', 'B-D086-⑬b'),
    # ── ⑮ · stockage
    ('M24 [deguisee] lire un commentaire ecrit une cle NOUVELLE',
     [(LO, "  _setNoteCtx={ei,si};\n", "  _setNoteCtx={ei,si};\n  try{ localStorage.setItem('ft4_d086_vu','1'); }catch(e){}\n")], 'GARDE', 'B-D086-⑮a'),
    # ── equivalente
    ('M25 [equivalente] deux regles CSS independantes de la fenetre de note echangees (meme rendu)',
     [(CS, ".sn-prev-t{font-size:12px;font-weight:800;color:var(--sea);}\n.sn-prev-o{margin-top:2px;font-size:11.5px;color:var(--t2);}\n",
           ".sn-prev-o{margin-top:2px;font-size:11.5px;color:var(--t2);}\n.sn-prev-t{font-size:12px;font-weight:800;color:var(--sea);}\n")], 'OK'),
]


def banc(arbre):
    """Rend (rouges, plantage). Un plantage n'est jamais un rouge : il n'attrape rien."""
    try:
        r = subprocess.run(['node', 'tools/banc_ux_d086.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
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
    tmp = tempfile.mkdtemp(prefix='mut_d086_')
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
