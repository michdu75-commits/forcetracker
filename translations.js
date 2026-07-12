// ═══════════════════════════════════════════════════════════════════════════
// 🌍 TRADUCTION / i18n — FR (défaut) · EN · ES · EL (grec) · RU
// ---------------------------------------------------------------------------
// Principe : le code garde ses textes SOURCE en français. À l'affichage, on
// parcourt le DOM et on remplace les chaînes connues par leur traduction
// (dictionnaire TR). Un MutationObserver ré-applique après chaque rendu
// dynamique. Milo (Coach IA) répond directement dans la langue choisie.
// Changer de langue = on recharge la page (propre, source toujours en FR).
// ═══════════════════════════════════════════════════════════════════════════
(function(){
  'use strict';
  try { window._LANG = localStorage.getItem('ft4_lang') || 'fr'; } catch(e){ window._LANG = 'fr'; }

  window.LANG_FLAGS = { fr:'🇫🇷', en:'🇬🇧', es:'🇪🇸', el:'🇬🇷', ru:'🇷🇺' };
  window.LANG_NAMES = { fr:'Français', en:'English', es:'Español', el:'Ελληνικά', ru:'Русский' };
  // Nom de la langue pour la consigne de Milo (« réponds en … »)
  window.LANG_COACH = { fr:'français', en:'anglais (English)', es:'espagnol (Español)', el:'grec (Ελληνικά)', ru:'russe (Русский)' };

  // ─── Dictionnaire : "texte FR" → { en, es, el, ru } ───────────────────────
  // (couvre le squelette visible : navigation, titres, boutons, écrans clés,
  //  onboarding, menu. Les chaînes non listées restent en français.)
  var TR = {
    // Navigation
    "Accueil":{en:"Home",es:"Inicio",el:"Αρχική",ru:"Главная"},
    "Progrès":{en:"Progress",es:"Progreso",el:"Πρόοδος",ru:"Прогресс"},
    "Séance":{en:"Workout",es:"Sesión",el:"Προπόνηση",ru:"Тренировка"},
    "Nutrition":{en:"Nutrition",es:"Nutrición",el:"Διατροφή",ru:"Питание"},
    "Coach":{en:"Coach",es:"Entrenador",el:"Προπονητής",ru:"Тренер"},
    "Menu":{en:"Menu",es:"Menú",el:"Μενού",ru:"Меню"},
    "‹ Accueil":{en:"‹ Home",es:"‹ Inicio",el:"‹ Αρχική",ru:"‹ Главная"},

    // Boutons & actions communs
    "Enregistrer":{en:"Save",es:"Guardar",el:"Αποθήκευση",ru:"Сохранить"},
    "Enregistrer le profil":{en:"Save profile",es:"Guardar perfil",el:"Αποθήκευση προφίλ",ru:"Сохранить профиль"},
    "Annuler":{en:"Cancel",es:"Cancelar",el:"Ακύρωση",ru:"Отмена"},
    "Supprimer":{en:"Delete",es:"Eliminar",el:"Διαγραφή",ru:"Удалить"},
    "Fermer":{en:"Close",es:"Cerrar",el:"Κλείσιμο",ru:"Закрыть"},
    "Continuer":{en:"Continue",es:"Continuar",el:"Συνέχεια",ru:"Продолжить"},
    "Suivant":{en:"Next",es:"Siguiente",el:"Επόμενο",ru:"Далее"},
    "Précédent":{en:"Previous",es:"Anterior",el:"Προηγούμενο",ru:"Назад"},
    "Retour":{en:"Back",es:"Atrás",el:"Πίσω",ru:"Назад"},
    "Ajouter":{en:"Add",es:"Añadir",el:"Προσθήκη",ru:"Добавить"},
    "+ Ajouter":{en:"+ Add",es:"+ Añadir",el:"+ Προσθήκη",ru:"+ Добавить"},
    "Modifier":{en:"Edit",es:"Editar",el:"Επεξεργασία",ru:"Изменить"},
    "Partager":{en:"Share",es:"Compartir",el:"Κοινοποίηση",ru:"Поделиться"},
    "Confirmer":{en:"Confirm",es:"Confirmar",el:"Επιβεβαίωση",ru:"Подтвердить"},
    "Valider":{en:"Confirm",es:"Validar",el:"Επικύρωση",ru:"Подтвердить"},
    "Passer":{en:"Skip",es:"Saltar",el:"Παράλειψη",ru:"Пропустить"},
    "Passer ▸":{en:"Skip ▸",es:"Saltar ▸",el:"Παράλειψη ▸",ru:"Пропустить ▸"},
    "Terminer":{en:"Finish",es:"Terminar",el:"Τέλος",ru:"Завершить"},
    "Vider":{en:"Clear",es:"Vaciar",el:"Άδειασμα",ru:"Очистить"},
    "Reprendre":{en:"Resume",es:"Reanudar",el:"Συνέχεια",ru:"Продолжить"},
    "Pause":{en:"Pause",es:"Pausa",el:"Παύση",ru:"Пауза"},
    "Voir":{en:"View",es:"Ver",el:"Προβολή",ru:"Смотреть"},
    "Oui":{en:"Yes",es:"Sí",el:"Ναι",ru:"Да"},
    "Non":{en:"No",es:"No",el:"Όχι",ru:"Нет"},
    "Chargement…":{en:"Loading…",es:"Cargando…",el:"Φόρτωση…",ru:"Загрузка…"},

    // Accueil
    "CE MOIS":{en:"THIS MONTH",es:"ESTE MES",el:"ΑΥΤΟΝ ΤΟΝ ΜΗΝΑ",ru:"ЭТОТ МЕСЯЦ"},
    "Volume":{en:"Volume",es:"Volumen",el:"Όγκος",ru:"Объём"},
    "Séances":{en:"Workouts",es:"Sesiones",el:"Προπονήσεις",ru:"Тренировки"},
    "Poids":{en:"Weight",es:"Peso",el:"Βάρος",ru:"Вес"},
    "Commencer une séance":{en:"Start a workout",es:"Empezar una sesión",el:"Έναρξη προπόνησης",ru:"Начать тренировку"},
    "Récupération":{en:"Recovery",es:"Recuperación",el:"Ανάκαμψη",ru:"Восстановление"},
    "Niveau de force":{en:"Strength level",es:"Nivel de fuerza",el:"Επίπεδο δύναμης",ru:"Уровень силы"},
    "Records":{en:"Records",es:"Récords",el:"Ρεκόρ",ru:"Рекорды"},
    "Cycle de force":{en:"Strength cycle",es:"Ciclo de fuerza",el:"Κύκλος δύναμης",ru:"Силовой цикл"},

    // Séance
    "Ajouter un exercice":{en:"Add an exercise",es:"Añadir ejercicio",el:"Προσθήκη άσκησης",ru:"Добавить упражнение"},
    "+ Ajouter un exercice":{en:"+ Add an exercise",es:"+ Añadir ejercicio",el:"+ Προσθήκη άσκησης",ru:"+ Добавить упражнение"},
    "Terminer la séance":{en:"Finish workout",es:"Terminar sesión",el:"Τέλος προπόνησης",ru:"Завершить тренировку"},
    "+ Série":{en:"+ Set",es:"+ Serie",el:"+ Σετ",ru:"+ Подход"},
    "Repos":{en:"Rest",es:"Descanso",el:"Ανάπαυση",ru:"Отдых"},
    "Reps":{en:"Reps",es:"Reps",el:"Επαν.",ru:"Повт."},
    "Type":{en:"Type",es:"Tipo",el:"Τύπος",ru:"Тип"},
    "Normal":{en:"Normal",es:"Normal",el:"Κανονικό",ru:"Обычный"},
    "Échauffement":{en:"Warm-up",es:"Calentamiento",el:"Προθέρμανση",ru:"Разминка"},
    "Échec":{en:"Failure",es:"Al fallo",el:"Εξάντληση",ru:"До отказа"},
    "Programme":{en:"Program",es:"Programa",el:"Πρόγραμμα",ru:"Программа"},
    "Mes Programmes":{en:"My Programs",es:"Mis programas",el:"Τα προγράμματά μου",ru:"Мои программы"},
    "Changer":{en:"Change",es:"Cambiar",el:"Αλλαγή",ru:"Сменить"},
    "REPRISE DANS":{en:"RESUME IN",es:"REANUDAR EN",el:"ΣΥΝΕΧΕΙΑ ΣΕ",ru:"ВОЗОБНОВЛЕНИЕ ЧЕРЕЗ"},
    "C'EST REPARTI":{en:"LET'S GO",es:"¡VAMOS!",el:"ΠΑΜΕ",ru:"ПОЕХАЛИ"},
    "Note perso (trop léger, fatigue, douleur…)":{en:"Personal note (too light, tired, pain…)",es:"Nota personal (muy ligero, cansancio, dolor…)",el:"Προσωπική σημείωση (πολύ ελαφρύ, κούραση, πόνος…)",ru:"Личная заметка (слишком легко, усталость, боль…)"},

    // Nutrition
    "Ajouter un aliment":{en:"Add a food",es:"Añadir alimento",el:"Προσθήκη τροφής",ru:"Добавить продукт"},
    "Journal":{en:"Journal",es:"Diario",el:"Ημερολόγιο",ru:"Дневник"},
    "Repas":{en:"Meals",es:"Comidas",el:"Γεύματα",ru:"Приёмы пищи"},
    "Petit-déj":{en:"Breakfast",es:"Desayuno",el:"Πρωινό",ru:"Завтрак"},
    "Déjeuner":{en:"Lunch",es:"Almuerzo",el:"Μεσημεριανό",ru:"Обед"},
    "Collation":{en:"Snack",es:"Merienda",el:"Σνακ",ru:"Перекус"},
    "Dîner":{en:"Dinner",es:"Cena",el:"Βραδινό",ru:"Ужин"},
    "Calories":{en:"Calories",es:"Calorías",el:"Θερμίδες",ru:"Калории"},
    "Calories (kcal)":{en:"Calories (kcal)",es:"Calorías (kcal)",el:"Θερμίδες (kcal)",ru:"Калории (ккал)"},
    "Protéines":{en:"Protein",es:"Proteínas",el:"Πρωτεΐνες",ru:"Белки"},
    "Protéines (g)":{en:"Protein (g)",es:"Proteínas (g)",el:"Πρωτεΐνες (g)",ru:"Белки (г)"},
    "Glucides":{en:"Carbs",es:"Carbohidratos",el:"Υδατάνθρακες",ru:"Углеводы"},
    "Glucides (g)":{en:"Carbs (g)",es:"Carbohidratos (g)",el:"Υδατάνθρακες (g)",ru:"Углеводы (г)"},
    "Lipides":{en:"Fats",es:"Grasas",el:"Λιπαρά",ru:"Жиры"},
    "Lipides (g)":{en:"Fats (g)",es:"Grasas (g)",el:"Λιπαρά (g)",ru:"Жиры (г)"},
    "Hydratation":{en:"Hydration",es:"Hidratación",el:"Ενυδάτωση",ru:"Гидратация"},
    "Suppléments":{en:"Supplements",es:"Suplementos",el:"Συμπληρώματα",ru:"Добавки"},

    // Progrès
    "Poids de corps":{en:"Body weight",es:"Peso corporal",el:"Σωματικό βάρος",ru:"Вес тела"},
    "Masse grasse":{en:"Body fat",es:"Grasa corporal",el:"Λίπος σώματος",ru:"Жировая масса"},
    "Badges":{en:"Badges",es:"Insignias",el:"Διακριτικά",ru:"Значки"},
    "Actuel":{en:"Current",es:"Actual",el:"Τρέχον",ru:"Текущий"},
    "Record":{en:"Record",es:"Récord",el:"Ρεκόρ",ru:"Рекорд"},

    // Profil
    "Mon profil":{en:"My profile",es:"Mi perfil",el:"Το προφίλ μου",ru:"Мой профиль"},
    "Profil":{en:"Profile",es:"Perfil",el:"Προφίλ",ru:"Профиль"},
    "Identité":{en:"Identity",es:"Identidad",el:"Ταυτότητα",ru:"Профиль"},
    "Objectif":{en:"Goal",es:"Objetivo",el:"Στόχος",ru:"Цель"},
    "Discipline":{en:"Discipline",es:"Disciplina",el:"Πειθαρχία",ru:"Дисциплина"},
    "Composition corporelle":{en:"Body composition",es:"Composición corporal",el:"Σύσταση σώματος",ru:"Состав тела"},
    "Morphologie":{en:"Morphology",es:"Morfología",el:"Μορφολογία",ru:"Морфология"},
    "Santé":{en:"Health",es:"Salud",el:"Υγεία",ru:"Здоровье"},
    "Accessibilité":{en:"Accessibility",es:"Accesibilidad",el:"Προσβασιμότητα",ru:"Доступность"},
    "Âge":{en:"Age",es:"Edad",el:"Ηλικία",ru:"Возраст"},
    "Taille":{en:"Height",es:"Altura",el:"Ύψος",ru:"Рост"},
    "Sexe":{en:"Sex",es:"Sexo",el:"Φύλο",ru:"Пол"},
    "Homme":{en:"Male",es:"Hombre",el:"Άνδρας",ru:"Мужчина"},
    "Femme":{en:"Female",es:"Mujer",el:"Γυναίκα",ru:"Женщина"},
    "Musculation":{en:"Bodybuilding",es:"Musculación",el:"Bodybuilding",ru:"Бодибилдинг"},

    // Menu
    "Mon compte":{en:"My account",es:"Mi cuenta",el:"Ο λογαριασμός μου",ru:"Мой аккаунт"},
    "Outils":{en:"Tools",es:"Herramientas",el:"Εργαλεία",ru:"Инструменты"},
    "Compte":{en:"Account",es:"Cuenta",el:"Λογαριασμός",ru:"Аккаунт"},
    "Aide":{en:"Help",es:"Ayuda",el:"Βοήθεια",ru:"Помощь"},
    "À propos":{en:"About",es:"Acerca de",el:"Σχετικά",ru:"О приложении"},
    "Guide de l'application":{en:"App guide",es:"Guía de la app",el:"Οδηγός εφαρμογής",ru:"Руководство"},
    "Guide de la muscu":{en:"Training guide",es:"Guía de entrenamiento",el:"Οδηγός γυμναστικής",ru:"Гид по тренировкам"},
    "Calculateur 1RM":{en:"1RM calculator",es:"Calculadora 1RM",el:"Υπολογιστής 1RM",ru:"Калькулятор 1ПМ"},
    "Anatomie":{en:"Anatomy",es:"Anatomía",el:"Ανατομία",ru:"Анатомия"},
    "Langue":{en:"Language",es:"Idioma",el:"Γλώσσα",ru:"Язык"},
    "Choisir la langue":{en:"Choose language",es:"Elegir idioma",el:"Επιλογή γλώσσας",ru:"Выбор языка"},
    "Mode jour":{en:"Day mode",es:"Modo día",el:"Λειτουργία ημέρας",ru:"Дневной режим"},
    "Mode nuit":{en:"Night mode",es:"Modo noche",el:"Λειτουργία νύχτας",ru:"Ночной режим"},

    // Onboarding
    "Bienvenue":{en:"Welcome",es:"Bienvenido",el:"Καλώς ήρθες",ru:"Добро пожаловать"},
    "Commencer":{en:"Start",es:"Empezar",el:"Ξεκίνα",ru:"Начать"},
    "C'est parti !":{en:"Let's go!",es:"¡Vamos!",el:"Πάμε!",ru:"Начнём!"},
    "Ton prénom":{en:"Your first name",es:"Tu nombre",el:"Το όνομά σου",ru:"Твоё имя"},
    "Passer cette étape":{en:"Skip this step",es:"Saltar este paso",el:"Παράλειψη βήματος",ru:"Пропустить шаг"}
  };

  window.TR = TR;
  window.t = function(fr){ if(window._LANG==='fr'||!fr)return fr; var e=TR[fr]; return (e&&e[window._LANG])||fr; };

  var _busy=false, _obs=null, _raf=0;
  function _apply(root){
    if(window._LANG==='fr'||!root)return;
    _busy=true;
    try{
      var w=document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      var arr=[], n;
      while(n=w.nextNode()){ if(n.nodeValue && n.nodeValue.trim()) arr.push(n); }
      for(var i=0;i<arr.length;i++){
        var tn=arr[i], k=tn.nodeValue.trim(), e=TR[k];
        if(e && e[window._LANG]) tn.nodeValue = tn.nodeValue.replace(k, e[window._LANG]);
      }
      if(root.querySelectorAll){
        var ph=root.querySelectorAll('[placeholder]');
        for(var j=0;j<ph.length;j++){ var kk=(ph[j].getAttribute('placeholder')||'').trim(), ee=TR[kk]; if(ee&&ee[window._LANG]) ph[j].setAttribute('placeholder', ee[window._LANG]); }
      }
    }catch(err){}
    _busy=false;
  }
  window._applyLang = function(){ _apply(document.body); };

  function _startObs(){
    if(_obs||window._LANG==='fr')return;
    _obs=new MutationObserver(function(){
      if(_busy)return;
      if(_raf)cancelAnimationFrame(_raf);
      _raf=requestAnimationFrame(function(){ window._applyLang(); });
    });
    _obs.observe(document.body,{childList:true,subtree:true,characterData:true});
  }

  window.setLang = function(l){
    try{ localStorage.setItem('ft4_lang', l); }catch(e){}
    window._LANG=l;
    try{ location.reload(); }catch(e){ window._applyLang(); }
  };

  // Boot
  if(typeof document!=='undefined'){
    var boot=function(){
      if(window._LANG && window._LANG!=='fr'){ window._applyLang(); _startObs(); }
      if(typeof window._setLangFlagEls==='function') window._setLangFlagEls();
    };
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
  }

  // Met à jour le(s) drapeau(x) affiché(s) dans l'UI
  window._setLangFlagEls=function(){
    var f=window.LANG_FLAGS[window._LANG]||'🇫🇷';
    document.querySelectorAll('.lang-flag-cur').forEach(function(el){ el.textContent=f; });
  };
  // Ouvre le sélecteur de langue (drapeaux)
  window.openLangPicker=function(){
    var ov=document.getElementById('ov-lang');
    if(!ov){
      ov=document.createElement('div'); ov.id='ov-lang'; ov.className='overlay'; ov.style.zIndex='600';
      ov.onclick=function(e){ if(e.target===ov)ov.classList.remove('open'); };
      document.body.appendChild(ov);
    }
    var langs=['fr','en','es','el','ru'];
    var rows=langs.map(function(l){
      var on=(window._LANG===l);
      return '<button onclick="setLang(\''+l+'\')" style="width:100%;display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:12px;border:1px solid '+(on?'var(--red)':'var(--sep)')+';background:'+(on?'rgba(255,45,85,.08)':'var(--bg2)')+';color:var(--t1);font-size:16px;font-family:var(--font);cursor:pointer;margin-bottom:8px;">'
        +'<span style="font-size:26px;line-height:1;">'+window.LANG_FLAGS[l]+'</span>'
        +'<span style="font-weight:700;flex:1;text-align:left;">'+window.LANG_NAMES[l]+'</span>'
        +(on?'<span style="color:var(--red);font-weight:800;">✓</span>':'')+'</button>';
    }).join('');
    ov.innerHTML='<div class="modal" style="max-width:360px;width:92vw;padding:18px;">'
      +'<div style="font-weight:800;font-size:18px;margin-bottom:14px;">🌍 '+window.t('Choisir la langue')+'</div>'
      +rows
      +'<div style="font-size:12px;color:var(--t3);margin-top:8px;line-height:1.5;">L\'application se recharge pour appliquer la langue. Milo (Coach IA) répondra aussi dans cette langue.</div>'
      +'</div>';
    ov.classList.add('open');
  };
})();
