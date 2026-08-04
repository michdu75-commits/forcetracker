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

   ⚠️ ÉCRITURE SEULE, ET C'EST VOULU. La table a RLS activé avec des règles INSERT et
   UPDATE, mais AUCUNE règle SELECT : la clé publique de l'app ne peut pas RELIRE les
   comptes. C'est délibéré — on ne recrée pas dans une vraie base la faille qu'on
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
// ⛔ NE JAMAIS METTRE ICI la clé `service_role` : elle contourne RLS et donnerait à
//    n'importe quel visiteur un accès total à la base.
let SB_URL  = '';   // ex. https://xxxxxxxx.supabase.co
let SB_ANON = '';   // la clé « anon / public »

// Permet aux TESTS de pointer vers un faux serveur — et à toi de configurer depuis la
// console du navigateur pour un essai, sans toucher au fichier. En production, ce sont
// les deux valeurs ci-dessus qui comptent.
function sbConfigurer(url, cle){ SB_URL=String(url||''); SB_ANON=String(cle||''); }

const SB_TABLE = 'ft_comptes';

// Dernier résultat connu, pour la carte Admin (aucune donnée personnelle dedans).
let _sbDernier = null;   // {ok:bool, quand:'ISO', info:'…'}

function _sbActif(){ return !!(SB_URL && SB_ANON); }

/**
 * Envoie (ou met à jour) le compte dans Supabase. Ne renvoie rien, ne lève rien.
 * @param {object} payload — exactement ce qu'on envoie déjà à Apps Script.
 */
function sbMirror(payload){
  try{
    if(!_sbActif())return;
    if(typeof window!=='undefined' && window._demoMode)return;  // mode démo : aucune écriture
    const email=String((payload&&payload.email)||'').trim().toLowerCase();
    if(!email)return;

    // `resolution=merge-duplicates` = insertion OU mise à jour selon que la ligne existe.
    // Sans ça, la 2ᵉ sauvegarde d'un même compte échouerait sur la clé primaire.
    fetch(SB_URL.replace(/\/+$/,'')+'/rest/v1/'+SB_TABLE, {
      method:'POST',
      headers:{
        'apikey': SB_ANON,
        'Authorization': 'Bearer '+SB_ANON,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify({ email, data: payload, updated_at: new Date().toISOString() })
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

/** État du miroir, pour la carte Admin. Aucune donnée personnelle. */
function sbEtat(){
  if(!_sbActif())return {configure:false, texte:'Miroir Supabase non configuré (SB_URL / SB_ANON vides).'};
  let d=_sbDernier;
  if(!d){ try{ d=JSON.parse(localStorage.getItem('ft4_sb_last')||'null'); }catch(e){ d=null; } }
  if(!d)return {configure:true, texte:'Configuré — aucune sauvegarde miroir encore tentée sur cet appareil.'};
  const q=new Date(d.quand);
  return {configure:true, ok:!!d.ok,
    texte:(d.ok?'✅ Dernière copie miroir : ':'⚠️ Dernière tentative en échec ('+d.info+') : ')
          +(isNaN(q)?d.quand:q.toLocaleString('fr-FR'))};
}
