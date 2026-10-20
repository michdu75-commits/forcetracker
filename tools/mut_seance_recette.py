#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — SEANCE : corrections de la recette iPhone du 19/10/2026 + « Precedent » sur 4 seances (D-093) : les temoins
B-SR-* savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord ; l'arbre sain est REJOUE a la fin (banc stable).
M00 remet les fichiers tels qu'ils etaient AVANT le chantier (400b9034 = D-091 + D-092 + RIR-SS), mot pour mot : la nouveaute
y rougit (ecran de fin, selecteur, RIR de l'historique, « Precedent », feuille) ; les temoins de l'EXISTANT (compteur, carte
D-092, volume enregistre, export, Milo, note de serie, suggestions grises, « + », Statistiques) y restent verts.
Les autres mutations visent un INVARIANT ou un rouage precis, chacune avec SES temoins (4e champ, tous exiges).
[deguisee] = casse l'invariant sans toucher la ligne evidente ; [equivalente] = ne doit PAS rougir.
Un PLANTAGE du banc (code hors 0/1, ligne PLANTAGE, pas de ligne de total) n'est jamais « garde ».
⛔ Aucune mutation ne fait d'appel reel : le banc coupe toute requete hors du serveur local ; Milo n'est jamais appele.
Usage : python3 tools/mut_seance_recette.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_J=1 par defaut)
"""
import os, re, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVANT = '400b9034'          # le code d'avant le chantier : « echec » = 0, « Precedent » repete, « Volume » = le travail
LG, SE, CS, SC, CT, AP, CO, ST = 'log.js', 'setup.js', 'style.css', 'screens.js', 'constants.js', 'app.js', 'coach.js', 'state.js'
FICHIERS = (LG, SE, CS, SC, CT, AP, CO, ST)

MUT = [
    ('M00 le code d\'AVANT le chantier (400b9034), mot pour mot', 'AVANT', 'GARDE',
     ('B-SR-②b', 'B-SR-②c', 'B-SR-②f', 'B-SR-③a', 'B-SR-③c', 'B-SR-④a', 'B-SR-⑤a', 'B-SR-⑥a', 'B-SR-⑦a')),
    # ── ③ le selecteur de reserve
    ('M01 « Echec » ecrit un RIR 0 comme avant (au lieu du tag X)',
     [(LG, "if(n==='X'){ set.type='X'; delete set.rir; delete set.rirV; }", "if(n==='X'){ set.rir=0; }")], 'GARDE', ('B-SR-③c',)),
    ('M02 « 0 » n\'est plus marque reponse nouvelle (rirV)',
     [(LG, "set.rir=Math.max(0,Math.min(RIR_MAX,Math.round(+n)||0)); set.rirV=RIR_V; }", "set.rir=Math.max(0,Math.min(RIR_MAX,Math.round(+n)||0)); }")],
     'GARDE', ('B-SR-③b', 'B-SR-③g')),
    ('M03 [deguisee] un ANCIEN 0 coche « 0 » (l\'ambiguite disparait de l\'ecran)',
     [(LG, "const on=(!fige&&cur===n&&!(n===0&&ancien0));", "const on=(!fige&&cur===n);")], 'GARDE', ('B-SR-③k',)),
    ('M04 « ✕ » apres « Echec » laisse la serie en X',
     [(LG, "else if(n===null){ if(set.type==='X') set.type='N'; delete set.rir; delete set.rirV; }", "else if(n===null){ delete set.rir; delete set.rirV; }")],
     'GARDE', ('B-SR-③f',)),
    ('M05 [deguisee] changer d\'avis (Echec → 2) ne repasse pas la serie en N',
     [(LG, "else{ if(set.type==='X') set.type='N'; set.rir=", "else{ set.rir=")], 'GARDE', ('B-SR-③d',)),
    ('M06 en RPE, « Echec » passe en tete (l\'ordre du bareme est casse)',
     [(LG, "if(_estRpe()){ for(let n=RIR_MAX;n>=0;n--) html+=btn(n); html+=btnEchec; }", "if(_estRpe()){ html+=btnEchec; for(let n=RIR_MAX;n>=0;n--) html+=btn(n); }")],
     'GARDE', ('B-SR-③l',)),
    ('M07 [deguisee] les 7 boutons ne tiennent plus sur une ligne a 360 px (largeur minimale)',
     [(CS, "#rest-bar .rir-b{padding:0 2px;}", "#rest-bar .rir-b{padding:0 2px;min-width:52px;}")], 'GARDE', ('B-SR-③m',)),
    ('M08 [deguisee] superset : « Echec » de la 2e question ecrit sur le 1er exercice',
     [(LG, "onclick=\"setRir(${c.ei},${c.si},'X')\"", "onclick=\"setRir(0,${c.si},'X')\"")], 'GARDE', ('B-SR-⑦c',)),
    # ── ② l'ecran de fin et le detail
    ('M09 l\'ecran de fin redit le TRAVAIL sous « Volume total » (comme avant)',
     [(LG, "'<div class=\"se-stat\"><div class=\"se-stat-v\">'+_kg(_volTot)+' kg</div>", "'<div class=\"se-stat\"><div class=\"se-stat-v\">'+_kg(_volTrav)+' kg</div>")],
     'GARDE', ('B-SR-②b',)),
    ('M10 « Series de travail » compte aussi les echauffements',
     [(LG, "tiles.push('<div class=\"se-stat\"><div class=\"se-stat-v\">'+nSets+'</div>", "tiles.push('<div class=\"se-stat\"><div class=\"se-stat-v\">'+nValid+'</div>")],
     'GARDE', ('B-SR-②c',)),
    ('M11 [deguisee] la seance ENREGISTREE prend le total (echauffements compris) au lieu du travail',
     [(LG, "const vol=_workVol({exs:S.wkt.exs,uniConv:1});", "const vol=_workVol({exs:S.wkt.exs,uniConv:1},true);")], 'GARDE', ('B-SR-②d',)),
    ('M12 le detail de la seance redit le travail comme un total',
     [(SE, "${_kgfr(_vTrav+_vEch)} kg total", "${_kgfr(_vTrav)} kg total")], 'GARDE', ('B-SR-②f',)),
    # ── ④ le RIR dans l'historique, l'export et Milo
    ('M13 le detail de la seance n\'affiche plus le RIR',
     [(SE, "</div>${_rt?`<div class=\"sd-rir\"", "</div>${false?`<div class=\"sd-rir\"")], 'GARDE', ('B-SR-④a', 'B-SR-④b')),
    ('M14 [deguisee] le detail lit le RIR brut (un echauffement et un X en affichent un)',
     [(SE, "const _rt=(typeof _reserveHistoTxt==='function')?_reserveHistoTxt(s):'';", "const _rt=(s.rir!=null&&s.rir!=='')?'RIR '+s.rir:'';")],
     'GARDE', ('B-SR-④b',)),
    ('M15 un ANCIEN 0 se lit « RIR 0 » (l\'ambiguite est effacee)',
     [(LG, "  if(_rir0Ambigu(set)) return '0 ou échec';\n", "")], 'GARDE', ('B-SR-④b', 'B-SR-⑥g')),
    ('M16 [deguisee] en RPE l\'historique parle RIR',
     [(LG, "  if(_estRpe()) return 'RPE '+", "  if(false) return 'RPE '+")], 'GARDE', ('B-SR-④i',)),
    ('M17 l\'export change de format (la colonne RIR prend un libelle)',
     [(SE, "rir:(r===null?'':r), volume:Math.round(kg*reps)});", "rir:(r===null?'':'RIR '+r), volume:Math.round(kg*reps)});")], 'GARDE', ('B-SR-④c',)),
    ('M18 [deguisee] Milo recoit une ancienne reponse reclassee (« RIR0? »)',
     [(CO, "const rir = (_r===null) ? '' : (' RIR'+_r);", "const rir = (_r===null) ? '' : (' RIR'+_r+((typeof _rir0Ambigu==='function'&&_rir0Ambigu(x))?'?':''));")],
     'GARDE', ('B-SR-④d',)),
    # ── ⑤ la colonne « Precedent »
    ('M19 « Precedent » repete encore la derniere serie d\'avant (le repli revient a l\'ecran)',
     [(LG, "pv=(prevDet[si]&&prevDet[si].exact)?p:null;", "pv=p;")], 'GARDE', ('B-SR-⑤a',)),
    ('M20 [deguisee] les suggestions grises perdent le repli (5e et 6e lignes vides)',
     [(LG, "placeholder=\"${set.maxi?'max':(p?p.reps:'')}\"", "placeholder=\"${set.maxi?'max':(pv?pv.reps:'')}\"")], 'GARDE', ('B-SR-⑤c',)),
    ('M21 la case « Precedent » ouvre la comparaison au lieu de la note',
     [(LG, "<div class=\"sprev${_pn?' a-note':''}\" onclick=\"openSetNote(${ei},${si})\"", "<div class=\"sprev${_pn?' a-note':''}\" onclick=\"openDernieresSeances(${ei})\"")],
     'GARDE', ('B-SR-⑤d',)),
    ('M22 [deguisee] un ancien 0 se lit « 0r » dans la colonne (l\'ambiguite disparait)',
     [(LG, "  if(_rir0Ambigu(p)) return `<span class=\"prev-rir\"", "  if(false) return `<span class=\"prev-rir\"")], 'GARDE', ('B-SR-⑤e',)),
    # ── ⑥⑦ la feuille « 4 dernieres seances »
    ('M23 « Precedent ▾ » ouvre la note au lieu de la feuille',
     [(LG, "onclick=\"event.stopPropagation();openDernieresSeances(${ei})\"", "onclick=\"event.stopPropagation();openSetNote(${ei},0)\"")], 'GARDE', ('B-SR-⑥a',)),
    ('M24 une seance ou l\'exercice n\'a AUCUNE serie faite compte quand meme',
     [(LG, "    if(!sets.length) continue;\n    out.push({sess:s,ex,sets});", "    out.push({sess:s,ex,sets});")], 'GARDE', ('B-SR-⑥b',)),
    ('M25 [deguisee] les colonnes sont dans l\'ordre inverse (la plus recente a gauche)',
     [(LG, ".slice().sort((a,b)=>_cmpSeances(b.sess,a.sess));", ".slice().sort((a,b)=>_cmpSeances(a.sess,b.sess));")], 'GARDE', ('B-SR-⑥b',)),
    ('M26 deux seances du meme jour ne sont plus distinguees (meme en-tete)',
     [(LG, "    if(memes.length<2) return {date:dateCourte(d), rang:'', h:''};", "    if(true) return {date:dateCourte(d), rang:'', h:''};")], 'GARDE', ('B-SR-⑥c',)),
    ('M27 les echauffements entrent dans la grille de travail',
     [(LG, "trav:v.sets.filter(s=>!ech(s)), echs:", "trav:v.sets, echs:")], 'GARDE', ('B-SR-⑥d', 'B-SR-⑥f')),
    ('M28 [deguisee] une serie absente est remplacee par la derniere (repetition)',
     [(LG, "${cols.map(c=>c.trav[k]?cellule(c.trav[k]):vide).join('')}", "${cols.map(c=>c.trav[k]?cellule(c.trav[k]):(c.trav.length?cellule(c.trav[c.trav.length-1]):vide)).join('')}")],
     'GARDE', ('B-SR-⑥d',)),
    ('M29 un verdict de progression apparait (fleche et ecart)',
     [(LG, "      +(notes.length?`<div class=\"p4-notes\">", "      +'<div class=\"p4-verdict\">📈 +20 kg</div>'+(notes.length?`<div class=\"p4-notes\">")], 'GARDE', ('B-SR-⑥e',)),
    ('M30 la note de l\'exercice disparait de la feuille',
     [(LG, "      if(ne) notes.push(", "      if(false) notes.push(")], 'GARDE', ('B-SR-⑥h',)),
    ('M31 [deguisee] ouvrir la feuille ECRIT dans le stockage',
     [(LG, "  ov.classList.add('open');\n}\nfunction closeDernieresSeances(){", "  persist();ov.classList.add('open');\n}\nfunction closeDernieresSeances(){")],
     'GARDE', ('B-SR-⑥j',)),
    ('M32 le menu ⋯ perd « 4 dernieres seances »',
     [(LG, "    +mRow('📋','4 dernières séances',`closeExMenu();openDernieresSeances(${ei})`)", "")], 'GARDE', ('B-SR-⑥l',)),
    ('M33 [deguisee] la feuille lit toujours le 1er exercice de la seance',
     [(LG, "  const ex=S.wkt&&S.wkt.exs&&S.wkt.exs[ei]; if(!ex) return;\n  const liste=", "  const ex=S.wkt&&S.wkt.exs&&S.wkt.exs[0]; if(!ex) return;\n  const liste=")],
     'GARDE', ('B-SR-⑥n', 'B-SR-⑦d')),
    ('M34 [deguisee] la grille deborde a 360 px (largeur minimale imposee)',
     [(CS, ".p4-grille{width:100%;table-layout:fixed;", ".p4-grille{width:100%;min-width:480px;table-layout:fixed;")], 'GARDE', ('B-SR-⑥q',)),
    ('M35 [deguisee] l\'en-tete des series grandit (pastille de 48 px)',
     [(CS, "width:100%;height:28px;margin:0;padding:0 4px;border:none;border-radius:14px;", "width:100%;height:48px;margin:0;padding:0 4px;border:none;border-radius:14px;")],
     'GARDE', ('B-SR-⑥q',)),
    ('M36 un exercice jamais fait a quand meme « Precedent ▾ »',
     [(LG, "const _pH=prev.length?`<span class=\"sprev-hw\">", "const _pH=true?`<span class=\"sprev-hw\">")], 'GARDE', ('B-SR-⑥p',)),
    ('M37 [deguisee] la feuille lit le nom gardé par le menu ⋯ (celui d\'AVANT le remplacement)',
     [(LG, "const liste=_seancesExercice(ex.name,_P4_MAX)", "const liste=_seancesExercice((typeof _exMenuCtx!=='undefined'&&_exMenuCtx&&_exMenuCtx.nm)||ex.name,_P4_MAX)")],
     'GARDE', ('B-SR-⑦e',)),
    # ── ④ la chaîne complète et la restauration (renfort : familles 5 et 13 du brief)
    ('M39 [deguisee] la RESTAURATION perd le marqueur d\'une reponse nouvelle (rirV)',
     [(ST, "if(!l){ out.push(c);", "if(!l){ out.push(JSON.parse(JSON.stringify(c).replace(/,\"rirV\":2/g,'')));")], 'GARDE', ('B-SR-④l',)),
    ('M40 [deguisee] la FIN de seance perd le marqueur d\'une reponse nouvelle (rirV)',
     [(LG, "exs:S.wkt.exs,volume:Math.round(vol)", "exs:JSON.parse(JSON.stringify(S.wkt.exs).replace(/,\"rirV\":2/g,'')),volume:Math.round(vol)")], 'GARDE', ('B-SR-④k',)),
    # ── les aides (R23) : un texte faux qui revient
    ('M41 [deguisee] l\'echelle du Profil redit « 0 = echec » (l\'ancienne phrase revient a cote de la nouvelle)',
     [(SE, "faire. <b>0</b> = ta dernière répétition", "faire. <b>0 = échec.</b> <b>0</b> = ta dernière répétition")], 'GARDE', ('B-SR-③n',)),
    ('M42 [deguisee] le Guide reprend l\'ancienne liste « echec, 1, 2, 3, 4+ » (sans 0)',
     [(AP, "Un tap — <b>Échec, 0, 1, 2, 3, 4+</b>", "Un tap — <b>échec, 1, 2, 3, 4+</b>")], 'GARDE', ('B-SR-③n',)),
    ('M43 [deguisee] la DERNIERE annonce « Quoi de neuf » sur la reserve reprend l\'ancienne liste (sans 0)',
     [(CT, "① Après une série, la réserve se note <b>Échec · 0 · 1 · 2 · 3 · 4+</b>", "① Après une série, la réserve se note <b>échec · 1 · 2 · 3 · 4+</b>")],
     'GARDE', ('B-SR-③n',)),
    ('M44 [equivalente] une annonce PASSEE (v62, datee) garde l\'ancienne liste : elle n\'est pas lue, rien ne rougit',
     [(CT, "un tap : <b>échec · 1 · 2 · 3 · 4+</b>. ⚠️ Facultatif", "un tap : <b>échec · 1 · 2 · 3 · 4+</b> (texte d\\'époque). ⚠️ Facultatif")], 'OK'),
    ('M38 [equivalente] le bouton de fermeture de la feuille change de fond',
     [(CS, ".p4-fermer{flex:none;width:36px;height:36px;border-radius:50%;border:none;background:var(--bg3);",
           ".p4-fermer{flex:none;width:36px;height:36px;border-radius:50%;border:none;background:var(--bg2);")], 'OK'),
]


def banc(arbre):
    """Rend (rouges, plantage). Un plantage n'est jamais un rouge : il n'attrape rien."""
    try:
        r = subprocess.run(['node', 'tools/banc_seance_recette.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
                           env=dict(os.environ, TZ='Europe/Paris'))
    except subprocess.TimeoutExpired:
        return [], 'PLANTAGE (delai depasse)'
    out = r.stdout + r.stderr
    rouges = [l.strip()[:170] for l in out.split('\n') if 'ROUGE' in l]
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
    tmp = tempfile.mkdtemp(prefix='mut_sr_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def une(m, avant):
    nom, remplacements, attendu = m[0], m[1], m[2]
    temoins = m[3] if len(m) > 3 else ()
    tmp, arbre = cloner()
    try:
        if isinstance(remplacements, str) and remplacements == 'AVANT':
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
                    chk = subprocess.run(['node', '--check', os.path.join(arbre, f)], capture_output=True, text=True)
                    if chk.returncode:
                        return nom, None, 'INVALIDE (syntaxe cassee dans %s)' % f, []
        rouges, plantage = banc(arbre)
        if plantage:
            return nom, False, 'PLANTAGE', [plantage] + rouges
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu
        manque = [t for t in temoins if not temoin_present(rouges, t)]
        if ok and manque:
            ok, obtenu = False, 'GARDE sans ' + ', '.join(manque)
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
