#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTRÔLE NÉGATIF — NUT-SYNC-03 (correctifs A et A2) : le banc tools/banc_nut_sync_envoi.js sait-il ROUGIR ?
Chaque mutation casse UNE protection du correctif, sur une COPIE de l'arbre client (liens vers le dépôt, sauf setup.js, copié et muté) ; le banc doit rougir, et sur le témoin attendu.
Un plantage du banc (pas de ligne de total) n'est JAMAIS compté comme « attrapé ». Une ancre introuvable ou multiple = mutation INVALIDE (jamais silencieuse).
Usage : python3 tools/mut_nut_sync_envoi.py [M1 M4 …]      (sans argument : toutes)"""
import os, re, shutil, subprocess, sys, tempfile
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANC = os.path.join(RACINE, 'tools', 'banc_nut_sync_envoi.js')
# (id, description, ancre exacte dans setup.js, remplacement, scénarios à jouer, préfixes de témoins qui DOIVENT rougir)
MUT = [
  ('M1', 'la garde « un seul envoi actif » est retirée (A)', "if(_syncVol.actif){", "if(false){", 'S03', ['S03']),
  ('M2', 'une demande faite pendant un envoi est JETÉE au lieu d\'être gardée (A)', "{ _syncVol.redemande=true; return; }", "{ return; }", 'S03v,S10', ['S03v', 'S10']),
  ('M3', 'la demande gardée n\'est jamais rejouée à la fin du vol (A)', "if(_syncVol.redemande){ _syncVol.redemande=false; try{ _cloudSyncDebounced(); }catch(e){} }", "if(false){}", 'S03v,S10', ['S03v', 'S10']),
  ('M4', 'la temporisation est neutralisée : un envoi sans réponse bloque la synchro (A)', "const _SYNC_VOL_MAX_MS=180000;", "const _SYNC_VOL_MAX_MS=2000000000;", 'S07,S07c', ['S07']),
  ('M5', 'l\'identifiant de vol n\'est plus comparé : un accusé TARDIF libère la garde de l\'envoi suivant (A)', "if(!_syncVol.actif || _syncVol.id!==id) return;", "if(!_syncVol.actif) return;", 'S07c', ['S07c']),
  ('M6', 'la fin du vol n\'est jamais signalée à la réponse : la garde reste posée jusqu\'à l\'échéance (A)', ".then(function(){ _syncVolFin(_idVol,false); });", ";", 'S01,S03', ['S01', 'S03']),
  ('M7', 'A2 annulée : l\'accusé rappelle `persist()` (donc un envoi complet de plus)', "    if(registre) _ecrireSuppressionsLocal();\n    if(journal){ try{ _ecrireJournalLocal(); }catch(e){} }\n    if(fusion){ try{ _cloudSyncDebounced(); }catch(e){} }",
         "    if(journal){ try{ _journalPersister(); }catch(e){} }\n    else if(registre){ _ecrireSuppressionsLocal(); }", 'S01,S16', ['S01', 'S16']),
  ('M8', 'A2 TROP LARGE : les révisions apprises ne sont plus écrites sur le téléphone', "if(journal){ try{ _ecrireJournalLocal(); }catch(e){} }", "", 'S10', ['S10']),
  ('M9', 'A2 TROP LARGE : la fusion « deux onglets » de persist() est contournée (l\'accusé efface le repas de l\'autre onglet)', "const fusion=_ftAutreOnglet; if(fusion){ _ftAutreOnglet=false; try{ _fusionnerAvecLeDisque(); }catch(e){} }", "const fusion=false;", 'S17', ['S17']),
]

def banc(arbre, scen):
    env = dict(os.environ, FT_ARBRE_CLIENT=arbre)
    p = subprocess.run(['node', BANC, '--only=' + scen], capture_output=True, text=True, timeout=900, env=env, cwd=RACINE)
    s = p.stdout + p.stderr
    total = re.search(r'== NUT-SYNC-03 envois \([^)]*\) : (\d+) OK · (\d+) ROUGE', s)
    rouges = [m.group(1) for m in re.finditer(r'^ROUGE (S\d+[a-z]?\d?) ', s, re.M)]
    return p.returncode, total, rouges, s

def arbre_mute(ancre, remplacement):
    tmp = tempfile.mkdtemp(prefix='mutenvoi_')
    for nom in os.listdir(RACINE):
        if nom in ('.git', 'node_modules', 'clone', 'setup.js'): continue
        os.symlink(os.path.join(RACINE, nom), os.path.join(tmp, nom))
    t = open(os.path.join(RACINE, 'setup.js'), encoding='utf-8').read()
    if t.count(ancre) != 1: shutil.rmtree(tmp); return None, t.count(ancre)
    open(os.path.join(tmp, 'setup.js'), 'w', encoding='utf-8').write(t.replace(ancre, remplacement))
    if subprocess.run(['node', '-e', "const fs=require('fs');new Function(fs.readFileSync(process.argv[1],'utf8'))", os.path.join(tmp, 'setup.js')], capture_output=True).returncode != 0:
        shutil.rmtree(tmp); return None, -1
    return tmp, 1

choisies = [a for a in sys.argv[1:]] or [m[0] for m in MUT]
attrapees = 0; jouees = 0
for ident, desc, ancre, rempl, scen, attendus in MUT:
    if ident not in choisies: continue
    jouees += 1
    d, n = arbre_mute(ancre, rempl)
    if d is None:
        print('  INVALIDE %s — ancre trouvée %d fois (ou syntaxe cassée)' % (ident, n)); continue
    code, total, rouges, s = banc(d, scen); shutil.rmtree(d)
    if not total:
        print('  KO   %s — PLANTAGE du banc (ne compte pas comme attrapé) :\n%s' % (ident, s[-600:])); continue
    bon = all(any(r == a or r.startswith(a) for r in rouges) for a in attendus)
    attrapees += bon
    print('  %s %s — %s rouge(s) : %s ; attendus : %s' % ('OK  ' if bon else 'KO  ', ident + ' ' + desc, total.group(2), ', '.join(sorted(set(rouges))) or 'aucun', ', '.join(attendus)))
print('\n──── %d mutation(s) sur %d attrapée(s) par le banc ────' % (jouees, attrapees))
sys.exit(0 if attrapees == jouees else 1)
