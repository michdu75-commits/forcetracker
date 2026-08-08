#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🖼️  L'OUTIL DES IMAGES D'EXERCICES  —  créé le 08/08/2026 à la demande de Michel.

    « Je peux pas ajouter comme un dossier à la figurine ? »

POURQUOI IL EXISTE
------------------
Ajouter une image demandait, à la main : convertir le GIF, le renommer, écrire la ligne
dans `EX_YT` (log.js). Trois gestes par image, 42 images restantes → 126 gestes.
Cet outil fait les trois premiers. Il ne fait PAS le quatrième : REGARDER.

⚠️  CE QU'IL NE FERA JAMAIS TOUT SEUL — et c'est délibéré
--------------------------------------------------------
Il ne rattache rien automatiquement. Le 08/08, deux fichiers ont menti dans la même archive :

  · `rotations-russes-obliques.gif`  → nom JUSTE, et j'ai quand même mal lu l'image
    (« assis sur un banc » ; en réalité assis au sol, pieds sous les cales — Michel a corrigé) ;
  · `touche-talon-alternes.gif`      → nom FAUX, et l'image montrait le bon mouvement.

*Un nom de fichier est une affirmation, pas une preuve.* Rattacher au nom, c'est risquer de
faire travailler quelqu'un sur un autre exercice — le coût de l'erreur n'est pas symétrique
(**R29**). L'outil PROPOSE et fabrique une planche de vignettes ; un humain TRANCHE.

    « Je préfère que tu regardes 10 figurines à fond que 300 en survolant. » — Michel, 08/08

USAGE
-----
    python3 tools/images.py etat                    # que manque-t-il ? (aucune écriture)
    python3 tools/images.py proposer <dossier>      # rapproche + planche à regarder
    python3 tools/images.py convertir <fichier> <exercice>   # convertit + écrit la ligne EX_YT

