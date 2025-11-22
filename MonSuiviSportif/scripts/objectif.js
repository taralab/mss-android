//=============================== General==============================
// ====================================================================

let objectifUserList = {
        objectif_0 : {
            title : "C-A-P_COUNT_MONTH",
            activity : "C-A-P",
            dataType : "COUNT",
            rythmeType : "MONTH",
            isEnabled: false,
            targetValue : 50
        },
        objectif_1 : {
            title : "ETIREMENT_DURATION_WEEK",
            activity : "ETIREMENT",
            dataType : "DURATION",
            rythmeType : "WEEK",
            isEnabled: true,
            targetValue : 125
        },
        objectif_2 : {
            title : "NATATION_DISTANCE_MONTH",
            activity : "NATATION",
            dataType : "DISTANCE",
            rythmeType : "MONTH",
            isEnabled: true,
            targetValue : 4
        },
    },
    objectifUserKeysList = [],
    maxObjectif = 20;







// exemple pour controler doublon dans la liste des objectifs
// if (objectifUserList[title]) {
//     console.error("Doublon détecté !");
//     return false;
// }

//=============================== Tableau de bords ====================
// ====================================================================





function onOpenMenuObjectifDashboard() {
    
    // Affiche la liste
    onDisplayDashboardItemsList();



    // Génération du menu principal
    onCreateMainMenuObjectifDashbaord();
}



function onDisplayDashboardItemsList() {

    // traitement hebdo

    // Référence le parent et le vide
    let weekParentRef = document.getElementById("divDashboardListAreaWeek");
    weekParentRef.innerHTML = "";

    // Extrait les key nécessaires
    let weekObjectifKeys = getObjectifEnabledKeys("WEEK");

    console.log(weekObjectifKeys);
    if (weekObjectifKeys.length > 0) {
        // Pour chaque key hebdo "activé" 
        weekObjectifKeys.forEach(key=>{
            let item = objectifUserList[key];
            // Converti les data
            let convertedData = onConvertObjectifToUserDisplay(item);
            // Génère un item
            new ObjectifDashboardItem(
                convertedData.activity,convertedData.suiviText,
                "15/30",convertedData.imgRef,"50",
                convertedData.color,weekParentRef
            );
        });
    }else{
        weekParentRef.innerHTML = "Aucun objectif hebdomadaire.";
    }





    // Traitement mensuel

    // Référence le parent et le vide
    let monthParentRef = document.getElementById("divDashboardListAreaMonth");
    monthParentRef.innerHTML = "";

    let monthObjectifKeys = getObjectifEnabledKeys("MONTH");
    console.log(monthObjectifKeys);
    if (monthObjectifKeys.length > 0) {
        // Pour chaque key mensuel "activé" 
        monthObjectifKeys.forEach(key=>{
            let item = objectifUserList[key];
            // Converti les data
            let convertedData = onConvertObjectifToUserDisplay(item);
            // Génère un item
            new ObjectifDashboardItem(
                convertedData.activity,convertedData.suiviText,
                "15/30",convertedData.imgRef,"50",
                convertedData.color,monthParentRef
            );
        });
    }else{
        monthParentRef.innerHTML = "Aucun objectif mensuel.";
    }

}




//Création du menu principal
function onCreateMainMenuObjectifDashbaord() {
    // Vide le précedent contenu
    let divMainMenuParentRef = document.getElementById("divMainBtnMenu");
    divMainMenuParentRef.innerHTML = "";

    //crée les boutons
    //Retour
    new Button_main_menu(btnMainMenuData.return.imgRef,btnMainMenuData.return.text,() => onLeaveMenuObjectifDashboard());
    // Menu gestion objectif
    new Button_main_menu(btnMainMenuData.objectif_gestion.imgRef,btnMainMenuData.objectif_gestion.text,() => onClickBtnMenuObjectifGestion());
}



// Récupère les key des objectifs activé selon le type de rythme demandé
function getObjectifEnabledKeys(rythmeType) {
    return Object.keys(objectifUserList).filter(key => {
        const obj = objectifUserList[key];
        return obj.rythmeType === rythmeType && obj.isEnabled === true;
    });
}



// Demande à aller dans le menu gestion
function onClickBtnMenuObjectifGestion(){
    // vide les éléments du dashbaord
    let divIDArray = [
        "divDashboardListAreaWeek",
        "divDashboardListAreaMonth"
    ];
    divIDArray.forEach(id=>{
        document.getElementById(id).innerHTML = "";
    });

    // Demande le changement de menu
    onChangeMenu("Objectif_Gestion");

}


