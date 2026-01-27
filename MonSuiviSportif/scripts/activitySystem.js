

// Format de l'objet pour une nouvelle activité
let activityToInsertFormat = {
    name :"",
    date : "",
    location : "",
    distance : "",
    duration : "",
    comment : "",
    createdAt : "",
    isPlanned : false
};


let allUserActivityArray = {}, //Contient toutes les activités créé par l'utilisateur
    userActivityKeysListToDisplay = [], // contient les activités triées et filtrées à afficher
    maxActivityPerCycle = 15,//Nbre d'élément maximale à afficher avant d'avoir le bouton "afficher plus"
    userActivityKeysListIndexToStart = 0, //Index de démarrage pour l'affichage d'activité
    currentActivityDataInView,//contient les données d'une activité en cours d'affichage. Permet de comparer les modifications
    activityTagPlanned  = "planifie",
    activityTagDone = "effectue",
    isActivityPlannedExist = false,
    currentActivityEditorID = "";


// Reférencement

let pInterfaceActivityTitleRef = document.getElementById("pInterfaceActivityTitle"),
    inputDateRef = document.getElementById("inputDate"),
    inputLocationRef = document.getElementById("inputLocation"),
    inputDistanceRef = document.getElementById("inputDistance"),
    inputDurationActivityHoursRef = document.getElementById("inputDurationActivityHours"),
    inputDurationActivityMinutesRef = document.getElementById("inputDurationActivityMinutes"),
    inputDurationActivitySecondsRef = document.getElementById("inputDurationActivitySeconds"),
    textareaCommentRef = document.getElementById("textareaComment"),
    selectorCategoryChoiceRef = document.getElementById("selectorCategoryChoice"),
    divItemListRef = document.getElementById("divItemList"),
    imgEditorActivityPreviewRef = document.getElementById("imgEditorActivityPreview"),
    inputIsPlannedRef = document.getElementById("inputIsPlanned"),
    pEditorActivityPreviewPlannedIconRef = document.getElementById("pEditorActivityPreviewPlannedIcon");








// class ActivityItem

class ActivityItem {
    constructor(id, imgRef, distance, duration, date, location, comment, parentRef, isPlanned,delayMs = 0, animationEnabled = true) {
        this.id = id;
        this.imgRef = imgRef;
        this.itemContainerClass = isPlanned ? ["item-container", "item-planned"] : ["item-container"];
        this.distance = parseFloat(distance);
        this.duration = duration;
        this.date = date;
        this.location = location;
        this.comment = comment;
        this.parentRef = parentRef;
        this.isPlanned = isPlanned;
        this.delayMs = delayMs;
        this.animationEnabled = animationEnabled;

        // Conteneur principal
        this.element = document.createElement("div");
        this.itemContainerClass.forEach(cls => this.element.classList.add(cls));//parce ce que itemContainerClass est un array


        // Animation si activé
        if (this.animationEnabled) {
            // Pour l'animation sur le conteneur principal
            this.element.classList.add("item-animate-in-horizontal");
            this.element.style.animationDelay = `${this.delayMs}ms`;


            // evenement pour retirer l'animation après qu'elle soit jouée
            this.element.addEventListener("animationend", () => {
                this.element.classList.remove("item-animate-in-horizontal");
                this.element.style.animationDelay = "";
            }, { once: true });
        }


        // Evènement pour le click
        this.element.addEventListener("click", () => {
            onClickOnActivity(this.id);
        });

        this.render();
    }

