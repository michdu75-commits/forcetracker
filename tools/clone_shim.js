/* ============================================================================================
   🧪 CLONE DE TEST UX — ISOLEMENT (décision de Michel du 17/10/2026, D-084).
   Injecté par tools/clone_build.py en TÊTE du <head> de clone/index.html : il s'exécute AVANT
   tout autre script de la page. Le clone partage l'ORIGINE de la prod (même domaine GitHub
   Pages) : sans ce fichier, il lirait et écrirait les vraies données. Il cloisonne donc, dans
   CETTE page seulement :
     · localStorage / sessionStorage  → clés préfixées « cl_ » (patch de Storage.prototype)
     · IndexedDB                       → bases préfixées « cl_ »
     · cookies                         → noms préfixés « cl_ », chemin forcé sur /clone/
                                         (la prod, servie à la racine, ne les voit jamais)
     · Cache Storage                   → caches préfixés « cl- » ; un « vider le cache » du clone
                                         ne voit ni ne supprime ceux de la prod
     · BroadcastChannel / événement « storage » → seulement ceux du clone
     · réseau                          → même origine + Open Food Facts (base publique) ; tout le
                                         reste (Apps Script, Worker de Milo, Supabase…) est COUPÉ :
                                         aucune donnée réelle n'est lue ni écrite côté serveur.
   ⛔ FAIL-CLOSED : chaque canal est vérifié ici même. Si un seul échoue, le drapeau
   window.__FT_CLONE_ISOLE__ n'est PAS posé, et chaque script du clone (garde en tête de
   fichier, posée par le générateur) refuse de démarrer et le dit à l'écran.
   ⚠️ Les gardes `window.__FT_CLONE__` du code de l'app (cookie ft_email, identité IDB) en
   dépendent : le drapeau est posé en premier, quoi qu'il arrive.
   ⚠️ Ce fichier est un MODÈLE : `__CLONE_PROPRES__` et `__CLONE_SOURCE__` sont remplacés par le
   générateur. Ne pas éditer clone/index.html à la main — régénérer.
   ============================================================================================ */
