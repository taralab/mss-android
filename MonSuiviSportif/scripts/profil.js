
// Variabilisation
let userInfo = {
    pseudo :"",
    customNotes :"",
    conditionAccepted : false
};

// Référencement
let inputProfilUserPseudoRef,
textareaCustomNotesRef;


// Ouverture du menu profil
function onOpenMenuProfil() {
    // Lance le référencement des items
    onReferenceItemsProfils();

    // set les éléments du profils
    onSetProfilItems();
};



// Fonction de référencement des éléments du menu profil
function onReferenceItemsProfils() {
    inputProfilUserPseudoRef = document.getElementById("inputProfilUserPseudo");
    textareaCustomNotesRef = document.getElementById("textareaCustomNotes");
    if (devMode === true){console.log(" [ PROFIL ] Référence les éléments du profils.");};
};




function onSetProfilItems() {
    if (devMode === true){console.log("[PROFIL] set les éléments du menu profils");};
    inputProfilUserPseudoRef.value = userInfo.pseudo;
    textareaCustomNotesRef.value = userInfo.customNotes;


};







// Clique sur save profil
function onClickSaveProfil() {
    onLockDivDoubleClick(["divBtnProfil","divProfil"]);//Securité double clic

    // Lancement de sauvegarde du nouveau profil uniquement si modifié
   // Création d'une liste de champs à comparer
    const fieldsToCompare = [
        { oldValue: userInfo.pseudo, newValue: inputProfilUserPseudoRef.value },
        { oldValue: userInfo.customNotes, newValue: textareaCustomNotesRef.value}
    ];

    // Vérification si une différence est présente
    // some s'arrete automatiquement si il y a une différence
    const updateDataRequiered = fieldsToCompare.some(field => field.oldValue != field.newValue);

    if (updateDataRequiered) {
        if (devMode) console.log("[PROFIL] Informations de profils différentes : Lancement de l'enregistrement");
        onSaveUserInfo();
    } else {
        if (devMode) console.log("[PROFIL] Aucune modification de profil nécessaire !");
        onLeaveMenu("Profil");
    }
};








// Fonction de sauvegarde du profil dans la bdd
function onSaveUserInfo() {

    // Met tous les éléments des inputs dans la variable userInfo
    userInfo.pseudo = inputProfilUserPseudoRef.value;
    userInfo.customNotes = textareaCustomNotesRef.value;

    // Sauvegarde dans la base
    if (devMode === true){console.log( "[ PROFIL ] sauvegarde des users info dans les cookies.");};
    eventSaveProfil(userInfo);
};



// Sequence de sauvegarde d'un profil
async function eventSaveProfil(profilToSave) {

    //Sauvegarde
    await updateDocumentInDB(profilStoreName, (doc) => {
        doc.data = profilToSave;
        return doc;
    });
    // Met a jour l'affichage de nom de l'utilisateur
    if (devMode === true){console.log("[ PROFIL ] Mise à jours du pseudo de l'utilisateur dans l'application.");};
    document.getElementById("customInfo").innerHTML = userInfo.pseudo;

    // Popup notification
    onShowNotifyPopup("saveprofil");
    // ferme le menu
    onLeaveMenu("Profil");
}








// quitte le menu profil
function onClickReturnFromProfil() {
    // ferme le menu
    onLeaveMenu("Profil");
};