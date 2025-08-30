let maxNotes = 10,
    isNotesOpenFromMain = false,//pour savoir si ce menu est appelé depuis le me principal ou depuis Séance
    itemNotesSortedKey = [];//tableau des clé trié par ordre alpha sur le titre 

let allUserNotesArray = {
    testnotesA : {
        title: "titre Notes 1",
        detail:"Une detail des mes éléments de test",
        color: "yellow",
        displayOrder:0,//pas encore utilisé mais par anticipation
        createdAt:""
    }
},
noteInstanceButtonAddNew = null,
isNoteLoadedFromDB = false,//pour chargement unique depuis la base
allInstanceItemNotes = {},
defaultNoteColor = "yellow",
noteEditorMode = "",//"creation ou modification"
currentEditorNoteKey = "",
currentNoteColorSelected ="";

//référence de l'éditeur
let inputTitleNoteRef = null,
    textareaDetailNoteRef = null,
    divNoteEditorContentRef = null;






// *    *   *   *   *   *   *   *   *   *   ECOUTEUR D'EVENEMENT *  *   *   *   *   *   *   





function onAddEventListenerForNoteItemEditor() {

    if (devMode === true){
        console.log("[NOTE] [EVENT-LISTENER] : Ajout les évènements pour l'éditeur de note");
    };

    // LA div générale avec action retour
    //récupère l'élément
    let divEditNoteRef = document.getElementById("divEditNote");
    //créé une fonction en lui donnant l'évènement et la fonction à appeler
    const onDivEditNoteClick = (event) => onAnnulNoteItemEditor(event);
    // Ajoute un écouteur d'événement "click"
    divEditNoteRef.addEventListener("click", onDivEditNoteClick);
    //Ajout l'évènement au tableau de gestion des évènement
    onAddEventListenerInRegistry("noteItemEditor",divEditNoteRef, "click", onDivEditNoteClick);


    //La div intérieure contenur les actions
    let divEditNoteContentRef = document.getElementById("divEditNoteContent");
    const onDivEditNoteContent = (event) => onClickDivNotePopupContent(event);
    divEditNoteContentRef.addEventListener("click",onDivEditNoteContent);
    onAddEventListenerInRegistry("noteItemEditor",divEditNoteContentRef,"click",onDivEditNoteContent);


    // Les couleurs
    let parentRef = document.getElementById("divEditNote");
    let btnColorNoteChoiceArray = parentRef.querySelectorAll(".btnChooseColor");
    btnColorNoteChoiceArray.forEach(btnRef=>{
        let newColor = btnRef.dataset.btnNoteColor;
        const onClickBtn = () => onChooseNoteItemColor(newColor);
        btnRef.addEventListener("click",onClickBtn);
        onAddEventListenerInRegistry("noteItemEditor",btnRef,"click",onClickBtn);
    });



    //Le menu de navigation
    //Retour
    let btnReturnRef = document.getElementById("btnCancelEditNote");
    const onClickAnnul = (event)=> onAnnulNoteItemEditor(event);
    btnReturnRef.addEventListener("click",onClickAnnul);
    onAddEventListenerInRegistry("noteItemEditor",btnReturnRef,"click",onClickAnnul);

    //Supprimer
    let btnDeleteRef = document.getElementById("btnDeleteNote");
    const onClickDelete = () => onAskDeleteNoteRequest();
    btnDeleteRef.addEventListener("click", onClickDelete);
    onAddEventListenerInRegistry("noteItemEditor",btnDeleteRef,"click", onClickDelete);

    //Valider
    let btnValideRef = document.getElementById("btnConfirmEditNote");
    const onclickConfirm = () => onClickSaveNote();
    btnValideRef.addEventListener("click",onclickConfirm);
    onAddEventListenerInRegistry("noteItemEditor",btnValideRef,"click",onclickConfirm);
}








// *    *   *   *   *   *       *   *   *CLASS *    *   *   *       **  *   *   *

class itemNotes{
    constructor(key,title,detail,parentRef,color) {
        this.key = key;
        this.title = title;
        this.detail = detail;
        this.parentRef = parentRef;
        this.color = color;


        //réference
        this.pTitleRef = null;
        this.pDetailRef =null;

        //création container principal
        this.container = document.createElement("div");
        this.container.classList.add("notes");
        this.container.id = `divItemNoteContainer_${this.key}`;


        //fait rendu html
        this.render();

        //insertion dans le parent
        this.parentRef.appendChild(this.container);

        //référencement
        this.reference();
        
        //la couleur
        this.requestSetColor();

        //affichage
        this.updateNoteText();

        //ajout écouteur
        this.bindEvent();
    }