    render() {
        const distance = this.distance ? `${this.distance} km` : "---";
        const location = this.location ? highlightSearchTerm(this.location, userActivitySearchTerm) : "---";
        const date = onDisplayUserFriendlyDate(this.date);
        const distanceClass = this.isPlanned ? "item-data-distance-planned" : "item-data-distance";
        const durationClass = this.isPlanned ? "item-data-duration-planned" : "item-data-duration";
        const commentClass = this.isPlanned ? currentCommentPlannedClassName : currentCommentDoneClassName;
        const attribute = this.isPlanned ? activityTagPlanned : activityTagDone;
        const comment = this.comment ? highlightSearchTerm(this.comment, userActivitySearchTerm) : "";

        this.element.innerHTML = `
            <div class="item-image-container">
                <img class="activity" src="${this.imgRef}">
            </div>
            <div class="item-data-container">
                <div class="item-data-area1">
                    <p class="${distanceClass}">${distance}</p>
                    <p class="${durationClass}">${this.duration}</p>
                    <p class="item-data-date">${date}</p>
                </div>
                <div class="item-data-area2">
                    <p class="item-data-location">${location}</p>
                    ${this.isPlanned ? `<button class="buttonAddCalendar">🗓️</button>` : ""}
                </div>
                <div class="item-data-area3">
                    <p data-type="${attribute}" class="${commentClass}">${comment}</p>
                </div>
                <div class="item-data-area-tag">
                    #CITRON #BANANE #TOMATES
                </div>

            </div>
        `;

        // Ajout du bouton ICS s’il est présent
        if (this.isPlanned) {
            const btnICS = this.element.querySelector(".buttonAddCalendar");
            if (btnICS) {
                btnICS.addEventListener("click", (event) => {
                    event.stopPropagation(); // pour ne pas déclencher le clic sur l’item
                    onClickAddToCalendar(this.id);
                });
            }
        }

        // Insertion dans le parent
        this.parentRef.appendChild(this.element);
    }
}



// ----------------------------------- Gestion ecouteur evenement------------------------------

function onAddEventListenerForActivityEditor() {
        
    if (devMode === true){
        console.log("[EVENT-LISTENER] : Ajoute les évènements pour l'éditeur d'activité");
    };

    // FakeSelector
    let fakeSelectRef = document.getElementById("divBtnFakeSelectorActivityEditor");
    const onClickOnActivity = ()=> onClickFakeSelect('activityEditor');
    fakeSelectRef.addEventListener("click",onClickOnActivity);
    onAddEventListenerInRegistry("activityEditor",fakeSelectRef,"click",onClickOnActivity);

    //checkbox planned
    let checkBoxPlannedRef = document.getElementById("inputIsPlanned");
    const onChangeCheckboxPlanned = (event) => onChangeActivityPlanned(event.target.checked);
    checkBoxPlannedRef.addEventListener("change",onChangeCheckboxPlanned);
    onAddEventListenerInRegistry("activityEditor",checkBoxPlannedRef,"change",onChangeCheckboxPlanned);

    //inputDate
    let inputRef = document.getElementById("inputDate");
    const onChangeInputDate = (event) => onRemoveFieldRequired(event.target);
    inputRef.addEventListener("change",onChangeInputDate);
    onAddEventListenerInRegistry("activityEditor",inputRef,"change",onChangeInputDate);

    //input number chrono
    let inputChronoIDArray = [
        "inputDurationActivityHours",
        "inputDurationActivityMinutes",
        "inputDurationActivitySeconds"
    ];

    inputChronoIDArray.forEach(input=>{
        let inputRef = document.getElementById(input);
        // onInput
        let maxHour = parseInt(inputRef.max);
        const onFormatNumberInput = (event) => formatNumberInput(event.target, maxHour, 2);
        inputRef.addEventListener("input",onFormatNumberInput);
        onAddEventListenerInRegistry("activityEditor",inputRef,"input",onFormatNumberInput);

        //onFocus
        const onFocus = (event) => selectAllText(event.target);
        inputRef.addEventListener("focus",onFocus);
        onAddEventListenerInRegistry("activityEditor",inputRef,"focus",onFocus);

        //onBlur
        const onBlur = (event) => formatNumberInput(event.target, maxHour, 2);
        inputRef.addEventListener("blur",onBlur);
        onAddEventListenerInRegistry("activityEditor",inputRef,"blur",onBlur);


        //onContextMenu
        const onContextMenu = (event) => disableContextMenu(event);
        inputRef.addEventListener("contextmenu",onContextMenu);
        onAddEventListenerInRegistry("activityEditor",inputRef,"contextmenu",onContextMenu);
    });

}


// ------------------------------Fonction générale pour activity ----------------------------------


// fonction pour récupérer les activité et les modèles
async function onLoadActivityFromDB() {
    allUserActivityArray = {}; // devient un objet
    try {
        const result = await db.allDocs({ include_docs: true });

        result.rows
            .map(row => row.doc)
            .filter(doc => doc.type === activityStoreName)
            .forEach(doc => {
                allUserActivityArray[doc._id] = { ...doc }; // on garde tout
            });

        if (devMode === true) {
            console.log("[DATABASE] [ACTIVITY] Activités chargées :", activityStoreName);
            const firstKey = Object.keys(allUserActivityArray)[0];
            console.log(allUserActivityArray[firstKey]);
        }
    } catch (err) {
        console.error("[DATABASE] [ACTIVITY] Erreur lors du chargement:", err);
    }
}