// Quitte le menu pour retourner dans le main menu
function onLeaveMenuObjectifDashboard() {
    

    onLeaveMenu("Objectif_Dashboard");
}







//=============================== Gestion========= ====================
// ====================================================================






function onOpenMenuObjectifGestion() {
    
    onDisplayObjectifList();



    // Génération du menu principal
    onCreateMainMenuObjectifGestion();
}

//Création du menu principal
function onCreateMainMenuObjectifGestion() {
       // Vide le précedent contenu
    let divMainMenuParentRef = document.getElementById("divMainBtnMenu");
    divMainMenuParentRef.innerHTML = "";

    //crée les boutons
    //Retour
    new Button_main_menu(btnMainMenuData.return.imgRef,btnMainMenuData.return.text,() => onLeaveMenuObjectifGestion());
}




// Genère la liste

function onDisplayObjectifList() {

    // Référence le parent et le vide
    let parentRef = document.getElementById("divObjectifGestionList");
    parentRef.innerHTML = "";

    // Récupère les keys
    objectifUserKeysList = Object.keys(objectifUserList);

    console.log(objectifUserKeysList.length);

    // Traitement selon présence d'élément ou pas

    if (objectifUserKeysList.length > 0) {
        //boucle sur les keys pour générer la liste
            // Pour chaque key
        objectifUserKeysList.forEach(key=>{

            let item = objectifUserList[key];
            
            const itemConvertedText = onConvertObjectifToUserDisplay(item);

            console.log(itemConvertedText);

            //genère une instance
            new ObjectifListItem(key,itemConvertedText.activity,itemConvertedText.suiviText,item.isEnabled,itemConvertedText.imgRef,parentRef);
        });
    }else{
        parentRef.innerHTML = "Nous n'avez pas encore défini d'objectif.";
    }


    // Zone End list

    // Référence le parent et le vide
    let endListParentRef = document.getElementById("divObjectifListEndList");
    endListParentRef.innerHTML = "";


    // Gestion du bouton "ajouter un suivi"
    let isMaxObjectifReached = objectifUserKeysList.length >= maxObjectif;
    new Button_add("Ajouter un objectif", () => onClickAddNewSuivi(), isMaxObjectifReached, endListParentRef);

    //Création du texte fin de liste
    let newClotureList = document.createElement("span");
        newClotureList.classList.add("last-container");
        newClotureList.innerHTML = `Créez jusqu'à ${maxObjectif} types d'objectif.`;
    endListParentRef.appendChild(newClotureList);



}

// Converti les données en une information visuelle
function onConvertObjectifToUserDisplay(dataToConvert) {
    
    // Pour le nom de l'activité
    let convertedData = {};
    convertedData.activity = activityChoiceArray[dataToConvert.activity].displayName;

    //pour type de suivi

    let textDataType = ""; 
    switch (dataToConvert.dataType) {
        case "COUNT":
            textDataType = "séances";
            break;
        case "DISTANCE":
            textDataType = "km";
            break;
        case "DURATION":
            textDataType = "h";
            break;
    
        default:
            break;
    };

    // Pour le rythme de suivi
    let textRythmeType ="";
    switch (dataToConvert.rythmeType) {
        case "WEEK":
            textRythmeType = "semaine";
            break;
        case "MONTH":
            textRythmeType = "mois";
            break;
    
        default:
            break;
    }

    convertedData.suiviText = `${dataToConvert.targetValue} ${textDataType} / ${textRythmeType}`;

    // La référence de l'image
    convertedData.imgRef = activityChoiceArray[dataToConvert.activity].imgRef;


    // La couleur de la catégorie
    convertedData.color = activityColorList[activityChoiceArray[dataToConvert.activity].categoryColor];

    return convertedData;
}



// Lorsque l'utilisateur change le status d'un objectif depuis la liste
function onUpdateObjectifEnableStatus(idTarget,newEnabledStatus) {
    // Sauvegarde du nouvel état dans l'array
    objectifUserList[idTarget].isEnabled = newEnabledStatus;
    console.log(objectifUserList);

    // Sauvegarde en base
}



// Quitte le menu pour retourner dans le dashbaord
function onLeaveMenuObjectifGestion() {
    //  vide ce menu
    let divToEmpty = [
        "divObjectifGestionList",
        "divObjectifListEndList"
    ];
    divToEmpty.forEach(id=>{
        document.getElementById(id).innerHTML = "";
    });

    // Demande à retourner dans le dashbaord
    onLeaveMenu("Objectif_Gestion");

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