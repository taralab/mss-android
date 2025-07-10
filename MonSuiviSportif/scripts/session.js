
let userSessionItemsList = {
        counter_utkyzqjy0: {
            name: "NOUVEAU COMPTEUR",
            type: "counter/chrono/minuteur",
            currentSerie: 0,
            serieTarget: 0,
            repIncrement: 0,
            totalCount: 0,
            displayOrder: 0,
            color: "white"
        }
    },
    maxSessionItems = 20,
    sessionItemsSortedKey = [],//array des clé trié par "displayOrder"
    sessionItemEditorMode, //creation ou modification
    currentSessionItemEditorID,//L'id de l'items en cours de modification
    sessionStartTime = "--:--:--",//date-heure du début de session set lorsque clique sur reset all counter, ou générate session
    sessionStorageName = "MSS_sessionCounterList",
    sessionStartTimeStorageName = "MSS_sessionStartTime",
    sortableInstance = null;//instance pour le drag n drop

let sessionItemColors = {
    white: {body:"#fff",button:"grey"},
    green: {body:"#E7F8F2",button:"#4EA88A"},
    yellow: {body:"#FFFBE5",button:"#C8A646"},
    red: {body:"#FDEBEC",button:"#D36868"},
    blue: {body:"#E6F0FA",button:"#2B7FBF"},
    violet: {body:"#F3F0FA",button:"#8A7EBF"},
    orange: {body:"#FFF1EC",button:"#E38B6D"},
    rose: {body:"#FAEFF4",button:"#C57CA5"}
};

let sessionItemColorSelected = "#fff";//utiliser lors de la création d'un compteur

//Les id des inputs number pour le minuteurs
let inputNumberMinuteurIdArray = [
        "inputMinuteurSessionHours",
        "inputMinuteurSessionMinutes",
        "inputMinuteurSessionSeconds"
    ];

// Objet compteur
class Counter {
    constructor(id, name, currentSerie, serieTarget, repIncrement,displayOrder,parentRef,colorName,totalCount){
        this.id = id;
        this.name = name;
        this.currentSerie = currentSerie;
        this.serieTarget = serieTarget;
        this.repIncrement = repIncrement;
        this.displayOrder = displayOrder;
        this.parentRef = parentRef;
        this.colorName = colorName;
        this.totalCount = totalCount;

        // div container
        this.element = document.createElement("div");
        this.element.classList.add("compteur-container");
        this.element.style.backgroundColor = sessionItemColors[this.colorName].body;
        this.element.id = `counterContainer_${id}`;

        this.buttonColor = sessionItemColors[this.colorName].button;

        this.render();
    }



    // génération de l'élément
    render(){
        this.element.innerHTML = `
            <div class="compteur-content-line-1">
                <div class="drag-handle">⣿</div>
                <p class="compteur-name" id="counterName_${this.id}">${this.name}</p>
                <button class="btn-counter-setting" id="btnModifyCounter_${this.id}">
                    <img src="./Icons/Icon-Autres.webp" alt="" srcset="">
                </button>  
            </div>

            <div class="compteur-content-line-2" id="divCounterCurrentSerie_${this.id}">
                <div class="compteur-content-line-2-left">
                    <span class="current-serie" id="spanCurrentSerie_${this.id}">${this.currentSerie}</span>
                    <span class="serie-target" id="spanSerieTarget_${this.id}">/${this.serieTarget}</span>
                    <span class="serie-text">séries</span>
                </div>
                <span class="counter-total" id="spanTotalCount_${this.id}">Total : ${this.totalCount}</span>
            </div>


            <div class="compteur-content-line-3">
                <p class="compteur-navigation">
                    <button class="btn-counter-reset" id="btnCountReset_${this.id}"><img src="./Icons/Icon-Reset.webp" alt="" srcset=""></button>
                </p>
                <div class="wrapper rep">
                <input type="number" class="compteur" id="inputRepIncrement_${this.id}" placeholder="0" value=${this.repIncrement}>
                </div>
                <button style="background-color: ${this.buttonColor};" class="counter" id="btnRepIncrement_${this.id}">
                    <img src="./Icons/Icon-Accepter-blanc.webp" alt="">
                </button>  
            </div>

            <img src="./Icons/Icon-Counter-Done.webp" class="overlay-image-rayure" id="imgCounterTargetDone_${this.id}" alt="Rature">
        `;


        // Insertion
        this.parentRef.appendChild(this.element);

        // Ajout des écouteurs d'évènement
        this.addEvent();
    }



    // ajout des écouteurs d'évènements    
    addEvent(){
            // Modifier compteur
            let btnModifyCounterRef = this.element.querySelector(`#btnModifyCounter_${this.id}`);
            btnModifyCounterRef.addEventListener("click", ()=>{
            onClickModifyCounter(this.id);
            });

            // Incrementer
            let btnIncrementCounterRef = this.element.querySelector(`#btnRepIncrement_${this.id}`);
            btnIncrementCounterRef.addEventListener("click", () =>{
                onClickIncrementeCounter(this.id);
            });
            
            // Reset
            let btnResetCounterRef = this.element.querySelector(`#btnCountReset_${this.id}`);
            btnResetCounterRef.addEventListener("click", () =>{
                onClickResetCounter(this.id);
            });

            // modifier input
            let btnInputCounterRef = this.element.querySelector(`#inputRepIncrement_${this.id}`);
            btnInputCounterRef.addEventListener("change", () =>{
                onChangeCounterRepIncrement(this.id);
            });
            btnInputCounterRef.addEventListener("focus", (event) =>{
                selectAllText(event.target);
            });
            btnInputCounterRef.addEventListener("contextmenu", (event) =>{
                disableContextMenu(event);
            });
    }
}



// --------------------------------------- LOCAL STORAGE -----------------------------------------

function onUpdateSessionItemsInStorage() {
    localStorage.setItem(sessionStorageName, JSON.stringify(userSessionItemsList));
}

function onUpdateSessionTimeInStorage() {
    localStorage.setItem(sessionStartTimeStorageName, sessionStartTime);
}



function getSessionItemListFromLocalStorage() {
    userSessionItemsList = {};

    userSessionItemsList = JSON.parse(localStorage.getItem(sessionStorageName)) || {};

}


function getSessionStartTimeFromLocalStorage() {
    sessionStartTime = localStorage.getItem(sessionStartTimeStorageName) || "--:--:--";
}




// ------------------------------------------------ Ecouteur évènement -----------------------------------------

//Pour le menu compteur editeur
let isEventListenerForCounterEditor = false;

