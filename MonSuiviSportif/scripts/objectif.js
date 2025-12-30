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
        //     notification : {
        //        sent : false,
        //        dateSent: "24-12-2025"
        //      }
        // }
    },
    objectifUserKeysList = [],
    maxObjectif = 20,
    currentObjectifModifyID = "",
    objectifItemListInstance = {};

let infoObjectifTextArray = [
    `ℹ️ Activez/Désactivez vos suivis dans le menu gestion.`,
    `ℹ️ Le smiley indique si vous êtes dans le bon rythme.`,
    `ℹ️ Vous pouvez suivre jusqu'à ${maxObjectif} éléments.`,
    `ℹ️ Vous ne suivez plus un éléments temporairement ? Désactivez le.`,
    `ℹ️ Pensez à consulter votre rythme avant vos activités du jour.`
];










//=============================== Tableau de bords ====================
// ====================================================================





function onOpenMenuObjectifDashboard() {
    
    // Génération du menu principal
    onCreateMainMenuObjectifDashbaord();

    //information aléatoire
    onSetObjectifDasboardInfoText();

    // Set les éléments
    onInitKpiElement();

    // Affiche la liste
    onDisplayDashboardItemsList();

    // Lance le traitement du kpi hebdo
    if (Object.keys(weekKpiObject).length > 0) {
        globalWeeklyKPIColor = traitementDuKPI(weekKpiObject,kpiWeekContext.passedDay,kpiWeekContext.totalDay,kpiWeekExemptDay);
        onSetKpiImage(globalWeeklyKPIColor,"imgKpiWeek");
        if (devMode === true) {
            console.log("kpi hebdo : ",globalWeeklyKPIColor);
        }
    }else{
        //si pas d'élément met l'icone grise
        document.getElementById("imgKpiWeek").src = "./Icons/MSS_KPI-GREY.webp";
    }


    if(Object.keys(monthKpiObject).length > 0){
        //lance le traitement du kpi mensuel
        globalMonthlyKPIColor = traitementDuKPI(monthKpiObject,kpiMonthContext.passedDay,kpiMonthContext.totalDay,kpiMonthExemptDay);
        onSetKpiImage(globalMonthlyKPIColor,"imgKpiMonth");
        if (devMode === true) {
            console.log("kpi mensuel : ",globalMonthlyKPIColor);
        }

    }else{
        //si pas d'élément met l'icone grise
        document.getElementById("imgKpiMonth").src = "./Icons/MSS_KPI-GREY.webp";
    }


    // Ajout écouteur evènement pour les boutons du kpi
    onAddEventListenerForKPIDashboard();
}



// Message aleatoire pour le menu objectif dashboard
function onSetObjectifDasboardInfoText() {
    let textRef = document.getElementById("textObjectifDashboardInfo");
    textRef.textContent = getRandomSessionInfo(infoObjectifTextArray);
}


function onDisplayDashboardItemsList() {

    // Récupère la semaine en cours
    let currentWeekRange = getCurrentWeekRange();

    // Récupère le mois en cours
    let currentMonthRange = getCurrentMonthRange();


    // Reset les objets qui vont stocker les informations du KPI
    weekKpiObject = {};
    monthKpiObject = {};



    // * * * *  traitement hebdo    * * * * * *




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

            // Lance le calcul sur les activité concernée
            let result = onTraiteObjectif(item.activity,item.dataType,item.targetValue,currentWeekRange.monday, currentWeekRange.sunday);

            // Génère un item
            new ObjectifDashboardItem(
                item.activity,item.rythmeType,item.dataType,
                result.remainingValue,item.targetValue,
                weekParentRef,
            );

            // Stock également les éléments pour les kpi hebdo
            weekKpiObject[`kpi_${key}`] = {
                activity: item.activity,
                dataType: item.dataType,

                targetValue: item.targetValue,
                doneValue: result.doneValue,
                remainingValue: result.remainingValue

            };

        });
    }else{
        weekParentRef.innerHTML = "Aucun objectif hebdomadaire.";
    }




    // * * * *  traitement mensuel    * * * * * *
    


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

            // Lance le calcul sur les activité concernée
            let result = onTraiteObjectif(item.activity,item.dataType,item.targetValue,currentMonthRange.firstDay, currentMonthRange.lastDay);

            // Génère un item
            new ObjectifDashboardItem(
                item.activity,item.rythmeType,item.dataType,
                result.remainingValue,item.targetValue,
                monthParentRef,
            );

            // Stock également les éléments pour les kpi mensuel
            monthKpiObject[`kpi_${key}`] = {
                activity: item.activity,
                dataType: item.dataType,

                targetValue: item.targetValue,
                doneValue: result.doneValue,
                remainingValue: result.remainingValue

            };


        });
    }else{
        monthParentRef.innerHTML = "Aucun objectif mensuel.";
    }



}


