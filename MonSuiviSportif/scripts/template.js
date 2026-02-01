
let userTemplateListItems = {
        "id": {activityName:"",title:""}
    },
    userTemplateListKeys = [],
    currentTemplateEditorID = "",
    templateAvailable = false,
    currentTemplateInView = {},
    maxTemplate = 20;




// Reférencement
let imgTemplateEditorPreviewRef = document.getElementById("imgEditorActivityPreview"),
    pTemplateEditorInfoRef = document.getElementById("pTemplateEditorInfo"),
    selectorTemplateCategoryChoiceRef = document.getElementById("selectorTemplateCategoryChoice"),
    inputTemplateIsPlannedRef = document.getElementById("inputTemplateIsPlanned"),
    inputTemplateTitleRef = document.getElementById("inputTemplateTitle"),
    inputTemplateLocationRef = document.getElementById("inputTemplateLocation"),
    inputTemplateDistanceRef = document.getElementById("inputTemplateDistance"),
    inputDurationTemplateHoursRef = document.getElementById("inputDurationTemplateHours"),
    inputDurationTemplateMinutesRef = document.getElementById("inputDurationTemplateMinutes"),
    inputDurationTemplateSecondsRef = document.getElementById("inputDurationTemplateSeconds"),
    textareaTemplateCommentRef = document.getElementById("textareaTemplateComment"),
    inputTemplateTagRef = document.getElementById("inputTemplateTag"),
    divTemplateTagSuggestionRef = document.getElementById("divTemplateTagSuggestion"),
    divTemplateSelectedTagsRef = document.getElementById("divTemplateSelectedTags");



// class d'une div de modèle de d'activité à inserer dans la liste
class TemplateActivityItemList {
    constructor(key,name,imgRef, parentRef,delayMs = 0, animationEnabled = true){
        this.key = key;
        this.name = name;
        this.imgRef = imgRef;
        this.parentRef = parentRef;
        this.delayMs = delayMs;
        this.animationEnabled = animationEnabled;

        this.element = document.createElement("div");
        this.element.classList.add("item-template-container");

    // Animation (si activée)
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





        // Utilisation d'une fonction fléchée pour conserver le bon "this"
        this.element.addEventListener("click", () => {
            onClicOnTemplateInTemplateMenu(this.key);
        });

        this.render();
    }


    render(){
        this.element.innerHTML = `
            <img class="templateList" src="${this.imgRef}">
            <span class="templateList gestion">${this.name}</span>
        `;

        //insertion dans le parent
        this.parentRef.appendChild(this.element);
    };
}


// -------------------------- ecouteur d'évènement -------------------------------


function onAddEventListenerForTemplateEditor() {
        
    if (devMode === true){
        console.log("[EVENT-LISTENER] : Ajoute les évènements pour l'éditeur modèle d'activité");
    };

    //Le titre
    let titleRef = document.getElementById("inputTemplateTitle");
    const onChangeTitle = (event) => onRemoveFieldRequired(event.target);
    titleRef.addEventListener("change", onChangeTitle);
    onAddEventListenerInRegistry("templateEditor",titleRef,"change", onChangeTitle);

    // FakeSelector
    let fakeSelectRef = document.getElementById("divBtnFakeSelectorActivityTemplateEditor");
    const onClickActivityChoice = () => onClickFakeSelect('templateEditor');
    fakeSelectRef.addEventListener("click",onClickActivityChoice);
    onAddEventListenerInRegistry("templateEditor",fakeSelectRef,"click",onClickActivityChoice);

    //checkbox planned
    let checkBoxPlannedRef = document.getElementById("inputTemplateIsPlanned");
    const onChangeCheckboxPlanned = (event) => onChangeTemplatePlanned(event.target.checked);
    checkBoxPlannedRef.addEventListener("change",onChangeCheckboxPlanned);
    onAddEventListenerInRegistry("templateEditor",checkBoxPlannedRef,"change",onChangeCheckboxPlanned);

    //input number chrono
    let inputTemplateChronoIDArray = [
        "inputDurationTemplateHours",
        "inputDurationTemplateMinutes",
        "inputDurationTemplateSeconds"
    ];

    inputTemplateChronoIDArray.forEach(input=>{
        let inputRef = document.getElementById(input);
        // onInput
        let maxHour = parseInt(inputRef.max);
        const onInput = (event) => formatNumberInput(event.target, maxHour, 2);
        inputRef.addEventListener("input",onInput);
        onAddEventListenerInRegistry("templateEditor",inputRef,"input",onInput);

        //onFocus
        const onFocus = (event) => selectAllText(event.target);
        inputRef.addEventListener("focus",onFocus);
        onAddEventListenerInRegistry("templateEditor",inputRef,"focus",onFocus);

        //onBlur
        const onBlur = (event) => formatNumberInput(event.target, maxHour, 2);
        inputRef.addEventListener("blur",onBlur);
        onAddEventListenerInRegistry("templateEditor",inputRef,"blur",onBlur);

        //onContextMenu
        const onContextMenu = (event) => disableContextMenu(event);
        inputRef.addEventListener("contextmenu",onContextMenu);
        onAddEventListenerInRegistry("templateEditor",inputRef,"contextmenu",onContextMenu);
    });

    // TAG
    const onInputTag = () => onInputTemplateTag();
    inputTemplateTagRef.addEventListener("input",onInputTag);
    onAddEventListenerInRegistry("templateEditor",inputTemplateTagRef,"input",onInputTag);

}







