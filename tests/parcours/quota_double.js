/* ════════════════════════════════════════════════════════════════════════════════════════
   BLOC B-CCCXXXIII — UN APPEL IA CONSOMME EXACTEMENT UNE UNITÉ DE QUOTA (session-A, phase 3)

   ⛔⛔ LE DÉFAUT, MESURÉ EN PHASE 2 ET REPRODUIT ICI SUR LA SOURCE.
   Un appel IA passé par le Worker traverse DEUX routes d'Apps Script :
     ① `_identiteIA` → `authIdentity` → `handleAuthIdentity_`  → quota
     ② `_compterIA`  → `aiCount`      → la route de comptage   → quota
   Les deux appelaient `_aiQuotaBlock_`, et cette fonction **n'est pas une lecture : elle
   ÉCRIT** (`q.global++`, `q.byEmail[e] = ec + 1`, puis `setProperty`).
   👉 Chaque appel IA consommait donc **deux unités**. Plafonds réels : **25/jour/e-mail au
   lieu de 50**, **300/jour au lieu de 600**, **75 au lieu de 150** pour le compte de
   développement.

   ⭐⭐ ET IL Y AVAIT UN SECOND DÉFAUT, PLUS DISCRET, QUE LA CORRECTION FERME AUSSI : un appel
   **REFUSÉ** consommait quand même. `handleAuthIdentity_` incrémentait avant même que le
   Worker ne décide de répondre 429 — donc quelqu'un déjà bloqué continuait de creuser son
   propre plafond en essayant. *Un garde-fou qui se déclenche en consommant la ressource
   qu'il protège travaille contre lui-même.*

   ⭐ LA CORRECTION EST UNE SÉPARATION, PAS UN COMPTEUR EN MOINS. On distingue **lire l'état**
   de **consommer une unité** :
     · `_aiQuotaEtat_`  — dit si c'est bloqué. **N'écrit rien.**
     · `_aiQuotaBlock_` — lit l'état PUIS consomme. Un seul propriétaire de l'écriture (R2).
   L'identité lit ; le comptage consomme. Un appel = une consommation.

   ⛔ ON NE COMPENSE PAS EN DOUBLANT LES PLAFONDS (consigne explicite de Michel) : les valeurs
   600/50/150 ne bougent pas. *Doubler un plafond pour absorber un double comptage, c'est
   graver le bug dans la configuration et le rendre indétectable.*

   ⚠️ CE BLOC MESURE LA SOURCE, PAS L'EXÉCUTION : `Code.js` tourne chez Google, pas ici. Ce
   qu'on prouve, c'est qu'il n'existe plus qu'UN chemin d'écriture, et que l'identité ne
   l'emprunte pas.
   ════════════════════════════════════════════════════════════════════════════════════════ */

