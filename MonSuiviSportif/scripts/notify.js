
// Tableau des notifications

let notifyTextArray = {
    delete : {emoji : "🗑️",text: "Activité supprimée !"},
    creation : {emoji : "👌",text: "Activité créée !"},
    modification : {emoji : "🛠️",text: "Activité modifiée !"},
    saveprofil : {emoji : "👤",text: "Profil sauvegardé !"},
    exportSuccess : {emoji : "🗂️",text: "Données exportées !"},
    importSuccess : {emoji : "🗂️",text: "Données importées"},
    saveSetting : {emoji : "🛠️",text: "Paramètres modifiés !"},
    templateCreation :{emoji : "👌",text: "Modèle créé !"},
    templateModification : {emoji : "🛠️",text: "Modèle modifié !"},
    templateDeleted : {emoji : "🗑️",text: "Modèle supprimé !"},
    counterCreated : {emoji : "👌",text: "Compteur créé !"},
    chronoCreated : {emoji : "⏱️",text: "Chrono créé !"},
    minuteurCreated : {emoji : "⏳",text: "Minuteur créé !"},
    itemSessionDeleted : {emoji : "🗑️",text: "Elément supprimé !"},
    counterTargetReach : {emoji : "💪",text: "Compteur validé !"},
    minuteurTargetReach : {emoji : "⏳",text: "Minuteur validé !"},
    sessionReset : {emoji : "♻️​",text: "Séance réinitialisée !"},
    activityGenerated : {emoji : "👌",text: "Activité générée !"},
    inputIncrementEmpty : {emoji : "❗",text: "Valeur manquante !"},
    inputDateRequired : {emoji : "❗",text: "Date manquante !"},
    inputTitleRequired : {emoji : "❗",text: "Titre manquant !"},
    planningModified : {emoji :"🛠️" ,text: "Planning modifié !"},
    purgeOK : {emoji :"🗑️" ,text: "Purge effectuée !"},
    itemRestaured : {emoji : "♻️​",text: "Elément restauré !"},
    noteSaved : {emoji : "👌​",text: "Note sauvegardée !"},
    noteDeleted : {emoji : "🗑️​",text: "Note supprimée !"},
    restaurationforbidden : {emoji : "❗",text: "Nombre maximale atteind"},
    recupTargetReach : {emoji : "💪",text: "C'est reparti !"},
    memorySaved : {emoji : "🏅",text: "Evènement ajouté !"},
    memoryDeleted : {emoji : "🗑️",text: "Evènement supprimé !"},
    objectifCreated : {emoji :"🎯",text: "Objectif ajouté !"},
    objectifModified : {emoji :"🎯",text: "Objectif modifié !"},
    objectifDeleted : {emoji : "🗑️",text: "Objectif supprimé !"},
    evaluationModify : {emoji: "💪",text:"Evaluation sauvegardée !"},
    clearCorbeille : {emoji : "🗑️",text: "Corbeille vidée !"}
};





let animationDuration = 2000;//durée de l'animation

// Popup de notification 
function onShowNotifyPopup(key) {
    let divPopup = document.getElementById("popupNotify");
    divPopup.style.zIndex = "999";

    //emojie
    let popupImgRef = document.getElementById("divNotifyPopupEmoji");
    popupImgRef.textContent = notifyTextArray[key].emoji;

    // Texte
    let popupTextRef = document.getElementById("spanPopupNotifyText");
    popupTextRef.textContent = notifyTextArray[key].text;

    divPopup.classList.add('show');
    setTimeout(() => {
        divPopup.classList.remove('show');

        divPopup.style.zIndex = "10";//pour le pas géner l'accès au champ "rechercher"
    }, animationDuration); // Cache le popup après 3 secondes
};







// -------------------------------------- MOBILE NOTIFICATION -------------------------------------------------------



// Gestion des éléments DOM
let pMobileNotifyStatusRef = document.getElementById("pMobileNotifyStatus"),
    rewardsKeyArrayToNotifyCue = [],//tableau vidé par la boucle de notification au fur et à mesure
    isMobileNotifyInProgress = false; // pour ne pas lancer la boucle en doublon si traitement en cours



// Fonction utilitaire pour accéder au plugin de notifications en toute sécurité
const getLocalNotificationsPlugin = () => {
    return window.Capacitor?.Plugins?.LocalNotifications || null;
};
const LocalNotifications = getLocalNotificationsPlugin();


// Demande l'autorisation pour les notifications
async function requestNotificationPermission() {

    if (!LocalNotifications) return; // ou gérer proprement l'absence

    const permission = await LocalNotifications.requestPermissions();
    localStorage.setItem('MSS_notifyPermission', permission.display); // "granted" ou "denied"

    if (devMode) console.log("[NOTIFY] Permission accordée : ", permission.display);

    updateStatusDisplay();
    return permission.display;
}



