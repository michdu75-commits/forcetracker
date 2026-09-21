/* ════════════════════════════════════════════════════════════════════════════════════════
   BLOCS B-CCCXLII et B-CCCXLIII — CE QUE LE BANC APPELLE « UN EXERCICE CHIFFRÉ »
   (session-B, 21/09/2026 — écrits AVANT le correctif, et mesurés ROUGES sur le code d'avant)

   ⛔⛔ LE DÉFAUT QU'ILS FERMENT EST MESURÉ, PAS SUPPOSÉ.
   Onze scénarios du banc sur 57 reconnaissent un exercice prescrit par le seul motif
   `\d+\s*[x×]\s*\d+`. Il exige les deux nombres COLLÉS autour du « × ». Ne sont donc pas
   reconnus : `4 séries × 5 reps` (le mot « séries » s'intercale), `4 séries de 5
   répétitions`, `4 sets of 5`, et toute ligne de tableau Markdown — alors que le prompt de
   Milo emploie lui-même la formule « le nombre de SÉRIES × REPS » (§ MODÈLE DE PROGRAMME PRO).

   ⭐⭐ ET LE PIRE N'EST PAS LE FAUX ROUGE, C'EST LE FAUX VERT — c'est ce qui a décidé de
   l'existence de ces blocs. La plupart des onze emploient le motif comme FILTRE D'ENTRÉE
   (« cette ligne est-elle un exercice ? sinon je passe »). Quand plus rien n'est reconnu,
   la boucle ne s'exécute jamais, aucune violation n'est trouvée, et le témoin métier devient
   VERT. *Le scénario cesse alors de mesurer ce pour quoi il existe, sans que rien ne le dise.*
   Mesuré sur une seule réponse « monstre » portant toutes les violations, en la réécrivant
   en prose : **9 faux verts et 3 faux rouges**.

   ⛔ CE QUE CES BLOCS NE FONT PAS, ET C'EST VOULU : ils ne jugent AUCUNE règle métier. Le
   contrat retenu est un **sur-ensemble strict** de l'ancien motif — tout ce qui était reconnu
   le reste, à l'identique. B-CCCXLII ③ l'épingle explicitement, parce que rétrécir la
   reconnaissance changerait silencieusement ce que onze scénarios considèrent comme une
   violation (EV-051 compte par exemple sur `3 × 10 min` pour attraper un cardio prescrit
   comme de la musculation : le « min » ne doit surtout pas le disqualifier).

   ⚠️ ET ILS NE DISENT RIEN DES DEUX ROUGES DU RUN RÉEL. EV-055 et EV-056 restent
   INDÉCIDABLES : le texte des réponses n'est pas disponible (l'étape d'enregistrement de la
   référence a été sautée, et la pièce jointe du run n'est pas atteignable depuis ce
   conteneur — `CONNECT tunnel failed, response 403` sur le stockage d'objets). *On corrige
   un instrument dont le défaut est prouvé ; on ne rejuge pas une mesure qu'on n'a plus.*
   ════════════════════════════════════════════════════════════════════════════════════════ */

// ── Les fixtures, écrites une fois et partagées par les deux blocs ────────────────────────
/* La MÊME séance, dans les quatre écritures qu'un modèle produit réellement. Le contenu est
   identique mot pour mot : seule la NOTATION change. C'est ce qui rend la comparaison
   concluante — tout écart de verdict entre ces quatre-là vient de l'instrument, pas de Milo. */
const CORPS = [
  ['Face pull', 3, 15], ['Soulevé de terre', 5, 3], ['Développé militaire', 4, 8],
  ['Développé couché', 4, 8], ['Squat', 4, 6], ['Tirage vertical', 3, 12],
  ['Soulevé de terre roumain', 3, 10], ['Leg extension', 3, 15], ['Curl haltères', 3, 12],
  ['Élévations latérales', 3, 15], ['Pec deck', 3, 12], ['Tirage horizontal', 3, 12],
  ['Vélo', 3, 10],
];
const ENTETE = 'Voilà ta séance pour demain.\n\n';
const _liste = f => ENTETE + CORPS.map(([n, s, r]) => n + ' ' + f(s, r)).join('\n');

