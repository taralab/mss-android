let maxSessionNotes = 40,
    isNotesOpenFromMain = false;//pour savoir si ce menu est appelé depuis le me principal ou depuis Séance


let allUserNotesArray = {
    testnotes1 : {
        title: "titre Notes 1",
        detail:"Une detail des mes éléments de test"
    },
    testnotes2 : {
        title: "titre Notes 2",
        detail:"Une detail demoidifehs mes éléments de test"
    },
},
listenerNoteListRegistry = {};//pour gerer les évènements de la liste des notes générés





// *    *   *   *   *   *       *   *   *CLASS *    *   *   *       **  *   *   *

class itemNotes{
    constructor(key,title = "",detail = "",parentRef) {
        this.key = key;
        this.title = title;
        this.detail = detail;
        this.parentRef = parentRef;

        //réference
        this.pTitleRef = null;
        this.pDetailRef =null;
        this.inputTitleRef = null;
        this.textareaDetailRef = null;

        //contenu dynamique à inserer selon
        this.childDisplay = `
            <div id="divItemNoteDisplayArea_${this.key}">
                <p id="pNoteTitle_${this.key}" class="item-data-distance"></p>
                <p id="pNoteDetail_${this.key}" class="item-data-comment-expand"></p>
            </div>
        `;
        this.childEdit = `
            <!-- Mode Affichage -->
            <div>
                <input id="inputNoteTitle_${this.key}" type="text" maxlength="40" placeholder="Titre de la note">
                <textarea id="textareaNoteDetail_${this.key}" maxlength="250" placeholder="Detail"></textarea>
            </div>
            <div>
                <button class="btn-menu" id="btnCancelEditNote_${this.key}">
                    <img src="Icons/Icon-Return-cancel.webp" alt="Icone">
                    <span>Retour</span>
                </button>
                <button class="btn-menu" id="btnDeleteNote_${this.key}">
                    <img src="Icons/Icon-Delete-color.webp" alt="Icone">
                    <span>Supprimer</span>
                </button>
                <button class="btn-menu btn-focus" id="btnConfirmEditNote_${this.key}">
                    <img src="Icons/Icon-Accepter.webp" alt="Icone">
                    <span>Valider</span>
                </button>
            </div>
        `;

        //création container principal
        this.container = document.createElement("div");
        this.container.classList.add("item-template-container", "notes");

        //affichage de base (mode display)
        this.activateDisplayMode();

        //insertion dans le parent
        this.parentRef.appendChild(this.container);

    }


    activateDisplayMode(){
        //retire des évènements pour cette key s'il en restait
        this._removeEventListenerRegistry(this.key);

        //Insertion de la zone Display dans le dom
        this.container.innerHTML = "";
        this.container.innerHTML = this.childDisplay;

        //reférencement 
        this.pTitleRef = this.container.querySelector(`#pNoteTitle_${this.key}`);
        this.pDetailRef = this.container.querySelector(`#pNoteDetail_${this.key}`);

        //set les textes
        this.pTitleRef.textContent = this.title;
        this.pDetailRef.textContent = this.detail;

        //ajoute l'ecouteur d'évènement pour le onclick display mode
        const divNoteDisplayAreaRef = this.container.querySelector(`#divItemNoteDisplayArea_${this.key}`);
        const onClickEdit = () => this.onClickEditNotes(this.key);
        divNoteDisplayAreaRef.addEventListener("click", onClickEdit);
        this._addEventListenerRegistry(this.key,divNoteDisplayAreaRef,"click",onClickEdit);

    }

    
    onClickEditNotes(keyNotes){
        //retire l'évènement clic sur le display
        this._removeEventListenerRegistry(keyNotes);

        //vide le parent
        this.container.innerHTML = "";

        //Affiche le mode edition
        this.container.innerHTML = this.childEdit;

        //Referencement du mode edition
        this.inputTitleRef = this.container.querySelector(`#inputNoteTitle_${this.key}`);
        this.textareaDetailRef = this.container.querySelector(`#textareaNoteDetail_${this.key}`);

        //Remplit les champs
        this.inputTitleRef.value = this.title;
        this.textareaDetailRef.value = this.detail;

        //Ajout les écouteurs pour le mode edition

        //Annuler
        const btnReturnRef = this.container.querySelector(`#btnCancelEditNote_${this.key}`);
        const onReturn = () => this.eventReturnFromEditNote();
        btnReturnRef.addEventListener("click",onReturn);
        this._addEventListenerRegistry(this.key,btnReturnRef,"click",onReturn);

        //supprimer


        //Valider
        const btnSaveRef = this.container.querySelector(`#btnConfirmEditNote_${this.key}`);
        const onSave = () => this.eventSaveFromEditNote(this.key);
        btnSaveRef.addEventListener("click",onSave);
        this._addEventListenerRegistry(this.key,btnSaveRef,"click",onSave);

    }

