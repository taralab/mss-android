//contient la liste des éléments supprimé
let corbeilleItemsList = {
    // "id":{type,name,deletedDate}
    };





class CorbeilleItem{
    constructor(key,type,name,deletedDate,parentRef) {
        this.key = key;
        this.type = type;
        this.name = name;
        this.deletedDate = deletedDate;
        this.parentRef = parentRef;
        
        this.container = document.createElement("div");

        //création
        this.render();
        //insertion dans le parent
        this.parentRef.appendChild(this.container);
    }
    


    render(){
        this.container.innerHTML = `
            <div>
                <p>${this.type}</p>
                <p>${this.name}</p>
            </div>
            <div>
                <p>Supprimé le : ${this.deletedDate}</p>
                <button>
                    Restaurer
                </button>

            </div>
        `;
    }
}



async function onLoadCorbeilleItemsListFromDB() {
    let list = {};// Initialisation,reset

    try {
        const result = await db.allDocs({ include_docs: true }); // Récupère tous les documents

        // Filtrer et extraire uniquement les champs nécessaires sous forme de tableau
        result.rows
            .map(row => row.doc)
            .filter(doc => doc.type === "itemDeleted")
            .forEach(doc => {

                //set selon le type d'élément
                switch (doc.oldItemInfo.type) {
                    case "ActivityList":
                        list[doc._id] = {
                            type : "Activité",
                            name : `${doc.name} du ${doc.date}`,
                            deletedDate : doc.oldItemInfo.deletedDate
                        };
                        break;
                    case "Template":
                        list[doc._id] = {
                            type : "Modèle d'activité",
                            name : doc.title,
                            deletedDate : doc.oldItemInfo.deletedDate
                        };
                        break;
                    case "TemplateSession":
                        list[doc._id] = {
                            type : "Modèle de séance",
                            name : doc.sessionName,
                            deletedDate : doc.oldItemInfo.deletedDate
                        };
                        break;
                
                    default:
                        break;
                }

            });

        if (devMode === true) {
            console.log("[DATABASE] [CORBEILLE] loading corbeilleItemsList :", corbeilleItemsList);
        }

        return list;

    } catch (error) {
        
    }
}






async function onOpenMenuCorbeille() {

    
    //Création menu principal
    onCreateMainMenuCorbeille();

    //actualise l'affichage
    eventUpdateCorbeilleList();
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
   


async function eventUpdateCorbeilleList(){

    //reset les éléments
    corbeilleItemsList = {};
    let parentRef = document.getElementById("divCorbeilleList");
    parentRef.textContent = "";

    //Récupère les éléments dans la base
    corbeilleItemsList = await onLoadCorbeilleItemsListFromDB();
    isCorbeilleItemsLoadedFromBase = true;
    if (devMode === true){console.log("1er chargement de la corbeille depuis la base")};  

    //Insertion des classes
    Object.keys(corbeilleItemsList).forEach(key=>{
        let type = corbeilleItemsList[key].type,
            name = corbeilleItemsList[key].name,
            deletedDate = corbeilleItemsList[key].deletedDate;
        new CorbeilleItem(key,type,name,deletedDate,parentRef)
    });
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
    
    
