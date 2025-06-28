
let userCounterList = {
        "Counter_1": { 
            type: "Counter", name: "Exemple de compteur", 
            currentSerie: 0, serieTarget :0, repIncrement:0, totalCount:0,
            displayOrder : 0,
            color : "white"
        }
    },
    maxCounter = 20,
    counterSortedKey = [],//array des clé trié par "displayOrder"
    counterEditorMode, //creation ou modification
    currentCounterEditorID,//L'id du compteur en cours de modification
    sessionStartTime = "--:--:--",//date-heure du début de session set lorsque clique sur reset all counter, ou générate session
    sessionStorageName = "MSS_sessionCounterList",
    sessionStartTimeStorageName = "MSS_sessionStartTime",
    sortableInstance = null;//instance pour le drag n drop

let counterColor = {
    white: {body:"#fff",button:"grey"},
    green: {body:"#E7F8F2",button:"#4EA88A"},
    yellow: {body:"#FFFBE5",button:"#C8A646"},
    red: {body:"#FDEBEC",button:"#D36868"},
    blue: {body:"#E6F0FA",button:"#2B7FBF"},
    violet: {body:"#F3F0FA",button:"#8A7EBF"},
    orange: {body:"#FFF1EC",button:"#E38B6D"},
    rose: {body:"#FAEFF4",button:"#C57CA5"}
};

let counterColorSelected = "#fff";//utiliser lors de la création d'un compteur



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
        this.element.style.backgroundColor = counterColor[this.colorName].body;
        this.element.id = `counterContainer_${id}`;

        this.buttonColor = counterColor[this.colorName].button;

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
                <div class="wrapper">
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

function onUpdateCounterSessionInStorage() {
    localStorage.setItem(sessionStorageName, JSON.stringify(userCounterList));
}

function onUpdateSessionTimeInStorage() {
    localStorage.setItem(sessionStartTimeStorageName, sessionStartTime);
}



function getCounterListFromLocalStorage() {
    userCounterList = {};

    userCounterList = JSON.parse(localStorage.getItem(sessionStorageName)) || {};

}


function getSessionStartTimeFromLocalStorage() {
    sessionStartTime = localStorage.getItem(sessionStartTimeStorageName) || "--:--:--";
}




// ------------------------------------------------ Ecouteur évènement -----------------------------------------

//Pour le menu compteur editeur
let isEventListenerForCounterEditor = false;

