#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUT-PUNCH-01 (03/10/2026, session-B) : les temoins savent-ils ROUGIR ?

[!!] SUR UN ARBRE CLONE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque ligne decrit la COPIE MUTEE, jamais
     le comportement reel de l'application : « DANS LA COPIE MUTEE, … ».
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord (pour la partie du banc concernee).
[!!] Une mutation n'est « gardee » que si au moins un temoin EXECUTE (conduit dans la page) rougit.
     Un rouge des seuls temoins de SOURCE (« B-NP01-x source ») ne suffit pas.
  MA* = contrat Seance -> Nutrition (B-NP01-A) · MB* = cycle / cache / annonce / ecran vide (B-NP01-B)
  · EQ* = equivalentes (temoins EXECUTES verts ; seul le temoin de source, qui fige le texte, rougit) · [negatif] = commentaire seul (doit rester vert)
Usage : python3 tools/mut_nut_punch01.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ST, LO, SC, AP, TR, IX = 'state.js', 'log.js', 'screens.js', 'app.js', 'tracking.js', 'index.html'
FICHIERS = (ST, LO, SC, AP, TR, IX)

TDEE = "  return Math.round(calcBMR()*S.activityLevel+calcWorkExtra()+calcSportExtra()+calcPasExtra(refTs));\n"
_DU_JOUR = "(S.sessions||[]).filter(s=>s&&s.date===today())"
START = "  if(!ouverte) S.wkt={date:today(),exs:[],startHour:new Date().getHours()};\n"
ENCOURS = "    if(S.wkt && S.wkt.date===t) return {seance:true, heure:_heureSeance(S.wkt), source:'encours'};\n"
HONORE = "    if(lastDate&&lastDate>=np.date)return null;   // annonce honorée : la séance a été faite\n"
FIN_PR = "  const _oldPrs={};Object.keys(S.prs||{}).forEach(k=>{_oldPrs[k]={...S.prs[k]};});\n"

