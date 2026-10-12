/* ══════════════════════════════════════════════════════════════════════════════════════
   🥛 NUT-FOOD-VARIANTS-01 — LES VARIANTES NUTRITIONNELLES D'UN MÊME ALIMENT
   (12/10/2026, session-B, mission de Michel) — blocs B-FV-A (structure du corpus) · B-FV-B (le corpus par la VRAIE
   FRAPPE, en ligne et hors ligne) · B-FV-D (déterminisme : le corpus rejoué dans l'ordre inverse).

   ⚖️ LA RÈGLE (brief de Michel, 12/10) : *quand la personne tape un qualificatif qui change réellement la nature ou
   les valeurs de l'aliment — un taux de matière grasse (0 %, 5 %, 30 %), entier / demi-écrémé / écrémé, allégé,
   « sans sucre »… — ce qualificatif est respecté.* Concrètement :
     · un résultat INCOMPATIBLE n'est jamais placé au-dessus d'un résultat qui porte le qualificatif demandé ;
     · un taux n'en vaut pas un autre (5 % ≠ 15 %, 0 % ≠ 10 %) ;
     · « allégé » n'est pas « NON allégé », « sans sucre » n'est pas « sucré, sans caféine » ;
     · ⛔ et l'inverse, tout aussi important : une requête SANS qualificatif (« lait », « steak haché »,
       « fromage blanc ») n'en reçoit pas un inventé — plusieurs variantes restent proposées.
     · ⛔ on n'invente aucune donnée : un taux absent de la base (« fromage blanc 20 % ») ne rend RIEN en local.
   ⭐ CE QUI EST CONDUIT : le vrai champ `#af-desc` (événement `input`, donc `_afSuggInput` comme sous le doigt) par le
   harnais de FS-05B (`food_multisource.js`, réutilisé — R2) ; ce qui est LU, c'est le HTML rendu par `_afSuggRendu`.
   Seule la section CIQUAL (la table nationale, locale) est jugée : c'est elle qui porte les variantes.
   ⛔ Open Food Facts n'est JAMAIS appelé pour de vrai (réponse figée « vide »).
   Niveaux : MUST rougit · KNOWN_LIMITATION ne rougit jamais (« toujours observée » / « a changé — à relire ») ·
   OBSERVATION se lit seulement. Contrôle négatif : `tools/mut_food_variants.py`.
   ══════════════════════════════════════════════════════════════════════════════════════ */

const MS = require('./food_multisource.js');

/* ⚠️ Jamais `\b` après une lettre accentuée (pour JavaScript, « é » n'est pas un caractère de mot). Un TAUX se lit avec
   sa frontière à gauche : « 5% MG » ne doit pas reconnaître « 15% MG ». */
const TAUX = n => '(^|[^0-9,])' + n + '% MG';
const AUTRES = (...n) => '(^|[^0-9,])(' + n.join('|') + ')% MG';
const V = (id, fam, q, ctx, niveau, oracle, raison) => Object.assign({ id, fam, q, ctx, niveau, raison, sources: ['CIQ'], cat: 'variante', kind: 'variante' }, oracle);