// Insertion nouvelle activité (ID auto, )
async function onInsertNewActivityInDB(activityToInsertFormat) {
    try {
        const newActivity = {
            type: activityStoreName,
            ...activityToInsertFormat
        };

        // Utilisation de post() pour génération automatique de l’ID
        const response = await db.post(newActivity);

        // Mise à jour de l’objet avec _id et _rev retournés
        newActivity._id = response.id;
        newActivity._rev = response.rev;

        if (devMode === true) {
            console.log("[DATABASE] [ACTIVITY] Activité insérée :", newActivity);
        }

        return newActivity;
    } catch (err) {
        console.error("[DATABASE] [ACTIVITY] Erreur lors de l'insertion de l'activité :", err);
    }
}


// Modification Activity
async function onInsertActivityModificationInDB(activityToUpdate, key) {
    try {
        let existingDoc = await db.get(key);

        // Exclure `_id` et `_rev` de activityToUpdate pour éviter qu'ils ne soient écrasés
        const { _id, _rev, ...safeActivityUpdate } = activityToUpdate;

        const updatedDoc = {
            ...existingDoc,  // Garde `_id` et `_rev`
            ...safeActivityUpdate // Applique les nouvelles valeurs en évitant d'écraser `_id` et `_rev`
        };

        // Sauvegarde dans la base
        const response = await db.put(updatedDoc);

        if (devMode) console.log("[ACTIVITY] Activité mise à jour :", response);

        return updatedDoc; // Retourne l'objet mis à jour
    } catch (err) {
        console.error("Erreur lors de la mise à jour de l'activité :", err);
        return false; // Indique que la mise à jour a échoué
    }
}



// Recherche de template par son id/key
async function findActivityById(activityId) {
    try {
        const activity = await db.get(activityId); // Recherche dans la base
        if (devMode) console.log("[ACTIVITY] Activité trouvé :", activity);
        currentActivityEditorID = activityId;
        return activity; // Retourne l'objet trouvé
    } catch (err) {
        console.error("[ACTIVITY] Erreur lors de la recherche du template :", err);
        return null; // Retourne null si non trouvé
    }
}

// Sequence d'actualisation de la liste d'activité

//L'affichage a lieu dans le sens suivants : 

// 1 puis récupère les keys selon le filtre en cours
// 2 dans le filtre en cours recupère les keys sur les éléments recherchés
// 3 puis passe au tries






function eventUpdateActivityList() {
    if (devMode === true) {console.log("[ACTUALISATION]Actualisation liste activités");};
 
    userActivitySearchTerm = ""; //reset les stockage d'un éléments recherche pour la subrillance

    // 1 récupère les keys selon le filtre en cours
    // si pas de filtre ne récupère rien
    let filteredDataKeys = onFilterActivity(currentFilter,allUserActivityArray);

    if (devMode === true) {
        if (filteredDataKeys.length === 0) {
            console.log("[ACTUALISATION] Aucune filtre en cours");
        }else{
            console.log(`[ACTUALISATION] Un filtre en cours : ${currentFilter}. Nombre de key pour le filtre trouvé : ${filteredDataKeys.length}`);
        }
    }

   
    

    // 2 si il y a un élément à rechercher,filtre sur les éléments récupérés par la recherche ou sinon sur tous les éléments
    let userSearchResultKeys = [],
        sortedKeys = [];

    let searchActivityValue = document.getElementById("inputSearchActivity").value;
    if (devMode === true) {console.log("[ACTUALISATION] Valeur de l'INPUT recherche :" ,searchActivityValue);};

    if (searchActivityValue !="") {
        if (devMode === true) {console.log("[ACTUALISATION] Champ de recherche Remplit. lance la recherche pour :" ,searchActivityValue);};
        userSearchResultKeys = (filteredDataKeys && filteredDataKeys.length > 0)
            ? onSearchDataInActivities(filteredDataKeys,searchActivityValue)
            : onSearchDataInActivities(Object.keys(allUserActivityArray),searchActivityValue
        );

        // 3 Puis lance le trie sur le resultat obtenue
        sortedKeys = onSortActivity(currentSortType,userSearchResultKeys);
    } else {
        if (devMode === true) {console.log("[ACTUALISATION] Champ de recherche vide. Passe directement au trie par : ", currentSortType);};
        // 3  si pas d'élément à rechercher, lance le trie soit selon le filtre encours soit via toutes les data
        sortedKeys = (filteredDataKeys && filteredDataKeys.length > 0)
        ? onSortActivity(currentSortType,filteredDataKeys)
        : onSortActivity(currentSortType,Object.keys(allUserActivityArray));
    }
    

    // 4 fonction d'affichage sur sortedKeys
    // Ajoute uniquement les activités triées (par leurs clés)

    if (devMode === true) {console.log("[ACTUALISATION] Lance insertion activité. Nbre de clé trouvé : ",sortedKeys.length);};
    onInsertActivityInList(sortedKeys);
}