function onTraiteObjectif(activityType,dataType,targetValue,dateRangeStart,dateRangeEnd) {

    if (devMode === true) {
        console.log(`Traitement pour ${activityType} sur ${dataType}`);
    }


    // Récupère les key des activités concernées (type et dans la fourchette et non planifié)
    let activityKeysTarget = findActivityKeysByNameAndDateRange(allUserActivityArray,activityType,dateRangeStart,dateRangeEnd);

    // Lance le calcul selon la data 'suivi'
    let result = {};

    // Pour le nombre total, prend juste le nombre d'élément dans l'array
    if (dataType === "COUNT") {
        result.doneValue = activityKeysTarget.length;
    }else{
        // Pour DURATION et DISTANCE
        result.doneValue = onCalculObjectifActivityCount(activityKeysTarget,allUserActivityArray,dataType);
    }
    

    // Nombre restant
    result.remainingValue = targetValue - result.doneValue;


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







// --------------------------------- #KPI ---------------------------------------------





//Le délais (en jours) avant pris en compte pour duration et distance
const kpiWeekExemptDay = 2,
    kpiMonthExemptDay = 7;

let kpiWeekContext = {
    passedDay: 2,
    totalDay: 7,
    remainingDay: 5
};
let kpiMonthContext = {
    passedDay: 10,
    totalDay: 30,
    remainingDay: 20
};


let weekKpiObject = {},
    monthKpiObject = {},
    globalMonthlyKPIColor = "",
    globalWeeklyKPIColor ="";


let kpiGlobalText = {
    GREEN : "Tu es dans le rythme 👍 ",
    ORANGE : "Attention, le rythme devient juste :",
    RED : "Tu es en retard sur certains objectifs :"
    },
    maxKpiORANGEItemToDisplay = 2;

// Tableau référentiel kpi color/image
let KPIArrayImg = {
    GREEN :"./Icons/MSS_KPI-GREEN.webp",
    ORANGE : "./Icons/MSS_KPI-ORANGE.webp",
    RED :"./Icons/MSS_KPI-RED.webp"
};


// Ecouteur d'évènement pour le kpi
function onAddEventListenerForKPIDashboard() {

    //Pour la Hebdomadaire
    if(Object.keys(weekKpiObject).length > 0){
        let imgKpiWeekRef = document.getElementById("imgKpiWeek");
        const onClickImgKPIWeek = () => onDisplayKpiWeekDetail();
        imgKpiWeekRef.addEventListener("click",onClickImgKPIWeek);
        onAddEventListenerInRegistry("objectifKPI",imgKpiWeekRef,"click",onClickImgKPIWeek);
    }

    // Pour mensuel
    if(Object.keys(monthKpiObject).length > 0){
        let imgKpiMonthRef = document.getElementById("imgKpiMonth");
        const onClickImgKPIMonth = () => onDisplayKpiMonthDetail();
        imgKpiMonthRef.addEventListener("click",onClickImgKPIMonth);
        onAddEventListenerInRegistry("objectifKPI",imgKpiMonthRef,"click",onClickImgKPIMonth);
    }
    
    //Pour le popup detail uniquement si besoin
    if (Object.keys(monthKpiObject).length > 0 || Object.keys(weekKpiObject).length > 0) {
        // Pour fermer le popup
        let mainPopupRef = document.getElementById("divPopupKPIDetail");
        const onClickInMainPopup = () => onCloseKpiPopupDetail();
        mainPopupRef.addEventListener("click",onClickInMainPopup);
        onAddEventListenerInRegistry("objectifKPI",mainPopupRef,"click",onClickInMainPopup);


        // Pour empécher la fermeture lorsque l'on clique à l'intérieur
        let popupContentRef = document.getElementById("divPopupKPIDetailContent");
        const onClickInPopupContent = (event) => onClickInsideKpiDetailContent(event);
        popupContentRef.addEventListener("click",onClickInPopupContent);
        onAddEventListenerInRegistry("objectifKPI",popupContentRef,"click",onClickInPopupContent);
    }

}

// Affiche les détails pour le kpi hebdo
function onDisplayKpiWeekDetail() {

    //référence le parent et le vide
    let parentRef = document.getElementById("divPopupKPIDetailContent");
    parentRef.innerHTML = "";


    //insere le texte principal
    onInsertKpiGlobalAvis(globalWeeklyKPIColor,parentRef);

    let itemsListToDisplay = {};



    if (globalWeeklyKPIColor === "GREEN") {
        //KPI vert pas besoin de détail
        console.log("affiche Detail kpi : Aucun détail car kpi vert");

        // insère la précision d'exemption hebdomadaire si dans le créneaux et si besoin
        if ( (kpiWeekContext.passedDay +1) <= kpiWeekExemptDay) {
            let pExemption = document.createElement("p");
            pExemption.classList.add("kpi-detail-precision");
            pExemption.textContent = `* Une tolérance de ${kpiWeekExemptDay} jours est appliquée en début de cycle hebdomadaire si aucune activité n’est enregistrée.`;
            parentRef.appendChild(pExemption);
        }


    } else if(globalWeeklyKPIColor === "ORANGE"){
        //KPI jaune récupère les éléments à afficher
        itemsListToDisplay = Object.values(weekKpiObject).filter(item=>item.kpiValue === globalWeeklyKPIColor);

        //n'affiche que deux élement Orange max
        Object.entries(itemsListToDisplay)
            .slice(0, maxKpiORANGEItemToDisplay)
            .forEach(([key, value]) => {
                console.log(key, value);
                //injection des éléments
                new KpiDetailItem(value.dataType,value.activity,value.explanation,parentRef);
        });

    }else if(globalWeeklyKPIColor === "RED"){
        //KPI rouge, récupère les éléments à afficher
        console.log(weekKpiObject);
        itemsListToDisplay = Object.values(weekKpiObject).filter(item=>item.kpiValue === globalWeeklyKPIColor);

        console.log(Object.keys(itemsListToDisplay).length);
        console.log(itemsListToDisplay);


        //affiche tous ceux en rouge
        Object.keys(itemsListToDisplay).forEach(key=>{

            let item = itemsListToDisplay[key];

            //injection des éléments
            new KpiDetailItem(item.dataType,item.activity,item.explanation,parentRef);

        });
    }else{
        console.warn("Erreur couleur kpi");
    }



    //affichage du popup
    document.getElementById("divPopupKPIDetail").style.display = "flex";
}



// Affiche les détail pour le kpi mensuel
function onDisplayKpiMonthDetail() {

    //référence le parent et le vide
    let parentRef = document.getElementById("divPopupKPIDetailContent");
    parentRef.innerHTML = "";


    //insere le texte principal
    onInsertKpiGlobalAvis(globalMonthlyKPIColor,parentRef);

    let itemsListToDisplay = {};

    if (globalMonthlyKPIColor === "GREEN") {
        //KPI vert pas besoin de détail
        console.log("affiche Detail kpi : Aucun détail car kpi vert");


        // insère la précision d'exemption mensuel
        console.log("passedDay = ", kpiMonthContext.passedDay);
        console.log("exemptDay = ",kpiMonthExemptDay);

        if ( (kpiMonthContext.passedDay +1) <= kpiMonthExemptDay) {
            let pExemption = document.createElement("p");
            pExemption.classList.add("kpi-detail-precision");
            pExemption.textContent = `* Une tolérance de ${kpiMonthExemptDay} jours est appliquée en début de cycle mensuel si aucune activité n’est enregistrée.`;
            parentRef.appendChild(pExemption);
        }


    } else if(globalMonthlyKPIColor === "ORANGE"){
        //KPI jaune récupère les éléments à afficher
        itemsListToDisplay = Object.values(monthKpiObject).filter(item=>item.kpiValue === globalMonthlyKPIColor);

        //n'affiche que deux élement jaune max
        Object.entries(itemsListToDisplay)
            .slice(0, maxKpiORANGEItemToDisplay)
            .forEach(([key, value]) => {
                //injection des éléments
                new KpiDetailItem(value.dataType,value.activity,value.explanation,parentRef);
        });

    }else if(globalMonthlyKPIColor === "RED"){
        //KPI jaune ou rouge, récupère les éléments à afficher
        console.log(monthKpiObject);
        itemsListToDisplay = Object.values(monthKpiObject).filter(item=>item.kpiValue === globalMonthlyKPIColor);

        console.log(Object.keys(itemsListToDisplay).length);
        console.log(itemsListToDisplay);


        //affiche tous ceux en rouge
        Object.keys(itemsListToDisplay).forEach(key=>{

            let item = itemsListToDisplay[key];

            //injection des éléments
            new KpiDetailItem(item.dataType,item.activity,item.explanation,parentRef);

        });
    }else{
        console.warn("Erreur couleur kpi");
    }
    

    //affichage du popup
    document.getElementById("divPopupKPIDetail").style.display = "flex";
}


// Insertion image principale et commentaire principal
function onInsertKpiGlobalAvis(globalKPIValue,parentRef) {

    //génération de l'image du kpi
    let imgKpiDetail = document.createElement("img");
    imgKpiDetail.src = KPIArrayImg[globalKPIValue];
    imgKpiDetail.classList.add("kpi-value");
    //et insertion
    parentRef.appendChild(imgKpiDetail);

    //Génération du texte principal
    let globalKPIText = kpiGlobalText[globalKPIValue];
    let mainKPIText = document.createElement("p");
    mainKPIText.textContent = globalKPIText;
    mainKPIText.classList.add("kpi-value-title");
    //et l'insère
    parentRef.appendChild(mainKPIText);
    
}








    
function onInitKpiElement() {
    // Traitement jour restant pour la semaine
    kpiWeekContext = getKPIWeeklyContext();
    let textWeekRef = document.getElementById("textObjectifDayRemainingWeek");
    textWeekRef.innerHTML = `${kpiWeekContext.remainingDay} jours restants`;

    // Traitement jours restant pour le mois
    kpiMonthContext = getKPIMonthlyContext();
    let textMonthRef = document.getElementById("textObjectifDayRemainingMonth");
    textMonthRef.innerHTML = `${kpiMonthContext.remainingDay} jours restants`;

}



// Contexte KPI hebdomadaire
// Règle métier : aujourd'hui est encore un jour disponible
function getKPIWeeklyContext(date = new Date()) {
  // JS : dimanche = 0 → on transforme pour que lundi = 0
  const dayOfWeek = (date.getDay() + 6) % 7;

  // Jours réellement "consommés" pour le KPI
  // Aujourd'hui n'est PAS encore consommé
  const passedDay = dayOfWeek;

  const totalDay = 7;

  // Jours encore disponibles (aujourd'hui inclus)
  const remainingDay = totalDay - passedDay;

  return { passedDay, totalDay, remainingDay };
}



// Contexte KPI mensuel
// Règle métier : aujourd'hui est encore un jour disponible
function getKPIMonthlyContext(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();

  // getDate() retourne 1 → 31
  // On enlève 1 pour ne PAS compter aujourd'hui comme consommé
  const passedDay = date.getDate() - 1;

  const totalDay = new Date(year, month + 1, 0).getDate();

  // Jours encore disponibles (aujourd'hui inclus)
  const remainingDay = totalDay - passedDay;

  return { passedDay, totalDay, remainingDay };
}




function traitementDuKPI(kpiObject,passedDay,totalDay,exemptDay) {

    const keys = Object.keys(kpiObject);

    // 1️⃣ Calcul KPI individuel
    keys.forEach(key => {
        const item = kpiObject[key];

        if (item.dataType === "COUNT") {
            if (devMode === true) {
                console.log("Traitement kpi pour COUNT");
            }

            item.kpiValue = calculKpiForCOUNT(
                item.remainingValue,
                passedDay,
                totalDay
            );

            // Traitement et insertion des éléments d'explication
            item.explanation = traitementKPIexplanation(item.dataType, item.remainingValue,passedDay, totalDay);
            
        } else {
            if (devMode === true) {
                console.log("Traitement kpi pour distance ou duration");
                console.log(item);
                console.log("PassedDay : ", passedDay,"totalDay :",totalDay,"ExemptDay : ",exemptDay);
            }

            item.kpiValue = calculKpiForDurationAndDistance(
                item.doneValue,
                item.targetValue,
                passedDay,
                totalDay,
                exemptDay
            );

            // Traitement et insertion des éléments d'explication
            item.explanation = traitementKPIexplanation(item.dataType, item.remainingValue,passedDay, totalDay);
        }

    });

    // 2️⃣ KPI global = pire couleur
    const globalKpi = getWorstKpiColor(kpiObject);

    return globalKpi;
}


//Pour les 'COUNT' on par sur le principe que l'on peut faire une activité d'un type par jour.
function calculKpiForCOUNT(remainingValue, passedDay, totalDay) {
    const remainingDay = totalDay - passedDay;

    if (remainingValue > remainingDay) return "RED";
    if (remainingValue === remainingDay) return "ORANGE";
    return "GREEN";
}







/**
    * Calcule le KPI (GREEN / ORANGE / RED) pour un objectif
    * de type DISTANCE ou DURATION.
    *
    * Le KPI mesure le RYTHME :
    * - ce que l'utilisateur a déjà fait
    * - par rapport au temps déjà écoulé dans le cycle
    * “Est-ce que l’utilisateur avance assez vite par rapport au temps qui passe pour atteindre son objectif de distance ou de durée ?”
    *Elle ne juge pas la performance, elle juge le rythme.
 */
function calculKpiForDurationAndDistance(
    doneValue,     // valeur déjà réalisée (km, secondes, etc.)
    targetValue,   // objectif total à atteindre
    passedDay,     // nombre de jours écoulés dans le cycle
    totalDay,      // nombre total de jours du cycle
    exemptDay      // nombre de jours de tolérance au début du cycle
) {

    // Cas de sécurité : aucun jour n'est encore passé
    // → impossible d'être en retard
    if (passedDay === 0) {
        console.log("Aucun jour de passé. Retourne GREEN");
        return "GREEN";
    }

    // Période de tolérance en début de cycle :
    // si l'utilisateur n'a encore rien fait,
    // on ne le pénalise pas immédiatement
    if ((passedDay + 1) <= exemptDay && doneValue === 0) {
        console.log("Encore dans les jours d'exemption et l'utilisateur n'a rien fait. Retourne GREEN");
        return "GREEN";
    }

    // Progression réelle de l'objectif (ex: 30km / 70km)
    const progression = doneValue / targetValue;

    // Progression du temps écoulé (ex: jour 3 / 7)
    const timeProgress = passedDay / totalDay;

    // Indice de rythme :
    // > 1  → en avance
    // = 1  → dans le rythme
    // < 1  → en retard
    const indice = progression / timeProgress;

    // Traduction de l'indice en couleur KPI
    if (indice >= 1) return "GREEN";        // bon rythme ou avance
    if (indice >= 0.8) return "ORANGE";     // rythme juste
    return "RED";                           // retard important
}






// Trouve la pire couleur
const kpiPriority = {
    GREEN: 1,
    ORANGE: 2,
    RED: 3
};

function getWorstKpiColor(kpiObject) {
    let worst = "GREEN";

    Object.values(kpiObject).forEach(item => {
        if (kpiPriority[item.kpiValue] > kpiPriority[worst]) {
            worst = item.kpiValue;
        }
    });

    return worst;
}





// Set l'image du KPI
function onSetKpiImage(color,idTarget) {

    let targetRef = document.getElementById(idTarget);
    targetRef.src = KPIArrayImg[color];
}




// Traitement pour le texte d'explication du kpi
function traitementKPIexplanation(dataType, remainingValue, passedDay, totalDay) {
    let explanation = {};
    const remainingDay = totalDay - passedDay; // jours restants incluant aujourd'hui

    switch (dataType) {
        case "COUNT":
            explanation.remainingValue = remainingValue;
            explanation.remainingDay = remainingDay;
            break;

        case "DURATION":
        case "DISTANCE":
            explanation.remainingValue = remainingValue;
            // Sécurisation : si dernier jour du cycle, éviter division par zéro
            explanation.requiredPerDay = remainingDay > 0 ? remainingValue / remainingDay : remainingValue;
            break;

        default:
            console.log("Erreur : DataType inconnu");
            break;
    }

    return explanation;
}



// Pour popup detail stop propagation et fermeture
function onClickInsideKpiDetailContent(event){
    event.stopPropagation();
};

//ferme le popup kpi detail
function onCloseKpiPopupDetail(){
    document.getElementById("divPopupKPIDetail").style.display = "none";
};



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

    onRemoveEventListenerInRegistry(["objectifKPI"]);

    // Demande le changement de menu
    onChangeMenu("Objectif_Gestion");

}


