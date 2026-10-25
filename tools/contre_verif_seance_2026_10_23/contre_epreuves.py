#!/usr/bin/env python3
"""Contre-épreuves de la contre-vérification (versionnées avec docs/CONTRE-VERIF-AUDIT-SEANCE-2026-10-23.md, jamais lancées par la passe) : pour chaque défaut confirmé, une COPIE de master où seule la
ligne suspecte est corrigée ; le scénario du harnais doit alors basculer. Une copie par défaut, remplacements bornés
(chacun doit exister exactement une fois). Usage : python3 contre_epreuves.py <master> <dossier_copies>"""
import os, shutil, sys, subprocess, json
MASTER, OUT = sys.argv[1], sys.argv[2]
PATCHS = {
    'F01': [('screens.js', """  (s.exs||[]).forEach(ex=>{(ex.sets||[]).forEach(st=>{
    if(!st.done||!st.kg||!st.reps||st.type==='É'||st.type==='W')return;
    v+=st.kg*st.reps;
  });});
  return v;""", """  return _workVol(s);   // CONTRE-ÉPREUVE : la règle canonique (convention unilatérale)""")],
    'F02': [('setup.js', """  _sessEdits.volume=Math.round(vol);""", """  _sessEdits.volume=Math.round(_workVol(_sessEdits));   // CONTRE-ÉPREUVE""")],
    'F03': [('log.js', """        const n=(ex.sets||[]).filter(st=>st&&st.done&&st.type!=='É').length;""",
                       """        const n=(ex.sets||[]).filter(st=>st&&st.done&&st.type!=='É'&&st.type!=='W').length;   // CONTRE-ÉPREUVE""")],
    'F05': [('log.js', """    const _nm=_naz(ex.name);
    for(const r of _MEX){""", """    const _nm=_naz(ex.name);
    { const cex0=(S.customExercises||[]).find(e=>e.n===ex.name);   // CONTRE-ÉPREUVE : le choix de la personne avant les règles
      if(cex0&&cex0.muscles&&((cex0.muscles.p||[]).length||(cex0.muscles.s||[]).length)){
        (cex0.muscles.p||[]).forEach(m=>{sc[m]=(sc[m]||0)+2;}); (cex0.muscles.s||[]).forEach(m=>{sc[m]=(sc[m]||0)+1;}); return; } }
    for(const r of _MEX){""")],
    'F06': [('screens.js', """  const todaySess=S.sessions.find(s=>s.date===todayStr);
  const sessCals=todaySess&&todaySess.calories?todaySess.calories:0;""",
             """  const sessCals=S.sessions.filter(s=>s.date===todayStr).reduce((a,s)=>a+(s.calories||0),0);   // CONTRE-ÉPREUVE""")],
    'F07': [('screens.js', """  const key=s.date+'|'+(s.exs||[]).map(e=>(e&&e.name)||'').join('~');""",
             """  const key=s.date+'|'+(s.exs||[]).map(e=>((e&&e.name)||'')+':'+((e&&e.sets)||[]).map(x=>x&&x.done?1:0).join('')).join('~');   // CONTRE-ÉPREUVE""")],
}
res = {}
for f, reps in PATCHS.items():
    d = os.path.join(OUT, 'patch_' + f)
    if os.path.exists(d): shutil.rmtree(d)
    shutil.copytree(MASTER, d)
    for fic, old, new in reps:
        p = os.path.join(d, fic); s = open(p, encoding='utf-8').read()
        n = s.count(old)
        if n != 1: sys.exit('%s : ancre trouvée %d fois dans %s' % (f, n, fic))
        open(p, 'w', encoding='utf-8').write(s.replace(old, new))
        chk = subprocess.run(['node', '--check', p], capture_output=True, text=True)
        if chk.returncode: sys.exit('%s : syntaxe cassée dans %s' % (f, fic))
    out = subprocess.run(['node', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'harnais.js'), d, f], capture_output=True, text=True, timeout=600).stdout
    for l in out.splitlines():
        try: o = json.loads(l); res[f] = o
        except Exception: pass
    print(f, json.dumps(res.get(f, {}).get('res'), ensure_ascii=False)[:700], '· erreurs', res.get(f, {}).get('errs'))
json.dump(res, open(os.path.join(OUT, 'contre_epreuves.json'), 'w'), ensure_ascii=False, indent=1)