const CAS = [
  /* ── LAIT : écrémé / demi-écrémé / entier / 1,2 % ── */
  V('FV-001', 'lait', 'lait', 'en', 'MUST', { varie: { re: ['écrémé, ', 'demi-écrémé', 'entier', '1,2%', 'sans précision'], min: 2 } }, 'sans qualificatif : plusieurs laits restent proposés, aucun taux inventé'),
  V('FV-002', 'lait', 'lait', 'hors', 'MUST', { varie: { re: ['écrémé, ', 'demi-écrémé', 'entier', '1,2%', 'sans précision'], min: 2 } }, 'hors ligne aussi'),
  V('FV-003', 'lait', 'lait écrémé', 'en', 'MUST', { top: '^Lait écrémé', compat: '^Lait écrémé|, écrémé', incompat: 'demi-écrémé|entier' }, 'écrémé demandé : aucun demi-écrémé ni entier au-dessus'),
  V('FV-004', 'lait', 'lait ecreme', 'hors', 'MUST', { top: '^Lait écrémé', compat: '^Lait écrémé|, écrémé', incompat: 'demi-écrémé|entier' }, 'sans accents, hors ligne'),
  V('FV-005', 'lait', 'lait demi-écrémé', 'hors', 'MUST', { top: '^Lait demi-écrémé', jamais: '^Lait écrémé|entier' }, 'demi-écrémé : ni écrémé ni entier'),
  V('FV-006', 'lait', 'lait demi écrémé', 'hors', 'MUST', { top: '^Lait demi-écrémé', jamais: '^Lait écrémé|entier' }, 'sans tiret'),
  V('FV-007', 'lait', 'lait 1/2 écrémé', 'en', 'MUST', { top: '^Lait demi-écrémé' }, '« 1/2 » = demi (table d\'alias)'),
  V('FV-008', 'lait', 'lait 1/2 écrémé', 'hors', 'KNOWN_LIMITATION', { vide: true }, 'hors ligne, la table d\'alias n\'est pas chargée et « 1/2 » n\'est écrit dans aucun nom : rien en local (hors lot : un synonyme est une décision)'),
  V('FV-009', 'lait', 'lait entier', 'en', 'MUST', { top: '^Lait entier', jamais: 'écrémé' }, 'entier demandé : jamais un écrémé'),
  V('FV-010', 'lait', 'lait entier', 'hors', 'MUST', { top: '^Lait entier', jamais: 'écrémé' }, 'hors ligne aussi'),
  V('FV-011', 'lait', 'lait 1,2%', 'hors', 'MUST', { top: '1,2% MG' }, 'un taux décimal'),
  V('FV-012', 'lait', 'lait 2%', 'hors', 'MUST', { vide: true, jamais: '1,2% MG' }, '2 % n\'est pas 1,2 % : la base n\'a pas de lait à 2 % — RIEN en local, jamais un autre taux'),

  /* ── FROMAGE BLANC : 0 % / 2-3 % / 7-8 % ── */
  V('FV-020', 'fromage blanc', 'fromage blanc', 'en', 'MUST', { varie: { re: [TAUX(0), '2-3% MG', '7-8% MG'], min: 2 } }, 'sans taux : PAS automatiquement 0 % — plusieurs taux proposés'),
  V('FV-021', 'fromage blanc', 'fromage blanc', 'hors', 'MUST', { varie: { re: [TAUX(0), '2-3% MG', '7-8% MG'], min: 2 } }, 'hors ligne aussi'),
  V('FV-022', 'fromage blanc', 'fromage blanc 0%', 'en', 'MUST', { top: '^Fromage blanc, nature, 0% MG', compat: TAUX(0), incompat: '2-3% MG|7-8% MG|6-7% MG' }, '0 % demandé : aucun 2-3 % au-dessus d\'un 0 %'),
  V('FV-023', 'fromage blanc', 'fromage blanc 0%', 'hors', 'MUST', { top: '^Fromage blanc, nature, 0% MG', compat: TAUX(0), incompat: '2-3% MG|7-8% MG|6-7% MG' }, 'hors ligne aussi'),
  V('FV-024', 'fromage blanc', 'fromage blanc 0 %', 'en', 'MUST', { top: '^Fromage blanc, nature, 0% MG', compat: TAUX(0), incompat: '2-3% MG|7-8% MG|6-7% MG' }, '« 0 % » écrit avec une espace (typographie française) : le même taux'),
  V('FV-025', 'fromage blanc', 'fromage blanc 0 %', 'hors', 'MUST', { top: '^Fromage blanc, nature, 0% MG', compat: TAUX(0), incompat: '2-3% MG|7-8% MG|6-7% MG' }, 'avec une espace, hors ligne'),
  V('FV-026', 'fromage blanc', 'fromage blanc 2-3%', 'hors', 'MUST', { top: '^Fromage blanc, nature, 2-3% MG', compat: '2-3% MG', incompat: TAUX(0) + '|7-8% MG' }, '2-3 % demandé'),
  V('FV-027', 'fromage blanc', 'fromage blanc 3%', 'hors', 'MUST', { top: '2-3% MG', jamais: TAUX(0) + '|7-8% MG' }, '3 % se lit dans la fourchette 2-3 % de la table'),
  V('FV-028', 'fromage blanc', 'fromage blanc 7-8%', 'hors', 'MUST', { top: '^Fromage blanc, nature, 7-8% MG', jamais: TAUX(0) + '|2-3% MG' }, '7-8 % demandé'),
  V('FV-029', 'fromage blanc', 'fromage blanc 20%', 'hors', 'MUST', { vide: true }, 'aucun fromage blanc à 20 % dans la base : RIEN, jamais un autre taux'),
  V('FV-030', 'fromage blanc', 'fromage blanc zéro', 'en', 'MUST', { top: '^Fromage blanc, nature, 0% MG' }, '« zéro » = 0 % (table d\'alias)'),
  V('FV-031', 'fromage blanc', 'fromage blanc zéro', 'hors', 'KNOWN_LIMITATION', { top: 'avec édulcorants' }, 'hors ligne, « zéro » est traduit en « édulcorants » (synonyme pensé pour les boissons, ft-v1113) : le 0 % reste respecté mais l\'aromatisé passe devant le nature (hors lot : un synonyme est une décision)'),
  V('FV-032', 'fromage blanc', 'fromage blanc 2%', 'hors', 'KNOWN_LIMITATION', { vide: true }, '2 % n\'est écrit nulle part (la table dit « 2-3 % ») : lire une fourchette serait une règle nouvelle, non demandée'),
  V('FV-033', 'fromage blanc', 'fromage blanc allégé', 'hors', 'KNOWN_LIMITATION', { vide: true }, 'la table ne dit jamais « allégé » pour le fromage blanc (elle dit 0 % ou 2-3 %) : on ne choisit pas à la place de la personne'),

  /* ── STEAK HACHÉ / BŒUF HACHÉ : 5 / 10 / 15 / 20 % ── */
  V('FV-040', 'steak haché', 'steak haché', 'en', 'MUST', { varie: { re: [TAUX(5), TAUX(10), TAUX(15), TAUX(20)], min: 3 } }, 'sans taux : PAS automatiquement 5 % — plusieurs taux proposés'),
  V('FV-041', 'steak haché', 'steak haché', 'hors', 'MUST', { varie: { re: [TAUX(5), TAUX(10), TAUX(15), TAUX(20)], min: 3 } }, 'hors ligne aussi'),
  V('FV-042', 'steak haché', 'steak haché 5%', 'en', 'MUST', { top: TAUX(5), aussi: [TAUX(5) + ' cru', TAUX(5) + ' cuit'], jamais: AUTRES(10, 15, 20) }, '5 % demandé : les deux 5 % (cru, cuit), jamais un 15 % ou un 20 %'),
  V('FV-043', 'steak haché', 'steak haché 5%', 'hors', 'MUST', { top: TAUX(5), aussi: [TAUX(5) + ' cru', TAUX(5) + ' cuit'], jamais: AUTRES(10, 15, 20) }, 'hors ligne aussi'),
  V('FV-044', 'steak haché', 'steak haché 5 %', 'en', 'MUST', { top: TAUX(5), aussi: [TAUX(5) + ' cru', TAUX(5) + ' cuit'], jamais: AUTRES(10, 15, 20) }, '« 5 % » avec une espace : le même taux'),
  V('FV-045', 'steak haché', 'steak haché 5 %', 'hors', 'MUST', { top: TAUX(5), aussi: [TAUX(5) + ' cru', TAUX(5) + ' cuit'], jamais: AUTRES(10, 15, 20) }, 'avec une espace, hors ligne'),
  V('FV-046', 'steak haché', 'steak haché 10%', 'hors', 'MUST', { top: TAUX(10), jamais: AUTRES(5, 15, 20) }, '10 % demandé'),
  V('FV-047', 'steak haché', 'steak haché 10 %', 'hors', 'MUST', { top: TAUX(10), jamais: AUTRES(5, 15, 20) }, '10 % avec une espace'),
  V('FV-048', 'steak haché', 'steak haché 15%', 'hors', 'MUST', { top: TAUX(15), jamais: AUTRES(5, 10, 20) }, '15 % demandé'),
  V('FV-049', 'steak haché', 'steak haché 15 %', 'en', 'MUST', { top: TAUX(15), jamais: AUTRES(5, 10, 20) }, '15 % avec une espace'),
  V('FV-050', 'steak haché', 'steak haché 20%', 'hors', 'MUST', { top: TAUX(20), jamais: AUTRES(5, 10, 15) }, '20 % demandé'),
  V('FV-051', 'steak haché', 'steak haché 20 %', 'hors', 'MUST', { top: TAUX(20), jamais: AUTRES(5, 10, 15) }, '20 % avec une espace'),
  V('FV-052', 'steak haché', 'boeuf haché 5 %', 'en', 'MUST', { top: TAUX(5), aussi: [TAUX(5) + ' cru', TAUX(5) + ' cuit'], jamais: AUTRES(10, 15, 20) }, 'bœuf haché, 5 % avec une espace : aucun 10/15/20 % devant un 5 %'),
  V('FV-053', 'steak haché', 'boeuf haché 5%', 'hors', 'MUST', { top: TAUX(5), jamais: AUTRES(10, 15, 20) }, 'bœuf haché 5 %, hors ligne'),
  V('FV-054', 'steak haché', 'steak haché 5% cru', 'hors', 'MUST', { top: '^Boeuf, steak haché 5% MG cru', jamais: AUTRES(10, 15, 20) }, 'taux ET forme nommés : les deux tiennent'),
  V('FV-055', 'steak haché', 'steak haché 15% cuit', 'hors', 'MUST', { top: '^Boeuf, steak haché 15% MG cuit', jamais: AUTRES(5, 10, 20) }, 'taux ET forme nommés'),
  V('FV-056', 'steak haché', 'haché 20%', 'hors', 'MUST', { top: TAUX(20), jamais: AUTRES(5, 10, 15) }, 'frappe courte'),
  V('FV-057', 'steak haché', 'viande hachée 15%', 'en', 'KNOWN_LIMITATION', { vide: true }, 'la table d\'alias ne connaît « viande hachée » qu\'à 5 % ; CIQUAL ne dit pas « viande hachée » (hors lot)'),
  V('FV-058', 'steak haché', 'steak haché 5', 'en', 'OBSERVATION', { varie: { re: [TAUX(5), TAUX(10), TAUX(15), TAUX(20)], min: 3 } }, 'un chiffre SANS « % » n\'est pas un taux explicite (« pizza 4 fromages ») : il reste ignoré'),

  /* ── CRÈME : 30 % / légère / fluide ── */
  V('FV-060', 'crème', 'crème 30%', 'hors', 'MUST', { top: '^Crème 30% MG', compat: '^Crème 30% MG', incompat: 'légère|12 à' }, '30 % demandé : aucune crème légère au-dessus'),
  V('FV-061', 'crème', 'crème 30 %', 'hors', 'MUST', { top: '^Crème 30% MG', compat: '^Crème 30% MG', incompat: 'légère|12 à' }, '30 % avec une espace'),
  V('FV-062', 'crème', 'crème légère', 'hors', 'MUST', { top: 'légère', jamais: '^Crème 30% MG' }, 'légère demandée : jamais la crème à 30 %'),
  V('FV-063', 'crème', 'crème fluide', 'hors', 'MUST', { top: 'fluide' }, 'fluide demandée'),
  V('FV-064', 'crème', 'crème fraîche', 'en', 'KNOWN_LIMITATION', { vide: true }, 'CIQUAL ne dit pas « fraîche » (« Crème 30% MG, épaisse, rayon frais ») — FR-119 ; dire que l\'une est l\'autre est une décision de Michel'),
  V('FV-065', 'crème', 'crème fraîche 30%', 'hors', 'KNOWN_LIMITATION', { vide: true }, 'même cause : le mot « fraîche »'),
  V('FV-066', 'crème', 'crème 15%', 'hors', 'KNOWN_LIMITATION', { vide: true }, 'la table écrit des fourchettes (« 12 à 25 % », « 12 à 20 % ») : lire une fourchette serait une règle nouvelle'),
  V('FV-067', 'crème', 'crème entière', 'hors', 'KNOWN_LIMITATION', { vide: true }, '« entière » n\'est écrit pour aucune crème : on ne décide pas qu\'elle vaut 30 %'),

  /* ── YAOURT : 0 % / grec / nature / allégé ── */
  V('FV-070', 'yaourt', 'yaourt 0%', 'hors', 'MUST', { top: TAUX(0), jamais: 'grecque' }, '0 % demandé : jamais le yaourt à la grecque (8 g de lipides)'),
  V('FV-071', 'yaourt', 'yaourt 0 %', 'en', 'MUST', { top: TAUX(0), jamais: 'grecque' }, '« 0 % » avec une espace'),
  V('FV-072', 'yaourt', 'yaourt 0 %', 'hors', 'MUST', { top: TAUX(0), jamais: 'grecque' }, 'avec une espace, hors ligne'),
  V('FV-073', 'yaourt', 'yaourt grec', 'hors', 'MUST', { top: 'grecque' }, 'grec = à la grecque'),
  V('FV-074', 'yaourt', 'yaourt nature', 'hors', 'MUST', { top: 'nature' }, 'nature demandé'),
  V('FV-075', 'yaourt', 'yaourt allégé', 'hors', 'MUST', { vide: true, jamais: 'non allégé' }, '« allégé » demandé : JAMAIS « non allégé » — l\'opposé n\'est pas une réponse ; la table n\'a aucun yaourt « allégé » (elle dit « 0 % ») : RIEN en local'),
  V('FV-076', 'yaourt', 'yaourt allégé', 'en', 'MUST', { vide: true, jamais: 'non allégé' }, 'en ligne aussi'),

  /* ── FROMAGES FRAIS : faisselle, petit-suisse ── */
  V('FV-080', 'fromage frais', 'faisselle 0%', 'hors', 'MUST', { top: '^Faisselle, 0% MG', jamais: '6% MG' }, '0 % demandé'),
  V('FV-081', 'fromage frais', 'faisselle 6%', 'hors', 'MUST', { top: '^Faisselle, 6% MG', jamais: TAUX(0) }, '6 % demandé'),
  V('FV-082', 'fromage frais', 'petit suisse', 'hors', 'MUST', { varie: { re: [TAUX(0), '4% MG', '10% MG'], min: 2 } }, 'sans taux : plusieurs taux'),
  V('FV-083', 'fromage frais', 'petit suisse 0%', 'hors', 'MUST', { top: TAUX(0), jamais: AUTRES(4, 10) }, '0 % demandé : jamais le 10 % (« 0% » n\'est pas dans « 10% »)'),
  V('FV-084', 'fromage frais', 'petit suisse 10%', 'hors', 'MUST', { top: TAUX(10), jamais: TAUX(0) + '|4% MG' }, '10 % demandé'),

  /* ── FROMAGES, BEURRE, CHARCUTERIE : allégé / demi-sel ── */
  V('FV-090', 'allégé', 'emmental allégé', 'hors', 'MUST', { top: 'allégé', jamais: 'non allégé' }, 'allégé demandé'),
  V('FV-091', 'allégé', 'camembert allégé', 'hors', 'MUST', { top: ', allégé', jamais: 'non allégé' }, 'allégé demandé : le « non allégé » n\'est pas une réponse'),
  V('FV-092', 'allégé', 'jambon allégé', 'hors', 'MUST', { top: 'allégé' }, 'allégé demandé'),
  V('FV-093', 'beurre', 'beurre', 'hors', 'MUST', { varie: { re: ['80% MG', '39-41% MG', '60-62% MG'], min: 2 } }, 'sans qualificatif : plusieurs beurres'),
  V('FV-094', 'beurre', 'beurre demi-sel', 'hors', 'MUST', { top: 'demi-sel', jamais: 'doux' }, 'demi-sel demandé : jamais doux'),
  V('FV-095', 'beurre', 'beurre demi-sel', 'en', 'MUST', { top: 'demi-sel', aussi: ['^Beurre sans précision.*\\(allégé ou non\\), demi-sel'], jamais: 'doux' }, '« (allégé ou non), demi-sel » : « ou non » ne nie pas le mot qui suit — l\'aliment moyen reste proposé'),
  V('FV-096', 'beurre', 'barre céréalière enrichie', 'hors', 'MUST', { aussi: ['au chocolat ou non, enrichie'] }, '« au chocolat ou non, enrichie » : la barre EST enrichie — « ou non » porte sur ce qui précède'),
  V('FV-097', 'beurre', 'terrine de poisson', 'hors', 'MUST', { aussi: ['avec ou sans poisson'] }, '« avec ou sans poisson » : le poisson PEUT y être — « ou sans » ne nie rien'),

  /* ── BOISSONS : sans sucre / zéro ── */
  V('FV-100', 'boissons', 'cola sans sucre', 'hors', 'MUST', { top: 'sans sucres ajoutés', compat: 'sans sucres ajoutés', incompat: '^Cola, sucré' }, '« sans sucre » demandé : jamais « Cola, sucré, sans caféine » devant'),
  V('FV-101', 'boissons', 'cola sans sucre', 'en', 'MUST', { top: 'sans sucres ajoutés', compat: 'sans sucres ajoutés', incompat: '^Cola, sucré' }, 'en ligne aussi'),
  V('FV-102', 'boissons', 'coca zéro', 'en', 'MUST', { top: '^Cola, sans sucres ajoutés' }, 'zéro = sans sucres ajoutés (table d\'alias)'),
  V('FV-103', 'boissons', 'coca zéro', 'hors', 'KNOWN_LIMITATION', { top: '^Cola, sucré, avec édulcorants' }, 'hors ligne, « zéro » est traduit en « édulcorants » (ft-v1113) : le cola sucré aux édulcorants passe devant le sans sucres (hors lot : un synonyme est une décision)'),

  /* ── CHOCOLAT : un taux écrit avec une espace DANS LA TABLE ── */
  V('FV-110', 'chocolat', 'chocolat noir 70%', 'hors', 'MUST', { top: '^Chocolat noir 70 % de cacao' }, 'la table écrit « 70 % » avec une espace : « 70% » la retrouve'),
  V('FV-111', 'chocolat', 'chocolat noir 70 %', 'hors', 'MUST', { top: '^Chocolat noir 70 % de cacao', jamais: '50 %' }, 'et l\'inverse'),
  /* ── NUT-FOOD-VARIANTS-02 (12/10/2026, contre-vérification) : la négation tapée ne vide plus une recherche dont un
     résultat COMPATIBLE existe sous une autre écriture ; elle refuse toujours le CONTRAIRE explicite. Les témoins
     disent l'invariant (compatible présent · contraire absent · absence réelle), pas un ordre arbitraire. ── */
  V('FV-120', 'négation', 'café non sucré', 'hors', 'MUST', { aussi: ['^Café.*sans sucres ajoutés'], jamais: ', sucrée?(,|$)' }, '« non sucré » : la table écrit « sans sucres ajoutés » — compatible ; jamais un café « sucré »'),
  V('FV-121', 'négation', 'café sans caféine', 'hors', 'MUST', { aussi: ['^Café décaféiné'] }, '« sans caféine » : un café DÉCAFÉINÉ est compatible (« caféine » n\'y est pas un mot, il est dans « décaféiné »)'),
  V('FV-122', 'négation', 'jambon sans couenne', 'hors', 'MUST', { aussi: ['découenné'] }, '« sans couenne » : un jambon DÉCOUENNÉ est compatible'),
  V('FV-123', 'négation', 'yaourt sans sucre', 'hors', 'MUST', { aussi: ['^Yaourt'], jamais: ', sucrée?(,|$)' }, '« sans sucre » : jamais un yaourt « sucré » ; un yaourt qui ne dit rien du sucre reste proposé (aucune équivalence inventée)'),
  V('FV-124', 'négation', 'sel non iodé', 'hors', 'MUST', { aussi: ['non iodé'], jamais: '(^|, )iodé' }, '« non X » : le sel non iodé, jamais le sel « iodé »'),
  V('FV-125', 'négation', 'fromage non allégé', 'hors', 'MUST', { aussi: ['non allégé'], jamais: ', allégé' }, '« non X » : jamais un fromage « allégé »'),
  V('FV-126', 'négation', 'céréales non enrichies', 'hors', 'MUST', { aussi: ['non enrichies'], jamais: ', enrichies' }, '« non X » au pluriel : jamais des céréales « enrichies »'),
  V('FV-127', 'pluriel', 'yaourts allégés', 'hors', 'MUST', { vide: true, jamais: 'non allégé' }, 'pluriel : jamais « non allégé » (la table n\'a aucun yaourt allégé : RIEN)'),
  V('FV-128', 'pluriel', 'biscuits enrichis', 'hors', 'MUST', { aussi: ['^Biscuit.*, enrichi'], jamais: 'non enrichi' }, 'pluriel : des biscuits enrichis, jamais « non enrichi »'),
  V('FV-129', 'décimal', 'eau 1,5 l', 'hors', 'MUST', { aussi: ['^Eau'] }, 'une QUANTITÉ décimale n\'est pas un taux : « eau 1,5 l » trouve de l\'eau'),
  V('FV-130', 'décimal', 'lait 1,2 %', 'hors', 'MUST', { top: '1,2% MG' }, 'un taux décimal avec une espace'),
  V('FV-131', 'décimal', 'lait 2 %', 'hors', 'MUST', { vide: true, jamais: '1,2% MG' }, '2 % n\'est pas 1,2 %, avec une espace aussi'),
  V('FV-132', 'ou non', 'Café au lait, café crème ou cappuccino, instantané ou non, sans sucres ajoutés, prêt à boire', 'hors', 'MUST', { aussi: ['^Café au lait, café crème ou cappuccino, instantané ou non'] }, 'un nom complet avec « ou non » se retrouve lui-même'),
  V('FV-133', 'ou non', 'Maquereau, filet (grillé ou non), au naturel, appertisé, égoutté', 'hors', 'MUST', { aussi: ['^Maquereau, filet \\(grillé ou non\\)'] }, 'un nom complet avec « ou non » se retrouve lui-même'),
  V('FV-134', 'ou non', 'Terrine de fruits de mer (par ex. de Saint-Jacques), avec ou sans poisson, préemballée', 'hors', 'MUST', { aussi: ['^Terrine de fruits de mer'] }, 'un nom complet avec « ou sans » se retrouve lui-même'),
];
const NIVEAUX = ['MUST', 'KNOWN_LIMITATION', 'OBSERVATION'];

