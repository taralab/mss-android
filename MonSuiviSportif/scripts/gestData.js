
let currentExportVersion = 9;//version actuel des fichers d'import/export

function onOpenMenuGestData() {
    //Création main menu
    onCreateMainMenuGestData();

    // Set la version du fichier d'import autorisé
    document.getElementById("pGestDataVersionImportAccepted").innerHTML = `V${currentExportVersion}`;

    //Set la date de la dernière sauvegarde manuelle
    document.getElementById("pGestDataLastExportDate").innerHTML = userSetting.lastManualSaveDate === "noSet" ? "Date dernier export : Indisponible." : `Date dernier export : le ${onFormatDateToFr(userSetting.lastManualSaveDate)} à ${userSetting.lastManualSaveTime}`;

    //vide le texte résultat purge
    document.getElementById("pResultPurgeTAG").innerHTML = "";

    //affiche le compte des sauvegardes locales
    onCountBackupFiles();

    //Ajoute évènement
    onAddEventListenerForGestDataMenu();
    onAddEventListenerForConfirmDeleteBdD();


    if (devMode === true) {
        onConsoleLogEventListenerRegistry();
    }



};

// Génération du menu principal
function onCreateMainMenuGestData() {
    // Vide le précedent contenut
    let divMainMenuParentRef = document.getElementById("divMainBtnMenu");
    divMainMenuParentRef.innerHTML = "";

    //crée les boutons
    //Retour
    new Button_main_menu(btnMainMenuData.return.imgRef,btnMainMenuData.return.text,() => onClickReturnFromGestData());

}
   

// ----------------------------Ecouteur evènement ----------------------------------------


function onAddEventListenerForGestDataMenu() {
    if (devMode === true){
        console.log("[EVENT-LISTENER] : Ajoute les évènements pour Gest DATA");
    };



    //bouton export local
    let locExportBtnRef = document.getElementById("btnExportBdDInLocal");
    const onClickExportLocal = () => sequenceExportLocal();
    locExportBtnRef.addEventListener("click",onClickExportLocal);
    onAddEventListenerInRegistry("gestData",locExportBtnRef,"click",onClickExportLocal);


    //bouton export local et drive
    let locExportCloudRef = document.getElementById("btnExportBdDInCloud");
    const onClickExportAndShare = ()=> sequenceExportAndShare();
    locExportCloudRef.addEventListener("click",onClickExportAndShare);
    onAddEventListenerInRegistry("gestData",locExportCloudRef,"click",onClickExportAndShare);

    //bouton import
    let locImportBtnRef = document.getElementById("btnImportBdD");
    const onclickImport = () => eventImportBdD('fileInputJsonTask');
    locImportBtnRef.addEventListener("click",onclickImport);
    onAddEventListenerInRegistry("gestData",locImportBtnRef,"click",onclickImport);

    //Bouton suppression
    let locDeleteBtnRef = document.getElementById("btnDeteteBdd");
    const onClickDeteleBdD = () => onClickDeleteDataBaseFromGestData();
    locDeleteBtnRef.addEventListener("click",onClickDeteleBdD);
    onAddEventListenerInRegistry("gestData",locDeleteBtnRef,"click",onClickDeteleBdD);

    //Bouton purge sauvegarde
    let locPurgeBtnRef = document.getElementById("btnPurgeLocalBackup");
    const onClickPurge = () => sequencePurgeBackupFiles();
    locPurgeBtnRef.addEventListener("click",onClickPurge);
    onAddEventListenerInRegistry("gestData",locPurgeBtnRef,"click",onClickPurge);

    //Bouton purge TAG

    let btnPurgeTAGRef = document.getElementById("btnPurgeTAG");
    const onClickPurgeTag = () => onPurgeTAG();
    btnPurgeTAGRef.addEventListener("click",onClickPurgeTag);
    onAddEventListenerInRegistry("gestData",btnPurgeTAGRef,"click",onClickPurgeTag);

}


function sequenceExportLocal() {
    eventActivateGestDataBtn("btnExportBdDInLocal");
    eventSaveData(false,false);
}

function sequenceExportAndShare() {
    eventActivateGestDataBtn("btnExportBdDInCloud");
    eventSaveData(false,true);
}

function sequencePurgeBackupFiles() {
    eventActivateGestDataBtn("btnPurgeLocalBackup");
    eventPurgeBackupFiles();
}


