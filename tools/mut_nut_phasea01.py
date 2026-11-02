#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUT-SYNC-02 PHASE A (02/11/2026) : le banc `tools/banc_nut_phasea01.js` sait-il ROUGIR, et au BON endroit ?

[!!] SUR UNE COPIE JETABLE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque mutation retire UN morceau d'une protection de la phase A dans un clone ; le depot n'est jamais ecrit.
Point de depart : 0 rouge sur l'arbre sain (banc ENTIER). Une mutation est TUEE si le banc rougit (code 1) ET si CHACUN des temoins attendus fait partie des rouges.
Un PLANTAGE (code 2) n'est jamais un verdict. Une ancre absente ou multiple arrete tout. L'extrait ORIGINAL et l'extrait MUTE sont imprimes.
Chaque mutation ne rejoue que ce dont elle a besoin : `PA01_SEULEMENT` (sections S serveur en memoire · D vrais processus · C vrai client) et `PA01_BLOCS` (blocs PCxx / PDxx) — un verrou jamais rendu,
par exemple, ferait attendre vingt secondes CHAQUE envoi des vrais processus.
Les mutations 'EQ' sont EQUIVALENTES (le comportement observable ne change pas) : elles doivent rester VERTES.
Les gros dossiers (images, bibliotheques, docs) sont LIES et non copies : le runner ne les modifie jamais, seuls les fichiers .js de la racine sont mutes — une copie complete coute 8 s par mutation.
Usage : python3 tools/mut_nut_phasea01.py [P01|P02,P05|P10+]   (« P10+ » = de P10 jusqu'a la fin)    ·    python3 tools/mut_nut_phasea01.py --ancres   (verifie seulement les ancres, sans lancer le banc)
"""
import os, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A, ST, SU, CO = 'app.js', 'state.js', 'setup.js', 'Code.js'
G = lambda *c: ['B-PA01 ' + x + ' ' for x in c]
FAKE = "({ v: { releaseLock: function() {} }, t0: 0, rendu: false, ms: 0 })"      # un « verrou » qui ne verrouille rien

# (nom, [(fichier, ancre, remplacement)], temoins attendus, sections, blocs, genre)
MUT = [
    # ── serveur : la porte de version ──
    ('P01 la porte n exige plus de requestId (un client « v3 » sans identifiant d operation passe)',
     [(CO, "  return { ok: !!requestId && version >= NUT_PROTOCOLE_MIN_, version: version, volet: true };", "  return { ok: version >= NUT_PROTOCOLE_MIN_, version: version, volet: true };")], G('PA02'), 'S', '', 'GARDE'),
    ('P02 la porte accepte la version 2 (un client plus ancien que le protocole des accuses)',
     [(CO, "  return { ok: !!requestId && version >= NUT_PROTOCOLE_MIN_, version: version, volet: true };", "  return { ok: !!requestId && version >= 2, version: version, volet: true };")], G('PA02'), 'S', '', 'GARDE'),
    ('P03 la porte ne regarde que le journal (des favoris seuls, des suppressions seules passent sans version)',
     [(CO, "  var volet = !!body && (body.foodLog !== undefined || body.savedFoods !== undefined || body.foodSupprimes !== undefined);", "  var volet = !!body && (body.foodLog !== undefined);")], G('PA02'), 'S', '', 'GARDE'),
    ('P04 la porte est desarmee (un ancien client ecrit de nouveau : ressusciter, ecraser, perdre en silence)',
     [(CO, "    } else if (compat.volet && !compat.ok && _nutAncienRefuse_(existing, compat)) {", "    } else if (false) {")], G('PA01', 'PA01b', 'PA03a', 'PA03b', 'PA03c'), 'S', '', 'GARDE'),
    ('P05 le refus de la porte est annonce « reessayable » (l appareil bouclerait sur une impossibilite)',
     [(CO, "retryable:(nutEchec.code === 'NUT_INTERNE' || nutEchec.code === 'NUT_SUSPENDU')", "retryable:true")], G('PA01'), 'S', '', 'GARDE'),
    ('P06 le refus de la porte n est plus journalise',
     [(CO, "      Logger.log('[FT COMPAT] Nutrition refusée : client en version ' + compat.version + ' (minimum ' + NUT_PROTOCOLE_MIN_ + ') sur un compte à état v3 (protocole ' + _nutProtoDe_(existing) + ') — rien de Nutrition n\\'est appliqué, le reste du profil est enregistré');\n", "")], G('PA01d'), 'S', '', 'GARDE'),
    # ── serveur : les suppressions differees ──
    ('P07 le plafond de 3 000 saute (la phase B n est pas la : le stockage partage n est plus protege)',
     [(CO, "    if (nouvelle && out.length >= NUT_SUPPR_MAX_) return 'refusee';", "    if (false) return 'refusee';")], G('PA05', 'PA06'), 'S', '', 'GARDE'),
    ('P08 une suppression sans place est jetee en silence (ni inscrite, ni annoncee differee)',
     [(CO, "    else if (r === 'refusee') { if (!diffVu[i]) { diffVu[i] = 1; diff.push({ i: i, code: 'NUT_TOMBSTONE_LIMIT' }); } }", "    else if (r === 'refusee') { }")], G('PA05', 'PA06'), 'S', '', 'GARDE'),
    ('P09 une suppression sans place est annoncee ACCEPTEE (faux accuse de succes)',
     [(CO, "    else if (r === 'refusee') { if (!diffVu[i]) { diffVu[i] = 1; diff.push({ i: i, code: 'NUT_TOMBSTONE_LIMIT' }); } }", "    else if (r === 'refusee') { if (!diffVu[i]) { diffVu[i] = 1; diff.push({ i: i, code: 'NUT_TOMBSTONE_LIMIT' }); } ok.push(i); }")], G('PA05', 'PA06'), 'S', '', 'GARDE'),
    ('P10 le rejeu d un envoi dont les differees depassent la memoire n est plus declare « incomplet » (il mentirait)',
     [(CO, "  if (op && op.td) return { v: 1, ok: [], diff: [], n: liste.length, incomplet: true };", "")], G('PA06b'), 'S', '', 'GARDE'),
    ('P11 le rejeu ne rend plus l accuse des suppressions',
     [(CO, "          tomb: _nutTombRejeu_(profile, body, ops[k])        // NUT-SYNC-02 phase A", "          tomb: undefined        // NUT-SYNC-02 phase A")], G('PA06'), 'S', '', 'GARDE'),
    ('P12 le serveur annonce le nombre d entrees ACCEPTEES au lieu de la taille du registre (la guerison de l appareil ne verrait plus l ecart)',
     [(CO, "  tomb.n = (profile.foodSupprimes || []).length;", "  tomb.n = tomb.ok.length;")], G('PA05'), 'S', '', 'GARDE'),
    # ── serveur : le confinement ──
    ('P13 le confinement saute : une erreur imprevue du bloc Nutrition est de nouveau relancee (SERVER_ERROR, rien n est ecrit — seances, records, pesees compris)',
     [(CO, "        nutEchec = (nutErr instanceof NutSyncError) ? nutErr : new NutSyncError('NUT_INTERNE', 'Erreur interne de la synchronisation Nutrition.', {});", "        if (!(nutErr instanceof NutSyncError)) throw nutErr;\n        nutEchec = nutErr;")], G('PA08a', 'PA08b', 'PA08c', 'PA08d'), 'S', '', 'GARDE'),
    ('P14 le confinement ne restitue plus la zone de recuperation (la copie du conflit reste, ou la zone apparait)',
     [(CO, "        if (zoneAvant === undefined) delete existing.recupNut; else existing.recupNut = JSON.parse(zoneAvant);\n", "")], G('PA08a', 'PA08b'), 'S', '', 'GARDE'),
    ('P15 le confinement ne restitue plus les cinq champs Nutrition (un registre fusionne avant l erreur resterait ecrit a moitie)',
     [(CO, "        Object.keys(nutAvant).forEach(function(k) { if (nutAvant[k] === undefined) delete profile[k]; else profile[k] = nutAvant[k]; });\n", "")], G('PA08a', 'PA08b'), 'S', '', 'GARDE'),
    ('P16 l erreur interne est annoncee NON reessayable (l appareil abandonnerait une panne passagere)',
     [(CO, "retryable:(nutEchec.code === 'NUT_INTERNE' || nutEchec.code === 'NUT_SUSPENDU')", "retryable:false")], G('PA08a', 'PA08b'), 'S', '', 'GARDE'),
    # ── serveur : un seul verrou pour tous les ecrivains du compte ──
    ('P17 la sante de la montre (pushHealth) ne prend plus le verrou commun',
     [(CO, "    _hv = _nutVerrouPrendre_();\n    if (!_hv) return json_({status:'error', ok:false, code:'NUT_LOCK_BUSY', retryable:true});", "    _hv = " + FAKE + ";\n    if (!_hv) return json_({status:'error', ok:false, code:'NUT_LOCK_BUSY', retryable:true});")], G('PA10', 'PA11', 'PD01'), 'S,D', 'PD01', 'GARDE'),
    ('P18 la confirmation d e-mail ne prend plus le verrou commun',
     [(CO, "      _hv = _nutVerrouPrendre_();\n      var data = _hv ? loadUserData_(email) : null;", "      _hv = " + FAKE + ";\n      var data = _hv ? loadUserData_(email) : null;")], G('PA10', 'PA11'), 'S', '', 'GARDE'),
    ('P19 le code perso ne prend plus le verrou commun',
     [(CO, "      _hv = _nutVerrouPrendre_();\n      if (!_hv) sp.setProperty('confirmed_' + email, new Date().toISOString().slice(0,10));", "      _hv = " + FAKE + ";\n      if (!_hv) sp.setProperty('confirmed_' + email, new Date().toISOString().slice(0,10));")], G('PA10', 'PA11'), 'S', '', 'GARDE'),
    ('P20 la memoire du coach ne prend plus le verrou commun',
     [(CO, "      const _hv = _nutVerrouPrendre_();\n      if (_hv) {", "      const _hv = " + FAKE + ";\n      if (_hv) {")], G('PA10', 'PA11'), 'S', '', 'GARDE'),
    ('P21 la restauration admin ne prend plus le verrou commun',
     [(CO, "  const _hv = _nutVerrouPrendre_();\n  if (!_hv) return json_({status:'error', error:'busy', ok:false, code:'NUT_LOCK_BUSY', retryable:true});", "  const _hv = " + FAKE + ";\n  if (!_hv) return json_({status:'error', error:'busy', ok:false, code:'NUT_LOCK_BUSY', retryable:true});")], G('PA10', 'PA11'), 'S', '', 'GARDE'),
    ('P22 la sante de la montre ne rend plus le verrou (il reste tenu apres chaque appel)',
     [(CO, "    _nutVerrouRendre_(_hv, 'pushHealth');\n", "")], G('PA11', 'PA13'), 'S', '', 'GARDE'),
    ('P23 la duree de detention n est plus mesuree',
     [(CO, "  h.ms = Math.max(0, _nutHorloge_() - h.t0);", "  h.ms = 0;")], G('PA12b'), 'S', '', 'GARDE'),
    ('P24 une detention lente n est plus journalisee',
     [(CO, "  if (h.ms >= NUT_VERROU_ALERTE_MS_) Logger.log(", "  if (false) Logger.log(")], G('PA12b'), 'S', '', 'GARDE'),
    # ── client : seules les suppressions non confirmees voyagent, et elles ne sont confirmees que si le serveur les nomme ──
    ('P25 le client renvoie de nouveau tout le registre a chaque synchronisation',
     [(ST, "function _foodSupprimesPourEnvoi(){ return _foodSupprimesNormaliser(S.foodSupprimes).filter(e=>!e.c).map(e=>({i:e.i, t:e.t})); }", "function _foodSupprimesPourEnvoi(){ return _foodSupprimesNormaliser(S.foodSupprimes).map(e=>({i:e.i, t:e.t})); }")], G('PC01'), 'C', 'PC01', 'GARDE'),
    ('P26 le miroir de secours ne recoit plus que les suppressions non confirmees (il perdrait la memoire des autres)',
     [(SU, "sbEnvoyerJournal((S.foodLog||[]).slice(-8000),_foodSupprimesTous());", "sbEnvoyerJournal((S.foodLog||[]).slice(-8000),_foodSupprimesPourEnvoi());")], G('PC01b'), 'C', 'PC01', 'GARDE'),
    ('P27 une suppression differee n est plus marquee (elle reste « en attente » sans dire pourquoi)',
     [(SU, "      if(difMap.has(e.i)){ if(!e.c && e.x!==difMap.get(e.i)){ registre=true; return Object.assign({},e,{x:difMap.get(e.i)}); } return e; }", "      if(difMap.has(e.i)){ return e; }")], G('PC02'), 'C', 'PC02', 'GARDE'),
    ('P28 le client confirme TOUT ce qu il a envoye (comportement d avant la phase A : une suppression sans place est confirmee a tort)',
     [(SU, "      if(difMap.has(e.i)){ if(!e.c && e.x!==difMap.get(e.i)){ registre=true; return Object.assign({},e,{x:difMap.get(e.i)}); } return e; }\n      if(okSet.has(e.i) && (!e.c || e.x)){", "      if(sup.has(e.i) && (!e.c || e.x)){")], G('PC02'), 'C', 'PC02', 'GARDE'),
    ('P29 un accuse valide SANS liste de suppressions confirme quand meme tout (un serveur plus ancien ferait croire a une suppression inscrite)',
     [(SU, "  }else if(sup.size){\n    _nutAvertir('ATTENTE',_N_MSG_SYNC_ATTENTE);                              // serveur qui n'annonce pas ses suppressions : rien n'est confirmé\n  }", "  }else if(sup.size){\n    S.foodSupprimes=_foodSupprimesNormaliser(S.foodSupprimes).map(e=>(sup.has(e.i)&&!e.c)?Object.assign({},e,{c:maintenant}):e); registre=true;\n  }")], G('PC03'), 'C', 'PC03', 'GARDE'),
    ('P30 la guerison saute (un compte revenu en arriere n est plus detecte : les suppressions confirmees ne repartent jamais)',
     [(SU, "    if(Number.isSafeInteger(Number(tomb.n)) && Number(tomb.n)<nConf){", "    if(false){")], G('PC04'), 'C', 'PC04', 'GARDE'),
    # ── client : refus explicites, erreur interne, temporisation ──
    ('P31 un refus « version incompatible » marque de nouveau les suppressions « rejetees » (l etat d avant : elles sortiraient de la file)',
     [(SU, "      if(code==='NUT_CLIENT_INCOMPATIBLE') _nutAvertir(code,_N_MSG_SYNC_INCOMPAT,86400000);\n      return 'refuse';", "      S.foodSupprimes=_foodSupprimesNormaliser(S.foodSupprimes).map(e=>(sup.has(e.i)&&!e.c)?Object.assign({},e,{x:code}):e); _ecrireSuppressionsLocal();\n      if(code==='NUT_CLIENT_INCOMPATIBLE') _nutAvertir(code,_N_MSG_SYNC_INCOMPAT,86400000);\n      return 'refuse';")], G('PC05'), 'C', 'PC05', 'GARDE'),
    ('P32 un refus « version incompatible » ne dit plus rien a la personne',
     [(SU, "      if(code==='NUT_CLIENT_INCOMPATIBLE') _nutAvertir(code,_N_MSG_SYNC_INCOMPAT,86400000);\n", "")], G('PC05'), 'C', 'PC05', 'GARDE'),
    ('P33 un refus definitif planifie des reessais (boucle sur une impossibilite)',
     [(SU, "      if(code==='NUT_CLIENT_INCOMPATIBLE') _nutAvertir(code,_N_MSG_SYNC_INCOMPAT,86400000);\n      return 'refuse';", "      if(code==='NUT_CLIENT_INCOMPATIBLE') _nutAvertir(code,_N_MSG_SYNC_INCOMPAT,86400000);\n      _nutPlanifierRelance();\n      return 'refuse';")], G('PC05'), 'C', 'PC05', 'GARDE'),
    ('P34 la temporisation ne croit plus (toujours 30 s)',
     [(SU, "function _nutDelaiRelance(n){ return _NUT_RELANCES_MS[Math.max(0,Math.min(n,_NUT_RELANCES_MS.length-1))]; }", "function _nutDelaiRelance(n){ return 30000; }")], G('PC06'), 'C', 'PC06', 'GARDE'),
    ('P35 un accuse valide ne remet plus la temporisation a zero (une panne passee garderait des delais de 15 minutes)',
     [(SU, "  _nutRelance.n=0; _nutAConfirmer=false;", "  _nutAConfirmer=false;")], G('PC06b'), 'C', 'PC06', 'GARDE'),
    # ── client : la reprise ──
    ('P36 le retour du reseau ne relance plus rien',
     [(SU, "try{ window.addEventListener('online',_nutReprendre); }catch(e){}", "")], G('PC07', 'PC07d'), 'C', 'PC07', 'GARDE'),
    ('P37 le retour a l ecran ne relance plus rien',
     [(SU, "try{ document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='visible') _nutReprendre(); }); }catch(e){}", "")], G('PC07b'), 'C', 'PC07', 'GARDE'),
    ('P38 la reprise synchronise meme quand il n y a rien a confirmer (trafic et batterie gaspilles)',
     [(SU, "    if(_nutAConfirmer || _foodSupprimesEnAttente().length) _cloudSyncDebounced();", "    _cloudSyncDebounced();")], G('PC07c'), 'C', 'PC07', 'GARDE'),
    ('P39 une synchronisation sans accusé n est plus retenue comme « a confirmer » (un repas saisi hors ligne attendrait la prochaine action)',
     [(SU, "function _nutNonConfirme(envoi,code){\n  _nutAConfirmer=true;", "function _nutNonConfirme(envoi,code){")], G('PC07d'), 'C', 'PC07', 'GARDE'),
    # ── client : le quota local ──
    ('P40 l ecriture isolee d une cle Nutrition laisse de nouveau remonter l erreur de quota (le repli reduirait les seances)',
     [(ST, "  catch(e){\n    _nutRefusees.push(cle);", "  catch(e){\n    if(true) throw e;\n    _nutRefusees.push(cle);")], G('PC08'), 'C', 'PC08', 'GARDE'),
    ('P41 les favoris sont de nouveau ecrits directement (leur refus declenche le repli des seances)',
     [(ST, "    _ecrireCleNutrition('ft4_savedfoods',JSON.stringify(S.savedFoods||[]));", "    localStorage.setItem('ft4_savedfoods',JSON.stringify(S.savedFoods||[]));")], G('PC08'), 'C', 'PC08', 'GARDE'),
    ('P42 le plan de repas est de nouveau ecrit directement (dans le bloc commun)',
     [(ST, "    _ecrireCleNutrition('ft4_mealplan',JSON.stringify(S.mealPlan||null));", "    localStorage.setItem('ft4_mealplan',JSON.stringify(S.mealPlan||null));")], G('PC08'), 'C', 'PC08', 'GARDE'),
    ('P43 le repli quota d avant est retire (le temoin de portee ne verrait plus le repli : le banc serait aveugle)',
     [(ST, "function _persistRepli(e, rep){\n", "function _persistRepli(e, rep){\n  return;\n")], G('PC08b'), 'C', 'PC08', 'GARDE'),
]


def banc(arbre, sections, blocs):
    env = dict(os.environ)
    if sections != '*': env['PA01_SEULEMENT'] = sections
    else: env.pop('PA01_SEULEMENT', None)
    if blocs: env['PA01_BLOCS'] = blocs
    else: env.pop('PA01_BLOCS', None)
    r = subprocess.run(['node', 'tools/banc_nut_phasea01.js'], cwd=arbre, capture_output=True, text=True, timeout=1500, env=env)
    out = r.stdout or ''
    last = [l for l in out.split('\n') if ' OK / ' in l]
    rouges = [l.split('rouge : ', 1)[1] for l in out.split('\n') if l.startswith('  rouge : ')]
    return r.returncode, (last[-1].strip() if last else (r.stderr or '')[-200:]), rouges


LOURDS = ('exercises', 'anatomy', 'muscles', 'lib', 'docs', 'data', 'clone', 'guide', 'audits', 'worktrees')


def cloner():
    """Une copie jetable : les .js, .html et tests sont COPIES (donc mutables sans toucher le depot) ; les gros dossiers d images et de bibliotheques sont LIES (jamais modifies)."""
    tmp = tempfile.mkdtemp(prefix='mut_pa01_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', *LOURDS))
    for d in LOURDS:
        s = os.path.join(SRC, d)
        if os.path.isdir(s): os.symlink(s, os.path.join(a, d))
    return tmp, a


def verifier_ancres():
    mal = 0
    for nom, rempl, _, _, _, _ in MUT:
        for f, old, new in rempl:
            s = open(os.path.join(SRC, f), encoding='utf-8').read()
            n = s.count(old)
            if n != 1:
                print('  !! ANCRE %s (%d) : %s [%s]' % ('INTROUVABLE' if n == 0 else 'MULTIPLE', n, nom[:70], f)); mal += 1
            elif old == new:
                print('  !! MUTATION SANS EFFET : %s' % nom[:70]); mal += 1
    print('%d mutations, %d ancres en defaut' % (len(MUT), mal))
    return 1 if mal else 0


def main():
    if '--ancres' in sys.argv: return verifier_ancres()
    seul = sys.argv[1] if len(sys.argv) > 1 else None
    tmp0, a0 = cloner()
    rc, res, _ = banc(a0, '*', '')
    shutil.rmtree(tmp0, ignore_errors=True)
    if rc != 0:
        print('  !! ARBRE SAIN DEJA ROUGE OU PLANTE — controle refuse :', res); return 1
    print('  arbre sain : %s (point de depart valide)\n' % res)
    conformes, total = 0, 0
    depuis = bool(seul and seul.endswith('+'))
    if depuis: seul = seul[:-1]
    actif = not depuis
    for nom, rempl, attendus, sections, blocs, genre in MUT:
        if depuis and nom.startswith(seul + ' '): actif = True
        if seul and not depuis and not any(nom.startswith(x + ' ') for x in seul.split(',')): continue
        if depuis and not actif: continue
        total += 1
        tmp, arbre = cloner()
        print('--- %s   [sections %s%s]' % (nom, sections, (' · blocs ' + blocs) if blocs else ''))
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
        rc, res, rouges = banc(arbre, sections, blocs)
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
