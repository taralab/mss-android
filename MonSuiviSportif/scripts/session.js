
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
    sessionItemSortableInstance = null,//instance pour le drag n drop des items
    genSessionSortableInstance = null,//instance drag n drop pour génération de session
    sessionActivityTypeToSend = null,//utilisé pour stocker le type d'activité à générer
    sessionAllItemsInstance = {},//stockes les instances de tous les items générés
    sessionInstanceButtonAddNew = null;//l'instance du boutton add new

let sessionItemColors = {
    white: {soft:"#fff",hard:"grey"},
    green: {soft:"#E7F8F2",hard:"#4EA88A",minuteur:"rgba(78, 168, 138, 0.3)"},
    yellow: {soft:"#FFFBE5",hard:"#C8A646",minuteur:"rgba(200, 166, 70, 0.3)"},
    red: {soft:"#FDEBEC",hard:"#D36868",minuteur:"rgba(211, 104, 104, 0.3)"},
    blue: {soft:"#E6F0FA",hard:"#2B7FBF",minuteur:"rgba(43, 127, 191, 0.3)"},
    violet: {soft:"#F3F0FA",hard:"#8A7EBF",minuteur:"rgba(138, 126, 191, 0.3)"},
    orange: {soft:"#FFF1EC",hard:"#E38B6D",minuteur:"rgba(227, 139, 109, 0.3)"},
    rose: {soft:"#FAEFF4",hard:"#C57CA5",minuteur:"rgba(197, 124, 165, 0.3)"}
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

//Gestion du wakelock (un seul timer peux fonctionner à la fois)
//activer => lorsqu'un compteur ou minuteur tourne
//Arréter => ondisplay affichage (par sécurité si tournait), pause, complète.

//lorsqu'un chrono tourne si écrans mi en arriere plan, met le chrono en pause et enregistre elapsed time. Pour reprendre automatiquement lors du retour.





// Objet compteur
class Counter {
    constructor(id, name, currentSerie, serieTarget, repIncrement,parentRef,colorName,totalCount){
        //les éléments qui ne sont pas modifiable dans "modification"
        this.id = id;
        this.parentRef = parentRef;
        this.currentSerie = currentSerie;
        this.repIncrement = repIncrement;
        this.totalCount = totalCount;


        //Les élément modifiable dans modification sont set dans initCounter()
        this.name = null;
        this.serieTarget = null;
        this.colorName = null;
        this.hardColor = null;
        this.softColor = null;

        //reference
        this.textNameRef = null;
        this.textCurrentSerieRef = null;
        this.textSerieTargetRef = null;
        this.textTotalCountRef = null;
        this.inputRepIncrementRef = null;
        this.btnActionRef = null;
        this.imgDoneRef = null;
        this.btnResetCounterRef = null;
        

        // div container
        this.element = document.createElement("div");
        this.element.classList.add("item-session-container");
        this.element.id = `itemSessionContainer_${id}`;

        this.render();
        // Insertion
        this.parentRef.appendChild(this.element);

        // Ajout des écouteurs d'évènement
        this.addEvent();

        //Référence
        this.reference();

        //Initialisation
        this.initCounter(name,serieTarget,repIncrement,colorName);
    }



    // génération de l'élément
    render(){
        this.element.innerHTML = `
            <div class="compteur-content-line-1">
                <div class="drag-handle">⣿</div>
                <p class="compteur-name" id="counterName_${this.id}"></p>
                <button class="btn-counter-setting" id="btnModifyCounter_${this.id}">
                    <img src="./Icons/Icon-Autres.webp" alt="" srcset="">
                </button>  
            </div>

            <div class="compteur-content-line-2" id="divCounterCurrentSerie_${this.id}">
                <div class="compteur-content-line-2-left">
                    <span class="current-serie" id="spanCurrentSerie_${this.id}"></span>
                    <span class="serie-target" id="spanSerieTarget_${this.id}"></span>
                    <span class="serie-text">séries</span>
                </div>
                <span class="counter-total" id="spanTotalCount_${this.id}"></span>
            </div>


            <div class="compteur-content-line-3">
                <p class="compteur-navigation">
                    <button class="btn-counter-reset" id="btnCountReset_${this.id}"><img src="./Icons/Icon-Reset.webp" alt="" srcset=""></button>
                </p>
                <div class="wrapper rep">
                <input type="number" class="compteur" id="inputRepIncrement_${this.id}" placeholder="0">
                </div>
                <button class="counter" id="btnRepIncrement_${this.id}">
                    <img src="./Icons/Icon-Accepter-blanc.webp" alt="">
                </button>  
            </div>

            <img src="./Icons/Icon-Counter-Done.webp" class="overlay-image-rayure" id="imgCounterTargetDone_${this.id}" alt="Rature">
        `; 
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
                this.incrementeCounter();
            });
            
            // Reset
            let btnResetCounterRef = this.element.querySelector(`#btnCountReset_${this.id}`);
            btnResetCounterRef.addEventListener("click", () =>{
                this.resetCounter();
            });

            // modifier input
            let btnInputCounterRef = this.element.querySelector(`#inputRepIncrement_${this.id}`);
            btnInputCounterRef.addEventListener("change", () =>{
                this.changeRepIncrement();
            });
            btnInputCounterRef.addEventListener("focus", (event) =>{
                selectAllText(event.target);
            });
            btnInputCounterRef.addEventListener("contextmenu", (event) =>{
                disableContextMenu(event);
            });
    }


    reference(){
        this.textNameRef = this.element.querySelector(`#counterName_${this.id}`);
        this.textCurrentSerieRef = this.element.querySelector(`#spanCurrentSerie_${this.id}`);
        this.textSerieTargetRef = this.element.querySelector(`#spanSerieTarget_${this.id}`);
        this.textTotalCountRef = this.element.querySelector(`#spanTotalCount_${this.id}`);
        this.inputRepIncrementRef = this.element.querySelector(`#inputRepIncrement_${this.id}`);
        this.btnActionRef = this.element.querySelector(`#btnRepIncrement_${this.id}`);
        this.imgDoneRef = this.element.querySelector(`#imgCounterTargetDone_${this.id}`);
        this.btnResetCounterRef = this.element.querySelector(`#btnCountReset_${this.id}`);
    }

    initCounter(newName,newSerieTarget,newRepIncrement,newColorName){
        //set les variables
        this.name = newName;
        this.serieTarget = newSerieTarget;
        this.repIncrement = newRepIncrement;
        this.colorName = newColorName;

        this.hardColor = sessionItemColors[this.colorName].hard;
        this.softColor = sessionItemColors[this.colorName].soft;


        //set LE dom
        this.element.style.backgroundColor = this.softColor;
        this.btnActionRef.style.backgroundColor = this.hardColor; 
        this.textNameRef.textContent = this.name;
        this.textCurrentSerieRef.textContent = this.currentSerie;
        this.textSerieTargetRef.textContent = `/${this.serieTarget}`;
        this.textTotalCountRef.textContent = `Total : ${this.totalCount}`;
        this.inputRepIncrementRef.value =  this.repIncrement;


        //control done
        this._checkTargetReach();

    }


    
    incrementeCounter() {

        // Ne fait rien si l'increment est à zero ou vide
        if (this.repIncrement === 0) {
            if (devMode === true){console.log("[SESSION] increment vide ne fait rien");}
            onShowNotifyPopup("inputIncrementEmpty");
            return
        }


        // Verrouille le bouton pour éviter action secondaire trop rapide
        //sera déverrouillé après animation
        this.btnActionRef.disabled = true;

        // Addition
        this.totalCount += this.repIncrement;
        this.currentSerie++;

        // Set nouveau résultat dans html, variable et update base
        this.textTotalCountRef.textContent = `Total : ${this.totalCount}`;
        this.textCurrentSerieRef.textContent = this.currentSerie;

        userSessionItemsList[this.id].totalCount = this.totalCount;
        userSessionItemsList[this.id].currentSerie = this.currentSerie;

        // Si objectif atteind
        let isTargetReach = this._checkTargetReach();

        // ANIMATION
        this._incrementAnimation();

        // Notification objectif atteind
        if (isTargetReach) {
            onShowNotifyPopup("counterTargetReach");
        }

        // Sauvegarde en localStorage
        onUpdateSessionItemsInStorage();

        //déverrouille le bouton pour être a nouveau disponible
        setTimeout(() => {
            this.btnActionRef.disabled = false;
        }, 300);
    }



    // Valeur incrementation
    changeRepIncrement() {
        // Actualise l'array
        userSessionItemsList[this.id].repIncrement = parseInt(this.inputRepIncrementRef.value) || 0;
        this.repIncrement = parseInt(this.inputRepIncrementRef.value) || 0;
        // Sauvegarde en localStorage
        onUpdateSessionItemsInStorage();
    }




    // Lorsque je reset, l'heure
    // set le current count à zero,
    // Actualise les éléments visual, dans la variable et en base
    resetCounter() {

        //bloc le bouton jusqu'à la fin de l'animation
        this.btnResetCounterRef.disabled = true;


        // set les html
        //current serie

        // Étape 1 : animation de disparition
        this.textCurrentSerieRef.classList.remove('reset-in');
        this.textCurrentSerieRef.classList.add('reset-out');
        // Le innerHTML sera mis à zero dans le setTimeOut
        
        //totalcount
        this.totalCount = 0;
        this.textTotalCountRef.textContent = `Total : 0`;


        // Set les variables
        userSessionItemsList[this.id].currentSerie = 0;
        userSessionItemsList[this.id].totalCount = 0;



        // Sauvegarde en localStorage
        onUpdateSessionItemsInStorage();

        if (devMode === true){console.log("[SESSION] userSessionItemsList", userSessionItemsList)};

        //retire la classe "reach" si necessaire pour le count target et le slash
        if (this.textSerieTargetRef.classList.contains("target-reach")) {
            this.textSerieTargetRef.classList.remove("target-reach");
            this.imgDoneRef.classList.remove("counterTargetDone");
        }

        // Ajouter la classe pour l'animation
        // spanCurrentSerieRef.classList.add("anim-reset");

        
        setTimeout(() => {
            // Met le chiffre visuellement et joue la remontée
            this.textCurrentSerieRef.classList.remove('reset-out');
            this.textCurrentSerieRef.classList.add('reset-in');
            this.textCurrentSerieRef.textContent = 0;
            this.currentSerie = 0;

            //déverrouille le bouton à la fin de l'animation
            this.btnResetCounterRef.disabled = false;
        }, 300);

    }



    //pour supprimer l'item
    removeItem(){
        this.element.remove();
    }


    // ANIMATION
    _incrementAnimation() {        
        // Pour relancer l'animation même si elle a été déjà jouée 
        // Enlève également reset-in pour que l'animation fonctionne toujours après un reset
        this.textCurrentSerieRef.classList.remove('pop-animation','reset-in');
        void this.textCurrentSerieRef.offsetWidth; // Forcer un reflow
        // Ajouter la classe pour l'animation
        this.textCurrentSerieRef.classList.add("pop-animation");
    }

    // Si objectif non égale à zero atteind
    _checkTargetReach() {
        let targetReach = false;
        //IsDone
        if(this.serieTarget === 0){
            return targetReach;
        }else if (this.currentSerie === this.serieTarget){
            targetReach = true;
            this.textSerieTargetRef.classList.add("target-reach");
            this.imgDoneRef.classList.add("counterTargetDone");
        }else{
            this.textSerieTargetRef.classList.remove("target-reach");
            this.imgDoneRef.classList.remove("counterTargetDone");
        }
        return targetReach;
    }

}