// ------------------------------FIN fonction générale pour activity ----------------------------------







function onOpenNewActivity() {

    activityEditorMode = "creation";
    if (devMode === true){console.log("ouverture de l'editeur d'activité en mode " + activityEditorMode);};


    // Genere la liste pour l'editeur d'activité
    onGenerateActivityOptionChoice("selectorCategoryChoice");
    onGenerateFakeOptionList("divFakeSelectOptList");

    // Initialise les éléments
    onResetActivityInputs();

    //création menu principal
    onCreateMainMenuActivityEditor(false);




    
};

function onOpenNewActivityFromTemplate(templateItem) {

    activityEditorMode = "creation";

    // Genere la liste pour l'editeur d'activité
    onGenerateActivityOptionChoice("selectorCategoryChoice");
    onGenerateFakeOptionList("divFakeSelectOptList");

    // Initialise les éléments
    onResetActivityInputs();
    onSetBtnRadio(templateItem.activityName);

    //création menu principal
    onCreateMainMenuActivityEditor(false);

    if (devMode === true){
        console.log("ouverture de l'editeur d'activité depuis un template en mode " + activityEditorMode);
        console.log("Valeur de templateItem : ");
        console.log(templateItem);
    };


    


    //Set avec le élément du template
    inputLocationRef.value = templateItem.location;
    inputDistanceRef.value = templateItem.distance;
    textareaCommentRef.value = templateItem.comment;
    inputIsPlannedRef.checked = templateItem.isPlanned;


    // gestion du format duration
    let convertDuration = timeFormatToInputNumber(templateItem.duration);
    inputDurationActivityHoursRef.value = convertDuration.hours;
    inputDurationActivityMinutesRef.value = convertDuration.minutes;
    inputDurationActivitySecondsRef.value = convertDuration.seconds;


    // pour le selecteur d'activité, met le premier éléments qui à dans favoris, ou sinon CAP par défaut, C-A-P
    selectorCategoryChoiceRef.value = templateItem.activityName;

    // l'image de prévisualisation 
    imgEditorActivityPreviewRef.src = activityChoiceArray[templateItem.activityName].imgRef;
    pEditorActivityPreviewPlannedIconRef.innerHTML = templateItem.isPlanned ? "🗓️ Cette activité est planifiée.":"";
}



// Génération du menu principal
function onCreateMainMenuActivityEditor(isModify) {
    // Vide le précedent contenut
    let divMainMenuParentRef = document.getElementById("divMainBtnMenu");
    divMainMenuParentRef.innerHTML = "";

    //crée les boutons
    //Retour
    new Button_main_menu(btnMainMenuData.return.imgRef,btnMainMenuData.return.text,() => onClickReturnFromActivityEditor());

    // Apparition du menu 'supprimer'
    if (isModify) {
        new Button_main_menu(btnMainMenuData.delete.imgRef,btnMainMenuData.delete.text,() => onClickDeleteFromActivityEditor());
    }

    //Valider
    new Button_main_menu_Valider("Valider",() => onClickSaveFromActivityEditor());

}
  




