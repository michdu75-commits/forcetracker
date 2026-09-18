#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Controle negatif de la bascule S2-B phase 4.

[!!] Arbre CLONE a chaque fois (BUGS.md §60). On casse une garantie, on relance le banc, et
     on verifie qu'il ROUGIT — ou qu'il reste VERT pour les controles negatifs nommes :
     « on mesure le programme, pas le texte ».
"""
import os
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANC = 'tools/banc_s2b_bascule.js'
SB, SET, APP, CO = 'supabase.js', 'setup.js', 'app.js', 'constants.js'

MUTATIONS = [
    # ── la bascule elle-meme ────────────────────────────────────────────────────────────
    ('le client retourne a l ancienne porte', SET,
     'sbEnvoyer(_corpsSync)', 'sbMirror(_corpsSync)', 'ROUGE'),
    ('la voie par defaut redevient l ancienne', SB,
     "const SB_VOIE = 'worker';", "const SB_VOIE = 'direct';", 'ROUGE'),
    ('l ancienne porte est SUPPRIMEE (plus de retour arriere, R30)', SB,
     'function sbMirror(payload){', 'function sbMirrorRetire(payload){', 'ROUGE'),

    # ── LA LIGNE LA PLUS DANGEREUSE : la sonde Admin ────────────────────────────────────
    # [!!] Sans son jeton factice, l injecteur pose le VRAI jeton : la sonde devient une
    #      vraie sauvegarde et ecrase l instantane de la personne par {sonde:true}.
    ('la sonde ne pose plus son jeton factice (l injecteur mettrait le VRAI)', SB,
     "{ action:'cloudSave', token:SB_SONDE_JETON, data:{sonde:true} }",
     "{ action:'cloudSave', data:{sonde:true} }", 'ROUGE'),
    ('l injecteur ecrase desormais un jeton deja pose', CO,
     '&& !o.token){', '){', 'ROUGE'),
    ('un 200 sur jeton factice est presente comme un succes', SB,
     "      return {ok:false, texte:'❌ HTTP 200 sur un jeton factice : la route a ACCEPTÉ une identité '\n"
     "                              +'inconnue. À traiter immédiatement.'};",
     "      return {ok:true, texte:'✅ HTTP 200'};", 'ROUGE'),

    # ── ce qui ne doit jamais sortir ────────────────────────────────────────────────────
    ('le filet des justificatifs saute sur la nouvelle porte', SB,
     'const donnees=_sbSansJustificatifs(payload);', 'const donnees=payload;', 'ROUGE'),
    ('une adresse redevient un selecteur d identite', SB,
     "body:JSON.stringify({ action:'cloudSave', data:donnees })",
     "body:JSON.stringify({ action:'cloudSave', p_email:(payload&&payload.email)||'', data:donnees })",
     'ROUGE'),
    ('la porte lit le jeton elle-meme et le glisse dans la donnee', SB,
     '    if(!donnees || typeof donnees!==\'object\')return;',
     "    if(!donnees || typeof donnees!=='object')return;\n"
     "    try{ donnees.token=_ftToken(); }catch(e){}", 'ROUGE'),
    ('la nouvelle porte journalise ce qu elle envoie', SB,
     '    fetch(AI_PROXY_URL,{method:\'POST\',',
     "    console.log('miroir', donnees);\n    fetch(AI_PROXY_URL,{method:'POST',", 'ROUGE'),
    ('l etat affiche le jeton au lieu d un oui/non', SB,
     "' · jeton présent sur cet appareil'",
     "' · jeton '+_ftToken()", 'ROUGE'),
    ('un en-tete Content-Type revient (requete prealable a chaque sauvegarde)', SB,
     "    fetch(AI_PROXY_URL,{method:'POST',\n      body:JSON.stringify({ action:'cloudSave', data:donnees })",
     "    fetch(AI_PROXY_URL,{method:'POST',headers:{'Content-Type':'application/json'},\n"
     "      body:JSON.stringify({ action:'cloudSave', data:donnees })", 'ROUGE'),

    # ── V2 ne doit pas se rouvrir par une porte derobee ─────────────────────────────────
    ('un repli silencieux vers l ancienne voie quand il n y a pas de jeton', SB,
     "    if(typeof AI_PROXY_URL!=='string' || !AI_PROXY_URL)return;",
     "    if(typeof AI_PROXY_URL!=='string' || !AI_PROXY_URL)return;\n"
     "    try{ if(!_ftToken()) return sbMirror(payload); }catch(e){}", 'ROUGE'),

    # ── panne contre revocation ─────────────────────────────────────────────────────────
    ('une panne du cloud est annoncee comme une revocation', SB,
     "  if (statut === 503) return { ok:false, voie:'', info:'cloud indisponible (' + ((d && d.raison) || '?') + ')' };",
     "  if (statut === 503) return { ok:false, voie:'', info:'appareil révoqué' };", 'ROUGE'),
    ('une revocation reelle passe pour un succes', SB,
     "    if (r === 'revoque') return { ok:false, voie:'', info:'appareil révoqué — écriture refusée' };",
     "    if (r === 'revoque') return { ok:true, voie:'', info:'écrit' };", 'ROUGE'),
    ('un succes est reconnu sur le seul code HTTP', SB,
     "  if (statut === 200 && d && d.status === 'ok')",
     '  if (statut === 200)', 'ROUGE'),
    ('une panne reseau est annoncee comme une revocation', SB,
     "      _sbNoter({ok:false, voie:'', info:'réseau'});",
     "      _sbNoter({ok:false, voie:'', info:'appareil révoqué'});", 'ROUGE'),

    # ── la carte Admin ne doit plus reveiller l ancienne voie ───────────────────────────
    ('la carte Admin redeclenche l ancien RPC a l ouverture', APP,
     '  const r=await sbTestVoie();', '  const r=await sbTest();', 'ROUGE'),

    # ── le mode demo ────────────────────────────────────────────────────────────────────
    ('le mode demo n empeche plus l ecriture', SB,
     "    if(typeof window!=='undefined' && window._demoMode)return;   // mode démo : aucune écriture",
     '    // retire', 'ROUGE'),

    # ── V2 EST OUVERTE, et le temoin doit le dire dans les deux sens ────────────────────
    ('V2 serait fermee : l ancienne porte n envoie plus d adresse', SB,
     'body: JSON.stringify({ p_email: email, p_data: payload })',
     'body: JSON.stringify({ p_data: payload })', 'ROUGE'),

    # ── CONTROLES NEGATIFS : doivent rester VERTS ───────────────────────────────────────
    ('[negatif] un COMMENTAIRE de supabase.js cite sbMirror, p_email et le jeton', SB,
     "const SB_VOIE = 'worker';",
     "// rappel : sbMirror et son p_email restent la, et _ftToken() n est pas lu ici\n"
     "const SB_VOIE = 'worker';", 'VERT'),
    ('[negatif] un COMMENTAIRE de setup.js cite sbMirror(_corpsSync)', SET,
     '  try{ if(typeof sbEnvoyer===\'function\')sbEnvoyer(_corpsSync); }catch(e){}',
     "  // avant la bascule : sbMirror(_corpsSync) — conserve ici pour memoire\n"
     "  try{ if(typeof sbEnvoyer==='function')sbEnvoyer(_corpsSync); }catch(e){}", 'VERT'),
]


def main():
    conformes = 0
    for nom, fich, avant, apres, attendu in MUTATIONS:
        tmp = tempfile.mkdtemp(prefix='b2b_')
        arbre = os.path.join(tmp, 'a')
        shutil.copytree(ROOT, arbre, ignore=shutil.ignore_patterns(
            '.git', 'node_modules', '*.pdf'))
        cible = os.path.join(arbre, fich)
        src = open(cible, encoding='utf-8').read()
        if src.count(avant) != 1:
            print('  INVALIDE  %-70s (ancre %s)'
                  % (nom, 'absente' if avant not in src else 'multiple'))
            shutil.rmtree(tmp, ignore_errors=True)
            continue
        neuf = src.replace(avant, apres)
        if neuf == src:
            print('  INVALIDE  %-70s (mutation sans effet)' % nom)
            shutil.rmtree(tmp, ignore_errors=True)
            continue
        open(cible, 'w', encoding='utf-8').write(neuf)

        r = subprocess.run(['node', os.path.join(arbre, BANC)],
                           capture_output=True, text=True, cwd=arbre)
        sortie = r.stdout + r.stderr
        # [!!] UN PLANTAGE N'EST PAS UNE GARDE ROUGE : il ne nomme pas le defaut, et une passe
        #      interrompue ressemble trait pour trait a une passe verte.
        plante = 'CRASH :' in sortie
        obtenu = 'PLANTAGE' if plante else ('ROUGE' if r.returncode else 'VERT')
        ok = (obtenu == attendu)
        conformes += ok
        rouges = [l.split('rouge : ')[1].strip()[:40]
                  for l in sortie.split('\n') if l.strip().startswith('rouge : ')]
        print('  %s  %-70s %-8s %s'
              % ('OK ' if ok else '!! ', nom, obtenu, ' · '.join(rouges[:3])))
        shutil.rmtree(tmp, ignore_errors=True)

    print('\n%d/%d conformes' % (conformes, len(MUTATIONS)))
    return 0 if conformes == len(MUTATIONS) else 1


if __name__ == '__main__':
    sys.exit(main())