class Chrono {
    constructor(id, name, parentRef,colorName,elapsedTime){
        this.id = id;
        this.name = null;
        this.parentRef = parentRef;
        this.colorName = null;
        this.elapsedTime = elapsedTime;

        this.interval = null;
        this.isRunning = false;
        this.startTimeStamp = null; //stocke le temps universelle pour avoir toujours le temps correct même après passage en arrière plan

        //référence
        this.textMinutesRef = null;
        this.textSecondsRef = null;
        this.textCentisRef = null;
        this.divChronoRoundRef = null;
        this.textNameRef = null;
        this.btnActionRef = null;

        // div container
        this.element = document.createElement("div");
        this.element.classList.add("chrono-container");
        this.element.style.backgroundColor = "white";
        this.element.id = `itemSessionContainer_${id}`;

        this.hardColor = null;
        this.softColor =  null;

        this.render();
        // Ajout des écouteurs d'évènement
        this.addEvent();

        //référence les boutons pour affichage text resultat
        this.reference();

        //initialisation de l'affichage des nombres la première fois
        this.initChrono(name,colorName);
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

            <div id="divChronoCenterArea_${this.id}" class="chrono-center-area">
                <div class="session-chrono-icon">⏱️</div>
                <div class="session-chrono-label" id="chronoName_${this.id}"></div>
                <div class="session-chrono-time">
                    <span id="sessionChronoMin_${this.id}">00</span>:<span id="sessionChronoSec_${this.id}">00</span>.<span class="session-chrono-centis" id="sessionChronoCentis_${this.id}">00</span>
                </div>
                <button id="btnActionChrono_${this.id}" class="session-chrono-start">Démarrer</button>
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
        this.divChronoRoundRef = this.element.querySelector(`#divChronoCenterArea_${this.id}`);
        this.textNameRef = this.element.querySelector(`#chronoName_${this.id}`);
        this.btnActionRef = this.element.querySelector(`#btnActionChrono_${this.id}`);
    }

    initChrono(newName,newColorName){

        //Les variables
        this.name = newName;
        this.colorName = newColorName;

        this.hardColor = sessionItemColors[this.colorName].hard;
        this.softColor =  sessionItemColors[this.colorName].soft;


        //LE dom
        this._updateDisplay(this.elapsedTime);
        this.divChronoRoundRef.style.backgroundColor = this.softColor;
        this.divChronoRoundRef.style.borderColor = this.hardColor;
        this.btnActionRef.style.backgroundColor = this.hardColor;
        this.textNameRef.textContent = this.name;
    }


