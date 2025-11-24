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
            targetValue : 3600
        },
        objectif_2 : {
            title : "NATATION_DISTANCE_MONTH",
            activity : "NATATION",
            dataType : "DISTANCE",
            rythmeType : "MONTH",
            isEnabled: true,
            targetValue : 4
        },
        objectif_3 : {
            title : "MUSCULATION_COUNT_MONTH",
            activity : "MUSCULATION",
            dataType : "COUNT",
            rythmeType : "MONTH",
            isEnabled: true,
            targetValue : 4
        },
        objectif_4 : {
            title : "GYMNASTIQUE_COUNT_WEEK",
            activity : "GYMNASTIQUE",
            dataType : "COUNT",
            rythmeType : "WEEK",
            isEnabled: true,
            targetValue : 4
        },
        objectif_5 : {
            title : "NATATION_DISTANCE_MONTH",
            activity : "NATATION",
            dataType : "DISTANCE",
            rythmeType : "MONTH",
            isEnabled: false,
            targetValue : 4
        },
        objectif_6 : {
            title : "MARCHE-RANDO_DISTANCE_MONTH",
            activity : "MARCHE-RANDO",
            dataType : "DISTANCE",
            rythmeType : "WEEK",
            isEnabled: false,
            targetValue : 4
        },
        objectif_7 : {
            title : "NATATION_DISTANCE_MONTH",
            activity : "NATATION",
            dataType : "COUNT",
            rythmeType : "MONTH",
            isEnabled: false,
            targetValue : 10
        },
    },
    objectifUserKeysList = [],
    maxObjectif = 20;









//=============================== Tableau de bords ====================
// ====================================================================





function onOpenMenuObjectifDashboard() {
    

    // Set les éléments
    onInitObjectifDashboard();

    // Affiche la liste
    onDisplayDashboardItemsList();

    // Génération du menu principal
    onCreateMainMenuObjectifDashbaord();
}



