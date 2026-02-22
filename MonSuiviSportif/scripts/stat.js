// Referencement
let selectorStatRef = document.getElementById("selectorStat"),
    imgStatActivityPreviewRef = document.getElementById("imgEditorActivityPreview");

// Array qui va contenir toutes les keys des activités non planifiées
let statActivityNonPlannedKeys = [];



// ------------------------------Ecouteur d'évènement-------------------------


function onAddEventListenerForStatMenu() {
    if (devMode === true){
        console.log("[EVENT-LISTENER] : Ajoute les évènements pour le menu STAT");
    };

    // le fake selecteur d'activité
    let locDivFakeSelectorStatMenuRef = document.getElementById("divFakeSelectorStatMenu");
    const onChooseStatActivity = () => onClickFakeStatSelect();
    locDivFakeSelectorStatMenuRef.addEventListener("click",onChooseStatActivity);
    onAddEventListenerInRegistry("stat",locDivFakeSelectorStatMenuRef,"click",onChooseStatActivity);

    //Le selecteur d'année
    let locSelectStatGraphYearRef = document.getElementById("selectStatGraphYear");
    const onChangeStatYear = (event) => onChangeSelectorYearGraph(event.target.value);
    locSelectStatGraphYearRef.addEventListener("change",onChangeStatYear);
    onAddEventListenerInRegistry("stat",locSelectStatGraphYearRef,"change",onChangeStatYear);

    //pour annuler le selecteur de stat
    let locDivFakeSelectOptStatRef = document.getElementById("divFakeSelectOptStat");
    const onReturnFromStatFakeSelect = (event) =>  onCloseFakeStatSelectOpt(event);
    locDivFakeSelectOptStatRef.addEventListener("click",onReturnFromStatFakeSelect);
    onAddEventListenerInRegistry("stat",locDivFakeSelectOptStatRef,"click",onReturnFromStatFakeSelect);
}





// Ouverture du menu
function onOpenMenuStat(){
    if (devMode === true){console.log("Ouverture menu STAT");};


    // récupère les keys des activités non planifiées
    statActivityNonPlannedKeys = Object.entries(allUserActivityArray)
    .filter(([key, value]) => value.isPlanned === false)
    .map(([key, value]) => key);


    // Récupère la liste dynamique des catégories
    let dynamicFilterList = getNonPlannedActivitiesKeysForStat(statActivityNonPlannedKeys);
    
    // Crée les options dans le selecteur de catégorie le vrai et la fake
    onGenerateStatOptionFilter(dynamicFilterList);
    onGenerateFakeStatOptionFilter(dynamicFilterList);

    displayGeneralStats(statActivityNonPlannedKeys);
    // traitement des graphiques
    let defaultEvaluationYear = onTreateStatGraphic(statActivityNonPlannedKeys);

    //Affichage et traitement evaluations
    onDisplayEvalMonthItem(defaultEvaluationYear);


    // Ecouteur d'évènement
    onAddEventListenerForStatMenu();

    if (devMode === true) {
        onConsoleLogEventListenerRegistry();
    }

    //génération menu principal
    onCreateMainMenuStat();
}


// Génération du menu principal
function onCreateMainMenuStat() {
    // Vide le précedent contenut
    let divMainMenuParentRef = document.getElementById("divMainBtnMenu");
    divMainMenuParentRef.innerHTML = "";

    //crée les boutons
    //Retour
    new Button_main_menu(btnMainMenuData.return.imgRef,btnMainMenuData.return.text,() => onClickReturnFromStat());

}
   



// filtre sur les éléments non planifié et les tries par ordre alpha
function getNonPlannedActivitiesKeysForStat(nonPlannedActivitiesKeys) {
    if (devMode === true){console.log("[STAT] récupère les types d'activité de l'utilisateur" )};

    let filteredList = [];


    // Recupère les nouvelles catégories présentes dans la liste en cours
    nonPlannedActivitiesKeys.forEach(key=>{
        if (!filteredList.includes(allUserActivityArray[key].name))  {
            filteredList.push(allUserActivityArray[key].name);
        };
    });


    // Classement par ordre alpha
    filteredList.sort();
    if (devMode === true){
        console.log("Retrait des activités programmées");
        console.log("Nbre activité retiré = " + (Object.keys(allUserActivityArray).length - Object.keys(nonPlannedActivitiesKeys).length));
        console.log(filteredList);
    
    };

    return filteredList;
};



// Génération des options d'activité pour le filtre avec tri
function onGenerateStatOptionFilter(dynamicFilterList) {

    selectorStatRef.innerHTML = "";


    // Ajouter l'option "Tous" au début
    let allOption = document.createElement("option");
    allOption.value = "GENERAL";
    allOption.innerHTML = "Général";
    selectorStatRef.appendChild(allOption);



    // Ajouter les autres options triées
    dynamicFilterList.forEach(activityType => {

        let newOption = document.createElement("option");
        newOption.value = activityType;
        newOption.innerHTML = activityChoiceArray[activityType].displayName;
        selectorStatRef.appendChild(newOption);
    });


};