function onAddEventListenerforSessionItemEditor() {
    
    if (devMode === true){
        console.log("[EVENT-LISTENER] : Ajout les évènements pour l'éditeur de counter");
    };


    // Set le boolean pour action unique
    isEventListenerForCounterEditor = true;



    // LA div générale avec action retour
    let divEditCounterRef = document.getElementById("divEditCounter");
    divEditCounterRef.addEventListener("click",(event)=>{
        onAnnulSessionItemEditor(event);
    });


    //La div intérieure contenur les actions
    let divEditCounterContentRef = document.getElementById("divEditCounterContent");
    divEditCounterContentRef.addEventListener("click", (event)=>{
        onClickDivNewPopupContent(event);
    });



    // Le selecteur pour changer de type d'item
    let selectItemSessionTypeRef = document.getElementById("selectItemSessionType");
    selectItemSessionTypeRef.addEventListener("change", (event)=>{
        onChangeSessionItemType(event.target.value);
    });

    //input number
    let inputNumberIDArray = [
        "inputEditSerieTarget",
        "inputEditRepIncrement"
    ];

    //Pour chaque input
    inputNumberIDArray.forEach(id =>{
        //ajout le focus
        let inputTarget = document.getElementById(id);
        inputTarget.addEventListener("focus", (event)=>{
            selectAllText(event.target);
        });
        //Ajout le context menu
        inputTarget.addEventListener("contextmenu",(event)=>{
            disableContextMenu(event);
        });
    });

    //input number minuteur
    inputNumberMinuteurIdArray.forEach(input=>{
        let inputRef = document.getElementById(input);
        // onInput
        let maxHour = parseInt(inputRef.max);
        inputRef.addEventListener("input",(event)=>{
            formatNumberInput(event.target, maxHour, 2);
        });

        //onFocus
        inputRef.addEventListener("focus",(event)=>{
            selectAllText(event.target);
        });

        //onBlur
        inputRef.addEventListener("blur",(event)=>{
            formatNumberInput(event.target, maxHour, 2);
        });

        //onContextMenu
        inputRef.addEventListener("contextmenu",(event)=>{
            disableContextMenu(event);
        });
    });

    // Les couleurs
    let btnColorCounterChoiceArray = document.querySelectorAll(".btnChooseColor");
    btnColorCounterChoiceArray.forEach(btn=>{
        let btnColor = btn.dataset.btnSessionItemColor;
        btn.addEventListener("click",()=>{
            onChooseSessionItemColor(btnColor);
        });
    });


    // Le menu de navigation
    //Retour
    let btnReturnRef = document.getElementById("btnReturnCounterEditor");
    btnReturnRef.addEventListener("click", (event)=>{
        onAnnulSessionItemEditor(event);
    });

    //Supprimer
    let btnDeleteRef = document.getElementById("btnDeleteSessionItem");
    btnDeleteRef.addEventListener("click", ()=>{
        onClickDeleteSessionItem();
    });

    //Valider
    let btnValideRef = document.getElementById("btnValideCounterEditor");
    btnValideRef.addEventListener("click",(event)=>{
        onConfirmSessionItemEditor(event);
    });


}



//Evènement pour le menu principale de session

let isAddEventForMainMenuSession = false;
function onAddEventListenerForMainMenuSession() {

    if (devMode === true){
        console.log("[EVENT-LISTENER] : Ajout les évènements pour le menu principale session");
    };


    //Pour action unique
    isAddEventForMainMenuSession = true;

    // Partie menu supplémentaire
    //annulation
    let locDivSessionMenuSupRef = document.getElementById("divSessionMenuSup");
    locDivSessionMenuSupRef.addEventListener("click",(event)=>{
        onAnnulSessionMenuSup(event);
    });

    //Menu générer session
    let locBtnMenuSessionGenerateRef = document.getElementById("btnMenuSessionGenerate");
    locBtnMenuSessionGenerateRef.addEventListener("click",(event)=>{
        onChooseSessionMenuSup(event,'generateSession');
    });


    //Menu envoyer vers activité
    let locBtnMenuSessionSendRef = document.getElementById("btnMenuSessionSend");
    locBtnMenuSessionSendRef.addEventListener("click",(event)=>{
        onChooseSessionMenuSup(event,'sendToActivity');
    });

}



// Evènement pour le pop créate session

let isAddEventListenerForSessionEditor = false;
function onAddEventListenerForSessionEditor() {
    if (devMode === true){
        console.log("[EVENT-LISTENER] : Ajoute les évènements pour l'éditeur de session");
    }

    isAddEventListenerForSessionEditor = true;

    //retour depuis la div
    let locDivPopCreateSessionRef = document.getElementById("divPopCreateSession");
    locDivPopCreateSessionRef.addEventListener("click",(event)=>{
        onCancelCreateSession(event);
    });

    //Clic dans la zone créate session
    let locCreateSessionAreaRef = document.getElementById("divCreateSessionArea");
    locCreateSessionAreaRef.addEventListener("click",(event)=>{
        onClickOnCreateSessionArea(event);
    });

    //Selecteur de template
    let locSelectSessionTableModelNameRef = document.getElementById("selectSessionTableModelName");
    locSelectSessionTableModelNameRef.addEventListener("change", (event)=>{
        onChangeSelectorChooseTemplateSession(event.target.value)
    });

    //Bouton annuler création session
    let locBtnCancelCreateSessionRef = document.getElementById("btnCancelCreateSession");
    locBtnCancelCreateSessionRef.addEventListener("click",(event)=>{
        onCancelCreateSession(event);
    });

    // Valider la création de session
    let locBtnValidCreateSessionRef = document.getElementById("btnValidCreateSession");
    locBtnValidCreateSessionRef.addEventListener("click",()=>{
        eventGenerateSessionList();
    });

}


// Pour le fakeSelecteur envoie vers activité
let isAddEventListenerForSendFakeSelector = false;
function onAddEventListenerForSendFakeSelector() {

    if (devMode === true){
        console.log("[EVENT-LISTENER] : Ajoute les évènements pour fake selector");
    }

    //action unique
    isAddEventListenerForSendFakeSelector = true;

    let locDivFakeSelectSessionRef = document.getElementById("divFakeSelectSession");
    locDivFakeSelectSessionRef.addEventListener("click", (event)=>{
        onCloseFakeSelectSession(event);
    });


}




// ---------------------------------------- Fin écouteur evènement--------------------






async function onOpenMenuSession(){


    // Récupère les éléments
    getSessionItemListFromLocalStorage();
    getSessionStartTimeFromLocalStorage();

    //Ajoutes les écouteurs d'évènement la prémière fois
    if (!isEventListenerForCounterEditor  || !isAddEventForMainMenuSession) {
        onAddEventListenerforSessionItemEditor();
        onAddEventListenerForMainMenuSession();
    }


    if (devMode === true){console.log("userSessionItemsList", userSessionItemsList)}

    // set l'heure d'initialisation de session dans le texte
    document.getElementById("customInfo").innerHTML = `<b>Début à : ${sessionStartTime}<b>`;

    onDisplaySessionItems();

    // Instancie le system de drag N drop
    onInitSortable("divSessionCompteurArea");

    // Charge également les listes des modèles et leur clé dans l'ordre alphabétique
    await onLoadTemplateSessionNameFromDB();

    //création menu principal
    onCreateMainMenuSession();

}
   
   
   // Génération du menu principal
