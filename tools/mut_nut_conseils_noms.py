#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CONTROLE NEGATIF — NUT-CA-FAA'C (07/11/2026) : le banc `tools/banc_nut_conseils_noms.js` (B-NCN) sait-il ROUGIR, et au BON endroit ?

[!!] SUR UNE COPIE JETABLE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque mutation defait UN morceau d'une des trois corrections (F : echappement du nom dans le bouton
d'un repas habituel · A/A' : admissibilite d'une fiche pour une idee · C : portion observee) dans un clone ; le depot n'est jamais ecrit.
Point de depart : 0 rouge sur l'arbre sain. Une mutation est TUEE si le banc rougit (code 1) ET si CHACUN des temoins attendus fait partie des rouges.
Un PLANTAGE (code 2) n'est jamais un verdict. Une ancre absente ou multiple arrete tout. L'extrait ORIGINAL et l'extrait MUTE sont imprimes.
Usage : python3 tools/mut_nut_conseils_noms.py [M01|M02,M05|M10+]   (« M10+ » = de M10 jusqu'a la fin)
"""
import os, re, shutil, subprocess, sys, tempfile

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = 'app.js'
SC = 'screens.js'
W = lambda *c: ['B-NCN ' + x + ' ' for x in c]

GATE = "    if(!_f || !_n2PeutNourrirIdee(e, vf)) return;\n    vus[k]=1;"
MUT = [
    ('M01 la fiche refusee par « + Ajouter » nourrit de nouveau une idee (plus de garde d\'admissibilite)',
     [(A, GATE, "    if(!_f) return;\n    vus[k]=1;")], W('A01', 'A01b', 'A01c', 'A02')),
    ('M02 une ligne sans quantite (« a completer ») est prise pour un refus de FICHE : les anciennes lignes disparaissent des idees',
     [(A, "function _n2PeutNourrirIdee(src, verifiees){ const a=_n2Apercu(src, verifiees); return a.ok ? !a.raison : !!a.aCompleter; }",
          "function _n2PeutNourrirIdee(src, verifiees){ const a=_n2Apercu(src, verifiees); return a.ok && !a.raison; }")], W('A04')),
    ('M03 un aliment sans fiche utilisable masque de nouveau, PAR SON NOM, le produit admissible (le nom est marque « vu » avant l\'admission)',
     [(A, GATE, "    vus[k]=1;\n    if(!_f || !_n2PeutNourrirIdee(e, vf)) return;")], W('A02', 'A03', 'A03b')),
    ('M04 le verdict d\'admission ignore ce que le moteur refuse a l\'ajout (tout ce qui a une fiche est admis)',
     [(A, "function _n2PeutNourrirIdee(src, verifiees){ const a=_n2Apercu(src, verifiees); return a.ok ? !a.raison : !!a.aCompleter; }",
          "function _n2PeutNourrirIdee(src, verifiees){ const a=_n2Apercu(src, verifiees); return a.ok || !!a.aCompleter; }")], W('A01', 'A01b', 'A01c', 'A02')),
    ('M05 la frequence recompte les lignes masquees',
     [(A, "(S.foodLog||[]).forEach(e=>{ if(!e || !_n2Propose(e, e.ts)) return; const k=cle(e.name);", "(S.foodLog||[]).forEach(e=>{ if(!e) return; const k=cle(e.name);")], W('C05')),
    ('M06 la portion observee recompte les prises masquees / d\'avant la remise a zero',
     [(A, "    if(!_n2Propose(e, e.ts)) return;\n    if(ident && _n2Cle(e) !== ident) return;", "    if(ident && _n2Cle(e) !== ident) return;")], W('C02', 'C02b')),
    ('M07 la portion observee ne distingue plus l\'identite (deux produits de meme nom se melangent)',
     [(A, "    if(ident && _n2Cle(e) !== ident) return;\n", "")], W('C03', 'C03c')),
    ('M08 g et ml entrent de nouveau dans la meme mediane',
     [(A, "    if(u !== echelle) return;                // une seule echelle a la fois : celle de la fiche".replace('echelle a la fois', 'échelle à la fois'), "    if(u !== 'g' && u !== 'ml') return;")], W('C01', 'C01b', 'C01c')),
    ('M09 l\'idee ne lit plus l\'identite ni l\'unite du candidat (l\'appel redevient `_portionObservee(al.name)`)',
     [(A, "    const obs = _portionObservee(al.name, al._fiche && al._fiche.base, al._cle);", "    const obs = _portionObservee(al.name);")], W('C03c')),
    ('M10 le bouton d\'un repas habituel n\'echappe plus que l\'apostrophe (l\'ancien code)',
     [(SC, "${_escAttrJs(r.sig).replace(/\\n/g,'\\\\n').replace(/\\r/g,'\\\\r')}", "${String(r.sig).replace(/'/g,\"\\\\'\")}")],
     W('F-guillemet', 'F-antislash', 'F-antislash_apostrophe', 'F-entite_apostrophe', 'F-balise_et_attribut', 'F-caracteres_html', 'F-source_externe_entites', 'F-ciqual_reel')),
    ('M11 le retour a la ligne et le retour chariot d\'un nom ne sont plus proteges',
     [(SC, ".replace(/\\n/g,'\\\\n').replace(/\\r/g,'\\\\r')}", "}")], W('F-retour_ligne', 'F-retour_chariot')),
    ('M12 l\'echappement ne protege plus que du HTML (ni antislash ni apostrophe)',
     [(SC, "${_escAttrJs(r.sig).replace(/\\n/g,'\\\\n').replace(/\\r/g,'\\\\r')}", "${_escNote(String(r.sig))}")], W('F-guillemet', 'F-antislash', 'F-antislash_apostrophe', 'F-apostrophe')),
    ('M13 « Ce qu\'il te reste » ECRIT dans le journal (une ligne refusee est « recalculee » en silence)',
     [(A, GATE, "    if(!_f) return;\n    if(!_n2PeutNourrirIdee(e, vf)){ e.etat='recalcule'; return; }\n    vus[k]=1;")], W('A01d')),
]


def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_nut_conseils_noms.js'], cwd=arbre, capture_output=True, text=True, timeout=900)
    out = r.stdout or ''
    last = [l for l in out.split('\n') if ' OK / ' in l]
    rouges = [l.split('rouge : ', 1)[1] for l in out.split('\n') if l.startswith('  rouge : ')]
    return r.returncode, (last[-1].strip() if last else (r.stderr or '')[-160:]), rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_ncn_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '*.zip', '__pycache__', 'audits', 'worktrees', 'clone', 'docs'))
    return tmp, a


def main():
    seul = sys.argv[1] if len(sys.argv) > 1 else None
    tmp0, a0 = cloner()
    rc, res, _ = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rc != 0:
        print('  !! ARBRE SAIN DEJA ROUGE OU PLANTE - controle refuse :', res); return 1
    print('  arbre sain : %s (point de depart valide)\n' % res)
    conformes, total = 0, 0
    depuis = bool(seul and seul.endswith('+'))
    if depuis:
        seul = seul[:-1]
    actif = not depuis
    for nom, rempl, attendus in MUT:
        if depuis and nom.startswith(seul + ' '):
            actif = True
        if seul and not depuis and not any(nom.startswith(x + ' ') for x in seul.split(',')):
            continue
        if depuis and not actif:
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
            chk = subprocess.run(['node', '--check', f], cwd=arbre, capture_output=True)
            if chk.returncode != 0:
                print('  !! MUTATION QUI CASSE LA SYNTAXE (refusee) : %s' % nom); shutil.rmtree(tmp, ignore_errors=True); return 1
        rc, res, rouges = banc(arbre)
        shutil.rmtree(tmp, ignore_errors=True)
        manquants = [w for w in attendus if not any(r.startswith(w) for r in rouges)]
        ok = rc == 1 and not manquants
        conformes += ok
        print('  %s %s -> %s  [%s]' % ('TUEE      ' if ok else 'SURVIVANTE', nom[:60], res, 'code %d' % rc))
        if manquants:
            print('       temoin(s) attendu(s) reste(s) VERT(S) : %s' % ' · '.join(manquants))
        if rc == 2:
            print('       PLANTAGE : ce n\'est pas un verdict')
        print('       rouges : %s\n' % (' · '.join(re.sub(r' (⭐|—|:|\().*', '', x)[:24] for x in rouges) or 'aucun'))
    print('\n%d/%d tuees (conformes)' % (conformes, total))
    return 0 if conformes == total and total > 0 else 1


if __name__ == '__main__':
    sys.exit(main())