// Evènement pour confirmation suppression
function onAddEventListenerForConfirmDeleteBdD() {
    if (devMode === true){
        console.log("[EVENT-LISTENER] : Ajoute les évènements pour confirmation delete bdd");
    };

    //Div pour annulation
    let locDivAnnulationRef = document.getElementById("divConfirmDeleteDataBase");
    const onCancelDelete = (event)=>onCancelDeleteDataBase(event);
    locDivAnnulationRef.addEventListener("click",onCancelDelete);
    onAddEventListenerInRegistry("gestDataConfirmDelete",locDivAnnulationRef,"click",onCancelDelete);

    //bouton confirmation
    let locBtnConfirmDeleteRef = document.getElementById("btnConfirmDeleteDataBase");
    const onConfirmDelete = (event) => onConfirmDeleteDataBase(event);
    locBtnConfirmDeleteRef.addEventListener("click",onConfirmDelete);
    onAddEventListenerInRegistry("gestDataConfirmDelete",locBtnConfirmDeleteRef,"click",onConfirmDelete);
}







// -------------------------------------- #PURGE ------------------------








async function eventPurgeBackupFiles() {

    //lance la purge
    await onPurgeBackupFiles();
    //actualise l'affichage du nouveau nombre en direct
    await onCountBackupFiles();
}

//liste le nombre de sauvegarde
async function onCountBackupFiles() {
    const { Filesystem} = Capacitor.Plugins;


    try {
        const result = await Filesystem.readdir({
        path: '',
        directory: 'DOCUMENTS',
    });

    // Filtrer les fichiers JSON qui commencent par MSS_
    const backupFiles = result.files.filter(file =>
        file.name.startsWith('MSS_') && file.name.endsWith('.json')
    );

    const count = backupFiles.length;
    console.log(`📦 Nombre de sauvegardes : ${count}`);

    // Affichage dans l'app
    const countDisplay = document.getElementById("pLocalBackupCount");
    if (countDisplay) {
      countDisplay.textContent = `${count}`;
    }

    return count;
  } catch (err) {
    console.error("❌ Impossible de compter les fichiers :", err);
    return 0;
  }
}


// Suppression des anciennes sauvegarde ne conserve que le plus récent
async function onPurgeBackupFiles() {
    const { Filesystem } = Capacitor.Plugins;
    try {
        const result = await Filesystem.readdir({
        path: '',
        directory: 'DOCUMENTS',
    });


    // Filtrer les fichiers JSON de sauvegarde MSS_
    const backupFiles = result.files.filter(file =>
      file.name.startsWith('MSS_') && file.name.endsWith('.json')
    );

    if (backupFiles.length <= 1) {
      alert("ℹ️ Rien à purger (0 ou 1 fichier disponible).");
      return;
    }

    // Trier les fichiers par nom décroissant (le plus récent en premier)
    const sorted = backupFiles.sort((a, b) => b.name.localeCompare(a.name));

    // Garder le plus récent
    const filesToDelete = sorted.slice(1); // tout sauf le premier

    for (const file of filesToDelete) {
        await Filesystem.deleteFile({
            path: file.name,
            directory: 'DOCUMENTS',
        });
      console.log(`🗑️ Supprimé : ${file.name}`);
    }
    onShowNotifyPopup("purgeOK");

    console.log("✅ Nettoyage terminé. Dernière sauvegarde conservée :", sorted[0].name);
  } catch (err) {
    console.error("❌ Erreur lors de la purge des sauvegardes :", err);
  }
}



// Fonction de suppression des fichiers de sauvegardes
async function onDeleteAllBackupFiles() {
  const { Filesystem } = Capacitor.Plugins;
  try {
    const result = await Filesystem.readdir({
      path: '',
      directory: 'DOCUMENTS',
    });

    // Ne récupère que les fichiers qui commencent par "MSS_" et en format ".json"
    const backupFiles = result.files.filter(file =>
      file.name.startsWith('MSS_') && file.name.endsWith('.json')
    );

    if (backupFiles.length === 0) {
      console.log("Aucun fichier de sauvegarde à supprimer.");
      return;
    }

    // Supprime tout en une seule fois
    await Promise.all(
      backupFiles.map(file =>
        Filesystem.deleteFile({
          path: file.name,
          directory: 'DOCUMENTS',
        }).then(() => console.log(`🗑️ Supprimé : ${file.name}`))
      )
    );

    console.log("Suppression des sauvegardes ok");
  } catch (err) {
    console.error("Erreur lors de la suppression des sauvegardes :", err);
  }
}







// ---------------------     #EXPORT -------------------------------------







// Lors d'un export manual ou auto
// Step 1 sauvegarde de la date du jour dans setting
// Step 2 réinitialisation des chrono et minuteur avant export
// Step 3 lancement de export

// La date du jour pour l'export
let exportDate,
    exportTime,//format 00:00
    exportTimeFileName;//format 0000


