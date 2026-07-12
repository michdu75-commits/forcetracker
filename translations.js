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
    "Passer cette étape":{en:"Skip this step",es:"Saltar este paso",el:"Παράλειψη βήματος",ru:"Пропустить шаг"},
    "Passer cette question":{en:"Skip this question",es:"Saltar esta pregunta",el:"Παράλειψη ερώτησης",ru:"Пропустить вопрос"},
    "Commencer sans compte":{en:"Start without an account",es:"Empezar sin cuenta",el:"Έναρξη χωρίς λογαριασμό",ru:"Начать без аккаунта"},
    "Adresse email":{en:"Email address",es:"Correo electrónico",el:"Διεύθυνση email",ru:"Адрес эл. почты"},
    "Confirme ton email":{en:"Confirm your email",es:"Confirma tu correo",el:"Επιβεβαίωσε το email σου",ru:"Подтверди свой email"},
    "Renvoyer le code":{en:"Resend code",es:"Reenviar código",el:"Επαναποστολή κωδικού",ru:"Отправить код снова"},
    "Vérifier":{en:"Check",es:"Verificar",el:"Έλεγχος",ru:"Проверить"},

    // Muscles
    "Abdominaux":{en:"Abs",es:"Abdominales",el:"Κοιλιακοί",ru:"Пресс"},
    "Pectoraux":{en:"Chest",es:"Pectorales",el:"Στήθος",ru:"Грудь"},
    "Dos":{en:"Back",es:"Espalda",el:"Πλάτη",ru:"Спина"},
    "Biceps":{en:"Biceps",es:"Bíceps",el:"Δικέφαλοι",ru:"Бицепс"},
    "Triceps":{en:"Triceps",es:"Tríceps",el:"Τρικέφαλοι",ru:"Трицепс"},
    "Épaules":{en:"Shoulders",es:"Hombros",el:"Ώμοι",ru:"Плечи"},
    "Trapèzes":{en:"Traps",es:"Trapecios",el:"Τραπεζοειδείς",ru:"Трапеции"},
    "Jambes":{en:"Legs",es:"Piernas",el:"Πόδια",ru:"Ноги"},
    "Fessiers":{en:"Glutes",es:"Glúteos",el:"Γλουτοί",ru:"Ягодицы"},
    "Mollets":{en:"Calves",es:"Gemelos",el:"Γάμπες",ru:"Икры"},
    "Avant-bras":{en:"Forearms",es:"Antebrazos",el:"Πήχεις",ru:"Предплечья"},

    // Objectif
    "Ton objectif":{en:"Your goal",es:"Tu objetivo",el:"Ο στόχος σου",ru:"Твоя цель"},
    "Prise de muscle":{en:"Build muscle",es:"Ganar músculo",el:"Αύξηση μυών",ru:"Набор мышц"},
    "Perte de poids":{en:"Weight loss",es:"Pérdida de peso",el:"Απώλεια βάρους",ru:"Похудение"},
    "Force":{en:"Strength",es:"Fuerza",el:"Δύναμη",ru:"Сила"},
    "Endurance":{en:"Endurance",es:"Resistencia",el:"Αντοχή",ru:"Выносливость"},
    "Rééquilibrage":{en:"Rebalancing",es:"Reequilibrio",el:"Επανεξισορρόπηση",ru:"Баланс"},

    // Niveau
    "Ton niveau":{en:"Your level",es:"Tu nivel",el:"Το επίπεδό σου",ru:"Твой уровень"},
    "Débutant":{en:"Beginner",es:"Principiante",el:"Αρχάριος",ru:"Новичок"},
    "Intermédiaire":{en:"Intermediate",es:"Intermedio",el:"Μεσαίο",ru:"Средний"},
    "Confirmé":{en:"Advanced",es:"Avanzado",el:"Προχωρημένος",ru:"Продвинутый"},

    // Profil (suite)
    "Ton profil":{en:"Your profile",es:"Tu perfil",el:"Το προφίλ σου",ru:"Твой профиль"},
    "Cycle menstruel":{en:"Menstrual cycle",es:"Ciclo menstrual",el:"Έμμηνος κύκλος",ru:"Менструальный цикл"},
    "Type de travail":{en:"Type of work",es:"Tipo de trabajo",el:"Τύπος εργασίας",ru:"Тип работы"},
    "Sédentaire":{en:"Sedentary",es:"Sedentario",el:"Καθιστικός",ru:"Сидячий"},
    "Actif":{en:"Active",es:"Activo",el:"Ενεργός",ru:"Активный"},
    "Très actif":{en:"Very active",es:"Muy activo",el:"Πολύ ενεργός",ru:"Очень активный"},
    "Activité":{en:"Activity",es:"Actividad",el:"Δραστηριότητα",ru:"Активность"},
    "Tabac":{en:"Smoking",es:"Tabaco",el:"Κάπνισμα",ru:"Курение"},
    "Droitier":{en:"Right-handed",es:"Diestro",el:"Δεξιόχειρας",ru:"Правша"},
    "Date d'anniversaire":{en:"Birthday",es:"Fecha de nacimiento",el:"Γενέθλια",ru:"День рождения"},

    // Nutrition (suite)
    "Total":{en:"Total",es:"Total",el:"Σύνολο",ru:"Итого"},
    "Surplus":{en:"Surplus",es:"Superávit",el:"Πλεόνασμα",ru:"Профицит"},
    "Déficit":{en:"Deficit",es:"Déficit",el:"Έλλειμμα",ru:"Дефицит"},
    "Quantité":{en:"Quantity",es:"Cantidad",el:"Ποσότητα",ru:"Количество"},
    "Créatine":{en:"Creatine",es:"Creatina",el:"Κρεατίνη",ru:"Креатин"},
    "Créatine Monohydrate":{en:"Creatine Monohydrate",es:"Creatina Monohidrato",el:"Μονοϋδρική Κρεατίνη",ru:"Моногидрат креатина"},
    "Protéines en poudre":{en:"Protein powder",es:"Proteína en polvo",el:"Πρωτεΐνη σε σκόνη",ru:"Протеин в порошке"},
    "Plan alimentaire journalier":{en:"Daily meal plan",es:"Plan de comidas diario",el:"Ημερήσιο πλάνο γευμάτων",ru:"Дневной план питания"},
    "Ce que tu as mangé":{en:"What you ate",es:"Lo que has comido",el:"Τι έφαγες",ru:"Что ты съел"},
    "Conseil nutrition":{en:"Nutrition tip",es:"Consejo de nutrición",el:"Συμβουλή διατροφής",ru:"Совет по питанию"},

    // Séance (suite)
    "Choisir un exercice":{en:"Choose an exercise",es:"Elegir un ejercicio",el:"Επιλογή άσκησης",ru:"Выбрать упражнение"},
    "Sélectionne un exercice":{en:"Select an exercise",es:"Selecciona un ejercicio",el:"Επίλεξε άσκηση",ru:"Выбери упражнение"},
    "SÉRIE SUIVANTE":{en:"NEXT SET",es:"SIGUIENTE SERIE",el:"ΕΠΟΜΕΝΟ ΣΕΤ",ru:"СЛЕДУЮЩИЙ ПОДХОД"},
    "Tags de série":{en:"Set tags",es:"Etiquetas de serie",el:"Ετικέτες σετ",ru:"Метки подхода"},
    "Programme perso":{en:"Custom program",es:"Programa personal",el:"Προσωπικό πρόγραμμα",ru:"Своя программа"},
    "Quitter":{en:"Exit",es:"Salir",el:"Έξοδος",ru:"Выйти"},

    // Progrès / Cycle
    "Progression":{en:"Progression",es:"Progresión",el:"Πρόοδος",ru:"Прогресс"},
    "Cycle":{en:"Cycle",es:"Ciclo",el:"Κύκλος",ru:"Цикл"},
    "Durée du cycle":{en:"Cycle duration",es:"Duración del ciclo",el:"Διάρκεια κύκλου",ru:"Длительность цикла"},
    "Plan semaine par semaine":{en:"Week-by-week plan",es:"Plan semana a semana",el:"Πλάνο εβδομάδα προς εβδομάδα",ru:"План по неделям"},

    // Menu / Outils
    "Aide détaillée":{en:"Detailed help",es:"Ayuda detallada",el:"Αναλυτική βοήθεια",ru:"Подробная справка"},
    "Compléments alimentaires":{en:"Supplements",es:"Suplementos",el:"Συμπληρώματα",ru:"Добавки"},
    "Confidentialité":{en:"Privacy",es:"Privacidad",el:"Απόρρητο",ru:"Конфиденциальность"},
    "Partager Force Tracker":{en:"Share Force Tracker",es:"Compartir Force Tracker",el:"Κοινοποίηση Force Tracker",ru:"Поделиться Force Tracker"},
    "Comment installer l'app":{en:"How to install the app",es:"Cómo instalar la app",el:"Πώς να εγκαταστήσετε την εφαρμογή",ru:"Как установить приложение"},
    "Plan de repas IA":{en:"AI meal plan",es:"Plan de comidas IA",el:"Πλάνο γευμάτων AI",ru:"План питания ИИ"},
    "Anatomie du corps humain":{en:"Human body anatomy",es:"Anatomía del cuerpo humano",el:"Ανατομία ανθρώπινου σώματος",ru:"Анатомия тела человека"},
    "Administration":{en:"Administration",es:"Administración",el:"Διαχείριση",ru:"Администрирование"},
    "Affichage agrandi":{en:"Larger display",es:"Pantalla ampliada",el:"Μεγαλύτερη προβολή",ru:"Крупный шрифт"},
    "Thème":{en:"Theme",es:"Tema",el:"Θέμα",ru:"Тема"},

    // Boutons (suite)
    "Appliquer":{en:"Apply",es:"Aplicar",el:"Εφαρμογή",ru:"Применить"},
    "Copier":{en:"Copy",es:"Copiar",el:"Αντιγραφή",ru:"Копировать"},
    "Copier le lien":{en:"Copy link",es:"Copiar enlace",el:"Αντιγραφή συνδέσμου",ru:"Копировать ссылку"},
    "Envoyer le lien":{en:"Send link",es:"Enviar enlace",el:"Αποστολή συνδέσμου",ru:"Отправить ссылку"},
    "Activer":{en:"Activate",es:"Activar",el:"Ενεργοποίηση",ru:"Активировать"},
    "Créer":{en:"Create",es:"Crear",el:"Δημιουργία",ru:"Создать"},
    "Plus tard":{en:"Later",es:"Más tarde",el:"Αργότερα",ru:"Позже"},
    "Saisir à la main":{en:"Enter manually",es:"Introducir a mano",el:"Χειροκίνητη εισαγωγή",ru:"Ввести вручную"},
    "Quantité":{en:"Quantity",es:"Cantidad",el:"Ποσότητα",ru:"Количество"},
    "Objectif":{en:"Goal",es:"Objetivo",el:"Στόχος",ru:"Цель"},
    "Bodybuilding":{en:"Bodybuilding",es:"Culturismo",el:"Μπόντιμπιλντινγκ",ru:"Бодибилдинг"},
    "Force athlétique":{en:"Powerlifting",es:"Powerlifting",el:"Πάουερλιφτινγκ",ru:"Пауэрлифтинг"},
    "Décharge":{en:"Deload",es:"Descarga",el:"Αποφόρτιση",ru:"Разгрузка"},
    "Date":{en:"Date",es:"Fecha",el:"Ημερομηνία",ru:"Дата"},
    "Exercices":{en:"Exercises",es:"Ejercicios",el:"Ασκήσεις",ru:"Упражнения"},
    "Nouvel exercice":{en:"New exercise",es:"Nuevo ejercicio",el:"Νέα άσκηση",ru:"Новое упражнение"},
    "Muscles secondaires":{en:"Secondary muscles",es:"Músculos secundarios",el:"Δευτερεύοντες μύες",ru:"Второстепенные мышцы"},
    "Primaire":{en:"Primary",es:"Primario",el:"Κύριος",ru:"Основной"},
    "Secondaire":{en:"Secondary",es:"Secundario",el:"Δευτερεύων",ru:"Второстепенный"},
    "Whey Protéine":{en:"Whey Protein",es:"Proteína Whey",el:"Πρωτεΐνη Whey",ru:"Сывороточный протеин"},
    "Protéines du jour":{en:"Daily protein",es:"Proteína diaria",el:"Πρωτεΐνη ημέρας",ru:"Белок за день"},
    "Protéines mangées (g)":{en:"Protein eaten (g)",es:"Proteína ingerida (g)",el:"Πρωτεΐνη που έφαγες (g)",ru:"Съедено белка (г)"},
    "Taille (cm)":{en:"Height (cm)",es:"Altura (cm)",el:"Ύψος (cm)",ru:"Рост (см)"},
    "Tour de cou (cm)":{en:"Neck (cm)",es:"Cuello (cm)",el:"Λαιμός (cm)",ru:"Шея (см)"},
    "Tour de taille (cm)":{en:"Waist (cm)",es:"Cintura (cm)",el:"Μέση (cm)",ru:"Талия (см)"},
    "Tour de hanches (cm)":{en:"Hips (cm)",es:"Cadera (cm)",el:"Γοφοί (cm)",ru:"Бёдра (см)"},
    "Repos défaut":{en:"Default rest",es:"Descanso predet.",el:"Προεπιλ. ανάπαυση",ru:"Отдых по умолч."},
    "Séance terminée !":{en:"Workout done!",es:"¡Sesión terminada!",el:"Η προπόνηση ολοκληρώθηκε!",ru:"Тренировка завершена!"},
    "Analyse en cours…":{en:"Analyzing…",es:"Analizando…",el:"Ανάλυση…",ru:"Анализ…"},
    "Quoi de neuf ?":{en:"What's new?",es:"¿Qué hay de nuevo?",el:"Τι νέο υπάρχει;",ru:"Что нового?"},
    "Passer →":{en:"Skip →",es:"Saltar →",el:"Παράλειψη →",ru:"Пропустить →"},
    "Suivant →":{en:"Next →",es:"Siguiente →",el:"Επόμενο →",ru:"Далее →"},
    "Suivant ▸":{en:"Next ▸",es:"Siguiente ▸",el:"Επόμενο ▸",ru:"Далее ▸"},
    "Silhouette corporelle":{en:"Body shape",es:"Silueta corporal",el:"Σιλουέτα σώματος",ru:"Силуэт тела"},
    "Morphotype (métabolisme)":{en:"Morphotype (metabolism)",es:"Morfotipo (metabolismo)",el:"Μορφότυπος (μεταβολισμός)",ru:"Морфотип (метаболизм)"},
    "Corrélations & tendances":{en:"Correlations & trends",es:"Correlaciones y tendencias",el:"Συσχετίσεις & τάσεις",ru:"Корреляции и тренды"},
    "Projections fin de cycle":{en:"End-of-cycle projections",es:"Proyecciones fin de ciclo",el:"Προβλέψεις τέλους κύκλου",ru:"Прогнозы на конец цикла"},
    "Nouveau cycle de force":{en:"New strength cycle",es:"Nuevo ciclo de fuerza",el:"Νέος κύκλος δύναμης",ru:"Новый цикл силы"},
    "Espace Testeur":{en:"Tester Space",es:"Espacio Tester",el:"Χώρος Δοκιμαστή",ru:"Зона тестера"},
    "Suivi photos":{en:"Photo tracking",es:"Seguimiento de fotos",el:"Παρακολούθηση φωτογραφιών",ru:"Отслеживание фото"},
    "Super Testeur":{en:"Super Tester",es:"Súper Tester",el:"Σούπερ Δοκιμαστής",ru:"Супер-тестер"},
    "Ta boîte à idées":{en:"Your idea box",es:"Tu buzón de ideas",el:"Το κουτί ιδεών σου",ru:"Твой ящик идей"},
    "Types de matériel":{en:"Equipment types",es:"Tipos de material",el:"Τύποι εξοπλισμού",ru:"Типы снаряжения"},
    "Pyramide descendante":{en:"Descending pyramid",es:"Pirámide descendente",el:"Φθίνουσα πυραμίδα",ru:"Нисходящая пирамида"},
    "Pyramide montante":{en:"Ascending pyramid",es:"Pirámide ascendente",el:"Αύξουσα πυραμίδα",ru:"Восходящая пирамида"},
    "Bilan corporel (balance pro)":{en:"Body scan (pro scale)",es:"Análisis corporal (báscula pro)",el:"Σωματική ανάλυση (ζυγαριά pro)",ru:"Анализ тела (проф. весы)"},
    "Modifier la pesée":{en:"Edit weigh-in",es:"Editar pesaje",el:"Επεξεργασία ζύγισης",ru:"Изменить взвешивание"},
    "Mon régime alimentaire":{en:"My diet",es:"Mi dieta",el:"Η διατροφή μου",ru:"Моя диета"},
    "Exporter mes données":{en:"Export my data",es:"Exportar mis datos",el:"Εξαγωγή δεδομένων μου",ru:"Экспорт моих данных"},
    "Compte synchronisé":{en:"Account synced",es:"Cuenta sincronizada",el:"Ο λογαριασμός συγχρονίστηκε",ru:"Аккаунт синхронизирован"},
    "Email Admin":{en:"Admin email",es:"Email admin",el:"Email διαχειριστή",ru:"Email админа"},
    "Reconnecte-toi":{en:"Reconnect",es:"Reconéctate",el:"Επανασυνδέσου",ru:"Переподключись"},
    "Profil non configuré":{en:"Profile not set up",es:"Perfil sin configurar",el:"Το προφίλ δεν έχει ρυθμιστεί",ru:"Профиль не настроен"},
    "Aucune":{en:"None",es:"Ninguna",el:"Καμία",ru:"Нет"},
    "Excellent":{en:"Excellent",es:"Excelente",el:"Εξαιρετικό",ru:"Отлично"},
    "Optimal":{en:"Optimal",es:"Óptimo",el:"Βέλτιστο",ru:"Оптимально"},
    "Épuisé":{en:"Exhausted",es:"Agotado",el:"Εξαντλημένος",ru:"Истощён"},
    "Modéré (3-4j)":{en:"Moderate (3-4d)",es:"Moderado (3-4d)",el:"Μέτριο (3-4μ)",ru:"Умеренно (3-4д)"},
    "Actif (5-6j)":{en:"Active (5-6d)",es:"Activo (5-6d)",el:"Ενεργό (5-6μ)",ru:"Активно (5-6д)"},
    "Naissance JJ/MM":{en:"Birth DD/MM",es:"Nacimiento DD/MM",el:"Γέννηση ΗΗ/ΜΜ",ru:"Рождение ДД/ММ"},
    "date de naissance":{en:"date of birth",es:"fecha de nacimiento",el:"ημερομηνία γέννησης",ru:"дата рождения"},
    "Contraception":{en:"Contraception",es:"Anticoncepción",el:"Αντισύλληψη",ru:"Контрацепция"},
    "Pilule combinée":{en:"Combined pill",es:"Píldora combinada",el:"Συνδυασμένο χάπι",ru:"Комбинир. таблетки"},
    "Pilule progestative":{en:"Progestin pill",es:"Píldora de progestágeno",el:"Χάπι προγεστίνης",ru:"Прогестиновые таблетки"},
    "DIU cuivre":{en:"Copper IUD",es:"DIU de cobre",el:"Χάλκινο σπιράλ",ru:"Медная спираль"},
    "DIU hormonal":{en:"Hormonal IUD",es:"DIU hormonal",el:"Ορμονικό σπιράλ",ru:"Гормональная спираль"},
    "Analyse mes stats":{en:"Analyze my stats",es:"Analiza mis estadísticas",el:"Ανάλυσε τα στατιστικά μου",ru:"Проанализируй мою статистику"},
    "Mode daltonien":{en:"Colorblind mode",es:"Modo daltónico",el:"Λειτουργία αχρωματοψίας",ru:"Режим дальтоника"},
    "Charges de la semaine":{en:"Weekly loads",es:"Cargas de la semana",el:"Φορτία της εβδομάδας",ru:"Нагрузки недели"},
    "Force max":{en:"Max strength",es:"Fuerza máx.",el:"Μέγιστη δύναμη",ru:"Макс. сила"},
    "Combien de séances par semaine ?":{en:"How many workouts per week?",es:"¿Cuántas sesiones por semana?",el:"Πόσες προπονήσεις την εβδομάδα;",ru:"Сколько тренировок в неделю?"},
    "Quel style ?":{en:"Which style?",es:"¿Qué estilo?",el:"Ποιο στυλ;",ru:"Какой стиль?"},
    "Analyse approfondie de tes photos":{en:"In-depth analysis of your photos",es:"Análisis detallado de tus fotos",el:"Εις βάθος ανάλυση των φωτογραφιών σου",ru:"Детальный анализ твоих фото"}
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
