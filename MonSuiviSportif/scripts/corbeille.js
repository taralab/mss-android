//contient la liste des éléments supprimé
let corbeilleItemsList = {
    // "id":{type,displayType,name,deletedDate}
    },
    dayBeforeDelete = 30; //nombre de jour avant la suppression





class CorbeilleItem{
    constructor(key,type,displayType,name,deletedDate,parentRef,delayMs = 0,animationEnabled = true) {
        this.key = key;
        this.type = type;
        this.displayType = displayType;
        this.name = name;
        this.deletedDate = this._formatDateDelete(deletedDate);
        this.parentRef = parentRef;
        this.delayMs = delayMs;
        this.animationEnabled = animationEnabled;
        
        this.container = document.createElement("div");
        this.container.classList.add("item-template-container", "corbeille-container");

        //personnalisation de la couleur selon le type
        this.color = this._formatTypeColor(this.type);

        // Animation (si activé)
        if (this.animationEnabled) {
            // Pour l'animation sur le conteneur principal
            this.container.classList.add("item-animate-in-horizontal");
            this.container.style.animationDelay = `${this.delayMs}ms`;


            // evenement pour retirer l'animation après qu'elle soit jouée
            this.container.addEventListener("animationend", () => {
                this.container.classList.remove("item-animate-in-horizontal");
                this.container.style.animationDelay = "";
            }, { once: true });
        }


        //création
        this.render();
        //insertion dans le parent
        this.parentRef.appendChild(this.container);

        //ecouteur d'évènement
        this.addEvent();
    }
    


    render(){
        this.container.innerHTML = `
            <div>
                <p style="color: ${this.color};"><b>${this.displayType}</b></p>
                <p>${this.name}</p>
                <p>Supprimé(e) le : ${this.deletedDate}</p>

                <button id="btnRestaure_${this.key}" class="btn-menu btnFocus">
                    Restaurer
                </button>
            </div>
        `;
    }

    addEvent(){
        let btnRestaureItemRef = this.container.querySelector(`#btnRestaure_${this.key}`);
        btnRestaureItemRef.addEventListener("click", ()=>{
            eventAskForRestauration(this.type,this.key);
        });
    }

    _formatTypeColor(type){

        let color = null;
        switch (type) {
            case "ActivityList":
                color = "#D36868";
                break;
            case "Template":
                color  = "#4EA88A";
                break;
            case "TemplateSession":
                color = "#2B7FBF";
                break;
            case "Notes":
                color = "#bfb32bff";
                break;
            case "Memory":
                color = "#612bbfff";
                break;
            case "Objectif":
                color = "#c52ab5ff";
                break;
            default:
                console.error("type couleur non définit");
                break;
        }
        return color;
    }