    render(){
        this.container.innerHTML = `
                <p id="pNoteTitle_${this.key}" class="item-data-distance"></p>
                <p id="pNoteDetail_${this.key}" class="item-data-comment-expand"></p>
        `;
    }

    reference(){
        //reférencement 
        this.pTitleRef = this.container.querySelector(`#pNoteTitle_${this.key}`);
        this.pDetailRef = this.container.querySelector(`#pNoteDetail_${this.key}`);
    }


    updateNoteText(){
        //set les textes
        this.pTitleRef.textContent = this.title;
        this.pDetailRef.textContent = this.detail;
    }

    requestSetColor(){
        onSetColor(this.container,this.color);
    }

    bindEvent(){
        //ajoute l'ecouteur d'évènement pour le onclick display mode
        const onClickEdit = () => onClickEditNotes(this.key);
        this.container.addEventListener("click", onClickEdit);
    }


    remove() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
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
                    color: doc.color,
                    createdAt : doc.createdAt,
                    displayOrder : doc.displayOrder
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
async function onInsertnewNoteInDB(noteToInsert) {
    try {
        const newNote = {
            type: noteStoreName,
            ...noteToInsert
        };

        // Utilisation de post() pour génération automatique de l’ID
        const response = await db.post(newNote);

        // Mise à jour de l’objet avec _rev retourné
        newNote._id = response.id;
        newNote._rev = response.rev;

        if (devMode === true) {
            console.log("[DATABASE] [NOTE] Activité insérée :", newNote);
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

    //récupère la liste dans la base la première fois. Les suivantes, prend dans l'array
    if (!isNoteLoadedFromDB) {
        isNoteLoadedFromDB = true;
        await onLoadNoteFromDB();
    }


    //trie les clé par ordre de création
    itemNotesSortedKey = getNoteSortedKeyByCreatedAt(allUserNotesArray);

    //affiche la liste
    onDisplayNotesList();


    //Fin de liste
    //création du bouton add
    let isMaxNoteReach = itemNotesSortedKey.length >= maxNotes;
    noteInstanceButtonAddNew = new Button_add("Ajouter une note", () => onClickAddNewNote(), isMaxNoteReach, divNoteEndListRef);

    let newClotureList = document.createElement("span");
            newClotureList.classList.add("last-container");
            newClotureList.innerHTML = `ℹ️ Vous pouver créer jusqu'à ${maxNotes} notes.`;
            divNoteEndListRef.appendChild(newClotureList);

    //affiche et actualise les autres éléments du menu
    eventUpdateNotesPage();

    //Création du menu principal
    onCreateMainMenuNotes();

    //ajoute l'ecouteur pour l'editeur de note
    onAddEventListenerForNoteItemEditor();

    //référence les éléments pour l'éditeur
    onReferenceNoteEditor();
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
        allInstanceItemNotes[key] = new itemNotes(key,allUserNotesArray[key].title,allUserNotesArray[key].detail,divParentRef,allUserNotesArray[key].color);
    }); 

}


//référencement de l'éditeur de note
function onReferenceNoteEditor() {
    inputTitleNoteRef = document.getElementById("inputNoteTitle");
    textareaDetailNoteRef = document.getElementById("textareaNoteDetail");
    divNoteEditorContentRef = document.getElementById("divEditNoteContent");
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

//trie par la date de création
function getNoteSortedKeyByCreatedAt(noteList) {
    const keys = Object.keys(noteList);

    keys.sort((a, b) => {
        const dateA = new Date(noteList[a].createdAt);
        const dateB = new Date(noteList[b].createdAt);
        return dateA - dateB; // tri croissant (du plus ancien au plus récent)
    });

    return keys;
}


//actualise les éléments hors item notes (info, boutton add new)
function eventUpdateNotesPage() {
    //affiche "Aucune élément si besoin"
    if (itemNotesSortedKey.length < 1) {
        document.getElementById("pNoteListNoItem").style.display = "block";
    }else{
        document.getElementById("pNoteListNoItem").style.display = "none";
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
    customInfoRef.innerHTML = `${itemNotesSortedKey.length}/${maxNotes}`;
}

//spécifique bouton new
function updateNoteBtnNewStatus() {
    //Si le max est atteind, désactive le bouton sinon l'active
    if (itemNotesSortedKey.length >= maxNotes) {
        noteInstanceButtonAddNew.disableButton();
    }else{
        noteInstanceButtonAddNew.enableButton();
    }
}





//Set la couleur
function   onSetColor(itemRef,color = "yellow"){

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
            if (itemRef.classList.contains(colorClass)) {
                //la retire
                itemRef.classList.remove(colorClass);
            }
        });
        
        
        //Ajout la nouvelle classe de couleur
        let colorClassToAdd = "";
        switch (color) {
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
                console.error("erreur onSet Color",color);
                    break;
        }
        itemRef.classList.add(colorClassToAdd);

    }







//* *   *   *   *   *   *   *   *   EDITEUR     *   *   **  *   *   *   *   *   *   *   







//Ajout d'une nouvelle note
//lorsque j'ajoute une nouvelle note, un id est généré et stocké dans le tableau des key
//La note ne sera dans la base et dans l'array que lorsque je l'aurai enregistré
function onClickAddNewNote() {
    //set le mode et la couleur par défaut
    noteEditorMode = "creation";
    currentNoteColorSelected = defaultNoteColor;

    //reset les éléments
    inputTitleNoteRef.value = "";
    textareaDetailNoteRef.value = "";

    //set la couleur par défaut
    onSetColor(divNoteEditorContentRef,defaultNoteColor);

    //Masque le bouton supprimer
    document.getElementById("btnDeleteNote").style.visibility = "hidden";

    //met en évidence le bouton sélectionné
    onFocusNoteBtnColor(defaultNoteColor);

    //affiche le popup
    document.getElementById("divEditNote").style.display = "flex";

    //met le focus sur titre et le curseur à la fin
    onSetTextFocus(inputTitleNoteRef);

}



function onClickEditNotes(keyNotes){
    //set le mode
    noteEditorMode = "modification";

    //garde la clé en cours de modification
    currentEditorNoteKey = keyNotes;

    //set les éléments
    const itemNoteData = allInstanceItemNotes[keyNotes];

    //stocke la couleur d'origine
    currentNoteColorSelected = itemNoteData.color;

    inputTitleNoteRef.value = itemNoteData.title || "";
    textareaDetailNoteRef.value = itemNoteData.detail || "";

    //affiche le bouton supprimer
    document.getElementById("btnDeleteNote").style.visibility = "visible";

    //set la couleur
    onSetColor(divNoteEditorContentRef,itemNoteData.color);

    //met en évidence le bouton sélectionné
    onFocusNoteBtnColor(itemNoteData.color);

    //affiche le popup
    document.getElementById("divEditNote").style.display = "flex";


    //met le focus sur detail et le curseur à la fin
    onSetTextFocus(textareaDetailNoteRef);

}



function onFocusNoteBtnColor(newColor){
    // Met en évidence le bouton sélectionné
    let btnColorNoteChoiceArray = divNoteEditorContentRef.querySelectorAll(".btnChooseColor");
    btnColorNoteChoiceArray.forEach(btn=>{
        if (btn.dataset.btnNoteColor === newColor){
            btn.classList.add("btnColorSelected");
        }else if (btn.classList.contains("btnColorSelected")){
            btn.classList.remove("btnColorSelected");
        }
    });
}






//annulation ou retour
function onAnnulNoteItemEditor(){
    document.getElementById("divEditNote").style.display = "none";
}


// Empeche de fermer la div lorsque l'utilisateur clique dans cette zone
function onClickDivNotePopupContent(event) {
    event.stopPropagation();
}




//Choix d'une couleur

function onChooseNoteItemColor(newColor) {
    //Stocke la couleur choisit
    currentNoteColorSelected = newColor;

    //Met la couleur dans l'éditeur
    onSetColor(divNoteEditorContentRef,currentNoteColorSelected);

    //met en évidence le bouton sélectionné
    onFocusNoteBtnColor(currentNoteColorSelected);
}


function onClickSaveNote() {
    //aiguille selon le mode d'éditeur
    //creation
    if (noteEditorMode === "creation") {
        eventSaveNewNote();
    }else{
        //Modification
        eventSaveNoteModification();
    }
}


//sauvegarde nouvelle note
async function eventSaveNewNote(){
    //Masque le popup
    document.getElementById("divEditNote").style.display = "none";

    //Formate la note
    let noteToSave = onFormatNote();

    //insertion dans la base et retour pour obtenir l'id généré
    let newNoteAdded = await onInsertnewNoteInDB(noteToSave);

    //insertion dans l'array
    let noteKey = newNoteAdded._id;
    allUserNotesArray[noteKey] = newNoteAdded;

    //Ajoute aussi au tableau de clé
    itemNotesSortedKey.push(noteKey);


    //insère la note dans la page
    let parentRef = document.getElementById("divNotesList");
    allInstanceItemNotes[noteKey] = new itemNotes(noteKey,allUserNotesArray[noteKey].title,allUserNotesArray[noteKey].detail,parentRef,allUserNotesArray[noteKey].color);
    
    //affiche et actualise les autres éléments du menu
    eventUpdateNotesPage();



    //Notification
    onShowNotifyPopup("noteSaved");
}






async function eventSaveNoteModification() {
    //Masque le popup
    document.getElementById("divEditNote").style.display = "none";

    //Formate la note
    let noteToSave = onFormatNote();

    //insert la modification en base
    let noteAdded = await onInsertNoteModificationInDB(noteToSave,currentEditorNoteKey);

    //insert les modifications dans l'array
    allUserNotesArray[noteAdded._id] = noteAdded;


    //let à jour l'instance
    allInstanceItemNotes[noteAdded._id].title = noteAdded.title;
    allInstanceItemNotes[noteAdded._id].detail = noteAdded.detail;
    allInstanceItemNotes[noteAdded._id].color = noteAdded.color;

    allInstanceItemNotes[noteAdded._id].requestSetColor();
    allInstanceItemNotes[noteAdded._id].updateNoteText();


    //Pas besoin d'action sur le tableau des clé car inchangé

    //Notification
    onShowNotifyPopup("noteSaved");
}



function onFormatNote(){
    //Récupère les information et les formatent
    let newTitle = onSetFirstLetterUppercase(inputTitleNoteRef.value) || "Nouvelle note",
        newDetail = textareaDetailNoteRef.value,
        newColor = currentNoteColorSelected,
        newCreatedAt = null,
        newDisplayOrder = 0;


    // Ne set la date de création que lors d'une création et non lors d'une modification
    if (noteEditorMode === "creation") {
        newCreatedAt = new Date().toISOString();
    }else {
        newCreatedAt = allUserNotesArray[currentEditorNoteKey].createdAt;
    };

    //retour
    const formatedNote = {
        title : newTitle,
        detail: newDetail, 
        color: newColor,
        createdAt: newCreatedAt,
        displayOrder: newDisplayOrder
    }

    return formatedNote;
}





//* *   *   *   *   *   *   * SUPPRESSION   *   *   *   *   *   *   *   *   *   *   *

function onAskDeleteNoteRequest() {
    //Demande de confirmation
    addEventForGlobalPopupConfirmation(
        removeEventForGlobalPopupConfirmation,
        () => onConfirmDeleteNote(currentEditorNoteKey),
        "Supprimer cette note ?",
        "delete"
    );
}


async function onConfirmDeleteNote(keyTarget) {

    //Masque le popup
    document.getElementById("divEditNote").style.display = "none";

    //envoie dans la corbeille
    await sendToRecycleBin(keyTarget);

    //retrait de l'array
    delete allUserNotesArray[keyTarget];

    //retrait du tableau de clé
    let indexToRemove = itemNotesSortedKey.indexOf(keyTarget);
    itemNotesSortedKey.splice(indexToRemove,1);

    //retrait du dom
    allInstanceItemNotes[keyTarget].remove();

    //retrait de l'instance
    delete allInstanceItemNotes[keyTarget];
}






// Quitte le menu
function onClickReturnFromNotes() {
    //reset des éléments
    let divParentRef = document.getElementById("divNotesList");
    divParentRef.innerHTML = "";

    let divParentEndNoteRef = document.getElementById("divNotesEndList");
    divParentEndNoteRef.innerHTML = "";


    //vide les références pour l'éditeur de note
    inputTitleNoteRef = null;
    textareaDetailNoteRef = null;
    divNoteEditorContentRef = null;

    //retire les ecoute d'évènement
    onRemoveEventListenerInRegistry(["noteItemEditor"]);

    //Quitte le menu selon via quel menu d'origine il a été appelé

    if (isNotesOpenFromMain) {
        //appelé depuis le menu principal
        onLeaveMenu("NotesFromMain");
    }else{
        //appelé depuis le menu séance
        onLeaveMenu("NotesFromSession");
    }

    
}