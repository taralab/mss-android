let maxSessionNotes = 40,
    isNotesOpenFromMain = false;//pour savoir si ce menu est appelé depuis le me principal ou depuis Séance


function onOpenMenuNotes(isFromMain){
    isNotesOpenFromMain = isFromMain;//si ouvert depuis Main ou Séance


    //Création du menu principal
    onCreateMainMenuNotes();
}


   // Génération du menu principal
function onCreateMainMenuNotes() {
    // Vide le précedent contenut
    let divMainMenuParentRef = document.getElementById("divMainBtnMenu");
    divMainMenuParentRef.innerHTML = "";

    //crée les boutons
    //Retour
    new Button_main_menu(btnMainMenuData.return.imgRef,btnMainMenuData.return.text,() => onClickReturnFromNotes());

}



function onDisplayNotesList() {
    
}




// Quitte le menu


function onClickReturnFromNotes() {
    //reset des éléments



    //Quitte le menu selon via quel menu d'origine il a été appelé

    if (isNotesOpenFromMain) {
        //appelé depuis le menu principal
        onLeaveMenu("NotesFromMain");
    }else{
        //appelé depuis le menu séance
        onLeaveMenu("NotesFromSession");
    }

    
}