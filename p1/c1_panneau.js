/* PANNEAU DE MESURE C1 — injecté par p1/serveur_iphone.js dans index.html (jamais dans l'app publiée).
   Sert à MESURER, sur l'iPhone, ce que le client A/A2 vit avec le projet de TEST : chaque envoi `saveProfile` (durée, réponse LISIBLE ou non, échec réseau), le nombre d'envois en vol, les messages affichés,
   et la comparaison téléphone ↔ serveur (doublons / divergence). Rien n'est envoyé ailleurs que vers l'adresse de TEST (la CSP posée par le serveur l'interdit). Compte fictif @example.invalid. */
(function () {
  var CFG = window.__C1_CFG || {}; var EXEC = CFG.exec || '';
  try {
    if (!localStorage.getItem('__c1_seed')) {
      var st = { ft4_ob2: '1', ft4_guide_shown: '1', ft4_wn_seen: '99', ft4_email: CFG.email, ft4_ok: '1', ft4_authcode: '4242' };
      Object.keys(st).forEach(function (k) { localStorage.setItem(k, st[k]); }); localStorage.setItem('__c1_seed', '1');
    }
  } catch (e) { /* stockage indisponible : le panneau le dira */ }
  var T0 = Date.now(), LOG = [], TOASTS = [], inflight = 0, maxInflight = 0, ev = [];
  var of = window.fetch;
  window.fetch = function (url, init) {
    var u = String(url); if (!EXEC || u.indexOf(EXEC) !== 0) return of.apply(this, arguments);
    var body = init && init.body ? String(init.body) : ''; var m = /^\{"action":"([A-Za-z]+)"/.exec(body.slice(0, 80));
    var action = m ? m[1] : ((/[?&]action=([A-Za-z]+)/.exec(u) || [])[1] || '');
    var rec = { i: LOG.length + 1, t0: Date.now() - T0, action: action, ko: Math.round(body.length / 1024), mode: (init && init.mode) || 'cors', etat: 'en cours', enLigne: navigator.onLine };
    LOG.push(rec); var save = action === 'saveProfile'; if (save) { inflight++; if (inflight > maxInflight) maxInflight = inflight; }
    var p = of.apply(this, arguments);
    p.then(function (r) {
      rec.ms = Date.now() - T0 - rec.t0; rec.status = r.status; rec.type = r.type; rec.etat = 'réponse reçue';
      if (save) {
        inflight--;
        r.clone().text().then(function (tx) {
          try { var j = JSON.parse(tx); rec.lisible = true; rec.ok = j.ok === true; rec.code = j.code || ''; rec.acks = (j.nut && j.nut.acks || []).length; rec.conflits = (j.nut && j.nut.conflits || []).length; }
          catch (e) { rec.lisible = false; rec.err = 'réponse non JSON'; }
          maj();
        }, function (e) { rec.lisible = false; rec.err = 'lecture impossible : ' + String(e && e.message || e).slice(0, 50); maj(); });
      }
      maj();
    }, function (e) { rec.ms = Date.now() - T0 - rec.t0; rec.etat = 'ÉCHEC'; rec.err = String(e && (e.name + ' : ' + e.message) || e).slice(0, 80); if (save) inflight--; maj(); });
    return p;
  };
  ['online', 'offline'].forEach(function (n) { window.addEventListener(n, function () { ev.push({ t: Date.now() - T0, e: n }); maj(); }); });
  document.addEventListener('visibilitychange', function () { ev.push({ t: Date.now() - T0, e: 'écran ' + document.visibilityState }); maj(); });

  var ui = null, ouvert = false, reseau = 'Wi-Fi', note = '';
  function ent(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function stats() {
    var saves = LOG.filter(function (x) { return x.action === 'saveProfile'; });
    var lis = saves.filter(function (x) { return x.lisible === true; }).length, ill = saves.filter(function (x) { return x.lisible === false; }).length, ech = saves.filter(function (x) { return x.etat === 'ÉCHEC'; }).length;
    var enc = saves.filter(function (x) { return x.etat === 'en cours'; }).length;
    var d = saves.filter(function (x) { return x.ms !== undefined; }).map(function (x) { return x.ms; }).sort(function (a, b) { return a - b; });
    return { n: saves.length, lis: lis, ill: ill, ech: ech, enc: enc, med: d.length ? d[Math.floor(d.length / 2)] : null, max: d.length ? d[d.length - 1] : null };
  }
  function rapport(serveurTxt) {
    var s = stats(), ua = (navigator.userAgent.match(/(iPhone OS [\d_]+|Version\/[\d.]+)/g) || []).join(' ');
    var l = ['FT-C1 iPhone — ' + new Date().toISOString() + ' — compte ' + CFG.email + ' — réseau déclaré : ' + reseau + (note ? ' (' + note + ')' : '') + ' — ' + ua,
      'Envois saveProfile : ' + s.n + ' · réponses LISIBLES : ' + s.lis + ' · ILLISIBLES : ' + s.ill + ' · échecs réseau : ' + s.ech + ' · en cours : ' + s.enc + ' · en vol au maximum : ' + maxInflight + ' · durée médiane/max : ' + s.med + '/' + s.max + ' ms',
      'Messages vus : ' + (TOASTS.length ? TOASTS.join(' | ') : '(aucun)'), 'Serveur ↔ téléphone : ' + (serveurTxt || '(pas encore comparé : bouton « Comparer avec le serveur »)'),
      'Événements : ' + (ev.length ? ev.map(function (x) { return Math.round(x.t / 1000) + 's ' + x.e; }).join(', ') : '(aucun)'), '--- journal ---'];
    LOG.slice(-40).forEach(function (x) { l.push('#' + x.i + ' ' + Math.round(x.t0 / 1000) + 's ' + x.action + ' ' + x.ko + 'Ko ' + x.etat + (x.status ? ' HTTP ' + x.status + '/' + x.type : '') + (x.ms !== undefined ? ' ' + x.ms + 'ms' : '') + (x.lisible === true ? ' lisible ok=' + x.ok + (x.code ? ' ' + x.code : '') + ' acks=' + x.acks + ' conflits=' + x.conflits : '') + (x.lisible === false ? ' ILLISIBLE' : '') + (x.err ? ' ' + x.err : '') + (x.enLigne === false ? ' [hors ligne]' : '')); });
    return l.join('\n');
  }
  var dernierServeur = '';
  function comparer() {
    var email = CFG.email; var nom = function (l) { return l && l.name; };
    var local = (typeof S !== 'undefined' && S.foodLog) ? S.foodLog.map(nom) : [];
    return of(EXEC + '?' + new URLSearchParams({ action: 'loadProfile', email: email }), { redirect: 'follow' }).then(function (r) { return r.text(); }).then(function (tx) {
      var j = JSON.parse(tx); var srv = (j.profile && j.profile.foodLog || []).map(nom);
      var cnt = function (a) { var o = {}; a.forEach(function (x) { o[x] = (o[x] || 0) + 1; }); return o; }, c1 = cnt(local), c2 = cnt(srv);
      var noms = Object.keys(Object.assign({}, c1, c2)).sort(), diff = [];
      noms.forEach(function (n) { diff.push(n + ' : téléphone ' + (c1[n] || 0) + ' / serveur ' + (c2[n] || 0) + ((c1[n] || 0) !== (c2[n] || 0) ? ' ⚠️' : '')); });
      var dup = noms.filter(function (n) { return (c1[n] || 0) > 1 || (c2[n] || 0) > 1; });
      dernierServeur = diff.join(' ; ') + ' → ' + (diff.some(function (x) { return /⚠️/.test(x); }) ? 'DIVERGENCE' : 'identique') + (dup.length ? ' · DOUBLONS : ' + dup.join(', ') : ' · aucun doublon');
    }).catch(function (e) { dernierServeur = 'lecture serveur impossible : ' + String(e && e.message || e).slice(0, 80); }).then(maj);
  }
  function geste(n) {
    try {
      var decl = function (q) { return { kcal: Math.round(q * 1.3), prot: Math.round(q * 0.1), carbs: Math.round(q * 0.2), fat: Math.round(q * 0.05) }; };
      var ajouter = function (nom, q) { var r = _n2Enregistrer({ id: _foodLineId(), ts: Date.now(), date: '2026-11-05', repas: 'dejeuner', nom: nom, origine: { saisie: 'manuel', origine: 'utilisateur' }, mode: 'declaree', declare: decl(q), quantite: { val: q, unite: 'g' } }, 'addFoodEntry'); if (r.ok) _journalPersister(); return r.ok; };
      var modifier = function (nom, q) { var e = S.foodLog.find(function (l) { return l && l.name === nom; }); if (!e) return false; var r = _n2Enregistrer({ id: e.id, ts: e.ts, date: e.date, repas: e.meal, nom: e.name, origine: { saisie: e.saisie, origine: e.origine }, mode: 'declaree', declare: decl(q), quantite: { val: q, unite: 'g' }, remplace: e }, 'saveEditFood'); if (r.ok) _journalPersister(); return r.ok; };
      if (n === 1) return ajouter('Pates', 150); if (n === 2) return modifier('Pates', 100); if (n === 3) return modifier('Pates', 80); if (n === 4) return ajouter('Sauce', 60); if (n === 5) return ajouter('Yaourt', 125);
    } catch (e) { alert('Geste impossible : ' + e.message); }
  }
  function rafale() { var i = 1; (function suite() { geste(i); i++; if (i <= 5) setTimeout(suite, 5000); })(); }
  function copier(txt) {
    var ok = false;
    try { var ta = document.createElement('textarea'); ta.value = txt; ta.style.cssText = 'position:fixed;left:0;top:0;opacity:0'; document.body.appendChild(ta); ta.focus(); ta.select(); ta.setSelectionRange(0, 999999); ok = document.execCommand('copy'); document.body.removeChild(ta); } catch (e) {}
    if (!ok && navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(function () { alert('Rapport copié'); }, function () { alert('Copie refusée : appuie longuement sur le texte du rapport pour le copier.'); }); return; }
    alert(ok ? 'Rapport copié' : 'Copie impossible : appuie longuement sur le texte du rapport pour le copier.');
  }
  function maj() {
    if (!ui) return;
    var s = stats(), css = 'font:12px/1.35 -apple-system,system-ui,sans-serif;';
    var h = '<div id="c1-bar" style="' + css + 'background:#c00;color:#fff;padding:5px 9px;border-radius:12px;box-shadow:0 2px 8px #0008">C1 · ' + s.n + ' envois · ' + s.lis + ' lus' + (s.ill ? ' · <b>' + s.ill + ' illisibles</b>' : '') + (s.ech ? ' · <b>' + s.ech + ' échecs</b>' : '') + (s.enc ? ' · ' + s.enc + ' en cours' : '') + '</div>';
    if (ouvert) {
      var b = 'style="margin:2px;padding:7px 9px;border-radius:8px;border:1px solid #888;background:#222;color:#fff;font:12px system-ui"';
      h += '<div style="' + css + 'background:#111e;color:#fff;padding:8px;border-radius:12px;margin-top:4px;max-width:92vw;max-height:70vh;overflow:auto">' +
        '<div>Compte fictif : <b>' + ent(CFG.email) + '</b></div><div>Réseau : <select id="c1-res" style="font-size:13px">' + ['Wi-Fi', '5G', '4G', 'Autre'].map(function (x) { return '<option' + (x === reseau ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select> <input id="c1-note" placeholder="note (ex. 4 barres)" value="' + ent(note) + '" style="font-size:13px;width:9em"></div>' +
        '<div style="margin:4px 0">Gestes : <button ' + b + ' data-g="1">① +Pâtes 150</button><button ' + b + ' data-g="2">② →100</button><button ' + b + ' data-g="3">③ →80</button><button ' + b + ' data-g="4">④ +Sauce</button><button ' + b + ' data-g="5">⑤ +Yaourt</button><button ' + b + ' data-g="r">▶︎ les 5 en rafale</button></div>' +
        '<div><button ' + b + ' data-a="cmp">Comparer avec le serveur</button><button ' + b + ' data-a="cp">Copier le rapport</button></div>' +
        '<div style="margin-top:4px;white-space:pre-wrap;word-break:break-word;opacity:.85">' + ent('Envois ' + s.n + ' · lisibles ' + s.lis + ' · illisibles ' + s.ill + ' · échecs ' + s.ech + ' · en vol max ' + maxInflight + ' · médiane ' + s.med + ' ms · max ' + s.max + ' ms\nMessages : ' + (TOASTS.join(' | ') || '(aucun)') + '\nServeur : ' + (dernierServeur || '—')) + '</div>' +
        '<textarea id="c1-rap" readonly style="width:100%;height:7em;margin-top:4px;font:10px monospace">' + ent(rapport(dernierServeur)) + '</textarea></div>';
    }
    ui.innerHTML = h;
    var q = function (sel) { return ui.querySelector(sel); };
    q('#c1-bar').onclick = function () { ouvert = !ouvert; maj(); };
    if (ouvert) {
      ui.querySelectorAll('button[data-g]').forEach(function (e) { e.onclick = function () { var g = e.getAttribute('data-g'); if (g === 'r') rafale(); else geste(Number(g)); setTimeout(maj, 300); }; });
      q('button[data-a="cmp"]').onclick = comparer; q('button[data-a="cp"]').onclick = function () { copier(rapport(dernierServeur)); };
      q('#c1-res').onchange = function () { reseau = this.value; maj(); }; q('#c1-note').onchange = function () { note = this.value; maj(); };
    }
  }
  function monter() {
    ui = document.createElement('div'); ui.style.cssText = 'position:fixed;top:calc(env(safe-area-inset-top,0px) + 4px);right:6px;z-index:2147483647;max-width:94vw'; document.body.appendChild(ui);
    var ot = window.toast; if (typeof ot === 'function') window.toast = function (m, t) { try { var s = String(m).slice(0, 90); if (TOASTS.indexOf(s) < 0) TOASTS.push(s); maj(); } catch (e) {} return ot.apply(this, arguments); };
    maj(); setInterval(maj, 4000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(monter, 800); }); else setTimeout(monter, 800);
  window.__C1 = { LOG: LOG, rapport: rapport, stats: stats, geste: geste, comparer: comparer, maxInflight: function () { return maxInflight; } };
})();
