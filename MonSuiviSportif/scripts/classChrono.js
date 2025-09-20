
class Chrono {
    constructor(id, name, parentRef,colorName,elapsedTime,startTimeStamp,isRunning){
        this.id = id;
        this.name = null;
        this.parentRef = parentRef;
        this.colorName = null;
        this.elapsedTime = elapsedTime;

        this.interval = null;
        this.isRunning = isRunning;
        this.startTimeStamp = startTimeStamp; //stocke le temps universelle pour avoir toujours le temps correct même après passage en arrière plan

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


        //lancement automatique si besoin
        if (this.isRunning && this.startTimeStamp) {
            this.autoResume();
        }
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
        if(timersInUseID.chrono === null || timersInUseID.chrono === this.id){
            //si c'est libre ou si c'est moi, lance
            //verrouille l'utilisation des timer par mon id
            //gestion wakeLock
            eventGestionTimer("chrono",this.id);
        }else{
            alert("Un chronomètre est déjà en cours");
            return
        }

        this._triggerClickEffect(); //effet de click

        this.isRunning = true;
        this.startTimeStamp = Date.now() - this.elapsedTime; //stocke le temps universelle de départ(pour les reprises/corrections par la suite)
        this._updateBtnText("Pause");

        // Cycle
        this.startCycle();
        
    }


    //reprise automatique
    async autoResume() {
        if (timersInUseID.chrono === null || timersInUseID.chrono === this.id) {
            //gestion wakeLock
            eventGestionTimer("chrono",this.id);
        } else {
            alert("Un chronomètre est déjà en cours");
            return;
        }

        this.isRunning = true;
        this.elapsedTime = Date.now() - this.startTimeStamp; // Reprend l'heure ou ça à commencer pour connaitre le temps écoulé
        this._updateBtnText("Pause");

        // Cycle
        this.startCycle();
    }


    //le cycle
    startCycle(){

        // Sauvegarde l'état actuel en array et localstorage
        this._saveStat();

        this.interval = setInterval(() => {
            const now = Date.now();
            this.elapsedTime = now - this.startTimeStamp;

            // console.log("chrono : ", this.elapsedTime);
            this._updateDisplay(this.elapsedTime);
        }, 100);
    }

    async pause(){
        this._triggerClickEffect(); //effet de click
        this.isRunning = false;
        clearInterval(this.interval);
        this._updateBtnText("Reprendre");
        
        //Libère l'utilisation de timer si utilisé par celui-ci
        if (timersInUseID.chrono !== null && timersInUseID.chrono === this.id) {
            //gestion wakeLock
            eventGestionTimer("chrono",null);
        }

        // Sauvegarde l'état actuel en array et localstorage
        this._saveStat();

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


        // Sauvegarde l'état actuel en array et localstorage
        this._saveStat();


        setTimeout(() => {
            // active le bouton
            btnResetRef.disabled = false;

        }, 300);
    }


    _clearChronoInterval(){
        clearInterval(this.interval);
    }
    
    //sauvegarde les états
    _saveStat(){
        userSessionItemsList[this.id].elapsedTime = this.elapsedTime;
        userSessionItemsList[this.id].startTimeStamp = this.startTimeStamp;
        userSessionItemsList[this.id].isRunning = this.isRunning;
        onUpdateSessionItemsInStorage();
    }

    //pour supprimer l'item
    async removeItem() {
        // Arrête le chrono si actif
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            this.isRunning = false;

            // Libère le verrou si c’était lui
            if (timersInUseID.chrono === this.id) {
                eventGestionTimer("chrono",null);
            }
        }

        // Supprime l’élément DOM
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


