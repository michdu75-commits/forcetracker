#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 LES MUTANTS DES GARDES — « un garde qu'on n'éprouve pas est une affirmation, pas une garantie »  (INFRA-QA-01 · L0)
 Chaque mutant ÉTEINT une protection du garde (une copie jetable, jamais le dépôt). Il est TUÉ si au moins un scénario de
 l'arène qui était PASS devient FAIL : c'est la preuve que l'arène MORD sur cette protection. Un mutant qui SURVIT est un
 trou de l'arène (ou une protection inutile) : à écrire, jamais à ignorer.
 ⚠️ L'ordre compte : l'arène d'abord SANS mutation (tout PASS), sinon « tué » ne veut rien dire.
 Usage : python3 tests/gardes/mutants.py valide|repartie|annexe|selecteur|decoupe|temoins [M01,M02…]        (code 0 = tous tués)
══════════════════════════════════════════════════════════════════════════════════════════════════════════════
"""
import os, shutil, subprocess, sys, tempfile
sys.dont_write_bytecode = True      # jamais de __pycache__ dans le dépôt

RACINE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VAL, TEM, REP, ANN, SEL = 'tools/passe_valide.sh', 'tools/temoins.py', 'tools/passe_repartie.py', 'tools/recette_annexe.py', 'tools/recette_selecteur.py'
DEC, VER = 'tools/decouper_passe.js', 'tools/verifier_decoupe.js'
# (id, fichier, ancre EXACTE (présente UNE fois), remplacement, protection éteinte)
MUT = [
    ('M01', VAL, '''if [ "$RC_ST" = "0" ] && [ -z "$ETAT0" ]; then''', 'if true; then', '⓪ arbre propre au départ'),
    ('M02', VAL, '''if [ "$RC_ST1" = "0" ] && [ -z "$ETAT1" ]; then''', 'if true; then', '③b arbre propre à l\'arrivée'),
    ('M03', VAL, '''if [ "$D_RC" = "0" ] && [ -n "$DIST0" ] && [ "$D_CONTENU" = "1" ]; then echo "  ✅ ④a''', 'if true; then echo "  ✅ ④a', '④a distant prouvé avant la passe'),
    ('M03b', VAL, '''[ -n "$DIST0" ] && [ "$D_CONTENU" = "1" ]; then echo "  ✅ ④a''', '[ -n "$DIST0" ]; then echo "  ✅ ④a', '④a HEAD contient le distant (refus avant la passe)'),
    ('M04', VAL, '''[ -n "$DIST1" ] && [ "$DIST1" = "$DIST0" ]; then''', '[ -n "$DIST1" ]; then', '④b E21b : le distant est resté le même pendant la passe'),
    ('M06', VAL, '''if [ "$CODE" = "0" ]; then echo "  ✅ ② le runner''', 'if true; then echo "  ✅ ② le runner', '② code de sortie du runner'),
    ('M07', VAL, '''[ "$JRC" = "0" ] || ok=0''', 'true', 'toutes les conditions de lecture du journal'),
    ('M08', VAL, '''exit 3''', 'exit 0', 'épreuve ≠ livraison (code 3)'),
    ('M09', VAL, '''if [ "$CALIBRER" = "1" ] && { [ -z "$CROISER" ] || [ ! -f "$CROISER/PASSE.json" ]; }; then''', 'if false; then', '--calibrer exige la source indépendante AVANT de lancer la passe'),
    ('M10', VAL, '''--croiser "$CROISER" $RETRAITS ||''', '''--croiser "$CROISER" ||''', '--accepter-retraits est transmis au calibrage'),
    ('T01', TEM, '''if a['n_ok'] == n and a['n_ko'] == k and a['rouges'] == k:''', 'if True:', '⑥ lignes = total annoncé'),
    ('T02', TEM, '''    if len(t) == 1:''', '''    if len(t) >= 1:''', '① ligne de total UNIQUE'),
    ('T03', TEM, '''        if n < len(E):''', '''        if n < 0:''', '⑦ une identité absente ou en moins bloque (comparer)'),
    ('T04', TEM, '''RE_ROUGE = re.compile(r'^\\s*❌')''', '''RE_ROUGE = re.compile(r'^\\s+❌')''', 'rouges en colonne 0'),
    ('T05', TEM, '''return RE_ANSI.sub('', texte).replace''', '''return texte.replace''', 'couleurs ANSI retirées'),
    ('T06', TEM, '''        return False, sortie
    manquants, en_plus''', '''        return True, sortie
    manquants, en_plus''', '⑦ manifeste absent = bloquant (l\'inconnu bloque)'),
    ('T07', TEM, '''la == lb or (oa == ob and oa != '?')''', '''la == lb''', 'date RELATIVE : le décalage en jours concorde d\'un jour à l\'autre'),
    ('T07b', TEM, '''la == lb or (oa == ob and oa != '?')''', '''(oa == ob and oa != '?')''', 'date FIXE : le littéral concorde d\'un jour à l\'autre'),
    ('T10', TEM, '''''.join('|%s~%s' % j for j in jt)''', "''", 'les jetons de date font partie de l\'identité (deux dates fixes distinctes)'),
    ('T11', TEM, '''    return RE_DATE_HEURE.sub(r, libelle), jetons''', '''    return re.sub(r'(?<!\\d)\\d{1,2}:\\d{2}(?::\\d{2})?(?![\\d:])', '‹heure›', RE_DATE_HEURE.sub(r, libelle)), jetons''', 'une durée ou une heure SEULE reste littérale (1:30 ≠ 0:30)'),
    ('T12', TEM, '''    if m1 or m2 or p1 or p2:''', '''    if False:''', 'calibrage : les DEUX exécutions jouent exactement les mêmes témoins'),
    ('T13', TEM, '''        if retires and not accepter_retraits:\n            raise SystemExit(''', '''        if False:\n            raise SystemExit(''', 'calibrage : un retrait de témoin exige --accepter-retraits'),
    ('T14', TEM, '''    if meta.get('commit') != commit:''', '''    if False:''', 'calibrage : la passe répartie est du MÊME commit'),
    ('T15', TEM, '''if hashlib.sha256(brut).hexdigest() != (meta.get('journaux') or {}).get(nom):''', '''if False:''', 'calibrage : les journaux répartis n\'ont pas été modifiés après la passe (empreinte)'),
    ('T16', TEM, '''    if not isinstance(k, int) or k < 2:''', '''    if False:''', 'calibrage : la source est une VRAIE répartition (K ≥ 2)'),
    ('T17', TEM, '''    if meta.get('verdict_hors_identites') is not True:''', '''    if False:''', 'calibrage : la passe répartie de référence était valide'),
    ('T18', TEM, '''        if valider_manifeste(m) is not None:
            return None''', '''        if False:
            return None''', 'un manifeste vide ou d\'ancien format n\'est pas une référence'),
    ('T08', TEM, '''    if not manquants:''', '''    if not manquants and not en_plus:''', '(contrôle) une addition ne bloque pas'),
    ('T09', TEM, '''    if a['rouges'] != 0:
        ok = False''', '''    if False:
        ok = False''', '⑤ zéro rouge réel'),
    # ── 17/11/2026 (contre-expertise ciblée) : l'heure liée à une date ──
    ('T25', TEM, "            jetons.append((h, h))", "            pass", 'l\'HEURE collée à une date est un jeton significatif (07:30 ≠ 08:30)'),
    ('T26', TEM, "LIBELLES_A_HORLOGE = (re.compile(r\"l'heure de consultation\"),)", "LIBELLES_A_HORLOGE = ()", 'un libellé qui DÉCLARE porter l\'horloge de la passe voit son heure neutralisée'),
    ('T27', TEM, "        if m.group('h') and not horloge:", "        if m.group('h'):", 'la déclaration d\'horloge est honorée (sinon faux rouge d\'une passe à l\'autre)'),
]


MUT_REP = [
    ('RM01', REP, "if ST0.returncode != 0 or ETAT0.strip():", "if False:", '⓪ arbre propre au départ'),
    ('RM02', REP, "if RC0 != 0 or not DIST0 or not CONTENU0:", "if False:", '④a distant prouvé avant la passe'),
    ('RM03', REP, "if RC1 == 0 and DIST1 and DIST1 == DIST0:", "if RC1 == 0 and DIST1:", '④b E21 : le distant est resté le même pendant la passe'),
    ('RM04', REP, "if MAINTENANT == ARBRE:", "if True:", '③ HEAD inchangé'),
    ('RM05', REP, "FIN.stdout == ETAT0 and not any(os.path.exists(p) for p in PARTS): print('  ✅ ⑧", "FIN.stdout == ETAT0 or True and not any(os.path.exists(p) for p in PARTS): print('  ✅ ⑧", '⑧ arbre propre à l\'arrivée'),
    ('RM11', REP, "if FIN.returncode == 0 and FIN.stdout == ETAT0 and not any(os.path.exists(p) for p in PARTS): print('  ✅ ⑧", "if FIN.stdout == ETAT0 and not any(os.path.exists(p) for p in PARTS): print('  ✅ ⑧", '⑧ le `git status` FINAL doit réussir (défaut 5)'),
    ('RM12', REP, "'verdict_hors_identites': bool(ok_hors_identites)", "'verdict_hors_identites': True", 'PASSE.json ne dit « valide » que si la passe l\'a été'),
    ('RM13', REP, "if RP0.returncode != 0 or not ARBRE:", "if False:", 'git rev-parse HEAD au départ doit réussir'),
    ('RM14', REP, "'journaux': {'p%d.log' % i: hashlib.sha256(", "'journaux': {'p%d.log' % i: hashlib.md5(", 'PASSE.json porte l\'empreinte SHA-256 de chaque journal'),
    ('RM06', REP, "if infra[0] and all(x == infra[0] for x in infra) and all(", "if infra[0] and all(", '⑦ mêmes témoins d\'infrastructure dans chaque processus'),
    ('RM07', REP, "print('\\n'.join(l.replace('⑦', '⑨') for l in lignes_id)); ok = ok and ok_id", "print('\\n'.join(l.replace('⑦', '⑨') for l in lignes_id))", '⑨ identités de la réunion (R10/R11/R16)'),
    ('RM08', REP, "    ok = ok and ok_i\n", "    pass\n", '① ⑤ ⑥ lecture de chaque journal'),
    ('RM09', REP, "    if c == 0: print('  ✅ ② p%d", "    if True: print('  ✅ ② p%d", '② code de sortie de chaque processus'),
    ('RM10', REP, "if not mauvais: print('  ✅ ⑥ aucun plantage", "if True: print('  ✅ ⑥ aucun plantage", '⑥ aucun module planté'),
]


MUT_ANN = [
    ('AM01', ANN, "if tot[0] + tot[1] == 0:", "if False:", 'suite VIDE refusée'),
    ('AM02', ANN, "if (n_ok, n_ko) != tot:", "if False:", 'total recoupé avec les lignes de témoins'),
    ('AM03', ANN, "if len(fins) > 1:", "if False:", 'UNE seule ligne de total'),
    ('AM04', ANN, "fins = lignes_de_total(out, suite)", "fins = lignes_de_total(sortie, suite)", 'le total est sur stdout (pas seulement stderr)'),
    ('AM05', ANN, "if nom not in mes or mes[nom] > pl:", "if False:", 'défaut connu AGGRAVÉ refusé (plafond)'),
    ('AM06', ANN, "h = hashlib.sha256(d.stdout)", "h = hashlib.sha256(b'')", 'empreinte du diff (fichier déjà modifié qui change encore)'),
    ('AM07', ANN, "for f in sorted(x for x in nouveaux if x):", "for f in []:", 'empreinte des fichiers non suivis'),
    ('AM08', ANN, "                if manque:\n", "                if False:\n", 'identités d\'une suite calibrée'),
    ('AM09', ANN, "return 3 if strict else 0", "return 0", '--strict : un défaut connu ne sort jamais 0'),
    ('AM10', ANN, "        if strict:\n            return 2", "        if False:\n            return 2", '--strict : arbre sale refusé'),
    ('AM11', ANN, " and not (temoins.RE_T_GEN.match(l) or temoins.RE_B_GEN.match(l))]", "]", 'un libellé qui cite le total n\'est pas un total'),
    ('AM13', ANN, "if code == 0 and rouges:", "if False:", 'code 0 malgré des rouges'),
    ('AM14', ANN, "            elif strict:\n", "            elif False:\n", '--strict / --publication : une suite sans identités n\'est pas validée'),
    ('AM15', ANN, "                sans_identites.append(su['id'])", "                pass", 'le diagnostic sans identités se DIT (pas une validation)'),
    ('AM16', ANN, "strict, calibrer = '--strict' in args or '--publication' in args,", "strict, calibrer = '--strict' in args,", '--publication est synonyme de --strict'),
    ('AM12', ANN, "if code == 1 and not rouges:", "if False:", 'code 1 sans rouge lisible'),
    # ── 17/11/2026 : QA-retrait-annexe ──
    ('AM17', TEM, "        if retires and not accepter_retraits:\n            lignes = [", "        if False:\n            lignes = [", 'annexe : un référentiel qui RETIRE des identités est refusé sans accord'),
    ('AM18', TEM, "        if retires and not accepter_retraits:\n            lignes = [", "        if retires:\n            lignes = [", 'annexe : --accepter-retraits (l\'accord explicite) est entendu'),
    ('AM19', TEM, "    man.setdefault('annexes_prov', {})[suite] = {", "    man.setdefault('annexes_prov_x', {})[suite] = {", 'annexe : la provenance de chaque calibration est écrite'),
    ('AM20', ANN, "'--accepter-retraits' in sys.argv", "False", 'annexe : le drapeau --accepter-retraits est transmis à calibrer_annexe'),
    ('AM21', ANN, "                manque = {} if calibrer else temoins.comparer(ids, annexes[su['id']])[0]", "                manque = temoins.comparer(ids, annexes[su['id']])[0]", 'annexe : en --calibrer le retrait est jugé avec un diff lisible (pas par une simple erreur d\'identité)'),
]


MUT_SEL = [
    ('SM01', SEL, "if r.returncode != 0 and not tolere:", "if False:", 'une commande git qui échoue n\'est plus une sortie vide'),
    ('SM02', SEL, "    if f in decl:\n        z.add('fichier:' + f)", "    if False:\n        z.add('fichier:' + f)", 'les déclencheurs `fichier:` du registre produisent leur zone'),
    ('SM03', SEL, "return re.fullmatch(r\"\\s*const CACHE = 'ft-v\\d+'\\s*;?\\s*(//.*)?\", x) is not None", "return re.match(r\"\\s*const CACHE = 'ft-v\\d+'\", x) is not None", 'sw.js:version = le numéro SEUL (pas de code après)'),
    ('SM04', SEL, "        if sc.get('manuel_si'):", "        if sc['type'] in ('MANUEL', 'HYBRIDE') and sc.get('manuel_si') and sc['niveau'] in ('T4', 'T6'):", 'les gestes manuels des scénarios AUTO sont restitués'),
    ('SM05', SEL, "if inconnus and not (args and args[0] == '--diff'):", "if False:", 'un nom inconnu est refusé'),
    ('SM06', SEL, "if publication and manque:", "if False:", '--publication : fonction sans scénario = refus'),
    ('SM07', SEL, "manque = [n for n, _, _ in res['sans_scenario'] if n not in accepter]", "manque = [n for n, _, _ in res['sans_scenario']]", 'l\'exception explicite (--accepter-sans-scenario) est honorée'),
    ('SM08', SEL, "        zones |= zones_fichier(f, decl)      # AVANT", "        pass      # AVANT", 'la zone « fichier: » se cumule avec infra-test / documentation'),
]


MUT_DEC = [
    ('DM01', VER, "else if (!(T[i].type === 'EmptyStatement' && b === ';')) erreurs.push('② copie '", "else if (false) erreurs.push('② copie '", '② chaque instruction est identique ou vide, jamais réécrite'),
    ('DM02', VER, "if (s.slice(0, m.start) !== src.slice(0, M.start) || s.slice(m.end) !== src.slice(M.end))", "if (false)", '① hors de la fonction principale, la copie est identique au runner'),
    ('DM03', VER, "if (joue[i].length === 0) erreurs.push('③ OUBLIÉE", "if (false) erreurs.push('③ OUBLIÉE", '③ rien d\'oublié'),
    ('DM04', VER, "if (joue[i].length > 1 && !estInfra(t, i, iClose))", "if (false && !estInfra(t, i, iClose))", '③ rien de doublé hors infrastructure'),
    ('DM05', VER, "if (ps.size !== 1) erreurs.push('④ module '", "if (false) erreurs.push('④ module '", '④ tous les appels d\'un module dans la même copie'),
    # DM06 (la répartition cite un processus hors bornes) : RETIRÉ le 16/11/2026 — le contrôle est REDONDANT avec « instruction gardée N fois » du même découpeur (un processus 7 pour K = 3 n'est gardé par personne : refus de toute façon). Un mutant qui survit par construction n'est pas une preuve.
    ('DM07', DEC, "for (const m of Object.keys(rep)) if (!presents.has(m)) stop(", "for (const m of Object.keys(rep)) if (false) stop(", 'la répartition ne cite que des modules du runner'),
    ('DM08', DEC, "for (const x of a.args) if (!INFRA.has(x)) stop(", "for (const x of a.args) if (false) stop(", 'un module ne reçoit que l\'infrastructure'),
]


MUT_TEM = [
    ('CM01', TEM, "    if not croiser:", "    if False:", 'calibrage sans source indépendante (appel direct)'),
    ('CM02', TEM, '''    if not commit:''', '''    if False:''', 'calibrage : le commit (provenance) est obligatoire'),
    ('CM03', TEM, '''    raison = valider_manifeste(man)
    if raison:
        raise SystemExit('⛔ manifeste refusé avant écriture : ' + raison)''', '''    raison = None
    if raison:
        raise SystemExit('⛔ manifeste refusé avant écriture : ' + raison)''', 'écriture : un manifeste incohérent est refusé AVANT d\'écrire'),
    ('CM04', TEM, '''    if not _compteurs_valides(dict(ids)):''', '''    if False:''', 'calibration annexe : aucune identité = refus'),
    ('CM05', TEM, '''        raise SystemExit('⛔ calibrage annexe refusé : le manifeste principal %s est absent''', '''        man = {'version': 2, 'calibre': {'commit': 'm', 'n': 1}, 'passe': {'a' * 12: 1}}; chemin and ('⛔ calibrage annexe refusé : le manifeste principal %s est absent''', 'calibration annexe : jamais de création du manifeste principal'),
    ('CM06', TEM, '''    if len(a['totaux']) != 1 or a['totaux'][0][1] != 0 or a['n_ok'] != a['totaux'][0][0] or a['rouges'] != 0:''', '''    if False:''', 'calibrage : une passe entièrement verte et cohérente'),
    ('CM07', TEM, "        if retires and not accepter_retraits:\n            lignes = [", "        if False:\n            lignes = [", 'calibrer_annexe (appel direct) : un retrait sans accord est refusé'),
    ('CM08', TEM, " or x.get('n') != sum(an[s].values())", " or False", 'une provenance d\'annexe incohérente (N ≠ somme) invalide le manifeste'),
]


CIBLES = {'valide': (MUT, 'valide', (VAL, TEM)), 'repartie': (MUT_REP, 'repartie', (REP, TEM)), 'annexe': (MUT_ANN, 'annexe', (ANN, TEM)), 'selecteur': (MUT_SEL, 'selecteur', (SEL, TEM)),
          'decoupe': (MUT_DEC, 'decoupe', (DEC, VER, TEM)), 'temoins': (MUT_TEM, 'temoins', (TEM,))}


def main():
    cible = sys.argv[1] if len(sys.argv) > 1 else 'valide'
    if cible not in CIBLES:
        print(__doc__); return 2
    liste, commande, fichiers = CIBLES[cible]
    ids = [a for a in sys.argv[2:] for a in a.split(',')] if len(sys.argv) > 2 else None
    tues, vivants, inappliques = [], [], []
    for ident, fichier, ancre, rempl, quoi in liste:
        if ids and ident not in ids:
            continue
        src = open(os.path.join(RACINE, fichier), encoding='utf-8').read()
        if src.count(ancre) != 1:
            inappliques.append((ident, 'ancre trouvée %d fois' % src.count(ancre))); print('%s ⚠️ NON APPLIQUÉ (%s)' % (ident, inappliques[-1][1])); continue
        racine = tempfile.mkdtemp(prefix='mutant-%s-' % ident)
        os.makedirs(racine + '/tools')
        for f in fichiers:
            shutil.copy(os.path.join(RACINE, f), racine + '/' + f)
        open(os.path.join(racine, fichier), 'w', encoding='utf-8').write(src.replace(ancre, rempl))
        sortie = tempfile.mkdtemp(prefix='mutant-sortie-')
        env = dict(os.environ, GARDE_RACINE=racine)
        r = subprocess.run([sys.executable, os.path.join(RACINE, 'tests', 'gardes', 'arene.py'), commande, sortie, '--arret-premier-rouge'], capture_output=True, text=True, env=env)
        if r.returncode not in (0, 1) or 'Traceback' in r.stderr:      # ⛔ une arène PLANTÉE n'est pas un mutant « survivant » ni « tué » : le résultat n'existe pas (c'est ce qui masquait 7 « survivants » le 16/11)
            inappliques.append((ident, 'arène plantée (code %s)' % r.returncode)); print('%s ⚠️ ARÈNE PLANTÉE (code %s) : %s' % (ident, r.returncode, (r.stderr.strip().split('\n') or [''])[-1][:140])); shutil.rmtree(racine, ignore_errors=True); shutil.rmtree(sortie, ignore_errors=True); continue
        rouges = [l.split()[0] for l in r.stdout.split('\n') if len(l.split()) > 1 and l.split()[1] == 'FAIL']      # la COLONNE statut, pas un mot du libellé
        (tues if rouges else vivants).append(ident)
        print('%s %-7s %s  → %s' % (ident, 'TUÉ' if rouges else 'SURVIT', quoi, ('scénario ' + ','.join(rouges)) if rouges else '—'))
        shutil.rmtree(racine, ignore_errors=True); shutil.rmtree(sortie, ignore_errors=True)
    print('\n──── %d tué(s) · %d survivant(s) · %d non appliqué(s) ──── survivants : %s' % (len(tues), len(vivants), len(inappliques), ', '.join(vivants) or 'aucun'))
    return 0 if not vivants and not inappliques else 1


if __name__ == '__main__':
    sys.exit(main())
