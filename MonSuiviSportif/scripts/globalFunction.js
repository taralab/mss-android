const activityColorList = {
    blue_light:"#00A9F4",
    turquoise:"#17A2B8",
    green_light:"#03e224",
    orange:"#ffbd17",
    olive:"#4B8B3B",
    pink:"#FF69B4",
    purple:"#800080",
    red:"#FF6F61",
    dark_grey:"#6C757D",
    blue_grey:"#B0C4DE",
    brown:"#9F5540"
}



// pour empecher que les éléments de la div soit cliquable.
//Objectif : éviter les doubles clic de l'utilisateur

function onLockDivDoubleClick(divTargetArray) {
    if (devMode === true) {
        console.log("[LOCK-UNLOCK] Met la sécurité sur le clic pour : ", divTargetArray);
    }

    divTargetArray.forEach(e => {
        let targetRef = document.getElementById(e);

        if (targetRef && !targetRef.classList.contains("disabledEvent")) { 
            targetRef.classList.add("disabledEvent");
        }
    });
}



function onUnlockDivDoubleClick(divTargetArray) {
    if (devMode === true){console.log("[LOCK-UNLOCK] Retire la sécurité sur le click pour : ", divTargetArray);};

    divTargetArray.forEach(e=>{
        let targetRef = document.getElementById(e);

        if (targetRef && targetRef.classList.contains("disabledEvent")) {
            targetRef.classList.remove("disabledEvent");
        }
    });
    
}


// Bouton dynamique "ajouter quelquechose"
class Button_add {
    constructor(text, calledFunction, isDisabled = false, parent = document.body) {
        this.bouton = document.createElement("button");
        this.bouton.className = "dynamic-button-add";
        this.bouton.disabled = isDisabled;
        this.calledFunction = calledFunction;
        
        this.bouton.addEventListener("click", () =>{
            calledFunction();
        });

        // Ajout du contenu HTML
        const p = document.createElement("p");
        p.className = "planningEditorPlus";
        p.textContent = "+";

        this.bouton.appendChild(p);
        this.bouton.append(` ${text}`);

        // Insertion dans le DOM
        parent.appendChild(this.bouton);
    }


    disableButton(){
        this.bouton.disabled = true;
    };

    enableButton(){
        this.bouton.disabled = false;
    }
}



// Gestion écran de chargement
function eventLoadingScreen() {
    console.log("Traitement écran de chargement");

    const divLoadingScreenRef = document.getElementById("divLoadingScreen");
    if (!divLoadingScreenRef) {
        console.warn("⚠️ Élément #divLoadingScreen introuvable");
        return;
    }

    // Ajoute la classe pour lancer la transition CSS
    divLoadingScreenRef.classList.add('fade-out');

    // Après la transition, on cache complètement la div
    divLoadingScreenRef.addEventListener('transitionend',() => {
        divLoadingScreenRef.style.display = 'none';
        console.log("Écran de chargement retiré");
        },
        { once: true } // exécute une seule fois, puis auto-supprime le listener
    );
}





// ---------------------------------------------------- #MAIN MENU ---------------------------------------------------------------------














class Button_main_menu{
    constructor(imgRef,text,functionTarget,isRewardBtn = false){
        this.imgRef = imgRef;
        this.text = text;
        this.functionTarget = functionTarget;
        this.isRewardBtn = isRewardBtn;
        
        this.button = document.createElement("button");
        

        // Id selon si c'est le boutton reward ou non
        if (this.isRewardBtn) {
            this.button.id = "btnMenuRewards";
        }else{
            this.button.id = getRandomShortID("mainMenuBtn_");
        }

        this.button.classList.add("btn-menu");

        // Reward disponible
        if (this.isRewardAvailable) {
            this.button.classList.add("rewardAvailable");
        }


        // Rendu
        this.render();
        //Insertion
        let parentRef = document.getElementById("divMainBtnMenu");
        parentRef.appendChild(this.button);
        //evènement
        this.listener();

    }

    render(){
        this.button.innerHTML = `
            <img src=${this.imgRef} alt="Icone">
            <span>${this.text}</span>
        `;
    }

    listener(){
        this.button.addEventListener("click",()=>{
            this.functionTarget();
        });
    }
}



class Button_main_menu_Valider{
    constructor(text,functionTarget){
        this.text = text;
        this.functionTarget = functionTarget;
        
        this.button = document.createElement("button");
        this.button.id = getRandomShortID("mainMenuBtn_");
        this.button.classList.add("btn-menu", "btnFocus");
        this.button.innerHTML = this.text;

        //Insertion
        let parentRef = document.getElementById("divMainBtnMenu");

        parentRef.appendChild(this.button);
        
        //evènement
        this.listener();

    }

    listener(){
        this.button.addEventListener("click",()=>{
            this.functionTarget();
        });
    }
}


//les éléments généraux pour bouton main menu
let btnMainMenuData = {
    return : {
        imgRef:"./Icons/Icon-Return-cancel.webp",
        text:"Retour"
    },
    planning : {
        imgRef:"./Icons/Icon-Agenda-Hebdo.webp",
        text:"Planning"
    },
    seance:{
        imgRef:"./Icons/Icon-Session.webp",
        text:"Séance"
    },
    stats:{
        imgRef:"./Icons/Icon-Stat.webp",
        text:"Stats"
    },
    objectif:{
        imgRef:"./Icons/Icon-Objectif.webp",
        text:"Objectif"
    },
    objectif_gestion:{
        imgRef:"./Icons/Icon-Setting.webp",
        text:"Gestion"
    },
    reward:{
        imgRef:"./Icons/Icon-Trophy.webp",
        text:"Trophées"
    },
    plus:{
        imgRef:"./Icons/Icon-Menu-Plus.webp",
        text:"Plus"
    },
    delete:{
        imgRef:"./Icons/Icon-Delete-color.webp",
        text:"Supprimer"
    },
    reset:{
        imgRef:"./Icons/Icon-Reset.webp",
        text:"Reset"
    },
    action:{
        imgRef:"./Icons/Icon-Autres.webp",
        text:"Actions"
    },
    notes:{
        imgRef:"./Icons/Icon-Notes.webp",
        text:"Notes"
    },
    recup:{
        imgRef:"./Icons/Icon-Recup-Disable.webp",
        text:"Récup"
    },
    generateMemory:{
        imgRef:"./Icons/Icon-Recup-Disable.webp",
        text:"Générer"
    }
}

let isInMainMenu = true;//pour la gestion du keyboard pour masquer ou non les deux boutons flottant

function onGenerateMainMenuApp() {
    isInMainMenu = true;


    // Vide le précedent contenut
    let divMainMenuParentRef = document.getElementById("divMainBtnMenu");
    divMainMenuParentRef.innerHTML = "";

    //crée les boutons
    //Planning
    new Button_main_menu(btnMainMenuData.notes.imgRef,btnMainMenuData.notes.text,()=>onChangeMenu("Notes"));
    //Séance
    new Button_main_menu(btnMainMenuData.seance.imgRef,btnMainMenuData.seance.text,()=>onChangeMenu("Session"));
    //Stats
    new Button_main_menu(btnMainMenuData.stats.imgRef,btnMainMenuData.stats.text,()=>onChangeMenu("Stat"));
    //Reward
    new Button_main_menu(btnMainMenuData.objectif.imgRef,btnMainMenuData.objectif.text,()=>onChangeMenu("Objectif_Dashboard"));
    //Plus
    new Button_main_menu(btnMainMenuData.plus.imgRef,btnMainMenuData.plus.text,()=>onClickMainMenuSup());
}