function onCreateMainMenuSession() {
    // Vide le précedent contenut
    let divMainMenuParentRef = document.getElementById("divMainBtnMenu");
    divMainMenuParentRef.innerHTML = "";

    //crée les boutons
    //Retour
    new Button_main_menu(btnMainMenuData.return.imgRef,btnMainMenuData.return.text,() => onClickReturnFromSession());
    //Reset
    new Button_main_menu(btnMainMenuData.reset.imgRef,btnMainMenuData.reset.text,() => onClickResetAllCounter());
    //Action
    new Button_main_menu(btnMainMenuData.action.imgRef,btnMainMenuData.action.text,() => onClickOpenSessionMenuSup());


}
  
   


// Initialise l'heure du début de session
//lorsque reset all ou génénère la session
function onSetSessionStartTime() {
    sessionStartTime = onGetCurrentTimeAndSecond();
    document.getElementById("customInfo").innerHTML = `<b>Début à : ${sessionStartTime}<b>`;
}








// Les menus supplémentaires de sessoin
function onClickOpenSessionMenuSup(){
    document.getElementById("divSessionMenuSup").style.display = "flex";

    // Animation des icones
    onPlayAnimationIconMenu("divSessionMenuSup",".btn-menu-sup");

};

// Choix d'un menu supplémentaire
function onChooseSessionMenuSup(event,target) {
    event.stopPropagation();
    document.getElementById("divSessionMenuSup").style.display = "none";

    switch (target) {
        case "sendToActivity":
            onClickSendSessionToActivity();
            break;
        case "generateSession":
            onClickMenuCreateSession();
            break;
    
        default:
            break;
    }

};


// Annulation du menu suplémentaire
function onAnnulSessionMenuSup(){
    document.getElementById("divSessionMenuSup").style.display = "none";
};





// ---------------------------------------- FIN FONCTION GLOBAL -------------------------








// ---------------------- configuration compteur --------------------





// Valeur incrementation
async function onChangeCounterRepIncrement(idRef) {

    // Actualise l'array
    userSessionItemsList[idRef].repIncrement = parseInt(document.getElementById(`inputRepIncrement_${idRef}`).value) || 0;


    // Sauvegarde en localStorage
    onUpdateSessionItemsInStorage();
}






//----------------------------- Nouvel ELEMENT ------------------------------------


function onClickAddSessionItem() {
    // Reset les éléments avant set
    onResetSessionItemEditor();

    // Set le mode d'utilisation de l'éditeur de compteur
    sessionItemEditorMode = "creation";
    
    // Cache le bouton supprimer et active le bouton du choix du type d'item
    document.getElementById("btnDeleteSessionItem").style.visibility = "hidden";
    document.getElementById("selectItemSessionType").disabled = false;

    // Affiche 
    document.getElementById("divEditCounter").style.display = "flex";
}






function onAnnulSessionItemEditor(){
    document.getElementById("divEditCounter").style.display = "none";
}


// Empeche de fermer la div lorsque l'utilisateur clique dans cette zone
function onClickDivNewPopupContent(event) {
    event.stopPropagation();
}



// Gestion des couleurs

function onChooseSessionItemColor(color) {
    document.getElementById("divEditCounterContent").style.backgroundColor = sessionItemColors[color].body;
    sessionItemColorSelected = color;
}



// Changement de type d'éléments de session dans l'éditeur
function onChangeSessionItemType(itemType) {
    // 1. Masque les 3 zones dynamiques
    let sessionTypecAreaIDs = {
        COUNTER : "itemSessionCounterEditor",
        CHRONO : "itemSessionChronoEditor",
        MINUTEUR : "itemSessionMinuteurEditor"
    };
    let dynamicTypeAreaKeys = Object.keys(sessionTypecAreaIDs);
    dynamicTypeAreaKeys.forEach(key=>{
        document.getElementById(sessionTypecAreaIDs[key]).style.display = "none";
    });
        

    // 2. Affiche la zone demandée
    document.getElementById(sessionTypecAreaIDs[itemType]).style.display = "block";
}



function onConfirmSessionItemEditor() {
    
    // filtre selon le mode d'utilisation de l'éditeur de compteur
    if (sessionItemEditorMode === "creation"){
        eventCreateSessionItem();
    }else if (sessionItemEditorMode === "modification") {
        eventSaveModifySessionItem();
    }else{
        console.log("erreur dans le mode d'édition du compteur");
    }

}


function eventCreateSessionItem() {
    
    // masque le popup de création
    document.getElementById("divEditCounter").style.display = "none";

    // Formatage
    let counterData = onFormatNewCounter();

    // Obtenir le prochain ID
    let nextId = getRandomShortID("counter_",userSessionItemsList);

    // Ajout du nouveau compteur à l'array
    userSessionItemsList[nextId] = counterData;

    // Enregistrement
    eventInsertNewSessionItem();

}



//Séquence d'insertion d'un nouveau compteur

async function eventInsertNewSessionItem() {

    if (devMode === true){console.log("userSessionItemsList", userSessionItemsList)}

    // Sauvegarde en localStorage
    onUpdateSessionItemsInStorage();

    // fonction de création affichage des compteurs
    onDisplaySessionItems();
    

    // Popup notification
    onShowNotifyPopup("counterCreated");

}



function onFormatNewCounter() {

    // Récupère le nom du compteur ou set un nom par défaut
    let newCounterName = document.getElementById("inputEditSessionItemName").value || "Nouveau Compteur";

    
    // Formatage du nom en majuscule
    newCounterName = onSetToUppercase(newCounterName);


    // formatage du nom. Recherche de doublon
    let isCounterDoublonName = Object.values(userSessionItemsList).some(counter => counter.name === newCounterName);

    if (isCounterDoublonName) {
        if (devMode === true){console.log(" [COUNTER] Doublon de nom détecté");}
        newCounterName += "_1";
    }

    // Récupère l'objectif ou set 0
    let newserieTarget = parseInt(document.getElementById("inputEditSerieTarget").value) || 0,
        newRepIncrement = parseInt(document.getElementById("inputEditRepIncrement").value) || 0;

    

    // définition du displayOrder
    let newDisplayOrder = Object.keys(userSessionItemsList).length || 0;


    let formatedCounter = {
        name: newCounterName, 
        currentSerie: 0, serieTarget: newserieTarget, repIncrement:newRepIncrement, totalCount:0,
        displayOrder : newDisplayOrder,
        color : sessionItemColorSelected
    };

    return formatedCounter;

}