function sendRewardMobileNotify(title, body) {
    if (!LocalNotifications) return; // ou gérer proprement l'absence

    const customID = getSafeNotificationId();

    LocalNotifications.schedule({
        notifications: [
            {
                title: title,
                body: body,
                id: customID, // un ID unique
                channelId: "default", 
                sound: "default", 
                smallIcon: "ic_stat_icon_config", 
                // largeIcon: "Icons/notifyRewardsColor192.png", 
            }
        ]
    }).then(() => {
        if (devMode) console.log("[NOTIFY] Notification envoyée : ", title);
    });
}


function onReceiveNotifyMobileEvent(rewardsKeysArray) {
    if (localStorage.getItem('MSS_notifyPermission') === 'granted') {
        
        // Ajout des nouvelles notifications dans la file d'attente
        rewardsKeyArrayToNotifyCue.push(...rewardsKeysArray);

        // Ne lance la boucle de traitement que si elle n'est pas encours
        // Car sinon juste le fait d'alimenter l'arret ci-dessus suffit à la faire continuer son traitement
        if (!isMobileNotifyInProgress) {
            // Lancement de la boucle de traitement
            if (devMode === true){console.log(" [NOTIFY] [MOBILE] Lancement de la boucle de traitement. Activation du boolean");};
            isMobileNotifyInProgress = true;
            onTraiteMobileNotify(); 
        }
        

    } else if (localStorage.getItem('MSS_notifyPermission') === 'denied') {
        if (devMode === true){console.log(" [NOTIFY] [MOBILE] Notification NON autorisées ! ");};
        return
    } else{
        eventFirstMobileNotify(rewardsKeysArray);
    }
};



// première notification mobile
const eventFirstMobileNotify = async (rewardsKeysArray) => {

    if (devMode === true){console.log(" [NOTIFY] [MOBILE] première notication.");};

    // Première récompense
    const permission = await requestNotificationPermission();
    if (permission === 'granted') {
        // Ajout des nouvelles notifications dans la file d'attente
        rewardsKeyArrayToNotifyCue.push(...rewardsKeysArray);
        if (devMode === true){console.log(" [NOTIFY] [MOBILE] Lancement de la boucle de traitement. Activation du boolean");};
        isMobileNotifyInProgress = true;
        onTraiteMobileNotify();
    }
};


function onTraiteMobileNotify() {

    const rewardKey = rewardsKeyArrayToNotifyCue[0];

    //tente de récupére dans l'un ou l'autre pour savoir c'est dans lequel
    const reward = allRewardsObject[rewardKey];
    const specialReward = allSpecialEventsRewardsObject[rewardKey];

    //Si dans aucun des deux, erreur
    if (!reward && !specialReward) {
        console.error("ERREUR REWARDS :", rewardKey);
        return;
    }

    if (devMode) console.log("[NOTIFY] [MOBILE] [REWARD] reward existant");

    // Si dans reward //sinon
    if (reward) {
        sendRewardMobileNotify(`🏆 ${reward.text.notify}`);
    } else {
        sendRewardMobileNotify("⭐ SPECIAL EVENT ⭐", specialReward.title);
    }

    // Retire l'index zero de la file d'attente
    rewardsKeyArrayToNotifyCue.shift();

    if (devMode) {
        console.log("[NOTIFY] [MOBILE] Traitement pour", rewardKey);
        console.log("[NOTIFY] [MOBILE] File d'attente :", rewardsKeyArrayToNotifyCue);
    }

    setTimeout(() => {

        if (rewardsKeyArrayToNotifyCue.length > 0) {
            onTraiteMobileNotify();
        } else {
            if (devMode) console.log("[NOTIFY] [MOBILE] fin de traitement. Libération du boolean");
            isMobileNotifyInProgress = false;
        }

    }, 2000);
}

//Boucle de traitement des notifications mobiles REWARDS
function onTraiteMobileNotify_old() {
    // index zero de la file d'attente
    let rewardKey = rewardsKeyArrayToNotifyCue[0];



    //Je m'assure que le reward existe dans un des deux objets
    if (Object.keys(allRewardsObject).includes(rewardKey) || Object.keys(allSpecialEventsRewardsObject).includes(rewardKey)){
        if (devMode === true){console.log("[NOTIFY] [MOBILE] [REWARD] reward existant");};
    }else{
        console.error("ERREUR REWARDS : ",rewardKey);
        return
    }

    // Recherche dans quel objet se trouve la récompense (standard ou spécial)
    let isStandartReward = Object.keys(allRewardsObject).includes(rewardKey);

    if (isStandartReward) {
        sendRewardMobileNotify(`🏆 ${allRewardsObject[rewardKey].text.notify}`);
    }else{
        sendRewardMobileNotify("⭐ SPECIAL EVENT ⭐", allSpecialEventsRewardsObject[rewardKey].title);
    };

    
    // Retire l'index zero de la file d'attente
    rewardsKeyArrayToNotifyCue.shift();

    if (devMode === true){
        console.log("[NOTIFY] [MOBILE] Traitement pour " + rewardKey);
        console.log("[NOTIFY] [MOBILE] File d'attente :" + rewardsKeyArrayToNotifyCue);
    };
    

    setTimeout(() => {
        if (rewardsKeyArrayToNotifyCue.length > 0) {            
            onTraiteMobileNotify();
        } else {
            if (devMode === true){console.log("[NOTIFY] [MOBILE] fin de traitement. Libération du boolean");};
            isMobileNotifyInProgress = false;
        }
    }, 2000);
}