async function eventSaveData(isAutoSave,isInCloud = false) {

    // Sauvegarde la date dans setting
    // Set la date du jour ainsi que l'heure
    exportDate = onFindDateTodayUS();

    // Set l'heure mais en retirant les ":" pour l'enregistrement du nom de fichier
    exportTime = onGetCurrentTime();
    exportTimeFileName = exportTime.replace(":","");


    if (devMode === true){
        console.log("[SAVE] Demande d'export des données");
        console.log("[SAVE] demande automatique ? : " + isAutoSave);
        console.log("[SAVE] sauvegarde de la date dans les setting");
    };

   

    if (isAutoSave) {
        userSetting.lastAutoSaveDate = exportDate;
        userSetting.lastAutoSaveTime = exportTime;
    }else{
        userSetting.lastManualSaveDate = exportDate;
        userSetting.lastManualSaveTime = exportTime;
    }

    // Enregistrement date/heure dans les paramètres
    // Sauvegarde la modification
    await updateDocumentInDB(settingStoreName, (doc) => {
        doc.data = userSetting;
        return doc;
    });


    // suite à enregistrement de la date, export des données
    await exportDBToJson(isAutoSave,isInCloud);
    eventSaveResult(isAutoSave);
}










async function exportDBToJson(isAutoSave,isInCloud = false) {

    const { Filesystem, Share } = Capacitor.Plugins;

    try {
        // 1. Récupération des données
        const result = await db.allDocs({ include_docs: true });
        const exportedDocs = result.rows
            .map(row => row.doc)
            .filter(doc => !doc._deleted); // on exclut les docs supprimés
            
        getSessionItemListFromLocalStorage();//récupère les sessions qui eux sont dans le local storage

        let formatedUserSessionItemsList = onResetSessionItemTimerForExport(userSessionItemsList);//réinitialise les timers avant export

        // 2. Création du contenu
        const fullExport = {
            formatVersion: currentExportVersion,
            documents: exportedDocs,
            userSessionItemsList: formatedUserSessionItemsList
        };

        // 2 bis. Ajout du bloc d'intégrité
        fullExport.__integrity = {
            exportComplete: true,
            timestamp: Date.now(),
            pseudo: userInfo?.pseudo || "anonymous"
        };



        const jsonData = JSON.stringify(fullExport, null, 2);

        // 3. Nom du fichier
        const fileName = isAutoSave
            ? `MSS_V${currentExportVersion}_AUTOSAVE_${exportDate}_${exportTimeFileName}.json`
            : `MSS_V${currentExportVersion}_${exportDate}_${exportTimeFileName}_${userInfo.pseudo}.json`;

        // 4. Écriture dans "Documents" (documents sandboxées. par le dossier document public de l'utilisateur)
        await Filesystem.writeFile({
            path: fileName,
            data: jsonData,
            directory: 'DOCUMENTS',
            encoding: 'utf8'
        });

        if (devMode === true) {
            console.log("✅ Fichier sauvegardé :", fileName);
        }
        

        // 5. Récupération de l'URI
        const fileUri = await Filesystem.getUri({
            directory: 'DOCUMENTS',
            path: fileName
        });


        // Sauvegarde dans le cloud
        if (isInCloud) {
            // 6. copie de nom de fichier dans le presse papier
            try {
                await navigator.clipboard.writeText(fileName);
                console.log("📋 Nom du fichier copié dans le presse-papiers :", fileName);
            } catch (clipErr) {
                console.warn("⚠️ Impossible de copier dans le presse-papiers :", clipErr);
            }
            // 7. Partage via boîte de dialogue
            await Share.share({
                title: "Exporter votre sauvegarde",
                text: "Voici le fichier de votre base de données.",
                url: fileUri.uri,
                dialogTitle: "Partager avec..."
            });
        }
        

        console.log("📤 Partage effectué !");
    } catch (err) {
        console.error("❌ Erreur pendant l’exportation/partage :", err);
    }
}




//fonction de réinitialisation des chrono et minuteur avant export

function onResetSessionItemTimerForExport(sessionItemList) {
    let formatedList = {},
        sessionKeysList = Object.keys(sessionItemList);

    //pour chaque item
    sessionKeysList.forEach(key =>{
        let itemTarget = { ...sessionItemList[key] };

        switch (itemTarget.type) {
            case "CHRONO":
                //reinitialise les parametres
                itemTarget.isRunning = false;
                itemTarget.startTimeStamp = null;    
                itemTarget.elapsedTime = 0
                break;
            case "MINUTEUR":
                //réinitialise les parametres
                itemTarget.isDone = false;
                itemTarget.isRunning = false;
                itemTarget.remainingTime = itemTarget.duration;
                itemTarget.targetTime = null;
                break;
        
            default:
                break;
        }

        //et envoie les éléments formaté dans un nouvel object
        formatedList[key] = itemTarget;
    });

    return formatedList;
}








