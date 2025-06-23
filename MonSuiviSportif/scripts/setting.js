

// Boolean de dev pour les logs
let devMode = false;





// Ecoute d'évènement
let isAddEventListenerForSettingMenu = false;
function onAddEventListenerForSettingMenu(){
    if (devMode === true){
        console.log("[EVENT-LISTENER] : Ajoute les évènements pour menu SETTING");
    }

    //Pour action unique
    isAddEventListenerForSettingMenu = true;

    //changement commentMode
    let LocSelectSettingSessionCommentModeRef = document.getElementById("selectSettingSessionCommentMode");
    LocSelectSettingSessionCommentModeRef.addEventListener("change", (event)=>{
        onChangeSettingSettionCommentMode(event.target.value);
    });

    //Changement inputTime start
    let locInputTimeSettingScheduleStartRef = document.getElementById("inputTimeSettingScheduleStart");
    locInputTimeSettingScheduleStartRef.addEventListener("change", (event)=>{
        onCheckAgendaNotifyTime(event.target);
    });

    //changement inputTime end
    let locInputTimeSettingScheduleEndRef = document.getElementById("inputTimeSettingScheduleEnd");
    locInputTimeSettingScheduleEndRef.addEventListener("change",()=>{
        onCheckEndSchedule();
    });


    //changement frequence sauvegarde
    let locInputSettingSaveFrequencyRef = document.getElementById("inputSettingSaveFrequency");
    locInputSettingSaveFrequencyRef.addEventListener("change",()=>{
        onDataInSettingSaveFrequencyChange();
    });

}







function onOpenMenuSetting() {
    // Lance le référencement des items
    onReferenceItemsSetting();

    // set les éléments du menu paramètres
    onSetSettingItems();

    //Ajoute les évènement si pas déja fait
    if(!isAddEventListenerForSettingMenu){
        onAddEventListenerForSettingMenu();
    }
    
};
    
    
    
    

// ------------------------  Paramètres utilisateur -------------------------



let defaultSetting = {
    agenda :"NONE",
    agendaScheduleStart:"08:00",
    agendaScheduleEnd:"10:00",
    displayCommentDoneMode : "Collapse",
    displayCommentPlannedMode : "Collapse",
    isAutoSaveEnabled : false,
    lastAutoSaveDate : "noSet",
    lastAutoSaveTime : "",
    lastManualSaveDate : "noSet",
    lastManualSaveTime :"",
    autoSaveFrequency : 7,
    fromSessionToActivityMode : "MINIMAL",
    devMode : false,
    animationEnabled : true
};

let userSetting = {},
    currentCommentDoneClassName = "",
    currentCommentPlannedClassName = "";


    



let selectSettingCommentModePlannedRef,
    selectSettingCommentModeDoneRef,
    inputSettingIsAutoSaveRef,
    inputSettingSaveFrequencyRef,
    inputCheckboxDevModeRef,
    selectSettingAgendaRef,
    inputTimeSettingScheduleStartRef,
    inputTimeSettingScheduleEndRef,
    selectSettingSessionCommentModeRef,
    pSettingSessionCommentModeExempleRef,
    inputCheckboxAnimationStatusRef;



// Referencement
function onReferenceItemsSetting() {
    selectSettingCommentModePlannedRef =  document.getElementById("selectSettingCommentModePlanned");
    selectSettingCommentModeDoneRef = document.getElementById("selectSettingCommentModeDone");
    inputSettingIsAutoSaveRef = document.getElementById("inputSettingIsAutoSave");
    inputSettingSaveFrequencyRef = document.getElementById("inputSettingSaveFrequency");
    inputCheckboxDevModeRef = document.getElementById("inputCheckboxDevMode");
    selectSettingAgendaRef = document.getElementById("selectSettingAgenda");
    inputTimeSettingScheduleStartRef = document.getElementById("inputTimeSettingScheduleStart");
    inputTimeSettingScheduleEndRef = document.getElementById("inputTimeSettingScheduleEnd");
    selectSettingSessionCommentModeRef = document.getElementById("selectSettingSessionCommentMode");
    pSettingSessionCommentModeExempleRef = document.getElementById("pSettingSessionCommentModeExemple");
    inputCheckboxAnimationStatusRef = document.getElementById("inputCheckboxAnimationStatus");
}

