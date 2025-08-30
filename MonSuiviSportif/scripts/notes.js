let maxNotes = 5,
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
noteInstanceButtonAddNew = null;





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
        this.container.id = `divItemNoteContainer_${this.id}`;


        //fait rendu html
        this.render();

        //insertion dans le parent
        this.parentRef.appendChild(this.container);

        //référencement
        this.reference();
        
        //la couleur
        this.onSetColor(this.color);

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
        console.log("le parent :" , this.parentRef);
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

    

    bindEvent(){
        //ajoute l'ecouteur d'évènement pour le onclick display mode
        const onClickEdit = () => this.onClickEditNotes(this.key);
        this.container.addEventListener("click", onClickEdit);
    }


    onClickEditNotes(keyNotes){
        alert("contact");

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
                console.error("erreur onSet Color",newColor);
                    break;
        }
        this.container.classList.add(colorClassToAdd);

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
                    color: doc.color 
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
        new itemNotes(key,allUserNotesArray[key].title,allUserNotesArray[key].detail,divParentRef,allUserNotesArray[key].color);
    });    

}




//Ajout d'une nouvelle note
//lorsque j'ajoute une nouvelle note, un id est généré et stocké dans le tableau des key
//La note ne sera dans la base et dans l'array que lorsque je l'aurai enregistré
function onClickAddNewNote() {


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