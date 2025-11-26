//=============================== General==============================
// ====================================================================

let objectifUserList = {
        objectif_0 : {
            title : "C-A-P_COUNT_MONTH",
            activity : "C-A-P",
            dataType : "COUNT",
            rythmeType : "MONTH",
            isEnabled: false,
            targetValue : 10
        },
        objectif_1 : {
            title : "ETIREMENT_COUNT_WEEK",
            activity : "ETIREMENT",
            dataType : "COUNT",
            rythmeType : "WEEK",
            isEnabled: true,
            targetValue : 5
        },
        objectif_2 : {
            title : "NATATION_COUNT_WEEK",
            activity : "NATATION",
            dataType : "COUNT",
            rythmeType : "WEEK",
            isEnabled: true,
            targetValue : 1
        },
        objectif_3 : {
            title : "MUSCULATION_COUNT_MONTH",
            activity : "MUSCULATION",
            dataType : "COUNT",
            rythmeType : "MONTH",
            isEnabled: true,
            targetValue : 15
        },
        objectif_4 : {
            title : "GYMNASTIQUE_DURATION_WEEK",
            activity : "GYMNASTIQUE",
            dataType : "DURATION",
            rythmeType : "WEEK",
            isEnabled: false,
            targetValue : 3600
        },
        objectif_5 : {
            title : "NATATION_DISTANCE_WEEK",
            activity : "NATATION",
            dataType : "DISTANCE",
            rythmeType : "WEEK",
            isEnabled: false,
            targetValue : 4
        },
        objectif_6 : {
            title : "MARCHE-RANDO_DISTANCE_WEEK",
            activity : "MARCHE-RANDO",
            dataType : "DISTANCE",
            rythmeType : "WEEK",
            isEnabled: true,
            targetValue : 20
        },
        objectif_7 : {
            title : "VELO_COUNT_WEEK",
            activity : "VELO",
            dataType : "COUNT",
            rythmeType : "WEEK",
            isEnabled: true,
            targetValue : 2
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

    // Récupère le mois en cours
    let currentMonthRange = getCurrentMonthRange();

    // traitement hebdo

    let kpiWeekDoneArray = [];

    // Référence le parent et le vide
    let weekParentRef = document.getElementById("divDashboardListAreaWeek");
    weekParentRef.innerHTML = "";

    // Extrait les key nécessaires
    let weekObjectifKeys = getObjectifEnabledKeys("WEEK");
    // Et les tries
    weekObjectifKeys.sort(getObjectifSortedKey(objectifUserList));

    if (weekObjectifKeys.length > 0) {
        // Pour chaque key hebdo "activé" 
        weekObjectifKeys.forEach(key=>{
            let item = objectifUserList[key];
            // Converti les data
            let convertedData = onConvertObjectifToUserDisplay(item);

            // Lance le calcul sur les activité concernée
            let result = onTraiteObjectif(item.activity,item.dataType,item.targetValue,currentWeekRange.monday, currentWeekRange.sunday);

            // Génère un item
            new ObjectifDashboardItem(
                convertedData.activity,convertedData.suiviText,
                `${result.totalCount}`,convertedData.imgRef,result.percentValue,
                convertedData.color,result.unit,weekParentRef
            );

            // Stockage pour KPI
            let convertKPIpercent = result.percentValue/100;
            kpiWeekDoneArray.push(convertKPIpercent);

        });
    }else{
        weekParentRef.innerHTML = "Aucun objectif hebdomadaire.";
    }

    // Traitement KPI hebdo
    let weekDayInfo = getKPIWeeklyProgress();
    let weekKPIImage = computeKPIFromRatios(kpiWeekDoneArray, weekDayInfo.daysPassed, weekDayInfo.daysTotal);
    console.log(weekKPIImage);
    // Set l'image du KPI
    let imgKPIWeekRef = document.getElementById("imgKpiWeek");
    imgKPIWeekRef.src = weekKPIImage ? weekKPIImage : "./Icons/MSS_KPI_Gris.webp";

    // Traitement mensuel
    let kpiMonthDoneArray = [];

    // Référence le parent et le vide
    let monthParentRef = document.getElementById("divDashboardListAreaMonth");
    monthParentRef.innerHTML = "";

    // Récupère les keys
    let monthObjectifKeys = getObjectifEnabledKeys("MONTH");
    // et les tries
    monthObjectifKeys.sort(getObjectifSortedKey(objectifUserList));

    if (monthObjectifKeys.length > 0) {
        // Pour chaque key mensuel "activé" 
        monthObjectifKeys.forEach(key=>{
            let item = objectifUserList[key];
            // Converti les data
            let convertedData = onConvertObjectifToUserDisplay(item);

            // Lance le calcul sur les activité concernée
            let result = onTraiteObjectif(item.activity,item.dataType,item.targetValue,currentMonthRange.firstDay, currentMonthRange.lastDay);

            // Génère un item
            new ObjectifDashboardItem(
                convertedData.activity,convertedData.suiviText,
                `${result.totalCount}`,convertedData.imgRef,result.percentValue,
                convertedData.color,result.unit,monthParentRef
            );


            // Stockage pour KPI
            let convertKPIpercent = result.percentValue/100;
            kpiMonthDoneArray.push(convertKPIpercent);
        });
    }else{
        monthParentRef.innerHTML = "Aucun objectif mensuel.";
    }

    // Traitement KPI Mensuel
    let monthDayInfo = getKPIMonthlyProgress();
    let monthKPIImage = computeKPIFromRatios(kpiMonthDoneArray, monthDayInfo.daysPassed, monthDayInfo.daysTotal);
    console.log(monthKPIImage);

    let imgKpiMonthRef = document.getElementById("imgKpiMonth");
    imgKpiMonthRef.src = monthKPIImage ? monthKPIImage : "./Icons/MSS_KPI_Gris.webp";

}


function onTraiteObjectif(activityType,dataType,targetValue,dateRangeStart,dateRangeEnd) {
    console.log(`Traitement pour ${activityType} sur ${dataType}`);

    // Récupère les key des activités concernées (type et dans la fourchette et non planifié)
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


    // Mettre en place la convertion ici sinon met OK si objectif atteind

    if (result.totalCount >= targetValue) {
        result.totalCount = "OK";
    }else{
        switch (dataType) {
            case "COUNT":
                // Aucun traitement parculier pour le moment pour COUNT
                result.unit = "";
                break;
            case "DURATION":
                let timeResult = onConvertSecondesToHours(result.totalCount);
                result.totalCount = `${timeResult.heures}h${timeResult.minutes}`;
                result.unit = "";
                break;

            case "DISTANCE":
                // Arrondit à deux chiffre après la virgule et n'affiche jamais le dernier zero si présent
                result.totalCount = parseFloat(result.totalCount.toFixed(2));

                result.unit = "km";//Pour afficher 'km' dans le rond
                break;
        
            default:
                break;
        }
    }

    return result;
}



// Recherche les key dont les activité correspondent a ce que je recherche
function findActivityKeysByNameAndDateRange(obj, nameTarget, dateRangeStart, dateRangeEnd) {

    const start = new Date(dateRangeStart);
    const end = new Date(dateRangeEnd);

    const matchingKeys = [];

    for (const key in obj) {
        const item = obj[key];

        if (!item || typeof item !== "object") continue;

        const itemDate = new Date(item.date);

        // Récupère les activités concernées, dans le créneaux et non planifiées
        if (item.name === nameTarget && item.isPlanned === false && itemDate >= start && itemDate <= end) {
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







// --------------------------------- KPI ---------------------------------------------






const KPI_IMAGES = [
    { min: 1.20, image: "./Icons/MSS_KPI-vert-fonce.webp" },   // KPI ≥ 1.20
    { min: 1.00, image: "./Icons/MSS_KPI-vert-clair.webp" },  // 1.00 ≤ KPI < 1.20
    { min: 0.80, image: "./Icons/MSS_KPI-jaune.webp" }, // 0.80 ≤ KPI < 1.00
    { min: 0.60, image: "./Icons/MSS_KPI-orange.webp" },           // 0.60 ≤ KPI < 0.80
    { min: 0.00, image: "./Icons/MSS_KPI-rouge.webp" }        // KPI < 0.60
];



// Calcul le KPI
function computeKPIFromRatios(ratios, daysPassed, daysTotal) {
    if (!ratios.length) return null;

    // 1. Moyenne = score global
    const scoreGlobal = ratios.reduce((a, b) => a + b, 0) / ratios.length;

    // 2. Ratio du temps
    const ratioTime = daysPassed / daysTotal;

    // 3. KPI final
    const kpi = scoreGlobal / ratioTime;

    // 4. Trouver l’image correspondant au KPI
    const item = KPI_IMAGES.find(level => kpi >= level.min);

    return item ? item.image : null;
}


// Combien de jours depuis le début de semaine et total de jours
function getKPIWeeklyProgress(date = new Date()) {
  // 0 = dimanche → on le transforme pour que lundi = 0, mardi = 1…
  const dayOfWeek = (date.getDay() + 6) % 7;

  const daysPassed = dayOfWeek + 1;  // ex : lundi = 1, mardi = 2…
  const daysTotal = 7;

  return { daysPassed, daysTotal };
}


// Combien de jours depuis le début du mois et total de jours
function getKPIMonthlyProgress(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const daysPassed = date.getDate(); // 1 → 31
  const daysTotal = new Date(year, month + 1, 0).getDate(); // nb jours du mois

  return { daysPassed, daysTotal };
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

    let textDataType = "",
        convertedTargetValue;
    switch (dataToConvert.dataType) {
        case "COUNT":
            textDataType = "séances";
            convertedTargetValue = dataToConvert.targetValue;
            break;
        case "DISTANCE":
            textDataType = "km";
            convertedTargetValue = dataToConvert.targetValue;
            break;
        case "DURATION":
            textDataType = "";//ici le 'h' est géré dans le formatage des heures
            let tempResult = onConvertSecondesToHours(dataToConvert.targetValue);
            convertedTargetValue = tempResult.minutes === "00" ? `${tempResult.heures}h` : `${tempResult.heures}h${tempResult.minutes}`
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

    convertedData.suiviText = `${convertedTargetValue} ${textDataType} / ${textRythmeType}`;

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