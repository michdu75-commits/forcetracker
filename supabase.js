/* ════════════════════════════════════════════════════════════════════════════
   MIROIR SUPABASE — deuxième copie des comptes, en écriture seule (04/08/2026)

   POURQUOI. Le stockage d'Apps Script est plafonné à 512 Ko — il a été atteint le
   29/07 et PLUS AUCUNE écriture n'aboutissait pendant deux jours, sans que personne
   ne le voie. Et le 04/08 on a découvert que la sauvegarde nocturne ne tournait plus
   depuis 36 jours. Autrement dit : une seule copie, un seul point de panne, et un
   filet qui s'était décroché sans bruit.

   CE QUE FAIT CE FICHIER, ET RIEN D'AUTRE. À chaque sauvegarde cloud, on envoie AUSSI
   le compte vers Supabase. Apps Script reste la SOURCE DE VÉRITÉ : Supabase ne fait
   que recevoir. Si Supabase tombe, il ne se passe strictement rien.

   ⚠️ ÉCRITURE SEULE, ET C'EST VOULU — renforcé le 05/08. La clé publique n'a plus AUCUN
   droit sur la table : elle ne peut qu'appeler la fonction `ft_miroir`, qui écrit à sa
   place. Aucune lecture n'est possible, par aucun chemin. C'est délibéré — on ne recrée pas dans une vraie base la faille qu'on
   vient de trouver côté Apps Script (`loadProfile` sert un compte entier à qui
   connaît l'adresse). Michel lit depuis la console Supabase, personne d'autre ne lit.
   👉 Le jour où on voudra LIRE depuis l'app, il faudra une vraie authentification
      (Supabase Auth + policy par utilisateur), pas une policy SELECT ouverte.

   ⚠️ LE RÉSEAU NE BLOQUE JAMAIS (règle d'or #3). L'envoi est en « on lance et on
   oublie » : aucune attente, aucune erreur remontée à l'écran, et l'échec n'est PAS
   journalisé comme une erreur d'application — une écriture miroir qui rate hors
   réseau est un non-événement, exactement comme la vérification du service worker
   (leçon de ft-v760 : un journal rempli de bruit attendu rend les vraies pannes
   invisibles). On garde seulement une trace du DERNIER état, lisible dans l'Admin.
   ═══════════════════════════════════════════════════════════════════════════ */

// ⚠️ À REMPLIR par Michel (Project Settings → API). Tant que c'est vide, ce fichier
// ne fait STRICTEMENT RIEN — l'app fonctionne exactement comme avant.
// La clé `anon` est faite pour être publique : c'est RLS qui protège, pas le secret.
//
// ⛔ NE JAMAIS METTRE ICI la clé `service_role` : elle contourne RLS et donnerait à
//    n'importe quel visiteur un accès total à la base.
//
// ⛔⛔ ET SURTOUT : CE PROJET SUPABASE DOIT ÊTRE **SÉPARÉ** DE CELUI DE L'APPLI DE
//     TATIANA (décision de Michel, 04/08/2026). La clé `anon` est **par PROJET**, pas
//     par table — et celle-ci sera publiée dans un dépôt public et servie sur le site.
//     Mettre les deux applis dans le même projet reviendrait donc à publier la clé du
//     projet qui héberge les données des CLIENTES de Tatiana. Si une seule de ses tables
//     n'a pas RLS — ce qui arrive vite quand on monte une appli en une soirée — leurs
//     données deviennent lisibles par n'importe qui.
//     👉 On ne prend jamais le risque de faire fuiter les données d'un autre produit
//        pour sauvegarder celles de celui-ci. Deux projets : c'est gratuit et ça isole.
let SB_URL  = 'https://lervuzqicoevwvdlpocq.supabase.co';
let SB_ANON = 'sb_publishable_WWBz0rnck2fG8lEOBjEM6Q_Dm4oXKWg';
// ℹ️ Le préfixe `sb_publishable_` est le NOUVEAU format de clé publique Supabase
//    (l'équivalent de l'ancienne `anon`). Elle est faite pour être publiée : elle
//    n'ouvre que ce que les règles RLS de la table autorisent — ici, écrire, jamais lire.
//
// ⚠️ LE CLONE (`clone/supabase.js`) GARDE CES DEUX VALEURS **VIDES**, EXPRÈS.
//    Le clone est un bac à sable de restylage : ses données de test n'ont rien à
//    faire dans la sauvegarde miroir des vrais comptes. Si un jour on veut l'y
//    brancher, il lui faut sa PROPRE table, pas celle-ci.