function onGenerateFakeStatOptionFilter(dynamicFilterList) {
    let parentTargetRef = document.getElementById("divFakeSelectOptStatList");

    // Traite d'abord les favoris
    if (devMode === true){
        console.log("[FAKE SELECTOR STAT] Lancement de la generation des choix des activités dans le filtre");
        console.log("[FAKE SELECTOR STAT] ID Parent pour insertion : " + parentTargetRef);
    };

    parentTargetRef.innerHTML = "";


    // Le bouton radio sera set sur générales


    // Ajouter l'option "Tous" au début
    let newContainer = document.createElement("div");
    newContainer.classList.add("fake-opt-item-container");
    newContainer.onclick = function (event){
        event.stopPropagation();
        onCloseFakeStatSelectOpt();
        selectorStatRef.value = "GENERAL";
        onChangeFakeSelecStatFilterRadio("btnRadio-filter-stat-general");
        onChangeStatActivitySelector("GENERAL");
    }
    // Ajout la ligne bleu 
    newContainer.classList.add("fake-opt-item-last-favourite");

    let newImg = document.createElement("img");
    newImg.classList.add("fake-opt-item");
    newImg.src = "./images/icon-All.webp";

    let newTitle = document.createElement("span");
    newTitle.innerHTML = "Générales";
    newTitle.classList.add("fake-opt-item");

    // Bouton radio fake pour simuler le selecteur
    let newBtnRadioFake = document.createElement("div");
    newBtnRadioFake.classList.add("radio-button-fake","selected");
    newBtnRadioFake.id = "btnRadio-filter-stat-general";

    // Insertion
    newContainer.appendChild(newImg);
    newContainer.appendChild(newTitle);
    newContainer.appendChild(newBtnRadioFake);

    parentTargetRef.appendChild(newContainer);


    // Ajout de reste des activités
    dynamicFilterList.forEach((e,index)=>{

         // Creation
        let newContainer = document.createElement("div");
        newContainer.classList.add("fake-opt-item-container");
        newContainer.onclick = function (event){
            event.stopPropagation();
            onCloseFakeStatSelectOpt();
            selectorStatRef.value = e;
            onChangeFakeSelecStatFilterRadio(`btnRadio-filter-stat-${e}`);
            onChangeStatActivitySelector(e);
        }


        // Style sans border botton pour le dernier
        if (index === (dynamicFilterList.length - 1)) {
            newContainer.classList.add("fake-opt-item-last-container");
        }

        let newImg = document.createElement("img");
        newImg.classList.add("fake-opt-item");
        newImg.src = activityChoiceArray[e].imgRef;

        let newTitle = document.createElement("span");
        newTitle.innerHTML = activityChoiceArray[e].displayName;
        newTitle.classList.add("fake-opt-item");


        // Bouton radio fake pour simuler le selecteur
        let newBtnRadioFake = document.createElement("div");
        newBtnRadioFake.classList.add("radio-button-fake");
        newBtnRadioFake.id = "btnRadio-filter-stat-" + e;

        // Insertion
        newContainer.appendChild(newImg);
        newContainer.appendChild(newTitle);
        newContainer.appendChild(newBtnRadioFake);

        parentTargetRef.appendChild(newContainer);
    })

}




// Clique sur le fake selecteur
function onClickFakeStatSelect(){
    // Affiche le fake option
    document.getElementById("divFakeSelectOptStat").style.display = "flex";
}


function onCloseFakeStatSelectOpt(event){
    document.getElementById("divFakeSelectOptStat").style.display = "none";
}


// Retire les boutons radio plein à tous les boutons
function onChangeFakeSelecStatFilterRadio(idToSelect){
    // Pour rechercher dans les enfants d'un parent spécifique
    let parent = document.getElementById("divFakeSelectOptStatList");


    // Retire les boutons radio plein
    let elementToRemoveClass = parent.querySelectorAll(".selected");
    elementToRemoveClass.forEach(e=>{
        e.classList.remove("selected");
    });


    // le met à l'option en cours
    document.getElementById(idToSelect).classList.add("selected");
};





// ------------------------------------   GENERATION DES STAT --------------------------------







// Fonction onChange pour changer entre général et activité spécifique
function onChangeStatActivitySelector(value) {
    if (devMode === true){console.log("[SELECTOR] Changement de sélection :", value);};

    if (value === "GENERAL") {
        // Appeler la fonction pour afficher les statistiques générales
        displayGeneralStats(statActivityNonPlannedKeys);
        // traitement des graphiques
        let defaultEvaluationYear = onTreateStatGraphic(statActivityNonPlannedKeys);

        //Affichage et traitement evaluations
        onDisplayEvalMonthItem(defaultEvaluationYear);
    } else {
        // Appeler la fonction pour afficher les statistiques de l'activité sélectionnée
        displayActivityStats(value);

        //Masquage des evaluations
        onHideEvalMonthItem();
    }
}






// Fonction pour convertir la durée au format hh:mm:ss en minutes
function durationToMinutes(duration) {
    if (!duration || typeof duration !== "string") {
        duration = "00:00:00"; // Valeur par défaut si la durée est invalide
    }
    const [hours, minutes, seconds] = duration.split(":").map(Number);
    return (hours || 0) * 60 + (minutes || 0) + (seconds || 0) / 60; // Conversion totale en minutes
}

