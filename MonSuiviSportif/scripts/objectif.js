//=============================== General==============================
// ====================================================================

let objectifUserList = {
        // objectif_0 : {
        //     title : "C-A-P_MONTH_COUNT",
        //     activity : "C-A-P",
        //     dataType : "COUNT",
        //     rythmeType : "MONTH",
        //     isEnabled: true,
        //     targetValue : 0
        // }
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
                `${result.remainingCount}`,convertedData.imgRef,result.percentValue,
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
                `${result.remainingCount}`,convertedData.imgRef,result.percentValue,
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

    // Nombre restant
    result.remainingCount = targetValue - result.totalCount;

    // Mettre en place la convertion ici sinon met OK si objectif atteind

    if (result.remainingCount <= 0) {
        result.remainingCount = "OK";
    }else{
        switch (dataType) {
            case "COUNT":
                // Aucun traitement parculier pour le moment pour COUNT
                result.unit = "Restant";
                break;
            case "DURATION":
                let timeResult = onConvertSecondesToHours(result.remainingCount);
                result.remainingCount = `${timeResult.heures}h${timeResult.minutes}`;
                result.unit = "Restant";
                break;

            case "DISTANCE":
                // Arrondit à deux chiffre après la virgule et n'affiche jamais le dernier zero si présent
                result.remainingCount = parseFloat(result.remainingCount.toFixed(2));

                result.unit = "Restant";//Pour afficher 'km' dans le rond
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
    new Button_add("Ajouter un objectif", () => onClickAddNewObjectif(), isMaxObjectifReached, endListParentRef);

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



// Vide tous le menu gestion
function onResetMenuObjectifGestion() {
    let divToEmpty = [
        "divObjectifGestionList",
        "divObjectifListEndList"
    ];
    divToEmpty.forEach(id=>{
        document.getElementById(id).innerHTML = "";
    });
}



// Quitte le menu pour retourner dans le dashbaord
function onLeaveMenuObjectifGestion() {
    //  vide ce menu
    onResetMenuObjectifGestion();

    // Demande à retourner dans le dashbaord ou dans l'éditeur
    onLeaveMenu("Objectif_Gestion");

}


// Demande à partir dans le menu editeur
function onClickAddNewObjectif(){
    //  vide ce menu
    onResetMenuObjectifGestion();

    onChangeMenu("Objectif_Editor");
    
}






//=============================== Editeur =============================
// ====================================================================



// Insertion nouvelle objectif (ID auto, )
async function onInsertNewObjectifInDB(objectifToInsert) {
    try {
        const newObjectif = {
            type: objectifStoreName,
            ...objectifToInsert
        };

        // Utilisation de post() pour génération automatique de l’ID
        const response = await db.post(newObjectif);

        // Mise à jour de l’objet avec _id et _rev retournés
        newObjectif._id = response.id;
        newObjectif._rev = response.rev;

        if (devMode === true) {
            console.log("[DATABASE] [OBJECTIF] Objectif insérée :", newObjectif);
        }

        return newObjectif;
    } catch (err) {
        console.error("[DATABASE] [OBJECTIF] Erreur lors de l'insertion de l'objectif :", err);
    }
}


// Fonction pour récupérer les objectif depuis la base
async function onLoadObjectifFromDB() {
    objectifUserList = {}
    try {
        const result = await db.allDocs({ include_docs: true }); // Récupère tous les documents

        // Filtrer et extraire uniquement les champs nécessaires
        result.rows
            .map(row => row.doc)
            .filter(doc => doc.type === objectifStoreName)
            .forEach(doc => {
                objectifUserList[doc._id] = doc;
            });
        
        if (devMode === true) {
            console.log("[DATABASE] [OBJECTIF] Loading objectifUserList :", objectifUserList);
            const firstKey = Object.keys(objectifUserList)[0];
            console.log(objectifUserList[firstKey]);
        }
    } catch (err) {
        console.error("[DATABASE] [OBJECTIF] Erreur lors du chargement:", err);
    }
}


let selectObjectifEditorTypeRef = null,
    selectObjectifEditorRythmeRef = null,
    inputObjectifEditorCountRef = null,
    inputObjectifEditorDistanceRef = null,
    inputObjectifEditorDurationHourRef = null,
    inputObjectifEditorDurationMinuteRef = null,
    divObjectifEditorDynamicAreaCountRef = null,
    divObjectifEditorDynamicAreaDistanceRef = null,
    divObjectifEditorDynamicAreaDurationRef = null,
    imgEditorObjectifActivityPreviewRef = null,
    selectorObjectifCategoryChoiceRef = null,
    inputObjectifEditorCheckBoxRef = null;



function onOpenMenuObjectifEditor() {

    // Demande la création du main menu
    onCreateMainMenuObjectifEditor();

    // Lance le référencement
    onAddReferenceForObjectifEditor();

    // Reset les éléments pour afficher
    onInitObjectifEditor();

    // Ajout les écouteurs d'évènement
    onAddEventListenerForObjectifEditor();


    // Génère la liste d'activité pour les objectif dans le fake selector
    onGenerateActivityOptionChoice("selectorObjectifCategoryChoice");
    onGenerateFakeOptionList("divFakeSelectOptList");
}



// Referencement

function onAddReferenceForObjectifEditor() {
    selectObjectifEditorTypeRef = document.getElementById("selectObjectifEditorType");
    selectObjectifEditorRythmeRef = document.getElementById("selectObjectifEditorRythme");
    inputObjectifEditorCountRef = document.getElementById("inputObjectifEditorCount");
    inputObjectifEditorDistanceRef = document.getElementById("inputObjectifEditorDistance");
    inputObjectifEditorDurationHourRef = document.getElementById("inputObjectifEditorDurationHour");
    inputObjectifEditorDurationMinuteRef = document.getElementById("inputObjectifEditorDurationMinute");
    divObjectifEditorDynamicAreaCountRef = document.getElementById("divObjectifEditorDynamicAreaCount");
    divObjectifEditorDynamicAreaDistanceRef = document.getElementById("divObjectifEditorDynamicAreaDistance");
    divObjectifEditorDynamicAreaDurationRef = document.getElementById("divObjectifEditorDynamicAreaDuration");
    imgEditorObjectifActivityPreviewRef = document.getElementById("imgEditorActivityPreview");
    selectorObjectifCategoryChoiceRef = document.getElementById("selectorObjectifCategoryChoice");
    inputObjectifEditorCheckBoxRef = document.getElementById("inputObjectifEditorCheckBox");
}


// Ecoute d'évènement 

function onAddEventListenerForObjectifEditor() {
    if (devMode === true){
        console.log("[OBJECTIF EDITOR] [EVENT-LISTENER] : Ajout les évènements pour l'éditeur d'objectif");
    };


    // FakeSelector
    let fakeSelectRef = document.getElementById("divBtnFakeSelectorActivityObjectif");
    const onClickObjectifChoice = () => onClickFakeSelect('objectifEditor');
    fakeSelectRef.addEventListener("click",onClickObjectifChoice);
    onAddEventListenerInRegistry("objectifEditor",fakeSelectRef,"click",onClickObjectifChoice);


    // Le selecteur pour changer le type d'item
    let selectItemObjectifTypeRef = document.getElementById("selectObjectifEditorType");
    const onSelectItemObjectifType = (event) => onChangeObjectifEditorType(event.target.value);
    selectItemObjectifTypeRef.addEventListener("change",onSelectItemObjectifType);
    onAddEventListenerInRegistry("objectifEditor",selectItemObjectifTypeRef,"change",onSelectItemObjectifType);



    // les input pour la DURATION
    let inputDurationIDs = [
        "inputObjectifEditorDurationHour",
        "inputObjectifEditorDurationMinute"
    ];

    inputDurationIDs.forEach(input=>{
        let inputRef = document.getElementById(input);
        // onInput
        let maxDuration = parseInt(inputRef.max);
        const onInputItem = (event)=> formatNumberInput(event.target, maxDuration, 2);
        inputRef.addEventListener("input",onInputItem);
        onAddEventListenerInRegistry("objectifEditor",inputRef,"input",onInputItem);

        //onFocus
        const onFocus = (event) => selectAllText(event.target);
        inputRef.addEventListener("focus",onFocus);
        onAddEventListenerInRegistry("objectifEditor",inputRef,"focus",onFocus);

        //onBlur
        const onBlur = (event) => formatNumberInput(event.target, maxDuration, 2);
        inputRef.addEventListener("blur",onBlur);
        onAddEventListenerInRegistry("objectifEditor",inputRef,"blur",onBlur);

        //onContextMenu
        const onContextMenu = (event) => disableContextMenu(event);
        inputRef.addEventListener("contextmenu",onContextMenu);
        onAddEventListenerInRegistry("objectifEditor",inputRef,"contextmenu",onContextMenu);

    });

}



//Création du menu principal
function onCreateMainMenuObjectifEditor() {
    // Vide le précedent contenu
    let divMainMenuParentRef = document.getElementById("divMainBtnMenu");
    divMainMenuParentRef.innerHTML = "";

    //crée les boutons
    //Retour
    new Button_main_menu(btnMainMenuData.return.imgRef,btnMainMenuData.return.text,() => onLeaveMenuObjectifEditor());

    //Valider
    new Button_main_menu_Valider("Valider",() => onClickSaveFromObjectifEditor());
}




// Function Reset les éléments pour objectif editor
function onInitObjectifEditor() {
    selectObjectifEditorTypeRef.value = "COUNT";
    selectObjectifEditorRythmeRef.value = "WEEK";
    inputObjectifEditorCountRef.value = "";
    inputObjectifEditorDistanceRef.value = "";
    inputObjectifEditorDurationHourRef.value = "00";
    inputObjectifEditorDurationMinuteRef.value = "00";
    inputObjectifEditorCheckBoxRef.checked =  "true";

    // Pour l'affichage de la zone dynamique
    divObjectifEditorDynamicAreaCountRef.style.display = "block";
    divObjectifEditorDynamicAreaDistanceRef.style.display = "none";
    divObjectifEditorDynamicAreaDurationRef.style.display = "none";
    imgEditorObjectifActivityPreviewRef.src = userFavoris.length > 0 ? activityChoiceArray[userFavoris[0]].imgRef  : activityChoiceArray["C-A-P"].imgRef;
}




// Changement de type d'élément pour objectif dans l'éditeur
function onChangeObjectifEditorType(itemType) {
    // 1. Masque les 3 zones dynamiques
    let objectifTypecAreaIDs = {
        COUNT : divObjectifEditorDynamicAreaCountRef,
        DISTANCE : divObjectifEditorDynamicAreaDistanceRef,
        DURATION : divObjectifEditorDynamicAreaDurationRef
    };
    let dynamicTypeAreaKeys = Object.keys(objectifTypecAreaIDs);
    dynamicTypeAreaKeys.forEach(key=>{
        objectifTypecAreaIDs[key].style.display = "none";
    });
        

    // 2. Affiche la zone demandée
    objectifTypecAreaIDs[itemType].style.display = "block";
}


// Pour changer la prévisualisation de l'activité sélectionné
function onChangeObjectifPreview(activityName){
    if (devMode === true){console.log(activityName);};
    imgTemplateEditorPreviewRef.src = activityChoiceArray[activityName].imgRef;
};





// procédure sauvegarde d'un nouvel objectif
async function onClickSaveFromObjectifEditor() {
    // Generation du titre et control de doublon

    // construite le titre unique
    let activityName = selectorObjectifCategoryChoiceRef.value,
        rythme = selectObjectifEditorRythmeRef.value,
        dataType = selectObjectifEditorTypeRef.value;
    
    let objectifTitle = `${activityName}_${rythme}_${dataType}`;

    let isDoublon = onCheckObjectifDoublon(objectifTitle);

    if (isDoublon) {
        alert("Vous suivez déjà ces éléments ! ");
        return
    }

    // Recupère la target value et control champ obligatoire
    let objectifTargetValue = onFormatObjectifValue(dataType);


    console.log(objectifTargetValue);
    if (objectifTargetValue <= 0) {
        alert("Veuillez remplir une valeur ! ");
        return
    }


    let isSuiviEnabled = inputObjectifEditorCheckBoxRef.checked;

    // Formatage finale
    let objectifFormatedToSave = {
        title : objectifTitle,
        activity : activityName,
        dataType : dataType,
        rythmeType : rythme,
        isEnabled: isSuiviEnabled,
        targetValue : objectifTargetValue
    };

    console.log("Data to save : ", objectifFormatedToSave);


    // Sauvegarde en base
    let newObjectifToAdd = await onInsertNewObjectifInDB(objectifFormatedToSave);

    // Ajout en array
    objectifUserList[newObjectifToAdd._id] = newObjectifToAdd;

    // Ferme le menu
    onLeaveMenuObjectifEditor();

    // Popup notification
    onShowNotifyPopup("objectifCreated");
}





// Recherche de doublon dans les objectifs sur les titres
function onCheckObjectifDoublon(titleToCheck) {
    return Object.values(objectifUserList).some(obj => obj.title === titleToCheck);
}




function onFormatObjectifValue(dataType){
    // Selon le type, récupère les éléments

    let targetCount = 0;

    switch (dataType) {
        case "COUNT":
            targetCount = parseInt(inputObjectifEditorCountRef.value) || 0;
            break;
        case "DURATION":
            let hoursToSecond = parseInt(inputObjectifEditorDurationHourRef.value) * 3600 || 0,
                minutesToSecond = parseInt(inputObjectifEditorDurationMinuteRef.value) * 60 || 0;
            targetCount = hoursToSecond + minutesToSecond;
            break;

        case "DISTANCE":
            targetCount = inputObjectifEditorDistanceRef.value || 0;
            break;
    
        default:
            break;
    }

    return targetCount;

}





// Enlève les références pour objectif editor
function onClearReferenceForObjectifEditor() {

    // Vide la liste d'option dans le selecteur d'activité
    selectorObjectifCategoryChoiceRef.innerHTML = "";

    // Vide les références
    selectObjectifEditorTypeRef = null;
    selectObjectifEditorRythmeRef = null;
    inputObjectifEditorCountRef = null;
    inputObjectifEditorDistanceRef = null;
    inputObjectifEditorDurationHourRef = null;
    inputObjectifEditorDurationMinuteRef = null;
    divObjectifEditorDynamicAreaCountRef = null;
    divObjectifEditorDynamicAreaDistanceRef = null;
    divObjectifEditorDynamicAreaDurationRef = null;
    selectorObjectifCategoryChoiceRef = null;
    inputObjectifEditorCheckBoxRef = null;
}


// Quitte le menu
function onLeaveMenuObjectifEditor() {
    // vide les éléments
    onClearReferenceForObjectifEditor();


    // Demande à quitter le menu
    onLeaveMenu("Objectif_Editor");
}