// Permet aux TESTS de pointer vers un faux serveur — et à toi de configurer depuis la
// console du navigateur pour un essai, sans toucher au fichier. En production, ce sont
// les deux valeurs ci-dessus qui comptent.
function sbConfigurer(url, cle){ SB_URL=String(url||''); SB_ANON=String(cle||''); }

const SB_TABLE = 'ft_comptes';
// La FONCTION appelée pour écrire (voir le commentaire dans sbMirror). L'app ne touche
// jamais la table directement : c'est elle qui a les droits, pas la clé publique.
const SB_FN = 'ft_miroir';

// Dernier résultat connu, pour la carte Admin (aucune donnée personnelle dedans).
let _sbDernier = null;   // {ok:bool, quand:'ISO', info:'…'}

function _sbActif(){ return !!(SB_URL && SB_ANON); }

/**
 * Envoie (ou met à jour) le compte dans Supabase. Ne renvoie rien, ne lève rien.
 * @param {object} payload — exactement ce qu'on envoie déjà à Apps Script.
 */
/* 🪪🪪 LES JUSTIFICATIFS NE FRANCHISSENT JAMAIS CETTE PORTE (S2-A, 16/09/2026).
   ⚠️ CE N'EST PAS LE CORRECTIF, C'EST LE FILET — et les deux sont nécessaires.
   Le correctif est dans `_cloudSync` : le corps métier ne porte plus de justificatif, donc
   il n'y a plus rien à retirer sur le chemin normal. Ce filet existe pour l'APPELANT FUTUR :
   `sbMirror` est la porte UNIQUE vers Supabase, donc c'est ici que doit vivre la règle
   « ce qui sort d'ici ne contient aucun justificatif » (R2 — une règle, un propriétaire).
   ⭐ Il retire par NOM DE CLÉ, donc il attrape aussi un justificatif arrivé par un chemin
   qu'on n'a pas prévu : *un garde qui dépend de la façon dont la valeur a été calculée ne
   protège que les cas qu'on avait déjà en tête.*
   ⛔ Et il ne touche à AUCUNE donnée métier : la liste est fermée et nommée. */
const _SB_JUSTIFICATIFS = ['token','authCode','code','confirmCode','apikey','authorization'];

function _sbSansJustificatifs(payload){
  if(!payload || typeof payload!=='object') return payload;
  const propre={};
  for(const k in payload){ if(_SB_JUSTIFICATIFS.indexOf(k)===-1) propre[k]=payload[k]; }
  return propre;
}

/* ════════════════════════════════════════════════════════════════════════════════════
   🔀 S2-B PHASE 4 — LA VOIE DE LA COPIE MIROIR (18/09/2026)

   ⭐⭐ CE QUI CHANGE TIENT EN UNE PHRASE : l'identité du compte écrit ne vient plus d'une
   ADRESSE ENVOYÉE PAR LE NAVIGATEUR (`p_email`, que n'importe qui pouvait choisir), mais du
   JETON S1 RÉSOLU CÔTÉ SERVEUR. Le navigateur ne désigne plus personne : il présente un
   justificatif, et c'est le serveur qui dit à qui il appartient.

   ⛔ L'ANCIENNE PORTE N'EST PAS SUPPRIMÉE (consigne explicite de Michel : « ne pas supprimer
   l'ancien chemin avant validation complète du nouveau »). `sbMirror` reste entière, avec son
   filet et son `p_email` ; elle n'est simplement plus appelée par la sauvegarde. Le retour en
   arrière tient en UNE ligne : passer `SB_VOIE` à `'direct'` (règle d'or #8).

   ⛔⛔ ET IL N'Y A AUCUN REPLI AUTOMATIQUE VERS L'ANCIENNE VOIE — c'est la décision la plus
   importante de cette bascule. Un appareil SANS jeton n'alimente plus le miroir. Basculer sur
   `p_email` dans ce cas rouvrirait V2 exactement sur les comptes qu'on cherche à protéger, et
   *une porte dérobée qui ne s'ouvre qu'en cas d'échec est une porte qui s'ouvre toujours au
   pire moment*. Rien n'est perdu pour autant : Apps Script reste la SOURCE DE VÉRITÉ, le
   miroir n'est qu'un filet, et l'état le dit en clair dans l'Admin.
   ════════════════════════════════════════════════════════════════════════════════════ */
