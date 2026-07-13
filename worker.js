// ─────────────────────────────────────────────────────────────────────────────
// Force Tracker — Relais IA (Cloudflare Worker)
// ─────────────────────────────────────────────────────────────────────────────
// RÔLE : recevoir les requêtes « photo / IA » de l'appli (bilan corporel, import de
// programme, etc.) et les transmettre à Google Apps Script — en RÉPONDANT DIRECTEMENT
// à l'appli (200 + CORS), SANS la redirection `googleusercontent.com` que la 4G/5G de
// certains téléphones n'arrive pas à suivre (bug « Load failed », cf CLAUDE.md).
//
// Le détour Google est fait ICI, côté serveur (réseau de Cloudflare), où il ne pose
// aucun problème. L'appli, elle, ne voit qu'une réponse directe et propre.
//
// ⚠️ AUCUNE clé secrète ici : la clé API Anthropic reste dans Google Apps Script.
// Ce Worker ne fait que RELAYER — il ne connaît ni la clé, ni les prompts.
//
// INSTALLATION : voir GUIDE-CLOUDFLARE.md (copier-coller, ~5 min, une seule fois).
// ─────────────────────────────────────────────────────────────────────────────

// L'adresse du backend Google Apps Script (la même que DEFAULT_URL dans constants.js).
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxWUsEFIlmx-Jxh9jWmEkvXl6rYXk5pR__u5i_GhnOtXua_f6W8wPNqCztZNDMD9N4qbA/exec';

const CORS = {
  'Access-Control-Allow-Origin': '*',            // toute origine (l'appli est publique)
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request) {
    // 1) Pré-vol CORS (le navigateur demande la permission avant certaines requêtes)
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    // 2) On n'accepte que le POST
    if (request.method !== 'POST') {
      return json({ status: 'error', error: 'Utilise POST.' }, 405);
    }

    // 3) On relaie le corps de la requête TEL QUEL vers Apps Script.
    try {
      const body = await request.text();
      const upstream = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
          // On se fait passer pour un vrai navigateur iPhone : sinon Google sert parfois
          // une page HTML (login/challenge) au « serveur du milieu » au lieu du JSON.
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'fr-FR,fr;q=0.9',
        },
        body,
        redirect: 'follow', // la redirection Google est suivie ICI, côté serveur (fiable)
      });
      const text = await upstream.text();
      // On renvoie la réponse d'Apps Script telle quelle, mais avec nos en-têtes CORS
      // et SANS redirection → l'appli la lit sans souci, même en 4G.
      return new Response(text, {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS },
      });
    } catch (err) {
      return json({ status: 'error', error: 'Relais indisponible : ' + (err && err.message) }, 200);
    }
  },
};

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS },
  });
}