function onSetSettingItems() {
    if (devMode === true){console.log("[SETTING] set les éléments du menu Paramètre");};
    selectSettingCommentModePlannedRef.value = userSetting.displayCommentPlannedMode;
    selectSettingCommentModeDoneRef.value = userSetting.displayCommentDoneMode;
    inputSettingIsAutoSaveRef.checked = userSetting.isAutoSaveEnabled;
    inputSettingSaveFrequencyRef.value = userSetting.autoSaveFrequency;
    inputCheckboxDevModeRef.checked = userSetting.devMode;
    selectSettingAgendaRef.value = userSetting.agenda;
    inputTimeSettingScheduleStartRef.value = userSetting.agendaScheduleStart;
    inputTimeSettingScheduleEndRef.value = userSetting.agendaScheduleEnd;
    selectSettingSessionCommentModeRef.value = userSetting.fromSessionToActivityMode;
    inputCheckboxAnimationStatusRef.checked = userSetting.animationEnabled;

    //set le texte d'exmple du mode d'affichage
    onChangeSettingSettionCommentMode(userSetting.fromSessionToActivityMode);

    // Set la date de la dernière sauvegarde auto
    document.getElementById("pSettingLastAutoSaveDate").innerHTML = userSetting.lastAutoSaveDate === "noSet" ? "Date Indisponible." : `Le ${onFormatDateToFr(userSetting.lastAutoSaveDate)} à ${userSetting.lastAutoSaveTime}`;
    
};



// Clique sur save Setting
function onClickSaveFromSetting() {
    onLockDivDoubleClick(["divBtnSetting","divSetting"]);//Sécurité clic

    // controle champ obligatoire pour sauvegarde automatique si activé
    if (devMode === true){console.log("[SETTING] controle des champs requis");};
    let emptyFieldSaveFrequency = onCheckEmptyField(inputSettingSaveFrequencyRef.value);
    
    if (inputSettingIsAutoSaveRef.checked === true && emptyFieldSaveFrequency === true) {
        if (devMode === true){console.log("[SETTING] Champ obligatoire 'frequence save' non remplis");};
    
        inputSettingSaveFrequencyRef.classList.add("fieldRequired");
        onUnlockDivDoubleClick(["divBtnSetting","divSetting"]);//Sécurité clic retirée
        return
    };
    

    // Lancement de sauvegarde des paramètres uniquement si modifié
   // Création d'une liste de champs à comparer
    const fieldsToCompare = [
        { oldValue: userSetting.displayCommentDoneMode, newValue: selectSettingCommentModeDoneRef.value },
        { oldValue: userSetting.displayCommentPlannedMode, newValue: selectSettingCommentModePlannedRef.value },
        { oldValue: userSetting.isAutoSaveEnabled, newValue: inputSettingIsAutoSaveRef.checked },
        { oldValue: userSetting.autoSaveFrequency, newValue: inputSettingSaveFrequencyRef.value },
        { oldValue: userSetting.devMode, newValue: inputCheckboxDevModeRef.checked },
        { oldValue: userSetting.agenda, newValue: selectSettingAgendaRef.value},
        { oldValue: userSetting.agendaScheduleStart,  newValue: inputTimeSettingScheduleStartRef.value},
        { oldValue: userSetting.agendaScheduleEnd, newValue: inputTimeSettingScheduleEndRef.value},
        { oldValue: userSetting.fromSessionToActivityMode, newValue:selectSettingSessionCommentModeRef.value},
        { oldValue: userSetting.animationEnabled, newValue: inputCheckboxAnimationStatusRef.checked}
    ];

    // Vérification si une différence est présente
    // some s'arrete automatiquement si il y a une différence
    const updateDataRequiered = fieldsToCompare.some(field => field.oldValue != field.newValue);

    if (updateDataRequiered) {
        if (devMode) console.log("[SETTING] Informations des paramètres différentes : Lancement de l'enregistrement");
        onSaveUserSetting();
    } else {
        if (devMode) console.log("[SETTING] Aucune modification de paramètre nécessaire !");
        onLeaveMenu("Setting");
    }
};


// Fonction de préparation de sauvegarde des setting dans la bdd
function onSaveUserSetting() {

    // Met tous les éléments des inputs dans la variable userSetting
    userSetting.displayCommentDoneMode = selectSettingCommentModeDoneRef.value;
    userSetting.displayCommentPlannedMode = selectSettingCommentModePlannedRef.value;
    userSetting.isAutoSaveEnabled = inputSettingIsAutoSaveRef.checked;
    userSetting.autoSaveFrequency = inputSettingSaveFrequencyRef.value;
    userSetting.devMode = inputCheckboxDevModeRef.checked;
    userSetting.agenda = selectSettingAgendaRef.value;
    userSetting.agendaScheduleStart = inputTimeSettingScheduleStartRef.value;
    userSetting.agendaScheduleEnd = inputTimeSettingScheduleEndRef.value;
    userSetting.fromSessionToActivityMode = selectSettingSessionCommentModeRef.value;
    userSetting.animationEnabled = inputCheckboxAnimationStatusRef.checked;


    // Met a jour le boolean devMode
    devMode = userSetting.devMode;

    // demande d'actualisation du mode d'affichage selon les paramètres
    onUpdateCSSDisplayMode();

    // Sauvegarde dans la base
    if (devMode === true){
        console.log("[SETTING] mise à jour de userSetting");
        console.log( "[SETTING] demande de sauvegarde des setting dans la base ");
    };
    eventSaveSetting(userSetting);
};