// Modification de compteur
function onClickModifyCounter(idRef) {
    sessionItemEditorMode = "modification";
    currentSessionItemEditorID = idRef;

    // set les éléments
    document.getElementById("inputEditSessionItemName").value = userSessionItemsList[idRef].name;
    document.getElementById("inputEditSerieTarget").value = userSessionItemsList[idRef].serieTarget;
    document.getElementById("inputEditRepIncrement").value = userSessionItemsList[idRef].repIncrement;
    document.getElementById("divEditCounterContent").style.backgroundColor = sessionItemColors[userSessionItemsList[idRef].color].body;
    sessionItemColorSelected = userSessionItemsList[idRef].color;


    // rend le bouton supprimer visible et block le choix du type d'item
    document.getElementById("btnDeleteSessionItem").style.visibility = "visible";
    document.getElementById("selectItemSessionType").disabled = true;


    // Affiche 
    document.getElementById("divEditCounter").style.display = "flex";


}





async function eventSaveModifySessionItem() {

    // masque le popup de création
    document.getElementById("divEditCounter").style.display = "none";

    // Formatage
    let counterData = onFormatModifyCounter();

    // Enregistrement dans l'array
    userSessionItemsList[currentSessionItemEditorID].name = counterData.name;
    userSessionItemsList[currentSessionItemEditorID].serieTarget = counterData.serieTarget;
    userSessionItemsList[currentSessionItemEditorID].repIncrement = counterData.repIncrement;
    userSessionItemsList[currentSessionItemEditorID].color = counterData.color;

    // Actualisation de l'affichage
    document.getElementById(`counterName_${currentSessionItemEditorID}`).innerHTML = counterData.name;
    document.getElementById(`counterContainer_${currentSessionItemEditorID}`).style.backgroundColor = sessionItemColors[counterData.color].body;
    document.getElementById(`spanSerieTarget_${currentSessionItemEditorID}`).innerHTML = `/${counterData.serieTarget}`;
    document.getElementById(`inputRepIncrement_${currentSessionItemEditorID}`).value = counterData.repIncrement;
    document.getElementById(`btnRepIncrement_${currentSessionItemEditorID}`).style.backgroundColor = sessionItemColors[counterData.color].button;
    
    

    if (devMode === true){
        console.log("userSessionItemsList", userSessionItemsList);
        console.log("demande de vérification DONE");
    }
    // Met également à jour l'image DONE si nécessaire
    onCheckTargetReach(currentSessionItemEditorID);

    // Sauvegarde en localStorage
    onUpdateSessionItemsInStorage();

}



function onFormatModifyCounter() {

    // Récupère le nom du compteur ou set un nom par défaut
    let newCounterName = document.getElementById("inputEditSessionItemName").value || "Nouveau Compteur";
    
    // Formatage du nom en majuscule
    newCounterName = onSetToUppercase(newCounterName);

    // Récupère l'objectif ou set 0
    let newserieTarget = parseInt(document.getElementById("inputEditSerieTarget").value) || 0;
        newRepIncrement = parseInt(document.getElementById("inputEditRepIncrement").value) || 0;

    let formatedCounter = {
        name: newCounterName, 
        currentSerie: 0, serieTarget: newserieTarget, repIncrement:newRepIncrement, totalCount:0,
        displayOrder : 0,
        color : sessionItemColorSelected
    };

    return formatedCounter;

}




// l'affichage des compteurs de fait sur le trie des "displayOrder"

function onDisplaySessionItems() {
    if (devMode === true){console.log(" [COUNTER] génération de la liste");}

    // div qui contient les compteurs
    let divSessionCompteurAreaRef = document.getElementById("divSessionCompteurArea");
    // Reset
    divSessionCompteurAreaRef.innerHTML = "";


    // div de fin de liste (bouton et info)
    let divSessionEndListRef = document.getElementById("divSessionEndList");
    divSessionEndListRef.innerHTML = "";

    // Affichage en cas d'aucune modèle
    if (Object.keys(userSessionItemsList).length < 1) {
        divSessionCompteurAreaRef.innerHTML = "Aucun compteur à afficher !";

        new Button_add("Ajouter un élément",() => onClickAddSessionItem(),false,divSessionEndListRef);
        return
    }


    // récupère la liste des clé trié par displayOrder
    sessionItemsSortedKey = [];

    sessionItemsSortedKey = getSortedKeysByDisplayOrder(userSessionItemsList);

    sessionItemsSortedKey.forEach((key,index)=>{

        // Generation
        new Counter(
            key,userSessionItemsList[key].name,
            userSessionItemsList[key].currentSerie,userSessionItemsList[key].serieTarget,userSessionItemsList[key].repIncrement,
            userSessionItemsList[key].displayOrder,divSessionCompteurAreaRef,userSessionItemsList[key].color,
            userSessionItemsList[key].totalCount
        );


        // control des objectifs atteinds pour chaque compteur généré
        onCheckTargetReach(key); 

        // Creation de la ligne de fin pour le dernier index
        if (index === (Object.keys(userSessionItemsList).length - 1)) {
            let ismaxSessionItemsReach = Object.keys(userSessionItemsList).length >= maxSessionItems;
            new Button_add("Ajouter un élément",() => onClickAddSessionItem(),ismaxSessionItemsReach,divSessionEndListRef);

            let newClotureList = document.createElement("span");
            newClotureList.classList.add("last-container");
            newClotureList.innerHTML = `ℹ️ Vous pouvez créer jusqu'à ${maxSessionItems} compteurs.`;
            divSessionEndListRef.appendChild(newClotureList);
        }
    });

    if (devMode === true){console.log(" [COUNTER] userSessionItemsList",userSessionItemsList);}
    
}

// Fonction de trie par displayOrder et ne retourner qu'un tableau de clé trié
function getSortedKeysByDisplayOrder(counterList) {
    return Object.entries(counterList)
        .sort(([, a], [, b]) => a.displayOrder - b.displayOrder)
        .map(([key]) => key);
}







// ------------------------- INCREMENTATION ---------------------------------







