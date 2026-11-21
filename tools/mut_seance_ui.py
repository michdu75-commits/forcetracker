#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — ECRAN SEANCE EN COURS (Claude N°2, 16/11/2026) : les temoins B-SCUI savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Chaque mutation REMET UN DEFAUT que le lot a supprime (ou retire une protection qu'il a ajoutee) ; le banc `tools/banc_seance_ui.js`
doit alors rougir AU MOINS UNE fois. Une mutation qui laisse le banc vert = un temoin qui ne protege rien (R17 / R35). Point de depart :
0 rouge sur l'arbre sain, mesure d'abord. Une mutation marquee 'OK' est une LIMITE CONNUE (elle survit, et le dit).
Usage : python3 tools/mut_seance_ui.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_SEUL=M07 : une mutation)
A lancer sous le garde reseau : tools/sous_garde.sh python3 tools/mut_seance_ui.py
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANC = os.path.join('tools', 'banc_seance_ui.js')
FICHIERS = ('constants.js', 'log.js', 'index.html', 'style.css', 'coach.js', 'app.js', 'setup.js', 'screens.js', 'state.js')
LO, CS, IX = 'log.js', 'style.css', 'index.html'

SUPPR_FIN = "    persist();renderExBlocks();\n    if(document.getElementById('rest-bar')&&document.getElementById('rest-bar').classList.contains('show')) _renderRirRow();"
MUT = [
    # ── D-173 : supprimer la série CHOISIE ──
    ('M01 la suppression retire de nouveau la DERNIÈRE série (le défaut d\'avant : le 4ᵉ échauffement ne peut pas partir seul)',
     [(LO, "    ex.sets.splice(k,1);\n    const recaler", "    ex.sets.pop();\n    const recaler")], 'GARDE'),
    ('M02 une série POINTÉE part sans confirmation (la précaution contre le geste accidentel disparaît)',
     [(LO, "  if(set.done) showConfirm((_estPalierDrop(ex,si)?'Supprimer le palier ':'Supprimer la série ')", "  if(false) showConfirm((_estPalierDrop(ex,si)?'Supprimer le palier ':'Supprimer la série ')")], 'GARDE'),
    ('M03 une série NON pointée demande aussi une confirmation (elle ne part plus « tout de suite »)',
     [(LO, "  if(set.done) showConfirm((_estPalierDrop(ex,si)?'Supprimer le palier ':'Supprimer la série ')", "  if(true) showConfirm((_estPalierDrop(ex,si)?'Supprimer le palier ':'Supprimer la série ')")], 'GARDE'),
    ('M04 la question du RIR n\'est plus recalée : la réponse irait à la série d\'à côté',
     [(LO, "    const recaler=c=>(c&&c.ei===e)?(c.si===k?null:(c.si>k?Object.assign({},c,{si:c.si-1}):c)):c;", "    const recaler=c=>c;")], 'GARDE'),
    ('M05 la notion de PALIER disparaît (le réglage ne suit plus, la feuille ne dit plus « Palier » ; lot D : un palier isolé se supprime, le réglage suit)',
     [(LO, "function _estPalierDrop(ex,si){ return !!(ex&&ex.dropset)&&si>=_dropDebut(ex); }", "function _estPalierDrop(ex,si){ return false; }")], 'GARDE'),
    ('M06 on peut supprimer la DERNIÈRE série restante (la règle existante « jamais la dernière » saute)',
     [(LO, "||ex.sets.length<2) return false;", "||ex.sets.length<1) return false;")], 'GARDE'),
    ('M07 la suppression n\'est plus écrite sur le disque (règle d\'or #3)',
     [(LO, SUPPR_FIN, "    renderExBlocks();\n    if(document.getElementById('rest-bar')&&document.getElementById('rest-bar').classList.contains('show')) _renderRirRow();")], 'GARDE'),
    ('M08 les séries restantes sont RECONSTRUITES (identités et champs propres perdus : repos, notes, horodatages, RIR)',
     [(LO, "    ex.sets.splice(k,1);\n    const recaler", "    ex.sets=ex.sets.filter((_,i)=>i!==k).map(s=>({kg:s.kg,reps:s.reps,done:s.done,type:s.type}));\n    const recaler")], 'GARDE'),
    ('M09 le menu ⋯ ne propose plus « Supprimer une série… »',
     [(LO, "    +(_serieSupprimable(ex)?mRow('🧹','Supprimer une série…',`openSerieSuppr(${ei})`):'')", "    +''")], 'GARDE'),
    ('M10 la ligne touchée n\'est pas la bonne série (décalage d\'un cran dans la feuille)',
     [(LO, "    return `<button onclick=\"supprimerSerie(${ei},${si})\"", "    return `<button onclick=\"supprimerSerie(${ei},${si+1<ex.sets.length?si+1:si})\"")], 'GARDE'),
    ('M11 la règle n\'est offerte qu\'aux exercices du CATALOGUE (un exercice perso ou inédit ne peut plus supprimer une série)',
     [(LO, "  if(!ex||!Array.isArray(ex.sets)||ex.sets.length<2) return false;", "  if(!ex||!EXLIB.some(e=>e.n===ex.name)||!Array.isArray(ex.sets)||ex.sets.length<2) return false;")], 'GARDE'),
    ('M12 un nom d\'exercice du catalogue est codé en dur dans la règle',
     [(LO, "  if(!ex||!Array.isArray(ex.sets)||ex.sets.length<2) return false;", "  if(!ex||ex.name==='Développé Couché'||!Array.isArray(ex.sets)||ex.sets.length<2) return false;")], 'GARDE'),
    # ── D-175 : le bloc chrono + RIR moins haut, sans rien perdre ──
    ('M20 le rembourrage du bloc redevient celui d\'avant (12 px)',
     [(CS, "padding:4px 10px;border-radius:20px;background:var(--bg2);border:1px solid var(--sea-a2);", "padding:12px 12px 12px 14px;border-radius:22px;background:var(--bg2);border:1px solid var(--sea-a2);")], 'GARDE'),
    ('M21 les six réponses du RIR passent à 30 px de haut (cible tactile trop petite)',
     [(CS, "#rest-bar .rir-b{flex:1;min-width:0;height:40px;}", "#rest-bar .rir-b{flex:1;min-width:0;height:30px;}")], 'GARDE'),
    ('M22 −15 s / +15 s / Passer passent à 38 px de haut (sous les 44 px de D-086 ⑤c)',
     [(CS, "#rest-bar .rbtn{height:44px;min-width:52px;padding:0 9px;white-space:nowrap;}", "#rest-bar .rbtn{height:38px;min-width:52px;padding:0 9px;white-space:nowrap;}")], 'GARDE'),
    ('M23 la séparation, la marge et le rembourrage du RIR redeviennent ceux d\'avant (bloc plus haut)',
     [(CS, "#rest-rir{margin-top:5px;}", "#rest-rir{margin-top:12px;padding-top:10px;border-top:1px solid var(--sep);}")], 'GARDE'),
    ('M24 la question du RIR n\'est plus visible (la réponse perd son sens)',
     [(CS, "#rest-bar .rir-lbl{font-size:12px;line-height:1.1;", "#rest-bar .rir-lbl{display:none;font-size:12px;line-height:1.1;")], 'GARDE'),
    ('M25 le bouton du temps (réglage) repasse à 62 px : il déborde sur la question du RIR',
     [(CS, "#rest-bar .rd-time{flex:1;min-width:0;height:44px;", "#rest-bar .rd-time{flex:1;min-width:0;height:62px;")], 'GARDE'),
    ('M26 la rangée des réponses déborde du bloc (marge négative)',
     [(CS, "#rest-bar .rir-row{justify-content:stretch;flex-wrap:nowrap;margin-top:2px;}", "#rest-bar .rir-row{justify-content:stretch;flex-wrap:nowrap;margin-top:2px;margin-bottom:-14px;}")], 'GARDE'),
    # ── D-174 : le dock suit la fenêtre visible après un zoom ──
    ('M30 le dock ne suit plus la fenêtre visible (le correctif est neutralisé)',
     [(LO, "    const z=!!(v.scale>1.02&&bar.classList.contains('show'));", "    const z=false;")], 'GARDE'),
    ('M31 le dock suit la fenêtre mais SANS contre-zoom (366 px de large dans une fenêtre de 195 px)',
     [(LO, "+'px) scale('+(1/s)+')';", "+'px)';")], 'GARDE'),
    ('M32 revenu à ×1, le style de zoom reste en place (le dock ne retrouve pas sa place)',
     [(LO, "    if(!z){ bar.style.transform=''; return; }", "    if(!z){ return; }")], 'GARDE'),
    ('M33 le zoom est désactivé dans la balise viewport (user-scalable=no, maximum-scale=1)',
     [(IX, "maximum-scale=5.0, user-scalable=yes, viewport-fit=cover", "maximum-scale=1.0, user-scalable=no, viewport-fit=cover")], 'GARDE'),
    ('M34 le dock ne se replace plus quand il apparaît ou change de hauteur (plus d\'observateur de taille)',
     [(LO, "  if(bar&&typeof ResizeObserver!=='undefined') new ResizeObserver(aller).observe(bar);", "")], 'GARDE'),
    ('M35 le dock n\'écoute plus le zoom (plus d\'écouteur `resize` du visualViewport)',
     [(LO, "window.visualViewport.addEventListener('resize',aller); ", "")], 'GARDE'),
    ('M36 [LIMITE CONNUE] le décalage de la fenêtre visible (pan) est ignoré dans la position — Chromium ne rejoue pas le pan : la mutation SURVIT, et le dit',
     [(LO, "(v.offsetTop+v.height-(h+12)/s)", "(v.height-(h+12)/s)")], 'OK'),
]