const MONSTRE = {
  reconnu: _liste((s, r) => '— ' + s + ' × ' + r),
  prose:   _liste((s, r) => '— ' + s + ' séries de ' + r + ' répétitions'),
  anglais: _liste((s, r) => '— ' + s + ' sets of ' + r),
  mixte:   _liste((s, r) => '— ' + s + ' séries × ' + r + ' reps'),
  tableau: ENTETE + '| Exercice | Séries | Reps |\n|---|---|---|\n'
           + CORPS.map(([n, s, r]) => '| ' + n + ' | ' + s + ' | ' + r + ' |').join('\n'),
};

/* Deux scénarios ne sont pas mis en défaut par la réponse « monstre » (leur violation est une
   question de PLACE, pas de composition). Ils ont donc leur propre paire. */
const F003 = f => ENTETE + ['Face pull ' + f(3, 15), 'Soulevé de terre ' + f(5, 3),
  'Tirage horizontal ' + f(4, 10), 'Développé couché ' + f(4, 8)].join('\n');
const F037 = f => 'Voilà ta séance soulevé de terre.\n\n'
  + ['Échauffement mobilité hanches ' + f(3, 10), 'Échauffement gainage ' + f(3, 12),
     'Échauffement barre à vide ' + f(3, 8), 'Soulevé de terre ' + f(4, 5),
     'Tirage horizontal ' + f(3, 10)].join('\n');
const REC = (a, b) => '— ' + a + ' × ' + b;
const PRO = (a, b) => '— ' + a + ' séries de ' + b + ' répétitions';

/* ⛔ LA RÉPONSE QUI DOIT RESTER REFUSÉE. Elle parle abondamment d'entraînement, cite des
   nombres, et ne prescrit RIEN. Sans elle, « tout reconnaître » passerait tous les autres
   témoins — et un contrat permissif est exactement le risque qu'on prend en élargissant. */
const SANS_SEANCE = `Avant de te détailler quoi que ce soit, j'ai besoin de savoir combien de
temps tu as ce soir. Ton dernier développé couché était à 95 kg et ça fait 3 semaines que tu
progresses. On peut partir sur 45 ou 60 minutes, dis-moi.`;

