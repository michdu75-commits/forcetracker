#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Controle negatif du dossier « panne Apps Script ».

[!!] Arbre CLONE a chaque fois (BUGS.md §60), et JOURNAL clone aussi.
[!!] Deux mutations CORRIGENT un defaut et doivent faire ROUGIR : le dossier decrit des
     defauts OUVERTS, le publier apres correction ferait chercher ce qui n'existe plus.
"""
import os
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEN = 'tools/gen_s2b_panne_appsscript_pdf.py'
SCRATCH = ('/tmp/claude-0/-home-user-forcetracker/'
           '12f61d67-fd14-50ef-8709-99418240fb44/scratchpad')
LOG = os.path.join(SCRATCH, 'panne_apps_script_1809.log')
SB, W, CJ, HT = 'supabase.js', 'worker.js', 'Code.js', 'index.html'
LG = '@@LOG@@'

MUTATIONS = [
    # ── LA GARDE D'ARCHITECTURE : le coeur du document ─────────────────────────────────
    ('le pont est appele AVANT Supabase (« seul le 1er passage » deviendrait faux)', W,
     "  let e = await _sbAppel(env, 'ft_enregistrer_instantane', { p_hachage: hache, p_data: donnees });",
     "  const _m0 = await _identiteIA(brut, env);\n"
     "  let e = await _sbAppel(env, 'ft_enregistrer_instantane', { p_hachage: hache, p_data: donnees });",
     'ROUGE'),
    ('la voie directe n est plus rendue avant le pont', W,
     "  if (e.ok) return { statut: 200, corps: { status: 'ok', voie: 'directe' } };",
     "  if (e.ok) return { statut: 200, corps: { status: 'ok', voie: 'direct2' } };", 'ROUGE'),
    ('le pont ne vise plus Apps Script', W,
     "    const r = await fetch(APPS_SCRIPT_URL, {\n      method: 'POST',\n"
     "      headers: { 'Content-Type': 'text/plain;charset=utf-8' },\n"
     "      body: JSON.stringify({ action: 'authIdentity', token: String(token || '') }),",
     "    const r = await fetch('https://ailleurs.invalid/', {\n      method: 'POST',\n"
     "      headers: { 'Content-Type': 'text/plain;charset=utf-8' },\n"
     "      body: JSON.stringify({ action: 'authIdentity', token: String(token || '') }),",
     'ROUGE'),
    ('le pont ne rend plus « reseau » quand Apps Script ne repond pas', W,
     "  } catch (e) { return { ok: false, raison: 'reseau' }; }",
     "  } catch (e) { return { ok: false, raison: 'refus' }; }", 'ROUGE'),
    ('le catch d Apps Script change : « refus » n aurait plus la meme origine', CJ,
     "  } catch (err) { return json_({status:'error', error:'auth'}); }",
     "  } catch (err) { return json_({status:'error', error:'auth', raison:'plante'}); }", 'ROUGE'),

    # ── LES DEUX GARDES A L'ENVERS ─────────────────────────────────────────────────────
    ('[a l envers] « reseau » traite a part : le defaut decrit est corrige', SB,
     "    if (r === 'forme')   return { ok:false, voie:'', info:'aucun jeton sur cet appareil' };",
     "    if (r === 'forme')   return { ok:false, voie:'', info:'aucun jeton sur cet appareil' };\n"
     "    if (r === 'reseau')  return { ok:false, voie:'', info:'cloud injoignable' };", 'ROUGE'),
    ('[a l envers] la carte ne promet plus une ecriture', HT,
     'Le bouton écrit une ligne de test <strong>pour de vrai</strong>',
     'Le bouton teste la route <strong>sans rien ecrire</strong>', 'ROUGE'),

    # ── l etat du chantier ─────────────────────────────────────────────────────────────
    ('V2 serait fermee', SB, 'p_email: email', 'p_email: "x"', 'ROUGE'),
    ('la sonde ne pose plus son jeton factice', SB,
     "{ action:'cloudSave', token:SB_SONDE_JETON, data:{sonde:true} }",
     "{ action:'cloudSave', data:{sonde:true} }", 'ROUGE'),

    # ── LE RELEVE ──────────────────────────────────────────────────────────────────────
    ('le journal ne dit plus que le serveur est ROUGE', LG,
     'ROUGE  Le serveur repond           : INJOIGNABLE',
     'VERT   Le serveur repond           : OK', 'ROUGE'),
    ('la sauvegarde de la nuit n est plus verte (la conclusion sur le stockage tombe)', LG,
     'VERT   Sauvegardes automatiques', 'ROUGE  Sauvegardes automatiques', 'ROUGE'),
    ('la sauvegarde du jour n est plus nommee', LG,
     'backup-2026-09-18.json', 'un fichier', 'ROUGE'),
    ('le journal annonce la voie « pont » comme mesurable', LG,
     'voie:pont           : NON MESURABLE tant que le serveur est rouge',
     'voie:pont           : MESUREE', 'ROUGE'),
    ('le journal ne dit plus que les seances locales sont intactes', LG,
     'Seances locales     : INTACTES', 'Seances locales     : inconnues', 'ROUGE'),
    ('un VRAI jeton se glisse dans le journal', LG,
     'Executant     : Michel, PWA Force Tracker sur iPhone, 5G',
     'Executant     : Michel (jeton 9f3ac1d0e5b7248fa6c13e0d9b82577c4e61a0fd3b95c27ea814d60f7b23ce85)',
     'ROUGE'),

    # ── CONTROLES NEGATIFS : doivent rester VERTS ──────────────────────────────────────
    ('[negatif] un COMMENTAIRE de supabase.js cite reseau et identite refusee', SB,
     "const SB_VOIE = 'worker';",
     "// note : « reseau » finit dans « identité refusée » — defaut ouvert du 18/09\n"
     "const SB_VOIE = 'worker';", 'VERT'),
    ('[negatif] un COMMENTAIRE du Worker cite APPS_SCRIPT_URL et les deux voies', W,
     "const _FORME_JETON = /^[0-9a-f]{64}$/;",
     "// rappel : APPS_SCRIPT_URL n'est atteint qu'apres un refus ; voie 'directe' sinon\n"
     "const _FORME_JETON = /^[0-9a-f]{64}$/;", 'VERT'),
]


def main():
    conformes = 0
    for nom, fich, avant, apres, attendu in MUTATIONS:
        tmp = tempfile.mkdtemp(prefix='pan_')
        arbre = os.path.join(tmp, 'a')
        shutil.copytree(ROOT, arbre, ignore=shutil.ignore_patterns(
            '.git', 'node_modules', '*.pdf'))
        journal = os.path.join(tmp, 'panne.log')
        shutil.copyfile(LOG, journal)
        cible = journal if fich == LG else os.path.join(arbre, fich)
        src = open(cible, encoding='utf-8').read()
        if src.count(avant) != 1:
            print('  INVALIDE  %-74s (ancre %s)'
                  % (nom, 'absente' if avant not in src else 'multiple'))
            shutil.rmtree(tmp, ignore_errors=True)
            continue
        neuf = src.replace(avant, apres)
        if neuf == src:
            print('  INVALIDE  %-74s (mutation sans effet)' % nom)
            shutil.rmtree(tmp, ignore_errors=True)
            continue
        open(cible, 'w', encoding='utf-8').write(neuf)
        env = dict(os.environ, FT_ROOT=arbre, FT_LOG=journal,
                   FT_OUT=os.path.join(tmp, 'essai.pdf'))
        r = subprocess.run([sys.executable, os.path.join(arbre, GEN)],
                           capture_output=True, text=True, env=env, cwd=arbre)
        sortie = (r.stdout + r.stderr).strip().split('\n')[-1][:62]
        # [!!] UN PLANTAGE PYTHON N'EST PAS UNE GARDE ROUGE : il ne nomme pas le defaut.
        rouge = r.returncode != 0 and (sortie.startswith('GARDE ROUGE')
                                       or sortie.startswith('POLICE'))
        plante = r.returncode != 0 and not rouge
        obtenu = 'PLANTAGE' if plante else ('ROUGE' if rouge else 'VERT')
        ok = (obtenu == attendu)
        conformes += ok
        print('  %s  %-74s %-8s %s'
              % ('OK ' if ok else '!! ', nom, obtenu, sortie if obtenu != 'VERT' else ''))
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, len(MUTATIONS)))
    return 0 if conformes == len(MUTATIONS) else 1


if __name__ == '__main__':
    sys.exit(main())