// ----------------------------     #sauvegarde automatique     ----------------------------------










// Vérification condition autosave
async function onCheckAutoSaveCondition() {
    if (devMode === true) {
        console.log("[AUTOSAVE] Vérification des conditions de sauvegarde");
    }

    let isSaveRequired = false;

    // Si cookies last date est vide = AutoSAVE
    if (userSetting.lastAutoSaveDate === "noSet") {
        if (devMode === true) {
            console.log("[AUTOSAVE] date dans userSetting noSet, demande de sauvegarde");
        }
        isSaveRequired = true;
    } else {
        // Sinon, contrôle l'intervalle entre date du jour et date dernière sauvegarde
        isSaveRequired = compareDateAutoSave(userSetting.lastAutoSaveDate, userSetting.autoSaveFrequency);
    }

    return isSaveRequired;
}

// Fonction pour savoir si la date d'ancienne sauvegarde est encore valide ou non
function compareDateAutoSave(lastDateSave, frequency) {
    const d1 = new Date(lastDateSave);
    const d2 = new Date(); // Date actuelle

    if (isNaN(d1.getTime())) {
        console.error("[AUTOSAVE] La date de sauvegarde est invalide :", lastDateSave);
        return false; // Sortie pour éviter des comportements imprévisibles
    }

    const differenceMs = Math.abs(d2 - d1);
    const differenceEnJours = differenceMs / (1000 * 60 * 60 * 24);

    if (devMode === true) {
        console.log("[AUTOSAVE] Comparaison des dates");
        console.log("[AUTOSAVE] Date de dernière sauvegarde :", d1);
        console.log("[AUTOSAVE] Date du jour :", d2);
        console.log("[AUTOSAVE] Fréquence (jours) :", frequency);
        console.log("[AUTOSAVE] Différence en jours :", differenceEnJours);
    }

    return differenceEnJours >= frequency;
}





function eventSaveResult(isAutoSave){
    if (devMode === true) {console.log("[AUTOSAVE] Fin de sauvegarde, actualisation set la date au bon emplacement");};

    if (isAutoSave) {
        // Mise à jour du texte 
        document.getElementById("pSettingLastAutoSaveDate").innerHTML = `Le ${onFormatDateToFr(userSetting.lastAutoSaveDate)} à ${userSetting.lastAutoSaveTime}`;
    }else{
        // Mise à jour du texte
        document.getElementById("pGestDataLastExportDate").innerHTML = `Date dernier export : le ${onFormatDateToFr(userSetting.lastManualSaveDate)} à ${userSetting.lastManualSaveTime}`;
    }

    if (devMode === true) {
        console.log(userSetting);
    }

    // Notification
    onShowNotifyPopup("exportSuccess");

    // Met à jour le nombre de fichier en backup
    onCountBackupFiles();

};










// -------------------------------- #IMPORT -----------------------------------------------------