// ------------------------ Fonction de gestion template ------------------------






// Fonction pour récupérer les templates depuis la base
async function onLoadTemplateFromDB() {
    userTemplateListItems = {}
    try {
        const result = await db.allDocs({ include_docs: true }); // Récupère tous les documents

        // Filtrer et extraire uniquement les champs nécessaires
        result.rows
            .map(row => row.doc)
            .filter(doc => doc.type === templateStoreName)
            .forEach(doc => {
                userTemplateListItems[doc._id] = { activityName : doc.activityName, title:doc.title};
            });
        
        if (devMode === true) {
            console.log("[DATABASE] [TEMPLATE] Loading userTemplateListItems :", userTemplateListItems);
        }
    } catch (err) {
        console.error("[DATABASE] [TEMPLATE] Erreur lors du chargement:", err);
    }
}


// récupère les clé des modèles et les tries et gère le bouton d'affichage
function onUpdateTemplateKeys() {

     // Si des éléments sont présent traitement des keys et trie
    if (userTemplateListItems) {
        // Traitement des clés
        userTemplateListKeys = Object.keys(userTemplateListItems);

        // trie les keys sur type d'activité puis par alphabétique
        userTemplateListKeys.sort((a, b) => {
            if (userTemplateListItems[a].activityName < userTemplateListItems[b].activityName) return -1;
            if (userTemplateListItems[a].activityName > userTemplateListItems[b].activityName) return 1;
        
            // Si activityName est identique, on trie par title
            if (userTemplateListItems[a].title < userTemplateListItems[b].title) return -1;
            if (userTemplateListItems[a].title > userTemplateListItems[b].title) return 1;
        
            return 0;
        });

        if (devMode === true) {
            console.log(userTemplateListItems);
            console.log(userTemplateListKeys);
        }

    }else{

    }
}

// Insertion nouveau template (avec ID auto)
async function onInsertNewTemplateInDB(templateToInsertFormat) {
    try {
        // Créer l'objet SANS _id (PouchDB va le générer)
        const newTemplate = {
            type: templateStoreName,
            ...templateToInsertFormat
        };

        // Insérer dans la base avec post()
        const response = await db.post(newTemplate);

        // On peut récupérer l'ID généré si besoin
        newTemplate._id = response.id;
        newTemplate._rev = response.rev;

        if (devMode === true) {
            console.log("[DATABASE] [TEMPLATE] Template inséré :", newTemplate);
        }

        return newTemplate;
    } catch (err) {
        console.error("[DATABASE] [TEMPLATE] Erreur lors de l'insertion du template :", err);
    }
}


// Modification template
async function onInsertTemplateModificationInDB(templateToUpdate, key) {
    try {
        let existingDoc = await db.get(key);

        // Exclure `_id` et `_rev` de templateToUpdate pour éviter qu'ils ne soient écrasés
        const { _id, _rev, ...safeTemplateUpdate } = templateToUpdate;

        const updatedDoc = {
            ...existingDoc,  // Garde `_id` et `_rev`
            ...safeTemplateUpdate // Applique les nouvelles valeurs en évitant d'écraser `_id` et `_rev`
        };

        // Sauvegarde dans la base
        const response = await db.put(updatedDoc);

        if (devMode) console.log("[TEMPLATE] Template mis à jour :", response);

        return updatedDoc; // Retourne l'objet mis à jour
    } catch (err) {
        console.error("Erreur lors de la mise à jour du template :", err);
        return false; // Indique que la mise à jour a échoué
    }
}




