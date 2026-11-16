#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 DIAGNOSTIC DES SAUVEGARDES — LECTURE SEULE, SUR DES FICHIERS EXPORTÉS (F2-A′ · 16/11/2026, contre-expertise)
 ⭐ POURQUOI : deux écarts mesurés le 15/11 n'ont PAS de cause établie — « 12 lignes au lieu de 10 » et « 13 comptes contre 14 » entre deux
    passages de la sauvegarde nocturne. Le candidat F2-A′ écrit désormais `user_count_attendu` et `erreurs` dans chaque fichier ; ce script
    LIT ces fichiers et dit ce qu'ils contiennent. ⛔ IL NE CONCLUT JAMAIS à une perte ni à une suppression : il liste des FAITS (qui est
    absent, qui a changé de taille), que Michel et Claude interprètent ensuite.
 ⛔ LECTURE SEULE, HORS LIGNE : il ne lit que le dossier qu'on lui donne (une COPIE exportée par Michel — aucune lecture réelle du Drive n'est
    faite ni autorisée ici), n'écrit rien dans ce dossier, n'ouvre aucune connexion. Les adresses e-mail ne sortent JAMAIS en clair : seule une
    empreinte de 8 caractères (sha-256) identifie un compte dans le rapport.
 CE QU'IL RAPPORTE, par fichier : `user_count` · `user_count_attendu` (clés `u_` trouvées, absent des fichiers d'avant F2-A′) · nombre de comptes
    réellement présents · `erreurs` (clé + raison, adresse masquée) · séances et records au total. PUIS, entre deux fichiers consécutifs :
    comptes disparus · comptes nouveaux · comptes dont le nombre de SÉANCES a baissé (⚠️ le fait à regarder en premier) ou monté.
 Usage : python3 tools/diag_sauvegardes.py <dossier de fichiers .json exportés>        # rapport lisible
         python3 tools/diag_sauvegardes.py --auto-test                                 # s'éprouve sur des sauvegardes FICTIVES (secondes)