// Reset les inputs du menu activité
function onResetActivityInputs() {
    if (devMode === true){console.log("reset les inputs du menu activité");};
    inputDateRef.value = "";
    inputLocationRef.value = "";
    inputDistanceRef.value = "";
    inputDurationActivityHoursRef.value = "00";
    inputDurationActivityMinutesRef.value = "00";
    inputDurationActivitySecondsRef.value = "00";
    textareaCommentRef.value = "";
    inputIsPlannedRef.checked = false;

    // pour le selecteur d'activité, met le premier éléments qui à dans favoris, ou sinon CAP par défaut, C-A-P
    selectorCategoryChoiceRef.value = userFavoris.length > 0 ? userFavoris[0] : "C-A-P";
   
    // l'image de prévisualisation 
    imgEditorActivityPreviewRef.src = userFavoris.length > 0 ? activityChoiceArray[userFavoris[0]].imgRef  : activityChoiceArray["C-A-P"].imgRef;
    pEditorActivityPreviewPlannedIconRef.innerHTML = "";

    inputDateRef.classList.remove("fieldRequired");

    //ajout évènement
    onAddEventListenerForActivityEditor();

    if (devMode === true) {
        onConsoleLogEventListenerRegistry();
    }

};



// Empêche d'utiliser une date ultérieure (non utilisé actuellement)

function initMaxDate() {

    if (devMode === true){console.log("Blocage de la date maximale à ");};
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // Format YYYY-MM-DD
    inputDateRef.setAttribute('max', formattedDate);

    if (devMode === true){console.log("Blocage de la date maximale à " + formattedDate);};

}



// Insertion des activités dans la liste

function onInsertActivityInList(activityKeysToDisplay) {

    // Remonte la scroll bar si elle est en bas
    onResetScrollBarToTop("divItemList");


    // Stock les activité à afficher dans un tableau
    userActivityKeysListToDisplay = activityKeysToDisplay;
    userActivityKeysListIndexToStart = 0;


    if (devMode === true){
        console.log("[ACTIVITY] nbre d'activité total à afficher = " + userActivityKeysListToDisplay.length);
        console.log("[ACTIVITY] Nbre max d'activité affiché par cycle = " + maxActivityPerCycle);
        console.log("[ACTIVITY] Vide la liste des activités");
    };

    divItemListRef.innerHTML = "";

    if (userActivityKeysListToDisplay.length === 0) {
        divItemListRef.innerHTML = "Aucune activité à afficher !";
        return
    }else{
        if (devMode === true){console.log("Demande d'insertion du premier cycle d'activité dans la liste");};
        onInsertActivityCycle();
    };


};



// séquence d'insertion  d'activité dans la liste selon le nombre limite définit
function onInsertActivityCycle() {
    if (devMode === true){
        console.log("[ACTIVITY] Lancement d'un cycle d'insertion d'activité.");
        console.log("[ACTIVITY] Index de départ = " + userActivityKeysListIndexToStart);
    };
    let cycleCount = 0;

    for (let i = userActivityKeysListIndexToStart; i < Object.keys(userActivityKeysListToDisplay).length; i++) {
        if (cycleCount >= maxActivityPerCycle) {
            if (devMode === true){console.log("[ACTIVITY] Max par cycle atteinds = " + maxActivityPerCycle);};
            // Creation du bouton More
            onCreateMoreActivityBtn();
            userActivityKeysListIndexToStart += maxActivityPerCycle;
            if (devMode === true){console.log("[ACTIVITY] mise a jour du prochain index to start = " + userActivityKeysListIndexToStart);};
            // Arrete la boucle si lorsque le cycle est atteind
            return
        }else{
            // Stocke les éléments de l'activité dans une variable
            const activityData = allUserActivityArray[userActivityKeysListToDisplay[i]];

            let delay = cycleCount * animCascadeDelay; // 60ms d’écart entre chaque élément : effet cascade
            new ActivityItem(
                activityData._id,
                activityChoiceArray[activityData.name].imgRef,
                activityData.distance,
                activityData.duration,
                activityData.date,
                activityData.location,
                activityData.comment,
                divItemListRef,
                activityData.isPlanned,
                delay,
                userSetting.animationEnabled
            );

            // gestion derniere activité de la liste
            // Insertion d'un trait en fin de liste
            let isLastIndex = i === Object.keys(userActivityKeysListToDisplay).length-1;

            if (isLastIndex) {
                let newClotureList = document.createElement("span");
                newClotureList.classList.add("last-container");
                newClotureList.innerHTML = "ℹ️ Vos activités sont stockées dans votre appareil.";
                divItemListRef.appendChild(newClotureList);
            }
        };
        cycleCount++;
    }; 
};



// Fonction pour le bouton MoreActivity pour afficher les activités utilisateurs suivantes