    async start(){
        if(timerInUseID === null || timerInUseID === this.id){
            //si c'est libre ou si c'est moi, lance
            //verrouille l'utilisation des timer par mon id
            timerInUseID = this.id;
            await requestWakeLock();

           if (devMode === true) {console.log("[SESSION] Verrouillage timer par : ",timerInUseID);} 
        }else{
            alert("Un timer est déjà en cours");
            return
        }

        this._triggerClickEffect(); //effet de click

        this.isRunning = true;
        this.startTimeStamp = Date.now() - this.elapsedTime; //stocke le temps universelle de départ(pour les reprises/corrections par la suite)
        this._updateBtnText("Pause");

        // Cycle
        this.interval = setInterval(() => {
            const now = Date.now() ;
            this.elapsedTime = now - this.startTimeStamp;

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
             if (devMode === true) {console.log("[SESSION] Libère timer unique");}
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
        this.startTimeStamp = null;
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

    //pour supprimer l'item
    removeItem(){
        this.element.remove();
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
    constructor(id, name, parentRef,colorName,duration,isDone){
        this.id = id;
        this.name = null;
        this.parentRef = parentRef;
        this.colorName = null;
        this.duration = null;//en secondes
        this.isDone = null;

        this.remaningTime = duration;
        this.isRunning = false;
        this.interval = null;
        this.startTimeStamp = null;//stocke le temps universelle pour avoir toujours le temps correct même après passage en arrière plan
        this.targetTime = null;

        this.hardColor = null;
        this.PBColor = null;

        //Pour référence
        this.progressBarRef = null;
        this.imgDoneRef = null;
        this.timeSpanRef = null;
        this.btnTextRef = null;
        this.btnActionRef = null;
        this.textNameRef = null;

        // div container
        this.element = document.createElement("div");
        this.element.classList.add("item-session-container");
        this.element.style.backgroundColor = "white";
        this.element.id = `itemSessionContainer_${id}`;



        this.render();

        // Insertion
        this.parentRef.appendChild(this.element);

        // Ajout des écouteurs d'évènement
        this.bindEvent();
        
        //référencement
        this.reference();

        //initialisation
        this.initMinuteur(name,colorName,duration,isDone);
    }



    // génération de l'élément
    render(){
        this.element.innerHTML = `
             <div class="compteur-content-line-1">
                <div class="drag-handle">⣿</div>
                <p class="compteur-name" id="minuteurName_${this.id}"></p>
                <button class="btn-counter-setting" id="btnModifyMinuteur_${this.id}">
                    <img src="./Icons/Icon-Autres.webp" alt="" srcset="">
                </button>  
            </div>

            <div class="compteur-content-line-2">
                <span id="spanSessionMinuteurResult_${this.id}" class="item-minuteur-time"></span>
            </div>

            <div class="compteur-content-line-3">
                <p class="compteur-navigation">
                    <button class="btn-counter-reset" id="btnMinuteurReset_${this.id}"><img src="./Icons/Icon-Reset.webp" alt="" srcset=""></button>
                </p>

                <button id="btnActionMinuteur_${this.id}" class="minuteur-button">
                    <span class="progress-bar-minuteur" id="spanPBSessionMinuteur_${this.id}"></span>
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
            // Sauvegarde en localStorage
            onUpdateSessionItemsInStorage();
        });

    }
    

    //référencement
    reference(){
        this.progressBarRef = this.element.querySelector(`#spanPBSessionMinuteur_${this.id}`);
        this.imgDoneRef = this.element.querySelector(`#imgMinuteurTargetDone_${this.id}`);
        this.timeSpanRef = this.element.querySelector(`#spanSessionMinuteurResult_${this.id}`);
        this.btnTextRef = this.element.querySelector(`#spanMinuteurBtnText_${this.id}`);
        this.btnActionRef = this.element.querySelector(`#btnActionMinuteur_${this.id}`);
        this.textNameRef = this.element.querySelector(`#minuteurName_${this.id}`);
    }

    // initialisation à la du minuteur
    initMinuteur(newName,newColorName,newDuration,newIsDone){

        //Les variables
        this.name = newName;
        this.colorName = newColorName;
        this.duration = newDuration;//en secondes
        this.isDone = newIsDone;

        this.hardColor = sessionItemColors[newColorName].minuteur;
        this.PBColor = sessionItemColors[newColorName].hard;


        //LE DOM
        this.progressBarRef.style.backgroundColor = this.PBColor;
        this.btnActionRef.style.backgroundColor = this.hardColor;
        this.timeSpanRef.textContent = this._formatTime(this.duration);
        this.textNameRef.textContent = this.name;

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

             if (devMode === true) {console.log("[SESSION] Verrouillage timer par :",timerInUseID);}
        }else{
            alert("Un timer est déjà en cours");
            return
        }

        this._triggerClickEffect(); //effet de click

        this.isRunning = true;
        this._updateBtnText("Pause");

        // Cible réelle en horloge système
        this.targetTime = Date.now() + (this.remaningTime * 1000);

        this.interval = setInterval(() => {
            const now = Date.now();
            const timeLeftMs = this.targetTime - now;
            this.remaningTime = Math.ceil(timeLeftMs / 1000);

            this._updateTimeDisplay(this.remaningTime);
            this._updateProgressBar();

            if (this.remaningTime <= 0) {
                this.complete();
            }
        }, 500); // vérifie toutes les 500ms pour plus de fluidité
    }

    async pause(){
        this._triggerClickEffect(); //effet de click
        this.isRunning = false;
        clearInterval(this.interval);
        this._updateBtnText("Reprendre");
        this.remaningTime = Math.ceil((this.targetTime - Date.now()) / 1000);
        
        //Libère l'utilisation de timer si utilisé par celui-ci
        if (timerInUseID !== null && timerInUseID === this.id) {
             if (devMode === true) {console.log("[SESSION] Libère timer unique");}
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

        //Joue le son de notification
        document.getElementById("audioSoundMinuteurEnd").play();

        //met à jour les éléments hors de cette classe
        userSessionItemsList[this.id].isDone = true;
        // Sauvegarde en localStorage
        onUpdateSessionItemsInStorage();
    }

    //pour supprimer l'item
    removeItem(){
        this.element.remove();
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

function onAddEventListenerforSessionItemEditor() {
    
    if (devMode === true){
        console.log("[SESSION] [EVENT-LISTENER] : Ajout les évènements pour l'éditeur de counter");
    };

    // LA div générale avec action retour
    //récupère l'élément
    let divEditCounterRef = document.getElementById("divEditCounter");
    //créé une fonction en lui donnant l'évènement et la fonction à appeler
    const onDivEditCounterClick = (event) => onAnnulSessionItemEditor(event);
    // Ajoute un écouteur d'événement "click"
    divEditCounterRef.addEventListener("click", onDivEditCounterClick);
    //Ajout l'évènement au tableau de gestion des évènement
    onAddEventListenerInRegistry("sessionItemEditor",divEditCounterRef, "click", onDivEditCounterClick);


    //La div intérieure contenur les actions
    let divEditCounterContentRef = document.getElementById("divEditCounterContent");
    const onDivEditCounterContent = (event) => onClickDivNewPopupContent(event);
    divEditCounterContentRef.addEventListener("click",onDivEditCounterContent);
    onAddEventListenerInRegistry("sessionItemEditor",divEditCounterContentRef,"click",onDivEditCounterContent);


    // Le selecteur pour changer de type d'item
    let selectItemSessionTypeRef = document.getElementById("selectItemSessionType");
    const onSelectItemSessionType = (event) => onChangeSessionItemType(event.target.value);
    selectItemSessionTypeRef.addEventListener("change",onSelectItemSessionType);
    onAddEventListenerInRegistry("sessionItemEditor",selectItemSessionTypeRef,"change",onSelectItemSessionType);

    //input number
    let inputNumberIDArray = [
        "inputEditSerieTarget",
        "inputEditRepIncrement"
    ];

    //Pour chaque input
    inputNumberIDArray.forEach(id =>{
        //ajout le focus
        let inputTargetRef = document.getElementById(id);
        const onFocusInputTarget = (event)=>  selectAllText(event.target);
        inputTargetRef.addEventListener("focus",onFocusInputTarget);
        onAddEventListenerInRegistry("sessionItemEditor",inputTargetRef,"focus",onFocusInputTarget);

        //Ajout le context menu
        const onContextMenuInputTarget = (event)=> disableContextMenu(event);
        inputTargetRef.addEventListener("contextmenu",onContextMenuInputTarget);
        onAddEventListenerInRegistry("sessionItemEditor",inputTargetRef,"contextmenu",onContextMenuInputTarget);

    });

    //input number minuteur
    inputNumberMinuteurIdArray.forEach(input=>{
        let inputRef = document.getElementById(input);
        // onInput
        let maxHour = parseInt(inputRef.max);
        const onInputItem = (event)=> formatNumberInput(event.target, maxHour, 2);
        inputRef.addEventListener("input",onInputItem);
        onAddEventListenerInRegistry("sessionItemEditor",inputRef,"input",onInputItem);


        //onFocus
        const onFocus = (event) => selectAllText(event.target);
        inputRef.addEventListener("focus",onfocus);
        onAddEventListenerInRegistry("sessionItemEditor",inputRef,"focus",onFocus);

        //onBlur
        const onBlur = (event) => formatNumberInput(event.target, maxHour, 2);
        inputRef.addEventListener("blur",onBlur);
        onAddEventListenerInRegistry("sessionItemEditor",inputRef,"blur",onBlur);

        //onContextMenu
        const onContextMenu = (event) => disableContextMenu(event);
        inputRef.addEventListener("contextmenu",onContextMenu);
        onAddEventListenerInRegistry("sessionItemEditor",inputRef,"contextmenu",onContextMenu);

    });

    // Les couleurs
    let btnColorCounterChoiceArray = document.querySelectorAll(".btnChooseColor");
    btnColorCounterChoiceArray.forEach(btnRef=>{
        let btnColor = btnRef.dataset.btnSessionItemColor;
        const onClickBtn = () => onChooseSessionItemColor(btnColor);
        btnRef.addEventListener("click",onClickBtn);
        onAddEventListenerInRegistry("sessionItemEditor",btnRef,"click",onClickBtn);

    });


    //Le menu de navigation
    //Retour
    let btnReturnRef = document.getElementById("btnReturnCounterEditor");
    const onClickAnnul = (event)=> onAnnulSessionItemEditor(event);
    btnReturnRef.addEventListener("click",onClickAnnul);
    onAddEventListenerInRegistry("sessionItemEditor",btnReturnRef,"click",onClickAnnul);

    //Supprimer
    let btnDeleteRef = document.getElementById("btnDeleteSessionItem");
    const onClickDelete = () => onClickDeleteSessionItem();
    btnDeleteRef.addEventListener("click", onClickDelete);
    onAddEventListenerInRegistry("sessionItemEditor",btnDeleteRef,"click", onClickDelete);

    //Valider
    let btnValideRef = document.getElementById("btnValideCounterEditor");
    const onclickConfirm = () => onConfirmSessionItemEditor();
    btnValideRef.addEventListener("click",onclickConfirm);
    onAddEventListenerInRegistry("sessionItemEditor",btnValideRef,"click",onclickConfirm);

}



//Evènement pour le menu suplémentaire de session
function onAddEventListenerForMenuSupSession() {

    if (devMode === true){
        console.log("[SESSION] [EVENT-LISTENER] : Ajout les évènements pour le menu supplémentaire session");
    };


    // Partie menu supplémentaire
    //annulation
    let locDivSessionMenuSupRef = document.getElementById("divSessionMenuSup");
    const onClickAnnul = (event) => onAnnulSessionMenuSup(event);
    locDivSessionMenuSupRef.addEventListener("click",onClickAnnul);
    onAddEventListenerInRegistry("sessionMenuSup",locDivSessionMenuSupRef,"click",onClickAnnul);


    //Menu générer session
    let locBtnMenuSessionGenerateRef = document.getElementById("btnMenuSessionGenerate");
    const onClickGenerateSession = (event) => onChooseSessionMenuSup(event,'generateSession');
    locBtnMenuSessionGenerateRef.addEventListener("click",onClickGenerateSession);
    onAddEventListenerInRegistry("sessionMenuSup",locBtnMenuSessionGenerateRef,"click",onClickGenerateSession);


    //Menu envoyer vers activité
    let locBtnMenuSessionSendRef = document.getElementById("btnMenuSessionSend");
    const onClickSendToActivity = (event) => onChooseSessionMenuSup(event,'sendToActivity');
    locBtnMenuSessionSendRef.addEventListener("click",onClickSendToActivity);
    onAddEventListenerInRegistry("sessionMenuSup",locBtnMenuSessionSendRef,"click",onClickSendToActivity);

}



// Evènement pour le pop créate session
function onAddEventListenerForSessionGeneration() {
    if (devMode === true){
        console.log("[SESSION] [EVENT-LISTENER] : Ajoute les évènements pour génération de session");
    }

    //Selecteur de template
    let locSelectSessionTableModelNameRef = document.getElementById("selectSessionTableModelName");
    const onChangeSelector = (event)=> onChangeSelectorChooseTemplateSession(event.target.value);
    locSelectSessionTableModelNameRef.addEventListener("change",onChangeSelector);
    onAddEventListenerInRegistry("sessionMenuGeneration",locSelectSessionTableModelNameRef,"change",onChangeSelector);

}


// Ecoute d'évènement Pour envoie vers activité
function onAddEventListenerForSendToActivity() {

    if (devMode === true){
        console.log("[SESSION] [EVENT-LISTENER] : Ajoute les évènements pour fake selector");
    }


    let locDivFakeSelectSessionRef = document.getElementById("divFakeSelectSession");
    const onCancelSend = (event)=> onCloseFakeSelectSession(event);
    locDivFakeSelectSessionRef.addEventListener("click",onCancelSend);
    onAddEventListenerInRegistry("sessionSendToActivity",locDivFakeSelectSessionRef,"click",onCancelSend);

    //choix du lieu de l'activité avant envoie puis envoie
    let btnSendToActivityLocationConfirmRef = document.getElementById("btnSendToActivityLocationConfirm");
    const onConfirmSend = ()=>eventSendToSessionToActivity();
    btnSendToActivityLocationConfirmRef.addEventListener("click",onConfirmSend);
    onAddEventListenerInRegistry("sessionSendToActivity",btnSendToActivityLocationConfirmRef,"click",onConfirmSend);

    let btnSendToActivityLocationCancelRef = document.getElementById("btnSendToActivityLocationCancel");
    const onReturnFromSendLocation = () => onClickReturnFromSendToActvityLocation();
    btnSendToActivityLocationCancelRef.addEventListener("click",onReturnFromSendLocation);
    onAddEventListenerInRegistry("sessionSendToActivity",btnSendToActivityLocationCancelRef,"click",onReturnFromSendLocation);

}


function eventSendToSessionToActivity() {
    //récupère le lieu
    let sessionLocation = document.getElementById("inputSendSessionToActivityLocation").value;
    //Masque le popup
    document.getElementById("divSendSessionToActivityLocation").classList.remove("show");
    //lance la génération
    onSendSessionToActivity(sessionActivityTypeToSend,sessionLocation);
}

function onClickReturnFromSendToActvityLocation() {
    //Masque le popup
    document.getElementById("divSendSessionToActivityLocation").classList.remove("show");
}

// ---------------------------------------- Fin écouteur evènement--------------------






async function onOpenMenuSession(){


    // Récupère les éléments
    getSessionItemListFromLocalStorage();
    getSessionStartTimeFromLocalStorage();

    //Ajoutes les écouteurs d'évènement
    onAddEventListenerforSessionItemEditor();
    onAddEventListenerForMenuSupSession();
    onAddEventListenerForSendToActivity();



    if (devMode === true){
        console.log("[EVENT-LISTENER] : Ajout les évènements pour session");
        onConsoleLogEventListenerRegistry();
    };


    //ajout l'écouteur d'évènement pour le wakeLock (à chaque fois et retire lorsque quitte le menu)
    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (devMode === true){
        console.log("[SESSION] userSessionItemsList", userSessionItemsList);
        console.log("[SESSION] Ajout Ecouteur visibilitychange pour wakeLock");
    }

    // set l'heure d'initialisation de session dans le texte
    document.getElementById("customInfo").innerHTML = `<b>Début à : ${sessionStartTime}<b>`;

    await onDisplaySessionItems();

    // Instancie le system de drag N drop avec un petit delay pour laisser la création des items
    onInitSortableItems("divSessionCompteurArea");



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
            onClearAllSessionElement();
            onChangeMenu("EditSession");
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
    document.getElementById("divEditCounterContent").style.backgroundColor = sessionItemColors[color].soft;
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
        console.log("[SESSION] erreur dans le mode d'édition du compteur");
    }

}


function eventCreateSessionItem() {
    
    // masque le popup de création
    document.getElementById("divEditCounter").style.display = "none";

    //référence le parent
    let parentRef = document.getElementById("divSessionCompteurArea");

    //S'il n'y avait aucun élément avant, retire le texte "aucun élément...."
    if (Object.keys(userSessionItemsList).length < 1) {
            parentRef.innerHTML = "";
    }



    let newInstance = {};


    //notification selon le type d'élément créé
    let notifyType = null;

    //Traitement selon le type d'item
    let itemType = document.getElementById("selectItemSessionType").value;

    switch (itemType) {

        case "COUNTER":
            // Formatage
            let counterData = onFormatCounter();

            // Obtenir le nouvel ID
            let counterNewID = getRandomShortID("counter_",userSessionItemsList);

            // Ajout du nouveau compteur à l'array
            userSessionItemsList[counterNewID] = counterData;

            //instanciation dans le DOM
            newInstance = new Counter(counterNewID, counterData.name, counterData.currentSerie, counterData.serieTarget, counterData.repIncrement,
                                parentRef, counterData.color, counterData.totalCount);

            //stocke l'instance
            sessionAllItemsInstance[counterNewID] = newInstance;

            notifyType = "counterCreated";
            break;


        case "CHRONO":
            //formatage
            let chronoData = onFormatChrono();

            // Obtenir le nouvel ID
            let chronoNewID = getRandomShortID("chrono_",userSessionItemsList);

            // Ajout du nouveau chrono à l'array
            userSessionItemsList[chronoNewID] = chronoData;

            //instanciation dans le dom
            newInstance = new Chrono(chronoNewID, chronoData.name, parentRef,
                chronoData.color, chronoData.elapsedTime);

            //stocke l'instance
            sessionAllItemsInstance[chronoNewID] = newInstance;

            notifyType = "chronoCreated";
            break;

        case "MINUTEUR":
            let minuteurData = onFormatMinuteur();

            // Obtenir le nouvel ID
            let minuteurNewID = getRandomShortID("minuteur_",userSessionItemsList);

            // Ajout du nouveau minuteur à l'array
            userSessionItemsList[minuteurNewID] = minuteurData;

            //Instanciation dans le DOM
            newInstance = new Minuteur(minuteurNewID, minuteurData.name, parentRef, 
                minuteurData.color, minuteurData.duration, minuteurData.isDone);

            //stocke l'instance
            sessionAllItemsInstance[minuteurNewID] = newInstance;

            notifyType = "minuteurCreated";
            break;
    
        default:
            break;
    }

    //Refait les display order
    updateSessionItemsDisplayOrders();
    // Sauvegarde en localStorage
    onUpdateSessionItemsInStorage();


    //gestion du bouton add new
    //Si le max est atteind, désactive le bouton
    if (Object.keys(userSessionItemsList).length >= maxSessionItems) {
        sessionInstanceButtonAddNew.disableButton();
    }


    // Popup notification
    onShowNotifyPopup(notifyType);

    console.log(sessionAllItemsInstance);
    console.log(userSessionItemsList);

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
    document.getElementById("divEditCounterContent").style.backgroundColor = sessionItemColors[userSessionItemsList[idRef].color].soft;
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
    document.getElementById("divEditCounterContent").style.backgroundColor = sessionItemColors[userSessionItemsList[idRef].color].soft;
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
    document.getElementById("divEditCounterContent").style.backgroundColor = sessionItemColors[userSessionItemsList[idRef].color].soft;
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

            //Met à jour l'instance
            sessionAllItemsInstance[currentSessionItemEditorID].initCounter(counterData.name,counterData.serieTarget,counterData.repIncrement,counterData.color);

            break;

        case "CHRONO":
            // Formatage selon le type d'item
            let chronoData = onFormatChrono();
            userSessionItemsList[currentSessionItemEditorID].type = chronoData.type;
            userSessionItemsList[currentSessionItemEditorID].name = chronoData.name;
            userSessionItemsList[currentSessionItemEditorID].color = chronoData.color;

            //Met à jour l'instance
            sessionAllItemsInstance[currentSessionItemEditorID].initChrono(chronoData.name,chronoData.color);


            break;

        case "MINUTEUR":
            // Formatage selon le type d'item
            let minuteurData = onFormatMinuteur();
            userSessionItemsList[currentSessionItemEditorID].type = minuteurData.type;
            userSessionItemsList[currentSessionItemEditorID].name = minuteurData.name;
            userSessionItemsList[currentSessionItemEditorID].color = minuteurData.color;
            userSessionItemsList[currentSessionItemEditorID].duration = minuteurData.duration;
            userSessionItemsList[currentSessionItemEditorID].isDone = minuteurData.isDone; //A chaque modification reset tout.A retirer si effet non souhaité

            //Met à jour l'instance et fait un reset du minuteur
            sessionAllItemsInstance[currentSessionItemEditorID].initMinuteur(minuteurData.name,minuteurData.color,minuteurData.duration,minuteurData.isDone);
            sessionAllItemsInstance[currentSessionItemEditorID].reset();

            break;
    
        default:
            break;
    }


    if (devMode === true){
        console.log("[SESSION] userSessionItemsList", userSessionItemsList);
        console.log("[SESSION] demande de vérification DONE");
    }

    
    // Sauvegarde en localStorage
    onUpdateSessionItemsInStorage();

}






// l'affichage des compteurs de fait sur le trie des "displayOrder"
async function onDisplaySessionItems() {
    return new Promise(async (resolve) => {
        if (devMode === true){
            console.log(" [SESSION] génération de la liste");
        }

        timerInUseID = null; 
        await releaseWakeLock();

        const divSessionCompteurAreaRef = document.getElementById("divSessionCompteurArea");
        divSessionCompteurAreaRef.innerHTML = "";

        const divSessionEndListRef = document.getElementById("divSessionEndList");
        divSessionEndListRef.innerHTML = "";


                    
        //Création du bouton add new item et traitement de son état
        let ismaxSessionItemsReach = Object.keys(userSessionItemsList).length >= maxSessionItems;
        sessionInstanceButtonAddNew = new Button_add("Ajouter un élément", () => onClickAddSessionItem(), ismaxSessionItemsReach, divSessionEndListRef);

        //Création du texte fin de liste
        let newClotureList = document.createElement("span");
            newClotureList.classList.add("last-container");
            newClotureList.innerHTML = getRandomSessionInfo(infoSessionTextArray);
            divSessionEndListRef.appendChild(newClotureList);




        if (Object.keys(userSessionItemsList).length < 1) {
            divSessionCompteurAreaRef.innerHTML = "Aucun élément à afficher !";
            return resolve(); // ← important
        }

        sessionItemsSortedKey = getSortedKeysByDisplayOrder(userSessionItemsList);
        let total = sessionItemsSortedKey.length;
        let done = 0;

        //vide l'objet des instances
        sessionAllItemsInstance = {};

        sessionItemsSortedKey.forEach((key, index) => {
            const item = userSessionItemsList[key];
            const type = item.type || "COUNTER";
            let newInstance = null;

            switch (type) {
                case "COUNTER":
                    newInstance = new Counter(key, item.name, item.currentSerie, item.serieTarget, item.repIncrement,
                                divSessionCompteurAreaRef, item.color, item.totalCount);
                    break;
                case "CHRONO":
                    newInstance = new Chrono(key, item.name, divSessionCompteurAreaRef, item.color, item.elapsedTime);
                    break;
                case "MINUTEUR":
                    newInstance = new Minuteur(key, item.name, divSessionCompteurAreaRef, item.color, item.duration, item.isDone);
                    break;
            }

            //ajoutes chaque instance créé au tableau général
            sessionAllItemsInstance[key] = newInstance;

            // dernière action
            if (++done === total) {
                if (devMode === true) console.log(" [SESSION] userSessionItemsList", userSessionItemsList);
                resolve(); // ← indique qu’on a fini le rendu DOM
            }
        });
    });
}


// Fonction de trie par displayOrder et ne retourner qu'un tableau de clé trié
function getSortedKeysByDisplayOrder(itemList) {
    return Object.entries(itemList)
        .sort(([, a], [, b]) => a.displayOrder - b.displayOrder)
        .map(([key]) => key);
}






// RESET ALL ITEMS


function onClickResetAllSessionItems() {

    let textToDisplay = `<b>Réinitialiser tous les éléments ?</b>`;
    addEventForGlobalPopupConfirmation(removeEventForGlobalPopupConfirmation,eventResetAllSessionItems,textToDisplay,"reset");
}


async function eventResetAllSessionItems() {
    
    //Vide le tableau d'instance
    sessionAllItemsInstance = {};


    // Boucle sur la liste des key
    //Pour chaque éléments passe la variable à zero et set le texte
    sessionItemsSortedKey = getSortedKeysByDisplayOrder(userSessionItemsList);
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
                console.log("Erreur switch case");
                break;
        }

    });

    // reset également l'heure du début de session
    onSetSessionStartTime();


    // Sauvegarde en localStorage
    onUpdateSessionItemsInStorage();
    onUpdateSessionTimeInStorage();

    // actualisation de la liste des compteurs
    await onDisplaySessionItems();

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

    //Suppression de l'item du DOM 
    sessionAllItemsInstance[currentSessionItemEditorID].removeItem();
    //et de l'instance
    delete sessionAllItemsInstance[currentSessionItemEditorID];
    console.log(sessionAllItemsInstance);

    //Refait les display Order
    updateSessionItemsDisplayOrders();
    // Sauvegarde en localStorage
    onUpdateSessionItemsInStorage();


    //Si zero item affiche le message
    if (Object.keys(userSessionItemsList).length < 1) {
        document.getElementById("divSessionCompteurArea").innerHTML = "Aucun élément à afficher !";
    }

    //gestion de l'affichage du bouton add new item
    if (Object.keys(userSessionItemsList).length < maxSessionItems) {
        sessionInstanceButtonAddNew.enableButton();
    }else{
        sessionInstanceButtonAddNew.disableButton();
    }

    if (devMode === true){console.log("[SESSION] userSessionItemsList", userSessionItemsList)}

    // Popup notification
    onShowNotifyPopup("itemSessionDeleted");

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







// ----------------------------- ENVOIE VERS ACTIVITE ------------------------------------






function onClickSendSessionToActivity() {

    // condition : Avoir au moins 1 compteur

    if (Object.keys(userSessionItemsList).length > 0) {
        onGenerateFakeSelectSession();
    }else{
        alert("Vous n'avez aucun élément à envoyer !");
    }
}




async function onSendSessionToActivity(activityTarget,sessionLocation) {
    
    let sessionText = "";

    //Boucle sur les éléments
    sessionItemsSortedKey = getSortedKeysByDisplayOrder(userSessionItemsList);
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

        this.element.addEventListener("click",(event)=>{
            event.stopPropagation();
            onDisplaySendToActivityLocation(this.activityName);
            //Vide la liste
            let parentRef = document.getElementById("divFakeSelectSessionList");
            parentRef.innerHTML = "";
            // affichage
            document.getElementById("divFakeSelectSession").style.display = "none";
        });

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

        this.element.addEventListener("click", (event)=>{
            event.stopPropagation();
            onDisplaySendToActivityLocation(this.activityName);
            //Vide la liste
            let parentRef = document.getElementById("divFakeSelectSessionList");
            parentRef.innerHTML = "";
            // affichage
            document.getElementById("divFakeSelectSession").style.display = "none";
        });

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
    //vide la liste
    let parentRef = document.getElementById("divFakeSelectSessionList");
    parentRef.innerHTML = "";
    //Masque la div
    document.getElementById("divFakeSelectSession").style.display = "none";
}


//Affiche la div de choix du lieu de l'activité
function onDisplaySendToActivityLocation(activityTarget) {
    //Affiche le popup de selection de la location
    document.getElementById("divSendSessionToActivityLocation").classList.add("show");


    //reset l'input du lieu
    document.getElementById("inputSendSessionToActivityLocation").value = "";

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

async function onOpenMenuEditSession() {    

        // La première fois, récupère les templates dans la base
        if (!isTemplateSessionLoadedFromBase) {
            await onLoadTemplateSessionNameFromDB();
            isTemplateSessionLoadedFromBase = true;
            if (devMode === true){console.log("[SESSION] 1er chargement des templates session depuis la base");}

            // Récupère et tries les clés
            onUpdateAndSortTemplateSessionKey();
        }

    await onGenerateSessionCanvas();
    //initialise le drag n drop
    onInitSortableGenItemsSession("divCanvasGenerateSession");

    
    // actualise la liste des modèles dans le tableau
    onGenerateModelSelectList(); 

    //création du menu principal
    onCreateMainMenuEditSession();


}



// Génération du menu principal
function onCreateMainMenuEditSession() {
    // Vide le précedent contenut
    let divMainMenuParentRef = document.getElementById("divMainBtnMenu");
    divMainMenuParentRef.innerHTML = "";

    //crée les boutons
    //Retour
    new Button_main_menu(btnMainMenuData.return.imgRef,btnMainMenuData.return.text,() => onclickReturnFromEditSession());
    //Valider
    new Button_main_menu_Valider("Générer",() => eventGenerateSessionList());

}
  

class DivGenItemSession{
    constructor(parentRef, initialCanvasOrder, type = "COUNTER", itemName = "", color = "white", counterSerie = "0", counterRep = "0", minuteurDuration = "0"){
        this.parentRef = parentRef;
        this.initialcanvasOrder = initialCanvasOrder;
        this.idNumber = getRandomShortID("");
        this.type = type;
        this.itemName = itemName;
        this.color = color;
        this.counterSerie = counterSerie;
        this.counterRep = counterRep;
        this.minuteurDuration = minuteurDuration;

        this.element = document.createElement("div");
        this.element.id = `divGenSessionItemContainer_${this.idNumber}`;
        this.element.classList.add("gen-session-module");

        //contenu dynamique à injecter selon
        this.dynamicContentData = {
            COUNTER : `
                <div class="session-type-area">
                    <div class="wrapper serial">
                        <input class="compteur" type="number" id="inputSessionGenSerieTarget_${this.idNumber}">
                    </div>
                    <div class="wrapper rep">
                        <input class="compteur" type="number" id="inputSessionGenRepIncrement_${this.idNumber}">
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
                    <input type="number" id="inputMinuteurGenSessionMin_${this.idNumber}" min="0" max="99">
                    <span class="chrono-separator">:</span>
                    <input type="number" id="inputMinuteurGenSessionSec_${this.idNumber}" min="0" max="59">
                </div>
                `
        };


        //référence
        this.child1 = null;
        this.selecteurTypeRef = null;
        this.selecteurColorRef = null;
        this.dynamicAreaRef = null;
        this.inputNameRef = null;

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
                    <div class="genSessionDragAndName">
                        <div class="drag-handle">⣿</div>
                        <input type="text" name="" id="inputGenSessionItemName_${this.idNumber}" placeholder="Nom élément ${this.initialcanvasOrder}" maxlength="30">
                    </div>
                    <select class="session-type-color gen-type" id="selectGenItemSessionType_${this.idNumber}">
                        <option value="COUNTER">Compteur</option>
                        <option value="CHRONO">Chrono</option>
                        <option value="MINUTEUR">Minuteur</option>
                    </select>
                    <select class="session-type-color gen-color" id="selectGenItemSessionColor_${this.idNumber}">
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
        this.inputNameRef = this.element.querySelector(`#inputGenSessionItemName_${this.idNumber}`);
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
        this.element.style.backgroundColor = sessionItemColors[this.color].soft;
    }

    //initialise les éléments de la première ligne
    initChild1(){
        this.selecteurTypeRef.value = this.type;
        this.inputNameRef.value = this.itemName;
        this.selecteurColorRef.value = this.color;
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

                //Pour chaque input Ajout les écouteurs
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


                //Set les valeurs par défaut

                let inputCounterSerieRef = this.element.querySelector(`#inputSessionGenSerieTarget_${this.idNumber}`),
                    inputCounterRepRef = this.element.querySelector(`#inputSessionGenRepIncrement_${this.idNumber}`);

                    inputCounterSerieRef.value = this.counterSerie;
                    inputCounterRepRef.value = this.counterRep;
                    
                break;
            case "CHRONO":
                
                break;
            case "MINUTEUR":

                //ajoute les écouteurs
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

                //set les valeurs par défaut
                let inputMinuteurMinRef = this.element.querySelector(`#inputMinuteurGenSessionMin_${this.idNumber}`),
                    inputMinuteurSecRef = this.element.querySelector(`#inputMinuteurGenSessionSec_${this.idNumber}`);

                    //formate
                    let textMinuteurValue = this._formatMinuteurTime(this.minuteurDuration);

                    //set le resultat
                    inputMinuteurMinRef.value = textMinuteurValue.minutes;
                    inputMinuteurSecRef.value = textMinuteurValue.seconds;

                break;
        
            default:
                break;
        }
    }

    _formatMinuteurTime(seconds) {
        const min = String(Math.floor(seconds / 60)).padStart(2, '0');
        const sec = String(seconds % 60).padStart(2, '0');
        const formatedTime = {
            minutes : min,
            seconds : sec
        }
        return formatedTime;
    }


}





// Génération du tableau de création de session
async function onGenerateSessionCanvas() {
   return new Promise(async (resolve) => {
        // Reférence le parent
        let parentRef = document.getElementById("divCanvasGenerateSession");

        // Reset le contenu du parent
        parentRef.innerHTML = "";

        // Génère le tableau
        for (let i = 0; i < maxSessionItems; i++) {
            // new TableLineSession(parentRef,i); 
            new DivGenItemSession(parentRef,i);
        }



        // Ajout les écoute d'évènements
        onAddEventListenerForSessionGeneration();

        if (devMode === true) {
            onConsoleLogEventListenerRegistry();
        }

        resolve(); // ← indique qu’on a fini le rendu DOM

    });
}


function onGetDivGenSessionItems(containerID){

    let sessionList = [];//contiendra tous les résultats

    //le container parent
    const container = document.getElementById(containerID);

    //récupère tous les éléments ayant la classe gen-session-module
    const children = container.querySelectorAll(".gen-session-module");

    //pour chaque canvas
    children.forEach((child, index)=>{
        
        //récupère la partie "unique" de l'ID
        const idNumber = child.id.replace("divGenSessionItemContainer_","");

        //référence les éléments communs
        let inputName = document.getElementById(`inputGenSessionItemName_${idNumber}`),
            selectColor = document.getElementById(`selectGenItemSessionColor_${idNumber}`),
            itemType = document.getElementById(`selectGenItemSessionType_${idNumber}`).value;


        //NE TRAITE QUE SI YA UN NOM
        if (inputName.value != "") {
                
             switch (itemType) {
                case "COUNTER":

                    //référence éléments spécifiques
                    let inputSerieValue = document.getElementById(`inputSessionGenSerieTarget_${idNumber}`).value,
                        inputRepValue = document.getElementById(`inputSessionGenRepIncrement_${idNumber}`).value;

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

                    sessionList.push( {
                        type : itemType,
                        name: inputName.value, 
                        color : selectColor.value
                    });
                    break;
                case "MINUTEUR":

                    //référence éléments spécifiques
                    let minValue = document.getElementById(`inputMinuteurGenSessionMin_${idNumber}`).value || "00",
                        secValue = document.getElementById(`inputMinuteurGenSessionSec_${idNumber}`).value || "00",
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
    });

    return sessionList;
}



// Génération des options du selecteur de session
function onGenerateModelSelectList() {

    if (devMode === true){
        console.log("[SESSION] generation de la liste des modèles");
        console.log("[SESSION]",templateSessionKeys);
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
function eventGenerateSessionList(){

    // Centralise les éléments qui été dans le tableau de création
    let itemForSession = onGetDivGenSessionItems("divCanvasGenerateSession");

    if (devMode === true){console.log("[SESSION]",itemForSession);}

    // Retire le popup

    // formate les nouveaux compteur et les sauvegardes
    onGenerateMultipleSessionItems(itemForSession);

    // reset également l'heure du début de session
    onSetSessionStartTime();

    // Sauvegarde la nouvelle session en local storage
    onUpdateSessionItemsInStorage();
    onUpdateSessionTimeInStorage();

    //vide le tableau
    document.getElementById("divCanvasGenerateSession").innerHTML = "";

    //et les instance drag n drop
    onDestroySortableGenSession();

    //quitte ce menu pour revenir dans le menu session
    onLeaveMenu("EditSession");

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
                console.log("[SESSION] ERREUR de type");
                break;
        }

      

    });


    if (devMode === true){console.log("[SESSION] userSessionItemsList", userSessionItemsList);}

}





// ------------------------ fonction du WAKE LOCK------------------------------------





let wakeLockInstance = null;

async function requestWakeLock() {
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
        if (timerInUseID !== null && !wakeLockInstance) {
            try {
                await requestWakeLock();
                if (devMode ===true){console.log("[SESSION] Reprise automatique du wakeLock");}
            } catch (err) {
                console.warn("[SESSION] Échec du Wake Lock :", err);
            }
        }
    }
}





// Fonction pour empecher la div de se ferme lorsqu'on se trouve dans sa zone.
function onClickOnCreateSessionArea(event){
    event.stopPropagation();
}


// Annulation de la création de session
function onclickReturnFromEditSession(event) {

    //vide le tableau
    document.getElementById("divCanvasGenerateSession").innerHTML = "";

    //et les instance drag n drop
    onDestroySortableGenSession();

    //quitte le menu
    onLeaveMenu("EditSession");

}









// --------------------------------- utilisation d'un modèle ------------------------------


async function onChangeSelectorChooseTemplateSession(modelIdTarget) {

    // vide la liste
    let parentRef = document.getElementById("divCanvasGenerateSession");
    parentRef.innerHTML = "";


    // pour modèle "personnalisé" ne vas pas plus loin
    if (modelIdTarget === "CUSTOM") {
         // Génère le tableau entier vide
        for (let i = 0; i < maxSessionItems; i++) {
            new DivGenItemSession(parentRef,i); 
        }
    }else{

        // Récupère les items selon l'ID dans la base
        let result = await findTemplateSessionById(modelIdTarget);
        
        sessionData = {
            sessionName :result.sessionName,
            itemList: result.itemList
        };

        sessionData.itemList.forEach((e,index)=>{
        //génère selon le type
        switch (e.type) {
            case "COUNTER":
                new DivGenItemSession(parentRef,index,e.type,e.name,e.color,e.serieTarget,e.repIncrement);
                break;
            case "CHRONO":
                new DivGenItemSession(parentRef,index,e.type,e.name,e.color);
                break;
            case "MINUTEUR":
                new DivGenItemSession(parentRef,index,e.type,e.name,e.color,null,null,e.duration);
                break;
            
            default:
                break;
            }
            

        });
        //puis génère le reste vide sans dépasser maxSessionItems
        for (let i = sessionData.itemList.length; i < maxSessionItems; i++) {
            new DivGenItemSession(parentRef,i); 
        }
    }




}


 


// Gestion drag N drop

function onInitSortableItems(divID) {
    const container = document.getElementById(divID);
    if (!container) return;

    // 🔁 Nettoie une instance précédente
    if (sessionItemSortableInstance) {
        sessionItemSortableInstance.destroy();
        sessionItemSortableInstance = null;
    }

    // 🔄 Crée une nouvelle instance
    sessionItemSortableInstance = Sortable.create(container, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        scroll: true,
        scrollSensitivity: 30,
        scrollSpeed: 10,
        handle: '.drag-handle',
        touchStartThreshold: 10,
        onEnd: function () {
            updateSessionItemsDisplayOrders();
            // Sauvegarde en localStorage
            onUpdateSessionItemsInStorage();
        }
    });
}


function onInitSortableGenItemsSession(divID) {
    const container = document.getElementById(divID);
    if (!container) return;

    // 🔁 Nettoie une instance précédente
    if (genSessionSortableInstance) {
        genSessionSortableInstance.destroy();
        genSessionSortableInstance = null;
    }

    // 🔄 Crée une nouvelle instance
    genSessionSortableInstance = Sortable.create(container, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        scroll: true,
        scrollSensitivity: 30,
        scrollSpeed: 10,
        handle: '.drag-handle',
        touchStartThreshold: 10,
        onEnd: function () {

        }
    });
}