// lorsque j'incremente, récupère la valeur la variable (currentSerie), ajoute la nouvelle valeur(increment)
// et le nouveau résultat est mis dans total ainsi que sauvegardé en base
async function onClickIncrementeCounter(idRef) {

    // Ne fait rien si l'increment est à zero ou vide
    if (userSessionItemsList[idRef].repIncrement === 0) {
        if (devMode === true){console.log("[COUNTER] increment vide ne fait rien");}
        onShowNotifyPopup("inputIncrementEmpty");
        return

    }


    // Verrouille le bouton pour éviter action secondaire trop rapide
    //sera déverrouillé après animation
    document.getElementById(`btnRepIncrement_${idRef}`).disabled = true;

    

    // récupère ancien total et nouvelle valeur
    let oldValue = userSessionItemsList[idRef].totalCount,
        newValue = userSessionItemsList[idRef].repIncrement;

    // Addition
    let newTotal = oldValue + newValue;

    // incrémente la série
    userSessionItemsList[idRef].currentSerie++;  


    // Set nouveau résultat dans html, variable et update base
    // Referencement
    let spanCurrentSerieRef = document.getElementById(`spanCurrentSerie_${idRef}`),
        divCounterCurrentSerieRef = document.getElementById(`divCounterCurrentSerie_${idRef}`),
        spanTotalCountRef = document.getElementById(`spanTotalCount_${idRef}`);

    // compte total
    spanTotalCountRef.innerHTML = `Total : ${newTotal}`;//le html
    userSessionItemsList[idRef].totalCount = newTotal;//le tableau

    // compte serie
    spanCurrentSerieRef.innerHTML = userSessionItemsList[idRef].currentSerie;

    if (devMode === true){console.log("userSessionItemsList", userSessionItemsList)}

    // Si objectif atteind
    let isTargetReach = onCheckTargetReach(idRef);

    // ANIMATION
    onPlayIncrementAnimation(isTargetReach,spanCurrentSerieRef,divCounterCurrentSerieRef);

    // Notification objectif atteind
    if (isTargetReach) {
        onShowNotifyPopup("counterTargetReach");
    }

    // Sauvegarde en localStorage
    onUpdateSessionItemsInStorage();

    //déverrouille le bouton pour être a nouveau disponible
    setTimeout(() => {
        document.getElementById(`btnRepIncrement_${idRef}`).disabled = false;
    }, 300);

    

}



// Si objectif non égale à zero atteind
function onCheckTargetReach(idRef) {

    let targetReach = false;

    if (userSessionItemsList[idRef].serieTarget === 0) {
       return targetReach;
    } else if (userSessionItemsList[idRef].currentSerie === userSessionItemsList[idRef].serieTarget){

        targetReach = true;
        document.getElementById(`spanSerieTarget_${idRef}`).classList.add("target-reach");
        document.getElementById(`imgCounterTargetDone_${idRef}`).classList.add("counterTargetDone");
    } else {
        document.getElementById(`spanSerieTarget_${idRef}`).classList.remove("target-reach");
        document.getElementById(`imgCounterTargetDone_${idRef}`).classList.remove("counterTargetDone");
    }

    return targetReach;
}




// ANIMATION
function onPlayIncrementAnimation(isTargetReach,repIncrementRef,divCurrentSerieRef) {

    let itemToAnimRef = repIncrementRef;
        
        // Pour relancer l'animation même si elle a été déjà jouée 
        // Enlève également reset-in pour que l'animation fonctionne toujours après un reset
        itemToAnimRef.classList.remove('pop-animation','reset-in');
        void itemToAnimRef.offsetWidth; // Forcer un reflow
        // Ajouter la classe pour l'animation
        itemToAnimRef.classList.add("pop-animation");

}



// ------------------------- RESET ---------------------------------

// Lorsque je reset, l'heure
// set le current count à zero,
// Actualise les éléments visual, dans la variable et en base


async function onClickResetCounter(idRef) {

    //bloc le bouton jusqu'à la fin de l'animation
    document.getElementById(`btnCountReset_${idRef}`).disabled = true;


    // set les html
    //current serie
    let spanCurrentSerieRef = document.getElementById(`spanCurrentSerie_${idRef}`);

    // Étape 1 : animation de disparition
    spanCurrentSerieRef.classList.remove('reset-in');
    spanCurrentSerieRef.classList.add('reset-out');
    // Le innerHTML sera mis à zero dans le setTimeOut
    
    //totalcount
    let spanTotalCountRef = document.getElementById(`spanTotalCount_${idRef}`);
    spanTotalCountRef.innerHTML = `Total : 0`;


    // Set les variables
    userSessionItemsList[idRef].currentSerie = 0;
    userSessionItemsList[idRef].totalCount = 0;



    // Sauvegarde en localStorage
    onUpdateSessionItemsInStorage();

    if (devMode === true){console.log("userSessionItemsList", userSessionItemsList)};

    //retire la classe "reach" si necessaire pour le count target et le slash
    let counterTargetRef = document.getElementById(`spanSerieTarget_${idRef}`);

    if (counterTargetRef.classList.contains("target-reach")) {
        counterTargetRef.classList.remove("target-reach");
        document.getElementById(`imgCounterTargetDone_${idRef}`).classList.remove("counterTargetDone");
    }

    // Ajouter la classe pour l'animation
    // spanCurrentSerieRef.classList.add("anim-reset");

    
    setTimeout(() => {
        // Met le chiffre visuellement et joue la remontée
        spanCurrentSerieRef.classList.remove('reset-out');
        spanCurrentSerieRef.classList.add('reset-in');
        spanCurrentSerieRef.innerHTML = 0;

        //déverrouille le bouton à la fin de l'animation
        document.getElementById(`btnCountReset_${idRef}`).disabled = false;
    }, 300);

}


// RESET ALL COUNTER


function onClickResetAllCounter() {

    let textToDisplay = `<b>Réinitialiser tous les compteurs ?</b>`;
    addEventForGlobalPopupConfirmation(removeEventForGlobalPopupConfirmation,eventResetAllCounter,textToDisplay,"reset");
}


async function eventResetAllCounter() {
    
    // Boucle sur la liste des key
    //Pour chaque éléments passe la variable à zero et set le texte
    sessionItemsSortedKey.forEach(key=>{
        userSessionItemsList[key].currentSerie = 0;
        document.getElementById(`spanCurrentSerie_${key}`).innerHTML = 0;

        userSessionItemsList[key].totalCount = 0;
        document.getElementById(`spanTotalCount_${key}`).innerHTML = "Total : 0";

         //retire la classe "reach" si necessaire pour le count target et le slash
        let counterTargetRef = document.getElementById(`spanSerieTarget_${key}`);

        if (counterTargetRef.classList.contains("target-reach")) {
            counterTargetRef.classList.remove("target-reach");
            document.getElementById(`imgCounterTargetDone_${key}`).classList.remove("counterTargetDone");
        }
    });

    // reset également l'heure du début de session
    onSetSessionStartTime();

    // Sauvegarde en localStorage
    onUpdateSessionItemsInStorage();
    onUpdateSessionTimeInStorage();

    

    // Notification utilisateur  
    onShowNotifyPopup("sessionReset");
}


// ------------------------------------ SUPPRESSION -----------------------






//Lors d'une suppression, il faut également décrémenter les display order des counters suivants