// Recherche de template par son id/key
async function findTemplateById(templateId) {
    try {
        const template = await db.get(templateId); // Recherche dans la base
        if (devMode) console.log("Template trouvé :", template);
        currentTemplateEditorID = templateId;
        return template; // Retourne l'objet trouvé
    } catch (err) {
        console.error("Erreur lors de la recherche du template :", err);
        return null; // Retourne null si non trouvé
    }
}


//  ------------------------------------------------------------------------------








// Actualise la liste des modele et gere les boutons selons
function onUpdateTemplateList(updateMenuListRequired) {

    //traitement du statut du bouton New From Template
    onTraiteBtnNewFromTemplateStatus();

    if (devMode === true){
        console.log("[TEMPLATE] Actualisation de la liste des modèles");
        console.log("[TEMPLATE] Nombre de modele : " + userTemplateListKeys.length);
    };

    if (updateMenuListRequired) {
        if (devMode === true){
            console.log("[TEMPLATE] pour l'instant n'affiche pas le bouton 'new from template'");
            console.log("[TEMPLATE] Car je suis dans le menu 'template'");
        } 
    }else{
        // Gere l'affichage du bouton "new from template" selon
        document.getElementById("btnNewFromTemplate").style.display = templateAvailable ? "block" : "none";
    }
    
    // Actualise la liste des template dans le menu template si nécessaire
    if (updateMenuListRequired) {
        if (devMode === true){console.log("[TEMPLATE] Recré la liste de template");};
        onCreateTemplateMenuList(userTemplateListKeys);
    }
}


function onTraiteBtnNewFromTemplateStatus() {
        templateAvailable = userTemplateListKeys.length > 0;

        // Ajout ou non le bouton dans l'array de gestion générale des éléments "home"
    if (templateAvailable && !allDivHomeToDisplayNone.includes("btnNewFromTemplate")) {
        // Ajout le bouton modele aux array de gestion Home
        allDivHomeToDisplayNone.push("btnNewFromTemplate");
        allDivHomeToDisplayBlock.push("btnNewFromTemplate");

        if (devMode === true){console.log("[TEMPLATE] Ajout du bouton aux listes de gestion");};

    } else if (!templateAvailable && allDivHomeToDisplayNone.includes("btnNewFromTemplate")) {
        // Recupère l'index et retire le bouton dans la gestion HOME
        let indexToRemove = allDivHomeToDisplayNone.indexOf("btnNewFromTemplate");
        allDivHomeToDisplayNone.splice(indexToRemove,1);

        indexToRemove = allDivHomeToDisplayBlock.indexOf("btnNewFromTemplate");
        allDivHomeToDisplayBlock.splice(indexToRemove,1);

        if (devMode === true){console.log("[TEMPLATE] Retire le bouton aux listes de gestion");};
    }
}


// Ouvre le menu
function onOpenMenuGestTemplate() {

    // Génération de la liste des modèles
    onCreateTemplateMenuList(userTemplateListKeys);


    onAddEventListenerForTemplateEditor();

    if (devMode === true) {
        onConsoleLogEventListenerRegistry();
    }

    //Création du menu principal
    onCreateMainMenuGestTemplate();
    
    // Génère la liste d'activité pour les modèles
    onGenerateActivityOptionChoice("selectorTemplateCategoryChoice");
    onGenerateFakeOptionList("divFakeSelectOptList");

}


// Génération du menu principal
function onCreateMainMenuGestTemplate() {
    // Vide le précedent contenut
    let divMainMenuParentRef = document.getElementById("divMainBtnMenu");
    divMainMenuParentRef.innerHTML = "";

    //crée les boutons
    //Retour
    new Button_main_menu(btnMainMenuData.return.imgRef,btnMainMenuData.return.text,() => onClickReturnFromGestTemplate());


}
   







