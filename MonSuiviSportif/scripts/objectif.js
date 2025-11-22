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
    objectifUserKeysList = [];







// exemple pour controler doublon dans la liste des objectifs
// if (objectifUserList[title]) {
//     console.error("Doublon détecté !");
//     return false;
// }

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
    new Button_main_menu(btnMainMenuData.return.imgRef,btnMainMenuData.return.text,() => onLeaveMenuObjectifDashboard());
    // Menu gestion objectif
    new Button_main_menu(btnMainMenuData.objectif_gestion.imgRef,btnMainMenuData.objectif_gestion.text,() => onClickBtnMenuObjectifGestion());
}




// Demande à aller dans le menu gestion
function onClickBtnMenuObjectifGestion(){
    // vide les éléments du dashbaord


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

    //boucle sur les keys pour générer la liste
    // Pour chaque key
    objectifUserKeysList.forEach(key=>{

        let item = objectifUserList[key];
        
        console.log(item);
        const itemConvertedText = onConvertObjectifToUserDisplay(item);

        console.log(itemConvertedText);


        //genère une instance
        new ObjectifListItem(key,itemConvertedText.activity,itemConvertedText.suiviText,item.isEnabled,itemConvertedText.imgRef,parentRef);
    });
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
            textDataType = "séance(s)";
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

    convertedData.suiviText = `${dataToConvert.targetValue} ${textDataType}/${textRythmeType}`;

    // La référence de l'image
    convertedData.imgRef = activityChoiceArray[dataToConvert.activity].imgRef;

    return convertedData;
}




// Quitte le menu pour retourner dans le dashbaord
function onLeaveMenuObjectifGestion() {
    //  vide ce menu


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