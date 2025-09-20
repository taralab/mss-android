let animCascadeDelay = 60;//milisecondes de l'animation cascade


//  ------------------   Gestion action sous apparition clavier------------------------- 

document.addEventListener('DOMContentLoaded', function () {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Keyboard) {
      window.Capacitor.Plugins.Keyboard.addListener('keyboardWillShow', function (info) {

        // apparition du clavier
        //Masque menu principal et div safe area bottom
        document.getElementById("divMainBtnMenu").classList.add("hidden");
        document.getElementById("divSafeAreaBottom").classList.add("hidden");

        //Et si dans menu principal, masque les boutons flottant selon si template ou non
        if (isInMainMenu) {
            //masque le bouton new
            document.getElementById("btnNewActivity").style.display = "none";
            if (templateAvailable) {
                //et masque le bouton new from template si disponible
                document.getElementById("btnNewFromTemplate").style.display = "none";
            }
        }

      });

      window.Capacitor.Plugins.Keyboard.addListener('keyboardWillHide', function () {
        console.log('Clavier caché');
        // Disparition du clavier
        //Remet menu principal et div safe area bottom
        document.getElementById("divMainBtnMenu").classList.remove("hidden");
        document.getElementById("divSafeAreaBottom").classList.remove("hidden");

               //Et si dans menu principal, réaffiche les boutons flottant selon si template ou non
        if (isInMainMenu) {
            //réaffiche le bouton new
            document.getElementById("btnNewActivity").style.display = "block";
            if (templateAvailable) {
                //et réaffiche le bouton new from template si disponible
                document.getElementById("btnNewFromTemplate").style.display = "block";
            }
        }
      });
    } else {
      console.warn('Plugin Keyboard non disponible');
    }
  });




// ------------------------- CONDITION D'UTILISATION ---------------------------



function onGenerateConditionUtilisation() {
    // Insert les conditions dynamique dans l'emplacement
    document.getElementById("divConditionDynamicText").innerHTML = conditionText;
    // Affichage
    onChangeDisplay(allDivHomeToDisplayNone,["divConditionUtilisation"],[],[],[],["launch_btn"],[]);
    if (devMode === true){console.log("Génération du popup des conditions d'utilisation");};


    // Ajout des écouteurs d'évènements
    let locToggleLauchButtonRef = document.getElementById("selectStatusCondition");
    locToggleLauchButtonRef.addEventListener("change",()=>{
        toggleLaunchButton();
    });

    let locLaunchBtnRef = document.getElementById("launch_btn");
    locLaunchBtnRef.addEventListener("click",()=>{
        onClickAcceptCondition();
    });


    // Masque le main menu et header
    document.getElementById("divMainBtnMenu").style.display = "none";
    document.getElementById("divHeader").style.display = "none";

};

// Acceptation des conditions d'utilisations

async function onClickAcceptCondition() {
    if (devMode === true){console.log("Acceptation des conditions d'utilisation");};

    userInfo.conditionAccepted = true;

    //Sauvegarde
    await updateDocumentInDB(profilStoreName, (doc) => {
        doc.data = userInfo;
        return doc;
    });

    onLeaveMenu("userCondition");
};

// gestion de la Checkbox d'acceptation
function toggleLaunchButton() {
    let selectStatusConditionRef = document.getElementById("selectStatusCondition");
    let launchBtn = document.getElementById("launch_btn");
    launchBtn.style.visibility = selectStatusConditionRef.value === "Accepted" ? "visible" : "hidden";
};


















// ------------------------------  LANCEMENT création de la base de donnée ------------------------------










let dbName = `MSS_db`,
    activityStoreName = "ActivityList",
    profilStoreName = "Profil",
    rewardsStoreName = "Recompenses",
    specialRewardsStoreName = "Special-Recompense",
    settingStoreName = "Setting",
    templateStoreName = "Template",
    favorisStoreName = "Favoris",
    templateSessionStoreName = "TemplateSession",
    planningStoreName ="Planning",
    noteStoreName = "Notes",
    recupStoreName = "Recup";
    









//--------------------------------- BOUTON FLOTTANT ---------------------------



const btnNewActivityRef = document.getElementById('btnNewActivity');
const btnNewFromTemplateRef = document.getElementById("btnNewFromTemplate");
let lastScrollTop = 0;
let scrollTimeout;