// Génération de la liste des modèle de le menu modèle
function onCreateTemplateMenuList(templateKeysList) {
    if (devMode === true){console.log(" [TEMPLATE] génération de la liste");};


    // Référencement et reset
    let divTemplateListMenuRef = document.getElementById("divTemplateListMenu");
    divTemplateListMenuRef.innerHTML = "";
    let divActivityTemplateEndListRef = document.getElementById("divActivityTemplateEndList");
    divActivityTemplateEndListRef.innerHTML = "";


    // remonte le scroll
    onResetScrollBarToTop("divGestTemplate");

    // Affichage en cas d'aucun modèle
    if (templateKeysList.length < 1) {
        divTemplateListMenuRef.innerHTML = "Aucun modèle à afficher !";

        // Insertion du bouton ajouter
        new Button_add("Ajouter un modèle", () => onChangeMenu('NewTemplate'), false,divActivityTemplateEndListRef);

        return
    }


    // Génère la liste
    templateKeysList.forEach((key,index)=>{

        let title = userTemplateListItems[key].title,
            imgRef = activityChoiceArray[userTemplateListItems[key].activityName].imgRef,
            delay = index * animCascadeDelay; // 60ms d’écart entre chaque élément : effet cascade
            
        new TemplateActivityItemList(key,title,imgRef,divTemplateListMenuRef,delay,userSetting.animationEnabled);

        // Creation de la ligne de fin pour le dernier index
        if (index === (userTemplateListKeys.length - 1)) {

            // Insertion du bouton ajouter et desactivation si quota atteind
            let isButtonDisabled = userTemplateListKeys.length >= maxTemplate;

            new Button_add("Ajouter un modèle", () => onChangeMenu('NewTemplate'), isButtonDisabled, divActivityTemplateEndListRef);

            let newClotureList = document.createElement("span");
            newClotureList.classList.add("last-container");
            newClotureList.innerHTML = `ℹ️ Créez jusqu'à ${maxTemplate} modèles d'activités.`;
            divActivityTemplateEndListRef.appendChild(newClotureList);
        }
    });



}







// ------------------- MODIFICATION de modèle --------------------------------






// Lorsque je clique sur un modèle pour le modifier
async function onClicOnTemplateInTemplateMenu(keyRef) {

    templateEditorMode = "modification";


    onResetTemplateInputs();



    // Recherche du modèle à afficher
    let templateItem = await findTemplateById(keyRef);
    onSetTemplateItems(templateItem);

}


// Remplit l'editeur de template avec les éléments du template extrait de la base
function onSetTemplateItems(templateItem) {

    onSetBtnRadio(templateItem.activityName);

    if (devMode === true){console.log("[TEMPLATE] Set l'editeur de modèle avec les éléments extrait de la base");};

    inputTemplateTitleRef.value = templateItem.title;
    inputTemplateLocationRef.value = templateItem.location;
    inputTemplateDistanceRef.value = templateItem.distance;
    textareaTemplateCommentRef.value = templateItem.comment;
    inputTemplateIsPlannedRef.checked = templateItem.isPlanned;

    // Ajoute les TAG si existant
    templateItem.tagList.forEach(tag=>{
        onAddTemplateTag(tag,false);
    });

    // gestion du format duration
    let convertDuration = timeFormatToInputNumber(templateItem.duration);
    inputDurationTemplateHoursRef.value = convertDuration.hours;
    inputDurationTemplateMinutesRef.value = convertDuration.minutes;
    inputDurationTemplateSecondsRef.value = convertDuration.seconds;


    // pour le selecteur d'activité, met le premier éléments qui à dans favoris, ou sinon CAP par défaut, C-A-P
    selectorTemplateCategoryChoiceRef.value = templateItem.activityName;

    // l'image de prévisualisation 
    imgTemplateEditorPreviewRef.src = activityChoiceArray[templateItem.activityName].imgRef;
    pTemplateEditorInfoRef.innerHTML = templateItem.isPlanned ? "📄Modèle d'activité.  🗓️Planifiée :":"📄Modèle d'activité : ";


    //met les éléments du modèle dans une variable pour comparer les modifications par la suite
    currentTemplateInView = templateItem;

    onChangeMenu("ModifyTemplate");
}














// ---------------------------- TEMPLATE EDITEUR - -------------------------------




// Variable pour connaitre dans quel mode l'editeur d'activité est ouvert
let templateEditorMode; //  creation, modification, 

// Format de l'objet pour une nouvelle activité
let templateToInsertFormat = {
    title :"",
    activityName :"",
    location : "",
    distance : "",
    duration : "",
    comment : "",
    isPlanned : false,
    tagList : []
};