function onDisplayDashboardItemsList() {

    // Récupère la semaine en cours
    let currentWeekRange = getCurrentWeekRange();
    console.log(currentWeekRange);

    // Récupère le mois en cours
    let currentMonthRange = getCurrentMonthRange();
    console.log(currentMonthRange);

    // traitement hebdo

    // Référence le parent et le vide
    let weekParentRef = document.getElementById("divDashboardListAreaWeek");
    weekParentRef.innerHTML = "";

    // Extrait les key nécessaires
    let weekObjectifKeys = getObjectifEnabledKeys("WEEK");
    // Et les tries
    weekObjectifKeys.sort(getObjectifSortedKey(objectifUserList));

    console.log(weekObjectifKeys);
    if (weekObjectifKeys.length > 0) {
        // Pour chaque key hebdo "activé" 
        weekObjectifKeys.forEach(key=>{
            let item = objectifUserList[key];
            // Converti les data
            let convertedData = onConvertObjectifToUserDisplay(item);

            console.log(item);
            // Lance le calcul sur les activité concernée
            let result = onTraiteObjectif(item.activity,item.dataType,item.targetValue,currentWeekRange.monday, currentWeekRange.sunday);

            // Génère un item
            new ObjectifDashboardItem(
                convertedData.activity,convertedData.suiviText,
                `${result.totalCount}/${item.targetValue}`,convertedData.imgRef,result.percentValue,
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

    // Récupère les keys
    let monthObjectifKeys = getObjectifEnabledKeys("MONTH");
    // et les tries
    monthObjectifKeys.sort(getObjectifSortedKey(objectifUserList));


    console.log(monthObjectifKeys);
    if (monthObjectifKeys.length > 0) {
        // Pour chaque key mensuel "activé" 
        monthObjectifKeys.forEach(key=>{
            let item = objectifUserList[key];
            // Converti les data
            let convertedData = onConvertObjectifToUserDisplay(item);

            // Lance le calcul sur les activité concernée
            let result = onTraiteObjectif(item.activity,item.dataType,item.targetValue,currentMonthRange.firstDay, currentMonthRange.lastDay);

            console.log(result);
            // Génère un item
            new ObjectifDashboardItem(
                convertedData.activity,convertedData.suiviText,
                 `${result.totalCount}/${item.targetValue}`,convertedData.imgRef,result.percentValue,
                convertedData.color,monthParentRef
            );
        });
    }else{
        monthParentRef.innerHTML = "Aucun objectif mensuel.";
    }

}


function onTraiteObjectif(activityType,dataType,targetValue,dateRangeStart,dateRangeEnd) {
    console.log(`Traitement pour ${activityType} sur ${dataType}`);

    // Récupère les key des activités concernées (type et dans la fourchette)
    let activityKeysTarget = findActivityKeysByNameAndDateRange(allUserActivityArray,activityType,dateRangeStart,dateRangeEnd);

    // Lance le calcul selon la data suivit
    let result = {};

    // Pour le nombre total, prend juste le nombre d'élément dans l'array
    if (dataType === "COUNT") {
        result.totalCount = activityKeysTarget.length;
    }else{
        // Pour DURATION et DISTANCE
        result.totalCount = onCalculObjectifActivityCount(activityKeysTarget,allUserActivityArray,dataType);
    }
    
    // Calcul du pourcentage accomplit (mettre 100% max)
    let percent = targetValue === 0 ? 0 : (result.totalCount / targetValue) * 100;
    result.percentValue = Math.min(percent, 100);



    // Mettre en place la convertion iici





    console.log(activityKeysTarget);
    console.log("valeur total : " ,result);
    return result;
}


// Recherche les key dont les activité correspondent a ce que je recherche
function findActivityKeysByNameAndDateRange(obj, nameTarget, dateRangeStart, dateRangeEnd) {
    console.log(`Traitement objectif pour ${nameTarget}, dans les dates ${dateRangeStart} et ${dateRangeEnd}`);

    const start = new Date(dateRangeStart);
    const end = new Date(dateRangeEnd);

    const matchingKeys = [];

    for (const key in obj) {
        const item = obj[key];

        if (!item || typeof item !== "object") continue;

        const itemDate = new Date(item.date);
        console.log(itemDate);

        if (item.name === nameTarget && itemDate >= start && itemDate <= end) {
            matchingKeys.push(key);
        }

    }

  return matchingKeys;
}



// Calcul la somme selon le type de suivi
function onCalculObjectifActivityCount(keys, activityArray, field) {
  let total = 0;

  for (const key of keys) {
    const item = activityArray[key];
    if (!item) continue;

    switch (field) {
      case "DISTANCE":
            total += parseFloat(item.distance);
        break;

      case "DURATION":
            // Convertit "HH:MM:SS" en secondes
            const [h, m, s] = item.duration.split(":").map(Number);
            const seconds = h * 3600 + m * 60 + s;
            total += seconds;
        break;

      default:
        throw new Error("Champ inconnu : utilisez 'distance' ou 'duration'");
    }
  }

  return total;
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



function onInitObjectifDashboard() {
    // Traitement jour restant pour la semaine
    let dayRemaningWeek = getDayRemaningWeek();
    let textWeekRef = document.getElementById("textObjectifDayRemainingWeek");
    textWeekRef.innerHTML = `${dayRemaningWeek} jours restants`;

    // Traitement jours restant pour le mois
    let dayRemainingMonth = getDayRemaningMonth();
    let textMonthRef = document.getElementById("textObjectifDayRemainingMonth");
    textMonthRef.innerHTML = `${dayRemainingMonth} jours restants`;

}


// Combien de jours avant la fin de semaine
function getDayRemaningWeek() {
  const aujourdHui = new Date().getDay(); // 0 = dimanche, 1 = lundi, ... 6 = samedi
  const dimanche = 0;

  // Calcul : distance jusqu'à dimanche, puis +1 car on inclut dimanche
  return ((dimanche - aujourdHui + 7) % 7) + 1;
}

// Combien de jour avant la fin du mois
function getDayRemaningMonth() {
  const now = new Date();
  const annee = now.getFullYear();
  const mois = now.getMonth(); // 0 = janvier

  // Obtenir le dernier jour du mois en créant une date "jour 0" du mois suivant
  const dernierJour = new Date(annee, mois + 1, 0).getDate();

  const aujourdHui = now.getDate();

  return (dernierJour - aujourdHui) + 1;
}


// La fourchette de date du début et fin de semaine
function getCurrentWeekRange() {
  const now = new Date();

  const monday = new Date(now);
  const sunday = new Date(now);

  // Trouve le lundi
  const day = now.getDay(); // 0 = dimanche, 1 = lundi...
  const diffToMonday = (day === 0 ? -6 : 1 - day);
  monday.setDate(now.getDate() + diffToMonday);

  // Fixe à 1h du matin
  monday.setHours(1, 0, 0, 0);

  // Dimanche = lundi + 6 jours
  sunday.setDate(monday.getDate() + 6);

  // Fixe à 23:59:59.999
  sunday.setHours(23, 59, 59, 999);

  return { monday, sunday };
}


// La fourchette de date du début et fin de mois
function getCurrentMonthRange() {
  const now = new Date();

  // Premier jour du mois
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  firstDay.setHours(1, 0, 0, 0);

  // Dernier jour du mois
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  lastDay.setHours(23, 59, 59, 999);

  return { firstDay, lastDay };
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

    // trie les keys sur type d'activité 
    objectifUserKeysList.sort(getObjectifSortedKey(objectifUserList));


    // Traitement selon présence d'élément ou pas

    if (objectifUserKeysList.length > 0) {
        //boucle sur les keys pour générer la liste
            // Pour chaque key
        objectifUserKeysList.forEach(key=>{

            let item = objectifUserList[key];
            
            const itemConvertedText = onConvertObjectifToUserDisplay(item);

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
        newClotureList.innerHTML = `ℹ️ Créez jusqu'à ${maxObjectif} types d'objectif.`;
    endListParentRef.appendChild(newClotureList);



}



// Fonction de trie par type d'activité
function getObjectifSortedKey(list) {
    return (a, b) => {
        if (list[a].activity < list[b].activity) return -1;
        if (list[a].activity > list[b].activity) return 1;

        if (list[a].dataType < list[b].dataType) return -1;
        if (list[a].dataType > list[b].dataType) return 1;

        return 0;
    };
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