// Sequence de sauvegarde des paramètres
async function eventSaveSetting(newSetting){
    
    // Sauvegarde la modification
    await updateDocumentInDB(settingStoreName, (doc) => {
        doc.data = newSetting;
        return doc;
    });
    


    // Popup notification
    onShowNotifyPopup("saveSetting");
    // ferme le menu
    onLeaveMenu("Setting");
}




function onSearchCommentClassNameByMode(mode) {
    let cssClassTarget = "";
    // Choisit la nouvelle classe
    switch (mode) {
        case "Collapse":
            cssClassTarget = "item-data-comment-collapse";
            break;
        case "Compact":
            cssClassTarget = "item-data-comment-compact";
            break;
        case "Expand":
            cssClassTarget = "item-data-comment-expand";
            break;
    
        default:
            break;
    }

    return cssClassTarget;
}







// Mode d'affichage commentaire
function onUpdateCSSDisplayMode(){
    
    if (devMode === true) {
        console.log("[SETTING] Actualisation des paramètres d'affichages");
    };

    // Set les nouvelles classe CSS
    currentCommentDoneClassName = onSearchCommentClassNameByMode(userSetting.displayCommentDoneMode);
    currentCommentPlannedClassName = onSearchCommentClassNameByMode(userSetting.displayCommentPlannedMode);
    

    // Récupère tous les éléments avec le tag "planifié"
    const activitiesPlannedTargetArray = document.querySelectorAll(`[data-type=planifie]`);

    activitiesPlannedTargetArray.forEach(e=>{
        // utilisation de className pour supprimer toutes les class d'avant
        e.className = currentCommentPlannedClassName;
    });

    // Récupère tous les éléments avec le tag "done"
    const activitiesDoneTargetArray = document.querySelectorAll(`[data-type=effectue]`);

    activitiesDoneTargetArray.forEach(e=>{
        // utilisation de className pour supprimer toutes les class d'avant
        e.className = currentCommentDoneClassName;
    });

    if (devMode === true) {
        console.log("[SETTING] Mise à jour du CSS de la page selon le mode");
    };

}


// enleve l'alerte l'input de frequence d'activité si un changement est constaté
function onDataInSettingSaveFrequencyChange(){
    if (inputSettingSaveFrequencyRef.classList.contains("fieldRequired")) {
        inputSettingSaveFrequencyRef.classList.remove("fieldRequired");
    }

}





// Fonction pour empécher les conflits d'heure de début et de fin pour l'agenda
function onCheckAgendaNotifyTime() {

    // Si l'heure de fin est avant l'heure de début, on la met à jour
    if (inputTimeSettingScheduleEndRef.value < inputTimeSettingScheduleStartRef.value) {
        inputTimeSettingScheduleEndRef.value = inputTimeSettingScheduleStartRef.value;
    }

    // empêche de choisir une heure de fin antérieure à l'heure de début
    inputTimeSettingScheduleEndRef.min = inputTimeSettingScheduleStartRef.value;
}


function onCheckEndSchedule() {

    // Si l'heure de fin est avant l'heure de début, on la met à jour
    if (inputTimeSettingScheduleEndRef.value < inputTimeSettingScheduleStartRef.value) {
        inputTimeSettingScheduleEndRef.value = inputTimeSettingScheduleStartRef.value;
    }

}






function onResetSettingItems() {
    // Retire la class css field required au cas ou pour l'input saveFrequency
    inputSettingSaveFrequencyRef.classList.remove("fieldRequired");
}







// Session
function onChangeSettingSettionCommentMode(value) {
    
    switch (value) {
        case "MINIMAL":
            pSettingSessionCommentModeExempleRef.innerHTML = "Tractions: 36";

            break;
        case "NORMAL":
            pSettingSessionCommentModeExempleRef.innerHTML = "Tractions: 36 (Séries: 3*12 rép.)";

            break;
        case "COMPLETE":
            pSettingSessionCommentModeExempleRef.innerHTML = "Tractions: 36 (Séries :3/5 - 12 Rép.)";

            break;

        case "SERIES":
            pSettingSessionCommentModeExempleRef.innerHTML = "Tractions: 4*12";
            
            break;
        default:
            break;
    }
}







// Retour depuis Setting
function onClickReturnFromSetting() {
    onResetSettingItems();

    // ferme le menu
    onLeaveMenu("Setting");
};