//Clique sur créer un nouveau modèle
function onClickBtnCreateTemplate() {
    templateEditorMode = "creation";
    if (devMode === true){console.log("ouverture de l'editeur de template en mode " + templateEditorMode);};

    // Initialise les éléments
    onResetTemplateInputs();

}




// Set l'image de prévisualisation d'activité dans l'éditeur
function onChangeTemplatePreview(activityName) {
    if (devMode === true){console.log(activityName);};
    imgTemplateEditorPreviewRef.src = activityChoiceArray[activityName].imgRef;
} 

// Set l'icone "temporaire" dans la prévisualisation
function onChangeTemplatePlanned(checkBoxValue) {
    pTemplateEditorInfoRef.innerHTML = checkBoxValue ? " 📄Modèle d'activité.  🗓️Planifiée ":"📄Modèle d'activité : ";
}





function onClickSaveFromTemplateEditor(){
    onLockDivDoubleClick(["divMainBtnMenu","divTemplateEditor"]);

    // Lancement du formatage du modèle
    onFormatTemplate();
}



function onFormatTemplate() {

    if (templateEditorMode === "creation") {
        if (devMode === true){console.log("[TEMPLATE] Demande de création d'un nouveau modèle");};
    }else if(templateEditorMode === "modification"){
        if (devMode === true){console.log("[TEMPLATE] Demande d'enregistrement d'une modification de modèle");};
    };
    

    // Verification des champs requis
    if (devMode === true){console.log("[TEMPLATE] controle des champs requis");};
    let emptyField = onCheckEmptyField(inputTemplateTitleRef);

    if (emptyField === true) {
        if (devMode === true){console.log("[TEMPLATE] Champ obligatoire non remplis");};

        onShowNotifyPopup("inputTitleRequired");

        onUnlockDivDoubleClick(["divMainBtnMenu","divTemplateEditor"]);
        return
    };


    //  met tous les éléments dans l'objet

    templateToInsertFormat.activityName = selectorTemplateCategoryChoiceRef.value;
    templateToInsertFormat.title = onSetFirstLetterUppercase(inputTemplateTitleRef.value);
    templateToInsertFormat.distance = inputTemplateDistanceRef.value;
    templateToInsertFormat.location = onSetToUppercase(inputTemplateLocationRef.value);
    templateToInsertFormat.comment = textareaTemplateCommentRef.value;
    templateToInsertFormat.duration = inputTemplateNumberToTime();
    templateToInsertFormat.isPlanned = inputTemplateIsPlannedRef.checked;

    // Récupère les TAG
    templateToInsertFormat.tagList = getTemplateSelectedTagsArray();

    // Demande d'insertion dans la base soit en creation ou en modification

    if (templateEditorMode === "creation") {
        eventInsertNewTemplate(templateToInsertFormat);

    }else if(templateEditorMode === "modification"){
        onCheckIfTemplateModifiedRequired(templateToInsertFormat);
    };

}


// Sauvegarde uniquement si une modification a bien été effectuée dans les données
function onCheckIfTemplateModifiedRequired(templateToInsertFormat) {
    
    // Création d'une liste de champs à comparer
    const fieldsToCompare = [
        { oldValue: currentTemplateInView.title, newValue:  templateToInsertFormat.title },
        { oldValue: currentTemplateInView.activityName, newValue: templateToInsertFormat.activityName },
        { oldValue: currentTemplateInView.distance, newValue: templateToInsertFormat.distance },
        { oldValue: currentTemplateInView.location, newValue: templateToInsertFormat.location },
        { oldValue: currentTemplateInView.comment, newValue:  templateToInsertFormat.comment },
        { oldValue: currentTemplateInView.duration, newValue:  templateToInsertFormat.duration },
        { oldValue: currentTemplateInView.isPlanned, newValue:  templateToInsertFormat.isPlanned },
        { oldValue: currentTemplateInView.tagList, newValue:  templateToInsertFormat.tagList }
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
        if (devMode) console.log("[TEMPLATE] Informations d'activité différentes : Lancement de l'enregistrement en BdD");
        eventInsertTemplateModification(templateToInsertFormat);
    } else {
        if (devMode) console.log("[TEMPLATE] Aucune modification de modèle nécessaire !");
         //Gestion de l'affichage 
        onLeaveMenu("TemplateEditor");
    }

}


