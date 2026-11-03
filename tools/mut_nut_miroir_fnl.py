#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — FINALISATION NUTRITION (03/11/2026) : le banc `tools/banc_nut_miroir_fnl.js` sait-il ROUGIR, et au BON endroit ?

Ce qu'il éprouve : le miroir Supabase n'accepte plus comme valide un volet Nutrition (favoris, masquages) qu'Apps Script a refusé, suspendu ou non confirmé.
[!!] SUR UNE COPIE JETABLE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque mutation retire ou affaiblit UN morceau de la protection dans un clone ; le depot n'est jamais écrit.
Point de depart : 0 rouge sur l'arbre sain — le banc ENTIER, PUIS chaque jeu de sections que les mutations rejouent (un sous-ensemble rouge sur le code sain ne dirait rien).
Une mutation est TUEE si le banc rougit (code 1) ET si CHACUN des temoins attendus fait partie des rouges. Un PLANTAGE (code 2) n'est jamais un verdict.
Une ancre absente ou multiple arrete tout. L'extrait ORIGINAL et l'extrait MUTE sont imprimes. Les mutations 'EQ' sont EQUIVALENTES (le comportement observable ne change pas) : elles doivent rester VERTES —
elles prouvent que les temoins ne figent pas un emplacement dans le code, seulement un comportement.
Les gros dossiers (images, bibliotheques, docs) sont LIES et non copies : seuls les fichiers de la racine et les tests sont copies.
Usage : python3 tools/mut_nut_miroir_fnl.py [M01|M01,M05|M10+]   ·   python3 tools/mut_nut_miroir_fnl.py --ancres   (verifie seulement les ancres, sans lancer le banc)
"""
import os, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SU, SB, CO = 'setup.js', 'supabase.js', 'Code.js'
G = lambda *c: ['B-FNL01 ' + x + ' ' for x in c]

APPEL = "  try{ if(d.nut && typeof d.nut==='object' && envoi.favoris && typeof sbEnvoyerFavoris==='function') sbEnvoyerFavoris(envoi.favoris.savedFoods,envoi.favoris.hiddenFoods); }catch(e){}\n"
APPEL_INCONDITIONNEL = "try{ if(envoi.favoris && typeof sbEnvoyerFavoris==='function') sbEnvoyerFavoris(envoi.favoris.savedFoods,envoi.favoris.hiddenFoods); }catch(e){}"
DEBUT = "function _nutTraiterReponse(d,envoi){\n"
LISTE = "const _SB_SNAPSHOT_NUTRITION=['foodLog','foodSupprimes','savedFoods','hiddenFoods'];"
ENVOI_FAV = "  return sbEnvoyer({action:'saveProfile', savedFoods:savedFoods, hiddenFoods:hiddenFoods}, true);"

# (nom, [(fichier, ancre, remplacement)], temoins attendus, sections, genre)
MUT = [
    # ── la PORTE du miroir (supabase.js) ──
    ('M01 la porte laisse passer les favoris (savedFoods sort de la liste des champs retenus)',
     [(SB, LISTE, "const _SB_SNAPSHOT_NUTRITION=['foodLog','foodSupprimes','hiddenFoods'];")], G('FNL09', 'FNL03'), 'P,S', 'GARDE'),
    ('M02 la porte laisse passer les masquages (hiddenFoods sort de la liste des champs retenus)',
     [(SB, LISTE, "const _SB_SNAPSHOT_NUTRITION=['foodLog','foodSupprimes','savedFoods'];")], G('FNL09', 'FNL03'), 'P,S', 'GARDE'),
    ('M03 la porte ne retient plus RIEN du volet Nutrition (le retrait est desarme pour tout envoi)',
     [(SB, "  if(autorise===true || !payload || typeof payload!=='object') return payload;", "  return payload;")], G('FNL09', 'FNL03'), 'P,S', 'GARDE'),
    ('M04 la fonction dediee laisse passer AUTRE CHOSE que les deux listes (le registre part avec)',
     [(SB, ENVOI_FAV, "  return sbEnvoyer({action:'saveProfile', savedFoods:savedFoods, hiddenFoods:hiddenFoods, foodSupprimes:[]}, true);")], G('FNL09', 'FNL06'), 'P,S,R', 'GARDE'),
    ('M05 la fonction dediee n\'envoie que les favoris (les masquages restent derriere)',
     [(SB, ENVOI_FAV, "  return sbEnvoyer({action:'saveProfile', savedFoods:savedFoods}, true);")], G('FNL09', 'FNL05'), 'P,S,R', 'GARDE'),
    ('M06 la fonction dediee n\'est pas autorisee (la porte retient ses propres listes : le miroir ne les recoit JAMAIS)',
     [(SB, ENVOI_FAV, "  return sbEnvoyer({action:'saveProfile', savedFoods:savedFoods, hiddenFoods:hiddenFoods});")], G('FNL09', 'FNL01', 'FNL05'), 'P,S,R', 'GARDE'),
    # ── le client : QUAND le miroir reçoit les listes (setup.js) ──
    ('M07 les listes partent au miroir pour TOUTE reponse, refus compris (l\'appel est remonte avant le controle de l\'accuse)',
     [(SU, APPEL, ""), (SU, DEBUT, DEBUT + "  " + APPEL_INCONDITIONNEL + "\n")], G('FNL03', 'FNL07', 'FNL08'), 'S,N,A', 'GARDE'),
    ('M08 un accuse d\'une AUTRE operation est cru (le controle du requestId saute)',
     [(SU, "  if(!d || typeof d!=='object' || d.requestId!==envoi.requestId) return _nutNonConfirme(envoi,'ACCUSE_ABSENT');", "  if(!d || typeof d!=='object') return _nutNonConfirme(envoi,'ACCUSE_ABSENT');")], G('FNL08'), 'A', 'GARDE'),
    ('M09 un accuse valide SANS compte rendu du volet suffit (la condition `d.nut` saute)',
     [(SU, APPEL, APPEL.replace("d.nut && typeof d.nut==='object' && ", ""))], G('FNL08'), 'A', 'GARDE'),
    ('M10 le miroir recoit les listes du TELEPHONE au retour de l\'accuse, pas celles que cet envoi portait',
     [(SU, "sbEnvoyerFavoris(envoi.favoris.savedFoods,envoi.favoris.hiddenFoods)", "sbEnvoyerFavoris((S.savedFoods||[]).slice(0,200),_nutMasquesNormaliser(S.hiddenFoods))")], G('FNL10'), 'H', 'GARDE'),
    ('M11 l\'envoi ne garde plus les listes qu\'il porte (rien a donner au miroir a l\'accuse)',
     [(SU, ", favoris:{savedFoods:_corpsSync.savedFoods, hiddenFoods:_corpsSync.hiddenFoods}}", "}")], G('FNL01', 'FNL05'), 'S,R', 'GARDE'),
    ('M12 plus personne n\'appelle la fonction dediee (le miroir ne recoit plus jamais ni favori ni masquage)',
     [(SU, APPEL, "")], G('FNL01', 'FNL05'), 'S,R', 'GARDE'),
    ('M13 les listes partent aussi pour un refus REESSAYABLE (suspension, zone de securite, erreur interne, verrou)',
     [(SU, "    if(d.retryable===true){", "    if(d.retryable===true){ " + APPEL_INCONDITIONNEL)], G('FNL03', 'FNL07'), 'S,N', 'GARDE'),
    ('M14 les listes partent aussi pour un refus DEFINITIF (version incompatible)',
     [(SU, "      if(code==='NUT_CLIENT_INCOMPATIBLE') _nutAvertir(code,_N_MSG_SYNC_INCOMPAT,86400000);\n      return 'refuse';", "      " + APPEL_INCONDITIONNEL + "\n      if(code==='NUT_CLIENT_INCOMPATIBLE') _nutAvertir(code,_N_MSG_SYNC_INCOMPAT,86400000);\n      return 'refuse';")], G('FNL07'), 'N', 'GARDE'),
    # ── la PARITÉ entre le volet du serveur et la porte du miroir ──
    ('M16 le serveur traite un CINQUIEME champ comme du volet Nutrition, sans que la porte du miroir le sache (la divergence qui a cause le defaut)',
     [(CO, "body.foodSupprimes !== undefined || body.hiddenFoods !== undefined);", "body.foodSupprimes !== undefined || body.hiddenFoods !== undefined || body.nouveauChampNutrition !== undefined);")], G('FNL11'), 'P', 'GARDE'),
    # ── équivalente : seul l'EMPLACEMENT de l'appel change (au lieu d'avant le traitement des conflits, juste avant de rendre « confirme ») — le comportement observable est le meme
    ('M15 EQ l\'appel passe de la tete du traitement a sa fin (meme condition, meme valeur : le comportement observable ne change pas)',
     [(SU, APPEL, ""), (SU, "  return 'confirme';\n}\nfunction _cloudSync(){", APPEL + "  return 'confirme';\n}\nfunction _cloudSync(){")], [], 'S,R,N,A,H', 'EQ'),
]


def banc(arbre, sections):
    env = dict(os.environ)
    if sections != '*': env['FNL01_SEULEMENT'] = sections
    else: env.pop('FNL01_SEULEMENT', None)
    r = subprocess.run(['node', 'tools/banc_nut_miroir_fnl.js'], cwd=arbre, capture_output=True, text=True, timeout=900, env=env)
    out = r.stdout or ''
    last = [l for l in out.split('\n') if ' OK / ' in l]
    rouges = [l.split('rouge : ', 1)[1] for l in out.split('\n') if l.startswith('  rouge : ')]
    return r.returncode, (last[-1].strip() if last else (r.stderr or '')[-200:]), rouges


LOURDS = ('exercises', 'anatomy', 'muscles', 'lib', 'docs', 'data', 'clone', 'guide', 'audits', 'worktrees')


def cloner():
    """Une copie jetable : les .js, .html et tests sont COPIES (donc mutables sans toucher le depot) ; les gros dossiers d'images et de bibliotheques sont LIES (jamais modifies)."""
    tmp = tempfile.mkdtemp(prefix='mut_fnl01_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', *LOURDS))
    for d in LOURDS:
        s = os.path.join(SRC, d)
        if os.path.isdir(s): os.symlink(s, os.path.join(a, d))
    return tmp, a