    _formatDateDelete(timeStamp){
        const date = new Date(timeStamp);
        const datePart = date.toLocaleDateString("fr-FR"); // → 03/08/2025
        const timePart = date.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit"
        }); // → 14:26

        return `${datePart} à ${timePart}`;
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
                            type : doc.oldItemInfo.type,
                            displayType : "Activité",
                            name : `${activityChoiceArray[doc.name].displayName} du ${doc.date}`,
                            deletedDate : doc.oldItemInfo.deletedDate
                        };
                        break;
                    case "Template":
                        list[doc._id] = {
                            type : doc.oldItemInfo.type,
                            displayType : "Modèle d'activité",
                            name : doc.title,
                            deletedDate : doc.oldItemInfo.deletedDate
                        };
                        break;
                    case "TemplateSession":
                        list[doc._id] = {
                            type : doc.oldItemInfo.type,
                            displayType : "Modèle de séance",
                            name : doc.sessionName,
                            deletedDate : doc.oldItemInfo.deletedDate
                        };
                        break;
                    case "Notes":
                        list[doc._id] = {
                            type : doc.oldItemInfo.type,
                            displayType : "Notes",
                            name : doc.title,
                            deletedDate : doc.oldItemInfo.deletedDate
                        };
                        break;
                    case "Memory":
                        list[doc._id] = {
                            type : doc.oldItemInfo.type,
                            displayType : "Evènement",
                            name : doc.title,
                            deletedDate : doc.oldItemInfo.deletedDate
                        };
                        break;   
                    case "Objectif":
                        list[doc._id] = {
                            type : doc.oldItemInfo.type,
                            displayType : "Objectif",
                            name : doc.title,
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



    //Injection de la ligne de cloture avec le texte d'information
    let divCorbeilleEndListRef = document.getElementById("divCorbeilleEndList");
    divCorbeilleEndListRef.textContent = "";

    let newClotureList = document.createElement("span");
        newClotureList.classList.add("last-container");
        newClotureList.innerHTML = `ℹ️ Un élément est supprimé après ${dayBeforeDelete} jours.`;
        divCorbeilleEndListRef.appendChild(newClotureList);
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

    if (Object.keys(corbeilleItemsList).length > 0) {
            //Insertion des classes
        Object.keys(corbeilleItemsList).forEach((key,index)=>{
            let type = corbeilleItemsList[key].type,
                displayType = corbeilleItemsList[key].displayType,
                name = corbeilleItemsList[key].name,
                deletedDate = corbeilleItemsList[key].deletedDate;

            let delay = index * animCascadeDelay;

            new CorbeilleItem(key,type,displayType,name,deletedDate,parentRef,delay,userSetting.animationEnabled);
        });
    }else{
        parentRef.textContent = "Aucun élément à afficher !";
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






// *    *   *   *       *   *   RESTAURATION *  *   *   *   *   *


async function eventAskForRestauration(itemType,itemKey) {
    
    // Toujours restaurer pour les activité. pour les reste, on vérifie si le max n'est pas atteind
    let restaurationAutorized = false;
    
    if (itemType === "ActivityList") {
        restaurationAutorized = true;
    }else{
        restaurationAutorized = await onCheckIfRestaurationPossible(itemType);
    }

    console.log("autorisation :", restaurationAutorized);

    //si non autoriser, met une notification et stop la séquence
    if (!restaurationAutorized) {
        onShowNotifyPopup("restaurationforbidden");

    }else{
        //si autorisé, lance la restauration
        eventRestaureItem(itemKey);
    }

}


async function onCheckIfRestaurationPossible(itemType) {

//met tous les maxValue à un seul endroit
  const maxValues = {
    Template: maxTemplate,
    TemplateSession: maxTemplateSession,
    Notes: maxNotes,
    Memory: maxMemory
  };


  //récupère les documents et compte ceux dont le type correspondent
  const result = await db.allDocs({ include_docs: true });
  const count = result.rows.filter(r => r.doc.type === itemType).length;

  //retour si oui ou non le max  n'a pas été atteind
  return count < (maxValues[itemType] || 0);
}



async function eventRestaureItem(key) {
    //restaure l'élément
    let itemRestaured = await onRestaureItemFromCorbeille(key);

    //réactualise l'affichage de la corbeille
    eventUpdateCorbeilleList();


    //réactialisation en arrière plan selon le type d'item
    switch (itemRestaured.type) {
        case "ActivityList":
            onActivityWasRestaured(itemRestaured);
            break;
        case "Template":
            //lance la restauration
            onTemplateActivityWasRestaured(itemRestaured);
            break;
        case "TemplateSession":
            //lance la restauration
            onTemplateSessionWasRestaured(itemRestaured);
            break;
        case "Notes":
            onNoteWasRestaured(itemRestaured);
            break;
        case "Memory":
            onMemoryWasRestaured(itemRestaured);
            break;
        default:
            console.log("Erreur de type");
            break;
    }

    onShowNotifyPopup("itemRestaured");

}




async function onRestaureItemFromCorbeille(key) {
    try {

        // 1 - récupère le document dans la base
        let existingDoc = await db.get(key);

        // 2 - Exclure `_id` et `_rev` de activityToUpdate pour éviter qu'ils ne soient écrasés
        const { _id, _rev, ...safeActivityUpdate } = existingDoc;

        // 3 - Changement du type pour remettre l'ancien
        safeActivityUpdate.type = existingDoc.oldItemInfo.type;

        // 4 - Mise à jours du document
        const updatedDoc = {
            ...existingDoc,  // Garde `_id` et `_rev`
            ...safeActivityUpdate // Applique les nouvelles valeurs en évitant d'écraser `_id` et `_rev`
        };

        // 5 - Retrait de oldItemInfo
        delete updatedDoc.oldItemInfo;

        // 6 - Sauvegarde dans la base
        const response = await db.put(updatedDoc);

        if (devMode) console.log("[RESTAURATION] Activité mise à jour :", response);

        return updatedDoc; // Retourne l'objet mis à jour
    } catch (err) {
        console.error("Erreur lors de la mise à jour de l'activité :", err);
        return false; // Indique que la mise à jour a échoué
    }
}

//Spécifique restauration activité
function onActivityWasRestaured(activityRestaured) {
    // met à jour l'array d'objet
    allUserActivityArray[activityRestaured._id] = { ...activityRestaured };

    // re-Generation du trie dynamique
    onGenerateDynamiqueFilter(allUserActivityArray);

    // ré-Actualisation de l'affichage des activités
    eventUpdateActivityList();

}



//Spécifique restauration template session
function onTemplateSessionWasRestaured(templateSessionRestaured) {
    // Modifie également à la variable
    templateSessionsNameList[templateSessionRestaured._id] = {name: templateSessionRestaured.sessionName};

    // Récupère les keys et les tries
    onUpdateAndSortTemplateSessionKey();
            
}


//Spécifique restauration template activité
function onTemplateActivityWasRestaured(templateActivityRestaured) {
    //Modifie la variable
    userTemplateListItems[templateActivityRestaured._id] = { 
        activityName : templateActivityRestaured.activityName,
        title:templateActivityRestaured.title};

    // Actualise le tableau de clé des modèles
    onUpdateTemplateKeys();

    // Remet à jour les éléments concernant le boutton new from template
    onTraiteBtnNewFromTemplateStatus();
}



//spécifique restauration notes
function onNoteWasRestaured(noteRestaured) {
    console.log(noteRestaured);

    //Ajout également la note à l'array
    allUserNotesArray[noteRestaured._id] = noteRestaured;
}


//Spécifique restauration Memory
function onMemoryWasRestaured(itemRestaured){
    //Pour l'instant rien ici
}




// *    *   *   *   *   *   *   SUPPRESSION DEFINITIVE *    *   *   *   *   *   *

async function onCheckItemCorbeilleToDelete() {
    console.log("[CORBEILLE] vérification des éléments à supprimer");
    let docListToDelete = [],
        dateToday = Date.now();
        const limitDaysInMs = dayBeforeDelete * 24 * 60 * 60 * 1000;

    try {
        const result = await db.allDocs({ include_docs: true }); // Récupère tous les documents

        // Filtrer et extraire uniquement les champs nécessaires sous forme de tableau
        result.rows
            .map(row => row.doc)
            .filter(doc => doc.type === "itemDeleted")
            .forEach(doc => {
                //si la date est supérieur à "dayBeforeDelete" 
                if (dateToday - doc.oldItemInfo.deletedDate > limitDaysInMs) {
                    docListToDelete.push(doc);
                }
            });

            //pour chaque document
            for (const doc of docListToDelete){
                //supprime de la base
                await db.remove(doc);
            }

            if (docListToDelete.length > 0) {
                console.log(`[CORBEILLE] ${docListToDelete.length} supprimés automatiquement`);
            }else{
                console.log(`[CORBEILLE] Aucun élément de la corbeille à supprimer`);
            }
            
        return docListToDelete;

    } catch (error) {
        
    }

}






// Quitte le menu corbeille

function onClickReturnFromCorbeille(){

    //vide tous les éléments
    corbeilleItemsList = {};
    document.getElementById("divCorbeilleList").textContent = "";

    onLeaveMenu("Corbeille");
}
    
    
