/* =============================================================================
 * food-health.js — Score santé indicatif + fiche produit (vanilla JS, sans build)
 *
 * Pour Force Tracker. Ne contient PAS de scanner : tu appelles ce module avec un
 * code-barres déjà lu par ton scan existant (ZXing ou lecture d'étiquette IA).
 *
 * Ce qu'il fait :
 *   1. Récupère la fiche produit sur Open Food Facts (avec cache local).
 *   2. Calcule un score santé indicatif 0-100 (Nutri-Score + additifs + bio).
 *   3. Affiche une fiche : score, Nutri-Score (A-E), NOVA, macros orientées sport.
 *
 * Intégration minimale :
 *   <script src="food-health.js"></script>
 *   FoodHealth.configure({ appName: "ForceTracker", appVersion: "1.0",
 *                          contactEmail: "contact@forcetracker.app" });
 *   // Quand ton scanner lit un code-barres :
 *   FoodHealth.showProduct(barcode, "#zone-produit");
 *
 * Notes importantes :
 *   - "Score santé indicatif" et non "Yuka" : la formule de Yuka n'est pas publique.
 *     Celle-ci s'appuie sur des données officielles (Nutri-Score, NOVA).
 *   - Beaucoup de produits n'ont pas de Nutri-Score → le score renvoie null et
 *     l'affichage indique "Non évalué" (comportement volontaire, ne pas retirer).
 *   - La mention "Données : Open Food Facts" est OBLIGATOIRE (licence ODbL).
 *   - Le scan marche hors ligne, mais la recherche produit a besoin du réseau
 *     (sauf produit déjà en cache).
 * ========================================================================== */