function onClickDeleteSessionItem() {

    let textToDisplay = `<b>Supprimer : ${userSessionItemsList[currentSessionItemEditorID].name} ?</b>`;
    addEventForGlobalPopupConfirmation(removeEventForGlobalPopupConfirmation,eventDeleteSessionItem,textToDisplay,"delete");
}



async function eventDeleteSessionItem(){
    // Masque editeur de compteur
    document.getElementById("divEditCounter").style.display = "none";

    //suppression dans la variable
    delete userSessionItemsList[currentSessionItemEditorID];

    // traitement display order pour les counters suivants
    onChangeDisplayOrderFromDelete(currentSessionItemEditorID);

    if (devMode === true){console.log("userSessionItemsList", userSessionItemsList)}

    // Popup notification
    onShowNotifyPopup("counterDeleted");

    // Sauvegarde en localStorage
    onUpdateSessionItemsInStorage();

    // actualisation de la liste des compteurs
    onDisplaySessionItems();
}


async function onChangeDisplayOrderFromDelete(idOrigin) {
    // recupère l'index d'origine dans l'array des key
    let deletedSessionItemIndex = sessionItemsSortedKey.indexOf(idOrigin);

    if (devMode === true){console.log("deletedSessionItemIndex :",deletedSessionItemIndex);}

    // Boucle jusquà la fin et décrémente les displayOrder et stocke en même temps les key to save
    for (let i = (deletedSessionItemIndex + 1); i < sessionItemsSortedKey.length; i++) {
        // Increment
        userSessionItemsList[sessionItemsSortedKey[i]].displayOrder--;
    }

    // retire la key concernée dans l'array
    sessionItemsSortedKey.splice(deletedSessionItemIndex,1);

}








// ----------------------------------- NAVIGATION -----------------------------------


// Actualisation des display order après drag n drop
function updateSessionItemsDisplayOrders() {
    const container = document.getElementById("divSessionCompteurArea");
    const children = container.querySelectorAll(".compteur-container");

    children.forEach((child, index) => {
        const id = child.id.replace("counterContainer_", ""); // extrait l'ID
        if (userSessionItemsList[id]) {
            userSessionItemsList[id].displayOrder = index;
        }
    });

    // réaffiche les compteurs
    onDisplaySessionItems();

    // Sauvegarde en localStorage
    onUpdateSessionItemsInStorage();
}



// Reset les éléments de l'éditeur de compteur
function onResetSessionItemEditor() {
    // Reset l'emplacement du nom
    document.getElementById("inputEditSessionItemName").value = "";

    // Reset le nombre de serie
    document.getElementById("inputEditSerieTarget").value = 0;

    //Reset le nombre de répétition
    document.getElementById("inputEditRepIncrement").value = 0;


    //Reset les inputs du minuteurs
    inputNumberMinuteurIdArray.forEach(id=>{
        document.getElementById(id).value = "00";
    });

    // remet les éléments dans la couleur par défaut
    sessionItemColorSelected = "white";
    document.getElementById("divEditCounterContent").style.backgroundColor = sessionItemColorSelected;
}




// ----------------------------- ENVOIE VERS ACTIVITE ------------------------------------


function onClickSendSessionToActivity() {

    //Ajout unique ecouteur évènement
    if (!isAddEventListenerForSendFakeSelector) {
        onAddEventListenerForSendFakeSelector();
    }


    // condition : Avoir au moins 1 compteur

    if (Object.keys(userSessionItemsList).length > 0) {
        onGenerateFakeSelectSession();
    }else{
        alert("Vous n'avez aucun compteur à envoyer !");
    }
}




async function onSendSessionToActivity(activityTarget) {
    
    let sessionText = "";

    //Boucle sur les éléments
    sessionItemsSortedKey.forEach(key=>{

        // Pour chaque élément crée une ligne avec les données
        let nameFormated = onSetToLowercase(userSessionItemsList[key].name);
        nameFormated = onSetFirstLetterUppercase(nameFormated);

        let textToAdd = "";

        // Ecrite le texte selon le mode choisit dans setting
        switch (userSetting.fromSessionToActivityMode) {
            case "MINIMAL":
                textToAdd = `${nameFormated}: ${userSessionItemsList[key].totalCount}\n`;

                break;
            case "NORMAL":
                textToAdd = `${nameFormated}: ${userSessionItemsList[key].totalCount} (Séries: ${userSessionItemsList[key].currentSerie}*${userSessionItemsList[key].repIncrement} rép.)\n`;

                break;
            case "COMPLETE":
                textToAdd = `${nameFormated}: ${userSessionItemsList[key].totalCount} (Séries: ${userSessionItemsList[key].currentSerie}/${userSessionItemsList[key].serieTarget} - ${userSessionItemsList[key].repIncrement} Rép.)\n`;

                break;
            case "SERIES":
                textToAdd = `${nameFormated}: ${userSessionItemsList[key].currentSerie}*${userSessionItemsList[key].repIncrement}\n`;

                break;
            case "TITLE":
                textToAdd = `${nameFormated}\n`;

                break;
        
            default:
                break;
        }


        sessionText = sessionText + textToAdd;

    });

    
    // Calcul de la durée passé en session 
    let sessionEndTime = onGetCurrentTimeAndSecond(),
        sessionDuration = onGetSessionDuration(sessionStartTime,sessionEndTime);





    //Remplit une variable avec des données pour une nouvelle activité
    let activityGenerateToInsert = {
        name : activityTarget,
        date : onFindDateTodayUS(),
        location : "",
        distance : "",
        duration : sessionDuration,
        comment : sessionText,
        createdAt : new Date().toISOString(),
        isPlanned : false
    };

    // Lance la sauvegarde d'une nouvelle activité
    await  eventInsertNewActivity(activityGenerateToInsert,true);
 

}


// Objet fake option
class fakeOptionSessionBasic {
    constructor(activityName, displayName, imgRef, classList, parentRef, isLastIndex) {
        this.activityName = activityName;
        this.displayName = displayName;
        this.imgRef = imgRef;
        this.classList = classList;
        this.parentRef = parentRef;
        this.isLastIndex = isLastIndex; 

        // div container
        this.element = document.createElement("div");
        this.element.classList.add("fake-opt-item-container");

        // Ajout des traits pour le dernier favorie
        if (this.isLastIndex) {
            this.element.classList.add("fake-opt-item-last-container");
        }

        // Fonction
        this.element.onclick = (event) => {
            event.stopPropagation();
            onSendSessionToActivity(this.activityName);
            // affichage
            document.getElementById("divFakeSelectSession").style.display = "none";
        };

        this.render();
    }

