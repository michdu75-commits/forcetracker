#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — SEC-ADMIN-01 (session-B, 09/10/2026) : les temoins B-SEC-S / B-SEC-E savent-ils ROUGIR ?

[!!] DANS LA COPIE MUTEE : chaque mutation est appliquee a un ARBRE COPIE, jamais au depot (BUGS.md §60).
Point de depart : 0 rouge sur l'arbre sain, mesure d'abord. M00 = le code d'AVANT (master 6969ce73).
Les mutations visent le VRAI code (routes, controles, client, textes affiches) ; une seule touche un commentaire,
et elle doit rester VERTE (un banc qui rougit sur un commentaire mesurerait le texte, pas le comportement).
Usage : python3 tools/mut_sec_admin.py [PREFIXE[,PREFIXE...]]   (MUT_DETAIL=1 : tous les rouges)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CO, AP, SE, IX = 'Code.js', 'app.js', 'setup.js', 'index.html'
FICHIERS = (CO, AP, SE, IX)
BASE_AVANT = '6969ce73'

TOK_DP = ("    if (!_checkIdeesTok_(p.token)) return json_({status:'error', error:'token'});\n"
          "    if (!p.email) return json_({status:'error', error:'email'});\n")
TOK_GF = ("    if (!_checkIdeesTok_(p.token)) return json_({status:'error', error:'token'});\n"
          "    try {\n      const te = 'ft_gf_'")

MUT = [
    ('M00 le code d\'AVANT (master 6969ce73) : route publique, identite changee, libelle faux', 'AVANT', 'GARDE'),
    ('M01 S-01 reintroduite : la route de diagnostic n\'exige plus de jeton',
     [(CO, TOK_DP, "    if (!p.email) return json_({status:'error', error:'email'});\n")], 'GARDE'),
    ('M02 autorisation par la SEULE adresse (l\'adresse en dur suffit, sans jeton)',
     [(CO, TOK_DP, "    if (!_checkIdeesTok_(p.token) && !PREMIUM_HARDCODED_.includes(String(p.email || '').toLowerCase().trim())) return json_({status:'error', error:'token'});\n"
                   "    if (!p.email) return json_({status:'error', error:'email'});\n")], 'GARDE'),
    ('M03 parametre client admin=true accepte',
     [(CO, TOK_DP, "    if (!_checkIdeesTok_(p.token) && p.admin !== 'true') return json_({status:'error', error:'token'});\n"
                   "    if (!p.email) return json_({status:'error', error:'email'});\n")], 'GARDE'),
    ('M04 route de diagnostic qui ecrit (testGardeFou) de nouveau publique',
     [(CO, TOK_GF, "    try {\n      const te = 'ft_gf_'")], 'GARDE'),
    ('M05 le refus renvoie la liste des adresses premium',
     [(CO, TOK_DP, "    if (!_checkIdeesTok_(p.token)) return json_({status:'error', error:'token', fullPremiumList: Array.from(new Set([...PREMIUM_HARDCODED_, ...String(PropertiesService.getScriptProperties().getProperty('PREMIUM_EMAILS') || '').split(',').filter(Boolean)]))});\n"
                   "    if (!p.email) return json_({status:'error', error:'email'});\n")], 'GARDE'),
    ('M06 le refus renvoie le statut premium et de protection de l\'adresse demandee',
     [(CO, TOK_DP, "    if (!_checkIdeesTok_(p.token)) return json_({status:'error', error:'token', premium: getPremiumStatus_(String(p.email || '').toLowerCase().trim()).premium, hasCode: !!PropertiesService.getScriptProperties().getProperty('auth_' + String(p.email || '').toLowerCase().trim())});\n"
                   "    if (!p.email) return json_({status:'error', error:'email'});\n")], 'GARDE'),
    ('M07 controle du jeton OUVERT par defaut quand le secret serveur manque',
     [(CO, "  if (!want || String(want).length < 12) return false;   // absente ou trop courte → fermé\n",
           "  if (!want || String(want).length < 12) return true;   // absente ou trop courte → fermé\n")], 'GARDE'),
    ('M08 contournement : tout jeton de 64 caracteres (un jeton d\'appareil) passe pour le jeton admin',
     [(CO, "  if (!want || String(want).length < 12) return false;   // absente ou trop courte → fermé\n",
           "  if (!want || String(want).length < 12) return false;   // absente ou trop courte → fermé\n"
           "  if (String(given == null ? '' : given).trim().length === 64) return true;\n")], 'GARDE'),
    ('M09 (client) le mode admin pose de nouveau l\'adresse de l\'admin sur un appareil sans e-mail',
     [(AP, "    const eInp=document.getElementById('email-inp');\n    if(eInp)eInp.value=S.email||'';\n",
           "    if(!S.email){S.email=(ADMIN_EMAILS[0]||'');persist();}\n    const eInp=document.getElementById('email-inp');\n    if(eInp)eInp.value=S.email||'';\n")], 'GARDE'),
    ('M10 (client) la carte « Statut Premium » ne presente plus le jeton admin',
     [(SE, "'&token='+encodeURIComponent(tok),{redirect:'follow'});", ",{redirect:'follow'});")], 'GARDE'),
    ('M11 (client) un refus du serveur n\'est plus traite : la carte affiche un en-tete de liste',
     [(SE, "      if(_adminTokRefuse(dbg)){ refuse=true; dbg=null; }\n", "      _adminTokRefuse(dbg);\n")], 'GARDE'),
    ('M12 le diagnostic ecrit de nouveau les adresses dans le journal du serveur',
     [(CO, "    Logger.log('[FT debugPremium] matchProp=' + matchProp",
           "    Logger.log('[FT debugPremium] email=' + emailQ + ' | raw=\"' + rawList + '\" | matchProp=' + matchProp")], 'GARDE'),
    ('M13 la reponse admin porte de nouveau un doublon de la liste (hardcodedList)',
     [(CO, "      fullPremiumCount: fullList.length,\n", "      fullPremiumCount: fullList.length,\n      hardcodedList: PREMIUM_HARDCODED_,\n")], 'GARDE'),
    ('M14 (texte affiche) la carte des comptes promet de nouveau « sans lire aucune donnee personnelle »',
     [(IX, "Cette liste affiche <strong>l'adresse e-mail</strong> de chaque compte testeur et dit s'il a posé un code — elle n'ouvre ni le code, ni le profil, ni les séances.",
           "Cette liste dit qui en a un — <strong>sans lire aucune donnée personnelle</strong>.")], 'GARDE'),
    ('M15 (texte affiche) le resume dit de nouveau « lisibles cote serveur »',
     [(AP, "' sans code</strong> — '+(nbOuv>1?'protégés seulement par leur':'protégé seulement par son')+' adresse e-mail.",
           "' sans code</strong> — leurs données sont lisibles côté serveur par qui connaît l\\'adresse.")], 'GARDE'),
    ('M16 (temoin de controle) un COMMENTAIRE de la route modifie : le banc doit rester VERT',
     [(CO, "     Pourquoi elle reste (R30) : c'est l'outil qui a démasqué",
           "     Pourquoi elle reste encore (R30) : c'est l'outil qui a démasqué")], 'OK'),
]


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_sec_admin.js'], cwd=arbre, capture_output=True, text=True, timeout=1800,
                       env=dict(os.environ, TZ='Europe/Paris'))
    out = r.stdout + r.stderr
    rouges = [l.strip()[:150] for l in out.split('\n') if 'ROUGE' in l or 'PLANTAGE' in l]
    if r.returncode not in (0, 1) and not rouges:
        rouges = ['PLANTAGE (code %d)' % r.returncode]
    return rouges, out


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_sec_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__'))
    return tmp, a