async function eventImportBdD(inputRef) {
    let isSaveVersionValid = true;
    const fileInput = document.getElementById(inputRef);
    let textResultRef = document.getElementById("pImportActivityResult");

    onSetLockGestDataButton(true);

    if (fileInput.files.length > 0) {
        textResultRef.innerHTML = "Veuillez patienter...";
        const selectedFile = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = async function (e) {
            const rawText = e.target.result;

            // Fonction d'attente
            const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

            // Vérifie l'intégrité du fichier avant de parser
            async function tryParseJsonWithIntegrity(text, maxAttempts = 3, delay = 2000) {
                for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                    if (
                        text.startsWith("{") &&
                        text.trim().endsWith("}") &&
                        text.includes('"__integrity":') &&
                        text.length > 100
                    ) {
                        try {
                            return JSON.parse(text);
                        } catch (e) {
                            console.warn(`[IMPORT] Tentative ${attempt} : JSON.parse échoué`);
                        }
                    }

                    if (attempt < maxAttempts) {
                        console.warn(`[IMPORT] Tentative ${attempt} échouée, nouvelle tentative dans ${delay}ms...`);
                        textResultRef.innerHTML = `Tentative d'import ${attempt} : Echec. Nouvelle tentative dans 2 secondes...`;
                        await wait(delay);
                    }
                }

                throw new Error("❌ Base inférieure à V3 non acceptée!");
            }

            try {
                const jsonData = await tryParseJsonWithIntegrity(rawText);

                // Détection du formatVersion (_v0 si inexistant = ancien format)
                const version = jsonData.formatVersion || 0;
                let importedDocs = [];
                let importedUserSessionItemsList = {};

                switch (version) {
                    case 0:
                        console.log("[IMPORT] V0 plus supporté");
                        isSaveVersionValid = false;
                        break;

                    case 1:
                        console.log("[IMPORT] V1 plus supporté");
                        isSaveVersionValid = false;
                        break;

                    case 2:
                        console.log("[IMPORT] V2 plus supporté : Ne contient pas de fichier d'intégration");
                        isSaveVersionValid = false;
                        break;

                    case 3:
                        console.log("[IMPORT] V3 plus supporté. Trop de changement depuis");
                        isSaveVersionValid = false;
                        break;

                    case 4:
                        //Le fichier V4 ne contient plus les éléments vraiment supprimé.
                        console.log("[IMPORT] V4 plus supporté. Trop de changement depuis");
                        isSaveVersionValid = false;
                        break;
                        
                    case 5:
                        //Le fichier V5 contient le nouveau STORE RECUP.
                        console.log("[IMPORT] V5 plus supporté. Trop de changement depuis");
                        isSaveVersionValid = false;
                        break;

                    case 6:
                        //Le fichier V6 contient le nouveau format de sessionItemsList pour les timers.
                        console.log("[IMPORT] V6 plus supporté. Trop de changement depuis");
                        isSaveVersionValid = false;
                        break;

                    case 7:
                        //Le fichier V7 contient le nouveau STORE MEMORY et affichage discret mode pour recup (12-2025).
                        console.log("[IMPORT] V7");
                        importedDocs = jsonData.documents || [];
                        importedUserSessionItemsList = jsonData.userSessionItemsList || {};
                        isSaveVersionValid = true;
                        break;

                    case 8:
                        //Le fichier V8 contient le nouveau STORE OBJECTIF. (05-02-2026)
                        console.log("[IMPORT] V8");
                        importedDocs = jsonData.documents || [];
                        importedUserSessionItemsList = jsonData.userSessionItemsList || {};
                        isSaveVersionValid = true;
                        break;

                    case 9:
                        //Le fichier V9 contient le nouveau STORE ALLTAGLIST, 
                        // les activités ont des TAG
                        // NOUVEAUX STORES POUR LES EVALUATIONS
                        console.log("[IMPORT] V9");
                        importedDocs = jsonData.documents || [];
                        importedUserSessionItemsList = jsonData.userSessionItemsList || {};
                        isSaveVersionValid = true;
                        break;

                    default:
                        throw new Error("⚠️ Format de fichier inconnu.");
                }

                if (!isSaveVersionValid) {
                    alert("Les sauvegardes inférieures à V7 ne sont plus autorisées dans l'application");
                    textResultRef.innerHTML = "Sauvegardes inférieures à V7 non autorisées !";
                    onSetLockGestDataButton(false);
                    return;
                }

                onDisplayTextDataBaseEvent(false);

                onDeleteLocalStorage();
                await deleteBase();

                db = new PouchDB(dbName, { auto_compaction: true });
                await db.info().then(info => console.log(' [DATABASE] Base créée/ouverte :', info));

                await onCreateDBStore();

                if (importedUserSessionItemsList) {
                    userSessionItemsList = importedUserSessionItemsList;
                    console.log('[IMPORT] userSessionItemsList restauré :', userSessionItemsList);
                    onUpdateSessionItemsInStorage();
                }

                await importBdD(importedDocs);

                textResultRef.innerHTML = "Importation réussie !";

            } catch (error) {
                console.error('[IMPORT] Erreur lors du traitement du fichier :', error);
                textResultRef.innerHTML = `Erreur d'importation : ${error.message}`;
                onSetLockGestDataButton(false);
            }
        };

        reader.readAsText(selectedFile);
    } else {
        console.error('[IMPORT] Aucun fichier sélectionné.');
        textResultRef.innerHTML = "Aucun fichier sélectionné !";
        onSetLockGestDataButton(false);
    }
}



// Action lors du succes d'un import
function eventImportDataSucess() {
    console.log("wait for reload");
    
    onShowNotifyPopup("importSuccess");
    setTimeout(() => {
        location.reload();
      }, "2000");
}




