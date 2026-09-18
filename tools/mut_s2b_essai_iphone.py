#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Controle negatif du dossier « essai iPhone reel ».

[!!] Arbre CLONE a chaque fois (BUGS.md §60), et JOURNAL clone aussi.

[!!] ⭐⭐ CE FICHIER CONTIENT DES MUTATIONS D'UN GENRE INHABITUEL : elles CORRIGENT le defaut
     au lieu de le casser, et le generateur doit ROUGIR quand meme. C'est le miroir des
     gardes ordinaires — le dossier decrit un defaut OUVERT, donc le publier apres correction
     ferait chercher quelque chose qui n'existe plus.
"""
import os
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEN = 'tools/gen_s2b_essai_iphone_pdf.py'
SCRATCH = ('/tmp/claude-0/-home-user-forcetracker/'
           '12f61d67-fd14-50ef-8709-99418240fb44/scratchpad')
LOG = os.path.join(SCRATCH, 'essai_iphone_1222.log')

SB, W, CO, HT = 'supabase.js', 'worker.js', 'constants.js', 'index.html'
LG = '@@LOG@@'

MUTATIONS = [
    # ── ⭐⭐ LES MUTATIONS QUI CORRIGENT : le dossier devient perime, il doit REFUSER ──────
    ('[a l envers] « reseau » est traite a part : le defaut decrit est corrige', SB,
     "    if (r === 'forme')   return { ok:false, voie:'', info:'aucun jeton sur cet appareil' };",
     "    if (r === 'forme')   return { ok:false, voie:'', info:'aucun jeton sur cet appareil' };\n"
     "    if (r === 'reseau')  return { ok:false, voie:'', info:'cloud injoignable' };", 'ROUGE'),
    ('[a l envers] le fourre-tout « identite refusee » disparait', SB,
     "    return { ok:false, voie:'', info:'identité refusée (' + r + ')' };",
     "    return { ok:false, voie:'', info:'refus (' + r + ')' };", 'ROUGE'),
    ('[a l envers] le texte de la carte cesse de promettre une ecriture', HT,
     'Le bouton écrit une ligne de test <strong>pour de vrai</strong>',
     'Le bouton teste la route <strong>sans rien ecrire</strong>', 'ROUGE'),

    # ── la chaine qui produit le mot observe ────────────────────────────────────────────
    ('le pont ne rend plus « reseau » quand il n atteint pas Apps Script', W,
     "  } catch (e) { return { ok: false, raison: 'reseau' }; }",
     "  } catch (e) { return { ok: false, raison: 'refus' }; }", 'ROUGE'),
    ('la route ne relaie plus la raison du pont', W,
     "return { statut: 401, corps: { status: 'error', error: 'auth', raison: moi.raison } };",
     "return { statut: 401, corps: { status: 'error', error: 'auth' } };", 'ROUGE'),

    # ── les verrous qui doivent rester ──────────────────────────────────────────────────
    ('la sonde ne pose plus son jeton factice', SB,
     "{ action:'cloudSave', token:SB_SONDE_JETON, data:{sonde:true} }",
     "{ action:'cloudSave', data:{sonde:true} }", 'ROUGE'),
    ('l injecteur ecrase desormais un jeton deja pose', CO,
     '&& !o.token){', '){', 'ROUGE'),
    ('la porte lit le jeton elle-meme (R2 rompu)', SB,
     "    const donnees=_sbSansJustificatifs(payload);",
     "    const donnees=_sbSansJustificatifs(payload); try{ donnees.t=_ftToken(); }catch(e){}",
     'ROUGE'),
    ('V2 serait fermee', SB, 'p_email: email', 'p_email: "x"', 'ROUGE'),
    ('la voie par defaut redevient l ancienne', SB,
     "const SB_VOIE = 'worker';", "const SB_VOIE = 'direct';", 'ROUGE'),
    ('la branche 503 disparait', SB,
     "  if (statut === 503) return { ok:false, voie:'', info:'cloud indisponible (' + ((d && d.raison) || '?') + ')' };",
     '  // retire', 'ROUGE'),

    # ── LE RELEVE : il est une entree de la garde, pas un souvenir ──────────────────────
    ('le journal annonce la voie « pont » comme deja observee', LG,
     'voie:pont     : PAS ENCORE OBSERVEE', 'voie:pont     : OBSERVEE', 'ROUGE'),
    ('le journal annonce la voie « directe » comme deja observee', LG,
     'voie:directe  : PAS ENCORE OBSERVEE', 'voie:directe  : OBSERVEE', 'ROUGE'),
    ('l horodatage de l echec disparait du journal', LG,
     'identite refusee (reseau)) : 18/09/2026 13:40:24',
     'identite refusee (reseau)) : hier', 'ROUGE'),
    ('le journal ne dit plus que le jeton est present', LG,
     'jeton present sur cet appareil', 'jeton inconnu', 'ROUGE'),
    ('un VRAI jeton se glisse dans le journal', LG,
     'Jeton S1      : PRESENT sur l\'appareil',
     'Jeton S1      : 9f3ac1d0e5b7248fa6c13e0d9b82577c4e61a0fd3b95c27ea814d60f7b23ce85', 'ROUGE'),

    # ── CONTROLES NEGATIFS : doivent rester VERTS ───────────────────────────────────────
    ('[negatif] un COMMENTAIRE de supabase.js cite reseau et identite refusee', SB,
     "const SB_VOIE = 'worker';",
     "// note : ici « reseau » finit dans « identité refusée », et c est le defaut a corriger\n"
     "const SB_VOIE = 'worker';", 'VERT'),
    ('[negatif] un COMMENTAIRE du Worker cite le fourre-tout', W,
     "const _FORME_JETON = /^[0-9a-f]{64}$/;",
     "// rappel : raison 'reseau' remonte en 401 et le client le dit mal (dossier du 18/09)\n"
     "const _FORME_JETON = /^[0-9a-f]{64}$/;", 'VERT'),
]


def main():
    conformes = 0
    for nom, fich, avant, apres, attendu in MUTATIONS:
        tmp = tempfile.mkdtemp(prefix='iph_')
        arbre = os.path.join(tmp, 'a')
        shutil.copytree(ROOT, arbre, ignore=shutil.ignore_patterns(
            '.git', 'node_modules', '*.pdf'))
        journal = os.path.join(tmp, 'essai.log')
        shutil.copyfile(LOG, journal)

        cible = journal if fich == LG else os.path.join(arbre, fich)
        src = open(cible, encoding='utf-8').read()
        if src.count(avant) != 1:
            print('  INVALIDE  %-72s (ancre %s)'
                  % (nom, 'absente' if avant not in src else 'multiple'))
            shutil.rmtree(tmp, ignore_errors=True)
            continue
        neuf = src.replace(avant, apres)
        if neuf == src:
            print('  INVALIDE  %-72s (mutation sans effet)' % nom)
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
        print('  %s  %-72s %-8s %s'
              % ('OK ' if ok else '!! ', nom, obtenu, sortie if obtenu != 'VERT' else ''))
        shutil.rmtree(tmp, ignore_errors=True)

    print('\n%d/%d conformes' % (conformes, len(MUTATIONS)))
    return 0 if conformes == len(MUTATIONS) else 1


if __name__ == '__main__':
    sys.exit(main())
