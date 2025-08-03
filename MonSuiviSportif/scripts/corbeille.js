function onOpenMenuCorbeille() {

    //Création menu principal
    onCreateMainMenuCorbeille();
}

// Génération du menu principal
function onCreateMainMenuCorbeille() {
    // Vide le précedent contenut
    let divMainMenuParentRef = document.getElementById("divMainBtnMenu");
    divMainMenuParentRef.innerHTML = "";

    //crée les boutons
    //Retour
    new Button_main_menu(btnMainMenuData.return.imgRef,btnMainMenuData.return.text,() => onClickReturnFromCorbeille());
}
   

// Suppression template
async function deleteActivity(activityKey) {
    try {
        // Récupérer le document à supprimer
        let docToDelete = await db.get(activityKey);

        // Supprimer le document
        await db.remove(docToDelete);

        if (devMode === true ) {console.log("[ACTIVITY] Activité supprimée :", activityKey);};

        return true; // Indique que la suppression s'est bien passée
    } catch (err) {
        console.error("[ACTIVITY] Erreur lors de la suppression de l'activité :", err);
        return false; // Indique une erreur
    }
}




// Envoie vers la corbeille
async function sendToRecycleBin(key) {
    try {

        // 1 - récupère le document dans la base
        let existingDoc = await db.get(key);

        // 2 - Exclure `_id` et `_rev` de activityToUpdate pour éviter qu'ils ne soient écrasés
        const { _id, _rev, ...safeActivityUpdate } = existingDoc;

        // 3 - Ajout de l'objet qui contient les éléments pour la restauration/suppression définitive
        let oldItemInfo = {};
        oldItemInfo.type = existingDoc.type;
        oldItemInfo.deletedDate = Date.now();

        safeActivityUpdate.oldItemInfo = oldItemInfo;

        // 4 - Changement du type
        safeActivityUpdate.type = "itemDeleted";


        // 5 - Mise à jours du document
        const updatedDoc = {
            ...existingDoc,  // Garde `_id` et `_rev`
            ...safeActivityUpdate // Applique les nouvelles valeurs en évitant d'écraser `_id` et `_rev`
        };

        // 6 - Sauvegarde dans la base
        const response = await db.put(updatedDoc);

        if (devMode) console.log("[ACTIVITY] Activité mise à jour :", response);

        return updatedDoc; // Retourne l'objet mis à jour
    } catch (err) {
        console.error("Erreur lors de la mise à jour de l'activité :", err);
        return false; // Indique que la mise à jour a échoué
    }
}







// Quitte le menu corbeille

function onClickReturnFromCorbeille(){
    onLeaveMenu("Corbeille");
}
    
    