// Écoute de l'événement scroll sur la div
divItemListRef.addEventListener('scroll', () => {
    // Cache le bouton dès qu'il y a un mouvement de scroll
    btnNewActivityRef.classList.add('hiddenBtnFloatting');
    btnNewFromTemplateRef.classList.add('hiddenBtnFloatting');

    // Empêche le bouton de réapparaître immédiatement
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        btnNewActivityRef.classList.remove('hiddenBtnFloatting');
        btnNewFromTemplateRef.classList.remove('hiddenBtnFloatting');
    }, 200); // Réapparaît après 200ms une fois le scroll arrêté
});

 






// -----------------------------------  pouch DB -------------------------------------





// Créer (ou ouvrir si elle existe déjà) une base de données PouchDB
let  db = new PouchDB(dbName, { auto_compaction: true });//avec la suppression automatique des anciennes révisions

// Vérifier si la base est bien créée
db.info().then(info => console.log(' [DATABASE] Base créée/ouverte :', info));



// Création des éléments de base
async function onCreateDBStore() {
    async function createStore(storeId, data) {
        try {
            let existing;
            try {
                existing = await db.get(storeId);
            } catch (err) {
                if (err.status !== 404) { // Si ce n'est pas une erreur "document non trouvé", on affiche l'erreur
                    console.error(`[DATABASE] Erreur lors de la vérification du store ${storeId}:`, err);
                    return;
                }
                existing = null;
            }

            if (!existing) {
                await db.put({ _id: storeId, ...data });
                console.log(`[DATABASE] Création du store ${storeId.toUpperCase()}`);
            } else {
                console.log(`[DATABASE] Le store ${storeId.toUpperCase()} existe déjà`);
            }
        } catch (err) {
            console.error(`[DATABASE] Erreur lors de la création du store ${storeId}:`, err);
        }
    }

    // Création des stores
    await createStore(favorisStoreName, { type: favorisStoreName, favorisList: [] });
    await createStore(profilStoreName, { 
        type: profilStoreName,
        data:{
            pseudo: "", 
            customNotes: "",
            conditionAccepted : false 
        }
    });
    await createStore(settingStoreName, {
        type: settingStoreName,
        data:{
            agenda : "NONE",
            agendaScheduleStart:"08:00",
            agendaScheduleEnd:"10:00",
            displayCommentDoneMode: "Collapse",
            displayCommentPlannedMode: "Collapse",
            isAutoSaveEnabled: false,
            lastAutoSaveDate: "noSet",
            lastAutoSaveTime: "",
            lastManualSaveDate: "noSet",
            lastManualSaveTime: "",
            autoSaveFrequency: 7,
            fromSessionToActivityMode : "MINIMAL",
            devMode:false,
            animationEnabled : true
        }  
    });
    await createStore(rewardsStoreName, { type: rewardsStoreName, rewards: [] });

    await createStore(specialRewardsStoreName, { type: specialRewardsStoreName, specialRewards: [] });
    
    await createStore(planningStoreName, { type: planningStoreName, userPlanning : defaultPlanningArray});

    await createStore(recupStoreName,{
        type:recupStoreName,
        data:{
            isCustomMode : defaultRecupData.isCustomMode,
            predefinitValue : defaultRecupData.predefinitValue,
            customValue : defaultRecupData.customValue
        }
    });

}






