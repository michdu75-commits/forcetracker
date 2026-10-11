/* ══════════════════════════════════════════════════════════════════════════════════════
   🧪 FS-05B — LES RÉPONSES OPEN FOOD FACTS FIGÉES (03/10/2026, session-B, demande de Michel)

   ⛔⛔ CE NE SONT PAS DES RÉPONSES RÉELLES D'OPEN FOOD FACTS. Elles sont CONSTRUITES À LA MAIN, au format
   de `cgi/search.pl` (`{products:[…]}`), pour tester ce que FORCE TRACKER fait d'une réponse : le filtre
   (nom + énergie), le plafond de 6, l'ordre conservé, le nom affiché (nom FR, 1ʳᵉ marque, 60 caractères),
   la conversion kJ → kcal, la place de la section, les pannes. Les marques « MarqueA… » sont fictives
   exprès ; les valeurs sont plausibles, JAMAIS vérifiées, et ne doivent servir à rien d'autre.
   ⚠️ Pourquoi des réponses figées : le serveur est injoignable depuis le conteneur (mesuré le 03/10 :
   `CONNECT tunnel failed, response 403`) — et surtout, *le corpus teste Force Tracker, pas la disponibilité
   d'un serveur extérieur*. Le banc les sert par `context.route`, à la place du réseau.
   Chaque entrée : `status` (200 par défaut) · `body` (objet → JSON, ou texte brut) · `panne:true` (la requête
   échoue comme hors réseau) · `delai` (ms, pour la course de B-CDXLIII).
   ══════════════════════════════════════════════════════════════════════════════════════ */

const p = (code, nom, marque, kcal, extra) => Object.assign({
  code: 'FIXTURE-' + code, product_name: nom, brands: marque,
  nutriments: kcal == null ? {} : { 'energy-kcal_100g': kcal, proteins_100g: 10, carbohydrates_100g: 10, fat_100g: 5 }
}, extra || {});

const REPONSES = {
  /* neutre : OFF répond, sans produit (la valeur par défaut des cas qui ne portent pas sur OFF) */
  vide: { body: { count: 0, products: [] } },
  panne: { panne: true },
  http500: { status: 500, body: 'Internal Server Error' },
  jsonInvalide: { body: '{"products":[ pas du json' },
  sansProducts: { body: { count: 0, page: 1 } },

  whey: { body: { count: 4, products: [
    p('0101', 'Whey protéine saveur vanille', 'MarqueA', 380),
    p('0102', 'Whey isolate chocolat', 'MarqueB, Distributeur', 370),
    p('0103', 'Whey native nature', 'MarqueC', 375),
    Object.assign(p('0104', undefined, 'MarqueA', 382), { product_name_fr: 'Protéine whey fraise' }) ] } },

  barre: { body: { count: 3, products: [
    p('0201', 'Barre protéinée chocolat', 'MarqueD', 360),
    p('0202', 'Protein bar caramel', 'MarqueE', 350),
    /* énergie en kJ seulement : 1 590 kJ → 380 kcal (÷ 4,184, arrondi) */
    p('0203', 'Barre protéinée cacahuète', 'MarqueF', null, { nutriments: { energy_100g: 1590 } }) ] } },

  nutella: { body: { count: 2, products: [
    p('0301', 'Nutella', 'Ferrero', 539),
    p('0302', 'Nutella B-ready', 'Ferrero', 525) ] } },

  skyr: { body: { count: 3, products: [
    p('0401', 'Skyr nature', 'MarqueG', 63),
    p('0402', 'Skyr vanille', 'MarqueH', 80),
    p('0403', 'Skyr myrtille', 'MarqueG', 85) ] } },

  /* « plusieurs produits proches » : 9 produits → le filtre en retire 2, le plafond en coupe 1, un doublon reste */
  proches: { body: { count: 9, products: [
    p('0501', 'Yaourt grec nature', 'MarqueI', 120),
    p('0502', 'Yaourt grec miel', 'MarqueJ', 150),
    p('0503', 'Yaourt grec sans énergie', 'MarqueI', null),                         // pas d'énergie → écarté
    Object.assign(p('0504', undefined, 'MarqueK', 110), { generic_name: 'Yaourt' }), // pas de nom → écarté
    p('0505', 'Yaourt grec 0 %', 'MarqueK', 55),
    p('0506', 'Yaourt grec nature', 'MarqueI', 120),                                // doublon visible de 0501
    p('0507', 'Yaourt grec fraise', 'MarqueL', 130),
    p('0508', 'Yaourt grec coco', 'MarqueM', 160),
    p('0509', 'Yaourt grec citron', 'MarqueN', 140) ] } },                          // 7ᵉ retenu → coupé par le plafond

  /* un produit à 0 kcal (une eau) et un autre à 1 kcal */
  eau: { body: { count: 2, products: [
    p('0601', 'Eau minérale naturelle', 'MarqueO', 0),
    p('0602', 'Eau gazeuse citron', 'MarqueP', 1) ] } },

  nomLong: { body: { count: 1, products: [
    p('0701', 'Préparation pour boisson protéinée en poudre goût cookies and cream extra fondant', 'MarqueQ', 390) ] } },

  poulet: { body: { count: 2, products: [
    p('0801', 'Blanc de poulet rôti tranches', 'MarqueR', 110),
    p('0802', 'Aiguillettes de poulet', 'MarqueS', 120) ] } },

  bigmac: { body: { count: 1, products: [ p('0901', 'Big Mac', "McDonald's", 245) ] } },

  coca: { body: { count: 1, products: [ p('1001', 'Coca-Cola', 'Coca-Cola', 42) ] } },

  tacos: { body: { count: 1, products: [ p('1101', 'Tortillas pour tacos', 'MarqueT', 300) ] } },

  naan: { body: { count: 1, products: [ p('1201', 'Pain naan nature', 'MarqueU', 280) ] } },

  /* la course : une réponse LENTE pour « whey », puis on tape « skyr » avant qu'elle arrive */
  wheyLent: { delai: 1500, body: { count: 1, products: [ p('1301', 'Whey réponse périmée', 'MarqueV', 999) ] } },
};

module.exports = { REPONSES };