const SB_VOIE = 'worker';   // 'worker' = jeton résolu côté serveur · 'direct' = ancienne voie

/* Le jeton factice de la sonde : 64 zéros hexadécimaux. Il a la BONNE FORME (sinon le Worker
   s'arrêterait au premier contrôle et ne prouverait rien) et il n'existe dans aucun registre. */
const SB_SONDE_JETON = '0000000000000000000000000000000000000000000000000000000000000000';

/* ⛔⛔ LES SEULS VRAIS REFUS D'IDENTITÉ, NOMMÉS UN PAR UN — ET C'EST UNE LISTE BLANCHE,
   PAS UNE LISTE DE PANNES (correction du 18/09/2026, ft-v1223).

   ⚠️ CE DÉFAUT S'EST PRODUIT POUR DE VRAI, ET C'EST POUR ÇA QUE LA RÈGLE EST ÉCRITE ICI. Le
   18/09 après-midi, Apps Script est devenu injoignable (« trop lent, plus de 20 s »). Le
   Worker rend alors un 401 dont la raison est `reseau` — une PANNE. L'écran, lui, annonçait
   **« identité refusée »** à quelqu'un dont le compte allait parfaitement bien. *Le chantier
   entier repose sur « dire à quelqu'un que son appareil est révoqué alors que le cloud est
   tombé est une erreur qu'il va essayer de réparer lui-même » — et c'est exactement ce que
   faisait ce code, un cran plus bas que là où on l'avait corrigé.*

   ⭐⭐ POURQUOI UNE LISTE BLANCHE PLUTÔT QU'UNE LISTE NOIRE DES PANNES. Le pont peut rendre
   `reseau` (Apps Script muet), `refus` (le serveur a levé une exception APRÈS avoir reconnu
   le jeton), `erreur` (son stockage a lâché), `illisible` (la ligne du registre est abîmée) —
   et demain un mot qu'on n'a pas prévu. ***Une raison NOUVELLE est bien plus probablement une
   anomalie qu'un refus légitime***, et le coût de l'erreur n'est pas symétrique (R29) : dire
   « serveur indisponible » à quelqu'un dont le jeton est vraiment révoqué est bénin, il verra
   que ça ne marche pas ; dire « identité refusée » pendant une panne l'envoie réparer une
   chose qui n'est pas cassée. On énumère donc ce qui EST un refus ; tout le reste est une
   panne.
   ⛔ Et `revoque` reste dit en clair : quelqu'un dont l'appareil a vraiment été retiré doit
   le savoir, sinon il ne comprend pas pourquoi ses sauvegardes ont cessé de partir. */
const _SB_REFUS_REELS = {
  revoque: 'appareil révoqué — écriture refusée',
  forme:   'aucun jeton sur cet appareil',
  absent:  'aucun jeton sur cet appareil',
  inconnu: 'appareil non reconnu — il faut le reconnecter',
};
function _sbEstRefusReel(r){
  return Object.prototype.hasOwnProperty.call(_SB_REFUS_REELS, String(r || ''));
}

/** Ce que l'app retient d'une réponse du Worker. ⛔ Aucun jeton, aucun haché, aucune clé :
 *  seulement un code HTTP, un mot de refus et la voie empruntée. */
function _sbEtatDepuis(statut, d){
  const voie = (d && d.voie) || '';
  if (statut === 200 && d && d.status === 'ok') return { ok:true, voie:voie, info:'écrit' + (voie ? ' (voie : ' + voie + ')' : '') };
  /* ⛔⛔ UNE PANNE DU CLOUD N'EST PAS UNE RÉVOCATION, ET LES CONFONDRE COÛTE CHER. Le Worker
     répond 503 quand Supabase est tombé ou mal configuré, 401 quand l'identité est refusée.
     *Dire « ton appareil est révoqué » à quelqu'un dont le cloud est simplement tombé est pire
     qu'une erreur technique : c'est une erreur qu'il va essayer de réparer lui-même.* */
  if (statut === 503) return { ok:false, voie:'', info:'cloud indisponible (' + ((d && d.raison) || '?') + ')' };
  if (statut === 401) {
    const r = (d && d.raison) || '';
    if (_sbEstRefusReel(r)) return { ok:false, voie:'', info:_SB_REFUS_REELS[r] };
    // ⭐ tout le reste est une panne du serveur d'identité, et se dit comme telle.
    return { ok:false, voie:'', info:'serveur indisponible (' + (r || '?') + ')' };
  }
  return { ok:false, voie:'', info:'HTTP ' + statut };
}