(function (global) {
  "use strict";

  /* ------------------------------- Config --------------------------------- */
  var config = {
    appName: "ForceTracker",
    appVersion: "1.0",
    contactEmail: "contact@forcetracker.app",
    cacheTtlDays: 30, // durée de vie du cache local
  };

  function configure(opts) {
    if (opts) for (var k in opts) if (opts.hasOwnProperty(k)) config[k] = opts[k];
  }

  /* ------------------------- Barèmes du score ----------------------------- */
  // Nutri-Score (a→e) déjà calculé par OFF → note nutritionnelle sur 100 (poids 60 %)
  var NUTRI_POINTS = { a: 100, b: 80, c: 55, d: 30, e: 10 };

  function scoreColor(s) {
    if (s === null) return "var(--fh-muted)";
    if (s >= 75) return "var(--fh-green)";
    if (s >= 50) return "var(--fh-lime)";
    if (s >= 25) return "var(--fh-orange)";
    return "var(--fh-red)";
  }
  function scoreLabel(s) {
    if (s >= 75) return "Excellent";
    if (s >= 50) return "Bon";
    if (s >= 25) return "Médiocre";
    return "Mauvais";
  }

  /**
   * Score santé indicatif à partir de la fiche OFF.
   * Pondération : 60 % qualité nutritionnelle, 30 % additifs, 10 % bio.
   * Renvoie value = null si le Nutri-Score est absent (produit non évaluable).
   */
  function computeScore(p) {
    var grade = (p.nutriscore_grade || "").toLowerCase();
    var nutri = NUTRI_POINTS.hasOwnProperty(grade) ? NUTRI_POINTS[grade] : null;

    var nAdd = typeof p.additives_n === "number" ? p.additives_n : 0;
    var additives = Math.max(0, 100 - nAdd * 15); // 0 additif = 100

    var tags = p.labels_tags || [];
    var isOrganic = tags.some(function (l) {
      return l.indexOf("organic") !== -1 || l.indexOf("bio") !== -1;
    });
    var organic = isOrganic ? 100 : 50;

    if (nutri === null) return { value: null, isOrganic: isOrganic, nAdd: nAdd };

    var value = Math.round(nutri * 0.6 + additives * 0.3 + organic * 0.1);
    return { value: value, isOrganic: isOrganic, nAdd: nAdd };
  }

  /* --------------------- Extraction des macros (100 g) -------------------- */
  function num(v) {
    return typeof v === "number" && !isNaN(v) ? v : null;
  }
  function extractMacros(nutr) {
    nutr = nutr || {};
    return {
      kcal: num(nutr["energy-kcal_100g"]),
      protein: num(nutr.proteins_100g),
      carbs: num(nutr.carbohydrates_100g),
      sugars: num(nutr.sugars_100g),
      fat: num(nutr.fat_100g),
      satFat: num(nutr["saturated-fat_100g"]),
      fiber: num(nutr.fiber_100g),
      salt: num(nutr.salt_100g),
    };
  }
  // Repère "sport" : bonne source de protéines dès 10 g / 100 g
  function proteinTag(m) {
    if (m.protein === null) return null;
    if (m.protein >= 20) return { text: "Très riche en protéines", strong: true };
    if (m.protein >= 10) return { text: "Bonne source de protéines", strong: true };
    return { text: "Faible en protéines", strong: false };
  }

  /* --------------------------- Cache local -------------------------------- */
  function cacheKey(code) {
    return "fh:cache:" + code;
  }
  function readCache(code) {
    try {
      var raw = global.localStorage.getItem(cacheKey(code));
      if (!raw) return null;
      var entry = JSON.parse(raw);
      var maxAge = config.cacheTtlDays * 24 * 60 * 60 * 1000;
      if (Date.now() - entry.ts > maxAge) {
        global.localStorage.removeItem(cacheKey(code));
        return null;
      }
      return entry.product;
    } catch (e) {
      return null; // localStorage indisponible : on ignore le cache
    }
  }
  function writeCache(code, product) {
    try {
      global.localStorage.setItem(
        cacheKey(code),
        JSON.stringify({ ts: Date.now(), product: product })
      );
    } catch (e) {
      /* quota plein ou indisponible : sans gravité */
    }
  }

  /* --------------------- Appel Open Food Facts ---------------------------- */
  var OFF_FIELDS = [
    "product_name", "brands", "quantity", "image_front_small_url",
    "nutriscore_grade", "nova_group", "additives_n",
    "labels_tags", "nutriments",
  ].join(",");

  /**
   * Cherche un produit par code-barres. Renvoie l'objet produit ou null.
   * Priorité au cache local, sinon appel réseau (1 appel = 1 scan réel).
   */
  function lookup(barcode) {
    var code = String(barcode).replace(/\D/g, "");
    if (code.length < 8) return Promise.resolve(null);

    var cached = readCache(code);
    if (cached) return Promise.resolve(cached);

    var url =
      "https://world.openfoodfacts.org/api/v2/product/" + code + ".json" +
      "?fields=" + OFF_FIELDS +
      "&app_name=" + encodeURIComponent(config.appName) +
      "&app_version=" + encodeURIComponent(config.appVersion) +
      "&app_uuid=" + encodeURIComponent(config.contactEmail);

    return fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        // Tolérant sur "status" : l'API v2 d'OFF ne renvoie pas toujours status===1
        // pour un produit trouvé. On considère "trouvé" dès que product a de vraies données.
        var p = data && data.product;
        var notFound = !p || (typeof p === "object" && !Object.keys(p).length) ||
          data.status === 0 || data.status === "failure" ||
          data.status_verbose === "product not found";
        if (!notFound && p && (p.product_name || p.brands || p.nutriscore_grade ||
            (p.nutriments && Object.keys(p.nutriments).length))) {
          writeCache(code, p);
          return p;
        }
        return null;
      });
  }

  /* --------------------------- Rendu (DOM) -------------------------------- */
  function resolveTarget(target) {
    if (typeof target === "string") return document.querySelector(target);
    return target;
  }

  // Styles injectés une seule fois. Thème sombre "performance", surchargeable
  // via les variables CSS --fh-* sur .fh-card (pour coller au style Force Tracker).
  function injectStyles() {
    if (document.getElementById("fh-styles")) return;
    var css =
      ".fh-card{--fh-bg:#181D23;--fh-alt:#1F252D;--fh-line:#2A313A;--fh-text:#E9EDF1;" +
      "--fh-muted:#8A939D;--fh-accent:#C6F135;--fh-green:#39B54A;--fh-lime:#8FC742;" +
      "--fh-yellow:#E3A008;--fh-orange:#F0883E;--fh-red:#F04E3E;" +
      "background:var(--fh-bg);color:var(--fh-text);border:1px solid var(--fh-line);" +
      "border-radius:16px;padding:16px;font-family:system-ui,-apple-system,sans-serif;" +
      "max-width:420px;}" +
      ".fh-head{display:flex;gap:12px;margin-bottom:16px;}" +
      ".fh-img{width:56px;height:56px;border-radius:10px;object-fit:cover;" +
      "background:var(--fh-alt);flex-shrink:0;}" +
      ".fh-img-empty{display:flex;align-items:center;justify-content:center;" +
      "color:var(--fh-muted);font-size:22px;}" +
      ".fh-name{font-weight:700;font-size:15px;line-height:1.3;margin-bottom:2px;}" +
      ".fh-brand{font-size:12px;color:var(--fh-muted);margin-bottom:6px;}" +
      ".fh-ptag{font-size:12px;font-weight:700;}" +
      ".fh-gauge-row{display:flex;align-items:center;gap:16px;margin-bottom:14px;}" +
      ".fh-gauge-label{font-size:20px;font-weight:800;line-height:1;}" +
      ".fh-gauge-sub{font-size:12px;color:var(--fh-muted);margin-top:4px;}" +
      ".fh-badges{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;}" +
      ".fh-badge{display:flex;align-items:center;gap:8px;background:var(--fh-alt);" +
      "border-radius:10px;padding:8px 12px;}" +
      ".fh-badge-key{font-size:12px;color:var(--fh-muted);}" +
      ".fh-badge-val{width:22px;height:22px;border-radius:6px;color:#0F1216;" +
      "font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;}" +
      ".fh-nova-val{font-size:12px;font-weight:700;}" +
      ".fh-macro-title{font-size:12px;color:var(--fh-muted);margin-bottom:8px;" +
      "text-transform:uppercase;letter-spacing:.5px;}" +
      ".fh-macros{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;}" +
      ".fh-cell{background:var(--fh-alt);border-radius:10px;padding:10px 12px;}" +
      ".fh-cell-label{font-size:11px;color:var(--fh-muted);margin-bottom:3px;}" +
      ".fh-cell-val{font-size:17px;font-weight:700;line-height:1;}" +
      ".fh-cell-unit{font-size:11px;font-weight:400;color:var(--fh-muted);}" +
      ".fh-cell-sub{font-size:10px;color:var(--fh-muted);margin-top:3px;}" +
      ".fh-credit{font-size:10px;color:var(--fh-muted);text-align:center;margin-top:14px;}" +
      ".fh-state{font-size:13px;color:var(--fh-muted);text-align:center;padding:20px;}";
    var style = document.createElement("style");
    style.id = "fh-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Petit utilitaire de création d'élément (data via textContent = anti-XSS).
  function el(tag, className, text) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (text != null) e.textContent = text;
    return e;
  }

  function gaugeSvg(value, color) {
    var r = 34, c = 2 * Math.PI * r, pct = value === null ? 0 : value / 100;
    var wrap = document.createElement("div");
    // Valeurs numériques uniquement → innerHTML sûr ici.
    wrap.innerHTML =
      '<svg width="84" height="84" viewBox="0 0 84 84" style="flex-shrink:0">' +
      '<circle cx="42" cy="42" r="' + r + '" fill="none" stroke="var(--fh-line)" stroke-width="7"/>' +
      '<circle cx="42" cy="42" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="7" ' +
      'stroke-linecap="round" stroke-dasharray="' + c + '" stroke-dashoffset="' + c * (1 - pct) + '" ' +
      'transform="rotate(-90 42 42)"/>' +
      '<text x="42" y="46" text-anchor="middle" font-size="22" font-weight="700" fill="var(--fh-text)">' +
      (value === null ? "–" : value) + "</text>" +
      '<text x="42" y="60" text-anchor="middle" font-size="8" fill="var(--fh-muted)">/100</text>' +
      "</svg>";
    return wrap.firstChild;
  }

  function nutriBadge(grade) {
    var g = (grade || "").toUpperCase();
    var colors = {
      A: "var(--fh-green)", B: "var(--fh-lime)", C: "var(--fh-yellow)",
      D: "var(--fh-orange)", E: "var(--fh-red)",
    };
    var badge = el("div", "fh-badge");
    badge.appendChild(el("span", "fh-badge-key", "Nutri-Score"));
    var val = el("span", "fh-badge-val", g || "?");
    val.style.background = colors[g] || "var(--fh-line)";
    badge.appendChild(val);
    return badge;
  }

  function novaBadge(group) {
    var labels = {
      1: "Non transformé", 2: "Ingrédient culinaire",
      3: "Transformé", 4: "Ultra-transformé",
    };
    var col = group >= 4 ? "var(--fh-red)" : group === 3 ? "var(--fh-orange)" : "var(--fh-lime)";
    var badge = el("div", "fh-badge");
    badge.appendChild(el("span", "fh-badge-key", "NOVA " + group));
    var val = el("span", "fh-nova-val", labels[group] || "—");
    val.style.color = col;
    badge.appendChild(val);
    return badge;
  }

  function macroCell(label, value, unit, sub, subLabel, accent) {
    var cell = el("div", "fh-cell");
    cell.appendChild(el("div", "fh-cell-label", label));
    var v = el("div", "fh-cell-val");
    v.appendChild(document.createTextNode(value === null ? "—" : Math.round(value * 10) / 10));
    var u = el("span", "fh-cell-unit", " " + unit);
    v.appendChild(u);
    if (accent) v.style.color = "var(--fh-accent)";
    cell.appendChild(v);
    if (sub !== undefined) {
      var subTxt = subLabel + " " + (sub === null ? "—" : Math.round(sub * 10) / 10 + " g");
      cell.appendChild(el("div", "fh-cell-sub", subTxt));
    }
    return cell;
  }

  /**
   * Construit et insère la fiche produit dans `target`.
   * `product` : objet renvoyé par lookup() (forme Open Food Facts).
   */
  function renderCard(product, target) {
    injectStyles();
    var host = resolveTarget(target);
    if (!host) return;
    host.innerHTML = "";

    var s = computeScore(product);
    var m = extractMacros(product.nutriments);
    var pTag = proteinTag(m);
    var col = scoreColor(s.value);

    var card = el("div", "fh-card");

    /* En-tête : image + nom + marque + tag protéines */
    var head = el("div", "fh-head");
    if (product.image_front_small_url) {
      var img = document.createElement("img");
      img.className = "fh-img";
      img.src = product.image_front_small_url;
      img.alt = "";
      head.appendChild(img);
    } else {
      head.appendChild(el("div", "fh-img fh-img-empty", "?"));
    }
    var meta = el("div");
    meta.style.minWidth = "0";
    meta.style.flex = "1";
    meta.appendChild(el("div", "fh-name", product.product_name || "Produit sans nom"));
    var brandTxt = (product.brands || "—") + (product.quantity ? " · " + product.quantity : "");
    meta.appendChild(el("div", "fh-brand", brandTxt));
    if (pTag) {
      var tagEl = el("span", "fh-ptag", pTag.text);
      tagEl.style.color = pTag.strong ? "var(--fh-accent)" : "var(--fh-muted)";
      meta.appendChild(tagEl);
    }
    head.appendChild(meta);
    card.appendChild(head);

    /* Jauge de score */
    var gaugeRow = el("div", "fh-gauge-row");
    gaugeRow.appendChild(gaugeSvg(s.value, col));
    var gInfo = el("div");
    var gLabel = el("div", "fh-gauge-label", s.value === null ? "Non évalué" : scoreLabel(s.value));
    gLabel.style.color = col;
    gInfo.appendChild(gLabel);
    var gSub = s.value === null
      ? "Nutri-Score indisponible"
      : s.nAdd + " additif" + (s.nAdd > 1 ? "s" : "") + (s.isOrganic ? " · Bio" : "");
    gInfo.appendChild(el("div", "fh-gauge-sub", gSub));
    gaugeRow.appendChild(gInfo);
    card.appendChild(gaugeRow);

    /* Badges Nutri-Score / NOVA */
    var badges = el("div", "fh-badges");
    badges.appendChild(nutriBadge(product.nutriscore_grade));
    if (product.nova_group) badges.appendChild(novaBadge(product.nova_group));
    card.appendChild(badges);

    /* Macros pour 100 g */
    card.appendChild(el("div", "fh-macro-title", "Valeurs pour 100 g"));
    var macros = el("div", "fh-macros");
    macros.appendChild(macroCell("Énergie", m.kcal, "kcal"));
    macros.appendChild(macroCell("Protéines", m.protein, "g", undefined, undefined, true));
    macros.appendChild(macroCell("Glucides", m.carbs, "g", m.sugars, "dont sucres"));
    macros.appendChild(macroCell("Lipides", m.fat, "g", m.satFat, "dont saturés"));
    macros.appendChild(macroCell("Fibres", m.fiber, "g"));
    macros.appendChild(macroCell("Sel", m.salt, "g"));
    card.appendChild(macros);

    /* Crédit obligatoire (licence ODbL) */
    card.appendChild(el("div", "fh-credit", "Données : Open Food Facts (ODbL)"));

    host.appendChild(card);
  }

  function renderState(target, message) {
    injectStyles();
    var host = resolveTarget(target);
    if (!host) return;
    host.innerHTML = "";
    var card = el("div", "fh-card");
    card.appendChild(el("div", "fh-state", message));
    host.appendChild(card);
  }

  /* ----------------------- Point d'entrée public -------------------------- */
  /**
   * Flux complet : cherche le produit et affiche la fiche dans `target`.
   * À appeler depuis ton scanner : FoodHealth.showProduct(code, "#zone-produit").
   * Renvoie une Promise résolue avec le produit (ou null si introuvable).
   */
  function showProduct(barcode, target) {
    renderState(target, "Recherche…");
    return lookup(barcode)
      .then(function (product) {
        if (product) {
          renderCard(product, target);
        } else {
          renderState(target, "Produit absent de la base Open Food Facts.");
        }
        return product;
      })
      .catch(function () {
        renderState(target, "Impossible de joindre Open Food Facts. Vérifie la connexion.");
        return null;
      });
  }

  /* ----------------------------- Export ----------------------------------- */
  var FoodHealth = {
    configure: configure,
    lookup: lookup,
    computeScore: computeScore,
    extractMacros: extractMacros,
    proteinTag: proteinTag,
    renderCard: renderCard,       // rendre une fiche depuis un produit déjà en main
    showProduct: showProduct,     // flux complet code-barres → fiche
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = FoodHealth; // support éventuel d'un bundler
  }
  global.FoodHealth = FoodHealth; // usage vanilla via <script src>
})(typeof window !== "undefined" ? window : this);