def verifier_ancres():
    mal = 0
    for nom, rempl, _, _, _ in MUT:
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
    # ── l'arbre SAIN : le banc entier, puis chaque jeu de sections que les mutations rejouent ──
    tmp0, a0 = cloner()
    rc, res, _ = banc(a0, '*')
    if rc != 0:
        shutil.rmtree(tmp0, ignore_errors=True)
        print('  !! ARBRE SAIN DEJA ROUGE OU PLANTE — controle refuse :', res); return 1
    print('  arbre sain, banc entier : %s' % res)
    jeux = sorted(set(m[3] for m in MUT if (not seul) or any(m[0].startswith(x + ' ') for x in seul.rstrip('+').split(','))))
    for j in jeux:
        rc, res, _ = banc(a0, j)
        print('  arbre sain, sections %-10s : %s' % (j, res))
        if rc != 0:
            shutil.rmtree(tmp0, ignore_errors=True)
            print('  !! UN SOUS-ENSEMBLE EST ROUGE SUR LE CODE SAIN — ses mutations ne diraient rien :', j); return 1
    shutil.rmtree(tmp0, ignore_errors=True)
    print('  (points de depart valides)\n')
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
            print('  %s %s -> %s  [code %d]\n' % ('CONFORME(EQ)' if ok else 'NON CONFORME', nom[:60], res, rc))
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