async function importBdD(dataToImport) {
    console.log("IMPORTBDD");

    // Récupère la taille pour traiter le texte de pourcentage 
    let totalDataToImport = dataToImport.length,
    pPercentImportTextRef = document.getElementById("pPercentImportText"),
    importPercentStep = Math.floor(totalDataToImport * 0.1), // 10% arrondi vers le bas
    importCount = 0;

    for (const e of dataToImport) {
        // ACTIVITE
        if (e.type === activityStoreName) {
            Object.assign(activityToInsertFormat, {
                name: e.name,
                date: e.date,
                location: e.location,
                distance: e.distance,
                duration: e.duration,
                comment: e.comment,
                createdAt: e.createdAt,
                isPlanned: e.isPlanned,
                tagList: e.tagList || []
            });
            await onInsertNewActivityInDB(activityToInsertFormat);

        // TEMPLATE
        }else if (e.type === templateStoreName){
            Object.assign(templateToInsertFormat, {
                title: e.title,
                activityName: e.activityName,
                location: e.location,
                distance: e.distance,
                duration: e.duration,
                comment: e.comment,
                isPlanned: e.isPlanned,
                tagList: e.tagList || []
            });
            await onInsertNewTemplateInDB(templateToInsertFormat);

        //REWARDS
        }else if (e.type === rewardsStoreName){
           await updateDocumentInDB(rewardsStoreName, (doc) => {
            doc.rewards = e.rewards;
            return doc;
        });

        //SPECIAL REWARDS
        }else if (e.type === specialRewardsStoreName){
           await updateDocumentInDB(specialRewardsStoreName, (doc) => {
            doc.specialRewards = e.specialRewards;
            return doc;
        });

        //TAG
        }else if (e.type === tagStoreName){
           await updateDocumentInDB(tagStoreName, (doc) => {
            doc.tagReferenciel = e.tagReferenciel;
            return doc;
        });

        //SETTING
        }else if (e.type === settingStoreName){
            let settingToUpdate = {};
            Object.assign(settingToUpdate, {
                agenda : e.data.agenda || defaultSetting.agenda,
                agendaScheduleStart: e.data.agendaScheduleStart || defaultSetting.agendaScheduleStart,
                agendaScheduleEnd: e.data.agendaScheduleEnd || defaultSetting.agendaScheduleEnd,
                displayCommentDoneMode: e.data.displayCommentDoneMode || defaultSetting.displayCommentDoneMode,
                displayCommentPlannedMode: e.data.displayCommentPlannedMode || defaultSetting.displayCommentPlannedMode,
                isAutoSaveEnabled: e.data.isAutoSaveEnabled ?? defaultSetting.isAutoSaveEnabled,
                lastAutoSaveDate: e.data.lastAutoSaveDate || defaultSetting.lastAutoSaveDate,
                lastAutoSaveTime: e.data.lastAutoSaveTime || defaultSetting.lastAutoSaveTime,
                lastManualSaveDate: e.data.lastManualSaveDate || defaultSetting.lastManualSaveDate,
                lastManualSaveTime: e.data.lastManualSaveTime || defaultSetting.lastManualSaveTime,
                autoSaveFrequency: e.data.autoSaveFrequency || defaultSetting.autoSaveFrequency,
                fromSessionToActivityMode : e.data.fromSessionToActivityMode || defaultSetting.fromSessionToActivityMode,
                devMode : e.data.devMode ?? defaultSetting.devMode,
                animationEnabled: e.data.animationEnabled ?? defaultSetting.animationEnabled,
                vibrationEnabled: e.data.vibrationEnabled ?? defaultSetting.vibrationEnabled,
                evaluationNotifyEnabled : e.data.evaluationNotifyEnabled ?? defaultSetting.evaluationNotifyEnabled
            });

            // Sauvegarde la modification
            await updateDocumentInDB(settingStoreName, (doc) => {
                doc.data = settingToUpdate;
                return doc;
            });

        //FAVORIS
        }else if (e.type === favorisStoreName){

           await updateDocumentInDB(favorisStoreName, (doc) => {
            doc.favorisList = e.favorisList;
            return doc;
        });
    

        // PROFILS 
        }else if (e.type === profilStoreName){
            Object.assign(userInfo,{
                pseudo : e.data.pseudo,
                customNotes : e.data.customNotes,
                conditionAccepted: e.data.conditionAccepted,
                updateNameList : e.data.updateNameList || []
            });
            
            //Sauvegarde
            await updateDocumentInDB(profilStoreName, (doc) => {
                doc.data = userInfo;
                return doc;
            });

        // TEMPLATE SESSION
        } else if (e.type === templateSessionStoreName){
            let newtemplateSession = {
                sessionName: e.sessionName,
                itemList : e.itemList
            };
            await onInsertNewTemplateSessionInDB(newtemplateSession);

        //PLANNING
        } else if (e.type === planningStoreName){
           await updateDocumentInDB(planningStoreName, (doc) => {
                doc.userPlanning = e.userPlanning;
                return doc;
            });

        //NOTES    
        } else if (e.type === noteStoreName){
            let newNoteToAdd = {
                title : e.title,
                detail: e.detail, 
                color: e.color,
                createdAt: e.createdAt,
                displayOrder: e.displayOrder
            };
            await onInsertnewNoteInDB(newNoteToAdd);

        // RECUP
        } else if (e.type === recupStoreName){
            Object.assign(userRecupData,{
                isCustomMode : e.data.isCustomMode ?? defaultRecupData.isCustomMode,
                predefinitValue : e.data.predefinitValue || defaultRecupData.predefinitValue,
                customValue : e.data.customValue || defaultRecupData.customValue,
                discretMode : e.data.discretMode ?? defaultRecupData.discretMode
                }
            );
            await updateDocumentInDB(recupStoreName, (doc) => {
                doc.data = userRecupData;
                return doc;
            });
        
        //MEMORY
        } else if (e.type === memoryStoreName){
            let newMemoryToInsert = {
                title : e.title,
                date : e.date,
                imageData : e.imageData,
                comment : e.comment
            };
            await onInsertNewMemoryInDB(newMemoryToInsert);


        //EVALUATION    
        } else if (e.type === evaluationStoreName){
            await updateDocumentInDB(evaluationStoreName, (doc) => {
                doc.data = e.data;
                return doc;
            });


        //EVALUATION REMINDER    
        } else if (e.type === evaluationReminderStoreName){
            await updateDocumentInDB(evaluationReminderStoreName, (doc) => {
                doc.data = e.data;
                return doc;
            });

        //OBJECTIF
        } else if (e.type === objectifStoreName){
            let newObjectifToInsert = {
                title : e.title,
                activity : e.activity,
                dataType : e.dataType,
                rythmeType : e.rythmeType,
                isEnabled: e.isEnabled,
                targetValue : e.targetValue,
                notification : {
                    sent : e.notification.sent,
                    dateSent: e.notification.dateSent
                }
            };
            await onInsertNewObjectifInDB(newObjectifToInsert);
        }

        // Traitement des pourcentages
        importCount++;

        if (importCount >= importPercentStep) {
            let progress = Math.round((importCount / totalDataToImport) * 100);
            requestAnimationFrame(() => {
                pPercentImportTextRef.textContent = `${progress}%`;
            });

            importPercentStep += Math.floor(totalDataToImport * 0.1); // set le prochain palier
        }


    }

    // 3️⃣ Finalisation
    eventImportDataSucess();
}








