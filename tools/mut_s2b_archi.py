#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Controle negatif du dossier S2-B (architecture). Mutations sur un arbre CLONE.

[!!] BUGS.md section 60 : on ne mute JAMAIS l'arbre servi. Chaque mutation est appliquee
     sur une copie, le generateur y est relance, et on verifie qu'il ROUGIT - ou qu'il
     reste VERT pour les controles negatifs nommes par Michel (« on mesure le programme,
     pas le texte »).

[!!] Les mutations du DOCUMENT sont bornees entre @@DEBUT@@ et @@FIN@@ : sans cette borne,
     une mutation reecrirait la GARDE en meme temps que le texte, et se prouverait
     elle-meme.
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEN = 'tools/gen_s2b_archi_pdf.py'

# (nom, fichier, avant, apres, attendu)  attendu : 'ROUGE' ou 'VERT'
MUTATIONS = [
    # ── le code servi ────────────────────────────────────────────────────────────────
    ('V2 refermee dans le client', 'supabase.js',
     'p_email: email', 'p_email: "x"', 'ROUGE'),
    ('le bouton de test n ecrit plus une adresse arbitraire', 'supabase.js',
     "p_email:'test@forcetracker.test'", 'p_email: email', 'ROUGE'),
    ('le filet perd un nom de cle', 'supabase.js',
     "'authorization'", "'x','authorization'", 'ROUGE'),
    ('le client atteint la table en direct', 'supabase.js',
     "'/rest/v1/rpc/'", "'/rest/v1/table/'", 'ROUGE'),
    ('un secret privilegie entre dans du CODE servi', 'supabase.js',
     "const SB_TABLE = 'ft_comptes';",
     "const SB_TABLE = 'ft_comptes'; const K='service_role';", 'ROUGE'),
    ('S2-A perdu : le jeton revient dans le corps metier', 'setup.js',
     'leftHand:S.leftHand||false', 'leftHand:S.leftHand||false,token:_ftToken()', 'ROUGE'),
    ('les justificatifs ne sont plus sur le transport Apps Script', 'setup.js',
     'authCode:_authCode(), token:_ftToken()', 'x:1', 'ROUGE'),
    ('le miroir ne recoit plus le corps commun', 'setup.js',
     'sbMirror(_corpsSync)', 'sbMirror({})', 'ROUGE'),
    ('la cle du registre S1 n est plus le hachage', 'Code.js',
     '_JET_PREFIXE_ + _sha256hex_(brut)', '_JET_PREFIXE_ + brut', 'ROUGE'),
    ('le registre ne stocke plus la date de creation', 'Code.js',
     "c: new Date().toISOString().slice(0, 10), r: 0", "r: 0", 'ROUGE'),
    ('la revocation supprime au lieu de marquer', 'Code.js',
     'var o = JSON.parse(raw); o.r = 1;', 'sp.deleteProperty(cle);', 'ROUGE'),
    ('la transition S1 est refermee', 'Code.js',
     'var _MIG_FERME_ = false', 'var _MIG_FERME_ = true', 'ROUGE'),
    ('le pont du Worker n est plus fail-closed', 'worker.js',
     "return { ok: false, raison: 'reseau' };", 'return { ok: true, email: body.email };',
     'ROUGE'),
    ('le filtre d origine du Worker disparait', 'worker.js',
     "if (_origin !== ALLOWED_ORIGIN) {", 'if (false) {', 'ROUGE'),
    ('le Worker est deja sur le chemin Supabase', 'worker.js',
     "const _ACTIONS_IA", "const SB='supabase';\nconst _ACTIONS_IA", 'ROUGE'),
    # [!!] ON RETIRE l'action, on ne la RENOMME pas : un renommage laisse le compte a 14,
    #      et « 14 actions IA » reste alors une phrase vraie. La premiere version de cette
    #      mutation etait faible, pas la garde.
    ('le Worker perd une action IA', 'worker.js',
     "'generateMealPlan'", "", 'ROUGE'),
    ('le relais attrape-tout disparait', 'worker.js',
     'body: raw,', 'body: JSON.stringify({}),', 'ROUGE'),
    ('l injecteur de jeton disparait', 'constants.js',
     '_ftPoserInjecteurJeton', '_ftPoserInjecteurJetonZ', 'ROUGE'),
    ('l injecteur n est plus borne a l URL du Worker', 'constants.js',
     'url.indexOf(AI_PROXY_URL)===0', 'true', 'ROUGE'),

    # ── le document lui-meme ─────────────────────────────────────────────────────────
    ('@@DOC@@ le document annonce que V2 est fermee', GEN,
     'H.append(P(\'14. Retour arriere\', \'h1\'))',
     "H.append(P('V2 est fermee.', 'p'))\nH.append(P('14. Retour arriere', 'h1'))", 'ROUGE'),
    ('@@DOC@@ le document annonce le schema versionne', GEN,
     'H.append(P(\'15. Risques\', \'h1\'))',
     "H.append(P('Le schema est versionne.', 'p'))\n"
     "H.append(P('15. Risques', 'h1'))", 'ROUGE'),
    ('@@DOC@@ le document annonce que l option B est disponible', GEN,
     "H.append(P('5. Pont Apps Script contre registre Supabase', 'h1'))",
     "H.append(P('L option B est disponible.', 'p'))\n"
     "H.append(P('5. Pont Apps Script contre registre Supabase', 'h1'))", 'ROUGE'),
    ('@@DOC@@ Q14 repond OUI aujourd hui', GEN,
     "    ('Q14', 'V2 est-elle fermee de bout en bout ?',\n     NON, NON,",
     "    ('Q14', 'V2 est-elle fermee de bout en bout ?',\n     OUI, NON,", 'ROUGE'),
    ('@@DOC@@ Q12 n est plus PARTIEL', GEN,
     "     NON, PART, 'aujourd hui les deux chemins",
     "     NON, NON, 'aujourd hui les deux chemins", 'ROUGE'),
    ('@@DOC@@ Q5 pretend l identite deja resolue serveur', GEN,
     "    ('Q5', 'l identite est-elle resolue cote serveur ?',\n     NON, OUI,",
     "    ('Q5', 'l identite est-elle resolue cote serveur ?',\n     OUI, OUI,", 'ROUGE'),
    ('@@DOC@@ une question disparait', GEN,
     "    ('Q15', 'le schema est-il versionne dans le depot ?',\n     NON, OUI,",
     "    ('QX', 'le schema est-il versionne dans le depot ?',\n     NON, OUI,", 'ROUGE'),
    # [!!] LA MUTATION DOIT PRODUIRE DU PYTHON VALIDE. Ma premiere version cassait une
    #      chaine : le generateur ne demarrait meme pas, et un plantage n'est PAS une garde
    #      qui mord. *Une passe interrompue ressemble trait pour trait a une passe rouge.*
    ('@@DOC@@ le document propose une suppression de fonction', GEN,
     '    "revoke all on function public.ft_enregistrer_instantane(text, jsonb)\\n"',
     '    "drop function public.ft_miroir(text, jsonb);\\n"\n'
     '    "revoke all on function public.ft_enregistrer_instantane(text, jsonb)\\n"',
     'ROUGE'),
    ('@@DOC@@ la raison du message de refus unique disparait', GEN,
     'devient un oracle qui apprend', 'devient une reponse qui apprend', 'ROUGE'),
    ('@@DOC@@ la marque « a verifier » disparait de la ligne de l option B', GEN,
     "AVER + ' - depend de ce que le projet offre reellement, voir section 18'",
     "OUI + ' - depend de ce que le projet offre reellement, voir section 18'", 'ROUGE'),
    ('@@DOC@@ la panne a 102 % disparait de l argument d independance', GEN,
     'plein a 102 % le 29/07/2026', 'plein le 29/07/2026', 'ROUGE'),
    ('@@DOC@@ la garde SQL est dite supprimee au lieu de retournee', GEN,
     "'(R30). <i>Une garde qu on efface", "'(sans regle). <i>Une garde qu on efface",
     'ROUGE'),
    ('@@DOC@@ le document affirme que la fonction bornee reduit le rayon du secret', GEN,
     'H.append(P(\'5. Pont Apps Script contre registre Supabase\', \'h1\'))',
     "H.append(P('Le rayon d explosion est reduit par la fonction.', 'p'))\n"
     "H.append(P('5. Pont Apps Script contre registre Supabase', 'h1'))", 'ROUGE'),
    ('@@DOC@@ le document affirme une exploitation mesuree', GEN,
     "H.append(P('15. Risques', 'h1'))",
     "H.append(P('Une exploitation a ete mesuree.', 'p'))\n"
     "H.append(P('15. Risques', 'h1'))", 'ROUGE'),

    # ── CONTROLES NEGATIFS : doivent rester VERTS ────────────────────────────────────
    ('[negatif] service_role nomme dans un COMMENTAIRE de securite', 'setup.js',
     'function _cloudSync(){',
     '// rappel securite : ne jamais poser service_role ici\nfunction _cloudSync(){',
     'VERT'),
    ('[negatif] ft_miroir et p_email nommes dans un COMMENTAIRE', 'supabase.js',
     'function sbMirror(payload){',
     '// documentation : ft_miroir(p_email, p_data) est l ancienne porte\n'
     'function sbMirror(payload){', 'VERT'),
    ('[negatif] une adresse employee pour l AFFICHAGE', 'supabase.js',
     'function sbEtat(){', 'function sbAffiche(e){ return "compte : "+e; }\n'
     'function sbEtat(){', 'VERT'),
    ('[negatif] le mot service_role dans un commentaire du GENERATEUR', GEN,
     '# ── 10. ce que la mesure du 17/09',
     '# note : service_role est le secret large, voir section 4\n'
     '# ── 10. ce que la mesure du 17/09', 'VERT'),
]