CONVENTIONS RESPECTÉES (mesurées sur les 293 images existantes)
--------------------------------------------------------------
  · WebP, 480 px sur le grand côté, animation conservée si la source est animée ;
  · fond BLANC OPAQUE (une source transparente est aplatie — sinon la figurine
    apparaîtrait sur fond noir dans l'app, seule de son espèce) ;
  · poids visé < 200 Ko (médiane du dossier : 96 Ko).
"""
import io, os, re, sys, unicodedata, hashlib

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOSSIER_IMG = os.path.join(RACINE, 'exercises')
LARGEUR_MAX = 480
POIDS_ALERTE = 200 * 1024


# ── Lecture du catalogue ────────────────────────────────────────────────────────────────
def catalogue():
    """(noms uniques, groupe par nom) depuis EXLIB — gère les apostrophes échappées."""
    src = io.open(os.path.join(RACINE, 'constants.js'), encoding='utf-8').read()
    paires = [(re.sub(r"\\(.)", r"\1", m.group(1)), m.group(2))
              for m in re.finditer(r"\{n:'((?:[^'\\]|\\.)*)',g:'([^']*)'", src)]
    return sorted(set(n for n, _ in paires)), dict(paires)


def images_declarees():
    """{nom d'exercice: chemin} depuis EX_YT (log.js)."""
    src = io.open(os.path.join(RACINE, 'log.js'), encoding='utf-8').read()
    d = src.index('const EX_YT={')
    f = src.index('\n};', d)
    out = {}
    for m in re.finditer(r"'((?:[^'\\]|\\.)*)'\s*:\s*\{([^{}]*)\}", src[d:f]):
        img = re.search(r"img:'([^']+)'", m.group(2))
        if img:
            out[re.sub(r"\\(.)", r"\1", m.group(1))] = img.group(1)
    return out


def norm(s):
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()


def mots(s):
    # on jette les mots vides qui ne discriminent rien
    vides = {'de', 'la', 'le', 'les', 'du', 'des', 'a', 'au', 'aux', 'en', 'sur',
             'avec', 'un', 'une', 'et', 'exercice', 'musculation', 'exercices'}
    return set(w for w in norm(s).split() if w not in vides and len(w) > 1)


# ── Commandes ───────────────────────────────────────────────────────────────────────────
def cmd_etat():
    noms, grp = catalogue()
    img = images_declarees()
    absents = [p for p in img.values() if not os.path.exists(os.path.join(RACINE, p))]
    sans = [n for n in noms if n not in img]

    print(f"\n  Catalogue : {len(noms)} exercices uniques")
    print(f"  Illustrés : {len(noms) - len(sans)}")
    print(f"  SANS image : {len(sans)}  ({len(sans)/len(noms)*100:.0f} %)")
    if absents:
        print(f"\n  ❌ DÉCLARÉES MAIS FICHIER ABSENT ({len(absents)}) :")
        for p in absents:
            print("       ", p)

    par = {}
    for n in sans:
        par.setdefault(grp.get(n, '?'), []).append(n)
    print("\n  Manquants par groupe :")
    for g in sorted(par, key=lambda x: -len(par[x])):
        print(f"     {len(par[g]):>3}  {g}")
        for n in sorted(par[g]):
            print(f"           · {n}")

    utilises = set(os.path.basename(p) for p in img.values())
    orphelins = sorted(f for f in os.listdir(DOSSIER_IMG) if f not in utilises)
    if orphelins:
        print(f"\n  📦 Fichiers présents mais déclarés par personne ({len(orphelins)}) :")
        for f in orphelins:
            print("       ", f)
    lourds = [(f, os.path.getsize(os.path.join(DOSSIER_IMG, f)))
              for f in os.listdir(DOSSIER_IMG)
              if os.path.getsize(os.path.join(DOSSIER_IMG, f)) > POIDS_ALERTE]
    if lourds:
        print(f"\n  ⚖️  Plus lourdes que {POIDS_ALERTE//1024} Ko ({len(lourds)}) :")
        for f, s in sorted(lourds, key=lambda x: -x[1]):
            print(f"        {s/1024:>5.0f} Ko  {f}")


def cmd_proposer(dossier):
    """Rapproche les fichiers d'un dossier des exercices SANS image, puis fabrique une planche."""
    noms, grp = catalogue()
    img = images_declarees()
    sans = [n for n in noms if n not in img]

    fichiers = sorted(f for f in os.listdir(dossier)
                      if f.lower().endswith(('.gif', '.webp', '.png', '.jpg', '.jpeg')))
    # doublons par CONTENU (le nom ment, l'empreinte non)
    vus, doublons = {}, []
    for f in fichiers:
        h = hashlib.sha256(open(os.path.join(dossier, f), 'rb').read()).hexdigest()[:16]
        if h in vus:
            doublons.append((f, vus[h]))
        else:
            vus[h] = f
    uniques = [f for f in fichiers if f in vus.values()]

    print(f"\n  {len(fichiers)} fichiers · {len(uniques)} uniques · {len(doublons)} doublons")
    for a, b in doublons:
        print(f"     🔁 {a}  ≡  {b}")

    props = []
    for f in uniques:
        mf = mots(os.path.splitext(f)[0])
        best, score = None, 0.0
        for n in sans:
            mn = mots(n)
            if not mn or not mf:
                continue
            j = len(mf & mn) / len(mf | mn)
            if j > score:
                score, best = j, n
        props.append((f, best, round(score * 100)))

    props.sort(key=lambda x: -x[2])
    print("\n  PROPOSITIONS (à VÉRIFIER une par une sur la planche) :")
    for f, n, s in props:
        marque = '★' if s >= 40 else ('·' if s >= 15 else ' ')
        print(f"   {marque} {s:>3}%  {f[:44]:<46} → {n or '(aucun exercice sans image ne correspond)'}")

    retenus = [(f, n) for f, n, s in props if s >= 15]
    if retenus:
        planche(dossier, retenus)
    print("\n  ⚠️  Rien n'a été écrit. Regarde la planche, puis :")
    print("        python3 tools/images.py convertir <fichier> \"<Nom exact de l'exercice>\"")


def planche(dossier, couples):
    """Planche de vignettes — l'outil ne décide pas, il donne à VOIR."""
    try:
        from PIL import Image, ImageDraw, ImageFile
        ImageFile.LOAD_TRUNCATED_IMAGES = True
    except ImportError:
        print("  (Pillow absent : pas de planche)")
        return
    CW = CH = 220
    cols = 4
    rows = (len(couples) + cols - 1) // cols
    sh = Image.new('RGB', (cols * CW, rows * (CH + 20)), 'white')
    dr = ImageDraw.Draw(sh)
    for k, (f, n) in enumerate(couples):
        try:
            im = Image.open(os.path.join(dossier, f))
            if getattr(im, 'n_frames', 1) > 1:
                im.seek(im.n_frames // 2)
            th = im.convert('RGB')
            th.thumbnail((CW, CH))
            x, y = (k % cols) * CW, (k // cols) * (CH + 20)
            sh.paste(th, (x + (CW - th.size[0]) // 2, y + (CH - th.size[1]) // 2))
            dr.text((x + 3, y + CH + 4), f"{k+1}. {(n or '?')[:30]}", fill='black')
        except Exception as e:
            print(f"  (vignette impossible pour {f} : {e})")
    out = os.path.join(dossier, '_planche.png')
    sh.save(out)
    print(f"\n  🖼️  Planche : {out}   ← À REGARDER AVANT DE VALIDER")


def cmd_convertir(fichier, exercice):
    from PIL import Image, ImageSequence, ImageFile
    ImageFile.LOAD_TRUNCATED_IMAGES = True

    noms, _ = catalogue()
    if exercice not in noms:
        proches = [n for n in noms if mots(exercice) & mots(n)][:6]
        print(f"  ❌ « {exercice} » n'est pas au catalogue.")
        if proches:
            print("     Voulais-tu dire : " + " · ".join(proches))
        sys.exit(1)
    if exercice in images_declarees():
        print(f"  ⚠️  « {exercice} » a DÉJÀ une image. Rien fait (retire la ligne d'abord si tu veux la remplacer).")
        sys.exit(1)

    slug = re.sub(r'[^a-z0-9]+', '-', norm(exercice)).strip('-')
    dst_rel = f'exercises/{slug}.webp'
    dst = os.path.join(RACINE, dst_rel)

    im = Image.open(fichier)
    anime = getattr(im, 'n_frames', 1) > 1
    if anime:
        frames = []
        for f in ImageSequence.Iterator(im):
            f = f.convert('RGBA')
            fond = Image.new('RGBA', f.size, (255, 255, 255, 255))
            fond.alpha_composite(f)
            g = fond.convert('RGB')
            g.thumbnail((LARGEUR_MAX, LARGEUR_MAX), Image.LANCZOS)
            frames.append(g)
        frames[0].save(dst, save_all=True, append_images=frames[1:],
                       duration=im.info.get('duration', 100), loop=0,
                       format='WEBP', quality=72, method=6)
    else:
        f = im.convert('RGBA')
        fond = Image.new('RGBA', f.size, (255, 255, 255, 255))
        fond.alpha_composite(f)
        g = fond.convert('RGB')
        g.thumbnail((LARGEUR_MAX, LARGEUR_MAX), Image.LANCZOS)
        g.save(dst, format='WEBP', quality=80, method=6)

    a, b = os.path.getsize(fichier), os.path.getsize(dst)
    print(f"  ✅ {dst_rel}   {a/1024:.0f} Ko → {b/1024:.0f} Ko  (−{(1-b/a)*100:.0f} %)"
          f"{'  · animé' if anime else ''}")
    if b > POIDS_ALERTE:
        print(f"  ⚖️  ATTENTION : {b/1024:.0f} Ko, au-dessus du repère de {POIDS_ALERTE//1024} Ko.")

    # écriture de la ligne dans EX_YT
    p = os.path.join(RACINE, 'log.js')
    src = io.open(p, encoding='utf-8').read()
    ancre = "const EX_YT={"
    ligne = f"\n  '{exercice}':{' ' * max(1, 30 - len(exercice))}{{img:'{dst_rel}'}},"
    io.open(p, 'w', encoding='utf-8').write(src.replace(ancre, ancre + ligne, 1))
    print(f"  ✅ ligne ajoutée dans log.js (EX_YT)")
    print(f"\n  ⏭️  Il reste à : bumper sw.js · lancer les tests · commiter.")


if __name__ == '__main__':
    if len(sys.argv) < 2 or sys.argv[1] not in ('etat', 'proposer', 'convertir'):
        print(__doc__)
        sys.exit(0)
    if sys.argv[1] == 'etat':
        cmd_etat()
    elif sys.argv[1] == 'proposer':
        if len(sys.argv) < 3:
            print("  usage : python3 tools/images.py proposer <dossier>")
            sys.exit(1)
        cmd_proposer(sys.argv[2])
    else:
        if len(sys.argv) < 4:
            print("  usage : python3 tools/images.py convertir <fichier> \"<Nom exact de l'exercice>\"")
            sys.exit(1)
        cmd_convertir(sys.argv[2], sys.argv[3])