/* Le jugement d'UN cas, sur la seule section CIQUAL : la liste de ce qui ne tient pas (vide = le cas tient). */
function juger(c, o) {
  const ko = [], L = o.lignes.filter(l => l.src === 'CIQ').map(l => l.titre), R = s => new RegExp(s);
  if (c.vide && L.length) ko.push('attendu vide, ' + L.length + ' ligne(s) CIQUAL');
  if (!c.vide && !L.length) ko.push('aucune ligne CIQUAL');
  if (c.top && !(L[0] && R(c.top).test(L[0]))) ko.push('1ʳᵉ ligne ≠ /' + c.top + '/');
  (c.aussi || []).forEach(s => { if (!L.some(x => R(s).test(x))) ko.push('absent : /' + s + '/'); });
  if (c.jamais) { const x = L.find(y => R(c.jamais).test(y)); if (x) ko.push('incompatible présent : « ' + x + ' »'); }
  if (c.compat) {
    const ic = L.map((x, i) => R(c.compat).test(x) ? i : -1).filter(i => i >= 0), ii = L.map((x, i) => R(c.incompat).test(x) && !R(c.compat).test(x) ? i : -1).filter(i => i >= 0);
    if (!ic.length) ko.push('aucun résultat compatible');
    else if (ii.length && Math.min(...ii) < Math.max(...ic)) ko.push('incompatible « ' + L[Math.min(...ii)] + ' » au-dessus d\'un compatible');
  }
  if (c.varie) { const n = c.varie.re.filter(s => L.some(x => R(s).test(x))).length; if (n < c.varie.min) ko.push(n + ' variante(s) seulement (< ' + c.varie.min + ')'); }
  return ko;
}