    eventReturnFromEditNote(){
        this.activateDisplayMode();
    }


    eventDeleteFromEditNote(){

    }

    eventSaveFromEditNote(keyNote){
        //Récupère les information
        this.title = this.inputTitleRef.value;
        this.detail = this.textareaDetailRef.value;

        //set l'array user
        allUserNotesArray[keyNote].title = this.inputTitleRef.value;
        allUserNotesArray[keyNote].detail = this.textareaDetailRef.value;

        //sauvegarde

        //repasse en mode display
        this.activateDisplayMode();
    }


    _addEventListenerRegistry(keyNotes, elementRef, actionType, calledFunction) {
        //initialise si n'existe pas
        if (!listenerNoteListRegistry[keyNotes]) {
            listenerNoteListRegistry[keyNotes] = [];
        }
        //insère
        listenerNoteListRegistry[keyNotes].push({elementRef, actionType, calledFunction });
    }

    _removeEventListenerRegistry(keyNotes){
        //vérifie si l'élément existe dans le registre
        if (listenerNoteListRegistry[keyNotes]) {
            // Si des écouteurs sont présents pour cette keyNotes
            listenerNoteListRegistry[keyNotes].forEach(({ elementRef, actionType, calledFunction })=>{
                elementRef.removeEventListener(actionType, calledFunction);
            });
            // Vide le tableau après suppression
            listenerNoteListRegistry[keyNotes] = [];
            if(devMode === true){
                console.log(`[EVENT-LISTENER] : Tous les écouteurs de ${keyNotes} ont été supprimés.`);
            }
        } else {
            if(devMode === true){
                console.log(`[EVENT-LISTENER] : La keyNotes ${keyNotes} n'existe pas dans le registre.`);
            }
        }
    }
}






// *    *   *   *   *       *   *FIN CLASS *    *   *   *   *       *   *   





function onOpenMenuNotes(isFromMain){
    isNotesOpenFromMain = isFromMain;//si ouvert depuis Main ou Séance

    //affiche la liste
    onDisplayNotesList();

    console.log("[EVENT-LISTENER]",listenerNoteListRegistry);
    

    //Création du menu principal
    onCreateMainMenuNotes();
}



   // Génération du menu principal
function onCreateMainMenuNotes() {
    // Vide le précedent contenu
    let divMainMenuParentRef = document.getElementById("divMainBtnMenu");
    divMainMenuParentRef.innerHTML = "";

    //crée les boutons
    //Retour
    new Button_main_menu(btnMainMenuData.return.imgRef,btnMainMenuData.return.text,() => onClickReturnFromNotes());

}



function onDisplayNotesList() {

    let divParentRef = document.getElementById("divNotesList");
    divParentRef.innerHTML = "";

    Object.keys(allUserNotesArray).forEach(key =>{
        new itemNotes(key,allUserNotesArray[key].title,allUserNotesArray[key].detail,divParentRef);
    });    
}




// Quitte le menu
function onClickReturnFromNotes() {
    //reset des éléments
    let divParentRef = document.getElementById("divNotesList");
    divParentRef.innerHTML = "";
    listenerNoteListRegistry = {};

    //Quitte le menu selon via quel menu d'origine il a été appelé

    if (isNotesOpenFromMain) {
        //appelé depuis le menu principal
        onLeaveMenu("NotesFromMain");
    }else{
        //appelé depuis le menu séance
        onLeaveMenu("NotesFromSession");
    }

    
}