══════════════════════════════════════════════════════════════════════════════════════════════════════════════
"""
import hashlib, json, os, shutil, sys, tempfile
sys.dont_write_bytecode = True

h = lambda e: hashlib.sha256(str(e).lower().strip().encode('utf-8')).hexdigest()[:8]


def lire(chemin):
    with open(chemin, encoding='utf-8') as f:
        d = json.load(f)
    users = d.get('users') if isinstance(d, dict) else None
    if not isinstance(users, list):
        raise ValueError('pas une sauvegarde (clé « users » absente)')
    comptes = {}
    for u in users:
        e = (u or {}).get('email') or ((u or {}).get('data') or {}).get('email')
        dat = (u or {}).get('data') or {}
        comptes[h(e)] = {'seances': len(dat.get('sessions') or []), 'records': len(dat.get('prs') or {}), 'sante': bool((u or {}).get('sante'))}
    erreurs = [{'compte': h(str(x.get('cle', '')).replace('u_', '', 1)), 'raison': str(x.get('raison', ''))[:80]} for x in (d.get('erreurs') or []) if isinstance(x, dict)]
    return {'user_count': d.get('user_count'), 'attendu': d.get('user_count_attendu'), 'presents': len(comptes), 'comptes': comptes, 'erreurs': erreurs, 'avant_F2A': 'user_count_attendu' not in d}


def rapport(dossier):
    noms = sorted(n for n in os.listdir(dossier) if n.lower().endswith('.json'))
    if not noms:
        return ['(aucun fichier .json dans ce dossier)'], 1
    fich = []
    for n in noms:
        try: fich.append((n, lire(os.path.join(dossier, n))))
        except (OSError, ValueError) as e: fich.append((n, {'illisible': str(e)[:80]}))
    out, code = ['DIAGNOSTIC DES SAUVEGARDES — lecture seule, %d fichier(s), adresses masquées (empreinte de 8 caractères)' % len(fich), ''], 0
    for n, f in fich:
        if 'illisible' in f:
            out.append('%s : ILLISIBLE (%s)' % (n, f['illisible'])); code = 2; continue
        ecart = '' if f['attendu'] is None else (' · ATTENDU %s' % f['attendu'] + (' ⚠️ ÉCART : %d compte(s) non sauvegardé(s)' % (f['attendu'] - f['presents']) if f['attendu'] != f['presents'] else ' (aucun écart)'))
        out.append('%s : user_count=%s · comptes présents=%d%s%s' % (n, f['user_count'], f['presents'], ecart, ' · fichier d\'AVANT F2-A′ (pas de user_count_attendu : un compte illisible aurait été sauté en silence)' if f['avant_F2A'] else ''))
        for x in f['erreurs']:
            out.append('    erreur : compte %s — %s' % (x['compte'], x['raison']))
        out.append('    séances au total : %d · records : %d' % (sum(c['seances'] for c in f['comptes'].values()), sum(c['records'] for c in f['comptes'].values())))
    ok = [(n, f) for n, f in fich if 'illisible' not in f]
    for (na, a), (nb, b) in zip(ok, ok[1:]):
        out.append('')
        out.append('%s → %s' % (na, nb))
        dispar = sorted(set(a['comptes']) - set(b['comptes'])); nouv = sorted(set(b['comptes']) - set(a['comptes']))
        out.append('    comptes disparus : %s' % (', '.join(dispar) or 'aucun')); out.append('    comptes nouveaux : %s' % (', '.join(nouv) or 'aucun'))
        baisse = [(c, a['comptes'][c]['seances'], b['comptes'][c]['seances']) for c in sorted(set(a['comptes']) & set(b['comptes'])) if b['comptes'][c]['seances'] < a['comptes'][c]['seances']]
        hausse = [(c, a['comptes'][c]['seances'], b['comptes'][c]['seances']) for c in sorted(set(a['comptes']) & set(b['comptes'])) if b['comptes'][c]['seances'] > a['comptes'][c]['seances']]
        out.append('    séances en BAISSE : %s' % ('; '.join('%s %d→%d' % x for x in baisse) or 'aucune'))
        out.append('    séances en hausse : %s' % ('; '.join('%s %d→%d' % x for x in hausse) or 'aucune'))
        for c in dispar:
            if any(x['compte'] == c for x in b['erreurs']): out.append('    ↳ le compte %s est NOMMÉ dans les erreurs du 2ᵉ fichier : il n\'a pas pu être lu ce soir-là (il n\'a pas disparu du serveur)' % c)
    out += ['', '⛔ Ce rapport ne conclut pas : il liste des faits. Une baisse de séances d\'un compte ne dit pas QUI l\'a causée (suppression voulue, appareil amputé avant F2-A′, restauration).']
    return out, code


def auto_test():
    d = tempfile.mkdtemp(prefix='diag-sauv-')
    try:
        def fichier(nom, comptes, attendu=None, erreurs=None):
            doc = {'user_count': len(comptes), 'users': [{'email': e, 'data': {'sessions': [{}] * n, 'prs': {'x': 1}}} for e, n in comptes.items()]}
            if attendu is not None: doc['user_count_attendu'] = attendu; doc['erreurs'] = erreurs or []
            json.dump(doc, open(os.path.join(d, nom), 'w', encoding='utf-8'))
        fichier('2026-11-14.json', {'a@example.test': 12, 'b@example.test': 5, 'c@example.test': 3})
        fichier('2026-11-15.json', {'a@example.test': 10, 'b@example.test': 5}, attendu=3, erreurs=[{'cle': 'u_c@example.test', 'raison': 'illisible'}])
        lignes, code = rapport(d); txt = '\n'.join(lignes)
        verifs = [
            ('le fichier d\'avant F2-A′ est signalé', 'fichier d\'AVANT F2-A′' in txt),
            ('l\'écart attendu/présents est dit (3 attendus, 2 présents)', 'ATTENDU 3' in txt and '1 compte(s) non sauvegardé(s)' in txt),
            ('le compte illisible est NOMMÉ par son empreinte, jamais par son adresse', h('c@example.test') in txt and 'example.test' not in txt),
            ('le compte absent du 2ᵉ fichier est relié à ses erreurs (il n\'a pas disparu)', 'n\'a pas pu être lu' in txt),
            ('la BAISSE de séances est listée (12→10)', '%s 12→10' % h('a@example.test') in txt),
            ('le rapport ne conclut pas', 'ne conclut pas' in txt),
            ('code 0 sur des fichiers lisibles', code == 0),
            ('rien n\'a été écrit dans le dossier lu', sorted(os.listdir(d)) == ['2026-11-14.json', '2026-11-15.json']),
        ]
        open(os.path.join(d, 'casse.json'), 'w').write('{pas du json')
        l2, c2 = rapport(d)
        verifs.append(('un fichier illisible est dit ILLISIBLE (code 2), pas ignoré', any('ILLISIBLE' in x for x in l2) and c2 == 2))
        ok = 0
        for nom, cond in verifs:
            ok += bool(cond); print('  %s %s' % ('✅' if cond else '❌', nom))
        print('──── %d OK / %d rouge ────' % (ok, len(verifs) - ok))
        return 0 if ok == len(verifs) else 1
    finally:
        shutil.rmtree(d, ignore_errors=True)


if __name__ == '__main__':
    if len(sys.argv) < 2: print(__doc__); sys.exit(2)
    if sys.argv[1] == '--auto-test': sys.exit(auto_test())
    lignes, code = rapport(sys.argv[1]); print('\n'.join(lignes)); sys.exit(code)