// Fonction pour formater la durée en heures:minutes:secondes
function formatDuration(totalMinutes) {
    if (isNaN(totalMinutes) || totalMinutes < 0) {
        return "00:00:00"; // Valeur par défaut si les minutes totales sont invalides
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    const seconds = Math.round((totalMinutes % 1) * 60);

    // Formater en HH:MM:SS
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}






// Récupère les statistiques de l'activité pour le résumé
function getStats(activityTargetKeysList, days = null) {
    const today = new Date();

    // NE garde que les clés des activités qui sont concernée par la recherche. (tous, 7jours, 30jours)
    let filteredKeys = activityTargetKeysList.filter(key => {
        const isWithinDays = days
            ? (today - new Date(allUserActivityArray[key].date)) / (1000 * 60 * 60 * 24) <= days
            : true; // Inclure toutes les sessions si `days` est null
        return isWithinDays;
    });

    // Si aucune session n'est trouvée, renvoyer des valeurs par défaut
    if (filteredKeys.length === 0) {
        return {
            totalSessions: 0,
            totalDuration: 0,
            totalDistance: 0,
            lastActivityDate: null,
            firstActivityDate: null
        };
    }

    // Trier les keys par date (du plus récent au plus ancien)
    filteredKeys.sort((a, b) => new Date(allUserActivityArray[b].date) - new Date(allUserActivityArray[a].date));

    // Calculer les statistiques
    const totalSessions = filteredKeys.length;

    // const totalDuration = filteredSessions.reduce((sum, session) =>
    //     sum + durationToMinutes(session.duration || "00:00:00"), 0
    // ); // En minutes

    const totalDuration = filteredKeys.reduce((sum, key) => {
        const activity = allUserActivityArray[key];
        if (activity && activity.duration) {
            return sum + durationToMinutes(activity.duration || "00:00:00");
        }
        return sum;
    }, 0);


    // const totalDistance = filteredSessions.reduce((sum, session) =>
    //     sum + parseFloat(session.distance || 0), 0
    // );

    const totalDistance = filteredKeys.reduce((sum, key) => {
        const activity = allUserActivityArray[key];
        if (activity && activity.distance) {
            return sum + parseFloat(activity.distance);
        }
        return sum;
    }, 0);


    // Dernière activité pratiquée (la plus récente)
    const lastActivityDate = new Date(allUserActivityArray[filteredKeys[0]].date); // La première après le tri est la plus récente



    // Première activité pratiquée (la plus ancienne)
    const lastIndex = filteredKeys.length - 1;
    const firstActivityDate = new Date(allUserActivityArray[filteredKeys[lastIndex]].date); // La dernière après le tri est la plus ancienne

    return {
        totalSessions,
        totalDuration, // En minutes
        totalDistance, // En km
        lastActivityDate,
        firstActivityDate,
    };
}


function onTreateStatGraphic(activityKeysList) {

    if (devMode === true){
        console.log("[STAT] Traitement des graphiques");
        console.log("[STAT] extraction et trie des années");
    };
        
    // extraction des années 
    let yearArray = [];
    activityKeysList.forEach(key=>{
        const dateObject = new Date(allUserActivityArray[key].date);
        const year = dateObject.getFullYear();
        if (!yearArray.includes(year)) {
            yearArray.push(year);
        }
    });

    // Trie par ordre décroissant
    yearArray.sort((a, b) => b - a);

    if (devMode === true){
        console.log(yearArray);
    };



    // creation des options pour les années
    let selectRef = document.getElementById("selectStatGraphYear");
    selectRef.innerHTML = "";
    
    yearArray.forEach(e=>{
        let newOption = document.createElement("option");
        newOption.value = e;
        newOption.innerHTML = e;    
        selectRef.appendChild(newOption);
    });

    // Lancement du comptage sur la première année du tableau
    getActivityStatCountByMonth(activityKeysList,yearArray[0]);

        
    return  yearArray[0];//retour l'année pour affichage de l'évaluation
}





const monthStatNamesArray = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
];