function onCreateMoreActivityBtn() {

    // La div de l'item
    let newItemContainerBtnMore = document.createElement("button");
    newItemContainerBtnMore.classList.add("moreItem");
    newItemContainerBtnMore.id = "btnMoreItem";

    newItemContainerBtnMore.addEventListener("click", ()=>{
        onDeleteBtnMoreItem();
        onInsertActivityCycle();
    });


    newItemContainerBtnMore.innerHTML = "Afficher plus >";


    divItemListRef.appendChild(newItemContainerBtnMore);

};




// Fonction pour supprimer le bouton "more item"
function onDeleteBtnMoreItem() {
    // Sélection de l'élément avec l'ID "btnMoreItem"
    let btnToDelete = document.getElementById("btnMoreItem");
    
    // Vérification si l'élément existe avant de le supprimer
    if (btnToDelete) {
        btnToDelete.remove();
        if (devMode === true){console.log("Suppression du bouton More Item");};
    } else {
        if (devMode === true){console.log("Le bouton more item n'est pas trouvé");};
    };
};














// ---------------------------------  EDITEUR d'activité ---------------------

// Variable pour connaitre dans quel mode l'editeur d'activité est ouvert
let activityEditorMode; //  creation, modification, 











function onClickReturnFromActivityEditor() {
    onLeaveMenu("Activity");
};






function onClickSaveFromActivityEditor() {
    // Verrouillage de la div pour éviter double clic et créer des problèmes
    onLockDivDoubleClick(["divActivityEditor","divMainBtnMenu"]);
    // Lancement du formatage de l'activité
    onFormatActivity();
};



// Set l'image de prévisualisation d'activité dans l'éditeur
function onChangeActivityPreview(dataName) {
    if (devMode === true){console.log(dataName);};
    imgEditorActivityPreviewRef.src = activityChoiceArray[dataName].imgRef;
} 

// Set l'icone "temporaire" dans la prévisualisation
function onChangeActivityPlanned(checkBoxValue) {
    pEditorActivityPreviewPlannedIconRef.innerHTML = checkBoxValue ? "🗓️ Cette activité est planifiée.":"";
}




// ------------------------------------- Modification d'activité --------------------------------





// clique sur un item
function onClickOnActivity(keyRef) {

    // Genere la liste pour l'editeur d'activité
    onGenerateActivityOptionChoice("selectorCategoryChoice");
    onGenerateFakeOptionList("divFakeSelectOptList");


    onResetActivityInputs();

    currentActivityEditorID = keyRef;

    let activityToDisplay = allUserActivityArray[keyRef];

    currentActivityDataInView = activityToDisplay;//pour la comparaison par la suite
    onEditActivity(activityToDisplay);

    onChangeMenu("EditActivity");

    //création menu principal
    onCreateMainMenuActivityEditor(true);


};






function onEditActivity(activityTarget) {

    // Set le mode d'edition de l'activité
    activityEditorMode = "modification";
    // Set les boutons radio
    onSetBtnRadio(activityTarget.name);

    if (devMode === true){console.log("ouverture de l'editeur d'activité en mode " + activityEditorMode);};

    selectorCategoryChoiceRef.value = activityTarget.name;
    inputDateRef.value = activityTarget.date;
    inputLocationRef.value = activityTarget.location;
    inputDistanceRef.value = activityTarget.distance;
    textareaCommentRef.value = activityTarget.comment;
    inputIsPlannedRef.checked = activityTarget.isPlanned;


    // gestion du format duration
    let convertDuration = timeFormatToInputNumber(activityTarget.duration);
    inputDurationActivityHoursRef.value = convertDuration.hours;
    inputDurationActivityMinutesRef.value = convertDuration.minutes;
    inputDurationActivitySecondsRef.value = convertDuration.seconds;

    // l'image de prévisualisation 
    imgEditorActivityPreviewRef.src = activityChoiceArray[activityTarget.name].imgRef;
    // prévisualisation coché temporaire
    pEditorActivityPreviewPlannedIconRef.innerHTML = activityTarget.isPlanned ? "🗓️ Cette activité est planifiée." : "";
};



// -------------------------- Création d'activité ---------------------------------