// Verification des notifications mobile au démarrage
function onInitMobileNotify() {
    if (!window.Capacitor || !window.Capacitor.Plugins?.LocalNotifications) {
        pMobileNotifyStatusRef.textContent = 'Notifications non disponibles';
        return;
    }

    const savedPermission = localStorage.getItem('MSS_notifyPermission');
    if (devMode) console.log("[NOTIFY] Permission sauvegardée :", savedPermission);

    // Création d'un channel
    LocalNotifications.createChannel({
        id: "default",
        name: "Notifications par défaut",
        importance: 5 // HIGH
    });

    updateStatusDisplay();
}



// Met à jour l'état affiché à l'utilisateur
function updateStatusDisplay() {
    const permission = localStorage.getItem('MSS_notifyPermission') || 'default';

    if (permission === 'granted') {
        pMobileNotifyStatusRef.textContent = 'Activées';
    } else if (permission === 'denied') {
        pMobileNotifyStatusRef.textContent = 'Refusées';
    } else {
        pMobileNotifyStatusRef.textContent = 'Non configurées';
    }
}






// * *  *   *   *   *   * ICS   *   *   **  *   *   *   *   







function onClickAddToCalendar(keyRef) {
    let activityTarget = allUserActivityArray[keyRef];

    switch (userSetting.agenda) {
        case "NONE":
            alert("Veuillez sélectionner un agenda dans 'Paramètres.'");
            break;
        case "GOOGLE":
            let urlGoogle = generateGoogleCalendarLink(activityTarget);
            window.open(urlGoogle, "_blank"); 
            break;
        case "OUTLOOK":
            let urlOutlook = generateOutlookCalendarLink(activityTarget);
            window.open(urlOutlook,"_blank");
            break;
    
        default:
            break;
    }

}







// GENERATION GOOGLE URL
function generateGoogleCalendarLink(activityTarget) {

    let title = activityChoiceArray[activityTarget.name].displayName,
        description = activityTarget.comment,
        location = activityTarget.location,
        dateFormated = activityTarget.date.replaceAll("-","");
        scheduleStartFormated = userSetting.agendaScheduleStart.replaceAll(":","");
        scheduleEndFormated = userSetting.agendaScheduleEnd.replaceAll(":","");

    description = description + "<br> <br>Mon Suivi Sportif.";//signature

    let dateStart = `${dateFormated}T${scheduleStartFormated}00`,
        dateEnd = `${dateFormated}T${scheduleEndFormated}00`;

    


    return `https://calendar.google.com/calendar/render?action=TEMPLATE` +
           `&text=${encodeURIComponent(title)}` +
           `&details=${encodeURIComponent(description)}` +
           `&location=${encodeURIComponent(location)}` +
           `&dates=${dateStart}/${dateEnd}` +
           `&trp=true`;
}



// GENERATION OUtLOOK URL
function generateOutlookCalendarLink(activityTarget) {

    let title = activityChoiceArray[activityTarget.name].displayName,
        description = convertLineBreaksForOutlook(activityTarget.comment),
        location = activityTarget.location;

    description = description + "<br> <br>Mon Suivi Sportif.";//signature

    let dateStart = `${activityTarget.date}T${userSetting.agendaScheduleStart}:00`,
        dateEnd = `${activityTarget.date}T${userSetting.agendaScheduleEnd}:00`;


    return `https://outlook.live.com/calendar/0/deeplink/compose?` +
           `subject=${encodeURIComponent(title)}` +
           `&body=${encodeURIComponent(description)}` +
           `&location=${encodeURIComponent(location)}` +
           `&startdt=${dateStart}` +
           `&enddt=${dateEnd}` +
           `&allday=false`;
}



function convertLineBreaksForOutlook(description) {
    return description.replace(/\n/g, "<br>"); // Remplace les retours à la ligne par %0D%0A
}









//crée un id spécifique pour les notifications :
//doit être court et number
const usedNotificationIds = new Set();

function getSafeNotificationId() {
    let id;
    do {
        id = Math.floor(Math.random() * 1000000); // Génère un ID entre 0 et 999999
    } while (usedNotificationIds.has(id));
    usedNotificationIds.add(id);
    return id;
}





window.addEventListener('DOMContentLoaded', () => {
    // initialisation lorsque tout est chargé
    onInitMobileNotify(); 
});