function getActivityStatCountByMonth(activityKeysList,yearTarget) {


    // Objet qui stocke les comptes des activité classé
    let countActivityByMonth = {
        january : {count : 0, distance: 0 , duration : 0},
        february : {count : 0, distance: 0 , duration : 0},
        march :  {count : 0, distance: 0 , duration : 0},
        april :  {count : 0, distance: 0 , duration : 0},
        may : {count : 0, distance: 0 , duration : 0},
        june : {count : 0, distance: 0 , duration : 0},
        july :  {count : 0, distance: 0 , duration : 0}, 
        august :  {count : 0, distance: 0 , duration : 0},
        september :  {count : 0, distance: 0 , duration : 0}, 
        october :  {count : 0, distance: 0 , duration : 0},
        november :  {count : 0, distance: 0 , duration : 0},
        december:  {count : 0, distance: 0 , duration : 0},
    }; 

    let totalCountYear = 0,
        totalDistanceYear = 0,
        totalDurationYear = 0;

    activityKeysList.forEach(key=>{

        const dateObject = new Date(allUserActivityArray[key].date);
        const year = dateObject.getFullYear();
        const month = dateObject.getMonth();
        const monthName = monthStatNamesArray[month];


        // Si l'année correspond, ajoute + 1 dans le mois de l'activité
        if (year === yearTarget) { 
            countActivityByMonth[monthName].count++;


            // ancienne valeur
            let oldDistance = Number(countActivityByMonth[monthName].distance) || 0;
            // Valeur à ajouter
            let newDistance = parseFloat(allUserActivityArray[key].distance) ||0 ;
            // addition
            let distanceToAdd = oldDistance + newDistance;
            distanceToAdd = Math.round(distanceToAdd * 10) / 10;//arrondi 1 décimale
            countActivityByMonth[monthName].distance = distanceToAdd;



            // Additionne les durée
            // ancienne valeur
            let oldDuration = Number(countActivityByMonth[monthName].duration) || 0;

            // Valeur à ajouter
            let newDuration = durationToMinutes(allUserActivityArray[key].duration || "00:00:00");


            let durationToAdd = oldDuration + newDuration;

            countActivityByMonth[monthName].duration = durationToAdd;

            // calcul également le total sur l'année
            totalCountYear++;
            totalDistanceYear += newDistance;
            totalDurationYear += newDuration;
        }
    });


    if (devMode === true){
        
        console.log("[STAT] longueur de la liste d'activité cible :" + activityKeysList.length);
        console.log("[STAT] Comptage répartition par mois selon l'année : " + yearTarget);
        console.log(countActivityByMonth);
        console.log("[STAT] Recherche du mois avec la valeur la plus haute");
    };


    // Trouve le mois avec le plus de tâches (mois de référence pour les 100%)
    const maxCountMonth = Object.keys(countActivityByMonth).reduce((a, b) => countActivityByMonth[a].count > countActivityByMonth[b].count ? a : b);
    if (devMode === true){console.log("[STAT] " + maxCountMonth);};

    // Trouve le mois avec la distance la plus élevé (mois de référence pour les 100%)
    const maxDistanceMonth = Object.keys(countActivityByMonth).reduce((a, b) => countActivityByMonth[a].distance > countActivityByMonth[b].distance ? a : b);
    if (devMode === true){console.log("[STAT] " + maxDistanceMonth);};

    // Trouve le mois avec la durée la plus élevé (mois de référence pour les 100%)
    const maxDurationMonth = Object.keys(countActivityByMonth).reduce((a, b) => countActivityByMonth[a].duration > countActivityByMonth[b].duration ? a : b);
    if (devMode === true){console.log("[STAT] " + maxDistanceMonth);};


    onSetResumeByYear(totalCountYear,totalDistanceYear,formatDuration(totalDurationYear));
    onSetGraphicItems(countActivityByMonth,countActivityByMonth[maxCountMonth].count,countActivityByMonth[maxDistanceMonth].distance,countActivityByMonth[maxDurationMonth].duration);

    // traitement information mois en cours
    onSetStatMonthInformation(countActivityByMonth,yearTarget);
}






// Set les informations spécifique pour le mois en cours
//!!! On n'affiche ces informations uniquement si ça correspond à l'année en cours
// pour le pas perturber l'utilisateur
function onSetStatMonthInformation(statDataArray,yearFilterTarget) {


    let currentMonthData= {},
        previousMonthData = {},
        idHeaderRightArrayRef = [
            "divHeaderStatActivity",
            "divHeaderStatDistance",
            "divHeaderStatDuration"
        ],
        idTextComparaisonMonthRef = [
            "textStatComparaisonActivity",
            "textStatComparaisonDistance",
            "textStatComparaisonDuration"
        ],
        idTextComparaisonValueRef = [
            "textStatCurrentEvoActivity",
            "textStatCurrentEvoDistance",
            "textStatCurrentEvoDuration"
        ];

    //trouver l'année et le mois en cours
    let currentYear = new Date().getFullYear(),
        currentMonthIndex = new Date().getMonth();

    if (devMode === true) {
        console.log(`Stat information : Année en cours : ${currentYear}.Mois en cours : ${currentMonthIndex}`);
    }


    //si pas l'année en cours n'affiche pas les informations et met fin à l'instruction
    if (currentYear !== yearFilterTarget) {
        if (devMode === true) {
            console.log("Stat ne corresponds pas à l'année en cours. N'affiche pas les infos");
        }
        // Masque les headers du coté droit
        idHeaderRightArrayRef.forEach(id=>{
            document.getElementById(id).style.display= "none";
        });

        return;
    }else{
        //sinon les affiche
        idHeaderRightArrayRef.forEach(id=>{
            document.getElementById(id).style.display= "flex";
        });
    }

    // Récupère les informations du mois en cours et les traites
    currentMonthData = statDataArray[monthStatNamesArray[currentMonthIndex]];

    // Référence les éléments
    let textStatCurrentMonthActivityRef = document.getElementById("textStatCurrentMonthActivity"),
        textStatCurrentMonthDurationRef = document.getElementById("textStatCurrentMonthDuration"),
        textStatCurrentMonthDistanceRef = document.getElementById("textStatCurrentMonthDistance");

    // Count
    textStatCurrentMonthActivityRef.innerHTML = currentMonthData.count;

    // Duration
    let convertedDuration = formatMinutesToHoursForGraph(currentMonthData.duration);
    textStatCurrentMonthDurationRef.innerHTML = convertedDuration;

    // Distance
    textStatCurrentMonthDistanceRef.innerHTML = `${currentMonthData.distance} km`;

    //si on est en janvier, pas de comparaison avec le mois précédent
    if (currentMonthIndex === 0) {


        // Set un texte par défaut
        idTextComparaisonMonthRef.forEach(id=>{
            let textRef = document.getElementById(id);
            textRef.textContent = "Aucune référence disponible.";
        });

        //vide la partie valeur
        idTextComparaisonValueRef.forEach(id=>{
            let textRef = document.getElementById(id);
            textRef.textContent = "";
        });
        return;
    }

    // Sinon on récupère les éléments du mois précédent pour comparaison
    previousMonthData = statDataArray[monthStatNamesArray[currentMonthIndex -1]]

    // Référence les éléments
    let textStatComparaisonActivityRef = document.getElementById("textStatComparaisonActivity"),
        textStatComparaisonDistanceRef = document.getElementById("textStatComparaisonDistance"),
        textStatComparaisonDurationRef = document.getElementById("textStatComparaisonDuration"),
        textStatCurrentEvoActivityRef = document.getElementById("textStatCurrentEvoActivity"),
        textStatCurrentEvoDistanceRef = document.getElementById("textStatCurrentEvoDistance"),
        textStatCurrentEvoDurationRef = document.getElementById("textStatCurrentEvoDuration");


    //retire les class de couleur ne laisse que la class normal
    idTextComparaisonValueRef.forEach(id=>{
        let itemRef = document.getElementById(id);
        itemRef.className = "stat-delta";
    });

    // Lance le calcul
    let evolutionResult = onCalculStatEvolution(previousMonthData,currentMonthData);

    if (devMode === true) {
        console.log("EvolutionResult : ",evolutionResult);
    }


    // Traitement des couleurs du delta, uniquement après le 20 janviers si négatif
    let statDeltaColor = {};
    statDeltaColor = traitementCouleurStat(currentMonthData,previousMonthData,currentMonthIndex);

    console.log(statDeltaColor);

    let frenchMonthNameArray = [
            'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
            'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'
        ],
        previousMonthFrenchName = frenchMonthNameArray[currentMonthIndex -1];

    // Activité nbre
    textStatCurrentEvoActivityRef.textContent = evolutionResult.activity;
    textStatComparaisonActivityRef.textContent = `vs ${previousMonthFrenchName}`;
    //Ajout la class de la couleur
    textStatCurrentEvoActivityRef.classList.add(statDeltaColor.activityCount);


    //duration
    textStatCurrentEvoDistanceRef.textContent = evolutionResult.distance;
    textStatComparaisonDistanceRef.textContent = `vs ${previousMonthFrenchName}`;
    //Ajoute la class de la couleur
    textStatCurrentEvoDistanceRef.classList.add(statDeltaColor.activityDuration);

    // Distance
    textStatCurrentEvoDurationRef.textContent = evolutionResult.duration; 
    textStatComparaisonDurationRef.textContent = `vs ${previousMonthFrenchName}`;
    //Ajoute la class de la couleur
    textStatCurrentEvoDurationRef.classList.add(statDeltaColor.activityDistance);

}