# (nom, remplacements, attendu, partie du banc)
MUT = [
    ('MA1 la DUREE de la seance du jour entre dans la depense',
     [(ST, TDEE, TDEE.replace("calcPasExtra(refTs));", "calcPasExtra(refTs)+" + _DU_JOUR + ".reduce((a,s)=>a+Math.round((s.duration||0)/60),0));"))], 'GARDE', 'contrat'),
    ('MA2 la METHODE (superset) entre dans la depense',
     [(ST, TDEE, TDEE.replace("calcPasExtra(refTs));", "calcPasExtra(refTs)+(" + _DU_JOUR + ".some(s=>(s.exs||[]).some(e=>e&&e.group))?50:0));"))], 'GARDE', 'contrat'),
    ('MA3 le VOLUME de la seance du jour entre dans la depense',
     [(ST, TDEE, TDEE.replace("calcPasExtra(refTs));", "calcPasExtra(refTs)+" + _DU_JOUR + ".reduce((a,s)=>a+Math.round((s.volume||0)/500),0));"))], 'GARDE', 'contrat'),
    ('MA4 la DISCIPLINE entre dans la depense',
     [(ST, TDEE, TDEE.replace("calcPasExtra(refTs));", "calcPasExtra(refTs)+(S.discipline==='powerlifting'?100:0));"))], 'GARDE', 'contrat'),
    ('MA5 le NIVEAU entre dans la depense',
     [(ST, TDEE, TDEE.replace("calcPasExtra(refTs));", "calcPasExtra(refTs)+(S.level==='confirme'?80:0));"))], 'GARDE', 'contrat'),
    ('MA6 la seance est datee en UTC au lieu du jour local',
     [(LO, START, START.replace("date:today()", "date:new Date().toISOString().slice(0,10)"))], 'GARDE', 'contrat'),
    ('MA7 la fin de seance efface les codes de serie (tout devient N)',
     [(LO, FIN_PR, "  sess.exs.forEach(e=>(e.sets||[]).forEach(x=>{x.type='N';}));\n" + FIN_PR)], 'GARDE', 'contrat'),
    ('MA8 la seance EN COURS n\'est plus un jour de seance',
     [(ST, ENCOURS, "")], 'GARDE', 'contrat'),
    ('MA9 une annonce n\'est jamais honoree par la seance faite',
     [(ST, HONORE, "")], 'GARDE', 'contrat'),
    # ── B-NP01-B : cycle en jours, cache de region, jour annonce, ecran Seance vide ──
    ('MB1 le cycle recompte des SEANCES (retour de f = 8 / f = 6)',
     [(ST, "    const wk=_weeklyCounts(4,true);\n", "    const wk=_weeklyCounts(4);\n")], 'GARDE', 'cycle'),
    ('MB2 la region moyenne redevient une moyenne PAR SEANCE',
     [(ST, "    const facteurs=Object.keys(parJour).map(k=>_facteurRegion(parJour[k]));\n",
       "    const facteurs=(S.sessions||[]).filter(s=>{if(!s||!s.date)return false;const d=Math.round((new Date(t+'T12:00:00')-new Date(s.date+'T12:00:00'))/864e5);return d>=0&&d<28;}).map(_facteurRegion);\n")], 'GARDE', 'cycle'),
    ('MB3 la cle du cache de region ignore l\'etat des series',
     [(SC, "+'#'+(((e&&e.sets)||[]).some(x=>x&&x.done)?1:0)).join('~');", ").join('~');")], 'GARDE', 'cycle'),
    ('MB4 « en cours » relit S.wkt brut (ecran Seance vide = seance)',
     [(ST, "    if(S.wkt && S.wkt.date===t && ouverte) return", "    if(S.wkt && S.wkt.date===t) return")], 'GARDE', 'cycle'),
    ('MB5 le jour annonce reprend le facteur 1',
     [(ST, "    let rJour=rMoy;\n    if(js.seance){", "    let rJour=js.seance?1:rMoy;\n    if(js.seance&&faiteJ){")], 'GARDE', 'cycle'),
    ('MB6 la tuile « 7 derniers jours » compte des jours',
     [(SC, "_weeklyCounts(1)[0]:null;", "_weeklyCounts(1,true)[0]:null;")], 'GARDE', 'cycle'),
    ('MB7 la proposition de niveau d\'activite compte des jours',
     [(ST, "    const wk=_weeklyCounts(4);\n", "    const wk=_weeklyCounts(4,true);\n")], 'GARDE', 'cycle'),
    ('MB8 la carte de frequence de Milo compte des jours',
     [(TR, "    const wk=_weeklyCounts(4);\n", "    const wk=_weeklyCounts(4,true);\n")], 'GARDE', 'cycle'),
    ('MB9 [deguisee] le jour annonce devine la region depuis son libelle',
     [(ST, "    let rJour=rMoy;\n", "    let rJour=(js.source==='annoncee'&&/jambe/i.test((S.nextPlanned||{}).label||''))?_CYCLE_REGION.bas:rMoy;\n")], 'GARDE', 'cycle'),
    ('MB10 [deguisee] un jour compte une fois mais la region du jour = la PREMIERE seance du jour',
     [(ST, "      if(!s||!s.date||parJour[s.date]) return;\n", "      if(!s||!s.date) return;\n")], 'GARDE', 'cycle'),
    ('EQB1 [equivalente] la cle porte le NOMBRE de series validees (plus fine, meme resultat)',
     [(SC, "+'#'+(((e&&e.sets)||[]).some(x=>x&&x.done)?1:0)).join('~');", "+'#'+(((e&&e.sets)||[]).filter(x=>x&&x.done).length?1:0)).join('~');")], 'SOURCE', 'cycle'),
    ('[negatif] commentaire citant la duree et le volume dans calcTDEE',
     [(ST, TDEE, "  // (duree, volume, methode : jamais dans la depense)\n" + TDEE)], 'OK', 'contrat'),
]


def banc(arbre, partie):
    env = dict(os.environ, TZ='Europe/Paris')
    r = subprocess.run(['node', 'tools/banc_nut_punch01.js', partie], cwd=arbre, capture_output=True, text=True, timeout=1200, env=env)
    out = r.stdout + r.stderr
    rouges = [l.strip()[:170] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def executes(rouges):
    return [x for x in rouges if re.match(r'❌ ROUGE B-NP01-[A-F] (?!source)', x) or x.startswith('PLANTAGE')]


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_nut_punch01_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    choisies = [m for m in MUT if not filtres or any(m[0].startswith(f) for f in filtres)]
    parties = sorted(set(m[3] for m in choisies))
    for p in parties:
        tmp0, a0 = cloner()
        rouges = banc(a0, p)
        shutil.rmtree(tmp0, ignore_errors=True)
        if rouges:
            print('  !! ARBRE SAIN DEJA ROUGE (partie %s) — controle refuse :' % p, rouges[:3]); return 1
        print('  arbre sain, partie %s : 0 rouge (point de depart valide)' % p)
    print()
    conformes = total = 0
    for nom, remplacements, attendu, partie in choisies:
        total += 1
        tmp, arbre = cloner()
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
        rouges = banc(arbre, partie)
        ex = executes(rouges)
        obtenu = 'GARDE' if ex else ('SOURCE' if rouges else 'OK')
        ok = obtenu == attendu; conformes += ok
        montre = (ex or rouges or [''])[0]
        print('  %s  DANS LA COPIE MUTEE — %-66s %-6s %2d rouge(s), %2d execute(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), len(ex), montre))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                if r != montre:
                    print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    sys.exit(main())
