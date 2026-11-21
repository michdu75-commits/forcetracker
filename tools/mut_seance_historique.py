#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — LA SEANCE D'UN JOUR DE PROGRAMME (Claude N°2, 16/11/2026, D-163 · D-168 · D-171 · D-165 · D-167) : les temoins B-SCHIS savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Chaque mutation REMET UN DEFAUT que le lot supprime (ou retire une protection qu'il ajoute) ; le banc `tools/banc_seance_historique.js` doit alors rougir AU MOINS une fois.
Une mutation qui laisse le banc vert = un temoin qui ne protege rien (R17 / R35). Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
Les trois defauts que le cahier des charges demande de voir rougir : « l'historique d'un AUTRE jour est repris » (M02, M03) · « une valeur modifiee a la main est ecrasee par l'historique » (M04, M05, M07, M09) ·
« un NOM d'exercice decide » (M01).
Usage : python3 tools/mut_seance_historique.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_SEUL=M07 : une mutation)
A lancer sous le garde reseau : tools/sous_garde.sh python3 tools/mut_seance_historique.py
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANC = os.path.join('tools', 'banc_seance_historique.js')
FICHIERS = ('constants.js', 'log.js', 'index.html', 'style.css', 'coach.js', 'app.js', 'setup.js')
LO, SJ = 'log.js', 'setup.js'

# ⚠️ ANCRES MISES A JOUR LE 16/11/2026 (lot 1 « contre-expertise », D-163 TOUS les programmes) : le chargeur n'a plus de branche « programme d'avant » (`jour` est toujours une liste), `_prevDuJour` lit l'IDENTITE de l'exercice, les series se rapprochent par identite.
# Chaque mutation garde son INVARIANT d'origine, reecrit sur le nouveau code.
FILTRE = "  return _seancesTrain().filter(s=>s&&s.progId&&s.progId===prog.id&&(!day||(s.progDayId?(!!day.id&&s.progDayId===day.id):(unique&&s.progLabel===label)))).sort(_cmpSeances);\n}"
PREV = "    const h=_prevDuJour(jour||[],e,exs), prev=h.sets, ts=h.ts;"
ED = "      const ppKg=pp&&!(ed.kg>ts)?pp:null, ppReps=pp&&!(ed.reps>ts)?pp:null;"