// Calul l'évolution pour le mois en cours dans les stats
function onCalculStatEvolution(previousMonthValue,currentMonthValue) {
    let activityEvolutionValue = currentMonthValue.count - previousMonthValue.count,
        distanceEvolutionValue = currentMonthValue.distance - previousMonthValue.distance,
        durationEvolutionValue = currentMonthValue.duration - previousMonthValue.duration;

    // Traitement des préfixes
    let activityEvolutionPrefix = onCheckStatEvolutionPrefix(activityEvolutionValue),
        distanceEvolutionPrefix = onCheckStatEvolutionPrefix(distanceEvolutionValue),
        durationEvolutionPrefix = onCheckStatEvolutionPrefix(durationEvolutionValue);

    // Génération texte finale
    let activityText = "";
    if (Math.abs(activityEvolutionValue) === 0) {
        activityText = activityEvolutionPrefix;
    }else{
        activityText = `${activityEvolutionPrefix}${Math.abs(activityEvolutionValue)}`;
    }

    //si distance égale à zero ne met pas le chiffre. juste le texte "Aucune variation"
    let distanceText = "";
    if (Math.abs(distanceEvolutionValue) === 0) {
        distanceText = distanceEvolutionPrefix;
    }else{
        distanceText = `${distanceEvolutionPrefix}${Math.abs(distanceEvolutionValue).toFixed(1)}`;
    }
    

    let durationConvertedValue = formatMinutesToHoursForGraph(Math.abs(durationEvolutionValue)),
        durationText = "";

    if (Math.abs(durationEvolutionValue) === 0) {
        durationText = durationEvolutionPrefix;
    }else{
        durationText = `${durationEvolutionPrefix}${durationConvertedValue}`;
    }

    
    let result = {
        activity : activityText,
        distance : distanceText,
        duration: durationText
    };

    return result;
}

//traitement des couleurs d'évolution pour les stats, uniquement après le 20 du mois
function traitementCouleurStat(currentMonthData,previousMonthData,currentMonthIndex) {

    // Trouve la class de la couleur de l'évolution
    let statEvoActivityColor = onCheckStatEvolutionClassColor(currentMonthData.count,previousMonthData.count,currentMonthIndex),
    statEvoDurationColor = onCheckStatEvolutionClassColor(currentMonthData.duration,previousMonthData.duration,currentMonthIndex),
    statEvoDistanceColor = onCheckStatEvolutionClassColor(currentMonthData.distance,previousMonthData.distance,currentMonthIndex);

    return {activityCount : statEvoActivityColor, activityDuration : statEvoDurationColor, activityDistance : statEvoDistanceColor};

}