def borne_doc(src, avant, apres):
    d = src.find('# @@DEBUT@@')
    f = src.find('# @@FIN@@')
    if d < 0 or f < 0:
        return None
    zone = src[d:f]
    if zone.count(avant) != 1:
        return None
    return src[:d] + zone.replace(avant, apres) + src[f:]


def main():
    rouges = conformes = 0
    for nom, fich, avant, apres, attendu in MUTATIONS:
        tmp = tempfile.mkdtemp(prefix='s2b_')
        arbre = os.path.join(tmp, 'a')
        shutil.copytree(ROOT, arbre, ignore=shutil.ignore_patterns(
            '.git', 'node_modules', '*.pdf'))
        cible = os.path.join(arbre, fich)
        src = open(cible, encoding='utf-8').read()
        if nom.startswith('@@DOC@@'):
            neuf = borne_doc(src, avant, apres)
            if neuf is None:
                print('  INVALIDE  %-62s (ancre absente ou multiple dans la zone)' % nom)
                shutil.rmtree(tmp, ignore_errors=True)
                continue
        else:
            if src.count(avant) < 1:
                print('  INVALIDE  %-62s (ancre absente)' % nom)
                shutil.rmtree(tmp, ignore_errors=True)
                continue
            neuf = src.replace(avant, apres)
        if neuf == src:
            print('  INVALIDE  %-62s (mutation sans effet)' % nom)
            shutil.rmtree(tmp, ignore_errors=True)
            continue
        open(cible, 'w', encoding='utf-8').write(neuf)
        env = dict(os.environ, FT_ROOT=arbre,
                   FT_OUT=os.path.join(tmp, 'x.pdf'))
        r = subprocess.run([sys.executable, os.path.join(arbre, GEN)],
                           capture_output=True, text=True, env=env, cwd=arbre)
        obtenu = 'ROUGE' if r.returncode != 0 else 'VERT'
        ok = (obtenu == attendu)
        conformes += ok
        rouges += (obtenu == 'ROUGE')
        raison = ''
        if obtenu == 'ROUGE':
            raison = (r.stdout + r.stderr).strip().split('\n')[-1][:88]
        print('  %s  %-62s %s  %s' % ('OK ' if ok else '!! ', nom, obtenu, raison))
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes (%d rouges)' % (conformes, len(MUTATIONS), rouges))
    return 0 if conformes == len(MUTATIONS) else 1


if __name__ == '__main__':
    sys.exit(main())
