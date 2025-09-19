

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
        this.element.id = `itemSessionContainer_${this.id}`;

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