// Séquence d'insertion d'un nouveau template
async function eventInsertNewTemplate(templateToInsertFormat) {

    //Insere En base
    let templateAdded = await onInsertNewTemplateInDB(templateToInsertFormat);

    // Insère en variable
    userTemplateListItems[templateAdded._id] = { activityName : templateAdded.activityName, title:templateAdded.title};

    if (devMode=== true) {console.log("userTemplateListItems :",userTemplateListItems);};


    // Actualise le tableau de clé des modèles
    onUpdateTemplateKeys();


    // Popup notification
    onShowNotifyPopup("templateCreation");

    // Remet à jour les éléments
    onUpdateTemplateList(true);

    //Gestion de l'affichage 
    onLeaveMenu("TemplateEditor");
}


// Séquence d'insertion d'une modification
async function eventInsertTemplateModification(templateToInsertFormat) {
    //Modifie en base
    let templateModified = await onInsertTemplateModificationInDB(templateToInsertFormat,currentTemplateEditorID);

    //Modifie la variable
    userTemplateListItems[currentTemplateEditorID] = { activityName : templateModified.activityName, title:templateModified.title};

    if (devMode=== true) {console.log("userTemplateListItems :",userTemplateListItems);};

    // Actualise le tableau de clé des modèles
    onUpdateTemplateKeys();
   
    // Popup notification
    onShowNotifyPopup("templateModification");

    // Remet à jour les éléments visuels
    onUpdateTemplateList(true);

    //Gestion de l'affichage 
    onLeaveMenu("TemplateEditor");
}






// Retour depuis l'editeur de template
function onClickReturnFromTemplateEditor(){
    onLeaveMenu("TemplateEditor");
}









// Reset les inputs du menu activité
function onResetTemplateInputs() {
    if (devMode === true){console.log("reset les inputs du menu template");};
    inputTemplateTitleRef.value = "";
    inputTemplateLocationRef.value = "";
    inputTemplateDistanceRef.value = "";

    inputDurationTemplateHoursRef.value = "00";
    inputDurationTemplateMinutesRef.value = "00";
    inputDurationTemplateSecondsRef.value = "00";
    textareaTemplateCommentRef.value = "";
    inputTemplateIsPlannedRef.checked = false;
    inputTemplateTagRef.value = "";
    divTemplateTagSuggestionRef.innerHTML = "";
    divTemplateSelectedTagsRef.innerHTML = "";

    // pour le selecteur d'activité, met le premier éléments qui à dans favoris, ou sinon CAP par défaut, C-A-P
    selectorTemplateCategoryChoiceRef.value = userFavoris.length > 0 ? userFavoris[0] : "C-A-P";

    // l'image de prévisualisation 
    imgTemplateEditorPreviewRef.src = userFavoris.length > 0 ? activityChoiceArray[userFavoris[0]].imgRef  : activityChoiceArray["C-A-P"].imgRef;
    pTemplateEditorInfoRef.innerHTML = "📄Modèle d'activité : ";

    inputTemplateTitleRef.classList.remove("fieldRequired");


    //création du menu principale selon modification ou nouveau
    onCreateMainMenuTemplateEditor();
};


// Génération du menu principal
function onCreateMainMenuTemplateEditor() {
    // Vide le précedent contenut
    let divMainMenuParentRef = document.getElementById("divMainBtnMenu");
    divMainMenuParentRef.innerHTML = "";

    //crée les boutons
    //Retour
    new Button_main_menu(btnMainMenuData.return.imgRef,btnMainMenuData.return.text,() => onClickReturnFromTemplateEditor());

    // Apparition du menu 'supprimer'
    if (templateEditorMode === "modification") {
        new Button_main_menu(btnMainMenuData.delete.imgRef,btnMainMenuData.delete.text,() => onClickDeleteFromTemplateEditor());
    }

    //Valider
    new Button_main_menu_Valider("Valider",() => onClickSaveFromTemplateEditor());

}
   



// --------------------- SUPPRESSION TEMPLATE --------------------------






// Suppression d'activité
function onClickDeleteFromTemplateEditor() {

    if (devMode === true){console.log("[TEMPLATE]demande de suppression template ");};

    // L'affiche de la div doit se faire en "flex" donc je n'utilise pas le onChangeDisplay
    let confirmText = "Supprimer modèle ?";
    addEventForGlobalPopupConfirmation(onAnnulDeleteTemplate,onConfirmDeleteTemplate,confirmText,"delete");

    onChangeDisplay([],[],[],["divTemplateEditor"],[],[],[]);
};


