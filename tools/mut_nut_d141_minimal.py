#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUT-D141-MINIMAL (29/10/2026) : le banc `tools/banc_nut_d141_minimal.js` sait-il ROUGIR, et au BON endroit ?

[!!] SUR UNE COPIE JETABLE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque mutation est appliquee a un clone ; le depot n'est jamais ecrit.
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord. Une mutation est conforme (TUEE) si le banc rougit (code 1) ET si CHACUN
des temoins attendus fait partie des rouges (un rouge ailleurs ne prouve pas que le bon temoin mord). Un PLANTAGE (code 2) n'est jamais
un verdict. Une ancre absente ou multiple arrete tout. L'extrait ORIGINAL et l'extrait MUTE sont imprimes.
Le Code.js de master (comparaison) est exporte une fois dans $TMPDIR et passe au banc par D141_BASE_CODE.
Usage : python3 tools/mut_nut_d141_minimal.py [M01|M02|...]
"""
import os, re, shutil, subprocess, sys, tempfile, time

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
C = 'Code.js'
BANC = 'tools/banc_nut_d141_minimal.js'

SAVE = "    if (body.hiddenFoods   !== undefined) profile.hiddenFoods   = _nutMasquesFusion_(profile.hiddenFoods, body.hiddenFoods);"
REST = "  if (_masques.length) data = Object.assign({}, data, { profile: Object.assign({}, data.profile, { hiddenFoods: _masques }) });"
MERG = "  const _masques = _nutMasquesFusion_(_avant && _avant.profile && _avant.profile.hiddenFoods, data.profile.hiddenFoods);"
RESTE_ECR = "  data.email = email;\n  data.updatedAt = new Date().toISOString();\n  saveUserData_"
FUT = "      if (t > maintenant) t = maintenant;\n      if (!(k in par)"

MUT = [
    ('M01 la fusion est supprimee de handleSaveProfile_', [(C, SAVE, "    /* M01 : fusion supprimee */")], ['B-ND141 SP1 ', 'B-ND141 SP5 '], 'GARDE'),
    ('M02 la fusion est supprimee de handleAdminRestore_', [(C, REST, "  /* M02 : fusion supprimee de la restauration */")], ['B-ND141 R01 ', 'B-ND141 R03 '], 'GARDE'),
    ('M03 la fusion est remplacee par un ecrasement direct (save)', [(C, SAVE, "    if (body.hiddenFoods   !== undefined) profile.hiddenFoods   = body.hiddenFoods;")], ['B-ND141 SP3 ', 'B-ND141 SP4 '], 'GARDE'),
    ('M04 la date la plus ANCIENNE est conservee', [(C, "if (!(k in par) || t > par[k]) par[k] = t;", "if (!(k in par) || t < par[k]) par[k] = t;")], ['B-ND141 S05 '], 'GARDE'),
    ('M05 la cle `*` disparait du resultat', [(C, "  return g ? [{ k: '*', t: g }].concat(out) : out;", "  return out;")], ['B-ND141 S09 ', 'B-ND141 SP7 '], 'GARDE'),
    ('M06 le plafond de 300 est supprime', [(C, "    .slice(0, g ? NUT_MASQUES_MAX_ - 1 : NUT_MASQUES_MAX_);", "    ;")], ['B-ND141 S11 ', 'B-ND141 SP13 '], 'GARDE'),
    ('M07 une nouvelle identite est ignoree quand le compte a deja des masquages', [(C, "  prendre(existant); prendre(recu);", "  prendre(existant); if (!Array.isArray(existant) || !existant.length) prendre(recu);")], ['B-ND141 SP5 '], 'GARDE'),
    ('M08 `id:` et `nom:` de meme suite se confondent', [(C, "var k = x.k.trim().toLowerCase().slice(0, 120), t = Number(x.t);", "var k = x.k.trim().toLowerCase().slice(0, 120).replace(/^(id|nom):/, ''), t = Number(x.t);")], ['B-ND141 S08 '], 'GARDE'),
    ('M09 un ancien backup ecrase les masquages recents (la restauration ignore le compte)', [(C, MERG, MERG.replace("_nutMasquesFusion_(_avant && _avant.profile && _avant.profile.hiddenFoods, data.profile.hiddenFoods)", "_nutMasquesFusion_(null, data.profile.hiddenFoods)"))],
     ['B-ND141 R01 ', 'B-ND141 R02 ', 'B-ND141 R04 '], 'GARDE'),
    ('M10 le chemin de sauvegarde retire un favori', [(C, SAVE, SAVE + "\n    if (Array.isArray(profile.savedFoods) && profile.savedFoods.length) profile.savedFoods = profile.savedFoods.slice(0, -1);")], ['B-ND141 SP9 ', 'B-ND141 SP9b '], 'GARDE'),
    ('M10b le chemin de restauration retire un favori de la sauvegarde', [(C, RESTE_ECR, "  if (Array.isArray(data.profile.savedFoods) && data.profile.savedFoods.length) data = Object.assign({}, data, { profile: Object.assign({}, data.profile, { savedFoods: data.profile.savedFoods.slice(1) }) });\n" + RESTE_ECR)], ['B-ND141 R12 ', 'B-ND141 R13 '], 'GARDE'),
    ('M11 le champ est enregistre sous un mauvais nom (typo de la liste blanche)', [(C, SAVE, SAVE.replace("profile.hiddenFoods   = _nutMasquesFusion_", "profile.hiddenFood   = _nutMasquesFusion_"))], ['B-ND141 SP1 ', 'B-ND141 SP5 '], 'GARDE'),
    ('M12 le dictionnaire de fusion redevient un objet ordinaire (collision avec le prototype)', [(C, "var maintenant = Date.now(), par = Object.create(null);", "var maintenant = Date.now(), par = {};")], ['B-ND141 S16 '], 'GARDE'),
    ('M13 la date future n\'est plus ramenee a maintenant', [(C, FUT, "      if (!(k in par)")], ['B-ND141 S14 '], 'GARDE'),
    ('M14 une date invalide est acceptee (le test de validite est retire)', [(C, "if (!k || !(isFinite(t) && t > 0)) return;", "if (!k) return;")], ['B-ND141 S13 '], 'GARDE'),
    ('M15 le tri n\'est plus stable (egalite de date : ordre d\'arrivee)', [(C, "    .sort(function(a, b) { return (b.t - a.t) || (a.k < b.k ? -1 : 1); })", "    .sort(function(a, b) { return (b.t - a.t); })")], ['B-ND141 S06b ', 'B-ND141 S20 '], 'GARDE'),
]


def banc(arbre, env):
    r = subprocess.run(['node', BANC], cwd=arbre, capture_output=True, text=True, timeout=900, env=env)
    out = r.stdout or ''
    last = [l for l in out.split('\n') if ' OK / ' in l]
    rouges = [l.split('ROUGE ', 1)[1].strip() for l in out.split('\n') if l.startswith('❌ ROUGE ')]
    return r.returncode, (last[-1].strip() if last else (r.stderr or '')[-160:]), rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_d141_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'audits', 'worktrees'))
    return tmp, a


def main():
    seul = sys.argv[1] if len(sys.argv) > 1 else None
    base = os.path.join(tempfile.mkdtemp(prefix='base_d141_'), 'Code.base.js')
    open(base, 'wb').write(subprocess.run(['git', 'show', '3d8d49ef:Code.js'], cwd=SRC, capture_output=True, check=True).stdout)
    env = dict(os.environ, D141_BASE_CODE=base)
    tmp0, a0 = cloner()
    rc, res, _ = banc(a0, env)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rc != 0:
        print('  !! ARBRE SAIN DEJA ROUGE OU PLANTE — controle refuse :', res); return 1
    print('  arbre sain : %s (point de depart valide)\n' % res)
    conformes, total = 0, 0
    for nom, rempl, attendus, attendu in MUT:
        if seul and not nom.startswith(seul + ' '):
            continue
        total += 1
        tmp, arbre = cloner()
        print('--- %s' % nom)
        for f, old, new in rempl:
            p = os.path.join(arbre, f)
            s = open(p, encoding='utf-8').read()
            if s.count(old) != 1:
                print('  !! ANCRE INTROUVABLE OU MULTIPLE (%d) : %s' % (s.count(old), nom)); shutil.rmtree(tmp, ignore_errors=True); return 1
            open(p, 'w', encoding='utf-8').write(s.replace(old, new))
            print('     [%s] ORIGINAL : %s' % (f, old.strip().replace('\n', ' ⏎ ')[:230]))
            print('     [%s] MUTE     : %s' % (f, new.strip().replace('\n', ' ⏎ ')[:230]))
        for f in sorted(set(x[0] for x in rempl)):
            chk = subprocess.run(['node', '-e', "new Function(require('fs').readFileSync('%s','utf8'))" % f], cwd=arbre, capture_output=True)
            if chk.returncode != 0:
                print('  !! MUTATION QUI CASSE LA SYNTAXE (refusee) : %s' % nom); shutil.rmtree(tmp, ignore_errors=True); return 1
        t1 = time.time(); rc, res, rouges = banc(arbre, env); dt = time.time() - t1
        shutil.rmtree(tmp, ignore_errors=True)
        manquants = [w for w in attendus if not any(r.startswith(w) for r in rouges)]
        ok = rc == 1 and not manquants
        conformes += ok
        print('  %s %s -> %s  [code %d, %.1f s, copie jetable supprimee]' % ('TUEE      ' if ok else 'SURVIVANTE', nom[:60], res, rc, dt))
        if manquants:
            print('       temoin(s) attendu(s) reste(s) VERT(S) : %s' % ' · '.join(manquants))
        if rc == 2:
            print('       PLANTAGE : ce n\'est pas un verdict')
        print('       rouges : %s\n' % (' · '.join(re.sub(r' (⭐|—|:|\().*', '', x)[:24] for x in rouges) or 'aucun'))
    print('\n%d/%d tuees (conformes)' % (conformes, total))
    return 0 if conformes == total and total > 0 else 1


if __name__ == '__main__':
    sys.exit(main())
