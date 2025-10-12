


function onOpenMenuMemory(){
    if (devMode === true){console.log("[MEMORY] Ouverture menu MEMORY");};


    //génération du menu principal
    onCreateMainMenuMemory();

}





function onCreateMainMenuMemory() {
    // Vide le précedent contenut
    let divMainMenuParentRef = document.getElementById("divMainBtnMenu");
    divMainMenuParentRef.innerHTML = "";

    //crée les boutons
    //Retour
    new Button_main_menu(btnMainMenuData.return.imgRef,btnMainMenuData.return.text,() => onClickReturnFromMemory());

    //générer
    new Button_main_menu_Valider("Générer",() => onClickGenerateMemory());

}
   
   


//retour

function onClickReturnFromMemory() {
    



    // ferme le menu
    onLeaveMenu("Memory");
}