// formatage de la nouvelle activité avant insertion dans la base
function onFormatActivity() {


    if (activityEditorMode === "creation") {
        if (devMode === true){console.log("Demande de création nouvelle activité");};
    }else if(activityEditorMode === "modification"){
        if (devMode === true){console.log("Demande d'enregistrement d'une modification d'activité");};
    };
    



    // Verification des champs requis
    if (devMode === true){console.log("[ NEW ACTIVITE ] controle des champs requis");};
    let emptyField = onCheckEmptyField(inputDateRef);

    if (emptyField === true) {
        if (devMode === true){console.log("[ NEW ACTIVITE ] Champ obligatoire non remplis");};

        onShowNotifyPopup("inputDateRequired");

        onUnlockDivDoubleClick(["divActivityEditor","divMainBtnMenu"]);//retire la sécurité du clic
        return
    };



    //  met tous les éléments dans l'objet
    activityToInsertFormat.name = selectorCategoryChoiceRef.value;
    activityToInsertFormat.date = inputDateRef.value;
    activityToInsertFormat.distance = inputDistanceRef.value;
    activityToInsertFormat.location = onSetToUppercase(inputLocationRef.value);
    activityToInsertFormat.comment = textareaCommentRef.value;
    activityToInsertFormat.duration = inputActivityNumberToTime();

    // Ne set la date de création que lors d'une création et non lors d'une modification
    if (activityEditorMode === "creation") {
        activityToInsertFormat.createdAt = new Date().toISOString();
    }else {
        activityToInsertFormat.createdAt = currentActivityDataInView.createdAt;
    };

    


    // Gestion planification  : les dates après la date du jour sont obligatoirement des activités planifiées
    // si date ultérieur automatiquement planifié sinon, regarde la valeur checkbox
    //ATTENTION : "Aujourd'hui" comment à partir d'1 heure du matin pour l'application
    const isPlannedBySystem = isDateAfterToday(inputDateRef.value);
    activityToInsertFormat.isPlanned = isPlannedBySystem ? true : inputIsPlannedRef.checked;


    // Demande d'insertion dans la base soit en creation ou en modification


    if (activityEditorMode === "creation") {
        eventInsertNewActivity(activityToInsertFormat,false);
    }else if(activityEditorMode === "modification"){
        onCheckIfModifiedRequired(activityToInsertFormat);
    };

};


// Sauvegarde uniquement si une modification a bien été effectuée dans les données
function onCheckIfModifiedRequired(activityToInsertFormat) {
    
    // Création d'une liste de champs à comparer
    const fieldsToCompare = [
        { oldValue: currentActivityDataInView.name, newValue: activityToInsertFormat.name },
        { oldValue: currentActivityDataInView.date, newValue: activityToInsertFormat.date },
        { oldValue: currentActivityDataInView.distance, newValue: activityToInsertFormat.distance },
        { oldValue: currentActivityDataInView.location, newValue: activityToInsertFormat.location },
        { oldValue: currentActivityDataInView.comment, newValue:  activityToInsertFormat.comment },
        { oldValue: currentActivityDataInView.duration, newValue:  activityToInsertFormat.duration },
        { oldValue: currentActivityDataInView.isPlanned, newValue:  activityToInsertFormat.isPlanned }
    ];

    if (devMode) {
        fieldsToCompare.forEach(e=>{
            console.log(e);
        });
    };

    // Vérification si une différence est présente
    // some s'arrete automatiquement si il y a une différence
    // Vérification si une différence est présente
    const updateDataRequiered = fieldsToCompare.some(field => {
        if (typeof field.oldValue === "object" && field.oldValue !== null) {
            // Utiliser JSON.stringify pour comparer les contenus des objets
            return JSON.stringify(field.oldValue) !== JSON.stringify(field.newValue);
        }
        // Comparaison simple pour les types primitifs
        return field.oldValue != field.newValue;
    });


    if (updateDataRequiered) {
        if (devMode) console.log("[ACTIVITY] Informations d'activité différentes : Lancement de l'enregistrement en BdD");
        eventInsertActivityModification(activityToInsertFormat);
    } else {
        if (devMode) console.log("[ACTIVITY] Aucune modification de d'activité nécessaire !");
         //Gestion de l'affichage 
        onLeaveMenu("Activity");
    }

}





// Séquence d'insertion d'une nouvelle activité
//Soi depuis l'éditeur d'activité, soit une activité généré depuis les sessions

