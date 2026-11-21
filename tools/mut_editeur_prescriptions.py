#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — EDITEUR DE PROGRAMME, lot C de la mission « import PDF » (15/11/2026) : les temoins B-EDP savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Chaque mutation REMET UN DEFAUT que le lot a supprime (ou retire une protection qu'il a ajoutee) ; le banc `tools/banc_editeur_prescriptions.js`
doit alors rougir AU MOINS UNE fois. Une mutation qui laisse le banc vert = un temoin qui ne protege rien (R17, « un test qui ne peut pas
rougir rassure sans rien mesurer »). Point de depart : 0 rouge sur l'arbre sain, mesure d'abord.
Usage : python3 tools/mut_editeur_prescriptions.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges · MUT_SEUL=M07 : une mutation)
A lancer sous le garde reseau : tools/sous_garde.sh python3 tools/mut_editeur_prescriptions.py
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FICHIERS = ('log.js', 'style.css', 'index.html', 'constants.js', 'state.js')
LO, CS = 'log.js', 'style.css'

# Le point d'ancrage de la fin de _renderProgEdit (la mesure de la hauteur des commentaires, refaite au rendu)
FIN_RENDU = "  _ajusterNotesProg();\n}\n// VM sur un programme DÉJÀ enregistré"
# Les trois lignes qui disent QUELS types la touche parcourt
LISTE = "  return drop?SET_TYPES.concat(['D']):SET_TYPES.slice();"
TYPE_ECRIT = "  s.type=t;\n  toast(t==='D'"
KG_FIN = "  s.kg=n;\n  if(n>0){ delete s.vide; delete s.pdc; }"

