  
//variable
let recupTimer = null,
    recupRemainingTime = 0,
    isRecupActive = false,
    btnRecupInstance = null,
    isRecupAlreadyLoaded = false,
    recupMinValue = 5,
    recupMaxValue = 600,
    recupTargetTime = null;


let defaultRecupData = {
    isCustomMode : false,
    predefinitValue : 30,
    customValue : 30
}

let userRecupData = {
    isCustomMode : false,
    predefinitValue : 30,
    customValue : 30
}

//référence
let divRecupPopupRef = null;
    spanRecupTimeRef  = null;
    btnCloseRecupPopupRef = null;







// -----------------------------------  CLASS ------------------------------------------






//Bouton RECUP
class Button_main_menu_recup{
    constructor(text){
        this.text = text;
        this.imgRef = "./Icons/Icon-Recup-Disable.webp";
        this.pressRecupTimer = null;
        this.longPress = false;

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
    listener() {
        // Fonction déclenchée quand on commence à appuyer (souris, doigt ou stylet)
        const startPress = () => {
            // Lance un timer : si on garde appuyé > 600ms, on ouvre l'éditeur
            this.pressRecupTimer = setTimeout(() => {
                onDisplayPopupRecupEditor();
                this.longPress = true; // on note que c'est un appui long
            }, 600);

            this.longPress = false; // par défaut, on considère que c'est un clic normal
        };

        // Fonction déclenchée quand on relâche ou qu'on annule l'appui
        const endPress = () => {
            clearTimeout(this.pressRecupTimer); // on annule le timer si ce n'est pas un long appui
        };

        // Écoute universelle (souris, tactile, stylet)
        this.button.addEventListener("pointerdown", startPress);   // début appui
        this.button.addEventListener("pointerup", endPress);       // relâche appui
        this.button.addEventListener("pointercancel", endPress);   // appui annulé
        this.button.addEventListener("pointerleave", endPress);    // doigt sort du bouton

        // Clic normal (se déclenche toujours après pointerup)
        this.button.addEventListener("click", () => {
            // Si ce n'est pas un appui long → on exécute l'action normale
            if (!this.longPress) {
                if (isRecupActive) stopRecup();
                else startRecup();
            }
        });
    }



    initText(){
        this.text = userRecupData.isCustomMode ? `${userRecupData.customValue} Sec.`: `${userRecupData.predefinitValue} Sec.`;
        let spanTextRef = this.button.querySelector("span");
        spanTextRef.textContent = this.text;
    }

}






// ----------------------------------- Fonction générique -------------------------------



async function onLoadRecupDataFromDB() {
    userRecupData = {};//initialisation en objet
    try {
        const resultRecup = await db.get(recupStoreName).catch(() => null);
        if (resultRecup) {
            userRecupData.isCustomMode = resultRecup.data.isCustomMode;
            userRecupData.customValue = resultRecup.data.customValue;
            userRecupData.predefinitValue = resultRecup.data.predefinitValue;
        }

        if (devMode === true) {
            console.log("[DATABASE] [RECUP] loading RecupData :", userRecupData);
        }
    } catch (err) {
        console.error("[DATABASE] [RECUP] Erreur lors du chargement:", err);
    }
}


//Réferencement unique
function onReferenceRecupItems() {
    isRecupAlreadyReferenced = true;
    divRecupPopupRef = document.getElementById("divRecupPopup");
    spanRecupTimeRef = document.getElementById("spanRecupTime");
    btnCloseRecupPopupRef = document.getElementById("btnCloseRecupPopup");
}


//ajout des évenement pour popup Recup
function onAddEventForRecupPopup() {
    btnCloseRecupPopupRef.addEventListener("click", stopRecup);
    onAddEventListenerInRegistry("recupPopup",btnCloseRecupPopupRef,"click",stopRecup);

    if (devMode === true) {
        console.log("[EVENT-LISTENER]",allEventListenerRegistry);
    }

}

//retrait des évènements pour popupRecup
function onRemoveEventForRecupPopup() {
     onRemoveEventListenerInRegistry(["recupPopup"]);
}



function updateRecupDisplay() {
    spanRecupTimeRef.textContent = `😴 ${recupRemainingTime}s`;
}


//lance la récupe
function startRecup() {
    recupRemainingTime = userRecupData.isCustomMode ? userRecupData.customValue : userRecupData.predefinitValue;
    divRecupPopupRef.classList.remove("hide");
    divRecupPopupRef.classList.add("active");

    // Cible réelle en horloge système
    recupTargetTime = Date.now() + (recupRemainingTime * 1000);

    updateRecupDisplay();
    recupTimer = setInterval(() => {
        const now = Date.now();
        const timeLeftMs = recupTargetTime - now;
        
        recupRemainingTime = Math.ceil(timeLeftMs / 1000);

        updateRecupDisplay();
        if (recupRemainingTime <= 0) {
            stopRecup()
            onShowNotifyPopup("recupTargetReach");
            //Joue le son de notification
            document.getElementById("audioSoundMinuteurEnd").play();
            vibrationRecupEnding();
        };
    }, 500);
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







//----------------------------------- EDITEUR ------------------------------





function onDisplayPopupRecupEditor() {
    //affiche les éléments
    let popupRef = document.getElementById("divEditRecup");
    popupRef.style.display = "flex";

    //set les éléments
    onSetRecupEditorItem();

    //ajout les évènements
    onAddEventForPopupEditor();
}



function onSetRecupEditorItem() {
    //Le mode
    let inputCheckBoxRef = document.getElementById("inputCheckBoxRecupIsCustom");
    inputCheckBoxRef.checked = userRecupData.isCustomMode;

    //le selecteur
    let selectorRef = document.getElementById("selectRecupEditor");
    selectorRef.value = userRecupData.predefinitValue;

    //l'input manuel
    let inputRef = document.getElementById("inputRecupEditor");
    inputRef.value = userRecupData.customValue;

    //Le visuel
    onChangeRecupEditorMode(userRecupData.isCustomMode);
}


//Ajoute les écoutes d'évènements pour editeur
function onAddEventForPopupEditor() {
    //clique à l'intérieur du popup et ne le ferme pas
    let divEditRecupContentRef = document.getElementById("divEditRecupContent");
    const onClickInsideRecupEditor = (event) => onClickDivRecupEditor(event);
    divEditRecupContentRef.addEventListener("click",onClickInsideRecupEditor);
    onAddEventListenerInRegistry("recupEditor",divEditRecupContentRef,"click",onClickInsideRecupEditor);

    //annuler
    let divEditRecupRef = document.getElementById("divEditRecup");
    const onCancelRecupEditor = () => onClosePopupRecupEditor();
    divEditRecupRef.addEventListener("click",onCancelRecupEditor);
    onAddEventListenerInRegistry("recupEditor",divEditRecupRef,"click",onCancelRecupEditor);


    //Changement checkbox
    let inputCheckBoxRecupIsCustomRef = document.getElementById("inputCheckBoxRecupIsCustom");
    const changeRecupEditorMode = (event) => onChangeRecupEditorMode(event.target.checked);
    inputCheckBoxRecupIsCustomRef.addEventListener("change",changeRecupEditorMode);
    onAddEventListenerInRegistry("recupEditor",inputCheckBoxRecupIsCustomRef,"change",changeRecupEditorMode);



    let inputRef = document.getElementById("inputRecupEditor");
    // onInput
    let maxDuration = parseInt(inputRef.max);
    const onFormatNumberInput = (event) => formatNumberInput(event.target, maxDuration, 2);
    inputRef.addEventListener("input",onFormatNumberInput);
    onAddEventListenerInRegistry("recupEditor",inputRef,"input",onFormatNumberInput);

    //onFocus
    const onFocus = (event) => selectAllText(event.target);
    inputRef.addEventListener("focus",onFocus);
    onAddEventListenerInRegistry("recupEditor",inputRef,"focus",onFocus);

    //onBlur
    const onBlur = (event) => formatNumberInput(event.target, maxDuration, 2);
    inputRef.addEventListener("blur",onBlur);
    onAddEventListenerInRegistry("recupEditor",inputRef,"blur",onBlur);


    //onContextMenu
    const onContextMenu = (event) => disableContextMenu(event);
    inputRef.addEventListener("contextmenu",onContextMenu);
    onAddEventListenerInRegistry("recupEditor",inputRef,"contextmenu",onContextMenu);






    //Valider
    let btnValideRecupEditorRef = document.getElementById("btnValideRecupEditor");
    const validRecupEditor = () => eventValidePopupRecupEditor();
    btnValideRecupEditorRef.addEventListener("click",validRecupEditor);
    onAddEventListenerInRegistry("recupEditor",btnValideRecupEditorRef,"click",validRecupEditor);
}



//click dans le popup editeur dans le fermer
function onClickDivRecupEditor(event) {
    event.stopPropagation();
}





function onChangeRecupEditorMode(isCustomMode) {

    //référencement
    let spanTextCustomModeRef = document.getElementById("spanTextRecupEditorCustomMode"),
        spanTextPredefinitModeRef = document.getElementById("spanTextRecupEditorPredefinitMode");
        inputRecupEditorRef = document.getElementById("inputRecupEditor"),
        selectRecupEditorRef = document.getElementById("selectRecupEditor");

    if (isCustomMode) {
        //desactive les css éléments prédéfini
        spanTextPredefinitModeRef.classList.remove("enable");
        spanTextPredefinitModeRef.classList.add("disable");
        inputRecupEditorRef.disabled = false;
        inputRecupEditorRef.classList.remove("disable");
        //active les css éléments custom
        spanTextCustomModeRef.classList.remove("disable");
        spanTextCustomModeRef.classList.add("enable");
        selectRecupEditorRef.disabled = true;
        selectRecupEditorRef.classList.add("disable");
    }else{
        //desactive les css éléments custom
        spanTextCustomModeRef.classList.remove("enable");
        spanTextCustomModeRef.classList.add("disable");
        inputRecupEditorRef.disabled = true;
        inputRecupEditorRef.classList.add("disable");

        //active les css éléments prédéfini
        spanTextPredefinitModeRef.classList.remove("disable");
        spanTextPredefinitModeRef.classList.add("enable");
        selectRecupEditorRef.disabled = false;
        selectRecupEditorRef.classList.remove("disable");
    }
}


//validation du popup
async function eventValidePopupRecupEditor() {
    //traitement et sauvegarde des éléments
    await onGetItemFromRecupEditor();

    //fermeture du popup
    onClosePopupRecupEditor();

    //actualise le bouton
    btnRecupInstance.initText();
}





//récupère les éléments de l'éditeur
async function onGetItemFromRecupEditor() {

    //récupère les éléments
    let isCustomMode = document.getElementById("inputCheckBoxRecupIsCustom").checked,
        prefefinitValue = document.getElementById("selectRecupEditor").value,
        customValue = document.getElementById("inputRecupEditor").value || recupMinValue;

    //sauvegarde dans la variable
    userRecupData.isCustomMode = isCustomMode;
    userRecupData.predefinitValue = prefefinitValue;
    userRecupData.customValue = customValue;


    //Sauvegarde en base
    // Insertion reward standard dans la base de donnée
        await updateDocumentInDB(recupStoreName, (doc) => {
            doc.data = userRecupData;
            return doc;
        });
}









//fermeture
function onClosePopupRecupEditor() {
    //retire les évènements
    onRemoveEventListenerInRegistry(["recupEditor"]);


    //masque le popup
    let popupRef = document.getElementById("divEditRecup");
    popupRef.style.display = "none";
}