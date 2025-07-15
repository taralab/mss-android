
let userSessionItemsList = {
        counter_utkyzqjy0: {
            type: "counter/chrono/minuteur",
            name: "NOUVEAU COMPTEUR",
            displayOrder: 0,
            currentSerie: 0,
            serieTarget: 0,
            repIncrement: 0,
            totalCount: 0,
            color: "white"
        },
        chrono_abddef:{
            type : "CHRONO",
            name:"CHRONO NAME",
            displayOrder:1,
            color: "white",
            elapsedTime : 0 // en ms
        },
        minuteur_abcdef:{
            type:"MINUTEUR",
            name: "MINUTEUR NAME",
            displayOrder : 2,
            color : "white",
            duration : 60,//en secondes
            isDone :false
        }
    },
    maxSessionItems = 20,
    sessionItemsSortedKey = [],//array des clé trié par "displayOrder"
    sessionItemEditorMode, //creation ou modification
    currentSessionItemEditorID,//L'id de l'items en cours de modification
    sessionStartTime = "--:--:--",//date-heure du début de session set lorsque clique sur reset all counter, ou générate session
    sessionStorageName = "MSS_sessionCounterList",
    sessionStartTimeStorageName = "MSS_sessionStartTime",
    sortableInstance = null,//instance pour le drag n drop
    sessionActivityTypeToSend = null;//utilisé pour stocker le type d'activité à générer

let sessionItemColors = {
    white: {body:"#fff",button:"grey"},
    green: {body:"#E7F8F2",button:"#4EA88A",minuteur:"rgba(78, 168, 138, 0.3)"},
    yellow: {body:"#FFFBE5",button:"#C8A646",minuteur:"rgba(200, 166, 70, 0.3)"},
    red: {body:"#FDEBEC",button:"#D36868",minuteur:"rgba(211, 104, 104, 0.3)"},
    blue: {body:"#E6F0FA",button:"#2B7FBF",minuteur:"rgba(43, 127, 191, 0.3)"},
    violet: {body:"#F3F0FA",button:"#8A7EBF",minuteur:"rgba(138, 126, 191, 0.3)"},
    orange: {body:"#FFF1EC",button:"#E38B6D",minuteur:"rgba(227, 139, 109, 0.3)"},
    rose: {body:"#FAEFF4",button:"#C57CA5",minuteur:"rgba(197, 124, 165, 0.3)"}
};

let sessionItemColorSelected = "#fff";//utiliser lors de la création d'un compteur

//Les id des inputs number pour le minuteurs
let inputNumberMinuteurIdArray = [
        "inputMinuteurSessionMinutes",
        "inputMinuteurSessionSeconds"
    ];

let infoSessionTextArray = [
    `ℹ️ Créer jusqu'à ${maxSessionItems} éléments.`,
    `ℹ️ Un seul chrono ou minuteur peut être actif.`,
    `ℹ️ L’écran reste allumé lorsqu'un timer est en cours.`,
    `ℹ️ Vous pouvez envoyer ces résultats vers une activité.`
];


//utilisation du chrono ou minuteur 1 à la fois
//identifier par son ID car seule l'id concerné peut l'arréter
let timerInUseID = null;

//Gestion du wakelock 
//activer => lorsqu'un compteur ou minuteur tourne
//Arréter => ondisplay affichage (par sécurité si tournait), pause, complète.

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
        this.element.classList.add("item-session-container");
        this.element.style.backgroundColor = sessionItemColors[this.colorName].body;
        this.element.id = `itemSessionContainer_${id}`;

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

class Chrono {
    constructor(id, name, displayOrder,parentRef,colorName,elapsedTime){
        this.id = id;
        this.name = name;
        this.displayOrder = displayOrder;
        this.parentRef = parentRef;
        this.colorName = colorName;
        this.elapsedTime = elapsedTime;

        this.interval = null;
        this.isRunning = false;

        //référence
        this.textMinutesRef = null;
        this.textSecondsRef = null;
        this.textCentisRef = null;


        // div container
        this.element = document.createElement("div");
        this.element.classList.add("chrono-container");
        this.element.style.backgroundColor = "white";
        this.element.id = `itemSessionContainer_${id}`;

        this.buttonColor = sessionItemColors[this.colorName].button;
        this.bodyColor =  sessionItemColors[this.colorName].body;

        this.render();
        // Ajout des écouteurs d'évènement
        this.addEvent();

        //référence les boutons pour affichage text resultat
        this.reference();

        //initialisation de l'affichage des nombres la première fois
        this.initChrono();
    }



    // génération de l'élément
    render(){
        this.element.innerHTML = `
            <div class="chrono-left-buttons">
                    <div class="drag-handle">⣿</div>
                    <button class="btn-counter-reset" id="btnChronoReset_${this.id}">
                        <img src="./Icons/Icon-Reset.webp" alt="" srcset="">
                    </button>
            </div>

            <div id="divChronoCenterArea_${this.id}" class="chrono-center-area" style="background-color:${this.bodyColor}; border-color:${this.buttonColor}">
                <div class="session-chrono-icon">⏱️</div>
                <div class="session-chrono-label" id="chronoName_${this.id}">${this.name}</div>
                <div class="session-chrono-time">
                    <span id="sessionChronoMin_${this.id}">00</span>:<span id="sessionChronoSec_${this.id}">00</span>.<span class="session-chrono-centis" id="sessionChronoCentis_${this.id}">00</span>
                </div>
                <button id="btnActionChrono_${this.id}" class="session-chrono-start" style="background-color: ${this.buttonColor};">Démarrer</button>
            </div>

            <div class="chrono-right-buttons">
                <button class="btn-counter-setting" id="btnModifyChrono_${this.id}">
                    <img src="./Icons/Icon-Autres.webp" alt="" srcset="">
                </button>
            </div>

             `;
        // Insertion
        this.parentRef.appendChild(this.element);

        
        
    }


