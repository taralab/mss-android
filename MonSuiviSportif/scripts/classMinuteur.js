class Minuteur {
    constructor(id, name, parentRef,colorName,duration,remainingTime,isRunning,isDone){
        this.id = id;
        this.name = null;
        this.parentRef = parentRef;
        this.colorName = null;
        this.duration = null;//en secondes
        this.isDone = null;

        this.remainingTime = remainingTime;
        this.isRunning = isRunning;
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
            callMainMinuteur(this.id,false);
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
        if (this.remainingTime <=0 || this.isDone === true) {
            return
        }else if(timersInUseID.minuteur === null || timersInUseID.minuteur === this.id){
            //si c'est libre ou si c'est moi, lance
            //verrouille l'utilisation des timer par mon id
            timersInUseID.minuteur = this.id;
            await requestWakeLock();

             if (devMode === true) {console.log("[SESSION] Verrouillage timer par :",timersInUseID.minuteur);}
        }else{
            alert("Un Minuteur est déjà en cours");
            return
        }

        this._triggerClickEffect(); //effet de click

        this.isRunning = true;
        this._updateBtnText("Pause");

        // Cible réelle en horloge système
        this.targetTime = Date.now() + (this.remainingTime * 1000);

        this.interval = setInterval(() => {
            const now = Date.now();
            const timeLeftMs = this.targetTime - now;
            this.remainingTime = Math.ceil(timeLeftMs / 1000);

            this._updateTimeDisplay(this.remainingTime);
            this._updateProgressBar();

            if (this.remainingTime <= 0) {
                this.complete();
            }
        }, 500); // vérifie toutes les 500ms pour plus de fluidité
    }

    async pause(){
        this._triggerClickEffect(); //effet de click
        this.isRunning = false;
        clearInterval(this.interval);
        this._updateBtnText("Reprendre");
        this.remainingTime = Math.ceil((this.targetTime - Date.now()) / 1000);
        
        //Libère l'utilisation de timer si utilisé par celui-ci
        if (timersInUseID.minuteur !== null && timersInUseID.minuteur === this.id) {
             if (devMode === true) {console.log("[SESSION] Libère timer unique");}
            timersInUseID.minuteur = null;
            await releaseWakeLock();
        }
        
    }

    reset(){
        //desactive le bouton
        let btnResetRef = this.element.querySelector(`#btnMinuteurReset_${this.id}`);
        btnResetRef.disabled = true;

        //lancement de la sequence de reset
        this._triggerClickEffect(); //effet de click


        //si le minuteur était en cours,
        if (this.isRunning === true) {
            //arrete et libère le mainMinuteur

        }


        //met à jours les variables de la class
        this.isRunning = false;
        this.remainingTime = this.duration;
        this.isDone = false;

        //affichage
        this._updateTimeDisplay(this.remainingTime);
        this._updateProgressBar();
        this._updateBtnText("Lancer compte à rebours");


        //sauvegarde des état en array et en base
        this._saveStat();


        //image DONE retrait
        this.imgDoneRef.classList.remove("counterTargetDone");

        setTimeout(() => {
            // active le bouton
            btnResetRef.disabled = false;

        }, 300);
    }

    complete(){
        this.remainingTime = 0;//remet la durée initial comme ça l'utilisateur peux voir ce qu'il avait mis
        this.isDone = true;
        this.isRunning = false;

        //sauvegarde
        this._saveStat();

        //affichage
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



    _saveStat(){
        //sauvegarde des état en array et en base
        userSessionItemsList[this.id].isDone = this.isDone;
        userSessionItemsList[this.id].remainingTime = this.remainingTime;
        userSessionItemsList[this.id].isRunning = this.isRunning;

        onUpdateSessionItemsInStorage();

        console.log("sauvegarde d'état minuteur : ");
        console.log(userSessionItemsList[this.id]);
    }


    //pour supprimer l'item
    async removeItem(){
         // Arrête le chrono si actif
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            this.isRunning = false;

            // Libère le verrou si c’était lui
            if (timersInUseID.minuteur === this.id) {
                timersInUseID.minuteur = null;
                await releaseWakeLock(); // libère le wakeLock si nécessaire
            }
        }

        // Supprime l’élément DOM
        this.element.remove();
    }

    _updateTimeDisplay(time){
        this.timeSpanRef.textContent = this._formatTime(time);
    }

    _updateProgressBar(remainingTime){
        let percent = (remainingTime / this.duration) *100;
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