    // génération de l'élément
    render() {
        this.element.innerHTML = `
            <img class="fake-opt-item" src="${this.imgRef}">
            <span class="${this.classList}">${this.displayName}</span>
            <div class="radio-button-fake"></div>
        `;

        // Insertion
        this.parentRef.appendChild(this.element);
    }
}


// Objet fake option
class fakeOptionSessionFavourite {
    constructor(activityName, displayName, imgRef, classList, parentRef, isLastIndex) {
        this.activityName = activityName;
        this.displayName = displayName;
        this.imgRef = imgRef;
        this.classList = classList;
        this.parentRef = parentRef;
        this.isLastIndex = isLastIndex; 

        // div container
        this.element = document.createElement("div");
        this.element.classList.add("fake-opt-item-container");

        // pas de trait du bas pour le dernier élément
        if (this.isLastIndex) {
            this.element.classList.add("fake-opt-item-last-favourite");
        }

        // Fonction
        this.element.onclick = (event) => {
            event.stopPropagation();
            onSendSessionToActivity(this.activityName);
            // affichage
            document.getElementById("divFakeSelectSession").style.display = "none";
        };

        this.render();
    }

    // génération de l'élément
    render() {
        this.element.innerHTML = `
            <span class="favouriteSymbol">*</span>
            <img class="fake-opt-item" src="${this.imgRef}">
            <span class="${this.classList}">${this.displayName}</span>
            <div class="radio-button-fake"></div>
        `;

        // Insertion
        this.parentRef.appendChild(this.element);
    }
}


// génération du fake selection d'activité pour l'envoie des compteurs

function onGenerateFakeSelectSession() {
    let parentRef = document.getElementById("divFakeSelectSessionList");

    parentRef.innerHTML = "";


    // Insert d'abord la liste des favoris
    userFavoris.forEach((e,index)=>{

        let displayName = activityChoiceArray[e].displayName,
            imgRef = activityChoiceArray[e].imgRef,
            classList = "fake-opt-item fake-opt-item-favoris",
            isLastFavourite = index === (userFavoris.length - 1);

        new fakeOptionSessionFavourite(e,displayName,imgRef,classList,parentRef,isLastFavourite);
    });



    // Puis toutes les type d'activités
    let activitySortedKey = Object.keys(activityChoiceArray);
    activitySortedKey.sort();


    activitySortedKey.forEach((e,index)=>{
        let displayName = `${activityChoiceArray[e].displayName}`,
            imgRef = activityChoiceArray[e].imgRef,
            classList = "fake-opt-item",
            isLastIndex = index === (activitySortedKey.length -1);

        new fakeOptionSessionBasic(e,displayName,imgRef,classList,parentRef,isLastIndex);
    });


    // affichage
    document.getElementById("divFakeSelectSession").style.display = "flex";
}




// Annule envoie vers activité
function onCloseFakeSelectSession(event) {
    document.getElementById("divFakeSelectSession").style.display = "none";
}




function onGetSessionDuration(heureDebut, heureFin) {
    // Convertir HH:MM:SS en secondes
    function enSecondes(h) {
        let [hh, mm, ss] = h.split(':').map(Number);
        return hh * 3600 + mm * 60 + ss;
    }

    // si heure de début n'est pas paramétré : met à 00:00:00
    let secondesDebut = heureDebut != "--:--:--" ? enSecondes(heureDebut):enSecondes("00:00:00"),
        secondesFin = enSecondes(heureFin);

    // Gérer le cas où l'heure de fin est après minuit (jour suivant)
    if (secondesFin < secondesDebut) {
        secondesFin += 24 * 3600;
    }

    let duree = secondesFin - secondesDebut;

    // Convertir les secondes en HH:MM:SS
    let heures = String(Math.floor(duree / 3600)).padStart(2, '0');
    let minutes = String(Math.floor((duree % 3600) / 60)).padStart(2, '0');
    let secondes = String(duree % 60).padStart(2, '0');

    return `${heures}:${minutes}:${secondes}`;
}



// ---------------------------- Génération de session ---------------------------------

// tout est basé sur maxSessionItems






async function onClickMenuCreateSession() {    

        // La première fois, récupère les templates dans la base
        if (!isTemplateSessionLoadedFromBase) {
            await onLoadTemplateSessionNameFromDB();
            isTemplateSessionLoadedFromBase = true;
            if (devMode === true){console.log("1er chargement des templates session depuis la base");}

            // Récupère et tries les clés
            onUpdateAndSortTemplateSessionKey();
        }

    onGenerateSessionTable();

    // actualise la liste des modèles dans le tableau
    onGenerateModelSelectList(); 
}

// Classe d'une ligne de session
class TableLineSession{

    constructor(parentRef,idNumber){
        this.parentRef = parentRef;
        this.idNumber = idNumber;

        // la row
        this.element = document.createElement("tr");
        this.render();
        this.parentRef.appendChild(this.element);
        this.addEvent();
    }

    render(){
        this.element.innerHTML = `
            <td class="gen-session-col-nom">
                <input type="text" id="inputGenSessionNom_${this.idNumber}" class="gen-session-col-nom" placeholder="Compteur ${this.idNumber}">
            </td>
            <td class="gen-session-col-series">
                <input type="number" id="inputGenSessionSerie_${this.idNumber}" class="gen-session-col-series numberGenSession" placeholder="0"  onfocus="selectAllText(this)" oncontextmenu="disableContextMenu(event)">
            </td>
            <td class="gen-session-col-rep">
                <input type="number" id="inputGenSessionRep_${this.idNumber}" class="gen-session-col-rep numberGenSession" placeholder="0"  onfocus="selectAllText(this)" oncontextmenu="disableContextMenu(event)">
            </td>
            <td class="gen-session-col-color"  id="tdGenSessionChooseColor_${this.idNumber}">
                <select id="selectGenSessionColor_${this.idNumber}" class="gen-session-col-color">
                    <option value="white">Blanc</option>
                    <option value="green">Vert</option>
                    <option value="yellow">Jaune</option>
                    <option value="red">Rouge</option>
                    <option value="blue">Bleu</option>
                    <option value="violet">Violet</option>
                    <option value="orange">Orange</option>
                    <option value="rose">Rose</option>
                </select>
            </td>
        `;

    };

    addEvent(){
        let selectRef = document.getElementById(`selectGenSessionColor_${this.idNumber}`);
        selectRef.addEventListener("change",()=>{
            onChangeColorInGenSessionTable(this.idNumber);
        });
    }

}






// Génération du tableau de création de session
function onGenerateSessionTable() {
   
    // Reférence le parent
    let parentRef = document.getElementById("bodyTableGenerateSession");

    // Reset le contenu du parent
    parentRef.innerHTML = "";

    // Génère le tableau
    for (let i = 0; i < maxSessionItems; i++) {
        new TableLineSession(parentRef,i); 
    }

    // Affiche le popup
    document.getElementById("divPopCreateSession").style.display = "flex";


    // Ajout les écoute d'évènements
    if (!isAddEventListenerForSessionEditor) {
        onAddEventListenerForSessionEditor();
    }
}