// --------------------------------------- FIN MAIN MENU ------------------------------------------------------*









// Génération des options d'activité dans l'éditeur d'activité
function onGenerateActivityOptionChoice(selectorChoiceId) {

    // Traite d'abord les favoris
    if (devMode === true){console.log("Lancement de la generation des choix des activités");};

    let selectorChoiceRef = document.getElementById(selectorChoiceId);
    if (devMode === true){console.log("Reset les éléments");};
    selectorChoiceRef.innerHTML = "";

    if (devMode === true){console.log(" ajout des favoris si présent = " + userFavoris.length);};
    userFavoris.sort();

    userFavoris.forEach(activity => {
        let newOption = document.createElement("option");
        newOption.value = activity;
        newOption.innerHTML = " * " +  activityChoiceArray[activity].displayName;
        selectorChoiceRef.appendChild(newOption);
        if (devMode === true){console.log("ajout de l'option" + activityChoiceArray[activity].displayName );};
    });


    // Trier le tableau par ordre alphabétique 
    let activitySortedKey = Object.keys(activityChoiceArray);
    activitySortedKey.sort();

    // Ajouter les autres options triées
    activitySortedKey.forEach(activity => {
        let newOption = document.createElement("option");
        newOption.value = activity;
        newOption.innerHTML = activityChoiceArray[activity].displayName;
        selectorChoiceRef.appendChild(newOption);
    });

};


let fakeOptionTargetMode = "";//pour connaitre à quel système s'addresse le fake selecteur (activityEditor ,templateEditor , ou objectifEditor)


function onGenerateFakeOptionList(idParentTarget) {
    let parentTargetRef = document.getElementById(idParentTarget);

    // Traite d'abord les favoris
    if (devMode === true){
        console.log("[FAKE SELECTOR]Lancement de la generation des choix des activités");
        console.log("[FAKE SELECTOR] ID Parent pour insertion : " + parentTargetRef);
    };

    parentTargetRef.innerHTML = "";
    let firstFavorisName = "C-A-P"; // Utilisé pour que la première activité favorite, et l'activité identique dans le reste de la liste ai le meme bouton radio


    if (devMode === true){console.log(" [FAKE SELECTOR] ajout des favoris si présent = " + userFavoris.length);};
    userFavoris.sort();

    userFavoris.forEach((e,index)=>{

        // Creation
        let newContainer = document.createElement("div");
        newContainer.classList.add("fake-opt-item-container");
        newContainer.onclick = function (event){
            event.stopPropagation();
            onChangeActivityTypeFromFakeSelect(e);
            onSetBtnRadio(e);
        }
    
        // Style sans border botton pour le dernier
        if (index === (userFavoris.length - 1)) {
            newContainer.classList.add("fake-opt-item-last-favourite");
        }
        
        let newFavoriteSymbol = document.createElement("span");
        newFavoriteSymbol.innerHTML = "*";
        newFavoriteSymbol.classList.add("favouriteSymbol");


        let newImg = document.createElement("img");
        newImg.classList.add("fake-opt-item");
        newImg.src = activityChoiceArray[e].imgRef;
    
        let newTitle = document.createElement("span");
        newTitle.innerHTML = activityChoiceArray[e].displayName;
        newTitle.classList.add("fake-opt-item","fake-opt-item-favoris");
    
    
        // Bouton radio fake pour simuler le selecteur
        let newBtnRadioFake = document.createElement("div");
        newBtnRadioFake.classList.add("radio-button-fake");
        newBtnRadioFake.id = "btnRadio-fav-" + e;
    

        // Effet bouton plein pour le premier favoris
        if (index === 0) {
            newBtnRadioFake.classList.add("selected");
            firstFavorisName = e;
        }
    
        // Insertion
        newContainer.appendChild(newFavoriteSymbol);
        newContainer.appendChild(newImg);
        newContainer.appendChild(newTitle);
        newContainer.appendChild(newBtnRadioFake);
    
        parentTargetRef.appendChild(newContainer);
    });


    if (devMode === true){console.log(" [FAKE SELECTOR] ajout du reste des types d'activités")};

    // Puis toutes les types d'activités
    let activitySortedKey = Object.keys(activityChoiceArray);
    activitySortedKey.sort();


    activitySortedKey.forEach((e,index)=>{

        // Creation
        let newContainer = document.createElement("div");
        newContainer.classList.add("fake-opt-item-container");
        newContainer.onclick = function (event){
            event.stopPropagation();
            onChangeActivityTypeFromFakeSelect(e);
            onSetBtnRadio(e);
        }
    
        // Style sans border botton pour le dernier
        if (index === (activitySortedKey.length - 1)) {
            newContainer.classList.add("fake-opt-item-last-container");
        }
      
        let newImg = document.createElement("img");
        newImg.classList.add("fake-opt-item");
        newImg.src = activityChoiceArray[e].imgRef;
    
        let newTitle = document.createElement("span");
        newTitle.innerHTML = activityChoiceArray[e].displayName;
        newTitle.classList.add("fake-opt-item");
    
    
        // Bouton radio fake pour simuler le selecteur
        let newBtnRadioFake = document.createElement("div");
        newBtnRadioFake.classList.add("radio-button-fake");
        newBtnRadioFake.id = "btnRadio-"+e;

        // Effet bouton plein pour l'activité identique au premier favoris
        if (e === firstFavorisName) {
            newBtnRadioFake.classList.add("selected");
        }
    
        // Insertion
    
        newContainer.appendChild(newImg);
        newContainer.appendChild(newTitle);
        newContainer.appendChild(newBtnRadioFake);
    
        parentTargetRef.appendChild(newContainer);
    });


}




// Génère un id court aléatoire, avec control des doublons
function getRandomShortID(prefixe, existingIds = {}) {
    let id;
    do {
        const randomPart = Math.random().toString(36).slice(2, 11); // 9 caractères aléatoires
        id = `${prefixe}${randomPart}`;
    } while (id in existingIds);
    return id;
}

// fonction pour retirer le bouton radio plein

function onSetBtnRadio(idTargetToAdd) {


    // Pour rechercher dans les enfants d'un parent spécifique
    let parent = document.getElementById("divFakeSelectOptList");


    // Retire les boutons radio plein
    let elementToRemoveClass = parent.querySelectorAll(".selected");
    elementToRemoveClass.forEach(e=>{
        e.classList.remove("selected");
    });
    


    // Ajoute les boutons radio plein
    let elementsToAddClass = parent.querySelectorAll(`#btnRadio-fav-${idTargetToAdd}, #btnRadio-${idTargetToAdd}`);
    elementsToAddClass.forEach(e=>{
        e.classList.add("selected");
    });



    if (devMode === true) {
        console.log("[FAKE SELECT] Gestion des bouton radio");
        console.log("[FAKE SELECT] A retirer : ");
        console.log(elementToRemoveClass);
        console.log("[FAKE SELECT] A ajouter : ");
        console.log(elementsToAddClass);
    }
}



