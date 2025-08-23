let maxSessionNotes = 5,
    isNotesOpenFromMain = false,//pour savoir si ce menu est appelé depuis le me principal ou depuis Séance
    itemNotesSortedKey = [];//tableau des clé trié par ordre alpha sur le titre 

let allUserNotesArray = {
    testnotesA : {
        title: "titre Notes 1",
        detail:"Une detail des mes éléments de test",
        color: "yellow"
    }
},
listenerNoteListRegistry = {},//pour gerer les évènements de la liste des notes générés
noteInstanceButtonAddNew = null;





// *    *   *   *   *   *       *   *   *CLASS *    *   *   *       **  *   *   *

class itemNotes{
    constructor(key,title = "",detail = "",parentRef,isNewNote = false,color = "yellow") {
        this.key = key;
        this.title = title;
        this.detail = detail;
        this.parentRef = parentRef;
        this.isNewNote = isNewNote;//conditionne les actions
        this.color = color;

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
                <p>
                    <button class="btnChooseColor" type="button" style="background-color: #fff59d;" data-btn-note-color="yellow"></button>
                    <button class="btnChooseColor" type="button" style="background-color: #4EA88A;" data-btn-note-color="red"></button>
                    <button class="btnChooseColor" type="button" style="background-color: #ffbcbc;" data-btn-note-color="blue"></button>
                    <button class="btnChooseColor" type="button" style="background-color: #b3e0ff;" data-btn-note-color="green"></button>
                </p>
            </div>
            <div class="custom-editor-btn-menu">
                <button class="btn-menu" id="btnCancelEditNote_${this.key}">
                    <img src="Icons/Icon-Return-cancel.webp" alt="Icone">
                </button>
                <button class="btn-menu" id="btnDeleteNote_${this.key}">
                    <img src="Icons/Icon-Delete-color.webp" alt="Icone">
                </button>
                <button class="btn-menu btn-focus" id="btnConfirmEditNote_${this.key}">
                    <img src="Icons/Icon-Accepter.webp" alt="Icone">
                </button>
            </div>
        `;

        //création container principal
        this.container = document.createElement("div");
        this.container.classList.add("item-template-container", "notes");

        //la couleur
        this.onSetColor(this.color);

        //affichage de base (mode display ou éditeur selon si nouvelle note)
        if (this.isNewNote) {
            this.onClickEditNotes(this.key);
        }else{
            this.activateDisplayMode();
        }  

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
        this.bindEventListenerEditor();

    }



    bindEventListenerEditor(){

        //Annuler
        const btnReturnRef = this.container.querySelector(`#btnCancelEditNote_${this.key}`);
        const onReturn = () => this.eventReturnFromEditNote();
        btnReturnRef.addEventListener("click",onReturn);
        this._addEventListenerRegistry(this.key,btnReturnRef,"click",onReturn);

        //Valider
        const btnSaveRef = this.container.querySelector(`#btnConfirmEditNote_${this.key}`);
        const onSave = () => this.eventSaveFromEditNote(this.key);
        btnSaveRef.addEventListener("click",onSave);
        this._addEventListenerRegistry(this.key,btnSaveRef,"click",onSave);

        //gestion du bouton supprimer
        //Le bouton "supprimer" n'est pas visible pour une nouvelle note
        const btnDeleteRef = this.container.querySelector(`#btnDeleteNote_${this.key}`);
        btnDeleteRef.style.visibility = this.isNewNote ? "hidden" : "visible";
        if(!this.isNewNote){
            const onClickDelete = () => this.eventDeleteConfirmationFromEditNote();
            btnDeleteRef.addEventListener("click",onClickDelete);
            this._addEventListenerRegistry(this.key,btnDeleteRef,"click",onClickDelete);
        }
    }


    //Set la couleur
    onSetColor(newColor){

        //toutes les classe post-it couleur
        let colorClassArray = [
            "note-yellow",
            "note-red",
            "note-blue",
            "note-green"
        ];
        //retire l'ancienne couleur si présente

        colorClassArray.forEach(colorClass => {
            //si le container contient la class de couleur
            if (this.container.classList.contains(colorClass)) {
                //la retire
                this.container.classList.remove(colorClass);
            }
        });
        
        
        //Ajout la nouvelle classe de couleur
        let colorClassToAdd = "";
        switch (newColor) {
            case "yellow":
                //ajoute la class
                colorClassToAdd = "note-yellow";
                //change le style du bouton

                break;
        case "red":
                colorClassToAdd = "note-red";
                break;
        case "blue":
                colorClassToAdd = "note-blue";
                break;
        case "green":
                colorClassToAdd = "note-green";
                break;                        
        default:
                break;
        }
        this.container.classList.add(colorClassToAdd);

        this.color = newColor;

    }


    //RETOUR ou ANNULER
    eventReturnFromEditNote(){
        if (this.isNewNote) {
            this.onCancelNewNote(this.key);
        }else{
            this.activateDisplayMode();
        }
        
    }