    // Ajout des écouteurs d'évènement
    addEvent(){
        // Modifier compteur
        let btnModifyChronoRef = this.element.querySelector(`#btnModifyChrono_${this.id}`);
        btnModifyChronoRef.addEventListener("click", ()=>{
            onClickModifyChrono(this.id);
        });

        //démarrer / pause
        let btnMinuteurActionRef = this.element.querySelector(`#btnActionChrono_${this.id}`);
        btnMinuteurActionRef.addEventListener("click", ()=>{
            this.isRunning ? this.pause() : this.start();
        });

        //reset
        let btnResetRef = this.element.querySelector(`#btnChronoReset_${this.id}`);
        btnResetRef.addEventListener("click",()=>{
            this.reset();
        });
    }

    //référence les élements pour l'affichage des resultats du chrono
    reference(){
        this.textMinutesRef = this.element.querySelector(`#sessionChronoMin_${this.id}`);
        this.textSecondsRef = this.element.querySelector(`#sessionChronoSec_${this.id}`);
        this.textCentisRef = this.element.querySelector(`#sessionChronoCentis_${this.id}`);
    }

    initChrono(){
        this._updateDisplay(this.elapsedTime);
    }


    async start(){
        if(timerInUseID === null || timerInUseID === this.id){
            //si c'est libre ou si c'est moi, lance
            //verrouille l'utilisation des timer par mon id
            timerInUseID = this.id;
            await requestWakeLock();

            console.log("Verrouillage timer :",timerInUseID);
        }else{
            alert("Un timer est déjà en cours");
            return
        }

        this._triggerClickEffect(); //effet de click

        this.isRunning = true;
        this._updateBtnText("Pause");

        // Cycle
        this.interval = setInterval(() => {
            this.elapsedTime += 100; 

            //affiche le resultat
            this._updateDisplay(this.elapsedTime);
        }, 100);
    }

    async pause(){
        this._triggerClickEffect(); //effet de click
        this.isRunning = false;
        clearInterval(this.interval);
        this._updateBtnText("Reprendre");
        
        //Libère l'utilisation de timer si utilisé par celui-ci
        if (timerInUseID !== null && timerInUseID === this.id) {
            console.log("Libère timer unique");
            timerInUseID = null;
            await releaseWakeLock();
        }

        //sauvegarde la valeur dans l'array et dans localStorage
        userSessionItemsList[this.id].elapsedTime = this.elapsedTime;
        // Sauvegarde en localStorage
        onUpdateSessionItemsInStorage();

    }

    reset(){

        //desactive le bouton
        let btnResetRef = this.element.querySelector(`#btnChronoReset_${this.id}`);
        btnResetRef.disabled = true;


        //lancement de la sequence de reset
        this.pause();
        this.elapsedTime = 0;
        this._updateDisplay(this.elapsedTime);

        this._updateBtnText("Démarrer");


        //met à jour les éléments hors de cette classe
        userSessionItemsList[this.id].elapsedTime = 0;
        // Sauvegarde en localStorage
        onUpdateSessionItemsInStorage();


        setTimeout(() => {
            // active le bouton
            btnResetRef.disabled = false;

        }, 300);
    }


    _updateBtnText(newText){
        let btnTextRef = this.element.querySelector(`#btnActionChrono_${this.id}`);
        btnTextRef.textContent = newText;
    }

    _triggerClickEffect() {
        const btn = this.element.querySelector(`#btnActionChrono_${this.id}`);
        btn.classList.add("activate");
        setTimeout(() => {
            btn.classList.remove("activate");
        }, 300); // Durée de l'animation
    }

     _updateDisplay(newValue) {
        const totalMs = Math.floor(newValue);
        const minutes = Math.floor(totalMs / 60000);
        const seconds = Math.floor((totalMs % 60000) / 1000);
        const centis = Math.floor((totalMs % 1000) / 10);
        this.textMinutesRef.textContent = String(minutes).padStart(2, '0');
        this.textSecondsRef.textContent = String(seconds).padStart(2, '0');
        this.textCentisRef.textContent = String(centis).padStart(2, '0');
    }
}








//seul l'état "isDone" est sauvegardé pour le minuteur
class Minuteur {
    constructor(id, name, displayOrder,parentRef,colorName,duration,isDone){
        this.id = id;
        this.name = name;
        this.displayOrder = displayOrder;
        this.parentRef = parentRef;
        this.colorName = colorName;
        this.duration = duration;//en secondes
        this.isDone = isDone;

        this.remaningTime = duration;
        this.isRunning = false;
        this.interval = null;

        //Pour référence
        this.progressBarRef = null;
        this.imgDoneRef = null;
        this.timeSpanRef = null;
        this.btnTextRef = null;

        // div container
        this.element = document.createElement("div");
        this.element.classList.add("item-session-container");
        this.element.style.backgroundColor = "white";
        this.element.id = `itemSessionContainer_${id}`;

        this.buttonColor = sessionItemColors[this.colorName].minuteur;
        this.PBColor = sessionItemColors[this.colorName].button;

        this.render();

        // Insertion
        this.parentRef.appendChild(this.element);

        // Ajout des écouteurs d'évènement
        this.bindEvent();

        //référencement
        this.reference();

        //initialisation
        this.initMinuteur();
    }



    // génération de l'élément
    render(){
        this.element.innerHTML = `
             <div class="compteur-content-line-1">
                <div class="drag-handle">⣿</div>
                <p class="compteur-name" id="minuteurName_${this.id}">${this.name}</p>
                <button class="btn-counter-setting" id="btnModifyMinuteur_${this.id}">
                    <img src="./Icons/Icon-Autres.webp" alt="" srcset="">
                </button>  
            </div>

            <div class="compteur-content-line-2">
                <span id="spanSessionMinuteurResult_${this.id}" class="item-minuteur-time">${this._formatTime(this.duration)}</span>
            </div>

            <div class="compteur-content-line-3">
                <p class="compteur-navigation">
                    <button class="btn-counter-reset" id="btnMinuteurReset_${this.id}"><img src="./Icons/Icon-Reset.webp" alt="" srcset=""></button>
                </p>

                <button id="btnActionMinuteur_${this.id}" class="minuteur-button" style="background-color: ${this.buttonColor};">
                    <span class="progress-bar-minuteur" id="spanPBSessionMinuteur_${this.id}" style="background-color: ${this.PBColor};"></span>
                    <span class="minuteur-button-text" id="spanMinuteurBtnText_${this.id}">Lancer compte à rebours</span>
                </button>
            </div>
            <img src="./Icons/Icon-Counter-Done.webp" class="overlay-image-rayure" id="imgMinuteurTargetDone_${this.id}" alt="Rature">
             `;
        
    }