function onAddEventListenerforCounterEditor() {
    
    if (devMode === true){
        console.log("[EVENT-LISTENER] : Ajout les évènements pour l'éditeur de counter");
    };


    // Set le boolean pour action unique
    isEventListenerForCounterEditor = true;



    // LA div générale avec action retour
    let divEditCounterRef = document.getElementById("divEditCounter");
    divEditCounterRef.addEventListener("click",(event)=>{
        onAnnulCounterEditor(event);
    });


    //La div intérieure contenur les actions
    let divEditCounterContentRef = document.getElementById("divEditCounterContent");
    divEditCounterContentRef.addEventListener("click", (event)=>{
        onClickDivNewPopupContent(event);
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



    // Les couleurs
    let btnColorCounterChoiceArray = document.querySelectorAll(".btnChooseColor");
    btnColorCounterChoiceArray.forEach(btn=>{
        let btnColor = btn.dataset.btnCounterColor;
        btn.addEventListener("click",()=>{
            onChooseCounterColor(btnColor);
        });
    });


    // Le menu de navigation
    //Retour
    let btnReturnRef = document.getElementById("btnReturnCounterEditor");
    btnReturnRef.addEventListener("click", (event)=>{
        onAnnulCounterEditor(event);
    });

    //Supprimer
    let btnDeleteRef = document.getElementById("btnDeleteCounter");
    btnDeleteRef.addEventListener("click", ()=>{
        onClickDeleteCounter();
    });

    //Valider
    let btnValideRef = document.getElementById("btnValideCounterEditor");
    btnValideRef.addEventListener("click",(event)=>{
        onConfirmCounterEditor(event);
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
    getCounterListFromLocalStorage();
    getSessionStartTimeFromLocalStorage();

    //Ajoutes les écouteurs d'évènement la prémière fois
    if (!isEventListenerForCounterEditor  || !isAddEventForMainMenuSession) {
        onAddEventListenerforCounterEditor();
        onAddEventListenerForMainMenuSession();
    }


    if (devMode === true){console.log("userCounterList", userCounterList)}

    // set l'heure d'initialisation de session dans le texte
    document.getElementById("customInfo").innerHTML = `<b>Début à : ${sessionStartTime}<b>`;

    onDisplayCounter(userCounterList);

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
    userCounterList[idRef].repIncrement = parseInt(document.getElementById(`inputRepIncrement_${idRef}`).value) || 0;


    // Sauvegarde en localStorage
    onUpdateCounterSessionInStorage();
}






//----------------------------- NOUVEAU COMPTEUR------------------------------------


function onClickAddCounter() {
    // Reset les éléments avant set
    onResetCounterEditor();

    // Set le mode d'utilisation de l'éditeur de compteur
    counterEditorMode = "creation";
    
    // Cache le bouton supprimer
    document.getElementById("btnDeleteCounter").style.visibility = "hidden";

    // Affiche 
    document.getElementById("divEditCounter").style.display = "flex";
}






function onAnnulCounterEditor(){
    document.getElementById("divEditCounter").style.display = "none";
}


// Empeche de fermer la div lorsque l'utilisateur clique dans cette zone
function onClickDivNewPopupContent(event) {
    event.stopPropagation();
}



// Gestion des couleurs

function onChooseCounterColor(color) {
    document.getElementById("divEditCounterContent").style.backgroundColor = counterColor[color].body;
    counterColorSelected = color;
}



function onConfirmCounterEditor() {
    
    // filtre selon le mode d'utilisation de l'éditeur de compteur
    if (counterEditorMode === "creation"){
        eventCreateCounter();
    }else if (counterEditorMode === "modification") {
        eventSaveModifyCounter();
    }else{
        console.log("erreur dans le mode d'édition du compteur");
    }

}


function eventCreateCounter() {
    
    // masque le popup de création
    document.getElementById("divEditCounter").style.display = "none";

    // Formatage
    let counterData = onFormatNewCounter();

    // Obtenir le prochain ID
    let nextId = getRandomShortID("counter_",userCounterList);

    // Ajout du nouveau compteur à l'array
    userCounterList[nextId] = counterData;

    // Enregistrement
    eventInsertNewCompteur();

}



//Séquence d'insertion d'un nouveau compteur

async function eventInsertNewCompteur() {

    if (devMode === true){console.log("userCounterList", userCounterList)}

    // Sauvegarde en localStorage
    onUpdateCounterSessionInStorage();

    // fonction de création affichage des compteurs
    onDisplayCounter(userCounterList);
    

    // Popup notification
    onShowNotifyPopup("counterCreated");

}



function onFormatNewCounter() {

    // Récupère le nom du compteur ou set un nom par défaut
    let newCounterName = document.getElementById("inputEditCounterName").value || "Nouveau Compteur";

    
    // Formatage du nom en majuscule
    newCounterName = onSetToUppercase(newCounterName);


    // formatage du nom. Recherche de doublon
    let isCounterDoublonName = Object.values(userCounterList).some(counter => counter.name === newCounterName);

    if (isCounterDoublonName) {
        if (devMode === true){console.log(" [COUNTER] Doublon de nom détecté");}
        newCounterName += "_1";
    }

    // Récupère l'objectif ou set 0
    let newserieTarget = parseInt(document.getElementById("inputEditSerieTarget").value) || 0,
        newRepIncrement = parseInt(document.getElementById("inputEditRepIncrement").value) || 0;

    

    // définition du displayOrder
    let newDisplayOrder = Object.keys(userCounterList).length || 0;


    let formatedCounter = {
        name: newCounterName, 
        currentSerie: 0, serieTarget: newserieTarget, repIncrement:newRepIncrement, totalCount:0,
        displayOrder : newDisplayOrder,
        color : counterColorSelected
    };

    return formatedCounter;

}




// Modification de compteur
function onClickModifyCounter(idRef) {
    counterEditorMode = "modification";
    currentCounterEditorID = idRef;

    // set les éléments
    document.getElementById("inputEditCounterName").value = userCounterList[idRef].name;
    document.getElementById("inputEditSerieTarget").value = userCounterList[idRef].serieTarget;
    document.getElementById("inputEditRepIncrement").value = userCounterList[idRef].repIncrement;
    document.getElementById("divEditCounterContent").style.backgroundColor = counterColor[userCounterList[idRef].color].body;
    counterColorSelected = userCounterList[idRef].color;


    // rend le bouton supprimer visible
    document.getElementById("btnDeleteCounter").style.visibility = "visible";

    // Affiche 
    document.getElementById("divEditCounter").style.display = "flex";


}





async function eventSaveModifyCounter() {

    // masque le popup de création
    document.getElementById("divEditCounter").style.display = "none";

    // Formatage
    let counterData = onFormatModifyCounter();

    // Enregistrement dans l'array
    userCounterList[currentCounterEditorID].name = counterData.name;
    userCounterList[currentCounterEditorID].serieTarget = counterData.serieTarget;
    userCounterList[currentCounterEditorID].repIncrement = counterData.repIncrement;
    userCounterList[currentCounterEditorID].color = counterData.color;

    // Actualisation de l'affichage
    document.getElementById(`counterName_${currentCounterEditorID}`).innerHTML = counterData.name;
    document.getElementById(`counterContainer_${currentCounterEditorID}`).style.backgroundColor = counterColor[counterData.color].body;
    document.getElementById(`spanSerieTarget_${currentCounterEditorID}`).innerHTML = `/${counterData.serieTarget}`;
    document.getElementById(`inputRepIncrement_${currentCounterEditorID}`).value = counterData.repIncrement;
    document.getElementById(`btnRepIncrement_${currentCounterEditorID}`).style.backgroundColor = counterColor[counterData.color].button;
    
    

    if (devMode === true){
        console.log("userCounterList", userCounterList);
        console.log("demande de vérification DONE");
    }
    // Met également à jour l'image DONE si nécessaire
    onCheckTargetReach(currentCounterEditorID);

    // Sauvegarde en localStorage
    onUpdateCounterSessionInStorage();

}



function onFormatModifyCounter() {

    // Récupère le nom du compteur ou set un nom par défaut
    let newCounterName = document.getElementById("inputEditCounterName").value || "Nouveau Compteur";
    
    // Formatage du nom en majuscule
    newCounterName = onSetToUppercase(newCounterName);

    // Récupère l'objectif ou set 0
    let newserieTarget = parseInt(document.getElementById("inputEditSerieTarget").value) || 0;
        newRepIncrement = parseInt(document.getElementById("inputEditRepIncrement").value) || 0;

    let formatedCounter = {
        name: newCounterName, 
        currentSerie: 0, serieTarget: newserieTarget, repIncrement:newRepIncrement, totalCount:0,
        displayOrder : 0,
        color : counterColorSelected
    };

    return formatedCounter;

}




// l'affichage des compteurs de fait sur le trie des "displayOrder"

function onDisplayCounter() {
    if (devMode === true){console.log(" [COUNTER] génération de la liste");}

    // div qui contient les compteurs
    let divSessionCompteurAreaRef = document.getElementById("divSessionCompteurArea");
    // Reset
    divSessionCompteurAreaRef.innerHTML = "";


    // div de fin de liste (bouton et info)
    let divSessionEndListRef = document.getElementById("divSessionEndList");
    divSessionEndListRef.innerHTML = "";

    // Affichage en cas d'aucune modèle
    if (Object.keys(userCounterList).length < 1) {
        divSessionCompteurAreaRef.innerHTML = "Aucun compteur à afficher !";

        new Button_add("Ajouter un compteur",() => onClickAddCounter(),false,divSessionEndListRef);
        return
    }


    // récupère la liste des clé trié par displayOrder
    counterSortedKey = [];

    counterSortedKey = getSortedKeysByDisplayOrder(userCounterList);

    counterSortedKey.forEach((key,index)=>{

        // Generation
        new Counter(
            key,userCounterList[key].name,
            userCounterList[key].currentSerie,userCounterList[key].serieTarget,userCounterList[key].repIncrement,
            userCounterList[key].displayOrder,divSessionCompteurAreaRef,userCounterList[key].color,
            userCounterList[key].totalCount
        );


        // control des objectifs atteinds pour chaque compteur généré
        onCheckTargetReach(key); 

        // Creation de la ligne de fin pour le dernier index
        if (index === (Object.keys(userCounterList).length - 1)) {
            let isMaxCounterReach = Object.keys(userCounterList).length >= maxCounter;
            new Button_add("Ajouter un compteur",() => onClickAddCounter(),isMaxCounterReach,divSessionEndListRef);

            let newClotureList = document.createElement("span");
            newClotureList.classList.add("last-container");
            newClotureList.innerHTML = `ℹ️ Vous pouvez créer jusqu'à ${maxCounter} compteurs.`;
            divSessionEndListRef.appendChild(newClotureList);
        }
    });

    if (devMode === true){console.log(" [COUNTER] userCounterList",userCounterList);}
    
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
    if (userCounterList[idRef].repIncrement === 0) {
        if (devMode === true){console.log("[COUNTER] increment vide ne fait rien");}
        onShowNotifyPopup("inputIncrementEmpty");
        return

    }


    // Verrouille le bouton pour éviter action secondaire trop rapide
    //sera déverrouillé après animation
    document.getElementById(`btnRepIncrement_${idRef}`).disabled = true;

    

    // récupère ancien total et nouvelle valeur
    let oldValue = userCounterList[idRef].totalCount,
        newValue = userCounterList[idRef].repIncrement;

    // Addition
    let newTotal = oldValue + newValue;

    // incrémente la série
    userCounterList[idRef].currentSerie++;  


    // Set nouveau résultat dans html, variable et update base
    // Referencement
    let spanCurrentSerieRef = document.getElementById(`spanCurrentSerie_${idRef}`),
        divCounterCurrentSerieRef = document.getElementById(`divCounterCurrentSerie_${idRef}`),
        spanTotalCountRef = document.getElementById(`spanTotalCount_${idRef}`);

    // compte total
    spanTotalCountRef.innerHTML = `Total : ${newTotal}`;//le html
    userCounterList[idRef].totalCount = newTotal;//le tableau

    // compte serie
    spanCurrentSerieRef.innerHTML = userCounterList[idRef].currentSerie;

    if (devMode === true){console.log("userCounterList", userCounterList)}

    // Si objectif atteind
    let isTargetReach = onCheckTargetReach(idRef);

    // ANIMATION
    onPlayIncrementAnimation(isTargetReach,spanCurrentSerieRef,divCounterCurrentSerieRef);

    // Notification objectif atteind
    if (isTargetReach) {
        onShowNotifyPopup("counterTargetReach");
    }

    // Sauvegarde en localStorage
    onUpdateCounterSessionInStorage();

    //déverrouille le bouton pour être a nouveau disponible
    setTimeout(() => {
        document.getElementById(`btnRepIncrement_${idRef}`).disabled = false;
    }, 300);

    

}



// Si objectif non égale à zero atteind
function onCheckTargetReach(idRef) {

    let targetReach = false;

    if (userCounterList[idRef].serieTarget === 0) {
       return targetReach;
    } else if (userCounterList[idRef].currentSerie === userCounterList[idRef].serieTarget){

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
    userCounterList[idRef].currentSerie = 0;
    userCounterList[idRef].totalCount = 0;



    // Sauvegarde en localStorage
    onUpdateCounterSessionInStorage();

    if (devMode === true){console.log("userCounterList", userCounterList)};

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
    counterSortedKey.forEach(key=>{
        userCounterList[key].currentSerie = 0;
        document.getElementById(`spanCurrentSerie_${key}`).innerHTML = 0;

        userCounterList[key].totalCount = 0;
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
    onUpdateCounterSessionInStorage();
    onUpdateSessionTimeInStorage();

    

    // Notification utilisateur  
    onShowNotifyPopup("sessionReset");
}


// ------------------------------------ SUPPRESSION -----------------------






//Lors d'une suppression, il faut également décrémenter les display order des counters suivants




function onClickDeleteCounter() {

    let textToDisplay = `<b>Supprimer : ${userCounterList[currentCounterEditorID].name} ?</b>`;
    addEventForGlobalPopupConfirmation(removeEventForGlobalPopupConfirmation,eventDeleteCounter,textToDisplay,"delete");
}



async function eventDeleteCounter(){
    // Masque editeur de compteur
    document.getElementById("divEditCounter").style.display = "none";

    //suppression dans la variable
    delete userCounterList[currentCounterEditorID];

    // traitement display order pour les counters suivants
    onChangeDisplayOrderFromDelete(currentCounterEditorID);

    if (devMode === true){console.log("userCounterList", userCounterList)}

    // Popup notification
    onShowNotifyPopup("counterDeleted");

    // Sauvegarde en localStorage
    onUpdateCounterSessionInStorage();

    // actualisation de la liste des compteurs
    onDisplayCounter(userCounterList);
}


async function onChangeDisplayOrderFromDelete(idOrigin) {
    // recupère l'index d'origine dans l'array des key
    let deletedCounterIndex = counterSortedKey.indexOf(idOrigin);

    if (devMode === true){console.log("deletedCounterIndex :",deletedCounterIndex);}

    // Boucle jusquà la fin et décrémente les displayOrder et stocke en même temps les key to save
    for (let i = (deletedCounterIndex + 1); i < counterSortedKey.length; i++) {
        // Increment
        userCounterList[counterSortedKey[i]].displayOrder--;
    }

    // retire la key concernée dans l'array
    counterSortedKey.splice(deletedCounterIndex,1);

}








// ----------------------------------- NAVIGATION -----------------------------------


// Actualisation des display order après drag n drop
function updateCounterDisplayOrders() {
    const container = document.getElementById("divSessionCompteurArea");
    const children = container.querySelectorAll(".compteur-container");

    children.forEach((child, index) => {
        const id = child.id.replace("counterContainer_", ""); // extrait l'ID
        if (userCounterList[id]) {
            userCounterList[id].displayOrder = index;
        }
    });

    // réaffiche les compteurs
    onDisplayCounter();

    // Sauvegarde en localStorage
    onUpdateCounterSessionInStorage();
}



async function onClickCounterNavDecrease(idOrigin) {

    // Fait un switch entre les deux éléments

    // Récupère l'id de l'élément que l'on va devoir incrementer
    let keyItemToIncrease = onSearchCounterKeyByDisplayOrder(userCounterList[idOrigin].displayOrder -1);

    // Item to decrease
    userCounterList[idOrigin].displayOrder--;


    //Item to increase
    userCounterList[keyItemToIncrease].displayOrder++;


    // réaffiche les compteurs
    onDisplayCounter();

    // Sauvegarde en localStorage
    onUpdateCounterSessionInStorage();


}


async function onClickCounterNavIncrease(idOrigin) {

    // Fait un switch entre les deux éléments

    // Récupère l'id de l'élément que l'on va devoir décrementer
    let keyItemToDecrease = onSearchCounterKeyByDisplayOrder(userCounterList[idOrigin].displayOrder + 1);

    // Item to Increase
    userCounterList[idOrigin].displayOrder++;


    //Item to decrease
    userCounterList[keyItemToDecrease].displayOrder--;


    // réaffiche les compteurs
    onDisplayCounter();

    // Sauvegarde en localStorage
    onUpdateCounterSessionInStorage();

}




// Recherche la key d'un par son display order
function onSearchCounterKeyByDisplayOrder(displayOrderTarget) {
    return Object.keys(userCounterList).find(key => userCounterList[key].displayOrder === displayOrderTarget) || null;
}












// Reset les éléments de l'éditeur de compteur
function onResetCounterEditor() {
    // Reset l'emplacement du nom
    document.getElementById("inputEditCounterName").value = "";

    // Reset le nombre de serie
    document.getElementById("inputEditSerieTarget").value = 0;

    //Reset le nombre de répétition
    document.getElementById("inputEditRepIncrement").value = 0;

    // remet les éléments dans la couleur par défaut
    counterColorSelected = "white";
    document.getElementById("divEditCounterContent").style.backgroundColor = counterColorSelected;
}




// ----------------------------- ENVOIE VERS ACTIVITE ------------------------------------


function onClickSendSessionToActivity() {

    //Ajout unique ecouteur évènement
    if (!isAddEventListenerForSendFakeSelector) {
        onAddEventListenerForSendFakeSelector();
    }


    // condition : Avoir au moins 1 compteur

    if (Object.keys(userCounterList).length > 0) {
        onGenerateFakeSelectSession();
    }else{
        alert("Vous n'avez aucun compteur à envoyer !");
    }
}




async function onSendSessionToActivity(activityTarget) {
    
    let sessionText = "";

    //Boucle sur les éléments
    counterSortedKey.forEach(key=>{

        // Pour chaque élément crée une ligne avec les données
        let nameFormated = onSetToLowercase(userCounterList[key].name);
        nameFormated = onSetFirstLetterUppercase(nameFormated);

        let textToAdd = "";

        // Ecrite le texte selon le mode choisit dans setting
        switch (userSetting.fromSessionToActivityMode) {
            case "MINIMAL":
                textToAdd = `${nameFormated}: ${userCounterList[key].totalCount}\n`;

                break;
            case "NORMAL":
                textToAdd = `${nameFormated}: ${userCounterList[key].totalCount} (Séries: ${userCounterList[key].currentSerie}*${userCounterList[key].repIncrement} rép.)\n`;

                break;
            case "COMPLETE":
                textToAdd = `${nameFormated}: ${userCounterList[key].totalCount} (Séries: ${userCounterList[key].currentSerie}/${userCounterList[key].serieTarget} - ${userCounterList[key].repIncrement} Rép.)\n`;

                break;
            case "SERIES":
                textToAdd = `${nameFormated}: ${userCounterList[key].currentSerie}*${userCounterList[key].repIncrement}\n`;

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

// tout est basé sur maxcounter






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
    for (let i = 0; i < maxCounter; i++) {
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

    for (let i = 0; i < maxCounter; i++) {

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
    onUpdateCounterSessionInStorage();
    onUpdateSessionTimeInStorage();


    // masque le popup
    document.getElementById("divPopCreateSession").style.display = "none";

    // Affiche les nouveaux compteurs
    onDisplayCounter();


}

// Fonction de création de la session
function onGenerateMultipleCounter(newSessionList) {

    // Vide l'array
    userCounterList = {};


    // Pour chaque élément de la liste
    newSessionList.forEach((e,index)=>{

        // Génération de l'ID
        let counterId = getRandomShortID("counter_",userCounterList);

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
        userCounterList[counterId] = formatedCounter;

    });


    if (devMode === true){console.log("userCounterList", userCounterList);}


}













// changement de couleur dans le tableau de génération
function onChangeColorInGenSessionTable(idRef) {
    let tableDataRef = document.getElementById(`tdGenSessionChooseColor_${idRef}`),
        colorRef = document.getElementById(`selectGenSessionColor_${idRef}`).value;

    tableDataRef.style.backgroundColor = counterColor[colorRef].body;
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
    for (let i = 0; i < maxCounter; i++) {
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
            updateCounterDisplayOrders();
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



