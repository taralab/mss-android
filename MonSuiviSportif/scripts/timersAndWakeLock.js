//timersInUseID
function onUpdateSessionTimersInUseIDInStorage() {
    localStorage.setItem(timersInUserStorageName,  JSON.stringify(timersInUseID));

    if (devMode === true){
        console.log(localStorage.getItem(timersInUserStorageName));
    }
}


function onGetSessionTimersInUseIDInStorage() {
    const storedValue = localStorage.getItem(timersInUserStorageName);
    if (devMode === true){
        console.log(storedValue);
    }
    if (storedValue !== null) {
        timersInUseID = {};
        timersInUseID = JSON.parse(storedValue);
    }
}








// ------------------------ fonction du WAKE LOCK------------------------------------





let wakeLockInstance = null;

//utilisation d'un seul élément de timer par type
//identifier par son ID car seule l'id concerné peut l'arréter
let timersInUseID = {
    chrono : null,
    minuteur: null,
    recup : null
};


async function eventGestionTimer(typeTarget,value) {
        
    //set la valeur dans le gestionnaire des timers (ID ou null)
    timersInUseID[typeTarget] = value;

    //sauvegarde l'état de timerInUseID
    onUpdateSessionTimersInUseIDInStorage();

    //est ce qu'un timer est encore en cours
    let isTimerAlreadyInUse = onCheckIfTimerInUse();
    
    //ensuite demande un release ou un request du wakelock selon

    //si set un null et plus de timer en cours
    if (value === null && !isTimerAlreadyInUse) {
        //demande un arret du wakeLock
        await releaseWakeLock();
    }else{
        //demande un lancement du wakeLock
        await requestWakeLock();
    }



    //log
    if (devMode === true){
        let logText = value === null ? "Liberation" : "Verrouillage";
        console.log(`Event Timers. Demande de ${logText} du ${typeTarget} avec valeur : ${value}`);
        console.log(timersInUseID);
        if (wakeLockInstance) {
            console.log("Statut du wakeLock : Activé !");
        }else{
            console.log("Statut du wakeLock : Désactivé !");
        }
    }
}

async function requestWakeLock() {

    //control si déjà en cours ne fait rien

    if (devMode === true){
        if(wakeLockInstance){
            console.log("Request wakeLock :  déjà activé");
            return
        }else{
            console.log("Request wakeLock : Désactivé; Demande d'activation");
        }
    }

    try {
        if ('wakeLock' in navigator) {
            wakeLockInstance = await navigator.wakeLock.request('screen');
            if (devMode ===true){console.log("[SESSION] ✅ Wake Lock activé");}

            // Surveille si le Wake Lock est libéré automatiquement (ex: onglet inactif)
            wakeLockInstance.addEventListener('release', () => {
                onLooseWakeLock();
            });
        } else {
            console.warn("[SESSION] ❌ Wake Lock non pris en charge par ce navigateur");
        }
    } catch (err) {
        console.error("[SESSION] ❌ Erreur lors de l'activation du Wake Lock :", err);
    }


}



//Lorsque le wakeLock est perdu tout seul (exemple change d'appli, ou passe en arrière plan)
function onLooseWakeLock(){
    if (devMode ===true){console.log("[SESSION] ⚠️ Wake Lock libéré automatiquement");}
    //vide l'instance du wakeLock
    wakeLockInstance = null;

}





//lorsque le wake Lock est arrété manuellement
async function releaseWakeLock() {
    try {
        if (wakeLockInstance) {
            await wakeLockInstance.release();
            wakeLockInstance = null;
            if (devMode ===true){console.log("[SESSION] 🔓 Wake Lock désactivé manuellement");}
        }else{
            if (devMode ===true){console.log("[SESSION] 🔓 Wake Lock déjà désactivé");}
        }
    } catch (err) {
        console.error("[SESSION] ❌ Erreur lors de la libération du Wake Lock :", err);
    }
}



//surveillance pour reprise automatique du wakelock si l'utilisateur change d'application
async function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
        //vérifie si besoin notification pour l'evaluation mensuel
        onCheckPopupEvaluationNotify();

        //vérifie si un timer est toujours en cours d'utilisation
        let isTimerAlreadyInUse = onCheckIfTimerInUse();

        if (isTimerAlreadyInUse && !wakeLockInstance) {
            try {
                await requestWakeLock();
                if (devMode ===true){console.log("[SESSION] Reprise automatique du wakeLock");}
            } catch (err) {
                console.warn("[SESSION] Échec du Wake Lock :", err);
            }
        }
    }
}




//Lancement séquence timer et wakeLock depuis APP

function eventInitTimersAndWakeLock() {
    //ajout l'écouteur d'évènement pour le wakeLock 
    document.addEventListener("visibilitychange", handleVisibilityChange);
    console.log("[TIMERS] Ajout Ecouteur visibilitychange pour wakeLock");


    //chargement ou création du STORE pour timerIn Use
    if (localStorage.getItem(timersInUserStorageName) === null) {
        console.log("[LOCAL STORAGE] Création du  store MSS_timersInUseID");
        onUpdateSessionTimersInUseIDInStorage();
    }else{
        console.log("[LOCAL STORAGE] Le store MSS_timersInUseID existe : Chargement");
        onGetSessionTimersInUseIDInStorage();
    }


    //chargement ou création du STORE pour itemSessionList
    if (localStorage.getItem(sessionStorageName) === null) {
        console.log("[LOCAL STORAGE] Création du  store MSS_sessionCounterList");
        onUpdateSessionItemsInStorage();
    }else{
        console.log("[LOCAL STORAGE] Le store MSS_sessionCounterList existe : Chargement");
        getSessionItemListFromLocalStorage();
    }


    //traitement minuteur mal arrété
    onCheckInitialMinuteurStatus();

}




//vérification si un minuteur à été mal arrété
//ex : arret sauvage de l'app. le retire de timerInUseID et le remet à sa position de départ

function onCheckInitialMinuteurStatus() {
    //si un minuteur était en cours d'utilisation
    if (timersInUseID.minuteur !== null) {

        if (devMode === true){
            console.log("[TIMER] Minuteur mal arrété. Demande de réinitialisation");
            console.log(timersInUseID.minuteur);
        }
        //récupère l'id du minuteur en question
        const minuteurID = timersInUseID.minuteur;

        //Si il est encore présent dans la liste des items session
        if (userSessionItemsList[minuteurID]) {
            //le réinitialise et sauvegarde son état
            const initialDuration = userSessionItemsList[minuteurID].duration;
            onSaveMinuteurState(minuteurID,false,initialDuration,false);
        }

        //retire de la gestion des timers
        eventGestionTimer("minuteur",null);
       
    }
}