function _sbNoter(e){
  _sbDernier = { ok:!!e.ok, quand:new Date().toISOString(), info:e.info, voie:e.voie || '' };
  try{ localStorage.setItem('ft4_sb_last', JSON.stringify(_sbDernier)); }catch(err){}
}

/**
 * LA PORTE DE LA SAUVEGARDE MIROIR. Un seul appelant : `_cloudSync`.
 * @param {object} payload — exactement le corps métier envoyé à Apps Script.
 */
function sbEnvoyer(payload){
  if(SB_VOIE !== 'worker') return sbMirror(payload);
  try{
    if(typeof window!=='undefined' && window._demoMode)return;   // mode démo : aucune écriture
    if(typeof AI_PROXY_URL!=='string' || !AI_PROXY_URL)return;
    /* ⛔ LE FILET RESTE, SUR LA NOUVELLE PORTE AUSSI. Le corps métier ne porte plus de
       justificatif depuis S2-A, mais la règle « ce qui sort d'ici n'en contient aucun »
       appartient à la PORTE, pas à l'appelant (R2). */
    const donnees=_sbSansJustificatifs(payload);
    if(!donnees || typeof donnees!=='object')return;
    /* 🪪 LE JETON N'EST PAS POSÉ ICI, ET C'EST VOULU : l'injecteur de `constants.js` est le
       propriétaire unique de « comment un justificatif atteint le Worker » (R2), et il le pose
       au niveau de l'ENVELOPPE — jamais dans `data`, qui est la donnée de la personne.
       ⚠️ Aucun en-tête `Content-Type` : sans lui la requête reste « simple » et n'entraîne
       pas de requête préliminaire CORS à chaque sauvegarde. Le Worker lit `request.text()`,
       le type déclaré lui est indifférent — vérifié dans son code, pas supposé. */
    fetch(AI_PROXY_URL,{method:'POST',
      body:JSON.stringify({ action:'cloudSave', data:donnees })
    }).then(function(r){
      return r.json().catch(function(){ return null; }).then(function(d){
        _sbNoter(_sbEtatDepuis(r.status, d));
      });
    }).catch(function(){
      // Échec réseau : non journalisé comme erreur d'app (ft-v760). Apps Script a déjà reçu
      // la donnée — rien n'est perdu, et on ne crie pas.
      _sbNoter({ok:false, voie:'', info:'réseau'});
    });
  }catch(e){ /* jamais bloquant (règle d'or #3) */ }
}

/**
 * SONDE DE LA NOUVELLE VOIE, pour la carte Admin — elle N'ÉCRIT RIEN.
 *
 * ⚠️⚠️ LA LIGNE LA PLUS DANGEREUSE DE CE FICHIER EST `token:SB_SONDE_JETON`, ET ELLE DOIT LE
 * RESTER. Sans elle, l'injecteur de `constants.js` poserait le VRAI jeton de la personne :
 * la sonde deviendrait une vraie sauvegarde, et elle écraserait son instantané par
 * `{sonde:true}`. L'injecteur n'écrase jamais un jeton déjà posé — c'est cette garantie qui
 * rend la sonde inoffensive, et deux témoins la figent des deux côtés.
 *
 * ⭐ ET C'EST UN VRAI TEST, PAS UN VOYANT : un 401 « inconnu » prouve que la route est
 * atteinte, que l'origine est acceptée, que le Worker voit sa configuration, que Supabase a
 * répondu et que le pont a tranché. *Un indicateur qui ne teste pas ce qu'il annonce finit
 * toujours par mentir* — c'est la raison d'être de l'ancien `sbTest`, et elle vaut toujours.
 */