// Quitte le menu pour retourner dans le main menu
function onLeaveMenuObjectifDashboard() {
    
    onRemoveEventListenerInRegistry(["objectifKPI"]);

    onLeaveMenu("Objectif_Dashboard");
}







//=============================== Gestion========= ====================
// ====================================================================






function onOpenMenuObjectifGestion() {
    
    onDisplayObjectifList();

    // Génération du menu principal
    onCreateMainMenuObjectifGestion();

    //Ajout évènement pour le popup de modification d'objectif
    onAddEventListenerForObjectifGestion();
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

    //Vide l'objet des instance
    objectifItemListInstance = {};


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
            
            if (devMode === true) {
                console.log(item);
            }


            //genère une instance
            let newObjectifInstance = new ObjectifListItem(key,item.activity,item.rythmeType,item.dataType,item.targetValue,item.isEnabled,parentRef);

            //stocke l'instance
            objectifItemListInstance[key] = newObjectifInstance; 
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





// Ajout d'écouteur
function onAddEventListenerForObjectifGestion() {
    
    // Pour le popup de modification

    // La div générale avec action retour
    let divModifyObjectifPopupRef = document.getElementById("divModifyObjectif");
    const onClickCancelModifyObjectif = () => onCancelModifyObjectif();
    divModifyObjectifPopupRef.addEventListener("click",onClickCancelModifyObjectif);
    onAddEventListenerInRegistry("objectifPopupModify",divModifyObjectifPopupRef,"click",onClickCancelModifyObjectif);

    //La div intérieure contenur les actions
    let divModifyObjectifContentRef = document.getElementById("divModifyObjectifContent");
    const onDivModifyObjectifContent = (event) => onClickDivModifyObjectifContent(event);
    divModifyObjectifContentRef.addEventListener("click",onDivModifyObjectifContent);
    onAddEventListenerInRegistry("objectifPopupModify",divModifyObjectifContentRef,"click",onDivModifyObjectifContent);


    // les input pour la DURATION
    let inputDurationIDs = [
        "inputModifyObjectifDurationHour",
        "inputModifyObjectifDurationMinute"
    ];

    inputDurationIDs.forEach(input=>{
        let inputRef = document.getElementById(input);
        // onInput
        let maxDuration = parseInt(inputRef.max);
        const onInputItem = (event)=> formatNumberInput(event.target, maxDuration, 2);
        inputRef.addEventListener("input",onInputItem);
        onAddEventListenerInRegistry("objectifPopupModify",inputRef,"input",onInputItem);

        //onFocus
        const onFocus = (event) => selectAllText(event.target);
        inputRef.addEventListener("focus",onFocus);
        onAddEventListenerInRegistry("objectifPopupModify",inputRef,"focus",onFocus);

        //onBlur
        const onBlur = (event) => formatNumberInput(event.target, maxDuration, 2);
        inputRef.addEventListener("blur",onBlur);
        onAddEventListenerInRegistry("objectifPopupModify",inputRef,"blur",onBlur);

        //onContextMenu
        const onContextMenu = (event) => disableContextMenu(event);
        inputRef.addEventListener("contextmenu",onContextMenu);
        onAddEventListenerInRegistry("objectifPopupModify",inputRef,"contextmenu",onContextMenu);

    });


    //Le menu de navigation
    // Retour
    let btnReturnRef = document.getElementById("btnReturnObjectifModify");
    const onClickCancel = ()=> onCancelModifyObjectif();
    btnReturnRef.addEventListener("click",onClickCancel);
    onAddEventListenerInRegistry("objectifPopupModify",btnReturnRef,"click",onClickCancel);

    // Supprimer
    let btnDeleteRef = document.getElementById("btnDeleteObjectifItem");
    const onClickDelete = () => onClickDeleteObjectif();
    btnDeleteRef.addEventListener("click", onClickDelete);
    onAddEventListenerInRegistry("objectifPopupModify",btnDeleteRef,"click", onClickDelete);

    //Valider
    let btnValideRef = document.getElementById("btnValideObjectifModify");
    const onclickConfirm = () => onClickSaveFromObjectifModify();
    btnValideRef.addEventListener("click",onclickConfirm);
    onAddEventListenerInRegistry("objectifPopupModify",btnValideRef,"click",onclickConfirm);

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




// Lorsque l'utilisateur change le status d'un objectif depuis la liste
async function onUpdateObjectifEnableStatus(idTarget,newEnabledStatus) {
    // Sauvegarde du nouvel état dans l'array
    objectifUserList[idTarget].isEnabled = newEnabledStatus;

    // Sauvegarde en base
    await onInsertObjectifModificationInDB(objectifUserList[idTarget],idTarget);

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

    //Vide l'objet des instance
    objectifItemListInstance = {};


    // Enlève les écouteurs
    onRemoveEventListenerInRegistry(["objectifPopupModify"]);
}



// Quitte le menu pour retourner dans le dashbaord
function onLeaveMenuObjectifGestion() {
    //  vide ce menu
    onResetMenuObjectifGestion();

    // Demande à retourner dans le dashbaord
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

    // Met l'activité par défaut dans le selecteur (soit le 1er favoris, soit CAP)
    selectorObjectifCategoryChoiceRef.value = userFavoris.length > 0 ? userFavoris[0]  : "C-A-P";

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
        targetValue : objectifTargetValue,
        notification : {
            sent : false,
            sentDate : ""
        }
    };

    if (devMode === true) {
        console.log("Data to save : ", objectifFormatedToSave);
    }



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





// -------------------------------------        #MODIFICATION OBJECTIF ------------------------------





// Modification objectif
async function onInsertObjectifModificationInDB(objectifToUpdate, key) {
    try {
        let existingDoc = await db.get(key);

        // Exclure `_id` et `_rev` de objectifToUpdate pour éviter qu'ils ne soient écrasés
        const { _id, _rev, ...safeObjectifUpdate } = objectifToUpdate;

        const updatedDoc = {
            ...existingDoc,  // Garde `_id` et `_rev`
            ...safeObjectifUpdate // Applique les nouvelles valeurs en évitant d'écraser `_id` et `_rev`
        };

        // Sauvegarde dans la base
        const response = await db.put(updatedDoc);

        if (devMode) console.log("[OBJECTIF] Objectif mis à jour :", response);

        return updatedDoc; // Retourne l'objet mis à jour
    } catch (err) {
        console.error("Erreur lors de la mise à jour de l'objectif :", err);
        return false; // Indique que la mise à jour a échoué
    }
}




function onClickModifyObjectif(id) {

    // recupère l'id en cours
    currentObjectifModifyID = id;

    // set les éléments du popup
    onSetObjectifModifyPopup(id);

    // Le fait apparaitre
    document.getElementById("divModifyObjectif").style.display = "flex";

}



// Empeche le popup de modification de se fermer lorsque l'on clique dans la zone
function onClickDivModifyObjectifContent(event){
    event.stopPropagation();
}



function onSetObjectifModifyPopup(id) {

    let objectifData = objectifUserList[id],
        activityData = activityChoiceArray[objectifData.activity];

    // l'icone d'activité
    let imgRef = document.getElementById("imgIconModifyObjectif");
    imgRef.src = activityData.imgRef;

    // Affiche le bon input dans la zone dynamique
    onSetModifyObjectifPopupType(objectifData);
}




// Changement de type d'élément pour modification d'objectif
function onSetModifyObjectifPopupType(objectifData) {
    // 1. Masque les 3 zones dynamiques
    let objectifTypecAreaIDs = {
        COUNT : "divModifyObjectifCount",
        DISTANCE : "divModifyObjectifDistance",
        DURATION : "divModifyObjectifDuration"
    };
    let dynamicTypeAreaKeys = Object.keys(objectifTypecAreaIDs);
    dynamicTypeAreaKeys.forEach(key=>{
        let targetRef = document.getElementById(objectifTypecAreaIDs[key]);
        targetRef.style.display = "none";
    });
        
    // Pour le texte userfriendly du type de suivi
    let suiviText = "",
        dataType = "",
        rythmeType = "";
    
    // 3. Récupère le format userFriendly pour le rythme et ensuite set le texte final
    rythmeType = objectifData.rythmeType === "WEEK" ? "semaine" : "mois";

    

    // 2. Set la valeur par défaut et le type de suivi
    switch (objectifData.dataType) {
        case "COUNT":
            // L'input de valeur
            let inputCountRef = document.getElementById("inputModifyObjectifCount");
            inputCountRef.value = objectifData.targetValue;

            // Le texte du type de suivi
            dataType = "séances";

            suiviText = `${dataType} / ${rythmeType}`;
            let textCountSuiviRef = document.getElementById("spanModifyObjectifCount");
            textCountSuiviRef.innerHTML = suiviText;
            break;
        case "DISTANCE":
            // L'input de valeur
            let inputDistanceRef = document.getElementById("inputModifyObjectifDistance");
            inputDistanceRef.value = objectifData.targetValue;

            // Le texte du type de suivi
            dataType = "km";

            suiviText = `${dataType} / ${rythmeType}`;
            let textDistanceSuiviRef = document.getElementById("spanModifyObjectifDistance");
            textDistanceSuiviRef.innerHTML = suiviText;
            break;
        case "DURATION":

            // Convertion secondes en HH/MM
            let duration = onConvertSecondesToHours(objectifData.targetValue);

            let inputHourRef = document.getElementById("inputModifyObjectifDurationHour");
            inputHourRef.value = duration.heures;
            let inputMinuteRef = document.getElementById("inputModifyObjectifDurationMinute");
            inputMinuteRef.value = duration.minutes;

            // Le texte du type de suivi
            dataType = "min";//Min parce que c'est ce qui est affiché à la fin de l'input

            suiviText = `${dataType} / ${rythmeType}`;
            let textdurationSuiviRef = document.getElementById("spanModifyObjectifDuration");
            textdurationSuiviRef.innerHTML = suiviText;
            break;
        default:
            console.log("Erreur Switch : ",objectifData.dataType);
            break;
    }





    // 4. Affiche la zone demandée
    let targetRef = document.getElementById(objectifTypecAreaIDs[objectifData.dataType]);
    targetRef.style.display = "block";
}



// Annul modification

function onCancelModifyObjectif() {
    document.getElementById("divModifyObjectif").style.display = "none";
}



function onFormatModifyObjectifValue(dataType){
    // Selon le type, récupère les éléments

    let targetCount = 0;

    switch (dataType) {
        case "COUNT":
            let inputCountRef = document.getElementById("inputModifyObjectifCount");
            targetCount = parseInt(inputCountRef.value) || 0;
            break;
        case "DURATION":
            let inputDurationHourRef = document.getElementById("inputModifyObjectifDurationHour"),
                inputDurationMinuteRef = document.getElementById("inputModifyObjectifDurationMinute");


            let hoursToSecond = parseInt(inputDurationHourRef.value) * 3600 || 0,
                minutesToSecond = parseInt(inputDurationMinuteRef.value) * 60 || 0;
            targetCount = hoursToSecond + minutesToSecond;
            break;

        case "DISTANCE":
            let inputDistanceRef = document.getElementById("inputModifyObjectifDistance");
            targetCount = inputDistanceRef.value || 0;
            break;
    
        default:
            break;
    }

    return targetCount;

}


// Demande de sauvegarde des modifications

async function onClickSaveFromObjectifModify() {
    

    // Recupère les anciens éléments pour comparaison 
    let oldItemData = objectifUserList[currentObjectifModifyID];

    let objectifTargetValue = onFormatModifyObjectifValue(oldItemData.dataType);


    // Vérification champ obligatoire
    if (objectifTargetValue <=0) {
        alert("Veuillez renseigner une valeur !");
        return
    }

    // Vérification si pas besoin de sauvegarde, ferme le popup
    if (objectifTargetValue === oldItemData.targetValue) {
        // Ferme le popup
        document.getElementById("divModifyObjectif").style.display = "none";


        return;
    }



    // Formatage finale
    let objectifFormatedToSave = {
        title : oldItemData.title,
        activity : oldItemData.activity,
        dataType : oldItemData.dataType,
        rythmeType : oldItemData.rythmeType,
        isEnabled: oldItemData.isEnabled,
        targetValue : objectifTargetValue,
        notification : {
            sent : false,
            sentDate : ""
        }
    };


    //sauvegarde modification en base
    await onInsertObjectifModificationInDB(objectifFormatedToSave, currentObjectifModifyID);

    // Sauvegarde modification en array
    objectifUserList[currentObjectifModifyID].targetValue = objectifFormatedToSave.targetValue;
    objectifUserList[currentObjectifModifyID].notification = objectifFormatedToSave.notification;

    // Ferme le popup
    document.getElementById("divModifyObjectif").style.display = "none";

    // Popup notification
    onShowNotifyPopup("objectifModified");

    objectifItemListInstance[currentObjectifModifyID].updateSuiviText(objectifFormatedToSave.targetValue);
}




// ------------------------  #SUPPRESSION ----------------------------------------------

function onClickDeleteObjectif() {
    let textToDisplay = `<b>Supprimer cet objectif ?</b>`;
    addEventForGlobalPopupConfirmation(removeEventForGlobalPopupConfirmation,eventDeleteObjectif,textToDisplay,"delete");

}


async function eventDeleteObjectif() {
    // Masque le popup de modification
    document.getElementById("divModifyObjectif").style.display = "none";


    if (devMode === true) {
        console.log(objectifUserList);
        console.log(objectifUserKeysList);
        console.log(objectifItemListInstance);
    }


    //retire de l'array
    delete objectifUserList[currentObjectifModifyID];


    //supprime du tableau de key aussi
    let indexToDeleteKey = objectifUserKeysList.indexOf(currentObjectifModifyID);
    objectifUserKeysList.splice(indexToDeleteKey,1);


    //suppression du dom
    objectifItemListInstance[currentObjectifModifyID].removeItem();
    //et de l'instance
    delete objectifItemListInstance[currentObjectifModifyID];

    //Envoie vers la corbeille
    await sendToRecycleBin(currentObjectifModifyID);


    if (devMode === true) {
        console.log(objectifUserList);
        console.log(objectifUserKeysList);
        console.log(objectifItemListInstance);
    }


    // Popup notification
    onShowNotifyPopup("objectifDeleted");
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