function onConfirmDeleteTemplate(event){

    event.stopPropagation();// Empêche la propagation du clic vers la div d'annulation
    if (devMode === true){console.log("[TEMPLATE] Confirmation de suppression de template ");};

    onLockDivDoubleClick(["divMainBtnMenu","divTemplateEditor"]);//met la sécurité double click

    // retire la class "show" pour la div de confirmation
    removeEventForGlobalPopupConfirmation();
    onChangeDisplay([],[],[],[],["divTemplateEditor"],[],[]);

    eventDeleteTemplate(currentTemplateEditorID);


};


// Sequence de suppression d'un template
async function eventDeleteTemplate(idToDelete) {

    //Envoie vers la corbeille
    await sendToRecycleBin(idToDelete);

    //supprime de la variable
    delete userTemplateListItems[idToDelete];

    if (devMode === true) {console.log("userTemplateListItems :",userTemplateListItems);};

    //actualise le tableau des clés
    onUpdateTemplateKeys();

    // Popup notification
    onShowNotifyPopup("templateDeleted");

    // Remet à jour les éléments visuel
    onUpdateTemplateList(true);

    //Gestion de l'affichage 
    onLeaveMenu("TemplateEditor");
}








function onAnnulDeleteTemplate(event) {
    
    if (devMode === true){console.log("[TEMPLATE] annulation de la suppression de template ");};
    // retire la class "show" pour la div de confirmation
    removeEventForGlobalPopupConfirmation();
    onChangeDisplay([],[],[],[],["divTemplateEditor"],[],[]);

};





// ---------------------------- SELECTION D'un TEMPLATE ---------------------------------


// Ecouteur d'évènement pour le selecteur de template

let isAddEventListenerForAnnulSelectTemplate = false;
function onAddEventListenerForAnnulSelectTemplate() {
    if (devMode === true){
        console.log("[EVENT-LISTENER] : Ajout les évènements annulation selecteur");
    };


    isAddEventListenerForAnnulSelectTemplate = true;

    let locDivTemplateChoiceRef = document.getElementById("divTemplateChoice");
    locDivTemplateChoiceRef.addEventListener("click",(event)=>{
        onAnnulSelectTemplate(event);
    });

}




function onAnnulSelectTemplate(event) {
    event.stopPropagation();
    if (devMode === true){console.log("Traitement pour quitter le menu : TemplateChoice");};
    onChangeDisplay(["divTemplateChoice"],[],[],[],[],[],[]);
}







// Génération de la liste des modèle lors de la selection d'un modèle pour créer une activité
function onCreateTemplateChoiceList() {
    if (devMode === true){console.log(" [TEMPLATE] génération de la liste pour choisir le modèle");};

    // Ajout ecouteur évènement pour retour/annulation
    if (!isAddEventListenerForAnnulSelectTemplate) {
        onAddEventListenerForAnnulSelectTemplate();
    }


    let divTemplateChoiceListRef = document.getElementById("divTemplateChoiceList");
    // Reset
    divTemplateChoiceListRef.innerHTML = "";

    // Génère la liste
    userTemplateListKeys.forEach((key,index)=>{

        // Creation
        let newContainer = document.createElement("div");
        newContainer.classList.add("fake-opt-item-container");
        newContainer.onclick = async function (){
            onChangeMenu("NewActivityFromTemplate");
            let templateItem = await findTemplateById(key);
            onOpenNewActivityFromTemplate(templateItem);
        }

        // Style sans border botton pour le dernier
        if (index === (userTemplateListKeys.length - 1)) {
            newContainer.classList.add("fake-opt-item-last-container");
        }




        let newImg = document.createElement("img");
        newImg.classList.add("fake-opt-item");
        newImg.src = activityChoiceArray[userTemplateListItems[key].activityName].imgRef;

        let newTitle = document.createElement("span");
        newTitle.innerHTML = userTemplateListItems[key].title;
        newTitle.classList.add("fake-opt-item");


        // Bouton radio fake pour simuler le selecteur
        let newBtnRadioFake = document.createElement("div");
        newBtnRadioFake.classList.add("radio-button-fake");

        // Effet bouton plein pour le premier item de la liste
        if (index === 0) {
            newBtnRadioFake.classList.add("selected");
        }




        // Insertion

        newContainer.appendChild(newImg);
        newContainer.appendChild(newTitle);
        newContainer.appendChild(newBtnRadioFake);

        divTemplateChoiceListRef.appendChild(newContainer);
    });
}



