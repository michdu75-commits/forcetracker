/* ══════════════════════════════════════════════════════════════════════════════════════
   📚 FOOD SEMANTICS V1 — FS-05 : LE CORPUS DE RÉFÉRENCE DES RECHERCHES ALIMENTAIRES
   (03/10/2026, session-B, demande de Michel). DONNÉES du banc `food_reference.js` — aucune logique ici.

   Il FIGE la sémantique produit déjà validée (FS-01 → FS-04 et les décisions historiques), il n'améliore rien.
   Chaque cas : id stable · requête · catégorie · type (générique / explicite / ambigu / sans forme / multi /
   technique) · mode (`en` = table d'alias disponible · `hors` = alias indisponibles) · NIVEAU · contrôles ·
   source · raison.

   ⭐ TROIS NIVEAUX, qui ne se confondent jamais :
     MUST              contrat produit fort — un rouge est une régression ;
     SHOULD            préférence actuelle voulue, contrôlée de façon TOLÉRANTE (le type et la forme, pas un
                       libellé CIQUAL sans intérêt produit) — un rouge demande une décision ;
     KNOWN_LIMITATION  comportement OBSERVÉ aujourd'hui mais NON voulu comme règle : il ne rougit jamais ;
                       le banc dit « toujours observée » ou « LEVÉE — à reclasser ». ⛔ Une limite connue ne
                       devient pas une règle par ancienneté.
   ⛔ Ne pas sur-spécifier : `nom` (libellé exact) seulement quand une DÉCISION porte sur ce résultat précis
   (poire ≠ Belle Hélène, coca → Cola sucré, oeuf → Oeuf cru…) ; sinon `re` (le bon type d'aliment) + `forme`.

   CONTRÔLES (tous optionnels) : `nom` libellé exact du 1ᵉʳ · `re` motif du 1ᵉʳ · `pasNom` le 1ᵉʳ n'est PAS ce
   libellé · `forme` libellé FS-04 du 1ᵉʳ, exact ('' = aucun) · `formeContient` libellé FS-04 présent ·
   `porte` formes FS-02 que le 1ᵉʳ doit porter · `top` {n, re} : un des rangs 2..n correspond · `jamais`
   {n, re} : aucun des n premiers ne correspond · `vide` : aucun résultat.
   ══════════════════════════════════════════════════════════════════════════════════════ */