module.exports.source = function (t) {
  console.log('\n═══ B-FV-A. NUT-FOOD-VARIANTS-01 — la structure du corpus (données) ═══');
  const ids = CAS.map(c => c.id), must = CAS.filter(c => c.niveau === 'MUST'), fams = new Set(CAS.map(c => c.fam));
  t('B-FV-A ① ' + CAS.length + ' cas, identifiants uniques (FV-nnn), un niveau, un contexte, une raison chacun',
    new Set(ids).size === ids.length && ids.every(i => /^FV-\d{3}$/.test(i)) && CAS.every(c => NIVEAUX.includes(c.niveau) && MS.CTX[c.ctx] && c.raison), String(CAS.length));
  t('B-FV-A ② au moins 30 contrats MUST (' + must.length + ') sur au moins 6 familles (' + fams.size + ') — la règle est générale, pas taillée pour un exemple',
    must.length >= 30 && fams.size >= 6, must.length + ' / ' + fams.size);
  t('B-FV-A ③ le minimum demandé est là : lait, lait écrémé, demi-écrémé, 1/2 écrémé, entier · fromage blanc, nature, 0 %, zéro · steak haché 5 / 10 / 15 / 20 % · crème · et des requêtes SANS qualificatif',
    ['lait', 'lait écrémé', 'lait demi-écrémé', 'lait 1/2 écrémé', 'lait entier', 'fromage blanc', 'fromage blanc 0%', 'fromage blanc 0 %', 'fromage blanc zéro',
      'steak haché', 'steak haché 5%', 'steak haché 10%', 'steak haché 15%', 'steak haché 20%', 'crème 30%', 'crème fraîche'].every(q => CAS.some(c => c.q === q))
      && CAS.filter(c => c.varie && c.niveau === 'MUST').length >= 6, '');
  t('B-FV-A ④ chaque contrat MUST porte au moins un oracle (1ʳᵉ ligne, présence, incompatible, ordre, variété ou vide)',
    must.every(c => c.top || c.aussi || c.jamais || c.compat || c.varie || c.vide), must.filter(c => !(c.top || c.aussi || c.jamais || c.compat || c.varie || c.vide)).map(c => c.id).join(' '));
};