       // Ajout des écouteurs d'évènement
    bindEvent(){
        // Modifier minuteur
        let btnModifyMinuteurRef = this.element.querySelector(`#btnModifyMinuteur_${this.id}`);
        btnModifyMinuteurRef.addEventListener("click", ()=>{
            onClickModifyMinuteur(this.id);
        });

        //démarrer / pause
        let btnMinuteurActionRef = this.element.querySelector(`#btnActionMinuteur_${this.id}`);
        btnMinuteurActionRef.addEventListener("click", ()=>{
            this.isRunning ? this.pause() : this.start();
        });

        //reset
        let btnResetRef = this.element.querySelector(`#btnMinuteurReset_${this.id}`);
        btnResetRef.addEventListener("click",()=>{
            this.reset();
        });

    }
    

    //référencement
    reference(){
        this.progressBarRef = this.element.querySelector(`#spanPBSessionMinuteur_${this.id}`);
        this.imgDoneRef = this.element.querySelector(`#imgMinuteurTargetDone_${this.id}`);
        this.timeSpanRef = this.element.querySelector(`#spanSessionMinuteurResult_${this.id}`);
        this.btnTextRef = this.element.querySelector(`#spanMinuteurBtnText_${this.id}`);
    }

    // initialisation à la génération du minuteur
    initMinuteur(){

        if (this.isDone) {
            this.progressBarRef.style.width = "0%";
            this._updateBtnText("Terminé");
            this.imgDoneRef.classList.add("counterTargetDone");
        }else{
            this.progressBarRef.style.width = "100%";
            this._updateBtnText("Lancer compte à rebours");
            this.imgDoneRef.classList.remove("counterTargetDone");
        }
    }


    async start(){
        //ne fait rien si à zero ou terminé par défaut (done)
        if (this.remaningTime <=0 || this.isDone === true) {
            return
        }else if(timerInUseID === null || timerInUseID === this.id){
            //si c'est libre ou si c'est moi, lance
            //verrouille l'utilisation des timer par mon id
            timerInUseID = this.id;
            await requestWakeLock();

            console.log("Verrouillage timer :",timerInUseID);
        }else{
            alert("Un timer est déjà en cours");
            return
        }



        this._triggerClickEffect(); //effet de click

        this.isRunning = true;
        this._updateBtnText("Pause");

        // Cycle
        this.interval = setInterval(() => {
            this.remaningTime--;
            this._updateTimeDisplay(this.remaningTime);
            this._updateProgressBar();

            if (this.remaningTime <= 0) {
                this.complete();
            }

        }, 1000);
    }

    async pause(){
        this._triggerClickEffect(); //effet de click
        this.isRunning = false;
        clearInterval(this.interval);
        this._updateBtnText("Reprendre");
        
        //Libère l'utilisation de timer si utilisé par celui-ci
        if (timerInUseID !== null && timerInUseID === this.id) {
            console.log("Libère timer unique");
            timerInUseID = null;
            await releaseWakeLock();
        }
        
    }

    reset(){

        //desactive le bouton
        let btnResetRef = this.element.querySelector(`#btnMinuteurReset_${this.id}`);
        btnResetRef.disabled = true;


        //lancement de la sequence de reset
        this.pause();
        this.remaningTime = this.duration;
        this._updateTimeDisplay(this.remaningTime);
        this._updateProgressBar();
        this._updateBtnText("Lancer compte à rebours");
        this.isDone = false;

        //met à jour les éléments hors de cette classe
        userSessionItemsList[this.id].isDone = false;

        //image DONE retrait
        this.imgDoneRef.classList.remove("counterTargetDone");

        // Sauvegarde en localStorage
        onUpdateSessionItemsInStorage();


        setTimeout(() => {
            // active le bouton
            btnResetRef.disabled = false;

        }, 300);
    }

    complete(){
        this.pause();
        this.remaningTime = 0;//remet la durée initial comme ça l'utilisateur peux voir ce qu'il avait mis
        this.isDone = true;
        this._updateTimeDisplay(this.duration);
        this._updateProgressBar();
        this._updateBtnText("Terminé");

        //image DONE
        this.imgDoneRef.classList.add("counterTargetDone");

        //Notification in app
        onShowNotifyPopup("minuteurTargetReach");

        //met à jour les éléments hors de cette classe
        userSessionItemsList[this.id].isDone = true;
        // Sauvegarde en localStorage
        onUpdateSessionItemsInStorage();
    }


    _updateTimeDisplay(time){
        this.timeSpanRef.textContent = this._formatTime(time);
    }

    _updateProgressBar(){
        let percent = (this.remaningTime / this.duration) *100;
        this.progressBarRef.style.width = `${percent}%`;
    }


    _formatTime(seconds) {
        const min = String(Math.floor(seconds / 60)).padStart(2, '0');
        const sec = String(seconds % 60).padStart(2, '0');
        return `${min}:${sec}`;
    }

    _updateBtnText(newText){
        this.btnTextRef.textContent = newText;
    }