const CAS = [
  /* ═══ A. FÉCULENTS / CÉRÉALES ═══ */
  { id: 'FR-001', q: 'riz', cat: 'feculents', kind: 'generique', mode: 'en', niveau: 'SHOULD', re: '^Riz\\b', forme: 'Cuit', source: 'FS-03', raison: 'riz générique → un riz cuit en tête' },
  { id: 'FR-002', q: 'riz', cat: 'feculents', kind: 'generique', mode: 'en', niveau: 'MUST', top: { n: 3, re: '^Riz blanc, cru' }, source: 'historique ft-v1115', raison: 'décision de Michel : « le cuit en premier, le cru juste dessous »' },
  { id: 'FR-003', q: 'riz', cat: 'feculents', kind: 'generique', mode: 'hors', niveau: 'SHOULD', re: '^Riz\\b', forme: 'Cuit', top: { n: 3, re: '\\bcru\\b' }, source: 'FS-03', raison: 'hors ligne aussi : la préférence cuit est dans le moteur, le cru reste dessous' },
  { id: 'FR-004', q: 'riz cru', cat: 'feculents', kind: 'explicite', mode: 'en', niveau: 'MUST', re: '^Riz\\b', forme: 'Cru', source: 'FS-01', raison: 'la forme nommée gagne' },
  { id: 'FR-005', q: 'riz cuit', cat: 'feculents', kind: 'explicite', mode: 'en', niveau: 'MUST', re: '^Riz\\b', forme: 'Cuit', source: 'FS-01', raison: 'la forme nommée gagne' },
  { id: 'FR-006', q: 'riz sec', cat: 'feculents', kind: 'ambigu', mode: 'en', niveau: 'MUST', porte: ['seche'], pasNom: 'Riz blanc, cru', source: 'FS-02 / FS-03', raison: 'forme nommée respectée ; AUCUNE équivalence sec = cru inventée' },
  { id: 'FR-007', q: 'riz sec', cat: 'feculents', kind: 'ambigu', mode: 'en', niveau: 'KNOWN_LIMITATION', re: '^Vermicelles de riz', source: 'FS-02', raison: 'CIQUAL range le riz sec sous « cru » : « riz sec » tombe sur des vermicelles' },
  { id: 'FR-008', q: 'riz basmati', cat: 'feculents', kind: 'generique', mode: 'en', niveau: 'SHOULD', re: '^Riz basmati', forme: 'Cuit', source: 'alias', raison: 'variété choisie par la table d\'alias, cuite' },
  { id: 'FR-009', q: 'riz complet', cat: 'feculents', kind: 'generique', mode: 'en', niveau: 'SHOULD', re: '^Riz complet', forme: 'Cuit', source: 'alias', raison: 'variété + cuit par la table d\'alias' },
  { id: 'FR-010', q: 'riz complet', cat: 'feculents', kind: 'generique', mode: 'hors', niveau: 'KNOWN_LIMITATION', re: '^Riz complet, cru', source: 'FS-03', raison: 'le profil riz est EXACT : hors ligne, « riz complet » reste cru (candidat futur)' },
  { id: 'FR-011', q: 'pâtes', cat: 'feculents', kind: 'generique', mode: 'en', niveau: 'SHOULD', re: '^Pâtes\\b', forme: 'Cuit', source: 'FS-03', raison: 'pâtes génériques → cuites en tête' },
  { id: 'FR-012', q: 'pâtes', cat: 'feculents', kind: 'generique', mode: 'en', niveau: 'MUST', top: { n: 3, re: 'crues' }, source: 'historique ft-v1115', raison: 'le cru reste juste sous le cuit' },
  { id: 'FR-013', q: 'pâtes', cat: 'feculents', kind: 'generique', mode: 'hors', niveau: 'SHOULD', re: '^Pâtes\\b', forme: 'Cuit', top: { n: 3, re: 'crues' }, source: 'FS-03', raison: 'hors ligne aussi' },
  { id: 'FR-014', q: 'pâtes crues', cat: 'feculents', kind: 'explicite', mode: 'en', niveau: 'MUST', re: '^Pâtes\\b', forme: 'Cru', source: 'FS-01', raison: 'la forme nommée gagne' },
  { id: 'FR-015', q: 'pâtes sèches', cat: 'feculents', kind: 'explicite', mode: 'en', niveau: 'MUST', re: '^Pâtes sèches', porte: ['seche'], source: 'FS-02', raison: 'la forme nommée (sec) est portée' },
  { id: 'FR-016', q: 'pâtes cuites', cat: 'feculents', kind: 'explicite', mode: 'en', niveau: 'MUST', re: '^Pâtes\\b', forme: 'Cuit', source: 'FS-01', raison: 'la forme nommée gagne' },
  { id: 'FR-017', q: 'spaghetti', cat: 'feculents', kind: 'technique', mode: 'en', niveau: 'SHOULD', re: '^Pâtes\\b', forme: 'Cuit', source: 'FS-03', raison: 'forme de pâtes → des pâtes (jamais la courge spaghetti)' },
  { id: 'FR-018', q: 'spaghetti', cat: 'feculents', kind: 'technique', mode: 'hors', niveau: 'SHOULD', re: '^Pâtes\\b', forme: 'Cuit', source: 'FS-03', raison: 'hors ligne : profil pâtes' },
  { id: 'FR-019', q: 'macaroni', cat: 'feculents', kind: 'technique', mode: 'hors', niveau: 'SHOULD', re: '^Pâtes\\b', forme: 'Cuit', source: 'FS-03', raison: 'forme de pâtes, hors ligne' },
  { id: 'FR-020', q: 'penne', cat: 'feculents', kind: 'technique', mode: 'hors', niveau: 'SHOULD', re: '^Pâtes\\b', forme: 'Cuit', source: 'FS-03', raison: 'forme de pâtes, hors ligne' },
  { id: 'FR-021', q: 'fusilli', cat: 'feculents', kind: 'technique', mode: 'hors', niveau: 'SHOULD', re: '^Pâtes\\b', forme: 'Cuit', source: 'FS-03', raison: 'forme de pâtes, hors ligne' },
  { id: 'FR-022', q: 'tagliatelles', cat: 'feculents', kind: 'technique', mode: 'en', niveau: 'SHOULD', re: '^Pâtes\\b', forme: 'Cuit', source: 'FS-03 / alias', raison: 'forme de pâtes au pluriel' },
  { id: 'FR-023', q: 'pâte', cat: 'feculents', kind: 'technique', mode: 'en', niveau: 'MUST', re: '^Pâté', source: 'historique (runner CCXX)', raison: '« pâte » au singulier = le pâté, jamais les pâtes cuites' },
  { id: 'FR-024', q: 'pates', cat: 'feculents', kind: 'technique', mode: 'en', niveau: 'MUST', re: '^Pâtes sèches', source: 'historique (runner CCXX)', raison: 'sans accent = avec accent' },
  { id: 'FR-025', q: 'semoule', cat: 'feculents', kind: 'generique', mode: 'en', niveau: 'SHOULD', re: '^Semoule', forme: 'Cuit', source: 'alias', raison: 'semoule cuite' },
  { id: 'FR-026', q: 'semoule', cat: 'feculents', kind: 'generique', mode: 'hors', niveau: 'KNOWN_LIMITATION', re: '^Semoule de blé dur, crue', source: 'FS-03', raison: 'hors ligne, pas de profil semoule : crue en tête' },
  { id: 'FR-027', q: 'pomme de terre', cat: 'feculents', kind: 'generique', mode: 'en', niveau: 'SHOULD', re: '^Pomme de terre', forme: 'Cuit', source: 'alias', raison: 'pomme de terre cuite' },
  { id: 'FR-028', q: 'pomme de terre', cat: 'feculents', kind: 'generique', mode: 'hors', niveau: 'KNOWN_LIMITATION', re: '^Pomme de terre, sans peau, crue', source: 'FS-03', raison: 'hors ligne, pas de profil : crue en tête' },
  { id: 'FR-029', q: 'pain', cat: 'feculents', kind: 'sans-forme', mode: 'en', niveau: 'SHOULD', re: '^Pain\\b', forme: '', source: 'alias / FS-04', raison: 'du pain, sans faux libellé' },
  { id: 'FR-030', q: 'lentilles', cat: 'feculents', kind: 'generique', mode: 'en', niveau: 'SHOULD', re: '^Lentille', forme: 'Cuit', source: 'alias', raison: 'lentilles cuites' },
  { id: 'FR-031', q: 'lentilles', cat: 'feculents', kind: 'generique', mode: 'hors', niveau: 'KNOWN_LIMITATION', re: 'cuisinée, appertisée', source: 'FS-03', raison: 'hors ligne : la conserve cuisinée passe devant (candidat futur)' },
  { id: 'FR-032', q: 'pois chiches', cat: 'feculents', kind: 'generique', mode: 'en', niveau: 'SHOULD', re: '^Pois chiche', forme: 'Cuit', source: 'alias', raison: 'pois chiches cuits' },
  { id: 'FR-033', q: 'flocons d avoine', cat: 'feculents', kind: 'sans-forme', mode: 'en', niveau: 'SHOULD', nom: "Flocons d'avoine", forme: '', source: 'FS-01 / FS-04', raison: 'apostrophe tolérée ; aucune forme, aucun libellé' },

  /* ═══ B. FRUITS ═══ */
  { id: 'FR-034', q: 'pomme', cat: 'fruits', kind: 'generique', mode: 'en', niveau: 'MUST', re: '^Pomme, chair', forme: 'Cru', jamais: { n: 1, re: 'sèche' }, source: 'FS-01 (alias)', raison: 'une pomme n\'est pas une pomme séchée' },
  { id: 'FR-035', q: 'pomme', cat: 'fruits', kind: 'generique', mode: 'hors', niveau: 'MUST', re: '^Pomme, chair', forme: 'Cru', source: 'FS-01 / FS-03', raison: 'hors ligne aussi, le fruit frais' },
  { id: 'FR-036', q: 'pommes', cat: 'fruits', kind: 'technique', mode: 'en', niveau: 'MUST', re: '^Pomme, chair', forme: 'Cru', source: 'FS-01', raison: 'pluriel = singulier' },
  { id: 'FR-037', q: 'pomme crue', cat: 'fruits', kind: 'explicite', mode: 'en', niveau: 'MUST', re: '^Pomme, chair', forme: 'Cru', source: 'FS-01', raison: 'la forme nommée gagne' },
  { id: 'FR-038', q: 'pomme séchée', cat: 'fruits', kind: 'explicite', mode: 'en', niveau: 'MUST', nom: 'Pomme, sèche', forme: 'Sec / séché', source: 'FS-01', raison: '« séchée » trouve « sèche » (rien sur master)' },
  { id: 'FR-039', q: 'purée de pommes', cat: 'fruits', kind: 'explicite', mode: 'en', niveau: 'MUST', re: '^Purée de pommes', forme: 'Purée', source: 'FS-02', raison: 'la purée demandée' },
  { id: 'FR-040', q: 'poire', cat: 'fruits', kind: 'generique', mode: 'en', niveau: 'MUST', nom: 'Poire, chair, crue (aliment moyen)', forme: 'Cru', source: 'FS-03 (alias)', raison: 'une poire n\'est pas une Poire belle Hélène' },
  { id: 'FR-041', q: 'poire', cat: 'fruits', kind: 'generique', mode: 'hors', niveau: 'MUST', re: '^Poire, chair', pasNom: 'Poire belle Hélène', source: 'FS-03', raison: 'hors ligne aussi, le fruit' },
  { id: 'FR-042', q: 'raisin', cat: 'fruits', kind: 'generique', mode: 'en', niveau: 'MUST', nom: 'Raisin cru (aliment moyen)', forme: 'Cru', source: 'FS-03 (alias)', raison: 'un raisin est un fruit frais' },
  { id: 'FR-043', q: 'raisin', cat: 'fruits', kind: 'generique', mode: 'hors', niveau: 'KNOWN_LIMITATION', nom: 'Raisin sec', forme: 'Sec / séché', source: 'FS-03 / FS-04', raison: 'hors ligne, « sec » est dans le nom même : limite connue, affichée honnêtement' },
  { id: 'FR-044', q: 'raisins secs', cat: 'fruits', kind: 'explicite', mode: 'en', niveau: 'MUST', nom: 'Raisin sec', source: 'FS-03', raison: 'le sec demandé' },
  { id: 'FR-045', q: 'banane', cat: 'fruits', kind: 'generique', mode: 'en', niveau: 'SHOULD', re: '^Banane, chair', forme: 'Cru', source: 'alias', raison: 'le fruit frais' },
  { id: 'FR-046', q: 'banane séchée', cat: 'fruits', kind: 'explicite', mode: 'en', niveau: 'MUST', re: '^Banane', forme: 'Sec / séché', source: 'FS-01', raison: 'la forme nommée gagne' },
  { id: 'FR-047', q: 'orange', cat: 'fruits', kind: 'generique', mode: 'en', niveau: 'SHOULD', re: '^Orange, chair', forme: 'Cru', source: 'alias', raison: 'le fruit' },
  { id: 'FR-048', q: 'fraise', cat: 'fruits', kind: 'generique', mode: 'en', niveau: 'SHOULD', re: '^Fraise, crue', source: 'alias', raison: 'le fruit' },
  { id: 'FR-049', q: 'abricot', cat: 'fruits', kind: 'generique', mode: 'en', niveau: 'SHOULD', re: '^Abricot, dénoyauté, cru', forme: 'Cru', source: 'FS-01', raison: 'le fruit frais avant le sirop' },
  { id: 'FR-050', q: 'abricot sec', cat: 'fruits', kind: 'explicite', mode: 'en', niveau: 'MUST', re: '^Abricot', forme: 'Sec / séché', source: 'FS-01', raison: 'la forme nommée gagne' },
  { id: 'FR-051', q: 'fruits rouges', cat: 'fruits', kind: 'generique', mode: 'en', niveau: 'KNOWN_LIMITATION', re: '^Tarte aux fruits rouges', source: 'observé FS-05', raison: 'aucun « fruits rouges » nu dans CIQUAL : une tarte sort en tête (candidat futur)' },

  /* ═══ C. LÉGUMES ═══ */
  { id: 'FR-052', q: 'haricot vert', cat: 'legumes', kind: 'generique', mode: 'en', niveau: 'MUST', nom: 'Haricot vert, cuit', forme: 'Cuit', jamais: { n: 6, re: 'purée' }, source: 'FS-01 / FS-03', raison: 'le légume, cuit, jamais la purée' },
  { id: 'FR-053', q: 'haricots verts', cat: 'legumes', kind: 'technique', mode: 'en', niveau: 'MUST', nom: 'Haricot vert, cuit', jamais: { n: 6, re: 'purée' }, source: 'FS-01', raison: 'pluriel = singulier, jamais la purée' },
  { id: 'FR-054', q: 'haricots verts', cat: 'legumes', kind: 'generique', mode: 'hors', niveau: 'MUST', nom: 'Haricot vert, cuit', jamais: { n: 6, re: 'purée' }, source: 'FS-03', raison: 'hors ligne aussi' },
  { id: 'FR-055', q: 'haricot vert cru', cat: 'legumes', kind: 'explicite', mode: 'en', niveau: 'MUST', re: '^Haricot vert', forme: 'Cru', source: 'FS-01', raison: 'la forme nommée gagne' },
  { id: 'FR-056', q: 'haricots verts crus', cat: 'legumes', kind: 'explicite', mode: 'en', niveau: 'MUST', re: '^Haricot vert', forme: 'Cru', source: 'FS-01', raison: 'la forme nommée gagne, au pluriel' },
  { id: 'FR-057', q: 'haricot vert cuit', cat: 'legumes', kind: 'explicite', mode: 'en', niveau: 'MUST', re: '^Haricot vert', forme: 'Cuit', source: 'FS-01', raison: 'la forme nommée gagne' },
  { id: 'FR-058', q: 'haricots verts purée', cat: 'legumes', kind: 'explicite', mode: 'en', niveau: 'MUST', nom: 'Haricots verts, purée', forme: 'Purée', source: 'FS-01', raison: 'la purée demandée' },
  { id: 'FR-059', q: 'courgette', cat: 'legumes', kind: 'generique', mode: 'en', niveau: 'MUST', re: '^Courgette, chair', pasNom: 'Courgette, purée', source: 'FS-03', raison: 'plus de purée imposée par l\'alias' },
  { id: 'FR-060', q: 'courgette', cat: 'legumes', kind: 'generique', mode: 'hors', niveau: 'MUST', re: '^Courgette, chair', pasNom: 'Courgette, purée', source: 'FS-03', raison: 'hors ligne aussi' },
  { id: 'FR-061', q: 'courgettes', cat: 'legumes', kind: 'technique', mode: 'en', niveau: 'MUST', re: '^Courgette, chair', source: 'FS-03', raison: 'pluriel' },
  { id: 'FR-062', q: 'courgette purée', cat: 'legumes', kind: 'explicite', mode: 'en', niveau: 'MUST', nom: 'Courgette, purée', forme: 'Purée', source: 'FS-03', raison: 'la purée reste trouvable quand on la demande' },
  { id: 'FR-063', q: 'carotte', cat: 'legumes', kind: 'generique', mode: 'en', niveau: 'SHOULD', re: '^Carotte', forme: 'Cuit', source: 'alias', raison: 'l\'aliment moyen cuit (table d\'alias)' },
  { id: 'FR-064', q: 'carotte', cat: 'legumes', kind: 'generique', mode: 'hors', niveau: 'SHOULD', re: '^Carotte', jamais: { n: 1, re: 'déshydratée' }, source: 'FS-03', raison: 'hors ligne : une carotte, sans préférence cuit > cru' },
  { id: 'FR-065', q: 'carotte crue', cat: 'legumes', kind: 'explicite', mode: 'en', niveau: 'MUST', re: '^Carotte', forme: 'Cru', source: 'FS-01', raison: 'la forme nommée gagne' },
  { id: 'FR-066', q: 'brocoli', cat: 'legumes', kind: 'generique', mode: 'en', niveau: 'SHOULD', re: '^Brocoli', forme: 'Cuit', source: 'alias', raison: 'brocoli cuit' },
  { id: 'FR-067', q: 'épinard', cat: 'legumes', kind: 'technique', mode: 'en', niveau: 'SHOULD', re: '^Épinard', forme: 'Cuit', source: 'alias', raison: 'singulier = pluriel' },
  { id: 'FR-068', q: 'tomate', cat: 'legumes', kind: 'generique', mode: 'en', niveau: 'SHOULD', re: '^Tomate', forme: 'Cru', source: 'alias (ft-v1115)', raison: 'la tomate crue (aliment moyen)' },
  { id: 'FR-069', q: 'tomate', cat: 'legumes', kind: 'generique', mode: 'hors', niveau: 'KNOWN_LIMITATION', re: '^Tomate, chair, appertisée', source: 'observé FS-05', raison: 'hors ligne : une conserve passe devant la tomate fraîche (candidat futur)' },
  { id: 'FR-070', q: 'aubergine', cat: 'legumes', kind: 'generique', mode: 'en', niveau: 'SHOULD', re: '^Aubergine', source: 'alias', raison: 'une aubergine, sans préférence cuit > cru imposée par le moteur' },
  { id: 'FR-071', q: 'poivron', cat: 'legumes', kind: 'generique', mode: 'en', niveau: 'SHOULD', re: '^Poivron', source: 'alias', raison: 'un poivron' },
  { id: 'FR-072', q: 'salade', cat: 'legumes', kind: 'generique', mode: 'en', niveau: 'SHOULD', re: '^Salade verte', forme: 'Cru', source: 'alias', raison: 'la salade verte, pas une salade composée' },
  { id: 'FR-073', q: 'tomate purée', cat: 'legumes', kind: 'multi', mode: 'en', niveau: 'MUST', re: '^Tomate', forme: 'Purée · Conserve', source: 'FS-04', raison: 'multi-formes purée + conserve, ordre fixe' },

  /* ═══ D. BOISSONS / CAFÉ / THÉ ═══ */
  { id: 'FR-074', q: 'café', cat: 'boissons', kind: 'generique', mode: 'en', niveau: 'MUST', re: 'prêt à boire', forme: 'Boisson', jamais: { n: 6, re: 'moulu|poudre' }, source: 'FS-01 / FS-03', raison: 'la boisson, jamais la poudre dans les 6 premiers' },
  { id: 'FR-075', q: 'café', cat: 'boissons', kind: 'generique', mode: 'hors', niveau: 'MUST', re: 'prêt à boire', forme: 'Boisson', source: 'FS-01', raison: 'hors ligne aussi' },
  { id: 'FR-076', q: 'café moulu', cat: 'boissons', kind: 'explicite', mode: 'en', niveau: 'MUST', nom: 'Café, moulu', forme: 'Poudre / moulu', source: 'FS-01', raison: 'la forme nommée gagne' },
  { id: 'FR-077', q: 'café poudre', cat: 'boissons', kind: 'explicite', mode: 'en', niveau: 'MUST', re: '^Café', forme: 'Poudre / moulu', source: 'FS-01', raison: 'la forme nommée gagne' },
  { id: 'FR-078', q: 'café instantané', cat: 'boissons', kind: 'generique', mode: 'en', niveau: 'SHOULD', re: '^Café', forme: 'Boisson', source: 'FS-01', raison: '« instantané » n\'est pas une poudre' },
  { id: 'FR-079', q: 'café au lait', cat: 'boissons', kind: 'generique', mode: 'en', niveau: 'MUST', re: '^Café au lait', forme: 'Boisson', source: 'FS-01', raison: 'la boisson, pas la poudre soluble' },
  { id: 'FR-080', q: 'cappuccino', cat: 'boissons', kind: 'generique', mode: 'en', niveau: 'MUST', re: 'cappuccino', forme: 'Boisson', source: 'FS-01', raison: 'la boisson, pas la poudre soluble' },
  { id: 'FR-081', q: 'thé', cat: 'boissons', kind: 'generique', mode: 'en', niveau: 'MUST', re: '^Thé.*infusé', forme: 'Boisson', source: 'FS-01', raison: 'l\'infusion, pas les feuilles' },
  { id: 'FR-082', q: 'thé', cat: 'boissons', kind: 'generique', mode: 'hors', niveau: 'MUST', re: '^Thé.*infusé', forme: 'Boisson', source: 'FS-01', raison: 'hors ligne aussi' },
  { id: 'FR-083', q: 'thé feuille', cat: 'boissons', kind: 'explicite', mode: 'en', niveau: 'MUST', nom: 'Thé, feuille', forme: 'Feuilles', source: 'FS-01', raison: 'la forme nommée gagne' },
  { id: 'FR-084', q: 'thé feuilles', cat: 'boissons', kind: 'explicite', mode: 'en', niveau: 'MUST', nom: 'Thé, feuille', forme: 'Feuilles', source: 'FS-01', raison: 'la forme nommée, au pluriel' },
  { id: 'FR-085', q: 'thé infusé', cat: 'boissons', kind: 'explicite', mode: 'en', niveau: 'MUST', re: '^Thé', forme: 'Boisson', source: 'FS-02', raison: 'la forme nommée' },
  { id: 'FR-086', q: 'lait', cat: 'boissons', kind: 'sans-forme', mode: 'en', niveau: 'SHOULD', nom: 'Lait demi-écrémé, UHT', forme: '', source: 'alias / FS-04', raison: 'le lait courant, sans faux libellé' },
  { id: 'FR-087', q: 'lait', cat: 'boissons', kind: 'sans-forme', mode: 'hors', niveau: 'SHOULD', re: '^Lait\\b', forme: '', jamais: { n: 1, re: 'poudre' }, source: 'FS-04', raison: 'hors ligne : un lait liquide, sans libellé' },
  { id: 'FR-088', q: 'lait en poudre', cat: 'boissons', kind: 'explicite', mode: 'en', niveau: 'MUST', re: '^Lait en poudre', forme: 'Poudre / moulu', source: 'FS-01', raison: 'la poudre demandée, lue aussi dans le nom' },
  { id: 'FR-089', q: 'lait poudre', cat: 'boissons', kind: 'explicite', mode: 'en', niveau: 'MUST', re: '^Lait en poudre', forme: 'Poudre / moulu', source: 'FS-01', raison: 'sans « en »' },
  { id: 'FR-090', q: 'eau', cat: 'boissons', kind: 'sans-forme', mode: 'en', niveau: 'MUST', nom: 'Eau du robinet', forme: '', source: 'FS-01 (alias)', raison: 'le résultat de master, gardé par la table' },
  { id: 'FR-091', q: 'eau', cat: 'boissons', kind: 'sans-forme', mode: 'hors', niveau: 'KNOWN_LIMITATION', nom: 'Eau de coco', source: 'FS-01', raison: 'hors ligne, le nom le plus court gagne : « Eau de coco » (candidat futur)' },
  { id: 'FR-092', q: 'coca', cat: 'boissons', kind: 'technique', mode: 'en', niveau: 'MUST', nom: 'Cola, sucré', forme: '', source: 'historique ft-v1113', raison: 'synonyme coca → cola ; un Coca normal reste un Coca normal' },
  { id: 'FR-093', q: 'jus d orange', cat: 'boissons', kind: 'generique', mode: 'en', niveau: 'KNOWN_LIMITATION', re: '^Jus multifruit', source: 'observé FS-05', raison: 'un jus multifruit passe devant « Jus d\'orange, frais » (candidat futur)' },

  /* ═══ E. VIANDES / POISSONS / ŒUFS — AUCUNE préférence cuit > cru ═══ */
  { id: 'FR-094', q: 'poulet', cat: 'proteines', kind: 'generique', mode: 'en', niveau: 'MUST', re: '^Poulet', forme: 'Cru', source: 'FS-03 / alias', raison: 'aucune préférence cuit imposée' },
  { id: 'FR-095', q: 'poulet', cat: 'proteines', kind: 'generique', mode: 'hors', niveau: 'MUST', re: '^Poulet', forme: 'Cru', source: 'FS-03', raison: 'hors ligne : pas de règle cuit > cru, le classement de FS-02 reste' },
  { id: 'FR-096', q: 'poulet cru', cat: 'proteines', kind: 'explicite', mode: 'en', niveau: 'MUST', re: '^Poulet', forme: 'Cru', source: 'FS-01', raison: 'la forme nommée gagne' },
  { id: 'FR-097', q: 'poulet cuit', cat: 'proteines', kind: 'explicite', mode: 'en', niveau: 'MUST', re: '^Poulet', forme: 'Cuit', source: 'FS-01', raison: 'la forme nommée gagne' },
  { id: 'FR-098', q: 'dinde', cat: 'proteines', kind: 'generique', mode: 'en', niveau: 'SHOULD', re: '^Dinde', forme: 'Cru', source: 'alias', raison: 'pas de cuit imposé' },
  { id: 'FR-099', q: 'boeuf', cat: 'proteines', kind: 'generique', mode: 'en', niveau: 'SHOULD', re: '^Boeuf', forme: 'Cru', source: 'FS-01', raison: 'du bœuf, sans cuit imposé' },
  { id: 'FR-100', q: 'bœuf', cat: 'proteines', kind: 'technique', mode: 'en', niveau: 'MUST', re: '^Boeuf', source: 'historique (ligatures)', raison: '« bœuf » (ligature) = « boeuf »' },
  { id: 'FR-101', q: 'steak haché', cat: 'proteines', kind: 'generique', mode: 'en', niveau: 'SHOULD', re: 'steak haché', source: 'FS-01', raison: 'un steak haché' },
  { id: 'FR-102', q: 'saumon', cat: 'proteines', kind: 'generique', mode: 'en', niveau: 'SHOULD', re: '^Saumon\\b', source: 'alias', raison: 'du saumon, sans cuit imposé' },
  { id: 'FR-103', q: 'saumon fumé', cat: 'proteines', kind: 'sans-forme', mode: 'en', niveau: 'SHOULD', nom: 'Saumon fumé', forme: '', source: 'FS-04', raison: '« fumé » n\'est pas une forme : aucun libellé' },
  { id: 'FR-104', q: 'thon', cat: 'proteines', kind: 'generique', mode: 'en', niveau: 'SHOULD', re: '^Thon\\b', source: 'alias', raison: 'du thon' },
  { id: 'FR-105', q: 'thon en boite', cat: 'proteines', kind: 'generique', mode: 'en', niveau: 'SHOULD', re: '^Thon', forme: 'Conserve', source: 'alias / FS-04', raison: 'la conserve, affichée « Conserve »' },
  { id: 'FR-106', q: 'thon en boite', cat: 'proteines', kind: 'generique', mode: 'hors', niveau: 'KNOWN_LIMITATION', vide: true, source: 'observé FS-05', raison: 'hors ligne : « boite » n\'est pas dans CIQUAL — aucun résultat sans la table' },
  { id: 'FR-107', q: 'oeuf', cat: 'proteines', kind: 'generique', mode: 'en', niveau: 'MUST', nom: 'Oeuf cru', forme: 'Cru', source: 'FS-01 (D-036) / alias', raison: 'pas de partie (blanc / jaune) devant un œuf entier' },
  { id: 'FR-108', q: 'œuf', cat: 'proteines', kind: 'technique', mode: 'en', niveau: 'MUST', nom: 'Oeuf cru', source: 'historique (ligatures)', raison: '« œuf » (ligature) = « oeuf »' },
  { id: 'FR-109', q: 'oeuf', cat: 'proteines', kind: 'generique', mode: 'hors', niveau: 'MUST', nom: 'Oeuf cru', source: 'FS-01 (D-036) / FS-02', raison: 'hors ligne : jamais « Oeuf, blanc » devant un œuf entier' },
  { id: 'FR-110', q: 'oeufs', cat: 'proteines', kind: 'technique', mode: 'hors', niveau: 'KNOWN_LIMITATION', re: '^Oeufs au lait', source: 'observé FS-05', raison: 'hors ligne, le pluriel tombe sur un dessert (candidat futur)' },
  { id: 'FR-111', q: 'blanc d oeuf', cat: 'proteines', kind: 'multi', mode: 'en', niveau: 'MUST', re: '^Oeuf, blanc', formeContient: 'Blanc ou jaune d’œuf', source: 'FS-02 / FS-04', raison: 'la partie nommée, affichée' },
  { id: 'FR-112', q: 'jambon', cat: 'proteines', kind: 'generique', mode: 'en', niveau: 'MUST', re: '^Jambon cuit', top: { n: 3, re: '^Jambon cru' }, source: 'historique ft-v1115', raison: 'cuit en premier, cru juste dessous' },

  /* ═══ F. PRODUITS LAITIERS / FROMAGES ═══ */
  { id: 'FR-113', q: 'fromage', cat: 'laitiers', kind: 'sans-forme', mode: 'en', niveau: 'MUST', nom: 'Fromage (aliment moyen)', forme: '', source: 'FS-01 / FS-04', raison: 'pas « Fromage de tête » ; aucun libellé' },
  { id: 'FR-114', q: 'yaourt', cat: 'laitiers', kind: 'sans-forme', mode: 'en', niveau: 'SHOULD', re: '^Yaourt', forme: '', source: 'alias / FS-04', raison: 'un yaourt, sans libellé' },
  { id: 'FR-115', q: 'fromage blanc', cat: 'laitiers', kind: 'sans-forme', mode: 'en', niveau: 'MUST', re: '^Fromage blanc', forme: '', source: 'FS-02', raison: '« blanc » sans œuf n\'est pas une partie' },
  { id: 'FR-116', q: 'mozzarella', cat: 'laitiers', kind: 'sans-forme', mode: 'en', niveau: 'SHOULD', re: '^Mozzarella', forme: '', source: 'alias', raison: 'une mozzarella, sans libellé' },
  { id: 'FR-117', q: 'emmental', cat: 'laitiers', kind: 'sans-forme', mode: 'en', niveau: 'SHOULD', re: '^Emmental', forme: '', source: 'alias', raison: 'un emmental, sans libellé' },
  { id: 'FR-118', q: 'camembert', cat: 'laitiers', kind: 'ambigu', mode: 'en', niveau: 'KNOWN_LIMITATION', re: '^Camembert', forme: 'Cru', source: 'FS-02 / FS-04', raison: '« lait cru » est lu comme une forme : le camembert s\'affiche « Cru » (candidat futur)' },
  { id: 'FR-119', q: 'crème fraîche', cat: 'laitiers', kind: 'generique', mode: 'en', niveau: 'KNOWN_LIMITATION', vide: true, source: 'observé FS-05', raison: 'aucun résultat CIQUAL pour « crème fraîche » (candidat futur)' },

  /* ═══ G. PLATS / SAUCES ═══ */
  { id: 'FR-120', q: 'carbonara', cat: 'plats', kind: 'generique', mode: 'en', niveau: 'MUST', re: '^Pâtes à la carbonara', forme: 'Préparé', source: 'retour terrain 01/10 / alias', raison: 'le plat, pas la sauce' },
  { id: 'FR-121', q: 'carbonara', cat: 'plats', kind: 'generique', mode: 'hors', niveau: 'MUST', re: '^Pâtes à la carbonara', source: 'FS-03', raison: 'hors ligne aussi : la sauce est évitée en générique' },
  { id: 'FR-122', q: 'pâtes carbonara', cat: 'plats', kind: 'generique', mode: 'en', niveau: 'MUST', re: '^Pâtes à la carbonara', source: 'alias', raison: 'le plat' },
  { id: 'FR-123', q: 'sauce carbonara', cat: 'plats', kind: 'explicite', mode: 'en', niveau: 'MUST', nom: 'Sauce carbonara, préemballée', forme: 'Sauce', source: 'FS-02 / FS-03', raison: 'la sauce demandée' },
  { id: 'FR-124', q: 'spaghetti bolognaise', cat: 'plats', kind: 'generique', mode: 'en', niveau: 'MUST', re: '^Pâtes à la bolognaise', forme: 'Préparé', source: 'retour terrain 01/10 / alias', raison: 'le plat, pas des raviolis crus' },
  { id: 'FR-125', q: 'spaghetti bolognaise', cat: 'plats', kind: 'generique', mode: 'hors', niveau: 'KNOWN_LIMITATION', re: '^Pâtes fraîches farcies.*crues', source: 'observé FS-05', raison: 'hors ligne, le défaut du retour terrain revient : raviolis farcis crus (candidat futur)' },
  { id: 'FR-126', q: 'pâtes bolognaise', cat: 'plats', kind: 'generique', mode: 'hors', niveau: 'MUST', re: '^Pâtes à la bolognaise', source: 'FS-03', raison: 'un profil n\'agit jamais par préfixe : pas de raviolis cuits' },
  { id: 'FR-127', q: 'riz au lait', cat: 'plats', kind: 'generique', mode: 'en', niveau: 'MUST', re: '^Riz au lait', source: 'FS-03 / alias (ft-v1115)', raison: 'le dessert : ni la table « riz » ni le profil riz ne débordent' },
  { id: 'FR-128', q: 'bolognaise', cat: 'plats', kind: 'generique', mode: 'en', niveau: 'KNOWN_LIMITATION', re: '^Pizza à la viande', source: 'observé FS-05', raison: 'une pizza passe devant le plat de pâtes (candidat futur)' },
  { id: 'FR-129', q: 'sauce curry', cat: 'plats', kind: 'multi', mode: 'en', niveau: 'MUST', re: '^Sauce au curry', forme: 'Sauce', source: 'FS-02 / FS-04', raison: 'la sauce demandée ; « préparé » retiré à côté de « sauce »' },
  { id: 'FR-130', q: 'sauce tomate', cat: 'plats', kind: 'explicite', mode: 'en', niveau: 'MUST', re: '^Sauce tomate', forme: 'Sauce', source: 'FS-02', raison: 'la sauce demandée' },
  { id: 'FR-131', q: 'curry', cat: 'plats', kind: 'ambigu', mode: 'en', niveau: 'MUST', nom: 'Curry, poudre', forme: 'Poudre / moulu', source: 'FS-03 (ambigu)', raison: 'poudre, sauce ou plat : aucune préférence, comportement de FS-01 conservé' },
  { id: 'FR-132', q: 'curry', cat: 'plats', kind: 'ambigu', mode: 'hors', niveau: 'MUST', nom: 'Curry, poudre', source: 'FS-03 (ambigu)', raison: 'hors ligne aussi' },
  { id: 'FR-133', q: 'soupe', cat: 'plats', kind: 'sans-forme', mode: 'en', niveau: 'SHOULD', nom: 'Soupe (aliment moyen)', forme: '', source: 'FS-03', raison: 'aucune préférence soupe ; l\'aliment moyen' },
  { id: 'FR-134', q: 'omelette', cat: 'plats', kind: 'generique', mode: 'en', niveau: 'MUST', re: '^Omelette, garnitures', source: 'FS-01', raison: 'pas l\'omelette norvégienne' },
  { id: 'FR-135', q: 'crêpe', cat: 'plats', kind: 'generique', mode: 'en', niveau: 'MUST', re: '^Crêpe, nature', forme: 'Préparé', source: 'FS-01 / FS-04', raison: 'pas la crêpe dentelle' },
  { id: 'FR-136', q: 'gaufre', cat: 'plats', kind: 'generique', mode: 'en', niveau: 'MUST', re: '^Gaufre bruxelloise', source: 'FS-01', raison: 'pas une gaufrette (mot entier)' },
  { id: 'FR-137', q: 'pomme cuite', cat: 'plats', kind: 'ambigu', mode: 'en', niveau: 'KNOWN_LIMITATION', re: '^Pomme de terre', source: 'observé FS-05', raison: '« pomme cuite » rend une pomme de terre (la pomme cuite existe : « Pomme, …, rôtie/cuite ») — candidat futur' },

  /* ═══ I. SANS FORME ═══ */
  { id: 'FR-138', q: 'chocolat', cat: 'sans-forme', kind: 'sans-forme', mode: 'en', niveau: 'SHOULD', re: '^Chocolat', forme: '', source: 'FS-04', raison: 'aucune forme, aucun libellé' },
  { id: 'FR-139', q: 'miel', cat: 'sans-forme', kind: 'sans-forme', mode: 'en', niveau: 'SHOULD', nom: 'Miel', forme: '', source: 'alias / FS-04', raison: 'aucun libellé' },
  { id: 'FR-140', q: 'pâté', cat: 'sans-forme', kind: 'sans-forme', mode: 'en', niveau: 'MUST', nom: 'Pâté (aliment moyen)', forme: '', source: 'historique (runner CCXX)', raison: 'le pâté, jamais les pâtes' },

  /* ═══ J. MULTI-FORMES (règles FS-04) ═══ */
  { id: 'FR-141', q: 'haricots verts surgelés', cat: 'multi', kind: 'multi', mode: 'en', niveau: 'MUST', re: '^Haricot vert, surgelé', forme: 'Cru · Surgelé', source: 'FS-04', raison: 'cru + surgelé : deux libellés, ordre fixe' },
  { id: 'FR-142', q: 'haricot vert surgelé cuit', cat: 'multi', kind: 'multi', mode: 'en', niveau: 'MUST', nom: 'Haricot vert, surgelé, cuit', forme: 'Cuit · Surgelé', source: 'FS-02 / FS-04', raison: 'deux formes nommées, toutes deux affichées' },
  { id: 'FR-143', q: 'ail séché', cat: 'multi', kind: 'multi', mode: 'en', niveau: 'MUST', nom: 'Ail séché, poudre', forme: 'Poudre / moulu · Sec / séché', source: 'FS-04', raison: 'poudre + sec (sans cru / cuit, le sec reste)' },
  { id: 'FR-144', q: 'feuille de brick', cat: 'multi', kind: 'multi', mode: 'en', niveau: 'MUST', re: '^Feuille de brick', forme: 'Feuilles', source: 'FS-04', raison: 'feuille + préparé : « préparé » retiré' },
  { id: 'FR-145', q: 'chocolat en poudre', cat: 'multi', kind: 'multi', mode: 'en', niveau: 'SHOULD', re: '^Poudre cacaotée', forme: 'Boisson · Poudre / moulu', source: 'FS-04', raison: 'poudre pour boisson : les deux, ordre fixe' },
];

module.exports = { CAS };