// -----------------------------------------------  Suppression des données de la base ----------------------------









// Demande de suppression
function onClickDeleteDataBaseFromGestData() {
    if (devMode === true) {console.log("Demande de suppression des données de la base");};

    document.getElementById("divConfirmDeleteDataBase").classList.add("show");

    onChangeDisplay([],[],[],["divGestData"],[],[],[]);

}



// Demande de confirmation
function onConfirmDeleteDataBase(event) {
    
    event.stopPropagation();
    if (devMode === true) {console.log("Confirmation de la demande de suppression des données");};

    document.getElementById("divConfirmDeleteDataBase").classList.remove("show");
    onChangeDisplay([],[],[],[],["divGestData"],[],[]);

    // Verrouillage des boutons du menu Gestion des données
    onSetLockGestDataButton(true);


    onDeleteBDD();
}



// Annuation de la demande
function onCancelDeleteDataBase(params) {
    if (devMode === true) {console.log("annulation de la demande de suppression des données");};

    document.getElementById("divConfirmDeleteDataBase").classList.remove("show");
    onChangeDisplay([],[],[],[],["divGestData"],[],[]);
}





// Fonction de suppression de la base et des favoris
async function onDeleteBDD() {
   
    onDisplayTextDataBaseEvent(true);

    if (devMode === true) {console.log("Lancement de la suppression");};
    // Le local storage
    onDeleteLocalStorage();

    //Les sauvegardes
    await onDeleteAllBackupFiles();

    // La base de donnée
    await deleteBase();

    // Relance l'application
    setTimeout(() => {
        location.reload();
    }, 2000);
};

function onDeleteLocalStorage() {
     // Les cookies 
    localStorage.removeItem('MSS_notifyPermission');
    localStorage.removeItem(sessionStorageName);
    localStorage.removeItem(sessionStartTimeStorageName);
    localStorage.removeItem(timersInUserStorageName);
}


async function deleteBase() {
    try {
        // Supprimer complètement la base de données (y compris les séquences et métadonnées)
        await new PouchDB(dbName).destroy();
        console.log("[DELETE] La base de données a été complètement supprimée.");
    } catch (error) {
        console.error("[DELETE] Erreur lors de la suppression complète de la base :", error);
    }
}