// Fonction pour récupérer les données des stores
async function onLoadStores() {
    try {
        const profil = await db.get(profilStoreName).catch(() => null);
        if (profil) {
            userInfo.pseudo = profil.data.pseudo;
            userInfo.customNotes = profil.data.customNotes;
            userInfo.conditionAccepted = profil.data.conditionAccepted;
            userInfo.updateNameList = profil.data.updateNameList || [];
        }

        const rewards = await db.get(rewardsStoreName).catch(() => null);
        if (rewards) {
            userRewardsArray = rewards.rewards;
        }

        const specialRewards = await db.get(specialRewardsStoreName).catch(() => null);
        if (specialRewards) {
            userSpecialRewardsArray = specialRewards.specialRewards;
        }

        const favoris = await db.get(favorisStoreName).catch(() => null);
        if (favoris) {
            userFavoris = favoris.favorisList;
        }

        const settings = await db.get(settingStoreName).catch(() => null);
        if (settings) {

            userSetting = {
                agenda : settings.data.agenda || defaultSetting.agenda,
                agendaScheduleStart: settings.data.agendaScheduleStart || defaultSetting.agendaScheduleStart,
                agendaScheduleEnd: settings.data.agendaScheduleEnd || defaultSetting.agendaScheduleEnd,
                displayCommentDoneMode : settings.data.displayCommentDoneMode || defaultSetting.displayCommentDoneMode,
                displayCommentPlannedMode : settings.data.displayCommentPlannedMode || defaultSetting.displayCommentPlannedMode,
                isAutoSaveEnabled : settings.data.isAutoSaveEnabled ?? defaultSetting.isAutoSaveEnabled,
                lastAutoSaveDate : settings.data.lastAutoSaveDate || defaultSetting.lastAutoSaveDate,
                lastAutoSaveTime : settings.data.lastAutoSaveTime || defaultSetting.lastAutoSaveTime,
                lastManualSaveDate : settings.data.lastManualSaveDate || defaultSetting.lastManualSaveDate,
                lastManualSaveTime :settings.data.lastManualSaveTime || defaultSetting.lastManualSaveTime,
                autoSaveFrequency : settings.data.autoSaveFrequency || defaultSetting.autoSaveFrequency,
                fromSessionToActivityMode : settings.data.fromSessionToActivityMode || defaultSetting.fromSessionToActivityMode,
                devMode : settings.data.devMode ?? defaultSetting.devMode,
                animationEnabled: settings.data.animationEnabled ?? defaultSetting.animationEnabled
            };
        }

        if (devMode === true){console.log("[DATABASE] Données chargées :", { userInfo, userRewardsArray, userFavoris, userSetting });};
    } catch (err) {
        console.error("[DATABASE] Erreur lors du chargement des stores :", err);
    }
}







// Procésus de lancement de l'application
async function initApp() {
    await onCreateDBStore();  // 1️⃣ Création des stores
    await onCheckItemCorbeilleToDelete(); // 2️⃣ traitement de la corbeille à vider
    await onLoadStores();       // 3 Extraction des données des stores génériques
    await onLoadActivityFromDB(); // 4 Extraction liste activité

    await onLoadTemplateFromDB(); // 5 Extraction liste modèle
    onUpdateTemplateKeys();// 6 récupère les clés des modèles d'activités triés
}


// Appel de la fonction après l'initialisation
initApp().then(() => firstActualisation());

async function firstActualisation() {
    // Set le devMode

    devMode = userSetting.devMode;

    if (devMode === true){console.log("Première actualisation")};


    // CONDITION UTILISATION
        console.log("userInfo.ConditionAccepted : " + userInfo.conditionAccepted );
        console.log("userInfo" , userInfo);
    if (userInfo.conditionAccepted === false) {
        onGenerateConditionUtilisation();
        //la vérification des update event aura lieu après l'acceptation des conditions
        //dans onLeaveMenu User condition

    }else{
        //vérification des évènements pour nouveauté
        onCheckUpdateEvent();
    }


    // FAVORIS
    onGenerateActivityOptionChoice("selectorCategoryChoice");
    onGenerateFakeOptionList("divFakeSelectOptList");


    // SETTING
    // Met à jour les css du mode d'affichage selon les paramètres
    currentCommentDoneClassName = onSearchCommentClassNameByMode(userSetting.displayCommentDoneMode);
    currentCommentPlannedClassName = onSearchCommentClassNameByMode(userSetting.displayCommentPlannedMode);


    // Traitement sauvegarde automatique
    if (userSetting.isAutoSaveEnabled) {
        console.log("[SETTING] Autosave activée.");
        if (devMode === true){console.log("[SETTING] Autosave activité. Demande de vérification des conditions");};

        // Vérification des conditions
        let isSaveRequired = await onCheckAutoSaveCondition();
        console.log("Sauvegarde Automatique nécessaire :", isSaveRequired);

        if (isSaveRequired) {
            eventSaveData(true);
        }

    }


    // ACTIVITY

    if (devMode === true) {
        console.log("Loading allUserActivityArray :",allUserActivityArray);
    };
    // Generation du trie dynamique
    onGenerateDynamiqueFilter(allUserActivityArray);

    // Actualisation de l'affichage des activités
    eventUpdateActivityList();

    // TEMPLATE
    onUpdateTemplateList(false);


    //Lancement de la gestion des timers et wakelock
    eventInitTimersAndWakeLock();

}