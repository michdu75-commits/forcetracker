#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Controle negatif de la route de sauvegarde du Worker (S2-B phase 3).

[!!] Arbre CLONE a chaque fois (BUGS.md §60). On casse une garantie, on relance le banc, et
     on verifie qu'il ROUGIT — ou qu'il reste VERT pour les controles negatifs nommes par
     Michel (« on mesure le programme, pas le texte »).
"""
import os
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W = 'worker.js'
BANC = 'tools/banc_s2b_worker.js'

MUTATIONS = [
    # ── l'identite ───────────────────────────────────────────────────────────────────
    ('l adresse de la charge utile redevient l identite', W,
     'p_compte: moi.email', "p_compte: String((body && body.data && body.data.email) || '')",
     'ROUGE'),
    # [!!] REMPLACEMENT GLOBAL ASSUME : l'expression apparait DEUX fois (les deux tentatives
    #      d'ecriture). Ma premiere version visait une ancre unique et s'annoncait INVALIDE —
    #      ce qui est le bon comportement : *une mutation qui ne s'applique pas ressemble
    #      trait pour trait a une mutation qui ne mord pas.*
    ('@@ALL@@ le jeton BRUT part vers Supabase', W,
     '{ p_hachage: hache, p_data: donnees }', '{ p_hachage: brut, p_data: donnees }', 'ROUGE'),
    ('la forme du jeton n est plus controlee', W,
     'if (!_FORME_JETON.test(brut)) {', 'if (false) {', 'ROUGE'),
    ('un refus du pont laisse passer quand meme', W,
     "  if (!moi.ok) {\n    return { statut: 401, corps: { status: 'error', error: 'auth', raison: moi.raison } };\n  }",
     '  if (!moi.ok) { moi.email = "inconnu.test"; }', 'ROUGE'),
    ('le pont est appele AVANT d essayer Supabase', W,
     "  const hache = await _hacher(brut);",
     "  const hache = await _hacher(brut);\n  await _identiteIA(brut, env);", 'ROUGE'),

    # ── la revocation ────────────────────────────────────────────────────────────────
    ('une seconde ecriture refusee est presentee comme une panne', W,
     "  if (e.raison === 'refus') {\n    return { statut: 401, corps: { status: 'error', error: 'auth', raison: 'revoque' } };\n  }",
     '  // retire', 'ROUGE'),

    # ── panne contre refus : la correction trouvee par le banc de comportement ───────
    ('une panne 5xx redevient un refus d identite', W,
     "raison: r.ok ? '' : (r.status >= 500 ? 'panne' : 'refus') };",
     "raison: r.ok ? '' : 'refus' };", 'ROUGE'),
    ('une configuration absente ouvre la porte au lieu de la fermer', W,
     "if (!base || !cle) return { ok: false, statut: 0, raison: 'config' };",
     "if (!base || !cle) return { ok: true, statut: 200, raison: '' };", 'ROUGE'),

    # ── la position de la route : le piege du relais attrape-tout ────────────────────
    ('la route est deplacee APRES le bloc des actions IA', W,
     "    if (body.action === 'cloudSave') {\n      const r = await cloudSave(body, env);\n"
     "      return json(r.corps, r.statut);\n    }\n",
     '', 'ROUGE'),

    # ── ce qui ne doit pas fuiter ────────────────────────────────────────────────────
    ('le corps d erreur de Supabase est renvoye au client', W,
     "    return { ok: r.ok, statut: r.status,",
     "    if (!r.ok) { const d = await r.text(); return { ok: false, statut: r.status, raison: d }; }\n"
     "    return { ok: r.ok, statut: r.status,", 'ROUGE'),
    ('la route journalise le jeton', W,
     '  const hache = await _hacher(brut);',
     '  console.log("jeton", brut);\n  const hache = await _hacher(brut);', 'ROUGE'),
    ('la cle serveur est ecrite en dur', W,
     "  const cle = String((env && env.SUPABASE_SECRET) || '');",
     "  const cle = 'sb_secret_en_dur';", 'ROUGE'),

    # ── non-regression de l'existant ────────────────────────────────────────────────
    ('cloudSave devient une action IA (et userait le quota de Milo)', W,
     "const _ACTIONS_IA = new Set(['importBodyScan'",
     "const _ACTIONS_IA = new Set(['cloudSave','importBodyScan'", 'ROUGE'),
    ('le filtre d origine disparait', W,
     'if (_origin !== ALLOWED_ORIGIN) {', 'if (false) {', 'ROUGE'),
    ('le pont d identite des appels IA n est plus fail-closed', W,
     "  } catch (e) { return { ok: false, raison: 'reseau' }; }",
     '  } catch (e) { return { ok: true, email: String(body.email || "") }; }', 'ROUGE'),
    ('le relais attrape-tout disparait', W, '        body: raw,', '        body: "{}",', 'ROUGE'),
    ('V2 est declaree fermee alors que le client envoie encore une adresse', 'supabase.js',
     'p_email: email', 'p_email: "x"', 'ROUGE'),

    # ── CONTROLES NEGATIFS : doivent rester VERTS ────────────────────────────────────
    ('[negatif] p_email et service_role nommes dans un COMMENTAIRE', W,
     'const _FORME_JETON = /^[0-9a-f]{64}$/;',
     '// rappel : plus aucun p_email, et jamais de service_role dans le client\n'
     'const _FORME_JETON = /^[0-9a-f]{64}$/;', 'VERT'),
    ('[negatif] un commentaire cite console.log et le jeton brut', W,
     '  const hache = await _hacher(brut);',
     '  // on ne fait jamais console.log(brut) ici\n  const hache = await _hacher(brut);',
     'VERT'),
]


def main():
    conformes = 0
    for nom, fich, avant, apres, attendu in MUTATIONS:
        tmp = tempfile.mkdtemp(prefix='w2b_')
        arbre = os.path.join(tmp, 'a')
        shutil.copytree(ROOT, arbre, ignore=shutil.ignore_patterns(
            '.git', 'node_modules', '*.pdf'))
        cible = os.path.join(arbre, fich)
        src = open(cible, encoding='utf-8').read()
        tous = nom.startswith('@@ALL@@')
        if (src.count(avant) != 1) if not tous else (src.count(avant) < 1):
            print('  INVALIDE  %-64s (ancre %s)'
                  % (nom, 'absente' if avant not in src else 'multiple'))
            shutil.rmtree(tmp, ignore_errors=True)
            continue
        neuf = src.replace(avant, apres)
        if neuf == src:
            print('  INVALIDE  %-64s (mutation sans effet)' % nom)
            shutil.rmtree(tmp, ignore_errors=True)
            continue
        open(cible, 'w', encoding='utf-8').write(neuf)

        r = subprocess.run(['node', os.path.join(arbre, BANC)],
                           capture_output=True, text=True, cwd=arbre)
        obtenu = 'ROUGE' if r.returncode != 0 else 'VERT'
        ok = (obtenu == attendu)
        conformes += ok
        rouges = [l.split('!!')[1].strip().split('  ')[0][:34]
                  for l in (r.stdout + r.stderr).split('\n') if l.strip().startswith('!!')]
        print('  %s  %-64s %s  %s'
              % ('OK ' if ok else '!! ', nom, obtenu, ' · '.join(rouges[:3])))
        shutil.rmtree(tmp, ignore_errors=True)

    print('\n%d/%d conformes' % (conformes, len(MUTATIONS)))
    return 0 if conformes == len(MUTATIONS) else 1


if __name__ == '__main__':
    sys.exit(main())