// Trouve la class de la couleur selon l'évolution par rapport au mois précédent
function onCheckStatEvolutionClassColor(currentValue, previousValue, currentMonthIndex) {
    
    // Janvier (0) : aucune référence
    if (currentMonthIndex === 0) {
        return 'stat-evo-normal';
    }

    // Cas particulier : mois précédent = 0
    if (previousValue === 0) {
        return currentValue > 0 ? 'stat-evo-positif' : 'stat-evo-normal';
    }


    //Si nous sommes avant le 20 du mois, renvoie gris pour les résultats négatif
    // Seulement après le 20 met les couleurs pour alerter l'utilisateur sur les résultats négatif

    // regarde si nous sommes le 20 du mois ou plus
    const dateToday = new Date().getDate();

    const ratio = currentValue / previousValue;

    if (ratio > 1) return 'stat-evo-positif';        // > 100 %
    if (ratio === 1) return 'stat-evo-normal';       // = 100 %
    if (ratio >= 0.8) return dateToday >= 20 ? 'stat-evo-less-100': 'stat-evo-normal';         // 80–100 %
    if (ratio >= 0.5) return dateToday >= 20 ? 'stat-evo-less-80': 'stat-evo-normal';      // 50–80 %

    return dateToday >= 20 ? 'stat-evo-less-50' :'stat-evo-normal';                         // < 50 %
}


// Trouve le préfix
function onCheckStatEvolutionPrefix(value) {
    let prefix = "";
    if (value > 0) {
       prefix = `▲ +`;
    } else if (value < 0) {
       prefix =`▼ -`;
    } else {
       prefix =`Aucune variation`;
    }

    return prefix;
}

// convertir les minutes au format 2h45
function formatMinutesToHoursForGraph(minutes) {
    if (minutes <= 0) return "0h00"; // Gestion du cas zéro ou négatif

    let hours = Math.floor(minutes / 60); // Partie entière = heures
    let mins = minutes % 60; // Reste = minutes
    roundMins = parseInt(mins);
     
    return `${hours}h${roundMins.toString().padStart(2, "0")}`; // Ajout du "0" si nécessaire
}


// set le résumé par année
function onSetResumeByYear(count,distance,hour) {
    let pTarget = document.getElementById("pStatResumeByYear");
    distanceFormated = Math.round(distance * 100) / 100;

    pTarget.innerHTML = `Activité(s) :<b> ${count} </b> - Distance :<b> ${distanceFormated} km</b> - Durée :<b> ${hour}</b>`;
}

// set les éléments graphiques après comptage

function onSetGraphicItems(activityCount,higherCountValue,higherDistanceValue,higherDurationValue) {


    // Retire toutes les classes "StatHigherValueXXXX" pour ceux qui les ont
    // Pour rechercher dans les enfants d'un parent spécifique
    let parent = document.getElementById("divStat");


    // Retire les img des couronnes visible
    let imgCrownToRemoveClass = parent.querySelectorAll(".display");
    imgCrownToRemoveClass.forEach(e=>{
        e.classList.remove("display");
    });

    // Retire les class StatHigherValueXXX
    let statActivityToRemoveClass = parent.querySelectorAll(".StatHigherValueActivity"),
        statDurationToRemoveClass = parent.querySelectorAll(".StatHigherValueDuration"),
        statDistanceToRemoveClass = parent.querySelectorAll(".StatHigherValueDistance");

    statActivityToRemoveClass.forEach(e=>{
       e.classList.remove("StatHigherValueActivity");
    });
    statDurationToRemoveClass.forEach(e=>{
       e.classList.remove("StatHigherValueDuration");
    });
    statDistanceToRemoveClass.forEach(e=>{
       e.classList.remove("StatHigherValueDistance");
    });




    if (devMode === true){
        console.log("[STAT] Set le graphique");
        console.log("[STAT] valeur maximale pour référence pourcentage count : " + higherCountValue);
        console.log("[STAT] valeur maximale pour référence pourcentage distance : " + higherDistanceValue);
        console.log("[STAT] valeur maximale pour référence pourcentage heures : " + higherDurationValue);
    };


    // COUNT
    monthStatNamesArray.forEach(e=>{
        document.getElementById(`stat-number-${e}`).innerHTML = activityCount[e].count;
        document.getElementById(`stat-PB-${e}`).style = "--progress:" + onCalculStatPercent(higherCountValue,activityCount[e].count) + "%";

        // Traitement valeur la plus élevée (mise en gras) et l'image de la couronne
        if (activityCount[e].count === higherCountValue && higherCountValue !== 0) {
            document.getElementById(`spanGraphCountMonthName-${e}`).classList.add("StatHigherValueActivity");
            document.getElementById(`stat-number-${e}`).classList.add("StatHigherValueActivity");
            document.getElementById(`imgStatCount_${e}`).classList.add("display");
        }

    });

    // DISTANCE
    monthStatNamesArray.forEach(e=>{
        document.getElementById(`stat-distance-${e}`).innerHTML = activityCount[e].distance;
        document.getElementById(`stat-PB-Distance-${e}`).style = "--progress:" + onCalculStatPercent(higherDistanceValue,activityCount[e].distance) + "%";

        // Traitement valeur la plus élevée (mise en gras)
        if (activityCount[e].distance === higherDistanceValue && higherDistanceValue!== 0) {
            document.getElementById(`spanGraphDistanceMonthName-${e}`).classList.add("StatHigherValueDistance");
            document.getElementById(`stat-distance-${e}`).classList.add("StatHigherValueDistance");
            document.getElementById(`imgStatDistance_${e}`).classList.add("display");
        }
    });


    // DURATION
    monthStatNamesArray.forEach(e=>{
        document.getElementById(`stat-duration-${e}`).innerHTML = formatMinutesToHoursForGraph(activityCount[e].duration);
        document.getElementById(`stat-PB-Duration-${e}`).style = "--progress:" + onCalculStatPercent(higherDurationValue,activityCount[e].duration) + "%";

        // Traitement valeur la plus élevée (mise en gras)
        if (activityCount[e].duration === higherDurationValue && higherDurationValue !== 0) {
            document.getElementById(`spanGraphDurationMonthName-${e}`).classList.add("StatHigherValueDuration");
            document.getElementById(`stat-duration-${e}`).classList.add("StatHigherValueDuration");
            document.getElementById(`imgStatDuration_${e}`).classList.add("display");
        }
    });

}