// Fonction récupérer les valeur des inputs number et les convertir au format input time
function inputTemplateNumberToTime() {

    let hhh = inputDurationTemplateHoursRef.value.padStart(2, '0');
    let mm = inputDurationTemplateMinutesRef.value.padStart(2, '0');
    let ss = inputDurationTemplateSecondsRef.value.padStart(2, '0');

    // Mettre à jour l'affichage dans le champ text
    return `${hhh}:${mm}:${ss}`;
}



// ---------------------------------- TAG ---------------------------------------------------





function onInputTemplateTag() {
    const normalizedTAG = normalizeTag(inputTemplateTagRef.value);

    // Réinitialise les suggestions à chaque frappe
    divTemplateTagSuggestionRef.innerHTML = "";

    // Si input vide après normalisation → rien à afficher
    if (!normalizedTAG) return;

    // Recherche des tags existants qui commencent par la saisie
    const matches = Array.from(tagReferenciel)
        .filter(tag => tag.startsWith(normalizedTAG))
        .slice(0, 5); // limite UX : max 5 suggestions

    // Aucun match → proposer la création du tag
    if (matches.length === 0) {
        const newDiv = document.createElement("div");
        newDiv.className = "tag-suggestion create";
        newDiv.textContent = `Créer ${normalizedTAG}`;

        // Tap = création du nouveau tag
        newDiv.onclick = () => onAddTemplateTag(normalizedTAG,true);

        divTemplateTagSuggestionRef.appendChild(newDiv);
    } 
    // Des matchs existent → les afficher
    else {
        matches.forEach(tag => {
        const newDiv = document.createElement("div");
        newDiv.className = "tag-suggestion";
        newDiv.textContent = tag;

        // Tap = ajout du tag sélectionné
        newDiv.onclick = () => onAddTemplateTag(tag,false);

        divTemplateTagSuggestionRef.appendChild(newDiv);
        });
    }
}



/**
 * Ajoute un tag sélectionné / créé à la liste des tags actifs
 */
function onAddTemplateTag(tag,isTagSaveRequired = false) {

    // Règle métier : maximum 3 tags sélectionnés
    if (divTemplateSelectedTagsRef.children.length >= MAX_SELECTED_TAG) {
        alert(`${MAX_SELECTED_TAG} tags maximum`);
        return;
    }

    // Empêche l’ajout du même tag deux fois
    if ([...divTemplateSelectedTagsRef.children].some(item =>
        item.querySelector(".tag-label")?.textContent === tag
    )) {
        return;
    }

    // Ajoute le tag à la base utilisateur (pour futures suggestions) et sauvegarde
    if (isTagSaveRequired) {
        eventAddNewTag(tag);
    }

    // Conteneur principal du tag
    const newDiv = document.createElement("div");
    newDiv.className = "tag";

    // Libellé du tag
    const newLabelSpan = document.createElement("span");
    newLabelSpan.className = "tag-label";
    newLabelSpan.textContent = tag;

    // Croix visuelle (indice UX de suppression)
    const newCloseSpan = document.createElement("span");
    newCloseSpan.className = "close";
    newCloseSpan.textContent = "×";

    // Construction du tag
    newDiv.appendChild(newLabelSpan);
    newDiv.appendChild(newCloseSpan);

    // UX mobile :
    // Tap n’importe où sur le tag = suppression
    newDiv.onclick = () => {
        newDiv.remove();
    };

    // Ajout du tag à l’écran
    divTemplateSelectedTagsRef.appendChild(newDiv);

    // Reset de l’input et des suggestions
    inputTemplateTagRef.value = "";
    divTemplateTagSuggestionRef.innerHTML = "";
}




/**
 * Retourne les tags sélectionnés sous forme de tableau
 * @returns {string[]}
 */
function getTemplateSelectedTagsArray() {
    return [...divTemplateSelectedTagsRef.children].map(item =>
        item.querySelector(".tag-label")?.textContent
    );
}





// Quitte le menu
function onClickReturnFromGestTemplate() {
    //Vide les listes
    document.getElementById("divTemplateListMenu").innerHTML = "";
    document.getElementById("divActivityTemplateEndList").innerHTML = "";

    onLeaveMenu("GestTemplate");
}