function source(t, ROOT, fs, path) {
  const SC = require(path.join(ROOT, 'tests/milo/eval-scenarios.js'));
  const U = SC.U;
  const IDS = ['EV-003','EV-016','EV-017','EV-024','EV-034','EV-035','EV-037','EV-041',
               'EV-051','EV-055','EV-056'];

  // ══ B-CCCXLII — LE CONTRAT LUI-MÊME ═══════════════════════════════════════════════════
  const dit = x => (typeof U.chiffre === 'function') ? U.chiffre(x) : null;

  t('B-CCCXLII ① ⭐⭐ un propriétaire unique répond à « est-ce un exercice chiffré ? »',
    typeof U.chiffre === 'function', 'U.chiffre = ' + typeof U.chiffre);

  /* ⭐ LES FORMATS AUJOURD'HUI REJETÉS. Chacun est une écriture que le prompt de Milo
     autorise ou emploie lui-même — ce ne sont pas des cas inventés pour l'occasion. */
  const DOIT_RECONNAITRE = [
    '4 × 5', '4x5', '4 x 5', '4×5-8', '**4×5**', '3x8 @ 82.5 kg',          // l'ancien contrat
    '4 séries × 5 reps', '4 séries de 5 répétitions', '4 séries de 5',      // le français réel
    '4 sets of 5', '4 sets x 5 reps',                                       // l'anglais
    '3 series de 12', '5 reps × 4 séries',                                  // sans accent, inversé
    '| Développé couché | 4 | 8 |',                                         // tableau Markdown
  ];
  const rates = DOIT_RECONNAITRE.filter(s => dit(s) !== true);
  t('B-CCCXLII ② ⭐⭐ les écritures valides d\'une même série sont toutes reconnues',
    rates.length === 0, 'non reconnues : ' + JSON.stringify(rates));

  /* ⛔⛔ SUR-ENSEMBLE STRICT. Si une seule écriture que l'ANCIEN motif reconnaissait cessait
     de l'être, onze scénarios changeraient de définition de « violation » en silence. */
  const ANCIEN = /\d+\s*[x×]\s*\d+/;
  const CORPUS = DOIT_RECONNAITRE.concat([
    'repos 2 min', '8 min de vélo', '120 kg', 'je te propose 3 exercices', 'RIR 2',
    '3 × 10 min', '90 s', '12/10/8/8', '5\'\'+8', '10x2', 'à 80 % du 1RM',
    '| Exercice | Séries | Reps |', '|---|---|---|', 'on évite le développé militaire',
  ]);
  const retreci = CORPUS.filter(s => ANCIEN.test(U.norm(s)) && dit(s) !== true);
  t('B-CCCXLII ③ ⛔⛔ le contrat est un SUR-ENSEMBLE strict de l\'ancien motif',
    retreci.length === 0, 'perdues : ' + JSON.stringify(retreci));

  /* ⛔ ET IL NE DOIT PAS DEVENIR UN « CONTIENT DEUX NOMBRES ». */
  const DOIT_REFUSER = ['repos 2 min', '8 min de vélo en intensité légère', '120 kg',
    'je te propose 3 exercices', 'ton record est de 105 kg pour 2 reps le 27 juillet',
    'RIR 2', 'à 80 % du 1RM', '| Exercice | Séries | Reps |', '|---|---|---|',
    'ça fait 3 semaines que tu progresses', 'on en reparle dans 2 ou 3 séances',
    'tu as 45 minutes', 'il est 18 h 30',
    /* ⚠️ LE CAS QUI BORNE LA RÈGLE DU TABLEAU. Un tableau de pesées porte lui aussi un
       libellé et deux nombres — mais ses cellules ne sont pas des entiers NUS. C'est ce
       « nu » qui empêche la règle de transformer n'importe quel tableau en séance. */
    '| Poids | 85 kg | 86 kg |', '| Semaine 1 | 2 min | 3 min |'];
  const trop = DOIT_REFUSER.filter(s => dit(s) === true);
  t('B-CCCXLII ④ ⛔ il refuse ce qui n\'est pas une prescription (pas « deux nombres »)',
    trop.length === 0, 'acceptées à tort : ' + JSON.stringify(trop));

  /* ⭐ R2 — LE MOTIF BRUT NE DOIT PLUS VIVRE AILLEURS. Un seul appel resté sur l'ancienne
     expression rendrait le correctif partiel, et le scénario concerné garderait son faux
     vert sans que personne ne le voie. On mesure le CODE, commentaires neutralisés :
     ceux-ci CITENT le motif à dessein (R30 exige que la raison soit écrite à côté). */
  const brut = fs.readFileSync(path.join(ROOT, 'tests/milo/eval-scenarios.js'), 'utf8');
  const nu = brut.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:"'])\/\/[^\n]*/gm, '$1');
  const restants = (nu.match(/\\d\+\\s\*\[x×\]\\s\*\\d\+/g) || []).length;
  t('B-CCCXLII ⑤ ⭐ le motif brut ne subsiste que chez son propriétaire (R2)',
    restants <= 1, restants + ' occurrence(s) du motif brut dans le code');

  // ══ B-CCCXLIII — LES ONZE SCÉNARIOS ═══════════════════════════════════════════════════
  const etat = (id, reply) => SC.find(x => x.id === id).verifs.map(v => {
    let r; try { r = v.fn(reply, U); } catch (e) { return false; }
    return r === true ? true : (r === false ? false : r.ok !== false);
  });
  /* Compare deux écritures du MÊME contenu, témoin par témoin. */
  const ecart = (id, a, b) => {
    const A = etat(id, a), B = etat(id, b), faux = [];
    A.forEach((ok, i) => {
      if (!ok && B[i]) faux.push(id + '·' + (i + 1) + ' faux VERT');
      if (ok && !B[i]) faux.push(id + '·' + (i + 1) + ' faux ROUGE');
    });
    return faux;
  };

  ['prose', 'anglais', 'mixte', 'tableau'].forEach(forme => {
    const faux = [];
    IDS.forEach(id => { faux.push(...ecart(id, MONSTRE.reconnu, MONSTRE[forme])); });
    t('B-CCCXLIII ' + ({prose:'①',anglais:'②',mixte:'③',tableau:'④'}[forme])
      + ' ⭐⭐ écriture « ' + forme + ' » : même contenu, mêmes verdicts',
      faux.length === 0, faux.join(' | ').slice(0, 150));
  });

  t('B-CCCXLIII ⑤ ⭐ EV-003 (la PLACE du face pull) ne dépend pas de la notation',
    ecart('EV-003', F003(REC), F003(PRO)).length === 0,
    ecart('EV-003', F003(REC), F003(PRO)).join(' | '));
  t('B-CCCXLIII ⑥ ⭐ EV-037 (la part de l\'échauffement) ne dépend pas de la notation',
    ecart('EV-037', F037(REC), F037(PRO)).length === 0,
    ecart('EV-037', F037(REC), F037(PRO)).join(' | '));

  /* ⛔⛔ LE GARDE NÉGATIF, SANS LEQUEL TOUT CE QUI PRÉCÈDE SE SATISFERAIT DE « TOUT
     RECONNAÎTRE ». Les trois témoins à exigence positive doivent REFUSER une réponse qui ne
     prescrit rien — c'est la seule chose qui empêche d'élargir le contrat jusqu'à l'absurde. */
  const doitRougir = [['EV-016', 1], ['EV-055', 1], ['EV-056', 2]];
  const mous = doitRougir.filter(([id, i]) => etat(id, SANS_SEANCE)[i] !== false);
  t('B-CCCXLIII ⑦ ⛔⛔ une réponse SANS séance reste refusée (le contrat n\'est pas permissif)',
    mous.length === 0, 'devenus verts : ' + JSON.stringify(mous));

  /* ⚠️ LE CAS AMBIGU. Milo cite des chiffres du passé sans rien prescrire : ce n'est pas une
     séance, et ça ne doit pas le devenir parce qu'on a élargi la reconnaissance. */
  const nEx = U.lignes(SANS_SEANCE).filter(l => dit(l) === true).length;
  t('B-CCCXLIII ⑧ ⚠️ citer des chiffres passés ne fabrique pas une séance',
    nEx === 0, nEx + ' ligne(s) prises pour des exercices');

  /* ⭐ ET LA MESURE QUI JUSTIFIE TOUT LE BLOC : la réponse « monstre » doit rougir dans les
     quatre écritures. Si elle devenait verte partout, ces témoins seraient verts à vide —
     exactement le défaut qu'ils existent pour empêcher. */
  const rouges = f => IDS.filter(id => etat(id, MONSTRE[f]).some(ok => !ok)).length;
  const n0 = rouges('reconnu');
  const egaux = ['prose', 'anglais', 'mixte', 'tableau'].every(f => rouges(f) === n0);
  t('B-CCCXLIII ⑨ ⭐ le nombre de scénarios mis en défaut ne dépend pas de la notation',
    n0 >= 5 && egaux, 'reconnu=' + n0 + ' prose=' + rouges('prose') + ' anglais=' + rouges('anglais')
      + ' mixte=' + rouges('mixte') + ' tableau=' + rouges('tableau'));
}

module.exports = { source };
