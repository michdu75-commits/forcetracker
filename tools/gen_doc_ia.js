#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════════════
   GÉNÈRE `docs/IA-FREE-PREMIUM.md` DEPUIS LE REGISTRE — ET REFUSE TOUTE DIVERGENCE
   ══════════════════════════════════════════════════════════════════════════════
   Créé le 18/09/2026 (phase 3). Michel : *« la documentation humaine ne doit pas
   devenir une deuxième source de vérité »* · *« je veux qu'une divergence future
   entre code et documentation fasse tomber un test »*.

   ⭐⭐ LE SENS DE LA FLÈCHE EST TOUT LE SUJET :
        registre machine  →  génération  →  documentation humaine
   Et jamais l'inverse. Une documentation qu'on édite à la main redevient une source
   de vérité concurrente en trois semaines — c'est **R27** appliqué à ce fichier
   (l'inventaire du projet est généré depuis le code pour exactement cette raison :
   *un inventaire manuel redevient faux en 3 semaines*).

   ⚠️ DEUX MODES, ET LE SECOND EST CELUI QUI PROTÈGE :
     · sans argument  → écrit le fichier ;
     · `--check`      → régénère en mémoire et COMPARE. Sort en 1 si ça diffère.
   Le témoin B-CCCXXXII appelle le second. *Un générateur sans mode de contrôle
   laisse la documentation dériver dès la première édition manuelle.*
   ══════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const SORTIE = path.join(RACINE, 'docs', 'IA-FREE-PREMIUM.md');
const R = require(path.join(RACINE, 'capacites-ia.js'));

/* ⛔ L'EN-TÊTE DIT QU'IL NE FAUT PAS ÉDITER CE FICHIER, ET DIT OÙ ÉDITER À LA PLACE.
   Sans la seconde moitié, l'avertissement laisse la personne sans solution, et elle
   édite quand même. */
const ENTETE = [
  '<!-- ⛔⛔ FICHIER GÉNÉRÉ — NE PAS ÉDITER À LA MAIN.',
  '     Source de vérité : `capacites-ia.js` (racine du dépôt).',
  '     Régénérer : `node tools/gen_doc_ia.js`',
  '     Un écart entre ce fichier et le registre fait ROUGIR le bloc B-CCCXXXII. -->',
  '',
  '# 🗂️ Les capacités IA de Force Tracker — accès, quotas, politique',
  '',
  '> **Ce document est une VUE, pas une décision.** Il est régénéré depuis',
  '> `capacites-ia.js`, qui est la seule source de vérité de la politique d\'accès.',
  '> Toute correction se fait **dans le registre**, jamais ici.',
  '',
  '> ⚠️ **Deux colonnes, et il ne faut jamais les confondre** : la **politique** est',
  '> ce qui *doit être* (la décision de Michel) ; l\'**état du code** est ce qui *est*',
  '> aujourd\'hui dans le navigateur. Tant qu\'elles diffèrent, l\'écart est écrit — et',
  '> c\'est volontaire : *un registre qui affiche la politique souhaitée à la place de',
  '> la politique appliquée ment plus efficacement qu\'une documentation périmée,',
  '> parce qu\'il a l\'air d\'être du code.*',
  '',
].join('\n');

function tableauPrincipal(C) {
  const l = [];
  l.push('## Les ' + C.length + ' capacités');
  l.push('');
  l.push('| # | capacité | module | déclenchement | politique | état du code | quota | action serveur | 2ᵉ porte | serveur applique |');
  l.push('|---:|---|---|---|---|---|---|---|---|---|');
  C.forEach((c, i) => {
    const q = c.quotaType === 'illimite' ? 'illimité'
      : c.quotaType === 'zero' ? 'aucun (Premium)'
      : c.quotaValeur == null ? c.quotaType + ' · **non mesuré**'
      : c.quotaValeur + ' · ' + c.quotaType;
    l.push('| ' + (i + 1) + ' | `' + c.id + '` | ' + c.module + ' | '
      + (c.declenchement === 'automatique' ? '**automatique**' : 'manuel') + ' | **'
      + c.politique + '** | ' + c.etatCode + ' | ' + q + ' | `' + c.actionServeur + '` | '
      + (c.porteAppsScript ? '`' + c.porteAppsScript + '`' : '**aucune**') + ' | '
      + (c.serveurApplique ? '**oui**' : 'non') + ' |');
  });
  return l.join('\n');
}

function sectionEcarts(C) {
  const av = C.filter(c => c.ecart);
  const l = ['', '## ⛔ Les écarts entre la politique et le code (' + av.length + ')', ''];
  l.push('Chacun est **mesuré**, pas supposé. Ils sont écrits ici pour la même raison');
  l.push('qu\'un retrait volontaire s\'écrit (**R30**) : *sans la raison à côté, le suivant');
  l.push('« répare » une décision, ou croit à un oubli là où il y a un choix.*');
  l.push('');
  av.forEach(c => {
    l.push('- **`' + c.id + '`** — politique **' + c.politique + '**, code `' + c.etatCode
      + '` : ' + c.ecart);
  });
  return l.join('\n');
}

function sectionActions(C) {
  const par = {};
  C.forEach(c => { (par[c.actionServeur] = par[c.actionServeur] || []).push(c.id); });
  const noms = Object.keys(par).sort();
  const l = ['', '## 🔀 Une action serveur n\'est pas une capacité', ''];
  l.push('**' + C.length + ' capacités produit** pour **' + noms.length + ' actions serveur**.');
  l.push('C\'est la règle actée — *route technique ≠ capacité produit* — et c\'est aussi');
  l.push('pourquoi le serveur ne peut pas appliquer une politique par capacité : il ne voit');
  l.push('que l\'action.');
  l.push('');
  l.push('| action serveur | capacités qui l\'empruntent |');
  l.push('|---|---|');
  noms.forEach(a => {
    l.push('| `' + a + '` | ' + (par[a].length > 1 ? '**' + par[a].length + '** — ' : '')
      + par[a].map(x => '`' + x + '`').join(', ') + ' |');
  });
  return l.join('\n');
}

