#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CONTROLE NEGATIF — NUT-VERROU-01 (29/10/2026) : le banc `tools/banc_nut_verrou.js` sait-il ROUGIR, et au BON endroit ?

[!!] SUR UNE COPIE JETABLE, JAMAIS SUR LE DEPOT (BUGS.md §60). Chaque mutation retire UN morceau du verrou dans un clone ; le depot n'est
jamais ecrit. Point de depart : 0 rouge sur l'arbre sain. Une mutation est TUEE si le banc rougit (code 1) ET si CHACUN des temoins attendus
fait partie des rouges. Un PLANTAGE (code 2) n'est jamais un verdict. Une ancre absente ou multiple arrete tout. L'extrait ORIGINAL et
l'extrait MUTE sont imprimes.
Usage : python3 tools/mut_nut_verrou.py [V01|V02,V05|...|V15+]   (« V15+ » = de V15 jusqu'a la fin)
"""
import os, re, shutil, subprocess, sys, tempfile, time

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
N = 'nutrition-v2.js'
A = 'app.js'
S = lambda *c: ['B-NVV ' + x + ' ' for x in c]

MUT = [
    ('V01 le moteur ne refuse plus une correction sur fiche identifiee',
     [(N, "    if (verrou && corr && corr.length) return ko('FICHE_VERROUILLEE', String(corr[0] && corr[0].c));", "    /* V01 */")], S('M5', 'M5b', 'P21'), 'GARDE'),
    ('V02 le predicat du verrou ne reconnait plus aucune fiche',
     [(N, "    return !!(f && typeof f === 'object' && (f.fiab === 'source' || SOURCES_IDENTIFIEES.indexOf(f.source) >= 0));", "    return false;")], S('M1', 'M5', 'P1', 'P14'), 'GARDE'),
    ('V03 le predicat verrouille aussi les fiches declarees (trop large)',
     [(N, "(f.fiab === 'source' || SOURCES_IDENTIFIEES.indexOf(f.source) >= 0));", "(f.fiab === 'source' || f.fiab === 'declaree' || SOURCES_IDENTIFIEES.indexOf(f.source) >= 0));")], S('M1', 'M6'), 'GARDE'),
    ('V04 la reprise rend de nouveau les anciennes corrections',
     [(N, "      if (verrouillee(fiche) && corr.length) return {", "      if (false && corr.length) return {")], S('M10', 'P20b'), 'GARDE'),
    ('V05 l historique additif n2.hc n est plus ecrit',
     [(N, "        if (hc.length) n2.hc = hc;", "        /* V05 */")], S('M11', 'P8'), 'GARDE'),
    ('V06 les anciennes corrections ne passent plus dans l historique',
     [(N, "verrou && Array.isArray(rp.n2.corr) ? rp.n2.corr : []", "[]")], S('M11', 'M12', 'P8'), 'GARDE'),
    ('V07 la note « correction ecartee » n est plus posee',
     [(N, "        if (verrou && Array.isArray(rp.n2.corr) && rp.n2.corr.length && n2.no.indexOf('correction-ecartee') < 0) n2.no.push('correction-ecartee');", "        /* V07 */")], S('M11', 'P8', 'P9'), 'GARDE'),
    ('V08 l historique tronque de nouveau EN SILENCE (les plus anciennes traces disparaissent)',
     [(N, "        if (hc.length > HC_MAX) return ko('HISTORIQUE_PLEIN', String(hc.length));", "        if (hc.length > HC_MAX) hc = hc.slice(hc.length - HC_MAX);")], S('M13', 'M22', 'P30'), 'GARDE'),
    ('V09 « Mettre X kcal » (ajout) modifie de nouveau la reference',
     [(A, "  if(_n2VerrouEcran('af')) return;   // 🔒 NUT-VERROU-01 : « Mettre X kcal » ne modifie jamais la référence d'une fiche identifiée", "  /* V09 */")], S('P16'), 'GARDE'),
    ('V10 « Mettre X kcal » (modification) modifie de nouveau la reference',
     [(A, "  if(_n2VerrouEcran('ef')) return;   // 🔒 NUT-VERROU-01 : idem, dans la modification", "  /* V10 */")], S('P3'), 'GARDE'),
    ('V11 la saisie directe (ajout) corrige de nouveau',
     [(A, "  if(_N2_CHAMPS.indexOf(c)>=0 && _n2VerrouEcran('af')){ _n2VerrouRendre(el); _afCorr={}; _afMontrerCorr(); _afCoherence(); return; }", "  /* V11 */")], S('P15'), 'GARDE'),
    ('V12 la saisie directe (modification) corrige de nouveau',
     [(A, "  if(_N2_CHAMPS.indexOf(c)>=0 && _n2VerrouEcran('ef')){ _n2VerrouRendre(el); _efCorr={}; _efCoherence(); return; }", "  /* V12 */")], S('P2'), 'GARDE'),
    ('V13 les champs ne sont plus en lecture seule',
     [(A, "    el.readOnly=v; el.style.opacity=v?'0.78':'';", "    el.readOnly=false; el.style.opacity=v?'0.78':'';")], S('P1', 'P14'), 'GARDE'),
    ('V14 l ecran d ajout transmet de nouveau les corrections au moteur',
     [(A, "corrections:_n2VerrouEcran('af') ? [] : _n2CorrectionsEcran(_afCorr)})};", "corrections:_n2CorrectionsEcran(_afCorr)})};")], S('P17'), 'GARDE'),
    ('V15 la modification transmet de nouveau les corrections au moteur',
     [(A, "corrections:verr ? [] : _n2CorrectionsEcran(_efCorr)});", "corrections:_n2CorrectionsEcran(_efCorr)});")], S('P26'), 'GARDE'),
    ('V16 l avertissement d incoherence propose de nouveau « Mettre X kcal » sur une fiche verrouillee (plafond)',
     [(A, "      +(_verr ? '<div style=\"color:var(--t3);margin-top:6px;\">Cette fiche est verrouillée : seule la quantité se modifie.</div>' : '<button onclick=\"'+corrigeur+'('+plaf.theo+')", "      +(false ? '<div>' : '<button onclick=\"'+corrigeur+'('+plaf.theo+')")], S('P18b'), 'GARDE'),
    ('V17 l avertissement d incoherence propose de nouveau « Mettre X kcal » (ecart)',
     [(A, "    +(_verr ? '<div style=\"color:var(--t3);margin-top:6px;\">Cette fiche est verrouillée : seule la quantité se modifie.</div>' : '<button onclick=\"'+corrigeur+'('+Math.round(theo)+')", "    +(false ? '<div>' : '<button onclick=\"'+corrigeur+'('+Math.round(theo)+')")], S('P18'), 'GARDE'),
    ('V18 la modification n affiche plus le calcul de la fiche a l ouverture',
     [(A, "  if(_n2VerrouEcran('ef')) _efApplyFiche();", "  /* V18 */")], S('P6', 'P31'), 'GARDE'),
    ('V19 un favori recopie de nouveau la correction d une fiche identifiee',
     [(A, " && !(s.n2.f && NUT2.verrouillee({source:s.n2.f.src, fiab:s.n2.f.fiab}))) n2.corr=", ") n2.corr=")], S('P25', 'P33'), 'GARDE'),
    ('V20 le badge ne dit plus qu une ancienne correction a ete ecartee',
     [(A, "m.push('ancienne correction écartée');", "void 0;")], S('P9'), 'GARDE'),
    ('V21 l ecran d ajout ne reconnait plus la fiche verrouillee',
     [(A, "    if(pre==='af') return !!(typeof _bcNutr==='object' && _bcNutr && N.verrouillee(_n2FicheBc()));", "    if(pre==='af') return false;")], S('P14', 'P15', 'P16', 'P18'), 'GARDE'),
    ('V22 la modification ne reconnait plus la fiche verrouillee',
     [(A, "    if(pre==='ef') return !!(_efR && ((_efR.fiche && N.verrouillee(_efR.fiche)) || _efR.ficheSuspecte));", "    if(pre==='ef') return false;")], S('P1', 'P2', 'P3'), 'GARDE'),
    ('V23 le changement de produit ne deverrouille plus les champs (reset de l ecran d ajout)',
     [(A, "    el.readOnly=v; el.style.opacity=v?'0.78':'';\n    if(v) el.dataset.ref=el.value; else delete el.dataset.ref;", "    el.readOnly=true; el.style.opacity=v?'0.78':'';\n    if(v) el.dataset.ref=el.value; else delete el.dataset.ref;")], S('P19', 'P10', 'P12'), 'GARDE'),
    # ── FINALISATION (29/10) ──
    ('V24 le verrou ne regarde de nouveau QUE la fiabilite (un produit identifie « estime » redevient modifiable)',
     [(N, "    return !!(f && typeof f === 'object' && (f.fiab === 'source' || SOURCES_IDENTIFIEES.indexOf(f.source) >= 0));", "    return !!(f && typeof f === 'object' && f.fiab === 'source');")], S('M17', 'M18', 'M20', 'P17b', 'P27'), 'GARDE'),
    ('V25 Open Food Facts n est plus reconnu comme source identifiee',
     [(N, "var SOURCES_IDENTIFIEES = ['ciqual', 'off', 'marque'];", "var SOURCES_IDENTIFIEES = ['ciqual', 'marque'];")], S('M17', 'M18', 'P27'), 'GARDE'),
    ('V26 le moteur ne refuse plus un changement de NOM sur fiche identifiee',
     [(N, "      if (verrou && texte(rp.name) && nom.slice(0, NOM_MAX) !== texte(rp.name).slice(0, NOM_MAX)) return ko('NOM_VERROUILLE');", "      /* V26 */")], S('M21'), 'GARDE'),
    ('V27 le verrou du nom s applique aussi aux fiches declarees (trop large)',
     [(N, "      if (verrou && texte(rp.name) && nom.slice", "      if (texte(rp.name) && nom.slice")], S('M21'), 'GARDE'),
    ('V28 le champ nom de « Modifier » n est plus en lecture seule',
     [(A, "  if(nm){ nm.readOnly=v; nm.style.opacity=v?'0.78':''; }", "  if(nm){ nm.readOnly=false; nm.style.opacity=v?'0.78':''; }")], S('P27', 'P28'), 'GARDE'),
    ('V29 « Enregistrer » reprend le nom du CHAMP au lieu de celui de la ligne (fiche identifiee)',
     [(A, "  const nom=(verr ? String(e.name||'') : (String((document.getElementById('ef-name')||{}).value||'').trim() || String(e.name||''))).slice(0,80);", "  const nom=(String((document.getElementById('ef-name')||{}).value||'').trim() || String(e.name||'')).slice(0,80);")], S('P28d'), 'GARDE'),
    ('V30 l ecran d ajout laisse passer un autre nom sous un produit identifie',
     [(A, "        if(_afNorm(nom).slice(0,60)!==_afNorm(nf).slice(0,60))", "        if(false)")], S('P29'), 'GARDE'),
    ('V31 historique : une borne a 20 refuse deja a 20 (decalage d une unite)',
     [(N, "        if (hc.length > HC_MAX) return ko('HISTORIQUE_PLEIN', String(hc.length));", "        if (hc.length >= HC_MAX) return ko('HISTORIQUE_PLEIN', String(hc.length));")], S('M22', 'M13'), 'GARDE'),
    ('V32 le repas seul recalcule de nouveau la ligne (chemin « repas seul » coupe)',
     [(A, "    if(q0 && _efQteIdentique(R, q0)){\n      if(!_editFoodMeal)", "    if(false && q0 && _efQteIdentique(R, q0)){\n      if(!_editFoodMeal)")], S('P31b'), 'GARDE'),
    ('V33 changerRepas partage la ligne d origine au lieu de la copier',
     [(N, "    try { c = JSON.parse(JSON.stringify(l)); } catch (err) { return ko('LIGNE_ILLISIBLE'); }\n    c.meal = r;", "    c = l;\n    c.meal = r;")], S('M24'), 'GARDE'),
    ('V34 la confirmation d abandon d une ancienne correction disparait (1 seul « Enregistrer »)',
     [(A, "      if(chg && _efAbandonVu!==cle){", "      if(false && chg && _efAbandonVu!==cle){")], S('P7d'), 'GARDE'),
    ('V35 la ligne ouverte montre de nouveau la fiche recalculee au lieu des valeurs enregistrees',
     [(A, "el.value=Number.isFinite(e[c])?e[c]:''; });\n    _n2VerrouChamps('ef'); _efCoherence();", "void 0; });\n    _n2VerrouChamps('ef'); _efCoherence();")], S('P6', 'P7c', 'P31'), 'GARDE'),
    ('V36 la note « corrigee a la main / abandonnee » n est plus affichee',
     [(A, "  const dire=h=>{ if(nt){ nt.innerHTML=h; nt.style.display=h?'block':'none'; nt.style.outline=''; } };", "  const dire=h=>{ };")], S('P6', 'P7b', 'P31'), 'GARDE'),
    ('V37 l avertissement NON_RESOLU d un produit verrouille ne dit plus la sortie',
     [(A, "          ? '<div style=\"color:var(--t3);margin-top:6px;\">Cette fiche est verrouillée : ses valeurs ne se modifient pas. Choisis un <b>autre produit</b>", "          ? '<div style=\"color:var(--t3);margin-top:6px;\">Cette fiche est verrouillée : ses valeurs ne se modifient pas. Choisis un <b>autre</b>")], S('P17b'), 'GARDE'),
    ('V38 un favori recopie de nouveau la correction d un produit identifie « estime » (fiabilite seule)',
     [(A, "NUT2.verrouillee({source:s.n2.f.src, fiab:s.n2.f.fiab})", "s.n2.f.fiab==='source'")], S('P33'), 'GARDE'),
    ('V39 l historique plein ne dit plus rien a la personne (message de refus vide)',
     [(A, "    HISTORIQUE_PLEIN:'L\\'historique des anciennes corrections de cette ligne est plein", "    HISTORIQUE_PLEIN_X:'L\\'historique des anciennes corrections de cette ligne est plein")], S('P30'), 'GARDE'),
    ('V40 « Enregistrer » sur historique plein ecrit quand meme (le refus du moteur est ignore)',
     [(A, "      if(!essai.ok){ toast(_n2Message(essai).replace('rien n\\'a été ajouté','la ligne n\\'a pas été modifiée'),'error'); return; }", "      /* V40 */")], S('P30'), 'GARDE'),
    ('V41 changer le repas ne persiste pas (le repas seul n est pas ecrit)',
     [(A, "      if(_editFoodMeal!==e.meal){\n        const rm=", "      if(false){\n        const rm=")], S('P28b', 'P31b'), 'GARDE'),
    ('V42 le moteur recalcule le repas seul en ajoutant un historique (changerRepas ecrit n2.hc)',
     [(N, "    c.meal = r;\n    return { ok: true, ligne: c };", "    c.meal = r; if (c.n2 && Array.isArray(c.n2.corr) && c.n2.corr.length) c.n2.hc = c.n2.corr.slice();\n    return { ok: true, ligne: c };")], S('M24'), 'GARDE'),
]

def banc(arbre):
    r = subprocess.run(['node', 'tools/banc_nut_verrou.js'], cwd=arbre, capture_output=True, text=True, timeout=900)
    out = r.stdout or ''
    last = [l for l in out.split('\n') if ' OK / ' in l]
    rouges = [l.split('rouge : ', 1)[1] for l in out.split('\n') if l.startswith('  rouge : ')]
    return r.returncode, (last[-1].strip() if last else (r.stderr or '')[-160:]), rouges


def cloner():
    tmp = tempfile.mkdtemp(prefix='mut_verrou_')
    a = os.path.join(tmp, 'a')
    shutil.copytree(SRC, a, ignore=shutil.ignore_patterns('.git', 'node_modules', '*.pdf', '__pycache__', 'audits', 'worktrees'))
    return tmp, a


def main():
    seul = sys.argv[1] if len(sys.argv) > 1 else None
    tmp0, a0 = cloner()
    rc, res, _ = banc(a0)
    shutil.rmtree(tmp0, ignore_errors=True)
    if rc != 0:
        print('  !! ARBRE SAIN DEJA ROUGE OU PLANTE — controle refuse :', res); return 1
    print('  arbre sain : %s (point de depart valide)\n' % res)
    conformes, total = 0, 0
    depuis = bool(seul and seul.endswith('+'))
    if depuis:
        seul = seul[:-1]
    actif = not depuis
    for nom, rempl, attendus, attendu in MUT:
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
            chk = subprocess.run(['node', '-e', "new Function(require('fs').readFileSync('%s','utf8'))" % f], cwd=arbre, capture_output=True)
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