MUT = [
    # ── la HAUTEUR DES COMMENTAIRES : le défaut mesuré (24 px au lieu de 294, la mesure faite fenêtre fermée) ──
    ('M01 la hauteur des commentaires n\'est plus refaite à l\'OUVERTURE de la fenêtre : mesurée fermée, donc cachée (le défaut d\'origine)',
     [(LO, "  document.getElementById('ov-prog-edit').classList.add('open');\n  _ajusterNotesProg();\n}", "  document.getElementById('ov-prog-edit').classList.add('open');\n}")], 'GARDE'),
    ('M02 la hauteur des commentaires n\'est plus refaite au RENDU : un re-dessin fenêtre ouverte les recoupe',
     [(LO, FIN_RENDU, "}\n// VM sur un programme DÉJÀ enregistré")], 'GARDE'),
    ('M03 le retour du sélecteur d\'exercices rouvre la fenêtre SANS refaire la mesure (le 3ᵉ chemin d\'ouverture est oublié)',
     [(LO, "  _renderProgEdit();\n  _ouvrirProgEdit();\n  toast(name+' ajouté !','info');", "  _renderProgEdit();\n  document.getElementById('ov-prog-edit').classList.add('open');\n  toast(name+' ajouté !','info');")], 'GARDE'),
    ('M04 « Modifier un programme » rouvre la fenêtre sans refaire la mesure',
     [(LO, "  _editProgData=JSON.parse(JSON.stringify(prog));\n  _renderProgEdit();\n  _ouvrirProgEdit();", "  _editProgData=JSON.parse(JSON.stringify(prog));\n  _renderProgEdit();\n  document.getElementById('ov-prog-edit').classList.add('open');")], 'GARDE'),
    # ── la TRONCATURE : « les commentaires doivent être entièrement consultables et éditables sans troncature » ──
    ('M05 le plafond de 300 caractères REVIENT (un commentaire tapé de 450 est coupé en silence — le défaut d\'origine)',
     [(LO, "  const cap=Math.max(_NOTE_PROG_MAX,String(o.note||'').length);", "  const cap=String(o.note||'').length>300?2000:300;")], 'GARDE'),
    ('M06 un texte déjà plus long que le plafond de sûreté est coupé à la retouche (le garde « jamais coupé » est retiré)',
     [(LO, "  const cap=Math.max(_NOTE_PROG_MAX,String(o.note||'').length);", "  const cap=_NOTE_PROG_MAX;")], 'GARDE'),
    ('M07 le plafond de sûreté disparaît : un collage de 4 500 caractères est gardé tel quel (aucune borne)',
     [(LO, "  if(v.length>cap){", "  if(false&&v.length>cap){")], 'GARDE'),
    ('M08 le plafond de sûreté coupe en SILENCE : plus de message',
     [(LO, "    toast('Commentaire limité à '+_NOTE_PROG_MAX+' caractères','info');\n", "")], 'GARDE'),
    ('M09 le plafond coupe mais l\'ÉCRAN garde le texte entier (le champ n\'est plus remis à ce qui est gardé)',
     [(LO, "    if(ta&&ta.value!==o.note)ta.value=o.note;", "")], 'GARDE'),
    ('M10 un commentaire d\'espaces seuls est gardé tel quel (le `trim` est retiré)',
     [(LO, "  const v=(val||'').trim();\n  /* ⛔⛔ AUCUNE TRONCATURE", "  const v=(val||'');\n  /* ⛔⛔ AUCUNE TRONCATURE")], 'GARDE'),
    ('M11 un effacement ne retire plus le commentaire du programme (la note vide reste)',
     [(LO, "  if(v)o.note=v;else delete o.note;\n}", "  o.note=v;\n}")], 'GARDE'),
    # ── le TYPE de série ──
    ('M12 la touche « type » ne parcourt que N ↔ É (« X » n\'est plus atteint)',
     [(LO, "  const liste=_typesProgEx(ex), s=ex.sets[si];", "  const liste=['N','É'], s=ex.sets[si];")], 'GARDE'),
    ('M13 le cycle recopie sa liste au lieu de lire la table de la séance (`SET_TYPES` figée dans l\'éditeur : R2 violée)',
     [(LO, LISTE, "  return drop?['N','É','X','D']:['N','É','X'];")], 'GARDE'),
    ('M14 « D » ne rejoint plus le cycle d\'un dropset : un palier touché devient « N » et ne revient JAMAIS à « D » (le piège redouté)',
     [(LO, LISTE, "  return SET_TYPES.slice();")], 'GARDE'),
    ('M15 « D » est proposé partout : un exercice qui n\'est pas un dropset se voit offrir un palier de dropset',
     [(LO, LISTE, "  return SET_TYPES.concat(['D']);")], 'GARDE'),
    ('M16 changer un type DÉFAIT l\'enchaînement du dropset (`dropChaine` supprimé)',
     [(LO, TYPE_ECRIT, "  s.type=t; delete ex.dropChaine;\n  toast(t==='D'")], 'GARDE'),
    ('M17 changer un type DÉLIE le superset (`group` et `groupType` supprimés)',
     [(LO, TYPE_ECRIT, "  s.type=t; delete ex.group; delete ex.groupType;\n  toast(t==='D'")], 'GARDE'),
    ('M18 changer un type RECONSTRUIT la série (consigne écrite et champs d\'une version future perdus : R4)',
     [(LO, TYPE_ECRIT, "  ex.sets[si]={kg:s.kg,reps:s.reps,type:t,rest:s.rest};\n  toast(t==='D'")], 'GARDE'),
    ('M19 le type touché n\'est pas ÉCRIT dans la série (la copie d\'édition ne bouge pas)',
     [(LO, TYPE_ECRIT, "  toast(t==='D'")], 'GARDE'),
    ('M20 une série SANS type s\'affiche « N » mais sa 1ʳᵉ touche la laisse sur « N » (le type absent n\'est plus lu comme « N »)',
     [(LO, "const cur=liste.indexOf(s.type||'N');", "const cur=liste.indexOf(s.type);")], 'GARDE'),
    ('M21 un type inconnu passé au setter est accepté sans contrôle',
     [(LO, "  else if(liste.indexOf(t)===-1){ toast('Type de série inconnu','error'); return false; }\n", "")], 'GARDE'),
    # ── la CHARGE ──
    ('M22 la charge se lit avec `parseFloat` : « 92,5 » devient 92, la moitié du poids (le défaut de ft-v1057)',
     [(LO, "  const n=numFR(txt);", "  const n=parseFloat(txt);")], 'GARDE'),
    ('M23 « 12abc » est lu 12 : la lecture indulgente corrige une saisie en silence (le garde « un nombre, et lui seul » est retiré)',
     [(LO, "  if(!/^(?:\\d+[.,]?\\d*|[.,]\\d+)$/.test(txt)||!(n===0||_serieValide(n,1))){", "  if(!(n===0||_serieValide(n,1))){")], 'GARDE'),
    ('M24 la borne physique d\'une charge disparaît (600 kg acceptés)',
     [(LO, "||!(n===0||_serieValide(n,1))){", "||!(n===0||n>0)){")], 'GARDE'),
    ('M25 une charge invalide est refusée en SILENCE (plus de message)',
     [(LO, "    toast('Charge invalide : un nombre de 0 à 500 kg','error');\n", "")], 'GARDE'),
    ('M26 le champ ne redit plus la valeur enregistrée après un refus (il garde à l\'écran le texte refusé)',
     [(LO, "    if(el)el.value=s.kg>0?String(s.kg):'';                      // l'écran redit ce qui est ENREGISTRÉ\n", "")], 'GARDE'),
    ('M27 une charge invalide est CORRIGÉE en silence (le signe est retiré : « -5 » devient 5)',
     [(LO, "txt=String(val==null?'':val).replace(/\\s/g,'');", "txt=String(val==null?'':val).replace(/\\s/g,'').replace(/^-/,'');")], 'GARDE'),
    ('M28 la charge est ARRONDIE à l\'entier en silence (92,5 devient 93)',
     [(LO, KG_FIN, "  s.kg=Math.round(n);\n  if(n>0){ delete s.vide; delete s.pdc; }")], 'GARDE'),
    ('M29 un champ vidé n\'est plus « non renseigné » : la charge garde son ancienne valeur',
     [(LO, "if(s.kg!==null)_marquerEdition(s,'kg'); s.kg=null; if(el)el.value=''; return true; }", "if(el)el.value=''; return true; }")], 'GARDE'),
    # ── « À VIDE » ──
    ('M30 saisir une charge n\'efface plus « à vide » : la série reste « à vide » ET chargée',
     [(LO, KG_FIN, "  s.kg=n;\n  if(n>0){ delete s.pdc; }")], 'GARDE'),
    ('M31 l\'écran ne suit pas la saisie d\'une charge dans une série « à vide » : bascule et indice restent « à vide »',
     [(LO, "  if(el){ el.value=n>0?String(n):''; _syncVideProg(el,s); }", "  if(el){ el.value=n>0?String(n):''; }")], 'GARDE'),
    ('M32 la bascule « vide » remise écrit `vide:false` au lieu de supprimer la clé (un programme touché puis remis n\'est plus identique)',
     [(LO, "  if(s.vide){ delete s.vide; s.kg=null; }", "  if(s.vide){ s.vide=false; s.kg=null; }")], 'GARDE'),
    ('M33 « à vide » sur une série qui a une CHARGE l\'EFFACE (le 77,5 kg part d\'un faux appui à côté du champ)',
     [(LO, "    if(s.kg>0){ toast('Efface d\\'abord la charge pour la mettre « à vide »','info'); return false; }\n", "")], 'GARDE'),
    ('M34 la bascule « vide » n\'écrit pas la charge à 0 : une série ancienne sans `kg` devient `{vide:true}` seul',
     [(LO, "    s.kg=0; s.vide=true;\n", "    s.vide=true;\n")], 'GARDE'),
    ('M35 le « à vide » n\'est plus dit à l\'écran (l\'indice reste « kg »)',
     [(LO, "(s.vide?'à vide':'kg')", "('kg')")], 'GARDE'),
    ('M36 la bascule « vide » ne se montre plus enfoncée',
     [(LO, """aria-pressed="${s.vide?'true':'false'}" onclick="_toggleProgSetVide""", """aria-pressed="false" onclick="_toggleProgSetVide""")], 'GARDE'),
    ('M37 « + série » copie « à vide » : la nouvelle série hérite d\'une barre à vide',
     [(LO, "  ex.sets.push({kg:l?(l.kg===null?null:(l.kg||0)):null,", "  ex.sets.push({...(l&&l.vide?{vide:true}:{}),kg:l?(l.kg===null?null:(l.kg||0)):null,")], 'GARDE'),
    # ── le RENDU : les champs, et ce qu'il ne doit JAMAIS écrire ──
    ('M38 le champ TYPE n\'est plus dans la ligne',
     [(LO, 'data-ch="type" class="tbtn pe-ty', 'data-ch="typeX" class="tbtn pe-ty')], 'GARDE'),
    ('M39 le champ CHARGE n\'est plus dans la ligne',
     [(LO, '<input data-ch="kg" class="pe-in"', '<input data-ch="kgX" class="pe-in"')], 'GARDE'),
    ('M40 le champ REPOS n\'est plus dans la ligne',
     [(LO, '<input data-ch="rest" class="pe-in"', '<input data-ch="restX" class="pe-in"')], 'GARDE'),
    ('M41 le bouton « max » existant n\'est plus affiché',
     [(LO, "      ${_nbMaxi?`<button type=\"button\" data-ch=\"max\"", "      ${false?`<button type=\"button\" data-ch=\"max\"")], 'GARDE'),
    ('M42 la consigne de repos écrite n\'est plus montrée sous les séries',
     [(LO, "    </div>${_hintReposEcrit(sets,si)}${_noteOuverte?", "    </div>${_noteOuverte?")], 'GARDE'),
    ('M43 le rendu ÉCRIT un type « N » dans une série qui n\'en avait pas : un ancien programme apprend un champ en s\'ouvrant',
     [(LO, "      const ty=String(s.type||'N'), tl=", "      if(!s.type)s.type='N'; const ty=String(s.type||'N'), tl=")], 'GARDE'),
    ('M44 le rendu ÉCRIT `vide:false` sur toute série : un champ nouveau partout, rien d\'identique',
     [(LO, "      const ty=String(s.type||'N'), tl=", "      if(s.vide===undefined)s.vide=false; const ty=String(s.type||'N'), tl=")], 'GARDE'),
    ('M45 une consigne de repos avec des guillemets casse de nouveau l\'attribut : seuls & < > sont échappés (un `onfocus` passe)',
     [(LO, "const _aq=x=>_escNote(String(x==null?'':x)).replace(/\"/g,'&quot;');", "const _aq=x=>_escNote(String(x==null?'':x));")], 'GARDE'),
    ('M46 le défilement de l\'éditeur saute en haut à chaque re-dessin (une touche de type renvoie en haut de la liste)',
     [(LO, "  // Un commentaire existant peut faire plusieurs lignes : ajuste la hauteur des champs 💬 au rendu", "  el.scrollTop=0;\n  // Un commentaire existant peut faire plusieurs lignes : ajuste la hauteur des champs 💬 au rendu")], 'GARDE'),
    # ── PRÉSERVER : ce que l'éditeur ne touche pas ──
    ('M47 « Enregistrer » ne garde que les champs connus (copie par liste : `prescrit` et les champs d\'une version future sont perdus — R4)',
     [(LO, "  S.programmes[_editProgIdx]=_editProgData;\n  persist();\n  closeProgEdit();", "  S.programmes[_editProgIdx]={id:_editProgData.id,name:_editProgData.name,weeks:_editProgData.weeks,startDate:_editProgData.startDate,days:_editProgData.days,exs:_editProgData.exs};\n  persist();\n  closeProgEdit();")], 'GARDE'),
    ('M48 l\'ouverture de l\'éditeur perd le marquage `dropChaine` des exercices (la copie d\'édition ne recopie pas tout)',
     [(LO, "  _editProgData=JSON.parse(JSON.stringify(prog));\n  _renderProgEdit();\n  _ouvrirProgEdit();", "  _editProgData=JSON.parse(JSON.stringify(prog));\n  _editProgData.days&&_editProgData.days.forEach(d=>(d.exs||[]).forEach(e=>{delete e.dropChaine;}));\n  _renderProgEdit();\n  _ouvrirProgEdit();")], 'GARDE'),
    # ── ce que l'écran doit tenir sur iPhone (style.css) ──
    ('M49 les champs redeviennent trop bas pour le pouce (26 px)',
     [(CS, ".pe-in{width:100%;min-width:0;height:34px;", ".pe-in{width:100%;min-width:0;height:26px;")], 'GARDE'),
    ('M50 les boutons « vide » et « max » redeviennent trop bas (26 px)',
     [(CS, ".pe-tg{height:34px;", ".pe-tg{height:26px;")], 'GARDE'),
    ('M51 la pastille du type redevient trop basse (26 px)',
     [(CS, ".pe-ty{height:34px;", ".pe-ty{height:26px;")], 'GARDE'),
    ('M52 les champs repassent à 13 px (l\'iPhone zoome la page à la mise au point d\'un champ)',
     [(CS, "padding:0 3px;font-size:16px;font-weight:700;text-align:center;border:1px solid var(--sep);border-radius:8px;background:var(--bg2);", "padding:0 3px;font-size:13px;font-weight:700;text-align:center;border:1px solid var(--sep);border-radius:8px;background:var(--bg2);")], 'GARDE'),
    ('M53 la colonne de la charge exige 150 px : la ligne déborde à droite (défilement horizontal)',
     [(CS, "grid-template-columns:30px 34px minmax(52px,1fr) 30px 46px 34px minmax(58px,.8fr) 24px;column-gap:3px;", "grid-template-columns:30px 34px minmax(150px,1fr) 30px 46px 34px minmax(58px,.8fr) 24px;column-gap:3px;")], 'GARDE'),
    ('M54 l\'en-tête « Charge » ne couvre plus ses deux colonnes : les titres glissent d\'une colonne',
     [(CS, ".pe-hdr .pe-h2{grid-column:span 2;}\n", "")], 'GARDE'),
    ('M55 la ligne devient trop haute (14 px de marge : l\'écran est alourdi)',
     [(CS, ".pe-row{padding:2px 0;}", ".pe-row{padding:14px 0;}")], 'GARDE'),
    ('M56 RÈGLE D\'OR n°9 : le bouton central « + » Séance bouge de 3 px quand l\'éditeur est ouvert (une règle ajoutée au style le touche)',
     [(CS, ".pe-x{height:34px;width:100%;padding:0;border:none;background:none;color:var(--t3);font-size:18px;line-height:1;cursor:pointer;}", ".pe-x{height:34px;width:100%;padding:0;border:none;background:none;color:var(--t3);font-size:18px;line-height:1;cursor:pointer;}\n#root:has(#ov-prog-edit.open) #nb-log{transform:translateY(3px);}")], 'GARDE'),
    ('M57 la pastille du type ne reçoit plus le doigt (`pointer-events:none`)',
     [(CS, ".pe-ty{height:34px;", ".pe-ty{pointer-events:none;height:34px;")], 'GARDE'),
    ('M59 les flèches des champs numériques reviennent : elles mangent la place du repos, « 240 » se lit « 2… » à 375 px (défaut mesuré en capturant 375 px)',
     [(CS, ".pe-in[type=number]{-moz-appearance:textfield;appearance:textfield;}\n.pe-in[type=number]::-webkit-inner-spin-button,.pe-in[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}\n", "")], 'GARDE'),
    ('M58 la ligne de série devient plus large que l\'écran en mode téléphone (colonne de repos de 200 px)',
     [(CS, "minmax(58px,.8fr) 24px;column-gap:3px;align-items:center;}", "minmax(200px,.8fr) 24px;column-gap:3px;align-items:center;}")], 'GARDE'),
    ('M60 le texte des champs n\'a plus la place : 22 px de marge de chaque côté (« 240 » tronqué dans son champ, mesuré)',
     [(CS, ".pe-in{width:100%;min-width:0;height:34px;padding:0 3px;", ".pe-in{width:100%;min-width:0;height:34px;padding:0 22px;")], 'GARDE'),
    ('M61 la variante sans colonne « max » garde la grille à 8 colonnes : les champs glissent d\'une colonne, l\'en-tête ne les suit plus',
     [(CS, ".pe-hdr.pe-nomax,.pe-row.pe-nomax{grid-template-columns:30px 34px minmax(52px,1fr) 30px 46px minmax(58px,.8fr) 24px;}", ".pe-hdr.pe-nomax,.pe-row.pe-nomax{grid-template-columns:30px 34px minmax(52px,1fr) 30px 46px 34px minmax(58px,.8fr) 24px;}")], 'GARDE'),
]

BANC = os.path.join('tools', 'banc_editeur_prescriptions.js')


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
    tmp = tempfile.mkdtemp(prefix='mut_edp_')
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
        srcs = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
        invalide = []
        for f, av, ap in remplacements:
            if srcs[f].count(av) != 1:
                invalide.append('%s:%s (x%d)' % (f, av[:60], srcs[f].count(av)))
            else:
                srcs[f] = srcs[f].replace(av, ap, 1)
        if invalide:
            print('  INVALIDE  %s (ancre absente ou multiple : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
        for f in FICHIERS:
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