MUT = [
    # ── « un NOM d'exercice decide » ──
    ('M01 un NOM d\'exercice decide : la reprise du jour ne vaut que pour les exercices dont le nom est connu (squat, curl, traction) ; les autres (personnalise, fictif inedit) reprennent l\'historique de partout',
     [(LO, PREV, "    const h=(/Squat|Curl|Traction/.test(e.name)?_prevDuJour(jour||[],e,exs):{sets:(_prevSeance(e.name)||{sets:[]}).sets,ts:0}), prev=h.sets, ts=h.ts;")], 'GARDE'),
    # ── « l'historique d'un AUTRE jour est repris » ──
    ('M02 « deja fait » se decide sur le PROGRAMME seul : les seances d\'un AUTRE jour du meme programme servent de repere (le jour leger reprend le jour lourd)',
     [(LO, FILTRE, "  return _seancesTrain().filter(s=>s&&s.progId&&s.progId===prog.id).sort(_cmpSeances);\n}")], 'GARDE'),
    ('M03 l\'identite d\'un jour n\'est que son LIBELLE (l\'identifiant n\'est plus lu) : deux jours homonymes se confondent, un jour renomme ou deplace perd sa seance',
     [(LO, "(!day||(s.progDayId?(!!day.id&&s.progDayId===day.id):(unique&&s.progLabel===label)))", "s.progLabel===label")], 'GARDE'),
    ('M04 « deja fait » se decide sur le LIBELLE d\'un AUTRE programme : une seance d\'un autre programme (meme libelle de jour) rend le jour « suivi »',
     [(LO, "s&&s.progId&&s.progId===prog.id&&(!day||(s.progDayId?", "s&&(!day||(s.progDayId?")], 'GARDE'),
    # ── « une valeur modifiee a la main est ecrasee par l'historique » ──
    ('M05 une valeur modifiee a la main est ECRASEE par l\'historique (la retouche n\'est plus lue : la derniere seance reprend toujours la main)',
     [(LO, ED, "      const ppKg=pp, ppReps=pp;")], 'GARDE'),
    ('M06 la retouche l\'emporte sur la SERIE ENTIERE : modifier la charge d\'une serie renvoie aussi ses repetitions a la prescription (les autres champs ne gardent plus leur progression)',
     [(LO, ED, "      const ppKg=pp&&!(ed.kg>ts||ed.reps>ts)?pp:null, ppReps=pp&&!(ed.kg>ts||ed.reps>ts)?pp:null;")], 'GARDE'),
    ('M07 la retouche l\'emporte POUR TOUJOURS : une seance terminee APRES la retouche ne reprend plus la main',
     [(LO, ED, "      const ppKg=pp&&!(ed.kg>0)?pp:null, ppReps=pp&&!(ed.reps>0)?pp:null;")], 'GARDE'),
    ('M08 l\'editeur ne pose plus l\'instant d\'une retouche de CHARGE (la retouche est ecrasee, sans trace)',
     [(LO, "  if(n!==s.kg)_marquerEdition(s,'kg');                           // D-168 : la valeur CHANGE → retouche volontaire\n", "")], 'GARDE'),
    ('M09 l\'editeur ne pose plus l\'instant d\'une retouche de REPETITIONS',
     [(LO, "  if(v!==ex.sets[si].reps)_marquerEdition(ex.sets[si],'reps');   // D-168 : la valeur CHANGE → retouche volontaire\n", "")], 'GARDE'),
    ('M10 retaper la MEME charge pose un instant de retouche (toute frappe compte, meme sans changement)',
     [(LO, "  if(n!==s.kg)_marquerEdition(s,'kg');", "  _marquerEdition(s,'kg');")], 'GARDE'),
    ('M11 l\'instant de retouche fuit dans la seance chargee (et donc dans la seance enregistree)',
     [(LO, "        maxi:!!s.maxi,\n        type:s.type||'N',done:false,rm1:0,rest:_secRepos(ppRest?ppRest.rest:s.rest),", "        maxi:!!s.maxi,...(s.ed?{ed:s.ed}:{}),\n        type:s.type||'N',done:false,rm1:0,rest:_secRepos(ppRest?ppRest.rest:s.rest),")], 'GARDE'),
    ('M12 la retouche ne passe plus devant la seance pour un programme NON marque « prescrit » (le drapeau redevient une condition du chargeur : ni reprise, ni retouche) — SURVIT ICI A DESSEIN : ce banc ne rejoue que des programmes « prescrits » ; la protection vit dans le banc B-SCCH (mut_seance_ce_h M04)',
     [(LO, "  const _jour=_seancesDuJour(prog,_lbl,day);", "  const _jour=prog.prescrit?_seancesDuJour(prog,_lbl,day):null;")], 'OK'),
    ('M13 l\'instant d\'une seance ignore `ts` (lu depuis la seule DATE : minuit) — une retouche du jour passerait toujours devant la seance faite apres elle',
     [(LO, "function _tsSeance(s){ return +(s&&(s.ts||s.id))||Date.parse(s&&s.date)||0; }", "function _tsSeance(s){ return Date.parse(s&&s.date)||0; }")], 'GARDE'),
    # ── l'identite stable d'un jour ──
    ('M14 l\'identite d\'un jour n\'est plus posee au chargement',
     [(LO, "  _assurerIdentites(prog,day);  ", "  ")], 'GARDE'),
    ('M15 le chargement ajoute `prescrit:true` aux programmes d\'AVANT (migration silencieuse du drapeau : les identites se posent, le drapeau jamais)',
     [(LO, "  if(!prog.id)prog.id=_idStable('p');", "  prog.prescrit=true; if(!prog.id)prog.id=_idStable('p');")], 'GARDE'),
    ('M16 la seance chargee ne porte plus l\'identite du jour',
     [(LO, "progId:prog.id,progDayId:day.id,exs:_exsDeProgramme(day.exs,_jour,10)", "progId:prog.id,exs:_exsDeProgramme(day.exs,_jour,10)")], 'GARDE'),
    ('M17 la seance ENREGISTREE ne porte plus l\'identite du jour (`progDayId`)',
     [(LO, ",...(S.wkt.progDayId?{progDayId:S.wkt.progDayId}:{})};   // IMPORT PDF 15/11", "};   // IMPORT PDF 15/11")], 'GARDE'),
    ('M18 le repli par libelle (seances d\'avant l\'identifiant) est retire',
     [(LO, "(!day||(s.progDayId?(!!day.id&&s.progDayId===day.id):(unique&&s.progLabel===label)))", "(!day||(s.progDayId?(!!day.id&&s.progDayId===day.id):false))")], 'GARDE'),
    ('M19 le repli par libelle perd sa prudence : deux jours homonymes se partagent une seance sans identifiant',
     [(LO, "(unique&&s.progLabel===label)", "(s.progLabel===label)")], 'GARDE'),
    ('M20 un exercice liste DEUX fois dans un jour reprend toujours le 1er bloc de la seance precedente (l\'identite du bloc n\'est plus lue : le nom seul decide, le 1er bloc sert aux deux)',
     [(LO, "    if(ident.length===1)ex=ident[0];", "    if(false)ex=ident[0];\n    else if(!ident.length&&!liste.some(x=>x.exId)||true){ ex=liste.filter(x=>x.name===nom)[0]||null; }")], 'GARDE'),
    ('M21 la regle D-163 n\'est plus lue : le 1er usage reprend l\'historique de l\'exercice de PARTOUT (le defaut du 15/11, sondes H02/H03)',
     [(LO, PREV, "    const h=(()=>{const v=_prevSeance(e.name);return {sets:v?v.sets:[],ts:v?_tsSeance(v.sess):0};})(), prev=h.sets, ts=h.ts;")], 'GARDE'),
    ('M22 un jour deja fait ne reprend plus sa derniere seance',
     [(LO, PREV, "    const h={sets:[],ts:0}, prev=h.sets, ts=h.ts;")], 'GARDE'),
    # ── les programmes manuels, a un seul jour ──
    ('M23 un programme a UN SEUL jour ne suit plus la regle (il reprend l\'historique de partout)',
     [(LO, "exs:_exsDeProgramme(prog.exs,_seancesDuJour(prog,prog.name,null),5)", "exs:_exsDeProgramme(prog.exs,null,5)")], 'GARDE'),
    ('M24 un programme a UN SEUL jour ne porte plus son `progId` : jamais « deja fait »',
     [(LO, "    progId:prog.id,\n    exs:_exsDeProgramme(prog.exs,", "    exs:_exsDeProgramme(prog.exs,")], 'GARDE'),
    ('M25 « Sauvegarder comme programme » ne pose plus `prescrit`',
     [(LO, "id:'p'+Date.now(),name,prescrit:true,   // D-163 : idem", "id:'p'+Date.now(),name,   // D-163 : idem")], 'GARDE'),
    ('M26 un programme CREE dans l\'editeur ne pose plus `prescrit`',
     [(LO, "_editProgData={id:'p'+Date.now(), name:'', prescrit:true, exs:[]};", "_editProgData={id:'p'+Date.now(), name:'', exs:[]};")], 'GARDE'),
    # ── les nouvelles donnees voyagent ──
    ('M27 la synchronisation n\'envoie plus `progDayId` des seances (un champ qu\'un copieur ne recopie pas est un champ supprime)',
     [(SJ, "sessions:S.histTronque?undefined:(S.sessions||[]).slice(0,2000), // ~8-10 ans de séances", "sessions:S.histTronque?undefined:(S.sessions||[]).slice(0,2000).map(function(s){var o=Object.assign({},s);delete o.progDayId;return o;}), // ~8-10 ans de séances")], 'GARDE'),
    ('M28 la synchronisation n\'envoie plus l\'instant des retouches (`ed`) des programmes',
     [(SJ, "programmes:S.programmes||[],", "programmes:JSON.parse(JSON.stringify(S.programmes||[],function(k,v){return k==='ed'?undefined:v;})),")], 'GARDE'),
    ('M29 la restauration perd l\'instant des retouches des programmes',
     [(SJ, "{S.programmes=raw.programmes;console.log('[FT restore] programmes:',raw.programmes.length);}", "{S.programmes=JSON.parse(JSON.stringify(raw.programmes,function(k,v){return k==='ed'?undefined:v;}));console.log('[FT restore] programmes:',raw.programmes.length);}")], 'GARDE'),
    # ── l'editeur par serie (D-171) ──
    ('M30 « monter une serie » ne l\'echange plus avec la precedente (elle ecrase sa voisine)',
     [(LO, "  const t=ex.sets[si-1]; ex.sets[si-1]=ex.sets[si]; ex.sets[si]=t;", "  ex.sets[si-1]=ex.sets[si];")], 'GARDE'),
    ('M31 la serie deplacee perd son instant de retouche (elle est recopiee champ par champ)',
     [(LO, "  const t=ex.sets[si-1]; ex.sets[si-1]=ex.sets[si]; ex.sets[si]=t;", "  const t=ex.sets[si-1]; const u=ex.sets[si]; ex.sets[si-1]={kg:u.kg,reps:u.reps,type:u.type,rest:u.rest}; ex.sets[si]=t;")], 'GARDE'),
    ('M32 le numero de la 1ere serie devient aussi un bouton (la 1ere serie « monte » hors de la liste)',
     [(LO, "      ${si>0?`<button type=\"button\" data-ch=\"num\"", "      ${si>=0?`<button type=\"button\" data-ch=\"num\"")], 'GARDE'),
    # ── D-165 · D-167 ──
    ('M33 l\'import s\'ouvre sur « Remplacer » (un choix destructeur precoche)',
     [(LO, "  _impPhotos=[];_impExtracted=null;_impMode='new';", "  _impPhotos=[];_impExtracted=null;_impMode='replace';")], 'GARDE'),
    ('M34 « Regrouper » ne decale plus les numeros des series « en couleur » (ils gardent les rangs de la ligne d\'origine)',
     [(LO, "  ex.note=String(ex.note||'').replace(/(Séries en couleur dans le document : n° )([\\d, ]+)/,(m,a,b)=>a+b.split(',').map(k=>(parseInt(k)||0)+_dec).join(', '));\n", "")], 'GARDE'),
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
    tmp = tempfile.mkdtemp(prefix='mut_schis_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'clone', 'exercises', 'anatomy', 'muscles'))
    # le banc lit les images du catalogue : on les lie (lecture seule) plutot que de les copier
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