// ------------------------------------ fonction générales --------------------------









function onSetLockGestDataButton(isDisable) {
    if (devMode === true) {
        console.log("Gestion de blocage ou déblocage des boutons : " + isDisable);
    }

    let buttonArray = [
        "btnExportBdDInLocal",
        "fileInputJsonTask",
        "btnImportBdD",
        "btnDeteteBdd",
        "divMainBtnMenu",
        "btnExportBdDInCloud",
        "btnPurgeLocalBackup"
    ];

    buttonArray.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.disabled = isDisable;
            el.style.visibility = isDisable ? "hidden" : "visible";
        } else if (devMode === true) {
            console.warn(`[UI] Élément non trouvé : ${id}`);
        }
    });
}



// Evenement patientez pendant la suppression de la base ou son chargement
function onDisplayTextDataBaseEvent(isDelete) {

    let divGestDataRef = document.getElementById("divGestData");

    // Vide la div gestion des données
    divGestDataRef.innerHTML = "";


    // Creation des éléments pour patienter

    let newDiv = document.createElement("div");
    newDiv.className = "center";

    let newImg = document.createElement("img");
    newImg.src = "./Icons/Icon-wait.webp";
    newImg.className = "waiting";

    let newText = document.createElement("p");
    newText.innerHTML =  isDelete ? "Suppression en cours, veuillez patientez... ": "Import en cours ! Veuillez patienter...";
    newText.className = "waiting";


    //text du pourcentage lors de l'import 
    let newPercentText = document.createElement("p");
    newPercentText.classList.add("waiting");
    newPercentText.id = "pPercentImportText";
    newPercentText.textContent = "0%"


    // Insertion
    newDiv.appendChild(newImg);
    newDiv.appendChild(newText);
    newDiv.appendChild(newPercentText);

    divGestDataRef.appendChild(newDiv);
}




//fonction pour rendre une action sur un bouton visible
function eventActivateGestDataBtn(iDtarget) {
    let target = document.getElementById(iDtarget);

    target.classList.add("activate");
    target.disabled = true;
    setTimeout(() => {
        target.classList.remove("activate");
        target.disabled = false;
    }, 300);

}


// ----------------------------------- GESTION DES #TAG---------------------------------




async function onPurgeTAG() {
    const tagsSet = new Set();

    // 1️⃣ Tags des activités utilisateur
    Object.values(allUserActivityArray).forEach(activity => {
        activity?.tagList?.forEach(tag => {
            tagsSet.add(tag);
        });
    });

    try {
        const result = await db.allDocs({ include_docs: true });

        result.rows
            .map(row => row.doc)
            .forEach(doc => {

                // 2️⃣ Templates
                if (doc.type === templateStoreName) {
                    doc.tagList?.forEach(tag => tagsSet.add(tag));
                }

                // 3️⃣ Items supprimés
                if (doc.type === 'itemDeleted') {
                    doc.tagList?.forEach(tag => tagsSet.add(tag));
                }

            });

    } catch (err) {
        console.error("[DATABASE] [TAG COLLECT] Erreur lors du chargement:", err);
    }

    const tagsInUseList = [...tagsSet];

    let initialTagReferencielNbre = tagReferenciel.length;

    //compare avec le tableau de référenciel et retire du référenciel ceux qui ne sont pas utilisé
    tagReferenciel = tagReferenciel.filter(tag => 
        tagsInUseList.includes(tag)
    );

    let finalTagReferencielNbre = tagReferenciel.length;


    // Remet le tag par défaut
    currentTagFilter = DEFAULT_TAG_VALUE;

    //actualise les options du selecteur de tag dans la liste d'affiche d'activité
    onUpdateSelectorFilterTAG();

    //gestion du style selon si tag en cours ou non
    onSetTagFilterColor();

    // Actualisation de l'affichage des activités
    eventUpdateActivityList();

    // Sauvegarde du nouveau référentiel dans la base
    onSaveTagInDB();


    //affiche le résultat du traitement
    let tagDeleted = initialTagReferencielNbre - finalTagReferencielNbre;

    let textResultRef = document.getElementById("pResultPurgeTAG");
    if (tagDeleted === 0) {
        textResultRef.textContent = "Aucun tag à supprimer !";
    }else{
        textResultRef.textContent = `${tagDeleted} tags supprimés !`;
    }
}









// Retour depuis Gestion des données
function onClickReturnFromGestData() {
    // ferme le menu
    onLeaveMenu("GestData");
};