async function sbTestVoie(){
  if(typeof AI_PROXY_URL!=='string' || !AI_PROXY_URL)
    return {ok:false, texte:'Route indisponible (AI_PROXY_URL absent).'};
  try{
    const r=await fetch(AI_PROXY_URL,{method:'POST',
      body:JSON.stringify({ action:'cloudSave', token:SB_SONDE_JETON, data:{sonde:true} })});
    let d=null; try{ d=await r.json(); }catch(e){}
    /* ⛔⛔ LE MÊME DÉFAUT VIVAIT ICI, ET IL A ÉTÉ VU À L'ÉCRAN LE 18/09 À 14:00 : la sonde
       affichait un ✅ triomphant sur « raison : refus », c'est-à-dire pendant qu'Apps Script
       était en rade. *Un instrument qui annonce « tout va bien » pendant une panne est pire
       qu'un instrument muet.* Le ✅ n'est mérité que si le refus est un VRAI refus — pour un
       jeton factice, cela veut dire que le registre a été consulté et n'a rien trouvé. */
    if(r.status===401 && d && d.error==='auth' && _sbEstRefusReel(d.raison))
      return {ok:true, texte:'✅ La route répond et REFUSE un jeton inconnu (HTTP 401, raison « '
                             +((d.raison)||'?')+' »). Aucune écriture.'};
    if(r.status===401 && d && d.error==='auth')
      return {ok:false, texte:'⚠️ La route répond, mais le serveur d\'identité est indisponible '
                              +'(HTTP 401, raison « '+((d.raison)||'?')+' »). Ce n\'est PAS un '
                              +'problème de compte — voir « Santé du système ». Aucune écriture.'};
    if(r.status===503)
      return {ok:false, texte:'⚠️ La route répond mais le cloud est indisponible (HTTP 503, « '
                              +((d&&d.raison)||'?')+' ») — ce n\'est pas un problème d\'identité.'};
    if(r.status===200)
      return {ok:false, texte:'❌ HTTP 200 sur un jeton factice : la route a ACCEPTÉ une identité '
                              +'inconnue. À traiter immédiatement.'};
    return {ok:false, texte:'❌ HTTP '+r.status+(r.status===403?' → origine refusée par le Worker.':'')};
  }catch(e){
    return {ok:false, texte:'❌ Aucune réponse (réseau, ou Worker injoignable).'};
  }
}

function sbMirror(payload){
  try{
    if(!_sbActif())return;
    if(typeof window!=='undefined' && window._demoMode)return;  // mode démo : aucune écriture
    const email=String((payload&&payload.email)||'').trim().toLowerCase();
    if(!email)return;
    payload=_sbSansJustificatifs(payload);

    // ⚠️ ON N'ÉCRIT PAS DANS LA TABLE, ON APPELLE UNE FONCTION (05/08/2026).
    // L'écriture directe (`/rest/v1/ft_comptes` + `resolution=merge-duplicates`) était
    // refusée par le RLS malgré des policies INSERT/UPDATE en `{public}` avec
    // `WITH CHECK (true)` — vérifié dans `pg_policies`. Plutôt que de continuer à
    // deviner, on est passé par une fonction `security definer` : elle écrit avec les
    // droits de son propriétaire, donc plus aucune dépendance aux policies de la table.
    // 👉 ET C'EST PLUS SÛR : la clé publiée dans l'app n'a plus AUCUN droit sur la table
    //    (INSERT et UPDATE lui ont été retirés). Elle ne peut qu'appeler cette fonction,
    //    qui ne sait faire qu'une chose. La lecture reste évidemment impossible.
    fetch(SB_URL.replace(/\/+$/,'')+'/rest/v1/rpc/'+SB_FN, {
      method:'POST',
      headers:{
        'apikey': SB_ANON,
        'Authorization': 'Bearer '+SB_ANON,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ p_email: email, p_data: payload })
    }).then(r=>{
      _sbDernier={ok:r.ok, quand:new Date().toISOString(), info:r.ok?'écrit':('HTTP '+r.status)};
      try{ localStorage.setItem('ft4_sb_last', JSON.stringify(_sbDernier)); }catch(e){}
    }).catch(e=>{
      // Échec réseau : NON journalisé comme erreur d'app (cf. ft-v760). On note l'état,
      // on ne crie pas. Apps Script a déjà reçu la donnée : rien n'est perdu.
      _sbDernier={ok:false, quand:new Date().toISOString(), info:'réseau'};
      try{ localStorage.setItem('ft4_sb_last', JSON.stringify(_sbDernier)); }catch(e){}
    });
  }catch(e){ /* jamais bloquant */ }
}

