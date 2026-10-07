#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — LOT 1 IMPORT PROGRAMME (session-B, 07/10/2026) : les temoins B-L1 savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord. M00 = le CODE D'AVANT (6969ce73) avec les temoins
d'aujourd'hui. Chaque mutation retire UNE garantie ; deux sont deguisees (le code a l'air raisonnable).
Usage : python3 tools/mut_import_prog_lot1.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FICHIERS = ('log.js', 'state.js', 'index.html', 'screens.js')
LO, ST = 'log.js', 'state.js'
BASE = '6969ce73'

MUT = [
    ('M00 le code d\'avant (6969ce73) avec les temoins d\'aujourd\'hui', 'AVANT', 'GARDE'),
    ('M01 « Sauvegarder comme programme » ecrase de nouveau par le NOM',
     [(LO, "  if(_progMemeNom(name).length){ _ouvrirProgCible(name, contenu); return; }",
           "  { const _i=S.programmes.findIndex(p=>String(p.name||'').toLowerCase()===name.toLowerCase()); if(_i>=0){ S.programmes[_i]=_progNouveau(contenu,'session','session',null); persist(); renderProgModal(); return; } }")], 'GARDE'),
    ('M02 un programme a jours redevient une cible proposee pour une seance a plat',
     [(LO, "  memes.forEach(p=>{\n    if(p.days&&p.days.length){", "  memes.forEach(p=>{\n    if(false){")], 'GARDE'),
    ('M03 suppression en un seul tap (plus de question)',
     [(LO, "  showConfirm('Supprimer ce programme ?',", "  _progSupprimer(id); if(false)showConfirm('Supprimer ce programme ?',")], 'GARDE'),
    ('M04 [deguisee] la question est posee, mais la suppression vise l\'INDEX capture au clic',
     [(LO, "    ()=>_progSupprimer(id), 'Supprimer');\n}", "    ((ix)=>()=>{ const q=S.programmes[ix]; if(q) _progSupprimer(q.id); })(_progIdx(id)), 'Supprimer');\n}")], 'GARDE'),
    ('M05 l\'editeur reecrit par l\'index pris a l\'ouverture',
     [(LO, "  const cible=_editProgId?_progParRef(_editProgId):null;", "  const cible=_editProgId?S.programmes[_editProgIdx]:null;")], 'GARDE'),
    ('M06 la migration ne pose plus d\'id',
     [(LO, "  if(!p.id||typeof p.id!=='string'){", "  if(false){")], 'GARDE'),
    ('M07 [deguisee] la migration « normalise » les semaines ecrites en texte (reinterpretation du contenu)',
     [(LO, "  if(p.schema!==PROG_SCHEMA){ p.schema=PROG_SCHEMA; chg=true; }", "  if(typeof p.weeks==='string'){ p.weeks=parseInt(p.weeks)||0; chg=true; }\n  if(p.schema!==PROG_SCHEMA){ p.schema=PROG_SCHEMA; chg=true; }")], 'GARDE'),
    ('M08 une mise a jour ecrase sans garder la version precedente',
     [(LO, "  p.previousVersions.push({version:p.version||1,", "  if(false)p.previousVersions.push({version:p.version||1,")], 'GARDE'),
    ('M09 restaurer remplace en place (la version recente est perdue)',
     [(LO, "  const n=_progNouvelleVersion(p, v.content, 'restore', v.doc||null);", "  Object.keys(p).forEach(k=>{ if(_PROG_META.indexOf(k)<0) delete p[k]; }); Object.assign(p, JSON.parse(JSON.stringify(v.content))); p.version=parseInt(v.version); p.versionReason='restore'; const n=p.version;")], 'GARDE'),
    ('M10 la seance enregistree ne garde plus progRef',
     [(LO, "  if(S.wkt&&S.wkt.progRef)sess.progRef=JSON.parse(JSON.stringify(S.wkt.progRef));", "")], 'GARDE'),
    ('M11 les variantes A/B refusionnent par leur numero',
     [(LO, " && _seanceVariante(prev.label)===_seanceVariante(day.label)){", "){")], 'GARDE'),
    ('M12 le brouillon d\'import n\'est plus ecrit sur le telephone',
     [(LO, "  if(!_impDocDispo()||!_impDoc) return Promise.resolve(false);\n  _impDoc.updatedAt", "  return Promise.resolve(false);\n  _impDoc.updatedAt")], 'GARDE'),
    ('M13 le mode demo / persona lit et ecrit la vraie base d\'import',
     [(LO, "function _impDocDispo(){ return !(typeof window!=='undefined'&&window._demoMode) && typeof indexedDB!=='undefined'; }", "function _impDocDispo(){ return typeof indexedDB!=='undefined'; }"),
      (LO, "  if(_scanEnCours(_impPhotos,_impExtracted) && _impDemoScan!==!!window._demoMode) impRecommencer(true);\n", "")], 'GARDE'),
    ('M14 un doublon exact est accepte',
     [(LO, "    if(fh&&dejaFichiers.has(fh)){", "    if(false){"), (LO, "      if(h&&hashesPages.has(h)){", "      if(false){")], 'GARDE'),
    ('M15 au-dela de la limite on tronque en silence (retour au comportement d\'avant)',
     [(LO, "      if(pdf.numPages>IMP_MAX_PAGES){", "      if(false){"), (LO, "  if(ajout && (_impPhotos.length+ajout)>IMP_MAX_PAGES){", "  if(false){")], 'GARDE'),
    ('M16 une image indecodable n\'a plus d\'onerror (l\'ajout reste bloque)',
     [(LO, "    img.onerror=()=>{ try{URL.revokeObjectURL(url);}catch(x){} res({err:'illisible'}); };\n", "")], 'GARDE'),
    ('M17 une reponse VIDE est acceptee (et l\'import gratuit compte)',
     [(LO, "    if(!_impLectureUtile(d.data)) throw Object.assign(new Error('vide'),{code:'vide'});\n", "")], 'GARDE'),
    ('M18 plus de delai client (attente infinie)',
     [(LO, "  const minuteur=setTimeout(()=>{ if(_impAbort===suivi){", "  const minuteur=setTimeout(()=>{ if(false&&_impAbort===suivi){")], 'GARDE'),
    ('M19 la premiere modification apres import ne sauve plus la version importee',
     [(LO, "  if(!p.editedSinceImport && _progContenuVenuDUnImport(p) &&", "  if(false && !p.editedSinceImport && _progContenuVenuDUnImport(p) &&")], 'GARDE'),
    ('M20 plusieurs programmes peuvent etre « en cours »',
     [(LO, "    else if(p.status==='active'){ p.status='available'; }", "    else if(false){ p.status='available'; }")], 'GARDE'),
    ('M21 la meme empreinte de document ne propose plus la mise a jour',
     [(LO, "  if(forts.length===1){ _impMode='update'; _impCibleId=forts[0].id; }", "  if(false){ _impMode='update'; _impCibleId=forts[0].id; }")], 'GARDE'),
    ('M22 les fenetres « meme nom » et « Gerer » passent SOUS « Mes Programmes » (vu sur capture)',
     [('index.html', 'id="ov-prog-cible" style="z-index:210"', 'id="ov-prog-cible" style="z-index:190"'),
      ('index.html', 'id="ov-prog-gerer" style="z-index:210"', 'id="ov-prog-gerer" style="z-index:190"')], 'GARDE'),
    ('M23 un choix manuel sur la case « en cours » colle aux scans suivants (trouve en ecrivant EC-02)',
     [(LO, "  { const ec=document.getElementById('imp-en-cours'); if(ec) delete ec.dataset.touche; }", "  { }")], 'GARDE'),
    ('M24 [deguisee] importer vole le statut « en cours » meme case decochee',
     [(LO, "  if(enCours) _progDefinirEnCours(progId); else persist();", "  _progDefinirEnCours(progId);")], 'GARDE'),
    ('M25 le catalogue ne part plus avec l\'import de programme (garantie de CCLXII, prouvee par le corps envoye)',
     [(LO, "images:_impPagesPourEnvoi(),catalogue:_catalogueImport()})", "images:_impPagesPourEnvoi()})")], 'GARDE'),
]


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_import_prog_lot1.js'], cwd=arbre, capture_output=True, text=True, timeout=2400,
                       env=dict(os.environ, TZ='Europe/Paris'))
    out = r.stdout + r.stderr
    rouges = [l.strip()[:150] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_l1_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    avant = {}
    for f in FICHIERS:
        try:
            avant[f] = subprocess.run(['git', 'show', BASE + ':' + f], cwd=SRC, capture_output=True, text=True, check=True).stdout
        except Exception:
            avant[f] = ''
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
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu; conformes += ok
        print('  %s  %-92s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom, obtenu, len(rouges), rouges[0] if rouges else ''))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                print('        ' + r)
        sys.stdout.flush()
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