// Génération de la session
// Récupère les éléments créés dans  le tableau
function onGetTableSessionItem() {
    let sessionList = [];

    for (let i = 0; i < maxSessionItems; i++) {

        // Reférence les éléments
        inputName = document.getElementById(`inputGenSessionNom_${i}`);
        inputSerie = document.getElementById(`inputGenSessionSerie_${i}`);
        inputRep = document.getElementById(`inputGenSessionRep_${i}`);
        selectColor = document.getElementById(`selectGenSessionColor_${i}`);

        // Si inputName remplit
        if (inputName.value != "") {

            // récupère les éléments de la ligne 
            sessionList.push( {
                name: inputName.value, 
                serieTarget: parseInt(inputSerie.value) || 0,
                repIncrement: parseInt(inputRep.value) || 0,
                color : selectColor.value
            })
        } 
    }

    return sessionList;
}



// Génération des options du selecteur de session
function onGenerateModelSelectList() {

    if (devMode === true){
        console.log("generation de la liste des modèles");
        console.log(templateSessionKeys);
    }

    // Referencement
    let parentRef = document.getElementById("selectSessionTableModelName");
    
    // Vide les enfants
    parentRef.innerHTML = "";

    // Insert l'option "Personnalisé"
    let defaultOption = document.createElement("option");
        defaultOption.value = "CUSTOM";
        defaultOption.innerHTML = "Personnalisée";

    parentRef.appendChild(defaultOption);

    // Pour chaque nom de model
    templateSessionKeys.forEach(key=>{

        // crée une option et l'insere
        let newOption = document.createElement("option");
        newOption.value = key;
        newOption.innerHTML = templateSessionsNameList[key].name;

        parentRef.appendChild(newOption);
    });
}

// Sequence de génération d'une session depuis le tableau de creation
async function eventGenerateSessionList(){

    // Centralise les éléments qui été dans le tableau de création
    let itemForSession = onGetTableSessionItem();

    if (devMode === true){console.log(itemForSession);}

    // Retire le popup

    // formate les nouveaux compteur et les sauvegardes
    onGenerateMultipleCounter(itemForSession);

    // reset également l'heure du début de session
    onSetSessionStartTime();

    // Sauvegarde la nouvelle session en local storage
    onUpdateSessionItemsInStorage();
    onUpdateSessionTimeInStorage();


    // masque le popup
    document.getElementById("divPopCreateSession").style.display = "none";

    // Affiche les nouveaux compteurs
    onDisplaySessionItems();


}

// Fonction de création de la session
function onGenerateMultipleCounter(newSessionList) {

    // Vide l'array
    userSessionItemsList = {};


    // Pour chaque élément de la liste
    newSessionList.forEach((e,index)=>{

        // Génération de l'ID
        let counterId = getRandomShortID("counter_",userSessionItemsList);

        //formatage du counter (majuscule etc)
        let formatedCounter = {
            name: e.name, 
            currentSerie: 0, 
            serieTarget: e.serieTarget, 
            repIncrement: e.repIncrement, 
            totalCount: 0,
            displayOrder : index,
            color : e.color
        };

        // Inserte un nouveau compteur dans l'array
        userSessionItemsList[counterId] = formatedCounter;

    });


    if (devMode === true){console.log("userSessionItemsList", userSessionItemsList);}


}













// changement de couleur dans le tableau de génération
function onChangeColorInGenSessionTable(idRef) {
    let tableDataRef = document.getElementById(`tdGenSessionChooseColor_${idRef}`),
        colorRef = document.getElementById(`selectGenSessionColor_${idRef}`).value;

    tableDataRef.style.backgroundColor = sessionItemColors[colorRef].body;
}






// Fonction pour empecher la div de se ferme lorsqu'on se trouve dans sa zone.
function onClickOnCreateSessionArea(event){
    event.stopPropagation();
}


// Annulation de la création de session
function onCancelCreateSession(event) {

    // masque le popup
    document.getElementById("divPopCreateSession").style.display = "none";

    //vide le tableau
    document.getElementById("bodyTableGenerateSession").innerHTML = "";


}









// --------------------------------- utilisation d'un modèle ------------------------------


async function onChangeSelectorChooseTemplateSession(modelIdTarget) {

    // vide la liste
    let parentRef = document.getElementById("bodyTableGenerateSession");
    parentRef.innerHTML = "";

    // Crée à nouveau une liste vide
    for (let i = 0; i < maxSessionItems; i++) {
        new TableLineSession(parentRef,i); 
    }

    // pour modèle "personnalisé" ne vas pas plus loin
    if (modelIdTarget === "CUSTOM") {
        return;
    }

    // Récupère les items selon l'ID dans la base
    let result = await findTemplateSessionById(modelIdTarget);
    
    sessionData = {
        sessionName :result.sessionName,
        counterList: result.counterList
    };
    // Puis remplit le tableau 
    onSetSessionTableLineFromTemplate(sessionData);

}



// Fonction pour remplir les lignes du tableau
function onSetSessionTableLineFromTemplate(templateData) {
    if (devMode === true){console.log(templateData)};

    //Boucle pour remplir les différents compteurs
    templateData.counterList.forEach((counter,index)=>{
        document.getElementById(`inputGenSessionNom_${index}`).value = counter.counterName;
        document.getElementById(`inputGenSessionSerie_${index}`).value = counter.serieTarget;
        document.getElementById(`inputGenSessionRep_${index}`).value = counter.repIncrement;
        // Couleur
        document.getElementById(`selectGenSessionColor_${index}`).value = counter.color;
        onChangeColorInGenSessionTable(index);
    }); 
      
}



// Gestion drag N drop

function onInitSortable(divID) {
    const container = document.getElementById(divID); 
    sortableInstance = Sortable.create(container, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        scroll: true,
        scrollSensitivity: 30,
        scrollSpeed: 10,
        handle: '.drag-handle',
        touchStartThreshold: 10,
        onEnd: function () {
            updateSessionItemsDisplayOrders();
        }
    });
}

function onDestroySortable() {
    // Vide l'instance de trie
    if (sortableInstance) {
        sortableInstance.destroy();
        sortableInstance = null;
    }

}


// Retour depuis Info
function onClickReturnFromSession() {

    onDestroySortable();

    // vide la div
    let divSessionCompteurAreaRef = document.getElementById("divSessionCompteurArea");
    divSessionCompteurAreaRef.innerHTML = "";

    //vide le tableau
    document.getElementById("bodyTableGenerateSession").innerHTML = "";

    // ferme le menu
    onLeaveMenu("Session");
};