async function eventInsertNewActivity(dataToInsert,isFromSession) {

    // Insere en base
    let newActivityToAdd = await onInsertNewActivityInDB(dataToInsert);

    // Insère également dans l'array d'objet
    allUserActivityArray[newActivityToAdd._id] = newActivityToAdd;
    if (devMode === true){console.log("allUserActivityArray :",allUserActivityArray);};



    // est ce que la derniere activité est planifié donc pas de check reward
    const isCheckRewardsRequiered = dataToInsert.isPlanned === false;
    if (devMode === true){console.log("[REWARDS] Valeur de planification derniere activité  " + isCheckRewardsRequiered);};

    if (isCheckRewardsRequiered) {
        onCheckReward(dataToInsert.name,dataToInsert.comment);
    }
    

    // Generation du trie dynamique
    onGenerateDynamiqueFilter(allUserActivityArray);

    // Actualisation de l'affichage des activités
    eventUpdateActivityList();


    // Si c'est une activité généré depuis les session, met fin à la fonction
    if (isFromSession) {
        // Popup notification
        onShowNotifyPopup("activityGenerated");
        return
    }

    // Popup notification
    onShowNotifyPopup("creation");

    //Gestion de l'affichage 
    onLeaveMenu("Activity");
}



// Séquence d'insertion d'une modification
async function eventInsertActivityModification(dataToInsert) {

    // Sauvegarde dans la base
    let activityUpdated = await onInsertActivityModificationInDB(dataToInsert,currentActivityEditorID);

    // met à jour l'array d'objet
    allUserActivityArray[currentActivityEditorID] = activityUpdated;
    if (devMode === true){console.log("allUserActivityArray :",allUserActivityArray);};

    // est ce que la derniere activité est planifié donc pas de check reward
    const isCheckRewardsRequiered = dataToInsert.isPlanned === false;
    if (devMode === true){console.log("[REWARDS] Valeur de planification derniere activité  " + isCheckRewardsRequiered);};

    if (isCheckRewardsRequiered) {
        onCheckReward(dataToInsert.name,dataToInsert.comment);
    }
    

    // Generation du trie dynamique
    onGenerateDynamiqueFilter(allUserActivityArray);

    // Actualisation de l'affichage des activités
    eventUpdateActivityList();

    // Popup notification
    onShowNotifyPopup("modification");

    //Gestion de l'affichage 
    onLeaveMenu("Activity");
}





// --------------------- SUPPRESSION ACTIVITE --------------------------


// Suppression d'activité
function onClickDeleteFromActivityEditor() {
    
    if (devMode === true){console.log("demande de suppression d'activité ");};
    
    onChangeDisplay([],[],[],["divActivityEditor"],[],[],[]);

    let confirmText = "Supprimer activité ?";
    addEventForGlobalPopupConfirmation(onAnnulDeleteActivity,onConfirmDeleteActivity,confirmText,"delete");
};


function onConfirmDeleteActivity(event){

    event.stopPropagation();// Empêche la propagation du clic vers la div d'annulation

    onLockDivDoubleClick(["divActivityEditor","divMainBtnMenu"]);//sécurité double click

    if (devMode === true){console.log("Confirmation de suppression d'activité ");};
    // retire la class "show" pour la div de confirmation
    removeEventForGlobalPopupConfirmation();
    eventDeleteActivity(currentActivityEditorID);


};


// Sequence de suppression d'un template
async function eventDeleteActivity(idToDelete) {

    // Envoie vers la corbeille
    await sendToRecycleBin(idToDelete);
    
    // retire l'objet de l'array
    delete allUserActivityArray[idToDelete];

    if (devMode === true){console.log("allUserActivityArray :",allUserActivityArray);};

    // Generation du trie dynamique
    onGenerateDynamiqueFilter(allUserActivityArray);

    // Actualisation de l'affichage des activités
    eventUpdateActivityList();

    // Popup notification
    onShowNotifyPopup("delete");

    //Gestion de l'affichage 
    onLeaveMenu("Activity");

}







function onAnnulDeleteActivity(event) {
    
    if (devMode === true){console.log("annulation de la suppression d'activité ");};
    // retire la class "show" pour la div de confirmation
    removeEventForGlobalPopupConfirmation();
    onChangeDisplay([],[],[],[],["divActivityEditor"],[],[]);

};
















// Fonction récupérer les valeur des inputs number et les convertir au format input time
function inputActivityNumberToTime() {

    let hhh = inputDurationActivityHoursRef.value.padStart(2, '0');
    let mm = inputDurationActivityMinutesRef.value.padStart(2, '0');
    let ss = inputDurationActivitySecondsRef.value.padStart(2, '0');

    // Mettre à jour l'affichage dans le champ text
    return `${hhh}:${mm}:${ss}`;
}