function source(t, ROOT, fs, path) {
  const brut = fs.readFileSync(path.join(ROOT, 'Code.js'), 'utf8');
  /* ⚠️ COMMENTAIRES NEUTRALISÉS — l'en-tête de la correction cite `_aiQuotaBlock_` et
     `q.global++` à plusieurs reprises (R30 : la raison s'écrit à côté du code). Un témoin
     qui lirait le fichier brut resterait vert quoi qu'on remette dans le code. */
  const C = brut.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:"'])\/\/[^\n]*/gm, '$1');

  const corps = (n) => {
    const m = new RegExp('function\\s+' + n + '\\s*\\([^)]*\\)\\s*\\{').exec(C);
    if (!m) return '';
    const i = m.index + m[0].length - 1;
    let d = 0;
    for (let j = i; j < C.length; j++) {
      if (C[j] === '{') d++;
      else if (C[j] === '}') { d--; if (!d) return C.slice(i, j + 1); }
    }
    return '';
  };

  const ETAT = corps('_aiQuotaEtat_');
  const BLOCK = corps('_aiQuotaBlock_');
  const IDENT = corps('handleAuthIdentity_');

  console.log('\n═══ B-CCCXXXIII. Un appel IA = une unité de quota ═══');

  // ── ① à ③ : il n'existe plus qu'UN chemin d'écriture ────────────────────────────────
  t('B-CCCXXXIII ① ⭐ la LECTURE de l\'état du quota existe, séparée de la consommation',
    ETAT !== '', '_aiQuotaEtat_ introuvable');

  /* ⭐⭐ LE TÉMOIN CENTRAL : la lecture n'écrit RIEN. On cherche les trois formes d'écriture
     possibles, pas seulement `setProperty` — un incrément sans enregistrement laisserait
     malgré tout l'objet modifié pour la suite du traitement. */
  t('B-CCCXXXIII ② ⭐⭐ la lecture d\'état n\'ÉCRIT rien (ni incrément, ni enregistrement)',
    ETAT !== '' && !/q\.global\+\+/.test(ETAT) && !/byEmail\[e\]\s*=/.test(ETAT)
      && !/setProperty\(\s*'ai_quota'/.test(ETAT), '');

  t('B-CCCXXXIII ③ ⭐⭐ l\'écriture du quota vit dans UN SEUL endroit du fichier',
    (C.match(/q\.global\+\+/g) || []).length === 1
      && (C.match(/setProperty\(\s*'ai_quota'/g) || []).length === 1,
    'incréments : ' + (C.match(/q\.global\+\+/g) || []).length
      + ' · enregistrements : ' + (C.match(/setProperty\(\s*'ai_quota'/g) || []).length);

  // ── ④ à ⑤ : l'identité LIT, elle ne consomme plus ───────────────────────────────────
  t('B-CCCXXXIII ④ ⭐⭐ l\'identité n\'appelle plus le chemin QUI CONSOMME',
    IDENT !== '' && !/_aiQuotaBlock_\s*\(/.test(IDENT),
    IDENT === '' ? 'handleAuthIdentity_ introuvable' : 'elle l\'appelle encore');

  t('B-CCCXXXIII ⑤ ⭐ l\'identité lit quand même l\'état (elle doit toujours pouvoir dire '
    + '« bloqué »)',
    IDENT !== '' && /_aiQuotaEtat_\s*\(/.test(IDENT), '');

  /* ⛔ ET ELLE REND TOUJOURS LES DEUX CHAMPS. Sans eux, le Worker ne saurait plus répondre
     429 : on aurait supprimé un double comptage en supprimant le refus. */
  t('B-CCCXXXIII ⑥ ⛔ l\'identité rend toujours `blocked` et `scope` au Worker',
    IDENT !== '' && /blocked\s*:/.test(IDENT) && /scope\s*:/.test(IDENT), '');

  // ── ⑦ : la consommation reste là où elle doit être ──────────────────────────────────
  /* La route de comptage (`aiCount`) et la porte directe d'Apps Script (`doPost`) doivent,
     elles, continuer d'appeler le chemin qui consomme — sinon on ne compterait plus rien. */
  /* ⚠️ ON EXCLUT LA DÉCLARATION. Premier jet : le motif comptait aussi `function
     _aiQuotaBlock_(` — le témoin annonçait donc 4 au lieu de 3, et serait resté ROUGE sur
     une correction parfaitement juste. *Un compteur d'appels qui compte la définition
     mesure autre chose que ce qu'il annonce.* */
  const nbBlock = (C.match(/(?<!function\s)_aiQuotaBlock_\s*\(/g) || []).length;
  t('B-CCCXXXIII ⑦ ⭐ le chemin qui consomme est appelé exactement 2 fois (comptage + porte '
    + 'directe), et plus 3',
    nbBlock === 2, nbBlock + ' appel(s)');

  t('B-CCCXXXIII ⑧ ⭐ le chemin qui consomme s\'appuie sur la lecture (un seul propriétaire '
    + 'de la règle)',
    BLOCK !== '' && /_aiQuotaEtat_\s*\(/.test(BLOCK), '');

  // ── ⑨ à ⑪ : les plafonds ne bougent pas ─────────────────────────────────────────────
  /* ⛔ CONSIGNE EXPLICITE DE MICHEL : *« ne compense pas le bug en doublant artificiellement
     les plafonds »*. Ces trois témoins figent les valeurs, pour qu'un doublement soit une
     décision visible et non un effet de bord de cette correction. */
  t('B-CCCXXXIII ⑨ ⛔ le plafond global reste 600 (aucune compensation)',
    /getProperty\('AI_GLOBAL_MAX'\), 10\) \|\| 600/.test(C), '');
  t('B-CCCXXXIII ⑩ ⛔ le plafond par e-mail reste 50 (aucune compensation)',
    /getProperty\('AI_EMAIL_MAX'\), 10\)\s+\|\| 50/.test(C), '');
  t('B-CCCXXXIII ⑪ ⛔ le plafond de développement reste 150 (aucune compensation)',
    /AI_MAX_DEV_ = 150/.test(C), '');

  // ── ⑫ : le repli reste OUVERT ───────────────────────────────────────────────────────
  /* ⭐ UNE DÉCISION ÉCRITE QU'ON NE DOIT PAS CASSER EN PASSANT : une erreur de configuration
     ne doit jamais couper Milo (règle d'or 3). La séparation ajoute une fonction ; elle ne
     doit pas transformer un repli ouvert en repli fermé. */
  t('B-CCCXXXIII ⑫ ⛔ le repli reste OUVERT des deux côtés (une panne ne coupe pas Milo)',
    ETAT !== '' && /catch\s*\(err\)\s*\{[\s\S]*?blocked:\s*false/.test(ETAT)
      && /catch\s*\(err\)\s*\{[\s\S]*?blocked:\s*false/.test(BLOCK), '');
}

module.exports = { source };