// Calcul de pourcentage
function onCalculStatPercent(referenceValue, currentItemValue) {
    return (currentItemValue / referenceValue) * 100;
};





// Changement de graphique selon l'année appeler depuis le selecteur d'année
function onChangeSelectorYearGraph(yearTarget){

    // Lancement du trie

    let currentActivitySelected = selectorStatRef.value;

    if (devMode === true){
        console.log("[STAT] Changement d'année pour activité " + currentActivitySelected);
    };


    if (currentActivitySelected === "GENERAL") {
        getActivityStatCountByMonth(statActivityNonPlannedKeys,Number(yearTarget));

        //Affichage et traitement evaluations
        onDisplayEvalMonthItem(yearTarget);
    } else {
        // Récupère uniquement les données concernant l'activité en question et non planifié
        let activitiesTargetData = Object.entries(allUserActivityArray)
            .filter(([key, value]) => value.isPlanned === false && value.name === currentActivitySelected)
            .map(([key, value]) => key);

        getActivityStatCountByMonth(activitiesTargetData,Number(yearTarget));

        //Masquage des evaluations
        onHideEvalMonthItem();
    }    
}











// Affichage des activités
function displayActivityStats(activityName) {
    if (devMode === true){console.log("[STAT] demande de stat pour " + activityName);};

    //set le displayName
    let displayName = activityChoiceArray[activityName].displayName;

    //image previsualisation
    imgStatActivityPreviewRef.src = activityChoiceArray[activityName].imgRef;

    // Récupère uniquement les keys données concernant l'activité en question et non planifié
    let specificActivitiesKeys = Object.entries(allUserActivityArray)
    .filter(([key, value]) => value.isPlanned === false && value.name === activityName)
    .map(([key, value]) => key);


    // Récupérer les statistiques pour le résumé
    const statsAllTime = getStats(specificActivitiesKeys);
    const stats7Days = getStats(specificActivitiesKeys, 7);
    const stats30Days = getStats(specificActivitiesKeys, 30);

    // Formater les dates des premières et dernières activités pratiquées
    const firstActivityDateFormatted = statsAllTime.firstActivityDate
        ? statsAllTime.firstActivityDate.toLocaleDateString("fr-FR")
        : "Aucune activité";
    const lastActivityDateFormatted = statsAllTime.lastActivityDate
        ? statsAllTime.lastActivityDate.toLocaleDateString("fr-FR")
        : "Aucune activité";

    // Calcul des informations générales
    const totalKm = statsAllTime.totalDistance.toFixed(2);
    const totalDurationFormatted = formatDuration(statsAllTime.totalDuration);

    // Texte convivial pour l'utilisateur (si distance > 0 ou non)
    const generalText1 = statsAllTime.totalDistance > 0 
        ? `Depuis le <b>${firstActivityDateFormatted}</b>, tu as pratiqué <b>${statsAllTime.totalSessions} session(s)</b> de <b>${displayName}</b>, parcouru environ <b>${totalKm} km</b> et accumulé un total de <b>${totalDurationFormatted} heure(s) </b> de pratique.`
        : `Depuis le <b>${firstActivityDateFormatted}</b>, tu as pratiqué <b>${statsAllTime.totalSessions} session(s)</b> de <b>${displayName}</b> et accumulé un total de <b>${totalDurationFormatted} heure(s)</b> de pratique.`;


    const generalText2 = `Ta dernière activité de ce type remonte au <b>${lastActivityDateFormatted}</b>.`;

    // Vérification pour les 7 derniers jours
    const sevenDaysText = stats7Days.totalSessions === 0 
        ? "<p>Il semble que tu n'aies pas pratiqué cette activité ces derniers jours.</p>" 
        : stats7Days.totalDistance > 0
            ? `
                <p>${stats7Days.totalSessions} séance(s) - ⏱️ ${formatDuration(stats7Days.totalDuration)} - 🚶${stats7Days.totalDistance.toFixed(2)} km</p>
            `
            : `
                <p>${stats7Days.totalSessions} séance(s) - ⏱️ ${formatDuration(stats7Days.totalDuration)} - 🤷 0 km</p>
            `;

    // Vérification pour les 30 derniers jours
    const thirtyDaysText = stats30Days.totalSessions === 0 
        ? "<p>Cela fait un certain temps que tu n'as pas pratiqué cette activité.</p>" 
        : stats30Days.totalDistance > 0
            ? `
                <p>${stats30Days.totalSessions} séance(s) - ⏱️ ${formatDuration(stats30Days.totalDuration)} - 🚶 ${stats30Days.totalDistance.toFixed(2)} km</p>
            `
            : `
                <p>${stats30Days.totalSessions} séance(s) - ⏱️ ${formatDuration(stats30Days.totalDuration)} - 🤷 0 km</p>
            `;

    // Afficher les résultats
    document.getElementById("stats").innerHTML = `
        <h2 class="stat-title-1">Résumé pour : <span class="highlight">${displayName.toUpperCase()}</span></h2>
        
        <section class="stat">
            <p>${generalText1}</p>
            <p>${generalText2}</p>
        </section>
        
        <section class="stat">
            <p><b>Sur les 7 derniers jours :</b></p>
            <p>${sevenDaysText}</p>
        </section>
        
        <section class="stat">
            <p><b>Sur les 30 derniers jours :</b></p>
            <p>${thirtyDaysText}</p>
        </section>
    `;

    // traitement des graphiques
    onTreateStatGraphic(specificActivitiesKeys);
}