    _triggerClickEffect() {
        const btn = this.element.querySelector(`#btnActionMinuteur_${this.id}`);
        btn.classList.add("activate");
        setTimeout(() => {
            btn.classList.remove("activate");
        }, 300); // Durée de l'animation
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

    //choix du lieu de l'activité avant envoie puis envoie

    let btnSendToActivityLocationConfirmRef = document.getElementById("btnSendToActivityLocationConfirm");
    btnSendToActivityLocationConfirmRef.addEventListener("click", ()=>{
        //récupère le lieu
        let sessionLocation = document.getElementById("inputSendSessionToActivityLocation").value;

        //Masque le popup
        document.getElementById("divSendSessionToActivityLocation").classList.remove("show");

        //lance la génération
        onSendSessionToActivity(sessionActivityTypeToSend,sessionLocation);
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


    //ajout l'écouteur d'évènement pour le wakeLock (à chaque fois et retire lorsque quitte le menu)
    document.addEventListener("visibilitychange", handleVisibilityChange);
    console.log("Ajout Ecouteur visibilitychange pour wakeLock");

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
    new Button_main_menu(btnMainMenuData.reset.imgRef,btnMainMenuData.reset.text,() => onClickResetAllSessionItems());
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

    // Met en évidence le bouton sélectionné
    let btnColorCounterChoiceArray = document.querySelectorAll(".btnChooseColor");
    btnColorCounterChoiceArray.forEach(btn=>{
        if (btn.dataset.btnSessionItemColor === sessionItemColorSelected){
            btn.classList.add("btnColorSelected");
        }else if (btn.classList.contains("btnColorSelected")){
            btn.classList.remove("btnColorSelected");
        }
    });
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


    //Traitement selon le type d'item
    let itemType = document.getElementById("selectItemSessionType").value;

    switch (itemType) {

        case "COUNTER":
            // Formatage
            let counterData = onFormatCounter();

            // Obtenir le prochain ID
            let counterNextId = getRandomShortID("counter_",userSessionItemsList);

            // Ajout du nouveau compteur à l'array
            userSessionItemsList[counterNextId] = counterData;
            break;


        case "CHRONO":
            //formatage
            let chronoData = onFormatChrono();

            // Obtenir le prochain ID
            let chronoNextId = getRandomShortID("chrono_",userSessionItemsList);

            // Ajout du nouveau compteur à l'array
            userSessionItemsList[chronoNextId] = chronoData;
            break;

        case "MINUTEUR":
            let minuteurData = onFormatMinuteur();

            // Obtenir le prochain ID
            let minuteurNextId = getRandomShortID("minuteur_",userSessionItemsList);

            // Ajout du nouveau compteur à l'array
            userSessionItemsList[minuteurNextId] = minuteurData;

            break;
    
        default:
            break;
    }

    

    // Enregistrement global
    eventInsertNewSessionItem(itemType);

}



//Séquence d'insertion d'un nouveau compteur

async function eventInsertNewSessionItem(itemType) {

    if (devMode === true){console.log("userSessionItemsList", userSessionItemsList)}

    // Sauvegarde en localStorage
    onUpdateSessionItemsInStorage();

    // fonction de création affichage des compteurs
    onDisplaySessionItems();
    

    //notification selon le type d'élément créé

    let notifyType = null;
    switch (itemType) {
        case "COUNTER":
            notifyType = "counterCreated";
            break;
        case "CHRONO":
            notifyType = "chronoCreated";
            break;
        case "MINUTEUR":
            notifyType = "minuteurCreated";
            break;
    
        default:
            break;
    }


    // Popup notification
    onShowNotifyPopup(notifyType);

}






// ------------------------------------- SPECIFIQUE COUNTER -------------------------------------







function onFormatCounter() {

    // Récupère le nom du compteur ou set un nom par défaut
    let newCounterName = document.getElementById("inputEditSessionItemName").value || "Nouveau Compteur";

    
    // Formatage du nom en majuscule
    newCounterName = onSetToUppercase(newCounterName);


    // Récupère l'objectif ou set 0
    let newserieTarget = parseInt(document.getElementById("inputEditSerieTarget").value) || 0,
        newRepIncrement = parseInt(document.getElementById("inputEditRepIncrement").value) || 0;

    

    // définition du displayOrder
    let newDisplayOrder = Object.keys(userSessionItemsList).length || 0;


    let formatedCounter = {
        type : "COUNTER",
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


    //gestion affichage commun
    communModifItemSessionDisplay(userSessionItemsList[idRef].type || "COUNTER",sessionItemColorSelected);//counter si l'ancien version n'avait pas de "type"

    // Affiche 
    document.getElementById("divEditCounter").style.display = "flex";


}






// ----------------------------- SPECIFIQUE CHRONO ---------------------------------------



function onFormatChrono() {
    // Récupère le nom du compteur ou set un nom par défaut
    let newChronoName = document.getElementById("inputEditSessionItemName").value || "Nouveau Chrono";

    // Formatage du nom en majuscule
    newChronoName = onSetToUppercase(newChronoName);



    // définition du displayOrder
    let newDisplayOrder = Object.keys(userSessionItemsList).length || 0;

    let formatedChrono = {
        type : "CHRONO",
        name: newChronoName,
        displayOrder: newDisplayOrder,
        color: sessionItemColorSelected,
        elapsedTime : 0
    }

    return formatedChrono;
}




// Modification de chrono
function onClickModifyChrono(idRef) {
    sessionItemEditorMode = "modification";
    currentSessionItemEditorID = idRef;

    // set les éléments
    document.getElementById("inputEditSessionItemName").value = userSessionItemsList[idRef].name;
    document.getElementById("divEditCounterContent").style.backgroundColor = sessionItemColors[userSessionItemsList[idRef].color].body;
    sessionItemColorSelected = userSessionItemsList[idRef].color;


    //gestion affichage commun
    communModifItemSessionDisplay(userSessionItemsList[idRef].type,sessionItemColorSelected);

    // Affiche 
    document.getElementById("divEditCounter").style.display = "flex";


}








// ---------------------------------------- SPECIFIQUE MINUTEUR -----------------------






function onFormatMinuteur() {
    // Récupère le nom du compteur ou set un nom par défaut
    let newMinuteurName = document.getElementById("inputEditSessionItemName").value || "Nouveau Minuteur";

    // Formatage du nom en majuscule
    newMinuteurName = onSetToUppercase(newMinuteurName);


    // définition du displayOrder
    let newDisplayOrder = Object.keys(userSessionItemsList).length || 0;

    // récupère les minutes et secondes
    let newSessionMinutes = document.getElementById("inputMinuteurSessionMinutes").value || "00",
        newSessionSecondes = document.getElementById("inputMinuteurSessionSeconds").value || "00";

    //convertion en duration (minutes)

    let newDuration = (parseInt(newSessionMinutes)*60) + parseInt(newSessionSecondes);

    let formatedMinuteur = {
        type:"MINUTEUR",
        name: newMinuteurName,
        displayOrder : newDisplayOrder,
        color : sessionItemColorSelected,
        duration: newDuration,
        isDone: false
    }

    return formatedMinuteur;
}




// Modification de minuteur
function onClickModifyMinuteur(idRef) {
    sessionItemEditorMode = "modification";
    currentSessionItemEditorID = idRef;

    // set les éléments
    document.getElementById("inputEditSessionItemName").value = userSessionItemsList[idRef].name;
    document.getElementById("divEditCounterContent").style.backgroundColor = sessionItemColors[userSessionItemsList[idRef].color].body;
    sessionItemColorSelected = userSessionItemsList[idRef].color;

    //Convertion duration vers MM:SS
    let initialDuration = userSessionItemsList[idRef].duration;
    const min = Math.floor(initialDuration / 60).toString().padStart(2, '0');
    const sec = (initialDuration % 60).toString().padStart(2, '0');
    document.getElementById("inputMinuteurSessionMinutes").value = min;
    document.getElementById("inputMinuteurSessionSeconds").value = sec;


    //gestion affichage commun
    communModifItemSessionDisplay(userSessionItemsList[idRef].type,sessionItemColorSelected);

    // Affiche 
    document.getElementById("divEditCounter").style.display = "flex";


}


// Les actions communuques aux modifications des items
function communModifItemSessionDisplay(itemType,currentColor = "white") {
    // rend le bouton supprimer visible et block le choix du type d'item
    document.getElementById("btnDeleteSessionItem").style.visibility = "visible";

    // Gestion du selecteur (grisé et positionné sur le bon type d'item)
    let selecteurTypeRef = document.getElementById("selectItemSessionType");
    selecteurTypeRef.disabled = true;
    selecteurTypeRef.value = itemType;
    onChangeSessionItemType(itemType);


    // et gestion de la couleur en cours
    // Les couleurs
    let btnColorCounterChoiceArray = document.querySelectorAll(".btnChooseColor");
    btnColorCounterChoiceArray.forEach(btn=>{
        if (btn.dataset.btnSessionItemColor === currentColor){
            btn.classList.add("btnColorSelected");
        }else if (btn.classList.contains("btnColorSelected")){
            btn.classList.remove("btnColorSelected");
        }
    });
}



async function eventSaveModifySessionItem() {

    // masque le popup de création
    document.getElementById("divEditCounter").style.display = "none";

        //Traitement selon le type d'item
    let itemType = document.getElementById("selectItemSessionType").value;

    switch (itemType) {
        case "COUNTER":
            // Formatage selon le type d'item
            let counterData = onFormatCounter();

            // Enregistrement dans l'array
            userSessionItemsList[currentSessionItemEditorID].type = counterData.type;
            userSessionItemsList[currentSessionItemEditorID].name = counterData.name;
            userSessionItemsList[currentSessionItemEditorID].serieTarget = counterData.serieTarget;
            userSessionItemsList[currentSessionItemEditorID].repIncrement = counterData.repIncrement;
            userSessionItemsList[currentSessionItemEditorID].color = counterData.color;

            onDisplaySessionItems();
            break;

        case "CHRONO":
            // Formatage selon le type d'item
            let chronoData = onFormatChrono();
            userSessionItemsList[currentSessionItemEditorID].type = chronoData.type;
            userSessionItemsList[currentSessionItemEditorID].name = chronoData.name;
            userSessionItemsList[currentSessionItemEditorID].color = chronoData.color;

            onDisplaySessionItems();
            break;

        case "MINUTEUR":
            // Formatage selon le type d'item
            let minuteurData = onFormatMinuteur();
            userSessionItemsList[currentSessionItemEditorID].type = minuteurData.type;
            userSessionItemsList[currentSessionItemEditorID].name = minuteurData.name;
            userSessionItemsList[currentSessionItemEditorID].color = minuteurData.color;
            userSessionItemsList[currentSessionItemEditorID].duration = minuteurData.duration;
            userSessionItemsList[currentSessionItemEditorID].isDone = minuteurData.isDone; //A chaque modification reset tout.A retirer si effet non souhaité

            onDisplaySessionItems();
            break;
    
        default:
            break;
    }


    if (devMode === true){
        console.log("userSessionItemsList", userSessionItemsList);
        console.log("demande de vérification DONE");
    }


    // Sauvegarde en localStorage
    onUpdateSessionItemsInStorage();

}






// l'affichage des compteurs de fait sur le trie des "displayOrder"

async function onDisplaySessionItems() {
    if (devMode === true){console.log(" [COUNTER] génération de la liste");}

    //Libère l'utilisation des timers
    console.log("Libère timer unique");
    timerInUseID = null; 
    await releaseWakeLock();

    // div qui contient les compteurs
    let divSessionCompteurAreaRef = document.getElementById("divSessionCompteurArea");
    // Reset
    divSessionCompteurAreaRef.innerHTML = "";


    // div de fin de liste (bouton et info)
    let divSessionEndListRef = document.getElementById("divSessionEndList");
    divSessionEndListRef.innerHTML = "";

    // Affichage en cas d'aucun item
    if (Object.keys(userSessionItemsList).length < 1) {
        divSessionCompteurAreaRef.innerHTML = "Aucun élément à afficher !";

        new Button_add("Ajouter un élément",() => onClickAddSessionItem(),false,divSessionEndListRef);
        return
    }


    // récupère la liste des clé trié par displayOrder
    sessionItemsSortedKey = [];

    sessionItemsSortedKey = getSortedKeysByDisplayOrder(userSessionItemsList);

    sessionItemsSortedKey.forEach((key,index)=>{

        //trie selon le "type" d'élément
        let itemType = userSessionItemsList[key].type || "COUNTER";
        console.log("itemType = ", itemType);
        switch (itemType) {
            case "COUNTER":
                new Counter(
                    key,userSessionItemsList[key].name,
                    userSessionItemsList[key].currentSerie,userSessionItemsList[key].serieTarget,userSessionItemsList[key].repIncrement,
                    userSessionItemsList[key].displayOrder,divSessionCompteurAreaRef,userSessionItemsList[key].color,
                    userSessionItemsList[key].totalCount
                );
                // control des objectifs atteinds pour chaque compteur généré
                onCheckCounterTargetReach(key); 
                break;
            case "CHRONO":
                new Chrono(
                    key,
                    userSessionItemsList[key].name,
                    userSessionItemsList[key].displayOrder,
                    divSessionCompteurAreaRef,
                    userSessionItemsList[key].color,
                    userSessionItemsList[key].elapsedTime
                );
                break;
            case "MINUTEUR":
                new Minuteur(
                    key,
                    userSessionItemsList[key].name,
                    userSessionItemsList[key].displayOrder,
                    divSessionCompteurAreaRef,
                    userSessionItemsList[key].color,
                    userSessionItemsList[key].duration,
                    userSessionItemsList[key].isDone
                );
                break;
        
            default:
                break;
        }

        // Generation





        // Creation de la ligne de fin pour le dernier index
        if (index === (Object.keys(userSessionItemsList).length - 1)) {
            let ismaxSessionItemsReach = Object.keys(userSessionItemsList).length >= maxSessionItems;
            new Button_add("Ajouter un élément",() => onClickAddSessionItem(),ismaxSessionItemsReach,divSessionEndListRef);

            let newClotureList = document.createElement("span");
            newClotureList.classList.add("last-container");
            newClotureList.innerHTML = getRandomSessionInfo(infoSessionTextArray);
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
    let isTargetReach = onCheckCounterTargetReach(idRef);

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
function onCheckCounterTargetReach(idRef) {

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


function onClickResetAllSessionItems() {

    let textToDisplay = `<b>Réinitialiser tous les compteurs ?</b>`;
    addEventForGlobalPopupConfirmation(removeEventForGlobalPopupConfirmation,eventResetAllSessionItems,textToDisplay,"reset");
}


async function eventResetAllSessionItems() {
    
    // Boucle sur la liste des key
    //Pour chaque éléments passe la variable à zero et set le texte
    sessionItemsSortedKey.forEach(key=>{

        //filtre selon le type d'item
        let itemType = userSessionItemsList[key].type || "COUNTER";
        switch (itemType) {
            case "COUNTER":
                userSessionItemsList[key].currentSerie = 0;
                userSessionItemsList[key].totalCount = 0;
                break;
            case "CHRONO":
                userSessionItemsList[key].elapsedTime = 0;
                break;
            case "MINUTEUR":
                userSessionItemsList[key].isDone = false;
                break;
        
            default:
                break;
        }

    });

    // reset également l'heure du début de session
    onSetSessionStartTime();

    // Sauvegarde en localStorage
    onUpdateSessionItemsInStorage();
    onUpdateSessionTimeInStorage();

    // actualisation de la liste des compteurs
    onDisplaySessionItems();

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
    onShowNotifyPopup("itemSessionDeleted");

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
    const children = container.querySelectorAll(".item-session-container, .chrono-container");

    children.forEach((child, index) => {
        const id = child.id.replace("itemSessionContainer_", ""); // extrait l'ID
        if (userSessionItemsList[id]) {
            userSessionItemsList[id].displayOrder = index;
        }
    });

    // réaffiche les compteurs
    onDisplaySessionItems();// a regarder si pertinent ou non

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




async function onSendSessionToActivity(activityTarget,sessionLocation) {
    
    let sessionText = "";

    //Boucle sur les éléments
    sessionItemsSortedKey.forEach(key=>{

        // Pour chaque élément crée une ligne avec les données
        let nameFormated = onSetToLowercase(userSessionItemsList[key].name);
        nameFormated = onSetFirstLetterUppercase(nameFormated);

        let textToAdd = "";


        //filtre les actions selon le type d'item


        // COUNTER
        if (userSessionItemsList[key].type === "COUNTER" || userSessionItemsList[key].type == null) {
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
        
        //CHRONO
        }else if(userSessionItemsList[key].type === "CHRONO"){
            let chronoText = onConvertChronoResult(userSessionItemsList[key].elapsedTime);
            textToAdd =`⏱️ ${userSessionItemsList[key].name} : ${chronoText}\n`;
        //MINUTEUR
        }else if(userSessionItemsList[key].type === "MINUTEUR"){
            let minuteurText = onConvertMinuteurResult(userSessionItemsList[key].duration);
            textToAdd =`⏳ ${userSessionItemsList[key].name} : ${minuteurText}\n`;
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
        location : sessionLocation,
        distance : "",
        duration : sessionDuration,
        comment : sessionText,
        createdAt : new Date().toISOString(),
        isPlanned : false
    };

    // Lance la sauvegarde d'une nouvelle activité
    await  eventInsertNewActivity(activityGenerateToInsert,true);
 

}

//convertion chrono
function onConvertChronoResult(newValue) {
    const totalMs = Math.floor(newValue);
    const minutes = Math.floor(totalMs / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    const centis = Math.floor((totalMs % 1000) / 10);
    let textResult =  `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
    return textResult;
}

//convertion minuteur
function onConvertMinuteurResult(newValue) {
    const min = String(Math.floor(newValue / 60)).padStart(2, '0');
    const sec = String(newValue % 60).padStart(2, '0');
    let textResult = `${min}:${sec}`;
    return textResult;
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
            onDisplaySendToActivityLocation(this.activityName);
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
            onDisplaySendToActivityLocation(this.activityName);
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


//Affiche la div de choix du lieu de l'activité
function onDisplaySendToActivityLocation(activityTarget) {
    //Affiche le popup de selection de la location
    document.getElementById("divSendSessionToActivityLocation").classList.add("show");

    //set l'image de l'activité ciblée
    let imgTargetRef = document.getElementById("imgSessionToActivityLocationPreview");
    imgTargetRef.src = activityChoiceArray[activityTarget].imgRef;

    //stocke le type d'activité dans une variable pour la suite
    sessionActivityTypeToSend = activityTarget;

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

    onGenerateSessionCanvas();

    // actualise la liste des modèles dans le tableau
    onGenerateModelSelectList(); 
}



class DivGenItemSession{
    constructor(parentRef,idNumber,type = "COUNTER"){
        this.parentRef = parentRef;
        this.idNumber = idNumber;
        this.type = type;

        this.color = "white";


        this.element = document.createElement("div");
        this.element.id = `divGenSessionItemContainer_${this.idNumber}`;
        this.element.classList.add("gen-session-module");

        //contenu dynamique à injecter selon
        this.dynamicContentData = {
            COUNTER : `
                <div class="session-type-area">
                    <div class="wrapper serial">
                        <input class="compteur" type="number" id="inputSessionGenSerieTarget_${this.idNumber}" value="0">
                    </div>
                    <div class="wrapper rep">
                        <input class="compteur" type="number" id="inputSessionGenRepIncrement_${this.idNumber}" value="0">
                    </div>
                </div>
                `,
            CHRONO : `
                <div class="session-type-area">
                    <span class="input-number-symbol">⏱️</span>
                </div>
                `,
            MINUTEUR : `
                <div class="session-type-area number-container">
                    <span class="input-number-symbol">⌛</span>
                    <input type="number" id="inputMinuteurGenSessionMin_${this.idNumber}" min="0" max="99" value="00">
                    <span class="chrono-separator">:</span>
                    <input type="number" id="inputMinuteurGenSessionSec_${this.idNumber}" min="0" max="59" value="00">
                </div>
                `
        };


        //référence
        this.child1 = null;
        this.selecteurTypeRef = null;
        this.selecteurColorRef = null;
        this.dynamicAreaRef = null;

        //rendu
        this.render();
    
        //insertion
        this.parentRef.appendChild(this.element);

        //référence
        this.reference();

        //ecouteur
        this.bindEvent();

        //initialisation de départ
        this.initChild1();
        this.updateDynamicArea(this.type);
        this.setColor(this.color);
    }


    render(){
    // Crée la div parent avec innerHTML complet
        this.element.innerHTML = `
                <div id="divGenItemSessionchild1_${this.idNumber}" class="">
                    <input class="counterName" type="text" name="" id="inputGenSessionItemName_${this.idNumber}" placeholder="Element ${this.idNumber}" maxlength="30">
                    <select class="session-type-color" id="selectGenItemSessionType_${this.idNumber}">
                        <option value="COUNTER">Compteur</option>
                        <option value="CHRONO">Chrono</option>
                        <option value="MINUTEUR">Minuteur</option>
                    </select>
                    <select class="session-type-color" id="selectGenItemSessionColor_${this.idNumber}">
                        <option value="white">Blanc</option>
                        <option value="green">Vert</option>
                        <option value="yellow">Jaune</option>
                        <option value="red">Rouge</option>
                        <option value="blue">Bleu</option>
                        <option value="violet">Violet</option>
                        <option value="orange">Orange</option>
                        <option value="rose">Rose</option>
                    </select>
                </div>
                <div id="divGenItemSessionDynamic_${this.idNumber}" class="">
                    Veuillez choisir une option ci-dessus.
                </div>
        `;


    }


    

    reference(){
        this.child1 = this.element.querySelector(`#divGenItemSessionchild1_${this.idNumber}`);
        this.selecteurTypeRef = this.element.querySelector(`#selectGenItemSessionType_${this.idNumber}`);
        this.selecteurColorRef = this.element.querySelector(`#selectGenItemSessionColor_${this.idNumber}`);
        this.dynamicAreaRef = this.element.querySelector(`#divGenItemSessionDynamic_${this.idNumber}`);
    }

    //Ecouteur d'évènement
    bindEvent(){
        this.selecteurTypeRef.addEventListener("change", (event)=>{
            //Appel init
            this.updateDynamicArea(event.target.value);
        });
        this.selecteurColorRef.addEventListener("change",(event)=>{
            this.setColor(event.target.value);
        });
    }

    //change la couleur du module
    setColor(colorRef){
        this.color = colorRef;
        this.element.style.backgroundColor = sessionItemColors[this.color].body;
    }

    //initialise les éléments de la première ligne
    initChild1(){
        this.selecteurTypeRef.value = this.type;
    }


    updateDynamicArea(type) {
        //reset
        this.dynamicAreaRef.innerHTML = "";

        //génère
        this.dynamicAreaRef.innerHTML = this.dynamicContentData[type];

        //ajout les écouteur d'évènement selon 
        switch (type) {
            case "COUNTER":
                //input number
                let inputCounterIDArray = [
                    `inputSessionGenSerieTarget_${this.idNumber}`,
                    `inputSessionGenRepIncrement_${this.idNumber}`
                ];

                //Pour chaque input
                inputCounterIDArray.forEach(id =>{
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
                break;
            case "CHRONO":
                
                break;
            case "MINUTEUR":
                let allMinuteurInputID = [
                    `inputMinuteurGenSessionMin_${this.idNumber}`,
                    `inputMinuteurGenSessionSec_${this.idNumber}`
                ]

                allMinuteurInputID.forEach(input=>{
                    let inputRef = document.getElementById(input);
                    // onInput
                    let maxDuration = parseInt(inputRef.max);
                    inputRef.addEventListener("input",(event)=>{
                        formatNumberInput(event.target, maxDuration, 2);
                    });

                    //onFocus
                    inputRef.addEventListener("focus",(event)=>{
                        selectAllText(event.target);
                    });

                    //onBlur
                    inputRef.addEventListener("blur",(event)=>{
                        formatNumberInput(event.target, maxDuration, 2);
                    });

                    //onContextMenu
                    inputRef.addEventListener("contextmenu",(event)=>{
                        disableContextMenu(event);
                    });
                });
                break;
        
            default:
                break;
        }
    }


}





// Génération du tableau de création de session
function onGenerateSessionCanvas() {
   
    // Reférence le parent
    let parentRef = document.getElementById("divCanvasGenerateSession");

    // Reset le contenu du parent
    parentRef.innerHTML = "";

    // Génère le tableau
    for (let i = 0; i < maxSessionItems; i++) {
        // new TableLineSession(parentRef,i); 
        new DivGenItemSession(parentRef,i);
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
function onGetDivGenSessionItems() {
    let sessionList = [];

    for (let i = 0; i < maxSessionItems; i++) {       

        //référence les éléments communs
        let inputName = document.getElementById(`inputGenSessionItemName_${i}`),
            selectColor = document.getElementById(`selectGenItemSessionColor_${i}`),
            itemType = document.getElementById(`selectGenItemSessionType_${i}`).value;


        //NE TRAITE QUE SI YA UN NOM
        if (inputName.value != "") {
                
             switch (itemType) {
                case "COUNTER":
                    console.log("traitement COUNTER");
                    //référence éléments spécifiques
                    let inputSerieValue = document.getElementById(`inputSessionGenSerieTarget_${i}`).value,
                        inputRepValue = document.getElementById(`inputSessionGenRepIncrement_${i}`).value;

                    // Insertion
                    sessionList.push( {
                        type : itemType,
                        name: inputName.value, 
                        serieTarget: parseInt(inputSerieValue || 0),
                        repIncrement: parseInt(inputRepValue || 0),
                        color : selectColor.value
                    });
                    break;
                case "CHRONO":
                    console.log("traitement CHRONO");
                    sessionList.push( {
                        type : itemType,
                        name: inputName.value, 
                        color : selectColor.value
                    });
                    break;
                case "MINUTEUR":
                    console.log("traitement MINUTEUR");
                    //référence éléments spécifiques
                    let minValue = document.getElementById(`inputMinuteurGenSessionMin_${i}`).value || "00",
                        secValue = document.getElementById(`inputMinuteurGenSessionSec_${i}`).value || "00",
                        duration = (parseInt(minValue)*60) + parseInt(secValue);

                    sessionList.push( {
                        type : itemType,
                        name: inputName.value, 
                        color : selectColor.value,
                        duration : duration

                    });
                    break;
            
                default:
                    console.log("erreur switch case item type :",itemType);
                    break;
            }  
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
    let itemForSession = onGetDivGenSessionItems();


    if (devMode === true){console.log(itemForSession);}

    // Retire le popup

    // formate les nouveaux compteur et les sauvegardes
    onGenerateMultipleSessionItems(itemForSession);

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
function onGenerateMultipleSessionItems(newSessionList) {

    // Vide l'array
    userSessionItemsList = {};


    //génère l'id

    // Pour chaque élément de la liste
    newSessionList.forEach((e,index)=>{


        //filtre selon le type d'item
        switch (e.type) {
            case "COUNTER":
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
                break;
            case "CHRONO":
                // Génération de l'ID
                let chronoId = getRandomShortID("chrono_",userSessionItemsList);
                let formatedChrono = {
                    type : "CHRONO",
                    name: e.name,
                    displayOrder: index,
                    color: e.color,
                    elapsedTime : 0 // en ms
                };

                // Inserte un nouveau chrono dans l'array
                userSessionItemsList[chronoId] = formatedChrono;
                break;
            case "MINUTEUR":
                // Génération de l'ID
                let minuteurId = getRandomShortID("minuteur_",userSessionItemsList);
                let formatedMinuteur = {
                    type:"MINUTEUR",
                    name: e.name,
                    displayOrder : index,
                    color : e.color,
                    duration : e.duration,//en secondes
                    isDone :false
                }

                // Inserte un nouveau chrono dans l'array
                userSessionItemsList[minuteurId] = formatedMinuteur;
                break;
        
            default:
                console.log("ERREUR de type");
                break;
        }

      

    });


    if (devMode === true){console.log("userSessionItemsList", userSessionItemsList);}


}





// ------------------------ fonction du WAKE LOCK------------------------------------





let wakeLockInstance = null;

async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLockInstance = await navigator.wakeLock.request('screen');
            console.log("✅ Wake Lock activé");

            // Surveille si le Wake Lock est libéré automatiquement (ex: onglet inactif)
            wakeLockInstance.addEventListener('release', () => {
                console.log("⚠️ Wake Lock libéré automatiquement");
                wakeLockInstance = null;
            });
        } else {
            console.warn("❌ Wake Lock non pris en charge par ce navigateur");
        }
    } catch (err) {
        console.error("❌ Erreur lors de l'activation du Wake Lock :", err);
    }
}


async function releaseWakeLock() {
    try {
        if (wakeLockInstance) {
            await wakeLockInstance.release();
            wakeLockInstance = null;
            console.log("🔓 Wake Lock désactivé manuellement");
        }else{
            console.log("🔓 Wake Lock déjà désactivé");
        }
    } catch (err) {
        console.error("❌ Erreur lors de la libération du Wake Lock :", err);
    }
}



//surveillance pour reprise automatique du wakelock si l'utilisateur change d'application
async function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
        if (timerInUseID !== null && !wakeLockInstance) {
            try {
                await requestWakeLock();
                console.log("Reprise automatique du wakeLock");
            } catch (err) {
                console.warn("Échec du Wake Lock :", err);
            }
        }
    }
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
    document.getElementById("divCanvasGenerateSession").innerHTML = "";


}









// --------------------------------- utilisation d'un modèle ------------------------------


async function onChangeSelectorChooseTemplateSession(modelIdTarget) {

    // vide la liste
    let parentRef = document.getElementById("divCanvasGenerateSession");
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
async function onClickReturnFromSession() {

    //libère le verrouillage timer unique
    console.log("Libère timer unique");
    timerInUseID = null;

    //enlève également le wakeLock si active
    await releaseWakeLock();

    //enlève ecouteur d'évènement visibility pour le wakelock
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    console.log("Retire Ecouteur visibilitychange pour wakeLock");


    onDestroySortable();

    // vide la div
    let divSessionCompteurAreaRef = document.getElementById("divSessionCompteurArea");
    divSessionCompteurAreaRef.innerHTML = "";

    //vide le tableau
    document.getElementById("divCanvasGenerateSession").innerHTML = "";

    // ferme le menu
    onLeaveMenu("Session");
};