def banc(arbre):
    r = subprocess.run(['node', BANC], cwd=arbre, capture_output=True, text=True, timeout=1800,
                       env=dict(os.environ, TZ='Europe/Paris'))
    out = r.stdout + r.stderr
    rouges = [l.strip()[:150] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    ok = re.search(r'(\d+) OK / (\d+) rouge', out)
    return rouges, (ok.group(0) if ok else '?')


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_scui_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'clone', 'exercises', 'anatomy', 'muscles'))
    # le banc lit les images du catalogue : on les lie (lecture seule) plutôt que de les copier
    for d in ('exercises', 'anatomy', 'muscles'):
        if os.path.isdir(os.path.join(SRC, d)) and not os.path.exists(os.path.join(a, d)):
            os.symlink(os.path.join(SRC, d), os.path.join(a, d))
    return tmp, a


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    seul = os.environ.get('MUT_SEUL')
    tmp0, a0 = cloner()
    rouges, bilan = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rouges:
        print('  !! ARBRE SAIN DEJA ROUGE — controle refuse :', rouges[:3]); return 1
    print('  arbre sain : 0 rouge (%s) — point de depart valide\n' % bilan)
    conformes = total = 0
    for nom, remplacements, attendu in MUT:
        if filtres and not any(nom.startswith(f) for f in filtres):
            continue
        if seul and not nom.startswith(seul):
            continue
        total += 1
        tmp, arbre = cloner()
        srcs = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS if os.path.exists(os.path.join(arbre, f))}
        invalide = []
        for f, av, ap in remplacements:
            if srcs[f].count(av) != 1:
                invalide.append('%s:%s (x%d)' % (f, av[:60], srcs[f].count(av)))
            else:
                srcs[f] = srcs[f].replace(av, ap, 1)
        if invalide:
            print('  INVALIDE  %s (ancre absente ou multiple : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
        for f in srcs:
            open(os.path.join(arbre, f), 'w', encoding='utf-8').write(srcs[f])
        rouges, bilan = banc(arbre)
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu; conformes += ok
        print('  %s  %-110s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0][:90] if rouges else ''))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
