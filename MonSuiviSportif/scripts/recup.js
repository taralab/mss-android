  
//variable
let recupDuration = 30,
    recupTimer = null,
    recupRemaining = 0,
    isRecupActive = false,
    btnRecupInstance = null;



//Bouton RECUP
class Button_main_menu_recup{
    constructor(){
        this.text = "";
        this.imgRef = "./Icons/Icon-Recup-Disable.webp";

        this.button = document.createElement("button");
        
        this.button.id = getRandomShortID("mainMenuBtn_");

        this.button.classList.add("btn-menu");

        this.pressRecupTimer = null;

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





const recupPopup = document.getElementById("recup-popup");
const recupTime = document.getElementById("recup-time");
const recupClose = document.getElementById("recup-close");



function updateRecupDisplay() {
  recupTime.textContent = `⏱️ ${recupRemaining}s`;
}


//lance la récupe
function startRecup() {
  recupRemaining = recupDuration;
  recupPopup.classList.remove("hide");
  recupPopup.classList.add("active");
  updateRecupDisplay();
  recupTimer = setInterval(() => {
    recupRemaining--;
    updateRecupDisplay();
    if (recupRemaining <= 0) stopRecup();
  }, 1000);
  isRecupActive = true;
}


//Arrete récup
function stopRecup() {
  clearInterval(recupTimer);
  recupTimer = null;
  isRecupActive = false;
  recupPopup.classList.remove("active");
  recupPopup.classList.add("hide");
}





recupClose.addEventListener("click", stopRecup);