def avant():
    d = {}
    for f in FICHIERS:
        r = subprocess.run(['git', 'show', BASE_AVANT + ':' + f], cwd=SRC, capture_output=True, text=True)
        d[f] = r.stdout if r.returncode == 0 else ''
    return d


def main():
    filtres = [f for f in (sys.argv[1] if len(sys.argv) > 1 else '').split(',') if f]
    AV = avant()
    tmp0, a0 = cloner()
    rouges, out0 = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rouges:
        print('  !! ARBRE SAIN DEJA ROUGE — controle refuse :', rouges[:3]); return 1
    m = re.search(r'(\d+) OK / (\d+) rouge', out0)
    print('  arbre sain : 0 rouge (%s OK) — point de depart valide\n' % (m.group(1) if m else '?'))
    conformes = total = 0
    for nom, remplacements, attendu in MUT:
        if filtres and not any(nom.startswith(f) for f in filtres):
            continue
        total += 1
        tmp, arbre = cloner()
        if remplacements == 'AVANT':
            cur = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
            if any(not AV[f] for f in FICHIERS) or all(AV[f] == cur[f] for f in FICHIERS):
                print('  INVALIDE  %s (code d\'avant introuvable ou identique)' % nom); shutil.rmtree(tmp, ignore_errors=True); continue
            for f in FICHIERS:
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(AV[f])
        else:
            srcs = {f: open(os.path.join(arbre, f), encoding='utf-8').read() for f in FICHIERS}
            invalide = []
            for f, av, ap in remplacements:
                if srcs[f].count(av) != 1:
                    invalide.append('%s:%s (x%d)' % (f, av[:50], srcs[f].count(av)))
                else:
                    srcs[f] = srcs[f].replace(av, ap, 1)
            if invalide:
                print('  INVALIDE  %s (ancre absente ou multiple : %s)' % (nom, invalide)); shutil.rmtree(tmp, ignore_errors=True); continue
            for f in FICHIERS:
                open(os.path.join(arbre, f), 'w', encoding='utf-8').write(srcs[f])
        rouges, _ = banc(arbre)
        obtenu = 'GARDE' if rouges else 'OK'
        ok = obtenu == attendu
        conformes += ok
        print('  %s  %-100s %-6s %2d rouge(s)  %s' % ('OK ' if ok else '!! ', nom[:100], obtenu, len(rouges), rouges[0] if rouges else ''))
        if os.environ.get('MUT_DETAIL'):
            for r in rouges:
                print('        ' + r)
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%d/%d conformes' % (conformes, total))
    return 0 if conformes == total else 1


if __name__ == '__main__':
    raise SystemExit(main())
