//=============================== General==============================
// ====================================================================

   
   

//=============================== Tableau de bords ====================
// ====================================================================





function onOpenMenuObjectifDashboard() {
    



    // Génération du menu principal
    onCreateMainMenuObjectifDashbaord();
}



//Création du menu principal
function onCreateMainMenuObjectifDashbaord() {
    // Vide le précedent contenu
    let divMainMenuParentRef = document.getElementById("divMainBtnMenu");
    divMainMenuParentRef.innerHTML = "";

    //crée les boutons
    //Retour
    new Button_main_menu(btnMainMenuData.return.imgRef,btnMainMenuData.return.text,() => onClickReturnFromObjectifDashbaord());

}





function onLeaveMenuObjectifDashboard() {
    
}







//=============================== Gestion========= ====================
// ====================================================================






function onOpenMenuObjectifGestion() {
    
}

//Création du menu principal
function onCreateMainMenuObjectifGestion() {
    
}




// Quitte le menu
function onLeaveMenuObjectifGestion() {
    
}





//=============================== Editeur =============================
// ====================================================================





function onOpenMenuObjectifEditor() {
    
}




//Création du menu principal
function onCreateMainMenuObjectifEditor() {
    
}

// Quitte le menu
function onLeaveMenuObjectifEditor() {
    
}