  
//variable
let recupDuration = 15,
    recupTimer = null,
    recupRemaining = 0,
    isRecupActive = false,
    btnRecupInstance = null,
    isRecupAlreadyReferenced = false;


//référence
let divRecupPopupRef = null;
    spanRecupTimeRef  = null;
    btnCloseRecupPopupRef = null;


//Bouton RECUP
class Button_main_menu_recup{
    constructor(){
        this.text = "";
        this.imgRef = "./Icons/Icon-Recup-Disable.webp";
        this.pressRecupTimer = null;

        this.button = document.createElement("button");
        this.button.id = getRandomShortID("mainMenuBtn_");
        this.button.classList.add("btn-menu");

        // Rendu
        this.render();
        //Insertion
        let parentRef = document.getElementById("divMainBtnMenu");
        parentRef.appendChild(this.button);
        //evènement
        this.listener();

        //initialise le texte
        this.initText();

    }

    render(){
        this.button.innerHTML = `
            <img src=${this.imgRef} alt="Icone">
            <span>${this.text}</span>
        `;
    }


    //écoute d'évènement bouton 
    listener(){

        // Appui long pour paramétrer la durée
        this.button.addEventListener("mousedown", () => {
            this.pressRecupTimer = setTimeout(() => {
                let custom = prompt("Durée de récupération (secondes) :", recupDuration);
                if (custom && !isNaN(custom)) recupDuration = parseInt(custom, 10);
            }, 600);
        });


        this.button.addEventListener("mouseup", () => clearTimeout(this.pressRecupTimer));

        //click normal pour activation
        this.button.addEventListener("click", () => {
            if (isRecupActive) stopRecup();
            else startRecup();
        });
    }


    initText(){
        this.text = `${recupDuration} Sec.`;
        let spanTextRef = this.button.querySelector("span");
        spanTextRef.textContent = this.text;
    }

}


//Réferencement unique
function onReferenceRecupItems() {

    if (isRecupAlreadyReferenced) {
        //ne fait rien si déjà référencé
        return;
    }


    isRecupAlreadyReferenced = true;
    divRecupPopupRef = document.getElementById("divRecupPopup");
    spanRecupTimeRef = document.getElementById("spanRecupTime");
    btnCloseRecupPopupRef = document.getElementById("btnCloseRecupPopup");
}


//ajout des évenement pour popup Recup
function onAddEventForRecupPopup() {
    btnCloseRecupPopupRef.addEventListener("click", stopRecup);
    onAddEventListenerInRegistry("recupPopup",btnCloseRecupPopupRef,"click",stopRecup);

    console.log("[EVENT-LISTENER]",allEventListenerRegistry);
}

//retrait des évènements pour popupRecup
function onRemoveEventForRecupPopup() {
     onRemoveEventListenerInRegistry(["recupPopup"]);
}



function updateRecupDisplay() {
    spanRecupTimeRef.textContent = `😴 ${recupRemaining}s`;
}


//lance la récupe
function startRecup() {
    recupRemaining = recupDuration;
    divRecupPopupRef.classList.remove("hide");
    divRecupPopupRef.classList.add("active");
    updateRecupDisplay();
    recupTimer = setInterval(() => {
        recupRemaining--;
        updateRecupDisplay();
        if (recupRemaining <= 0) {
            stopRecup()
            onShowNotifyPopup("recupTargetReach");
        };
    }, 1000);
    isRecupActive = true;

    //ajout l'évènements pour le popup
    onAddEventForRecupPopup();
}


//Arrete récup
function stopRecup() {
    clearInterval(recupTimer);
    recupTimer = null;
    isRecupActive = false;
    divRecupPopupRef.classList.remove("active");
    divRecupPopupRef.classList.add("hide");

    // Retrait des évènements
    onRemoveEventForRecupPopup();
}





