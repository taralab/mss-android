class Minuteur {
    constructor(id, name, parentRef,colorName,initialDuration,remainingTime,isDone){
        this.id = id;
        this.name = null;
        this.parentRef = parentRef;
        this.colorName = null;
        this.initialDuration = null;//en secondes
        this.isDone = null;

        this.remainingTime = null;
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
        this.initMinuteur(name,colorName,initialDuration,remainingTime,isDone);
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
            this._triggerClickEffect(); //effet de click
            callMainMinuteur(this.id);
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
    initMinuteur(newName,newColorName,newinitialDuration,newRemainingTime,newIsDone){


        console.log("valeur de IS done :", newIsDone);

        //Les variables
        this.name = newName;
        this.colorName = newColorName;
        this.initialDuration = newinitialDuration;//en secondes
        this.remainingTime = newRemainingTime;
        this.isDone = newIsDone;

        this.hardColor = sessionItemColors[newColorName].minuteur;
        this.PBColor = sessionItemColors[newColorName].hard;


        //LE DOM
        this.progressBarRef.style.backgroundColor = this.PBColor;
        this.btnActionRef.style.backgroundColor = this.hardColor;
        
        this.textNameRef.textContent = this.name;

        

        if (this.isDone) {
            this.progressBarRef.style.width = "0%";
            this._updateBtnText("Terminé");
            this.imgDoneRef.classList.add("counterTargetDone");
            this.timeSpanRef.textContent = this._formatTime(this.initialDuration);
        }else{
            this._updateProgressBar(this.remainingTime);
            this._updateBtnText("Lancer compte à rebours");
            this.imgDoneRef.classList.remove("counterTargetDone");
            this.timeSpanRef.textContent = this._formatTime(this.remainingTime);
        }
    }


    reset(){
        //desactive le bouton
        let btnResetRef = this.element.querySelector(`#btnMinuteurReset_${this.id}`);
        btnResetRef.disabled = true;

        //lancement de la sequence de reset
        this._triggerClickEffect(); //effet de click


        //Traitement MAIN MINUTEUR (si en cours d'utilisation par cette instance)
        if (timersInUseID.minuteur === this.id) {
            //arrete l'interval
            clearInterval(mainMinuteurInterval);
            
            //retire l'id 
            timersInUseID.minuteur = null;
            //demande un arret du wakeLock
            releaseWakeLock();
        }


        this.remainingTime = this.initialDuration;
        this.isDone = false;
        this.isRunning = false;

        //affichage
        this._updateTimeDisplay(this.remainingTime);
        this._updateProgressBar(this.remainingTime);
        this._updateBtnText("Lancer compte à rebours");


        //sauvegarde de l'état
        onSaveMinuteurState(this.id,this.isRunning,this.remainingTime,this.isDone);

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


        //affichage
        this._updateTimeDisplay(this.initialDuration);
        this._updateProgressBar();
        this._updateBtnText("Terminé");

        //image DONE
        this.imgDoneRef.classList.add("counterTargetDone");

    }




    //pour supprimer l'item
    async removeItem(){

        // Supprime l’élément DOM
        this.element.remove();
    }

    _updateTimeDisplay(time){
        this.timeSpanRef.textContent = this._formatTime(time);
    }

    _updateProgressBar(remainingTime){
        let percent = (remainingTime / this.initialDuration) *100;
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