    //SAUVEGARDE
    async eventSaveFromEditNote(keyNote){

        //Récupère les information et les formatent
        let newTitle = onSetFirstLetterUppercase(this.inputTitleRef.value) || "Nouvelle note",
            newDetail = this.textareaDetailRef.value;

        this.title = newTitle;
        this.detail = newDetail;

        //set l'array user
        //initialise si n'existait pas
        if(!allUserNotesArray[keyNote]){
            allUserNotesArray[keyNote] = {};
        }
        allUserNotesArray[keyNote].title = newTitle;
        allUserNotesArray[keyNote].detail = newDetail;
        allUserNotesArray[keyNote].color = this.color;

        //sauvegarde
        if (this.isNewNote) {
            //sauvegard la nouvelle note
            onInsertnewNoteInDB(allUserNotesArray[keyNote], keyNote);

            //passe en mode note existante
            this.isNewNote = false;
        }else{
            //sauvegarde la modification
            onInsertNoteModificationInDB(allUserNotesArray[keyNote], keyNote);
        }


        //repasse en mode display
        this.activateDisplayMode();
    }

    //SUPPRESSION
    eventDeleteConfirmationFromEditNote(){
        addEventForGlobalPopupConfirmation(
            removeEventForGlobalPopupConfirmation,
            () => this.confirmDeleteNote(this.key),
            "Supprimer cette note ?",
            "delete"
        );
    }

    async confirmDeleteNote(keyTarget){

        console.log("delete");
        //suppression dans l'array
        delete allUserNotesArray[keyTarget];

        //suppression du tableau de key
        let indexToRemove = itemNotesSortedKey.indexOf(keyTarget);
        itemNotesSortedKey.splice(indexToRemove,1);

        //retrait des évènements
        this._removeEventListenerRegistry(keyTarget);

        //Envoie vers la corbeille
        await sendToRecycleBin(keyTarget);

        //réactualisation des éléments de la page
        eventUpdateNotesPage();

        //Retrait de la class du DOM
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }

    }

    //ANNULATION DE LA CREATION D'UNE NOUVELLE NOTE
    onCancelNewNote(keyTarget){
            //suppression du tableau de key
            let indexToRemove = itemNotesSortedKey.indexOf(keyTarget);
            itemNotesSortedKey.splice(indexToRemove,1);
            //retrait des évènements
            this._removeEventListenerRegistry(keyTarget);

            //réactualisation des éléments de la page
            eventUpdateNotesPage();

            //Retrait de la class du DOM
            if (this.container && this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
            }
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
                console.log(`[EVENT-LISTENER] : aucune keynote "${keyNotes}" présente dans le registre d'évènement`);
            }
        }
    }
}








// *    *   *   *   *       *   *FONCTION BDD GENERAL *    *   *   *   *       *   *   



//chargement
async function onLoadNoteFromDB() {
    allUserNotesArray = {};

    try {
        const result = await db.allDocs({ include_docs: true });

        result.rows
            .map(row => row.doc)
            .filter(doc => doc.type === noteStoreName)
            .forEach(doc => {
                allUserNotesArray[doc._id] = { 
                    title : doc.title,
                    detail : doc.detail,
                    color: doc.color || "yellow" 
                };
            });

        if (devMode === true) {
            console.log("[DATABASE] [NOTE] notes chargées :", noteStoreName);
            const firstKey = Object.keys(allUserNotesArray)[0];
            console.log(allUserNotesArray[firstKey]);
        }
    } catch (err) {
        console.error("[DATABASE] [NOTE] Erreur lors du chargement:", err);
    }
}



// Insertion nouvelle note (ID défini manuellement avec put)
async function onInsertnewNoteInDB(noteToInsert, key) {
    try {
        const newNote = {
            _id: key, // ID personnalisé
            type: noteStoreName,
            ...noteToInsert
        };

        // Utilisation de put() avec ID défini
        const response = await db.put(newNote);

        // Mise à jour de l’objet avec _rev retourné
        newNote._rev = response.rev;

        if (devMode === true) {
            console.log("[DATABASE] [NOTE] Activité insérée avec ID personnalisé :", newNote);
        }

        return newNote;
    } catch (err) {
        console.error("[DATABASE] [NOTE] Erreur lors de l'insertion de l'activité :", err);
    }
}

// Modification Notes
async function onInsertNoteModificationInDB(noteToUpdate, key) {
    try {
        let existingDoc = await db.get(key);

        const updatedDoc = {
            ...existingDoc,  // Garde `_id` et `_rev`
            ...noteToUpdate // Applique les nouvelles valeurs en évitant d'écraser `_id` et `_rev`
        };

        // Sauvegarde dans la base
        const response = await db.put(updatedDoc);

        if (devMode) console.log("[NOTE] Note mis à jour :", response);

        return updatedDoc; // Retourne l'objet mis à jour
    } catch (err) {
        console.error("Erreur lors de la mise à jour dela note :", err);
        return false; // Indique que la mise à jour a échoué
    }
}