function sectionQuotas(C) {
  const l = ['', '## ⏱️ Les six formes de quota', ''];
  l.push('Le registre ne suppose pas que tout quota s\'exprime en « X appels par jour ».');
  l.push('');
  l.push('| forme | ce qu\'elle exprime | capacités |');
  l.push('|---|---|---|');
  const sens = {
    usage_total: 'N essais gratuits **au total**, pas par période',
    usage_par_jour: 'N par jour, remis à zéro chaque jour',
    usage_par_mois: 'N par mois',
    illimite: 'aucun compteur produit',
    zero: 'Premium uniquement — aucun essai gratuit',
    par_evenement: 'N appels liés à **un événement**, pas à une période',
  };
  R.QUOTA_TYPES.forEach(q => {
    const ids = C.filter(c => c.quotaType === q).map(c => '`' + c.id + '`');
    l.push('| `' + q + '` | ' + sens[q] + ' | ' + (ids.join(', ') || '*(aucune)*') + ' |');
  });
  return l.join('\n');
}

function sectionAuto(C) {
  const a = C.filter(c => c.declenchement === 'automatique');
  const l = ['', '## ⚡ Les capacités automatiques (' + a.length + ')', ''];
  l.push('Elles ne sont déclenchées par **aucun bouton** : la personne ne les demande pas et');
  l.push('ne peut pas les refuser. *Un mur ne peut pas s\'afficher devant une chose que');
  l.push('personne n\'a demandée* — c\'est ce qui les rend particulières pour une politique.');
  l.push('');
  a.forEach(c => l.push('- **`' + c.id + '`** — ' + (c.notes || '')));
  return l.join('\n');
}

function sectionOuvertes(C) {
  const o = C.filter(c => c.politique === 'NON_DECIDEE');
  const l = ['', '## ❓ Les politiques encore ouvertes (' + o.length + ')', ''];
  l.push('⛔ Elles ne sont **pas** notées « FREE » : les inscrire ainsi reviendrait à');
  l.push('**inventer une décision** que Michel n\'a pas prise (règle d\'or 15). `NON_DECIDEE`');
  l.push('est une valeur de plein droit.');
  l.push('');
  o.forEach(c => {
    l.push('- **`' + c.id + '`** — le code applique `' + c.etatCode + '`. ' + (c.ecart || ''));
  });
  return l.join('\n');
}

function sectionServeur(C) {
  const n = C.filter(c => c.serveurApplique).length;
  return ['', '## 🔒 Ce que le serveur applique', '',
    '**' + n + ' capacité(s) sur ' + C.length + '.**',
    '',
    n === 0
      ? 'Mesure de la phase 2 : `_moi.premium` est lu **0 fois** dans `worker.js`, et le mot\n'
        + '*premium* a **0 occurrence** dans `_aiQuotaBlock_`. Le serveur ne connaît que **QUI**\n'
        + '(le jeton), **COMBIEN** (un plafond d\'abus identique pour tous) et **D\'OÙ** (l\'Origin).\n'
        + '\n'
        + '👉 **Toute la séparation FREE / FREEMIUM / PREMIUM vit donc dans le navigateur.**\n'
        + 'Ce fichier décrit une politique ; il ne la fait pas respecter. Le verrouillage serveur\n'
        + 'est la passe suivante, et ce tableau est ce qui la rendra exprimable.'
      : 'Voir le registre pour le détail.',
  ].join('\n');
}

function rendre() {
  const C = R.CAPACITES_IA;
  return [ENTETE, tableauPrincipal(C), sectionOuvertes(C), sectionEcarts(C),
          sectionActions(C), sectionQuotas(C), sectionAuto(C), sectionServeur(C),
          '', '---', '',
          '*Généré depuis `capacites-ia.js` par `tools/gen_doc_ia.js`. '
          + 'Ne pas éditer à la main.*', ''].join('\n');
}

const attendu = rendre();

if (process.argv.includes('--check')) {
  let actuel = null;
  try { actuel = fs.readFileSync(SORTIE, 'utf8'); } catch (e) {
    console.error('ABSENT : ' + SORTIE + ' n\'existe pas. Lancer `node tools/gen_doc_ia.js`.');
    process.exit(1);
  }
  if (actuel !== attendu) {
    /* ⭐ ON DIT OÙ ÇA DIVERGE, PAS SEULEMENT QUE ÇA DIVERGE. Un contrôle qui rend
       « ce n'est pas pareil » oblige à re-générer pour comprendre ; celui-ci nomme la
       première ligne en écart, ce qui suffit presque toujours. */
    const a = actuel.split('\n'), b = attendu.split('\n');
    let i = 0;
    while (i < Math.max(a.length, b.length) && a[i] === b[i]) i++;
    console.error('DIVERGENCE à la ligne ' + (i + 1) + ' :');
    console.error('  documentation : ' + JSON.stringify((a[i] || '(fin)').slice(0, 120)));
    console.error('  registre      : ' + JSON.stringify((b[i] || '(fin)').slice(0, 120)));
    process.exit(1);
  }
  console.log('OK documentation ↔ registre : identiques (' + attendu.length + ' caractères)');
  process.exit(0);
}

fs.writeFileSync(SORTIE, attendu, 'utf8');
console.log('OK ' + SORTIE + ' (' + attendu.length + ' caractères, '
            + R.CAPACITES_IA.length + ' capacités)');