module.exports.ecran = async function (t, b, PORT) {
  const P = await MS.executer(b, PORT, CAS, false);
  console.log('\n-- B-FV-B. NUT-FOOD-VARIANTS-01 — les variantes par la VRAIE FRAPPE (en ligne et hors ligne) --');
  for (const c of CAS) {
    const o = P.obs[c.id], ko = o ? juger(c, o) : ['non joué'];
    const vu = o ? JSON.stringify(o.lignes.filter(l => l.src === 'CIQ').slice(0, 5).map(l => l.titre)) : '';
    const tag = 'B-FV-B ' + c.id + ' [' + c.niveau + '] ' + (c.ctx !== 'en' ? c.ctx.toUpperCase() + ' ' : '') + '« ' + c.q + ' » — ' + c.raison;
    if (c.niveau === 'MUST') t(tag, ko.length === 0, JSON.stringify(ko) + ' ' + vu);
    else if (c.niveau === 'KNOWN_LIMITATION') console.log('   ' + (ko.length ? '🔁 a changé — à relire' : '·  toujours observée') + '  ' + tag + (ko.length ? '  >> ' + JSON.stringify(ko) + ' ' + vu : ''));
    else console.log('   👁  ' + tag + '  >> ' + vu);
  }
  t('B-FV-B aucune erreur de page, aucune requête hors du cas en cours', !P.errs.length && !P.anomalies.length, JSON.stringify(P.errs.concat(P.anomalies).slice(0, 3)));
  const P2 = await MS.executer(b, PORT, CAS, true);
  const sig = o => o ? o.lignes.map(l => l.src + ':' + l.titre).join('§') : 'non joué';
  const diff = CAS.filter(c => sig(P.obs[c.id]) !== sig(P2.obs[c.id])).map(c => c.id);
  console.log('\n-- B-FV-D. NUT-FOOD-VARIANTS-01 — déterminisme --');
  t('B-FV-D le corpus rejoué dans des contextes neufs, cas dans l\'ordre INVERSE → mêmes lignes, même ordre (' + CAS.length + ' cas)', diff.length === 0, diff.join(' '));
  await module.exports.nomsComplets(t, b, PORT);
};