// *    *   *   *   *       *   *LANCEMENT MENU *    *   *   *   *       *   *   






async function onOpenMenuNotes(isFromMain){
    isNotesOpenFromMain = isFromMain;//si ouvert depuis Main ou Séance

    //vide les éléments
    let divNoteListRef = document.getElementById("divNotesList");
    divNoteListRef.innerHTML = "";
    //text fin de liste
    const divNoteEndListRef = document.getElementById("divNotesEndList");
    divNoteEndListRef.innerHTML = "";

    //récupère la liste dans la base
    await onLoadNoteFromDB();

    //trie les clé par ordre alpha
    itemNotesSortedKey = getNoteSortedKeysByTitle(allUserNotesArray);

    console.log(itemNotesSortedKey);
    console.log(allUserNotesArray);

    //affiche la liste
    onDisplayNotesList();


    //Fin de liste
    //création du bouton add
    let isMaxNoteReach = itemNotesSortedKey.length >= maxSessionNotes;
    noteInstanceButtonAddNew = new Button_add("Ajouter une note", () => onClickAddNewNote(), isMaxNoteReach, divNoteEndListRef);



    let newClotureList = document.createElement("span");
            newClotureList.classList.add("last-container");
            newClotureList.innerHTML = `ℹ️ Vous pouver créer jusqu'à ${maxSessionNotes} notes.`;
            divNoteEndListRef.appendChild(newClotureList);

    //affiche et actualise les autres éléments du menu
    eventUpdateNotesPage();

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


//Affichage de la liste
function onDisplayNotesList() {
    //Vide le parent
    let divParentRef = document.getElementById("divNotesList");
    divParentRef.innerHTML = "";

    itemNotesSortedKey.forEach(key =>{
        new itemNotes(key,allUserNotesArray[key].title,allUserNotesArray[key].detail,divParentRef,false,allUserNotesArray[key].color);
    });    

}




//Ajout d'une nouvelle note
//lorsque j'ajoute une nouvelle note, un id est généré et stocké dans le tableau des key
//La note ne sera dans la base et dans l'array que lorsque je l'aurai enregistré
function onClickAddNewNote() {

    let divParentRef = document.getElementById("divNotesList");

    //retire texte aucune élément si c'était affiché
    if (itemNotesSortedKey.length === 0) {
        divParentRef.innerHTML = "";
    }

    //génération d'un id
    let newNoteID = getRandomShortID("notes_");
    //Ajoute la key au tableau des key
    itemNotesSortedKey.push(newNoteID);

    //Insertion de la note en mode edition
    new itemNotes(newNoteID,"","",divParentRef,true);

    //actualise les éléments de la page
    eventUpdateNotesPage();
}







// Fonction de trie alpha par titre et ne retourner qu'un tableau de clé trié
function getNoteSortedKeysByTitle(noteList) {
    // Récupérer les clés de l'objet
    const keys = Object.keys(noteList);

    // Trier les clés selon le titre
    keys.sort((a, b) => {
        const titleA = noteList[a].title.toLowerCase();
        const titleB = noteList[b].title.toLowerCase();
        return titleA.localeCompare(titleB); // Utilise localeCompare pour un tri alphabétique
    });

    return keys;
}



//actualise les éléments hors item notes (info, boutton add new)
function eventUpdateNotesPage() {
    //affiche "Aucune élément si besoin"
    if (itemNotesSortedKey.length < 1) {
        divParentRef = document.getElementById("divNotesList");
        divParentRef.innerHTML = "Aucune note à afficher";
    }

    //note info
    updateNoteInfo();


    //bouton add
    updateNoteBtnNewStatus();

}








//spécifique info
function updateNoteInfo() {
    let customInfoRef = document.getElementById("customInfo");

    //affiche le nombre de notes
    customInfoRef.innerHTML = `${itemNotesSortedKey.length}/${maxSessionNotes}`;
}

//spécifique bouton new
function updateNoteBtnNewStatus() {
    //Si le max est atteind, désactive le bouton sinon l'active
    if (itemNotesSortedKey.length >= maxSessionNotes) {
        noteInstanceButtonAddNew.disableButton();
    }else{
        noteInstanceButtonAddNew.enableButton();
    }
}


// Quitte le menu
function onClickReturnFromNotes() {
    //reset des éléments
    let divParentRef = document.getElementById("divNotesList");
    divParentRef.innerHTML = "";
    listenerNoteListRegistry = {};

    let divParentEndNoteRef = document.getElementById("divNotesEndList");
    divParentEndNoteRef.innerHTML = "";

    //Quitte le menu selon via quel menu d'origine il a été appelé

    if (isNotesOpenFromMain) {
        //appelé depuis le menu principal
        onLeaveMenu("NotesFromMain");
    }else{
        //appelé depuis le menu séance
        onLeaveMenu("NotesFromSession");
    }

    
}