(function(){
  'use strict';
  window.__FT_CLONE__ = true;
  var P = 'cl_', PC = 'cl-';
  var BASE = location.pathname.replace(/[^\/]*$/, '');            // ex. /forcetracker/clone/
  var PARENT = BASE.replace(/[^\/]+\/$/, '');                     // ex. /forcetracker/
  var PROPRES = __CLONE_PROPRES__;                                // fichiers servis PAR le clone
  var echecs = [];
  function echec(r){ echecs.push(r); }
  window.__FT_CLONE_SOURCE__ = __CLONE_SOURCE__;

  /* 1. localStorage / sessionStorage — le prototype commun aux deux. */
  try {
    var SP = Storage.prototype, g = SP.getItem, s = SP.setItem, r = SP.removeItem, k = SP.key;
    var len = Object.getOwnPropertyDescriptor(SP, 'length').get;
    var nos = function(st){ var out = [], n = len.call(st); for (var i = 0; i < n; i++){ var kk = k.call(st, i); if (kk !== null && kk.indexOf(P) === 0) out.push(kk); } return out; };
    SP.getItem    = function(x){ return g.call(this, P + String(x)); };
    SP.setItem    = function(x, v){ return s.call(this, P + String(x), v); };
    SP.removeItem = function(x){ return r.call(this, P + String(x)); };
    SP.clear      = function(){ var self = this; nos(this).forEach(function(kk){ r.call(self, kk); }); };
    SP.key        = function(i){ var a = nos(this); return (i >= 0 && i < a.length) ? a[i].slice(P.length) : null; };
    Object.defineProperty(SP, 'length', { configurable: true, enumerable: true, get: function(){ return nos(this).length; } });
    window.localStorage.setItem('__iso', '1');
    if (g.call(window.localStorage, P + '__iso') !== '1' || g.call(window.localStorage, '__iso') !== null) echec('localStorage');
    window.localStorage.removeItem('__iso');
    window.sessionStorage.setItem('__iso', '1');
    if (g.call(window.sessionStorage, P + '__iso') !== '1') echec('sessionStorage');
    window.sessionStorage.removeItem('__iso');
  } catch(e){ echec('localStorage (' + e + ')'); }

  /* 2. IndexedDB — open / deleteDatabase / databases. */
  try {
    var IF = IDBFactory.prototype, op = IF.open, del = IF.deleteDatabase, dbs = IF.databases;
    IF.open = function(n, v){ return arguments.length > 1 ? op.call(this, P + n, v) : op.call(this, P + n); };
    IF.deleteDatabase = function(n){ return del.call(this, P + n); };
    if (dbs) IF.databases = function(){ return dbs.call(this).then(function(l){ return l.filter(function(d){ return d.name && d.name.indexOf(P) === 0; }).map(function(d){ return { name: d.name.slice(P.length), version: d.version }; }); }); };
    if (IF.open === op || IF.deleteDatabase === del) echec('indexedDB');
  } catch(e){ echec('indexedDB (' + e + ')'); }

  /* 3. Cookies — nom préfixé, chemin forcé sur le dossier du clone, lecture limitée aux siens. */
  try {
    var o = document; while (o && !Object.getOwnPropertyDescriptor(o, 'cookie')) o = Object.getPrototypeOf(o);
    var CD = Object.getOwnPropertyDescriptor(o, 'cookie');
    var lire = function(){ return String(CD.get.call(document)); };
    Object.defineProperty(document, 'cookie', { configurable: true,
      get: function(){ return lire().split(';').map(function(c){ return c.trim(); }).filter(function(c){ return c.indexOf(P) === 0; }).map(function(c){ return c.slice(P.length); }).join('; '); },
      set: function(v){
        var parts = String(v).split(';');
        var garde = parts.slice(1).filter(function(x){ return !/^\s*(path|domain)\s*=/i.test(x); });
        CD.set.call(document, [P + parts[0].trim()].concat(garde).concat(['path=' + BASE]).join(';'));
      } });
    document.cookie = '__iso=1;max-age=60;samesite=strict;path=/';
    var vu = lire().indexOf(P + '__iso=1') >= 0 && document.cookie.indexOf('__iso=1') >= 0;
    document.cookie = '__iso=;max-age=0;path=/';
    if (!vu || lire().indexOf(P + '__iso=1') >= 0) echec('cookie');
  } catch(e){ echec('cookie (' + e + ')'); }

  /* 4. Cache Storage — open / has / delete / keys / match ne voient que les caches du clone. */
  try {
    if (window.caches) {
      var CP = CacheStorage.prototype, co = CP.open, ch = CP.has, cdel = CP['delete'], ck = CP.keys;
      var miens = function(self){ return ck.call(self).then(function(l){ return l.filter(function(n){ return n.indexOf(PC) === 0; }); }); };
      CP.open = function(n){ return co.call(this, PC + n); };
      CP.has = function(n){ return ch.call(this, PC + n); };
      CP['delete'] = function(n){ return cdel.call(this, PC + n); };
      CP.keys = function(){ return miens(this).then(function(l){ return l.map(function(n){ return n.slice(PC.length); }); }); };
      CP.match = function(req, opts){ var self = this; return miens(self).then(function(l){ var i = 0; var suite = function(){ if (i >= l.length) return undefined; return co.call(self, l[i++]).then(function(c){ return c.match(req, opts).then(function(rep){ return rep || suite(); }); }); }; return suite(); }); };
    }
  } catch(e){ echec('caches (' + e + ')'); }

  /* 5. BroadcastChannel + événement « storage » : seulement ceux du clone. */
  try {
    if (window.BroadcastChannel) { var BC = window.BroadcastChannel; var NBC = function(n){ return new BC(P + n); }; NBC.prototype = BC.prototype; window.BroadcastChannel = NBC; }
    var ET = EventTarget.prototype, ael = ET.addEventListener, rel = ET.removeEventListener, enveloppes = new WeakMap();
    ET.addEventListener = function(type, fn, opt){
      if (this === window && type === 'storage' && typeof fn === 'function') {
        var w = enveloppes.get(fn);
        if (!w) { w = function(e){ if (!e || typeof e.key !== 'string' || e.key.indexOf(P) !== 0) return; return fn.call(this, { type: 'storage', key: e.key.slice(P.length), newValue: e.newValue, oldValue: e.oldValue, storageArea: e.storageArea, url: e.url }); }; enveloppes.set(fn, w); }
        return ael.call(this, type, w, opt);
      }
      return ael.call(this, type, fn, opt);
    };
    ET.removeEventListener = function(type, fn, opt){ if (this === window && type === 'storage' && enveloppes.has(fn)) return rel.call(this, type, enveloppes.get(fn), opt); return rel.call(this, type, fn, opt); };
    Object.defineProperty(window, 'onstorage', { configurable: true, get: function(){ return null; }, set: function(){} });
  } catch(e){ echec('evenements (' + e + ')'); }

  /* 6. Réseau — rien ne part vers le serveur de Force Tracker ni vers Milo. Les ressources de la
        prod (images, données, polices, bibliothèques) absentes du clone sont lues à la racine. */
  try {
    var permis = function(u){ try { var x = new URL(u, location.href); if (x.origin === location.origin) return true; return /^([a-z0-9-]+\.)*openfoodfacts\.(org|net)$/i.test(x.hostname); } catch(e){ return false; } };
    var versProd = function(u){ try { var x = new URL(u, location.href); if (x.origin === location.origin && x.pathname.indexOf(BASE) === 0) { var rel = x.pathname.slice(BASE.length); if (PROPRES.indexOf(rel) < 0) return x.origin + PARENT + rel + x.search; } } catch(e){} return null; };
    var F = window.fetch;
    window.fetch = function(input, init){
      var u = (input && typeof input === 'object' && input.url) ? input.url : String(input);
      if (!permis(u)) return Promise.reject(new TypeError('Clone de test : réseau coupé vers ' + String(u).split('?')[0]));
      var p = versProd(u); if (p) return F.call(this, p, init);
      return F.apply(this, arguments);
    };
    var XO = XMLHttpRequest.prototype.open, XS = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(m, u){ this.__clBloque = !permis(u); var p = versProd(u); if (p) { var a = Array.prototype.slice.call(arguments); a[1] = p; return XO.apply(this, a); } return XO.apply(this, arguments); };
    XMLHttpRequest.prototype.send = function(){ if (this.__clBloque) { var x = this; setTimeout(function(){ try { x.dispatchEvent(new Event('error')); x.dispatchEvent(new Event('loadend')); } catch(e){} }, 0); return; } return XS.apply(this, arguments); };
    if (navigator.sendBeacon) { var SB = navigator.sendBeacon.bind(navigator); navigator.sendBeacon = function(u, d){ return permis(u) ? SB(u, d) : false; }; }
    if (window.WebSocket) window.WebSocket = function(){ throw new Error('Clone de test : WebSocket coupé'); };
    if (window.EventSource) window.EventSource = function(){ throw new Error('Clone de test : EventSource coupé'); };
    if (window.fetch === F) echec('reseau');
  } catch(e){ echec('reseau (' + e + ')'); }

  if (echecs.length === 0) window.__FT_CLONE_ISOLE__ = true;
  else window.__FT_CLONE_ECHECS__ = echecs;

  /* Bandeau visible : on ne confond jamais le clone avec l'app. Il ne capte aucun toucher. */
  document.addEventListener('DOMContentLoaded', function(){
    var b = document.createElement('div');
    b.id = 'clone-bandeau';
    b.textContent = '🧪 CLONE DE TEST · ' + String(window.__FT_CLONE_SOURCE__.sha || '').slice(0, 8) + ' · données de test';
    b.style.cssText = 'position:fixed;top:env(safe-area-inset-top,0px);left:50%;transform:translateX(-50%);z-index:2147483647;pointer-events:none;background:rgba(255,159,10,.92);color:#111;font:700 10px/1.2 system-ui,sans-serif;padding:2px 8px;border-radius:0 0 8px 8px;letter-spacing:.02em;white-space:nowrap;';
    document.body.appendChild(b);
  });
})();