/* B-FV-N — NUT-FOOD-VARIANTS-02 : L'INVARIANT GÉNÉRAL. Chaque nom CIQUAL proposable, tapé EN ENTIER, se retrouve
   lui-même (moteur hors ligne, sans table d'alias). Mesuré par la contre-vérification : la 1ʳᵉ version de la négation
   en perdait 2 (« … ou non … »). Sur 0407516b : 0 perdu. */
module.exports.nomsComplets = async function (t, b, PORT) {
  console.log('\n-- B-FV-N. NUT-FOOD-VARIANTS-02 — chaque nom CIQUAL complet se retrouve lui-même --');
  const cx = await b.newContext({ serviceWorkers: 'block' });
  await cx.route(/script\.google\.com|workers\.dev|anthropic|openfoodfacts/, rt => rt.abort());
  const pg = await cx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`try{localStorage.setItem('ft4_ob2','1');localStorage.setItem('ft4_guide_shown','1');localStorage.setItem('ft4_wn_seen','99');}catch(e){}`);
  await pg.goto('http://localhost:' + PORT + '/index.html'); await pg.waitForTimeout(1500);
  const r = await pg.evaluate(async () => { await _ciqualCharger(); _alias = null;
    const L = _ciqual.a.filter(a => a[3] != null);
    return { n: L.length, perdus: L.filter(a => !_ciqualChercher(a[1], 400).some(x => x[0] === a[0])).map(a => a[1]) }; });
  t('B-FV-N les ' + r.n + ' noms CIQUAL proposables, tapés en entier, se retrouvent tous eux-mêmes', r.n > 3000 && r.perdus.length === 0 && !errs.length,
    JSON.stringify(r.perdus.slice(0, 3)) + ' ' + errs.join(' | '));
  await cx.close();
};

module.exports.CAS = CAS;
module.exports.juger = juger;