function onResetBtnRadio() {

    let idForRadio = userFavoris.length > 0 ? userFavoris[0] : "C-A-P";

     // Pour rechercher dans les enfants d'un parent spécifique
     let parent = document.getElementById("divFakeSelectOptList");


     // Retire les boutons radio plein
     let elementToRemoveClass = parent.querySelectorAll(".selected");
     elementToRemoveClass.forEach(e=>{
         e.classList.remove("selected");
     });
 
 
     // Ajoute les boutons radio plein
     let elementsToAddClass = parent.querySelectorAll(`#btnRadio-fav-${idForRadio}, #btnRadio-${idForRadio}`);
     elementsToAddClass.forEach(e=>{
         e.classList.add("selected");
     });
 
 
     if (devMode === true) {
         console.log("[FAKE SELECT] RESET des bouton radio");
         console.log("[FAKE SELECT] A retirer : ");
         console.log(elementToRemoveClass);
         console.log("[FAKE SELECT] A ajouter : ");
         console.log(elementsToAddClass);
         console.log(`les ID : #btnRadio-fav-${idForRadio}, #btnRadio-${idForRadio}`);
     }
}


// Changement de type d'activité via le fake selecteur
function onChangeActivityTypeFromFakeSelect(activityType) {

    let realSelectorTargetRef;

        // Référence les éléments cibles
    if (fakeOptionTargetMode === "activityEditor") {
        realSelectorTargetRef = document.getElementById("selectorCategoryChoice");
    } else if (fakeOptionTargetMode === "templateEditor"){
        realSelectorTargetRef = document.getElementById("selectorTemplateCategoryChoice");
    } else if (fakeOptionTargetMode === "objectifEditor"){
        realSelectorTargetRef = document.getElementById("selectorObjectifCategoryChoice");
    }else {
        console.log("ERREUR dans le mode du fake : ", fakeOptionTargetMode);
    }


    // set la nouvelle valeur dans le vrai selecteur caché
    realSelectorTargetRef.value = activityType;
    if (devMode === true) {
        console.log(realSelectorTargetRef);
    }



    // set l'image de prévisualisation
    if (fakeOptionTargetMode === "activityEditor") {
        onChangeActivityPreview(activityType);
    } else if (fakeOptionTargetMode === "templateEditor"){
        onChangeTemplatePreview(activityType);
    } else if (fakeOptionTargetMode === "objectifEditor"){
        onChangeObjectifPreview(activityType);
    }else {
        console.log("ERREUR dans le mode du fake");
    }



    // ferme le fake option
    onCloseFakeSelectOpt();

}


// Clique sur le fake selecteur
function onClickFakeSelect(MenuTarget){

    //set le mode d'ouverture du fake selecteur. Pour activityEditor ou templateEditor
    fakeOptionTargetMode = MenuTarget;

    let locDivFakeSelectOptRef = document.getElementById("divFakeSelectOpt");
    const onReturnFromFakeSelect = (event)=> onCloseFakeSelectOpt(event);
    locDivFakeSelectOptRef.addEventListener("click",onReturnFromFakeSelect);
    onAddEventListenerInRegistry("globalFakeSelect",locDivFakeSelectOptRef,"click",onReturnFromFakeSelect);

    // Affiche le fake option
    document.getElementById("divFakeSelectOpt").style.display = "flex";

}


function onCloseFakeSelectOpt(event){
    onRemoveEventListenerInRegistry(["globalFakeSelect"]);
    document.getElementById("divFakeSelectOpt").style.display = "none";
}






// -------------------- GESTION DES EVENT LISTENER ------------------





// pour stocker tous les écouteurs d'évènements
const allEventListenerRegistry = {
    //l'éditeur d'un item
    sessionItemEditor:[],
    sessionMenuSup:[],
    sessionMenuGeneration:[],
    sessionSendToActivity : [],
    planningEditor:[],
    activityEditor:[],
    globalFakeSelect:[],
    stat:[],
    rewards:[],
    gestData:[],
    gestDataConfirmDelete:[],
    setting:[],
    templateEditor:[],
    templateSession:[],
    sortFilterSearch:[],
    mainButton:[],
    noteItemEditor:[],
    noteSearch:[],
    updateEvent:[],
    recupPopup:[],
    recupEditor:[],
    memoryEditor:[],
    visionneuse:[],
    objectifEditor:[],
    objectifPopupModify:[],
    objectifKPI:[]
}


//fonction pour gérer un ajout
function onAddEventListenerInRegistry(category, elementRef, actionType, calledFunction) {
    allEventListenerRegistry[category].push({elementRef, actionType, calledFunction });
}



//ATTENTION : categoryArray est un tableau. Exemple d'appel unique
//onRemoveEventListenerInRegistry(["categoryArray"])
function onRemoveEventListenerInRegistry(categoryArray) {
    categoryArray.forEach(category => {
        // Vérifie si la catégorie existe dans le registre
        if (allEventListenerRegistry[category]) {
            // Si des écouteurs sont présents pour cette catégorie
            allEventListenerRegistry[category].forEach(({ elementRef, actionType, calledFunction }) => {
                elementRef.removeEventListener(actionType, calledFunction);
            });
            // Vide le tableau après suppression
            allEventListenerRegistry[category] = [];
            if(devMode === true){
                console.log(`[EVENT-LISTENER] : Tous les écouteurs de ${category} ont été supprimés.`);
            }
        } else {
            console.warn(`[EVENT-LISTENER] : La catégorie ${category} n'existe pas dans le registre.`);
        }
    });
}

function onConsoleLogEventListenerRegistry() {
    let result = {};
    Object.keys(allEventListenerRegistry).forEach(category=>{
        result[category] = allEventListenerRegistry[category].length;
    });
    console.log("[EVENT-LISTENER]", result);
}


// -------------------- FIN GESTION DES EVENT LISTENER ------------------






// fonction de gestion de l'affichage
function onChangeDisplay(toHide,toDisplayBlock,toDisplayFlex,toDisable,toEnable,visibilityOFF,visibilityON) {
    // Cache les items
    toHide.forEach(id=>{
        if (devMode === true) {console.log("[NAVIGATION] to hide : " + id);};
        let itemRef = document.getElementById(id);
        itemRef.style.display = "none";
    });

    // Affiche les items en block
    toDisplayBlock.forEach(id=>{
        if (devMode === true) {console.log("[NAVIGATION] to display bloc : " + id);};
        let itemRef = document.getElementById(id);
        itemRef.style.display = "block";
    });

     // Affiche les items en flex
     toDisplayFlex.forEach(id=>{
        if (devMode === true) {console.log("[NAVIGATION] to display flex : " + id);};
        let itemRef = document.getElementById(id);
        itemRef.style.display = "flex";
    });


    // Desactive les items
    toDisable.forEach(id=>{
        if (devMode === true) {console.log("[NAVIGATION] to disable : " + id);};
       let itemRef = document.getElementById(id);
       itemRef.style.opacity = 0.1;
       itemRef.style.pointerEvents = "none";
    });

    // Active les items
    toEnable.forEach(id=>{
        if (devMode === true) {console.log("[NAVIGATION] to enable : " + id);};
        let itemRef = document.getElementById(id);
        itemRef.style.opacity = 1;
        itemRef.style.pointerEvents = "all";
    });



    // Visibilité OFF pour les items
    visibilityOFF.forEach(id=>{
        if (devMode === true) {console.log("[NAVIGATION] to VISIBILITY OFF : " + id);};
        let itemRef = document.getElementById(id);
        itemRef.style.visibility = "hidden";
    });

    // Visibilité ON pour les items
    visibilityON.forEach(id=>{
        if (devMode === true) {console.log("[NAVIGATION] to visibility ON : " + id);};
        let itemRef = document.getElementById(id);
        itemRef.style.visibility = "visible";
    });


};


// retourne une l'heure actuel au format 00:00
function onGetCurrentTime() {
    let currentTime = new Date();

    let formatedHours = currentTime.getHours() > 9 ? currentTime.getHours() : "0" + currentTime.getHours() ;
    let formatedMinutes = currentTime.getMinutes() > 9 ? currentTime.getMinutes() : "0" + currentTime.getMinutes();

    return `${formatedHours}:${formatedMinutes}`;
}