// Fonction pour afficher les statistiques générales
function displayGeneralStats(nonPlannedActivitiesKeys) {
    // l'image de prévisualisation 
    imgStatActivityPreviewRef.src = "./images/icon-All.webp";
    

    if (!Object.keys(nonPlannedActivitiesKeys) || Object.keys(nonPlannedActivitiesKeys).length === 0) {
        document.getElementById("stats").innerHTML = `
            <p>Bienvenue ! Commence à enregistrer tes activités pour découvrir tes statistiques ici. 🚀</p>
        `;
        return;
    }

    // Calculs nécessaires
    const totalActivities = Object.keys(nonPlannedActivitiesKeys).length;
    

    const totalDuration = nonPlannedActivitiesKeys.reduce((sum, key) => {
        const activity = allUserActivityArray[key];
        if (activity && activity.duration) {
            return sum + durationToMinutes(activity.duration || "00:00:00");
        }
        return sum
    },0);



    const totalDistance = nonPlannedActivitiesKeys.reduce((sum, key) => {
        const activity = allUserActivityArray[key];
        if (activity && activity.distance) {
            return sum + parseFloat(activity.distance || 0);
        }
        return sum;
    }, 0);
    


    const firstActivityDate = new Date(Math.min(
        ...nonPlannedActivitiesKeys
            .map(key => {
                const activity = allUserActivityArray[key];
                return activity?.date ? new Date(activity.date) : null;
            })
            .filter(date => date instanceof Date && !isNaN(date)) // on garde les dates valides
    ));
    

    const formattedDate = firstActivityDate.toLocaleDateString("fr-FR");

    const favouriteActivityName = getMostPracticedActivity(nonPlannedActivitiesKeys); // Activité la plus pratiquée
    const displayName = activityChoiceArray[favouriteActivityName].displayName;



    // Texte convivial pour l'utilisateur
    document.getElementById("stats").innerHTML = `
        <h2 class="stat-title-1">Résumé général : </h2>
        <section class="stat">
            <p>
                Depuis le <b>${formattedDate}</b>, tu as pratiqué <b>${totalActivities} activité(s)</b>, 
                parcouru environ <b>${totalDistance.toFixed(2)} km</b> et accumulé un total de <b>${formatDuration(totalDuration)} heure(s)</b> de sport. 
            </p>
            <p>Activité la plus pratiquée : <b>${displayName}</b>.</p>

            <p>Bravo ! 👍</p>
        </section>
    `;

}



// Fonction de calcul de l'activité la plus pratiquée
function getMostPracticedActivity(dataKeys) {
    if (devMode === true) {
        console.log(" [STAT] General : calcul de l'activité la plus pratiquée.");
    }

    if (!Array.isArray(dataKeys) || dataKeys.length === 0) {
        return null;
    }

    const activityCounts = dataKeys.reduce((acc, key) => {
        const activity = allUserActivityArray[key];
        if (activity?.name) {
            acc[activity.name] = (acc[activity.name] || 0) + 1;
        }
        return acc;
    }, {});

    let mostPracticed = null;
    let maxCount = 0;

    for (const [activity, count] of Object.entries(activityCounts)) {
        if (count > maxCount) {
            mostPracticed = activity;
            maxCount = count;
        }
    }

    if (devMode === true) {
        console.log(`[STAT] Résultat : ${mostPracticed} avec ${maxCount} activités.`);
    }

    return mostPracticed;
}



// Reset les éléments du graphique
function onResetStatGraph() {
    if (devMode === true){console.log(`[STAT] Reset du tableau graphique` );};
    // Reset le tableau d'array
    document.getElementById("selectStatGraphYear").innerHTML= "";

    // Vide le tableau de toutes les activités non planifié
    statActivityNonPlannedKeys = [];


    monthStatNamesArray.forEach(e=>{
        // reset les progress bar et les nombres

        document.getElementById("stat-PB-" + e).style = "--progress: 0%;";
        document.getElementById("stat-number-" + e).innerHTML = "0";

        // Pour les distances
        document.getElementById("stat-PB-Distance-" + e).style = "--progress: 0%;";
        document.getElementById("stat-distance-" + e).innerHTML = "0";

        // Pour les heures
        document.getElementById("stat-PB-Duration-" + e).style = "--progress: 0%;";
        document.getElementById("stat-duration-" + e).innerHTML = "0";
    });


    //Reset la partie evaluation
    resetStatEvaluationGraph();
 
}



// Retour depuis Stat
function onClickReturnFromStat() {
    onResetStatGraph();

    //vide le fake selection
    selectorStatRef.innerHTML = "";

    // ferme le menu
    onLeaveMenu("Stat");
};