//Pour les items normales
function onDestroySortableItemSession() {
    // Vide l'instance de trie
    if (sessionItemSortableInstance) {
        sessionItemSortableInstance.destroy();
        sessionItemSortableInstance = null;
    }
}


//pour l'éditeur de génération de session
function onDestroySortableGenSession() {
    // Vide l'instance de trie
    if (genSessionSortableInstance) {
        genSessionSortableInstance.destroy();
        genSessionSortableInstance = null;
    }
}



// Retour depuis Info
async function onClickReturnFromSession() {

    onClearAllSessionElement();

    // ferme le menu
    onLeaveMenu("Session");
};



async function onClearAllSessionElement() {
    //retire les écouteurs d'évènements
    onRemoveEventListenerInRegistry(["sessionItemEditor","sessionMenuSup","sessionSendToActivity"]);

    if (devMode === true){
        console.log("[EVENT-LISTENER] : Ajout les évènements pour le menu principale session");
        onConsoleLogEventListenerRegistry();
    };

    //libère le verrouillage timer unique
    if (devMode ===true){console.log("[SESSION] Libère timer unique");}
    timerInUseID = null;

    //enlève également le wakeLock si active
    await releaseWakeLock();

    //enlève ecouteur d'évènement visibility pour le wakelock
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    if (devMode ===true){console.log("[SESSION] Retire Ecouteur visibilitychange pour wakeLock");}

    onDestroySortableItemSession();

    // vide la div
    let divSessionCompteurAreaRef = document.getElementById("divSessionCompteurArea");
    divSessionCompteurAreaRef.innerHTML = "";

    //vide le tableau des instances items
    sessionAllItemsInstance = {};
    sessionInstanceButtonAddNew = null;
}