/**
 * TEST RÉEL de la copie miroir, pour la carte Admin.
 *
 * ⚠️ POURQUOI CE BOUTON EXISTE. Le domaine Supabase est bloqué depuis la session
 * Claude — impossible de vérifier l'écriture de l'extérieur. Or « c'est poussé » ne
 * veut pas dire « ça marche » (R18) : un miroir de sauvegarde qui n'écrit pas est
 * PIRE que pas de miroir, parce qu'on croit être couvert. Ce bouton écrit pour de
 * vrai et rend le code HTTP, qui dit exactement ce qui cloche :
 *   201/204 → ça marche · 404 → la table n'existe pas · 401/403 → RLS ou clé
 * La ligne écrite porte une adresse de TEST bien visible, à supprimer d'un clic
 * dans la console Supabase.
 */
async function sbTest(){
  if(!_sbActif())return {ok:false, texte:'Miroir non configuré (SB_URL / SB_ANON vides).'};
  try{
    const r=await fetch(SB_URL.replace(/\/+$/,'')+'/rest/v1/rpc/'+SB_FN, {
      method:'POST',
      headers:{
        'apikey': SB_ANON,
        'Authorization': 'Bearer '+SB_ANON,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ p_email:'test@forcetracker.test',
                             p_data:{ test:true, quand:new Date().toISOString() } })
    });
    if(r.ok)return {ok:true, texte:'✅ Écriture réussie (HTTP '+r.status+'). La ligne « test@forcetracker.test » est dans la table.'};
    let d=''; try{ d=(await r.text()).slice(0,200); }catch(e){}
    const aide = r.status===404 ? ' → la fonction `ft_miroir` n\'existe pas : le SQL n\'a pas été exécuté.'
              : (r.status===401||r.status===403) ? ' → la clé ou les règles RLS refusent l\'écriture (règles INSERT/UPDATE pour `anon`).'
              : '';
    return {ok:false, texte:'❌ HTTP '+r.status+aide+(d?('\n'+d):'')};
  }catch(e){
    return {ok:false, texte:'❌ Aucune réponse (réseau, ou URL du projet incorrecte).'};
  }
}

/** État du miroir, pour la carte Admin.
 *  ⛔ AUCUNE DONNÉE PERSONNELLE, ET AUCUN SECRET : la présence d'un jeton est rendue comme un
 *  OUI/NON. *Un diagnostic qui affiche le justificatif qu'il diagnostique est une fuite.* */
function sbEtat(){
  /* ⚠️ LA CONDITION D'ACTIVITÉ DÉPEND DE LA VOIE, et s'en tenir à l'ancienne dirait « non
     configuré » sur un chemin qui marche : la voie Worker n'emploie NI `SB_URL` NI la clé
     publique — c'est le Worker qui détient la clé serveur. */
  const parWorker = (SB_VOIE==='worker');
  const actif = parWorker ? (typeof AI_PROXY_URL==='string' && !!AI_PROXY_URL) : _sbActif();
  const voieTxt = parWorker ? 'voie : jeton résolu côté serveur' : 'voie : ancienne (adresse du navigateur)';
  const jeton = (typeof _ftToken==='function') ? !!_ftToken() : null;
  const jetonTxt = !parWorker ? ''
    : (jeton===null ? '' : (jeton ? ' · jeton présent sur cet appareil'
        : ' · ⚠️ AUCUN jeton sur cet appareil : la copie miroir est en attente (Apps Script, lui, reçoit tout)'));
  if(!actif)return {configure:false, texte:'Miroir non configuré ('+voieTxt+').'};
  let d=_sbDernier;
  if(!d){ try{ d=JSON.parse(localStorage.getItem('ft4_sb_last')||'null'); }catch(e){ d=null; } }
  if(!d)return {configure:true, texte:'Configuré — '+voieTxt+jetonTxt
                                      +'\nAucune sauvegarde miroir encore tentée sur cet appareil.'};
  const q=new Date(d.quand);
  return {configure:true, ok:!!d.ok, voie:d.voie||'',
    texte:voieTxt+jetonTxt+'\n'
          +(d.ok?'✅ Dernière copie miroir — '+(d.info||'écrit')+' : '
                :'⚠️ Dernière tentative en échec ('+d.info+') : ')
          +(isNaN(q)?d.quand:q.toLocaleString('fr-FR'))};
}
