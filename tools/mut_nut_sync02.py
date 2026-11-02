#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUT-SYNC-01 FINAL (01/11/2026) : le banc `tools/banc_nut_sync02.js` (registre saturé = refus explicite, révisions par repas, verrou, accusés lus, vrais processus serveur)
sait-il ROUGIR, et au BON endroit ?

[!!] SUR UNE COPIE JETABLE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque mutation retire UN morceau du controle dans un clone ; le depot n'est jamais ecrit.
Point de depart : 0 rouge sur l'arbre sain (banc ENTIER). Une mutation est TUEE si le banc rougit (code 1) ET si CHACUN des temoins attendus fait partie des rouges.
Un PLANTAGE (code 2) n'est jamais un verdict. Une ancre absente ou multiple arrete tout. L'extrait ORIGINAL et l'extrait MUTE sont imprimes.
Chaque mutation ne rejoue que les sections du banc dont elle a besoin (NS02_SEULEMENT) : le verrou jamais rendu (K11), par exemple, ferait attendre vingt secondes CHAQUE envoi des sections de concurrence.
Les mutations 'EQ' sont EQUIVALENTES (le comportement observable ne change pas) : elles doivent rester VERTES.
Usage : python3 tools/mut_nut_sync02.py [K01|K02,K05|K10+]   (« K10+ » = de K10 jusqu'a la fin)
"""
import os, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A, ST, SU, CO = 'app.js', 'state.js', 'setup.js', 'Code.js'
G = lambda *c: ['B-NS02 ' + x + ' ' for x in c]

MUT = [
    # ── serveur : le registre saturé ──
    ('K01 le depassement du registre n est plus annonce (differe) : les suppressions en trop sont de nouveau jetees en silence',
     [(CO, "    else if (r === 'refusee') { if (!diffVu[i]) { diffVu[i] = 1; diff.push({ i: i, code: 'NUT_TOMBSTONE_LIMIT' }); } }", "    else if (r === 'refusee') { }")], G('B02', 'B04', 'D08'), 'B,D', 'GARDE'),   # ancre rafraichie le 02/11/2026 (NUT-SYNC-02 phase A : plus de refus en bloc, une suppression sans place est DIFFEREE entree par entree) — meme intention : jamais jetee en silence
    ('K02 le plafond laisse passer une suppression de trop (3001)',
     [(CO, "    if (nouvelle && out.length >= NUT_SUPPR_MAX_) return 'refusee';", "    if (nouvelle && out.length > NUT_SUPPR_MAX_) return 'refusee';")], G('B02', 'B03', 'D08'), 'B,D', 'GARDE'),   # ancre rafraichie le 02/11/2026 (NUT-SYNC-02 phase A), meme intention
    # K46 (« le refus du registre sature est annonce reessayable ») est RETIREE le 02/11/2026, AVEC SA RAISON (R30) : depuis NUT-SYNC-02 phase A le registre plein n'est plus un REFUS — la suppression est DIFFEREE entree par entree, la
    # reponse reste `ok:true`. Le seul refus non reessayable qui reste est la PORTE DE VERSION (`NUT_CLIENT_INCOMPATIBLE`) ; son jumeau est P05 de tools/mut_nut_phasea01.py (temoin PA01).
    # ── serveur : la decision de revision ──
    ('K03 un repas supprime n est plus reconnu comme tel par la decision',
     [(CO, "  if (server.deleted === true) {\n    return { action: 'reject', code: 'NUT_ENTRY_DELETED' };\n  }\n", "")], G('A01', 'C05'), 'A,C', 'GARDE'),
    ('K04 une revision perimee n est plus un conflit (la derniere ecriture gagne de nouveau)',
     [(CO, "  if (incoming.baseRevision !== server.revision) {\n    return { action: 'conflict', code: 'NUT_REVISION_CONFLICT' };\n  }\n", "")], G('A01', 'C02', 'D01'), 'A,C,D', 'GARDE'),
    ('K05 une revision de base invalide est acceptee',
     [(CO, "  if (!Number.isSafeInteger(incoming.baseRevision) || incoming.baseRevision < 0) {", "  if (false) {")], G('A01', 'C11'), 'A,C', 'GARDE'),
    ('K06 la revision annoncee par le client a la creation est crue',
     [(CO, "      if (v3) { n.rev = 1; n.modifiedAt = now;", "      if (v3) { n.rev = (Number.isSafeInteger(l.rev) && l.rev > 0) ? l.rev : 1; n.modifiedAt = now;")], G('C01b'), 'C', 'GARDE'),
    ('K07 le meme contenu renvoye se redecide (conflit contre lui-meme)',
     [(CO, "    if (s && _nutEmpreinte_(l) === _nutEmpreinte_(s)) {   // même contenu", "    if (false) {   // même contenu")], G('C07'), 'C', 'GARDE'),
    ('K22 l empreinte d une ligne compte sa revision et son horodatage (deux copies du meme repas ne se reconnaissent plus)',
     [(CO, "!(haut && (k === 'rev' || k === 'modifiedAt'))", "true")], G('C07'), 'C', 'GARDE'),
    ('K08 la version perdante d un conflit n est plus gardee en zone de recuperation',
     [(CO, "    zone.push([l, d.action === 'conflict' ? 'conflit' : 'sans_revision']);\n", "")], G('C03', 'D01'), 'C,D', 'GARDE'),
    ('K09 le conflit n est plus renvoye a l appareil',
     [(CO, "    if (d.action === 'conflict') out.conflits.push({ i: id, r: revS, ligne: s }); else out.rejets.push({ i: id, code: d.code });", "    if (d.action !== 'conflict') out.rejets.push({ i: id, code: d.code });")], G('C02', 'D01'), 'C,D', 'GARDE'),
    ('K19 la version modifiee d un repas supprime n est plus gardee',
     [(CO, "      if (stockeesSupp[id] === undefined || stockeesSupp[id] !== _nutEmpreinte_(l)) extras.push([l, 'modif_supprimee']);\n", "")], G('C05', 'D03'), 'C,D', 'GARDE'),
    # ── serveur : le verrou et l idempotence ──
    ('K10 saveProfile ne prend plus le verrou (plus rien n est serialise)',
     [(CO, "    verrou = _nutVerrouPrendre_();\n", "    verrou = { v: { releaseLock: function() {} }, t0: 0, rendu: false, ms: 0 };\n")], G('C14', 'D01', 'D02', 'D03', 'D08'), 'C,D', 'GARDE'),   # ancre rafraichie le 02/11/2026 (NUT-SYNC-02 phase A : `_nutVerrouPrendre_` rend un POIGNEE qui mesure la duree), meme intention
    ('K11 le verrou n est jamais rendu par `finally` (une erreur d ecriture le laisse tenu)',
     [(CO, "    if (verrou) _nutVerrouRendre_(verrou, 'saveProfile');\n", "")], G('C14'), 'C', 'GARDE'),   # ancre rafraichie le 02/11/2026 (NUT-SYNC-02 phase A), meme intention
    ('K50 le verrou reste tenu pendant le miroir Sheets et l e-mail de bienvenue (liberation anticipee retiree)',
     [(CO, "    lockMs = _nutVerrouRendre_(verrou, 'saveProfile'); verrou = null;   // libération anticipée ET durée mesurée (NUT-SYNC-02 phase A)\n", "")], G('C15'), 'C', 'GARDE'),   # ancre rafraichie le 02/11/2026 (NUT-SYNC-02 phase A), meme intention
    ('K12 un verrou indisponible est annonce non reessayable',
     [(CO, "code:'NUT_LOCK_BUSY', message:'Serveur occupé, réessaie dans un instant.', retryable:true", "code:'NUT_LOCK_BUSY', message:'Serveur occupé, réessaie dans un instant.', retryable:false")], G('D05'), 'D', 'GARDE'),
    ('K13 un verrou indisponible est ignore (on ecrit quand meme)',
     [(CO, "    if (!verrou) return json_({status:'error', ok:false, code:'NUT_LOCK_BUSY'", "    if (false) return json_({status:'error', ok:false, code:'NUT_LOCK_BUSY'")], G('D05'), 'D', 'GARDE'),
    ('K14 la memoire des operations est ignoree (une retransmission est rejugee)',
     [(CO, "      if (ops[k] && ops[k].r === requestId && !ops[k].tr) {", "      if (false) {")], G('C06', 'C08', 'D07'), 'C,D', 'GARDE'),
    ('K15 la revision du compte n avance plus',
     [(CO, "  if (change) profile.nutRev = (Number.isSafeInteger(profile.nutRev) ? profile.nutRev : 0) + 1;", "  if (change) profile.nutRev = (Number.isSafeInteger(profile.nutRev) ? profile.nutRev : 0);")], G('C01'), 'C', 'GARDE'),
    ('K21 l accuse de succes ne repete plus l identifiant d operation',
     [(CO, "    return json_({status:'ok', ok:true, requestId:_requestId, serverRevision:", "    return json_({status:'ok', ok:true, requestId:'', serverRevision:")], G('C01'), 'C', 'GARDE'),
    # ── serveur : les anciens clients ──
    ('K17 un ancien client peut modifier un repas deja revise',
     [(CO, "(Number.isSafeInteger(l.rev) && l.rev >= 0 ? l.rev : (revS === 0 ? 0 : NaN))", "(Number.isSafeInteger(l.rev) && l.rev >= 0 ? l.rev : revS)")], G('C11'), 'C', 'GARDE'),
    ('K18 un ancien client qui envoie une liste plus courte retire les repas reviss',
     [(CO, "  var protegees = (!v2j && nom === 'foodLog') ? ec.retirees.filter(function(l) { return _nutRevisionDe_(l) > 0; }) : [];", "  var protegees = [];")], G('C12'), 'C', 'GARDE'),
    ('K20 le serveur declare toujours l instantane « complet » (le miroir recevrait un journal partiel)',
     [(CO, "  if (ctx && nom === 'foodLog') ctx.out.complet = !vide && v2j && gardees.length === 0;", "  if (ctx && nom === 'foodLog') ctx.out.complet = true;")], G('E05b'), 'E', 'GARDE'),
    # K47 (« un refus tardif laisserait un profil Nutrition a moitie ecrit : le registre fusionne APRES le journal ») est RETIREE le 02/11/2026, AVEC SA RAISON (R30) : son declencheur — le refus du registre sature, leve APRES l'ecriture du
    # journal — n'existe plus (la fusion du registre ne leve plus). La protection qu'elle gardait (restituer l'etat d'AVANT en cas d'erreur du bloc) est desormais celle du CONFINEMENT, eprouvee par P14 et P15 de tools/mut_nut_phasea01.py
    # (temoins PA08a/b, avec une erreur injectee APRES la fusion du registre ET l'ecriture de la zone).
    ('K27 [equivalente POUR CE BANC] la restitution defensive de l etat Nutrition est retiree (ce banc n injecte aucune erreur imprevue ; depuis NUT-SYNC-02 phase A elle sert le CONFINEMENT et P15 de mut_nut_phasea01.py la tue)',
     [(CO, "      Object.keys(nutAvant).forEach(function(k) { if (nutAvant[k] === undefined) delete profile[k]; else profile[k] = nutAvant[k]; });\n", "")], [], 'B', 'EQ'),
    # ── client : l accuse ──
    ('K30 la synchronisation redevient opaque (no-cors) : aucune reponse lisible',
     [(SU, "    _p=fetch(S.url,{method:'POST',redirect:'follow',", "    _p=fetch(S.url,{method:'POST',mode:'no-cors',redirect:'follow',")], G('E01', 'E04b', 'E07b'), 'E', 'GARDE'),
    ('K31 l identifiant d operation de l accuse n est plus verifie',
     [(SU, "if(!d || typeof d!=='object' || d.requestId!==envoi.requestId) return _nutNonConfirme(envoi,'ACCUSE_ABSENT');", "if(!d || typeof d!=='object') return _nutNonConfirme(envoi,'ACCUSE_ABSENT');")], G('E07a'), 'E', 'GARDE'),
    ('K32 un refus du serveur est traite comme un succes',
     [(SU, "  if(d.ok!==true){\n    const code=String(d.code", "  if(false){\n    const code=String(d.code")], G('E01', 'E08'), 'E', 'GARDE'),
    ('K51 la reponse d un ANCIEN serveur (« status:ok », sans ok ni requestId) est prise pour un accuse',
     [(SU, "if(!d || typeof d!=='object' || d.requestId!==envoi.requestId) return _nutNonConfirme(envoi,'ACCUSE_ABSENT');", "if(!d || typeof d!=='object' || (d.requestId!==envoi.requestId && d.status!=='ok')) return _nutNonConfirme(envoi,'ACCUSE_ABSENT');"),
      (SU, "  if(d.ok!==true){\n    const code=String(d.code", "  if(d.ok===false){\n    const code=String(d.code")], G('E10'), 'E', 'GARDE'),
    ('K33 une suppression differee est EFFACEE du registre local',
     [(SU, "    const nConf=S.foodSupprimes.filter(e=>e.c).length;", "    S.foodSupprimes=S.foodSupprimes.filter(e=>!(difMap.has(e.i)&&!e.c));\n    const nConf=S.foodSupprimes.filter(e=>e.c).length;")], G('E01', 'E01c'), 'E', 'GARDE'),
    ('K41 l etat « rejetee » ne survit pas a la normalisation du registre',
     [(ST, "    const n={i:i, t:t}; if(c) n.c=c; else if(xx) n.x=xx;", "    const n={i:i, t:t}; if(c) n.c=c;")], G('E01c'), 'E', 'GARDE'),
    ('K42 une suppression rejetee n est plus comptee parmi celles a renvoyer',
     [(ST, "function _foodSupprimesEnAttente(){ return _foodSupprimesNormaliser(S.foodSupprimes).filter(e=>!e.c); }", "function _foodSupprimesEnAttente(){ return _foodSupprimesNormaliser(S.foodSupprimes).filter(e=>!e.c && !e.x); }")], G('E01c'), 'E', 'GARDE'),
    ('K43 persist() ne declenche plus la synchronisation differee : une suppression non confirmee n est plus renvoyee a l ouverture suivante',
     [(ST, "  try{ if(typeof _appliquerMaj==='function')_appliquerMaj(); }catch(e){}\n  _cloudSyncDebounced();\n}", "  try{ if(typeof _appliquerMaj==='function')_appliquerMaj(); }catch(e){}\n}")], G('E12'), 'E', 'GARDE'),
    # ── client : les conflits ──
    ('K34 un conflit fait perdre la version de la personne (plus de copie)',
     [(SU, "    S.foodLog.push(copie); conflits++; journal=true;", "    conflits++; journal=true;")], G('E02'), 'E', 'GARDE'),
    ('K35 un conflit n est plus annonce',
     [(SU, "  if(conflits){ try{ toast(_N_MSG_SYNC_CONFLIT,'error'); }catch(e){} try{ _cloudSyncDebounced(); }catch(e){} }", "  if(conflits){ try{ _cloudSyncDebounced(); }catch(e){} }")], G('E02'), 'E', 'GARDE'),
    ('K36 les revisions annoncees par le serveur ne sont plus apprises',
     [(SU, "    if(l && Number.isSafeInteger(a.r) && a.r>=0 && a.r>=(Number.isSafeInteger(l.rev)?l.rev:0) && l.rev!==a.r){ l.rev=a.r; journal=true; }", "    if(false){ journal=true; }")], G('E06b'), 'E', 'GARDE'),
    ('K37 modifier un repas fait perdre sa revision (faux conflit avec soi-meme)',
     [(A, "    if(_r && Number.isSafeInteger(_r.rev) && rs[0].ligne && typeof rs[0].ligne==='object'){", "    if(false){")], G('E06', 'E06b'), 'E', 'GARDE'),
    ('K40 une suppression faite ailleurs n est plus marquee confirmee (retour de refus)',
     [(SU, "S.foodSupprimes=_foodSupprimesFusion(S.foodSupprimes,[{i:r.i,t:maintenant}],true); registre=true; retires++;", "S.foodSupprimes=_foodSupprimesFusion(S.foodSupprimes,[{i:r.i,t:maintenant}]); registre=true; retires++;")], G('E03b'), 'E', 'GARDE'),
    ('K44 les suppressions du compte lues au demarrage ne sont plus marquees confirmees',
     [(A, "S.foodSupprimes=_foodSupprimesFusion(S.foodSupprimes,_s,true); _foodAppliquerSuppressions();", "S.foodSupprimes=_foodSupprimesFusion(S.foodSupprimes,_s); _foodAppliquerSuppressions();")], G('E03d'), 'E', 'GARDE'),
    ('K52 la restauration ignore les suppressions du compte (ex-K11 de mut_nut_sync01, deplacee ici : la voie « rejets » la compense dans les scenarios de nut_sync01)',
     [(SU, "  try{ if(Array.isArray(d.foodSupprimes)) S.foodSupprimes=_foodSupprimesFusion(S.foodSupprimes,d.foodSupprimes,true); _foodAppliquerSuppressions(); }catch(e){console.warn('[FT restore] suppressions',e);}", "")], G('E03c'), 'E', 'GARDE'),
    ('K53 le demarrage n applique plus les suppressions venues d un autre appareil (ex-K12 de mut_nut_sync01 : la voie « rejets » la compense dans nut_sync01)',
     [(A, "if(Array.isArray(_s)&&_s.length){ S.foodSupprimes=_foodSupprimesFusion(S.foodSupprimes,_s,true); _foodAppliquerSuppressions(); }", "")], G('E03d'), 'E', 'GARDE'),
    ('K45 les suppressions du compte lues a la restauration ne sont plus marquees confirmees',
     [(SU, "S.foodSupprimes=_foodSupprimesFusion(S.foodSupprimes,d.foodSupprimes,true);", "S.foodSupprimes=_foodSupprimesFusion(S.foodSupprimes,d.foodSupprimes);")], G('E03c'), 'E', 'GARDE'),
    # ── client : le miroir ──
    ('K38 le miroir recoit le journal meme quand l accuse ne dit pas « complet »',
     [(SU, "if(nut.complet===true && typeof sbEnvoyerJournal==='function' && (S.foodSupprimes||[]).length>=(Number(nut.supprimes)||0)){", "if(typeof sbEnvoyerJournal==='function'){")], G('E05b'), 'E', 'GARDE'),
    ('K39 la porte du miroir ne retire plus le journal ni le registre (elle les laisse passer par defaut)',
     [('supabase.js', "  payload=_sbSansSnapshotNutrition(payload, journalAutorise===true);\n", "")], G('E05b', 'E05f', 'E05g'), 'E', 'GARDE'),
    ('K48 le miroir n est plus appele par la synchronisation (le filet disparait)',
     [(SU, "  try{ if(typeof sbEnvoyer==='function')sbEnvoyer(_corpsSync); }catch(e){}\n}\n", "}\n")], G('E05c', 'E05f'), 'E', 'GARDE'),
    ('K49 la porte refuse d autoriser le journal meme apres un accuse complet',
     [('supabase.js', "  if(autorise===true || !payload || typeof payload!=='object') return payload;", "  if(false || !payload || typeof payload!=='object') return payload;")], G('E05', 'E05d', 'E05g'), 'E', 'GARDE'),
]

def banc(arbre, sections):
    env = dict(os.environ, NS02_SEULEMENT=sections) if sections != '*' else dict(os.environ)
    r = subprocess.run(['node', 'tools/banc_nut_sync02.js'], cwd=arbre, capture_output=True, text=True, timeout=1500, env=env)
    out = r.stdout or ''
    last = [l for l in out.split('\n') if ' OK / ' in l]
    rouges = [l.split('rouge : ', 1)[1] for l in out.split('\n') if l.startswith('  rouge : ')]
    return r.returncode, (last[-1].strip() if last else (r.stderr or '')[-200:]), rouges

def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_ns02_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'audits', 'worktrees'))
    return tmp, a

def main():
    seul = sys.argv[1] if len(sys.argv) > 1 else None
    tmp0, a0 = cloner()
    rc, res, _ = banc(a0, '*')
    shutil.rmtree(tmp0, ignore_errors=True)
    if rc != 0:
        print('  !! ARBRE SAIN DEJA ROUGE OU PLANTE — controle refuse :', res); return 1
    print('  arbre sain : %s (point de depart valide)\n' % res)
    conformes, total = 0, 0
    depuis = bool(seul and seul.endswith('+'))
    if depuis: seul = seul[:-1]
    actif = not depuis
    for nom, rempl, attendus, sections, genre in MUT:
        if depuis and nom.startswith(seul + ' '): actif = True
        if seul and not depuis and not any(nom.startswith(x + ' ') for x in seul.split(',')): continue
        if depuis and not actif: continue
        total += 1
        tmp, arbre = cloner()
        print('--- %s   [sections %s]' % (nom, sections))
        for f, old, new in rempl:
            p = os.path.join(arbre, f)
            s = open(p, encoding='utf-8').read()
            if s.count(old) != 1:
                print('  !! ANCRE INTROUVABLE OU MULTIPLE (%d) : %s' % (s.count(old), nom)); shutil.rmtree(tmp, ignore_errors=True); return 1
            open(p, 'w', encoding='utf-8').write(s.replace(old, new))
            print('     [%s] ORIGINAL : %s' % (f, old.strip().replace('\n', ' ⏎ ')[:200]))
            print('     [%s] MUTE     : %s' % (f, new.strip().replace('\n', ' ⏎ ')[:200]))
        for f in sorted(set(x[0] for x in rempl)):
            chk = subprocess.run(['node', '-e', "new Function(require('fs').readFileSync('%s','utf8'))" % f], cwd=arbre, capture_output=True)
            if chk.returncode != 0:
                print('  !! MUTATION QUI CASSE LA SYNTAXE (refusee) : %s' % nom); shutil.rmtree(tmp, ignore_errors=True); return 1
        rc, res, rouges = banc(arbre, sections)
        shutil.rmtree(tmp, ignore_errors=True)
        manquants = [w for w in attendus if not any(r.startswith(w) for r in rouges)]
        if genre == 'EQ':
            ok = rc == 0
            print('  %s %s -> %s  [code %d]' % ('CONFORME(EQ)' if ok else 'NON CONFORME', nom[:60], res, rc))
        else:
            ok = rc == 1 and not manquants
            print('  %s %s -> %s  [code %d]' % ('TUEE      ' if ok else 'SURVIVANTE', nom[:60], res, rc))
            if manquants: print('       temoin(s) attendu(s) reste(s) VERT(S) : %s' % ' · '.join(manquants))
            if rc == 2: print('       PLANTAGE : ce n\'est pas un verdict')
            print('       rouges : %s\n' % (' · '.join(r.split(' ')[1] if len(r.split(' ')) > 1 else r[:14] for r in rouges) or 'aucun'))
        conformes += ok
    print('\n%d/%d conformes (tuees, ou equivalentes restees vertes)' % (conformes, total))
    return 0 if conformes == total and total > 0 else 1

if __name__ == '__main__':
    sys.exit(main())