// retourne une l'heure actuel au format 00:00:00
function onGetCurrentTimeAndSecond() {
    let currentTime = new Date();

    let formatedHours = currentTime.getHours() > 9 ? currentTime.getHours() : "0" + currentTime.getHours() ;
    let formatedMinutes = currentTime.getMinutes() > 9 ? currentTime.getMinutes() : "0" + currentTime.getMinutes();
    let formatedSeconds = currentTime.getSeconds() > 9 ? currentTime.getSeconds() : "0" + currentTime.getSeconds();
    
    return `${formatedHours}:${formatedMinutes}:${formatedSeconds}`;
}


// Récupère les date du jours

function onFindDateTodayUS() {
    let today = new Date();
    let year = today.getFullYear();
    let month = String(today.getMonth() + 1).padStart(2, '0');
    let day = String(today.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};

// La date d'hier
function onFindDateYesterdayUS() {
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); // Soustrait un jour à la date actuelle
    
    let year = yesterday.getFullYear();
    let month = String(yesterday.getMonth() + 1).padStart(2, '0');
    let day = String(yesterday.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};






//formatage =  tout en majuscule
function onSetToUppercase(e) {
    return e.toUpperCase();
};


// Formatage = tout en minuscule
function onSetToLowercase(e) {
    return e.toLowerCase();
}

//Formatage = première lettre forcé majuscule
function onSetFirstLetterUppercase(e) {
    return e.charAt(0).toUpperCase() + e.slice(1);
};


// detection des champs vides obligatoires
function onCheckEmptyField(inputRef) {
    if (inputRef.value === "") {
        if (devMode === true){console.log("Champ vide obligatoire détecté !");};
        inputRef.classList.add("fieldRequired");
    };
    return inputRef.value === ""? true :false;
};

// retrait de l'indication de champ obligatoire si activé, lorsque l'utilisateur
//  modifie quelque chose dans le champ input
function onRemoveFieldRequired(targetRef) { 
    if (targetRef.classList.contains("fieldRequired")) {
        targetRef.classList.remove("fieldRequired");
    }
    
}



// Remet la scroll bar en haut
function onResetScrollBarToTop(divParentID){
    let targetRef = document.getElementById(divParentID);

    // remonte le scroll dès que possible
    const waitUntilVisible = () => {
        const style = window.getComputedStyle(targetRef);
        if (style.display === "none") {
            // Retente après un court délai
            setTimeout(waitUntilVisible, 30);
        } else {
            // Maintenant visible, on peut scroller
            targetRef.scrollTo({ top: 0, behavior: "auto" });
        }
    };

    waitUntilVisible();
}

//met le focus dans un input ou textearea et la curseur à la fin
function onSetTextFocus(itemRef) {
    itemRef.focus();
    itemRef.setSelectionRange(itemRef.value.length, itemRef.value.length);
}



// Conversion du format time en seconde
function onConvertTimeToSecond(stringValue) {
    let [hours, minutes, seconds] = stringValue.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
};


// Convertion des dates stocké en US vers le format FR

function onFormatDateToFr(dateString) {
    // Créer un objet Date en analysant la chaîne de date
    let date = new Date(dateString);

    // Obtenir les composants de la date
    let day = date.getDate();
    let month = date.getMonth() + 1; // Les mois vont de 0 à 11, donc ajouter 1
    let year = date.getFullYear();

    // Obtenir l'année actuelle
    let currentYear = new Date().getFullYear();

    // Tableau des noms de mois en français
    const montName = ["jan.", "fév.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

    if (year === currentYear) {
        // Si l'année est l'année en cours, retourner le format "day mois"
        return `${day} ${montName[month - 1]}`;
    } else {
        // Sinon, retourner le format "jj-mm-aa"
        day = (day < 10) ? '0' + day : day;
        month = (month < 10) ? '0' + month : month;

        let year2Digits = year % 100; // Obtenir les deux derniers chiffres de l'année
        year2Digits = (year2Digits < 10) ? '0' + year2Digits : year2Digits;

        return `${day}-${month}-${year2Digits}`;
    }
};



//Pour les informations aléatoires
//permet d'obtenir un index
function getRandomSessionInfo(arrayTarget) {
    const index = Math.floor(Math.random() * arrayTarget.length);
    return arrayTarget[index];
}


// si la date en entre est après la date du jour
function isDateAfterToday(inputDate) {
    // Crée une nouvelle instance de la date actuelle
    const today = new Date();

    // Crée une instance de la date d'entrée
    const dateToCompare = new Date(inputDate);

    // Compare les dates : retourne true si la date entrée est après aujourd'hui
    //ATTENTION : "Aujourd'hui" comment à partir d'1 heure du matin pour l'application
    return dateToCompare > today;
}





// Gestion convertion des heures input number en mode input time

function timeFormatToInputNumber(timeString) {
    const [hours, minutes, seconds] = timeString.split(":");
    return {
        hours,
        minutes,
        seconds
    };
}

// Convertion secondes en heures minutes
function onConvertSecondesToHours(totalSeconds) {
    const seconds = Number(totalSeconds);

    if (!Number.isFinite(seconds) || seconds < 0) {
        return {
            heures: 0,
            minutes: "00",
            secondes: "00"
        };
    }

    const heures = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secondes = seconds % 60;

    return {
        heures,
        minutes: String(minutes).padStart(2, '0'),
        secondes: String(secondes).padStart(2, '0')
    };
}

// Fonction pour formater les entrées et garantir un affichage correct
function formatNumberInput(input, max, digits) {
    let value = parseInt(input.value, 10) || 0;

    // Si la valeur dépasse la valeur max autorisée, la ramener à max
    if (value > max) value = max;

    // Formater pour afficher toujours avec le bon nombre de chiffres (2 ou 3)
    input.value = value.toString().padStart(digits, '0');

    // Mettre à jour l'affichage de l'input time
}


// Selectionne tout le contenu lorsque je clique dans la zone de l'input
function selectAllText(input) {
    input.select();  // Sélectionner tout le texte à l'intérieur de l'input
}

// Empêche l'affichage du menu contextuel
function disableContextMenu(event) {
    event.preventDefault();  // Empêche l'action par défaut du clic droit
}



// Affiche la date au format userFriendly
function onDisplayUserFriendlyDate(date){
    let friendlyDate = "";

    if (date === dateToday) {
        friendlyDate = "Auj.";
    }else if (date === dateYesterday) {
        friendlyDate = "Hier";
    }else{
        friendlyDate = onFormatDateToFr(date);
    };

    return friendlyDate;
}







// Gestion de l'affichage de l'information complémentaire des menus
function onHideCustomInfo() {
    document.getElementById("customInfo").style.display = "none";
}

function onDisplayCustomInfo() {
    document.getElementById("customInfo").style.display = "inline";
}


// Gestion d'info complémentaire pour editeur d'activité (image de l'activité)
function onHideImgActivityPreview() {
    document.getElementById("pImgActivityPreviousArea").style.display = "none";
}

function onDisplayImgActivityPreview() {
    document.getElementById("pImgActivityPreviousArea").style.display = "inline";
}


let allDivHomeToDisplayNone = ["btnNewActivity","divFilterSort","divItemList","pSearchArea"],
    allDivHomeToDisplayBlock = ["btnNewActivity"],
    allDivHomeToDisplayFlex = ["divFilterSort","divItemList","pSearchArea"];



// Affiche et cache la div scrollable des menus
function displayDivScrollableMenu() {
    document.getElementById("mainDivScrollable").style.display = "block";
}

function hideDivScrollableMenu() {
    document.getElementById("mainDivScrollable").style.display = "none";
}



let dateToday = onFindDateTodayUS(),
    dateYesterday = onFindDateYesterdayUS();




// NAVIGATION DANS LES MENUS 

// reference le "p" qui contient le titre du menu pour le changer
let pMenuTitleRef = document.getElementById("pMenuTitle");


function onChangeMenu(menuTarget) {
    isInMainMenu = false; //pour la gestion du masquage des boutons flottant lorsque le clavier est visible
    
    if (devMode === true){console.log(" [ NAVIGATION ] Demande de changement menu : " + menuTarget);};


    switch (menuTarget) {
        case "Session":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour nouveau menu : Counter");};
            displayDivScrollableMenu();
            pMenuTitleRef.innerHTML = "Séance";
            onChangeDisplay(allDivHomeToDisplayNone,[],["divSession"],[],[],[],[]);
            onOpenMenuSession();
            onDisplayCustomInfo();
        break;
        case "EditSession":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour nouveau menu : Edit Session");};
            pMenuTitleRef.innerHTML = "Générer une séance";
            onChangeDisplay(["divSession"],[],["divEditSession"],[],[],[],[]);
            onOpenMenuEditSession();
            onHideCustomInfo();
        break;
        case "Notes":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour nouveau menu : notes");};
            displayDivScrollableMenu();
            pMenuTitleRef.innerHTML = "Notes";
            onChangeDisplay(allDivHomeToDisplayNone,[],["divNotes"],[],[],[],[]);
            onOpenMenuNotes(true);
        break;
        case "Stat":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour nouveau menu : Stat");};
            displayDivScrollableMenu();
            pMenuTitleRef.innerHTML = "Statistiques";
            onChangeDisplay(allDivHomeToDisplayNone,[],["divStat"],[],[],[],[]);
            onOpenMenuStat();
            onDisplayImgActivityPreview();
        break;

        case "Objectif_Dashboard":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour nouveau menu : Tableau de bord objectif");};
            displayDivScrollableMenu();
            pMenuTitleRef.innerHTML = "Mes objectifs";
            onChangeDisplay(allDivHomeToDisplayNone,[],["divObjectifDashboard"],[],[],[],[]);
            onOpenMenuObjectifDashboard();
        break;
        case "Objectif_Gestion":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour nouveau menu : Gestion objectif");};
            pMenuTitleRef.innerHTML = "Gérer mes objectifs";
            onChangeDisplay(["divObjectifDashboard"],[],["divObjectifGestion"],[],[],[],[]);
            onOpenMenuObjectifGestion();
        break;
        case "Objectif_Editor":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour nouveau menu : Editeur objectif");};
            pMenuTitleRef.innerHTML = "Editer un objectif";
            onChangeDisplay(["divObjectifGestion"],[],["divObjectifEditor"],[],[],[],[]);
            onOpenMenuObjectifEditor();
            onDisplayImgActivityPreview();
        break;


        case "Memory" :
            //traitement du menu reward à fermer
            onResetRewardsMenu();
            //retire les évènements qui concerne le menu et ses enfant
            onRemoveEventListenerInRegistry(["rewards"]);

            //gere l'apparition du menu memory
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour nouveau menu : MEMORY");};
            pMenuTitleRef.innerHTML = "Ajouter un évent";
            onChangeDisplay(["divRewards"],[],["divMemory"],[],[],[],[]);
            onHideCustomInfo();
            onOpenMenuMemory();
        break;
        case "NewActivity":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour nouveau menu : New Activity");};
            displayDivScrollableMenu();
            pMenuTitleRef.innerHTML = "Créer une activité";
            onChangeDisplay(allDivHomeToDisplayNone,[],["divActivityEditor"],[],[],[],[]);
            onOpenNewActivity();
            onDisplayImgActivityPreview();
        break;
        case "NewActivityFromTemplate":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour nouveau menu : NewActivityFromTemplate");};
            displayDivScrollableMenu();
            pMenuTitleRef.innerHTML = "Créer une activité";
            onChangeDisplay(allDivHomeToDisplayNone,[],["divActivityEditor"],[],[],[],[]);
            onDisplayImgActivityPreview();
        break;
        case "EditActivity":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour nouveau menu : EditActivity");};
            displayDivScrollableMenu();
            pMenuTitleRef.innerHTML = "Editer une activité";
            onChangeDisplay(allDivHomeToDisplayNone,[],["divActivityEditor"],[],[],[],[]);
            onDisplayImgActivityPreview();
        break;
        case "TemplateChoice":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour nouveau menu : TemplateChoice");};
            onCreateTemplateChoiceList();
            onChangeDisplay([],[],["divTemplateChoice"],[],[],[],[]);
        break;

        
        // Menu supplémentaire
        case "Rewards":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour nouveau menu : Rewards");};
            displayDivScrollableMenu();
            pMenuTitleRef.innerHTML = "Récompenses";
            onChangeDisplay(allDivHomeToDisplayNone,[],["divRewards"],[],[],[],[]);

            onDisplayCustomInfo();
            onOpenMenuRewards();
        break;
        case "Profil":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour nouveau menu : Profil");};
            displayDivScrollableMenu();
            pMenuTitleRef.innerHTML = "Mon profil";
            onChangeDisplay(allDivHomeToDisplayNone,[],["divProfil"],[],[],[],[]);
            onOpenMenuProfil();
        break;
        case "Favoris":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour nouveau menu : Favoris");};
            displayDivScrollableMenu();
            pMenuTitleRef.innerHTML = "Activités / Favoris";
            onChangeDisplay(allDivHomeToDisplayNone,["divFavoris"],[],[],[],[],[]);
            onOpenMenuFavoris();
        break;
        case "Planning":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour nouveau menu : Planning Hebdomadaire");};
            displayDivScrollableMenu();
            pMenuTitleRef.innerHTML = "Planning hebdomadaire";
            onChangeDisplay(allDivHomeToDisplayNone,[],["divPlanning"],[],[],[],[]);
            onOpenMenuPlanning();
        break;
        case "PlanningEditor":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour nouveau menu : Planning editor");};
            onChangeDisplay(["divPlanning"],[],["divPlanningEditor"],[],[],[],[]);
        break;
        case "GestData":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour nouveau menu : GestData");};
            displayDivScrollableMenu();
            pMenuTitleRef.innerHTML = "Gestion des données";
            onChangeDisplay(allDivHomeToDisplayNone,[],["divGestData"],[],[],[],[]);
            onOpenMenuGestData();
        break;
        case "GestTemplate":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour nouveau menu : GestTemplate");};
            displayDivScrollableMenu();
            pMenuTitleRef.innerHTML = "Modèles d'activités";
            onChangeDisplay(allDivHomeToDisplayNone,[],["divGestTemplate"],[],[],[],[]);
            onOpenMenuGestTemplate();
        break;
        case "NewTemplate":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour nouveau menu : NewTemplate");};
            pMenuTitleRef.innerHTML = "Création modèle d'activité";
            onChangeDisplay(["divGestTemplate"],[],["divTemplateEditor"],[],[],[],[]);
            onClickBtnCreateTemplate();
            onDisplayImgActivityPreview();
        break;
        case "ModifyTemplate":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour nouveau menu : TemplateEditor");};
            pMenuTitleRef.innerHTML = "Modification de modèle";
            onChangeDisplay(["divGestTemplate"],[],["divTemplateEditor"],[],[],[],[]);
            onDisplayImgActivityPreview();
        break;
        case "MenuTemplateSession":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour nouveau menu : MenuTemplateSession");};
            displayDivScrollableMenu();
            pMenuTitleRef.innerHTML = "Modèle de séance";
            onChangeDisplay(allDivHomeToDisplayNone,[],["divMenuTemplateSession"],[],[],[],[]);
            onOpenMenuTemplateSession();
        break;
        case "NewTemplateSession":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour nouveau menu : NewTemplateSession");};
            pMenuTitleRef.innerHTML = "Création modèle de séance";
            onChangeDisplay(["divMenuTemplateSession"],[],["divTemplateSessionEditor"],[],[],[],[]);
            onClickBtnCreateTemplateSession();
        break;
        case "ModifyTemplateSession":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour nouveau menu : ModifyTemplateSession");};
            pMenuTitleRef.innerHTML = "Modification de modèle";
            onChangeDisplay(["divMenuTemplateSession"],[],["divTemplateSessionEditor"],[],[],[],[]);
        break;
        case "Setting":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour nouveau menu : Setting");};
            displayDivScrollableMenu();
            pMenuTitleRef.innerHTML = "Paramètres";
            onChangeDisplay(allDivHomeToDisplayNone,[],["divSetting"],[],[],[],[]);
            onOpenMenuSetting();
        break;
        case "Corbeille":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour nouveau menu : Corbeille");};
            displayDivScrollableMenu();
            pMenuTitleRef.innerHTML = "Corbeille";
            onChangeDisplay(allDivHomeToDisplayNone,[],["divCorbeille"],[],[],[],[]);
            onOpenMenuCorbeille();
        break;
        case "Info":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour nouveau menu : Info");};
            displayDivScrollableMenu();
            pMenuTitleRef.innerHTML = "A propos";
            onChangeDisplay(allDivHomeToDisplayNone,[],["divInfo"],[],[],[],[]);
            onDisplayCustomInfo();
            onOpenMenuInfo();
        break;

        default:
            console.log("[ NAVIGATION ] Erreur : Aucune correspondance pour le nouveau menu = " + menuTarget);
        break;
    };

};




// Les menus supplémentaires
function onClickMainMenuSup(){
    onChangeDisplay(["btnNewActivity"],[],["divMainMenuSup"],[],[],[],[]);

    if (templateAvailable) {
        document.getElementById("btnNewFromTemplate").style.display = "none";
        if (devMode === true){console.log("HIDE : btnNewFromTemplate");};
    }


    // Appliquer l'animation aux boutons du menu supplémentaire
    onPlayAnimationIconMenu("divMainMenuSup",".btn-menu-sup");

};


function onPlayAnimationIconMenu(divParentID, classTarget) {

    // Ne joue que si animation est activée
    if (!userSetting.animationEnabled) {
        return
    }

    const divMenuSup = document.getElementById(divParentID);
    const buttons = divMenuSup.querySelectorAll(classTarget);

    buttons.forEach((btn, index) => {
        // Nettoyage préalable
        btn.classList.remove('animate-in');
        btn.style.opacity = '0';
        btn.style.transform = 'translateY(10px)';

        // Utiliser un timeout pour l'effet de décalage
        setTimeout(() => {
            btn.classList.add('animate-in');

            // Supprimer la classe à la fin de l'animation
            btn.addEventListener('animationend', () => {
                btn.classList.remove('animate-in');
                btn.style.opacity = '';
                btn.style.transform = '';
            }, { once: true });
        }, index * 50);
    });
}


function onClickMenuSup(event,target) {
    event.stopPropagation();
    document.getElementById("divMainMenuSup").style.display = "none";

    onChangeMenu(target);
};

function onAnnulMenuSup(){
    if (devMode === true){console.log("[ NAVIGATION ] Annulation menu supplémentaire");};
    onChangeDisplay(["divMainMenuSup"],["btnNewActivity"],[],[],[],[],[]);

    if (templateAvailable) {
        document.getElementById("btnNewFromTemplate").style.display = "block";
        if (devMode === true){console.log("Display : btnNewFromTemplate");};
    }
};





function onLeaveMenu(menuTarget) {
    
    if (devMode === true){console.log(" [ NAVIGATION ] Demande de changement menu demandé par : " + menuTarget);};

    // remet le titre initial du menu
    // reference le "p" qui contient le titre du menu pour le changer
    let pMenuTitleRef = document.getElementById("pMenuTitle");
    pMenuTitleRef.innerHTML = "Mon Suivi Sportif";

    switch (menuTarget) {

        case "Session":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour quitter le menu :  : Session");};
            //retire les écouteurs d'évènements qui concerne le menu et ses enfant
            onRemoveEventListenerInRegistry(["sessionItemEditor","sessionMenuSup","sessionSendToActivity","sessionMenuGeneration"]);
            hideDivScrollableMenu();
            onChangeDisplay(["divSession"],allDivHomeToDisplayBlock,allDivHomeToDisplayFlex,[],[],[],[]);
            onHideCustomInfo();
            onGenerateMainMenuApp();
        break;
        case "EditSession":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour quitter le menu :  : Edit Session");};
            //retire les évènements qui concerne le menu et ses enfant
            onRemoveEventListenerInRegistry(["sessionMenuGeneration"]);
            onChangeDisplay(["divEditSession"],[],["divSession"],[],[],[],[]);
            pMenuTitleRef.innerHTML = "Séance";
            onOpenMenuSession();
            onDisplayCustomInfo();
        break;
        case "Planning":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour quitter le menu :  : Planning");};
            // Retire les écoute d'evènement qui concerne le menu et ses enfant
            onRemoveEventListenerInRegistry(["planningEditor"]);
            hideDivScrollableMenu();
            onChangeDisplay(["divPlanning"],allDivHomeToDisplayBlock,allDivHomeToDisplayFlex,[],[],[],[]);
            onHideCustomInfo();
            onGenerateMainMenuApp();
        break;
        case "PlanningEditor":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour quitter le menu :  : Planning Editor");};
            onChangeDisplay(["divPlanningEditor"],[],["divPlanning"],[],[],[],[]);
            pMenuTitleRef.innerHTML = "Planning hebdomadaire";
            document.getElementById("divPlanningActivityChoiceList").innerHtml = "";
            onCreateMainMenuPlanning();//car reviens sur le menu planning
        break;
        
        case "Stat":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour quitter le menu :  : Stat");};
            // Retire les écoute d'evènement qui concerne le menu et ses enfant
            onRemoveEventListenerInRegistry(["stat"]);
            hideDivScrollableMenu();
            onChangeDisplay(["divStat"],allDivHomeToDisplayBlock,allDivHomeToDisplayFlex,[],[],[],[]);
            onHideImgActivityPreview();
            onGenerateMainMenuApp();
        break;
        case "Rewards":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour quitter le menu :  : Rewards");};
             //retire les évènements qui concerne le menu et ses enfant
            onRemoveEventListenerInRegistry(["rewards","visionneuse"]);
            hideDivScrollableMenu();
            onChangeDisplay(["divRewards"],allDivHomeToDisplayBlock,allDivHomeToDisplayFlex,[],[],[],[]);
            onHideCustomInfo();
            onGenerateMainMenuApp();
        break;

        case "Objectif_Dashboard":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour quitter le menu :  : Objectif dashboard");};
            hideDivScrollableMenu();
            onChangeDisplay(["divObjectifDashboard"],allDivHomeToDisplayBlock,allDivHomeToDisplayFlex,[],[],[],[]);
            onGenerateMainMenuApp();
        break;

        case "Objectif_Gestion":
            // Retour dans le dashboard
            pMenuTitleRef.innerHTML = "Mes objectifs";
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour quitter le menu :  : Objectif dashboard");};
            onChangeDisplay(["divObjectifGestion"],[],["divObjectifDashboard"],[],[],[],[]);
            onOpenMenuObjectifDashboard();
        break;

        case "Objectif_Editor":
            // Retour dans objectif gestion
            onRemoveEventListenerInRegistry(["objectifEditor"]);
            pMenuTitleRef.innerHTML = "Gérer mes objectifs";
            onChangeDisplay(["divObjectifEditor"],[],["divObjectifGestion"],[],[],[],[]);
            onOpenMenuObjectifGestion();
            onHideImgActivityPreview();
        break;


        case "Memory":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour quitter le menu :  : Rewards");};
             //retire les évènements qui concerne le menu et ses enfant
            onRemoveEventListenerInRegistry(["memoryEditor","visionneuse"]);
            //retourne dans le menu rewards
            onChangeDisplay(["divMemory"],[],["divRewards"],[],[],[],[]);
            pMenuTitleRef.innerHTML = "Récompenses";
            onDisplayCustomInfo();
            onOpenMenuRewards();
        break;
        case "Activity":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour quitter le menu :  : Activity");};
            onRemoveEventListenerInRegistry(["activityEditor","globalFakeSelect"]);
            hideDivScrollableMenu();
            onResetBtnRadio();
            onChangeDisplay(["divActivityEditor"],allDivHomeToDisplayBlock,allDivHomeToDisplayFlex,[],["divActivityEditor"],[],[]);
            onUnlockDivDoubleClick(["divActivityEditor","divMainBtnMenu"]);//retire la sécurité double click
            onHideImgActivityPreview();
            onGenerateMainMenuApp();
        break;

        // Condition utilisateur
        case "userCondition":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour quitter le menu :  : UserCondition");};
            // Affiche à nouveau header et footer
            document.getElementById("divMainBtnMenu").style.display = "flex";
            document.getElementById("divHeader").style.display = "flex";
            onChangeDisplay(["divConditionUtilisation"],allDivHomeToDisplayBlock,allDivHomeToDisplayFlex,[],[],[],[]);

            //vérifie si il y a un popup de nouveauté à afficher
            onCheckUpdateEvent();
        break;

        
        //  Menu supplementaire

        case "Profil":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour quitter le menu :  : Profil");};
            hideDivScrollableMenu();
            onChangeDisplay(["divProfil"],allDivHomeToDisplayBlock,allDivHomeToDisplayFlex,[],[],[],[]);
            onUnlockDivDoubleClick(["divMainBtnMenu","divProfil"]);//Securité double clic
            onGenerateMainMenuApp();
        break;
        case "Favoris":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour quitter le menu :  : Favoris");};
            hideDivScrollableMenu();
            onChangeDisplay(["divFavoris"],allDivHomeToDisplayBlock,allDivHomeToDisplayFlex,[],[],[],[]);
            onGenerateMainMenuApp();
        break;
        case "GestData":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour quitter le menu :  : GestData");};
            //retire les évènements qui concerne le menu et ses enfant
            onRemoveEventListenerInRegistry(["gestData","gestDataConfirmDelete"]);
            hideDivScrollableMenu();
            onChangeDisplay(["divGestData"],allDivHomeToDisplayBlock,allDivHomeToDisplayFlex,[],[],[],[]);
            onGenerateMainMenuApp();
        break;
        case "GestTemplate":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour quitter le menu :  : GestTemplate");};
            //retire les évènements qui concerne le menu et ses enfant
            onRemoveEventListenerInRegistry(["templateEditor"]);
            hideDivScrollableMenu();
            onChangeDisplay(["divGestTemplate"],allDivHomeToDisplayBlock,allDivHomeToDisplayFlex,[],[],[],[]);
            onGenerateMainMenuApp();
        break;
        case "TemplateEditor":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour quitter le menu :  : TemplateEditor");};
            onChangeDisplay(["divTemplateEditor"],[],["divGestTemplate"],[],[],[],[]);
            onUnlockDivDoubleClick(["divMainBtnMenu","divTemplateEditor"]);//retire la sécurité double click
            pMenuTitleRef.innerHTML = "Modèles d'activités";
            onResetBtnRadio();
            onHideImgActivityPreview();
            onCreateMainMenuGestTemplate();//car reviens sur menu template
        break;
        case "MenuTemplateSession":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour quitter le menu :  : MenuTemplateSession");};
            //retire les évènements qui concerne le menu et ses enfant
            onRemoveEventListenerInRegistry(["templateSession"]);
            hideDivScrollableMenu();
            onChangeDisplay(["divMenuTemplateSession"],allDivHomeToDisplayBlock,allDivHomeToDisplayFlex,[],[],[],[]);
            onGenerateMainMenuApp();
        break;
        case "TemplateSessionEditor":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour quitter le menu :  : TemplateSessionEditor");};
            onChangeDisplay(["divTemplateSessionEditor"],[],["divMenuTemplateSession"],[],[],[],[]);
            pMenuTitleRef.innerHTML = "Modèle de séance";
            onCreateMainMenuTemplateSession();//car reviens sur le menu template
        break;
        case "Setting":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour quitter le menu :  : Setting");};
            //retire les évènements qui concerne le menu et ses enfant
            onRemoveEventListenerInRegistry(["setting"]);
            hideDivScrollableMenu();
            onChangeDisplay(["divSetting"],allDivHomeToDisplayBlock,allDivHomeToDisplayFlex,[],[],[],[]);
            onUnlockDivDoubleClick(["divMainBtnMenu","divSetting"]);//retire la sécurité double click
            onGenerateMainMenuApp();
        break;
        case "Corbeille" : 
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour quitter le menu :  Corbeille");};
            hideDivScrollableMenu();
            onChangeDisplay(["divCorbeille"],allDivHomeToDisplayBlock,allDivHomeToDisplayFlex,[],[],[],[]);
            onGenerateMainMenuApp();
        break;
        case "Notes":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour quitter le menu : Notes");};
            //retire les évènements qui concerne le menu et ses enfant
            // onRemoveEventListenerInRegistry(["sessionNotes"]);
            hideDivScrollableMenu();
            onChangeDisplay(["divNotes"],allDivHomeToDisplayBlock,allDivHomeToDisplayFlex,[],[],[],[]);
            onGenerateMainMenuApp();
        break;
        case "Info":
            if (devMode === true){console.log("[ NAVIGATION ] Traitement pour quitter le menu :  : Info");};
            hideDivScrollableMenu();
            onChangeDisplay(["divInfo"],allDivHomeToDisplayBlock,allDivHomeToDisplayFlex,[],[],[],[]);
            onGenerateMainMenuApp();
            onHideCustomInfo();
        break;



        default:
            console.log("[ NAVIGATION ] Erreur : Aucune correspondance pour le menu = " + menuTarget);
        break;
    };

    if (devMode === true) {
        onConsoleLogEventListenerRegistry();
    }

};




// Fonction unique pour modifier tous les types de documents

async function updateDocumentInDB(docId, updateCallback) {
    try {
        // Récupérer le document
        const doc = await db.get(docId);

        if (!doc._id || !doc._rev) {
            throw new Error("Le document ne contient pas d'_id ou de _rev !");
        }

        // Appliquer la mise à jour avec la fonction callback
        const updatedDoc = updateCallback({ ...doc });

        // Sauvegarde en base
        const response = await db.put(updatedDoc);

        if (devMode === true){
            console.log(`Document ${docId} mis à jour avec succès :`, response);
        };
        return true;
    } catch (err) {
        console.error(`Erreur lors de la mise à jour du document ${docId} :`, err.message);
        return false;
    }
}







// ---------------------Gestion evènement-------------------------------------------

// Bouton menu principal
function onAddEventForMainMenuButton() {

    // Génère le menu principal de l'application
    onGenerateMainMenuApp();

    //Bouton Creation d'une activité
    let btnNewActivityRef = document.getElementById("btnNewActivity");
    const onClickNewActivity = () => onChangeMenu("NewActivity");
    btnNewActivityRef.addEventListener("click",onClickNewActivity);
    onAddEventListenerInRegistry("mainButton",btnNewActivityRef,"click",onClickNewActivity);


    //bouton nouveau depuis template
    let btnNewFromTemplateRef = document.getElementById("btnNewFromTemplate");
    const onClickTemplate = () => onChangeMenu("TemplateChoice");
    btnNewFromTemplateRef.addEventListener("click",onClickTemplate);
    onAddEventListenerInRegistry("mainButton",btnNewFromTemplateRef,"click",onClickTemplate);

    // La div menu supplémentaire
    let divMainMenuSupRef = document.getElementById("divMainMenuSup");
    const onCancelMenuSup = (event) => onAnnulMenuSup(event);
    divMainMenuSupRef.addEventListener("click", onCancelMenuSup);
    onAddEventListenerInRegistry("mainButton",divMainMenuSupRef,"click", onCancelMenuSup);

    // Les boutons supplémentaire LVL2
    let btnMenuSupArray = divMainMenuSupRef.querySelectorAll("button");
    btnMenuSupArray.forEach((btnRef) =>{
        let menuType = btnRef.dataset.menuType;
        const onClickMainMenuSup = (event) => onClickMenuSup(event,menuType);
        btnRef.addEventListener("click", onClickMainMenuSup);
        onAddEventListenerInRegistry("mainButton",btnRef,"click", onClickMainMenuSup);
    });

}

onAddEventForMainMenuButton();







// Confirmation suppression editeur (activity, template,templateSession, session)
let btnGlobalPopupCancelEventListener = null,
    btnGlobalPopupConfirmEventListener = null;

function addEventForGlobalPopupConfirmation(cancelPopupFunction,confirmPopupFunction,confirmText,actionType) {

    if (devMode === true) {
        console.log("[EVENT-LISTENER] Ajoute évènement pour annulation :", cancelPopupFunction);
        console.log("[EVENT-LISTENER] Ajoute évènement pour confirmation :", confirmPopupFunction);
    }

    // Annulation
    let cancelBtnTarget = document.getElementById("divGlobalPopupConfirmation");
    // retire l'évènement s'il éxistait
    if (btnGlobalPopupCancelEventListener && cancelBtnTarget) {
        cancelBtnTarget.removeEventListener("click",btnGlobalPopupCancelEventListener);
        btnGlobalPopupCancelEventListener = null;
    }

    btnGlobalPopupCancelEventListener = (event) => {
        cancelPopupFunction(event);
    }

    cancelBtnTarget.addEventListener("click",btnGlobalPopupCancelEventListener);


    // Confirmation

    let confirmBtnTarget = document.getElementById("btnGlobalPopupConfirmation");
    // retire l'évènement s'il éxistait
    if (btnGlobalPopupConfirmEventListener && confirmBtnTarget) {
        confirmBtnTarget.removeEventListener("click",btnGlobalPopupConfirmEventListener);
        btnGlobalPopupConfirmEventListener = null;
    }

    btnGlobalPopupConfirmEventListener = (event) =>{
        confirmPopupFunction(event);
    }
    
    confirmBtnTarget.addEventListener("click",btnGlobalPopupConfirmEventListener);

    // Set le texte de confirmation
    document.getElementById("pTextConfirmPopup").innerHTML = confirmText;

    // Set l'image selon le type d'action
    let imgAction = "";
    switch (actionType) {
        case "delete":
            imgAction = "./Icons/Icon-Delete-color.webp";
            break;
        case "reset":
            imgAction = "./Icons/Icon-Reset.webp";
            break;
        case "quitter":
            imgAction = "./Icons/Icon-Accepter.webp";
            break;
        default:
            break;
    }
    document.getElementById("imgPopupGlobalConfirmation").src = imgAction;


    // Affiche 
    document.getElementById("divGlobalPopupConfirmation").classList.add("show");
}



function removeEventForGlobalPopupConfirmation() {
    if (devMode === true) {
        console.log("[EVENT-LISTENER] retrait des évènements pour confirmation suppression");
    }


    // Bouton d'Annulation
    let cancelBtnTarget = document.getElementById("divGlobalPopupConfirmation");
    if (btnGlobalPopupCancelEventListener && cancelBtnTarget) {
        cancelBtnTarget.removeEventListener("click",btnGlobalPopupCancelEventListener);
        btnGlobalPopupCancelEventListener = null;
    }

    // Bouton de confirmation
    let confirmBtnTarget = document.getElementById("btnGlobalPopupConfirmation");
    if (btnGlobalPopupConfirmEventListener && confirmBtnTarget) {
        confirmBtnTarget.removeEventListener("click",btnGlobalPopupConfirmEventListener);
        btnGlobalPopupConfirmEventListener = null;
    }

    // Retire l'afficahge
    document.getElementById("divGlobalPopupConfirmation").classList.remove("show");
}


//Fonction de mise en évidence d'un mot recherché
function highlightSearchTerm(text, searchTerm) {
    if (!searchTerm) return text;

    // Fonction de normalisation : enlève accents, met en minuscule
    const normalize = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const normalizedText = normalize(text);
    const normalizedSearchTerm = normalize(searchTerm);

    if (!normalizedSearchTerm) return text;

    let result = '';
    let lastIndex = 0;
    let i = 0;

    while (i < normalizedText.length) {
        const index = normalizedText.indexOf(normalizedSearchTerm, i);
        if (index === -1) {
            result += text.slice(lastIndex);
            break;
        }

        // Ajouter la partie entre les matchs
        result += text.slice(lastIndex, index);

        // Ajouter le match avec la surbrillance
        const originalMatch = text.slice(index, index + normalizedSearchTerm.length);
        result += `<span class="search-highlight">${originalMatch}</span>`;

        i = index + normalizedSearchTerm.length;
        lastIndex = i;
    }

    return result;
}




// Normalise un tag
/**
 * Normalise la saisie utilisateur pour garantir
 * - cohérence des tags
 * - facilité de matching
 *
 * Étapes :
 * 1. trim() → supprime espaces début/fin
 * 2. toUpperCase() → tags en majuscules
 * 3. normalize + regex → supprime accents
 * 4. regex finale → garde uniquement A-Z et chiffres
 */
function normalizeTag(input) {
  return input
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "");
}


  // Ensemble des tags connus de l’utilisateur (base de suggestion)
// Set = pas de doublons
const userTagsList = new Set([]);

const MAX_TAG_LENGTH = 20;
const MAX_SELECTED_TAG = 3;



async function onSaveTagInDB() {
    await updateDocumentInDB(tagStoreName, (doc) => {
        doc.userTagList = [...userTagsList] // conversion Set → Array;
            return doc;
    });
    if (devMode === true) {
        console.log(`[TAG] : Nouveau tag. Sauvegarde en base`);
    }
   
}
