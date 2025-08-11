


function onOpenMenuSessionNotes(){
    


    //Création du menu principal
    onCreateMainMenuSessionNotes();
}


   // Génération du menu principal
function onCreateMainMenuSessionNotes() {
    // Vide le précedent contenut
    let divMainMenuParentRef = document.getElementById("divMainBtnMenu");
    divMainMenuParentRef.innerHTML = "";

    //crée les boutons
    //Retour
    new Button_main_menu(btnMainMenuData.return.imgRef,btnMainMenuData.return.text,() => onClickReturnFromSessionNotes());

}








// Quitte le menu


function onClickReturnFromSessionNotes() {
    //reset des éléments



    //Quitte le menu
    onLeaveMenu("SessionNotes");
}