
// Les trophes possédés par l'utilisateur
let userRewardsArray = [],
    userSpecialRewardsArray = [],
    rewardsEligibleArray = [], //stockes les trophés auxquels l'utilisateur est éligible 
    specialRewardsEligibleArray = [],//les trophes special event auxquels l'utilisateur est éligible
    newRewardsToSee = [],//les nouveaux trophé obtenu. Vidé lorsque l'utilisateur quitte le menu récompense
    rewardAllActivityNonPlannedKeys = [],// tableau qui contient les clé des activités non planifiées
    rewardStdCategoryList = [];//contient la liste des catégorie pour séparation


// Reference 
let divTrophyFSAreaRef,
    imgRewardsFullScreenRef,
    pRewardsFSActivityNameRef,
    pRewardsFullScreenTitleRef,
    pRewardsFullScreenTextRef,
    divRewardsListRef,
    divSpecialRewardsListRef,
    btnVisionneuseRewardCloseRef,
    btnVisionneuseRewardLeftRef,
    btnVisionneuseRewardRightRef;






// ---------------------------------------- CLASS  -------------------------------------------

class RewardSeparator{
    constructor(text,parentRef){
        this.text = text;
        this.parentRef = parentRef;

        // Conteneur principal
        this.element = document.createElement("div");
        this.element.classList.add("reward-separator");

        // Fonction de rendu
        this.render();
    }

    render(){
        this.element.innerHTML = `
            <p class="reward-separator-title">${this.text}</p>
            <div class="rewards-grid" id="divRewardGrid_${this.text}"></div>
        `;
        // Insertion dans le parent
        this.parentRef.appendChild(this.element);
    }
}


class RewardCardEnabled{
    constructor(rewardKey,rewardTitle,imgRef,isNewReward,shareMode,parentRef,currentIndex,isSpecialReward){
        this.rewardKey = rewardKey;
        this.rewardTitle = rewardTitle;
        this.imgRef = imgRef;
        this.isNewReward = isNewReward;
        this.shareMode = shareMode;
        this.parentRef = parentRef;
        this.currentIndex = currentIndex;
        this.isSpecialReward = isSpecialReward;



        // Conteneur principal
        this.element = document.createElement("div");
        this.element.classList.add("reward-card", "unlocked");
        // Si nouveau reward, ajoute une classe
        if (this.isNewReward) {
            this.element.classList.add("newRewards");
        };

        //évènement
        this.element.addEventListener("click", (event) => {
            if (event.currentTarget.classList.contains("newRewards")) {
                event.currentTarget.classList.remove("newRewards");
            }
            onDisplayRewardVisionneuse(this.isSpecialReward,this.currentIndex);
        });


        // Fonction de rendu
        this.render();
    }

    render(){
        this.element.innerHTML = `
            <img class="rewardCardEnable" src="${this.imgRef}" loading="lazy">
            <p class="reward-title">${this.rewardTitle}</p>
        `;
        // Insertion dans le parent
        this.parentRef.appendChild(this.element);
    }



}



class RewardCardLocked{
    constructor(rewardKey,rewardTitle,condition,parentRef){
        this.rewardKey = rewardKey;
        this.rewardTitle = rewardTitle;
        this.condition = condition;
        this.parentRef = parentRef;

        // Conteneur principal
        this.element = document.createElement("div");
        this.element.classList.add("reward-card", "locked");

        //evènement
        this.element.addEventListener("click", () => {
            onClickRewardLocked(this.element);
        });

        // Fonction de rendu
        this.render();
    }

    render(){
        this.element.innerHTML = `
            <img class="rewardCardDisable" src="./Icons/badge-locked.webp" loading="lazy">
            <p class="reward-title">${this.rewardTitle}</p>
            <p class="reward-condition">${this.condition}</p></div>
        `;
        // Insertion dans le parent
        this.parentRef.appendChild(this.element);
    }


}

// -------------------------------Ecouteur d'évènements-----------------------------------


function onAddEventListenerForReward() {
    if (devMode === true){
        console.log("[EVENT-LISTENER] : Ajoute les évènements pour reward fullscreen");
    };

    //Fermer visionneuse reward
    const onClickRewardHidden = () => onHiddenFullscreenRewards();
    btnVisionneuseRewardCloseRef.addEventListener("click",onClickRewardHidden);
    onAddEventListenerInRegistry("rewards",btnVisionneuseRewardCloseRef,"click",onClickRewardHidden);

    //bouton visionneuse reward gauche
    const onClickPrevViewReward = () => onClickPreviewRewardVisionneuse();
    btnVisionneuseRewardLeftRef.addEventListener("click",onClickPrevViewReward);
    onAddEventListenerInRegistry("rewards",btnVisionneuseRewardLeftRef,"click",onClickPrevViewReward);

    //bouton visionneuse reward droite
    const onClickNextViewReward = () => onClickNextRewardVisionneuse();
    btnVisionneuseRewardRightRef.addEventListener("click",onClickNextViewReward);
    onAddEventListenerInRegistry("rewards",btnVisionneuseRewardRightRef,"click",onClickNextViewReward);

    //Le menu hall of Fame editor
    let btnMemoryEditorRef = document.getElementById("btnMenuMemory");
    const onClickMemoryEditor = () => onChangeMenu("Memory");
    btnMemoryEditorRef.addEventListener("click", onClickMemoryEditor);
    onAddEventListenerInRegistry("rewards",btnMemoryEditorRef,"click", onClickMemoryEditor);

}




// ----------------------------------   Fonction génériques-------------------------------





// Nombre d'activité pour une activité désigné
function onSearchActivityCountValue(data,activityTarget,countTarget){
    let allActivityTargetFound = data.filter(e=>{
        // Recupère toutes les d'activités concernés
        return e.name === activityTarget;
    });
    // Retour true ou false si le nombre désiré est atteind
    return allActivityTargetFound.length === countTarget;
};



// DISTANCE CUMULE pour un type d'activité. Est-ce que c'est dans la fourchette ? 
function onSearchActivitiesTotalDistanceRange(filteredKeys, bottomValue, topValue) {

    if (devMode === true) {
        console.log(`[REWARDS] recherche Distances cumulées Range entre : ${bottomValue} et ${topValue}`);
    }

    const totalDistance = filteredKeys.reduce((sum, key) => {
        const activity = allUserActivityArray[key];
        if (activity && activity.distance) {
            return sum + parseFloat(activity.distance || 0);
        }
        return sum;
    }, 0);

    if (devMode === true) {
        console.log("Valeur totale distance = " + totalDistance);
    }

    return totalDistance >= bottomValue && totalDistance <= topValue;
}




// DISTANCE CUMULE pour un type d'activité. Est-ce que c'est supérieure ? 
function onSearchActivitiesTotalDistanceSuperior(dataKeys, targetValue) {

    if (devMode === true) {
        console.log(`[REWARDS] recherche Distances cumulées supérieures à : ${targetValue}`);
    }

    const totalDistance = dataKeys.reduce((sum, key) => {
        const activity = allUserActivityArray[key];
        if (activity && activity.distance) {
            return sum + parseFloat(activity.distance);
        }
        return sum;
    }, 0);

    if (devMode === true) {
        console.log("Valeur totale distance = " + totalDistance);
    }

    return totalDistance >= targetValue;
}


// DISTANCE UNIQUE d'une activité spécifique. Est-ce que c'est dans la fourchette ? 
function onSearchActivityWithDistanceRange(dataKeys, bottomTarget, topTarget) {
    if (devMode === true){console.log(`[REWARDS] recherche d'une distance unique comprise entre : ${bottomTarget} et ${topTarget}`);};
    let targetFound = false;

    for (let e of dataKeys){
        if (devMode === true){console.log(Number(allUserActivityArray[e].distance));};
        if (Number(allUserActivityArray[e].distance) >= bottomTarget  && Number(allUserActivityArray[e].distance) <= topTarget) {
            targetFound = true;
            break;  
        };
    };

    return targetFound;
}



// DISTANCE UNIQUE d'une activité spécifique. Est-ce que c'est supérieur ? 
function onSearchActivityWithDistanceSuperior(dataKeys,targetValue) {

    if (devMode === true){console.log(`[REWARDS] recherche d'une distance unique supérieures à : ${targetValue}`);};
    let targetFound = false;

    for (let e of dataKeys){
        if (devMode === true){console.log(Number(allUserActivityArray[e].distance));};
        if (Number(allUserActivityArray[e].distance) >= targetValue) {
            targetFound = true;
            break;
        };
    };

    return targetFound;
}




// Fonction de recherche du nombre d'activité différentes
function onSearchVariousActivitiesNumber(allDataKeys,targetValue,currentActivity) {
    if (devMode === true){console.log(`[REWARDS] Recheche d'activite de type different. Nombre cible : ${targetValue} et activite en cours : ${currentActivity}`);};


    let allTypeActivityList = [];

    // Insertion de l'activité en cours dans la liste
    if (!allTypeActivityList.includes(currentActivity)) {
        allTypeActivityList.push(currentActivity);
    }

    // Recupère les catégories d'activités différentes
    for (let e of allDataKeys){
        if (!allTypeActivityList.includes(allUserActivityArray[e].name))  {
            allTypeActivityList.push(allUserActivityArray[e].name);
        };
        // Fin de traitement dès condition atteinte
        if (allTypeActivityList.length >= targetValue) {
            if (devMode === true){console.log(`[REWARDS] Cible atteinte. Interromp le traitement`);};
            break;
        };
    };
        

    if (devMode === true){
        console.log("[REWARDS] [GENERAL] de allTypeActivityList = " );
        console.log("Nombre d'activité différente : " + allTypeActivityList.length);
        console.log(allTypeActivityList);
    };

    return allTypeActivityList.length >= targetValue;
};











// ----------------------------------------- Ouverture menu récompense ------------------------------






async function onOpenMenuRewards(){
    if (devMode === true){console.log("[REWARDS] Ouverture menu Rewards");};

    //Création du menu principal
    onCreateMainMenuReward();

    // Reference les éléments
    divTrophyFSAreaRef = document.getElementById("divTrophyFSArea");
    imgRewardsFullScreenRef = document.getElementById("imgRewardsFullScreen");
    pRewardsFSActivityNameRef = document.getElementById("pRewardsFSActivityName");
    pRewardsFullScreenTextRef = document.getElementById("pRewardsFullScreenText");
    pRewardsFullScreenTitleRef = document.getElementById("pRewardsFullScreenTitle");
    divRewardsListRef = document.getElementById("divRewardsList");
    divSpecialRewardsListRef = document.getElementById("divSpecialRewardsList");
    divMemoryListRef = document.getElementById("divMemoryList");
    btnVisionneuseRewardCloseRef = document.getElementById("btnVisionneuseRewardClose");
    btnVisionneuseRewardLeftRef = document.getElementById("btnVisionneuseRewardLeft");
    btnVisionneuseRewardRightRef = document.getElementById("btnVisionneuseRewardRight");


    // affiche le nombre de trophé débloqué dans le menu contextuel
    let textInfoToDisplay = `Standards : ${userRewardsArray.length} / ${Object.keys(allRewardsObject).length}`;

    document.getElementById("customInfo").textContent = textInfoToDisplay;

    //reset le tableau de keys pour les memory
    memoryCardKeysList = [];

    //Chargement des memory depuis la base la première fois
    if (!isMemoryAlreadyLoaded){
        await onLoadMemoryFromDB();

        //récupère les keys
        memoryCardKeysList = Object.keys(allMemoryObjectList);
    }

    //gestion text si memory ou pas
    gestionTextAndBtnMemory();

    if (devMode === true) {console.log("memoryCardKeys: ", memoryCardKeysList);};

    //affichage des memory si présent
    if (memoryCardKeysList.length >= 1 ){
        onDisplayMemoryCardsList();
    }


    // Ajout les éléments pour la visionneuse
    onInitVisionneuse();


    // Prend les récompenses de l'utilisateur pour les afficher dans la liste
    onLoadUserRewardsList();
    
    // Ajout des évènements pour le menu rewards
    onAddEventListenerForReward();

    if (devMode === true) {
        onConsoleLogEventListenerRegistry();
    }



};

function onCreateMainMenuReward() {
    // Vide le précedent contenut
    let divMainMenuParentRef = document.getElementById("divMainBtnMenu");
    divMainMenuParentRef.replaceChildren();

    //crée les boutons
    //Retour
    new Button_main_menu(btnMainMenuData.return.imgRef,btnMainMenuData.return.text,() => onClickReturnFromRewards());

}
   
   

function onLoadUserRewardsList() {

    // ==========================================
    // RESET DU DOM
    // ==========================================

    // vide les listes
    divRewardsListRef.replaceChildren();
    divSpecialRewardsListRef.replaceChildren();

    // reset du tableau des catégories rencontrées
    rewardStdCategoryList = [];

    if (devMode === true){
        console.log("[REWARDS] Création de la liste des récompenses");
    }

    // ==========================================
    // OPTIMISATIONS STRUCTURELLES
    // ==========================================

    // Set = recherche O(1) au lieu de O(n) avec includes()
    const newRewardsSet = new Set(newRewardsToSee);
    const userRewardsSet = new Set(userRewardsArray);

    // cache des containers DOM des catégories
    const categoryContainerMap = {};


    // ==========================================
    // SPECIAL REWARDS
    // ==========================================

    if (userSpecialRewardsArray.length > 0) {

        // tri alpha
        userSpecialRewardsArray.sort();

        // fragment temporaire (insertion DOM unique)
        const fragmentSpecial = document.createDocumentFragment();

        userSpecialRewardsArray.forEach((e,index)=>{

            const reward = allSpecialEventsRewardsObject[e];

            // vérifie si reward nouveau
            const isNewReward = newRewardsSet.has(e);

            // création de la carte dans le fragment
            new RewardCardEnabled(
                e,
                reward.title,
                reward.imgRef,
                isNewReward,
                "special",
                fragmentSpecial, // insertion en mémoire
                index,
                true
            );   
        });

        // insertion finale dans le DOM
        divSpecialRewardsListRef.appendChild(fragmentSpecial);

    }
    else {

        // message si aucun special reward
        divSpecialRewardsListRef.textContent = "😅 Rien de spécial... pour l’instant !";

    }


    // ==========================================
    // REWARDS POSSÉDÉS PAR L'UTILISATEUR
    // ==========================================

    userRewardsArray.sort();

    userRewardsArray.forEach((e,index)=>{

        const reward = allRewardsObject[e];
        const activityName = reward.activityName;

        // si la catégorie n'existe pas encore
        if (!categoryContainerMap[activityName]) {

            rewardStdCategoryList.push(activityName);

            // création du séparateur de catégorie
            new RewardSeparator(activityName,divRewardsListRef);

            // récupération de la div de la catégorie
            // (1 seule fois au lieu de plusieurs getElementById)
            categoryContainerMap[activityName] =
                document.getElementById(`divRewardGrid_${activityName}`);
        }

        const parentRef = categoryContainerMap[activityName];

        const isNewReward = newRewardsSet.has(e);

        // création de la carte reward
        new RewardCardEnabled(
            e,
            reward.title,
            reward.imgRef,
            isNewReward,
            "standard",
            parentRef,
            index,
            false
        );

    });


    // ==========================================
    // REWARDS LOCKED
    // ==========================================

    const allRewardsKeys = Object.keys(allRewardsObject);

    // tri alpha
    allRewardsKeys.sort();

    // création du séparateur LOCKED
    new RewardSeparator("LOCKED",divRewardsListRef);

    const parentRef = document.getElementById("divRewardGrid_LOCKED");

    // fragment pour éviter insertions DOM multiples
    const fragmentLocked = document.createDocumentFragment();

    allRewardsKeys.forEach(key=>{

        // vérifie si l'utilisateur possède déjà la reward
        const isPossessed = userRewardsSet.has(key);

        if (!isPossessed) {

            // création carte locked dans fragment
            new RewardCardLocked(
                key,
                allRewardsObject[key].title,
                allRewardsObject[key].text,
                fragmentLocked
            );

        }

    });

    // insertion finale des locked rewards
    parentRef.appendChild(fragmentLocked);

}

// ---------------------------------------- VISUALISATION   GROS PLAN    --------------------------------


let currentRewardVisionneuseIndex = 0,
    isRewardVisionneuseModeSpecial = false,
    currentRewardVisionneuseKeysList = [];


// Affiche en grand la récompense
function onDisplayRewardVisionneuse(isSpecialRewards,currentIndex) {

    currentRewardVisionneuseIndex = currentIndex;
    isRewardVisionneuseModeSpecial = isSpecialRewards;

    // Charge les keys (standard ou special) selon le boolean
    currentRewardVisionneuseKeysList = isSpecialRewards ? [...userSpecialRewardsArray] : [...userRewardsArray]; 


    if (devMode === true){
        console.log("[REWARDS]  demande de visualisation de récompense : " + rewardName)
    ;};

    //Set le premier éléments
    onSetRewardVisionneuseData(currentRewardVisionneuseIndex);

    //initialise l'état des boutons de navigation GD
    updateRewardVisionneuseBtn();


    //Affiche
    document.getElementById("divFullScreenRewards").style.display = "flex";
};


function onClickNextRewardVisionneuse() {
    //actualise les boutons GD
    updateRewardVisionneuseBtn();

    animateChange("right");
}

function onClickPreviewRewardVisionneuse() {
    //actualise les boutons GD
    updateRewardVisionneuseBtn();

    animateChange("left");
}

function updateRewardVisionneuseBtn() {
    // Gestion bouton de droite
    if (currentRewardVisionneuseIndex == 0) {
        // Premier Masque bouton gauche
        btnVisionneuseRewardLeftRef.style.display = "none";
    }else{
        //affiche bouton gauche
        btnVisionneuseRewardLeftRef.style.display = "block";
    }


    if (currentRewardVisionneuseIndex >= (currentRewardVisionneuseKeysList.length - 1)) {
        // Si c'est le dernier masque btn de droite
        btnVisionneuseRewardRightRef.style.display = "none";

    }else{
        // Affiche bouton droite
        btnVisionneuseRewardRightRef.style.display = "block";
    }
}


function onSetRewardVisionneuseData(index) {

    let rewardName = currentRewardVisionneuseKeysList[index];

    // STANDARD REWARDS
    if (!isRewardVisionneuseModeSpecial) {
        // set les éléments et affiche
        pRewardsFSActivityNameRef.textContent = allRewardsObject[rewardName].activityName;
        imgRewardsFullScreenRef.src = allRewardsObject[rewardName].imgRef;

        pRewardsFullScreenTitleRef.textContent = allRewardsObject[rewardName].title;

        pRewardsFullScreenTextRef.textContent = `Tu as pratiqué ${allRewardsObject[rewardName].text}.`;

        // SPECIAL REWARDS
    }else{
        // set les éléments et affiche
        imgRewardsFullScreenRef.src = allSpecialEventsRewardsObject[rewardName].imgRef;
        pRewardsFSActivityNameRef.replaceChildren();

        pRewardsFullScreenTitleRef.textContent = allSpecialEventsRewardsObject[rewardName].title;

        pRewardsFullScreenTextRef.textContent = `Tu as ${allSpecialEventsRewardsObject[rewardName].text}.`;
    }
}


let isTrophyFSAnimating = false;

function animateChange(direction) {
    if (isTrophyFSAnimating) return; // empêche les clics multiples
    isTrophyFSAnimating = true;

    const outClass = direction === "right" ? "visionneuse-slide-out-left" : "visionneuse-slide-out-right";
    const inClass = direction === "right" ? "visionneuse-slide-in-right" : "visionneuse-slide-in-left";

    divTrophyFSAreaRef.classList.add(outClass);

    divTrophyFSAreaRef.addEventListener("animationend", function handler() {
        divTrophyFSAreaRef.removeEventListener("animationend", handler);

        currentRewardVisionneuseIndex = direction === "right"
        ? (currentRewardVisionneuseIndex + 1) % currentRewardVisionneuseKeysList.length
        : (currentRewardVisionneuseIndex - 1 + currentRewardVisionneuseKeysList.length) % currentRewardVisionneuseKeysList.length;

        onSetRewardVisionneuseData(currentRewardVisionneuseIndex);
        updateRewardVisionneuseBtn();

        divTrophyFSAreaRef.classList.remove(outClass);
        divTrophyFSAreaRef.classList.add(inClass);

        divTrophyFSAreaRef.addEventListener("animationend", function handler2() {
            divTrophyFSAreaRef.removeEventListener("animationend", handler2);
            divTrophyFSAreaRef.classList.remove(inClass);
            isTrophyFSAnimating = false; // libère le clic ici
        });
    });
}



// Masque la récompense qui était en grand plan
function onHiddenFullscreenRewards() {
    if (devMode === true){console.log("cache la div de visualisation de récompense");};
    document.getElementById("divFullScreenRewards").style.display = "none";
};



// récompense verrouillé

function onClickRewardLocked(itemRef) {
    // Ajout de l'effet de tremblement
    itemRef.classList.add('tremble');

    // Suppression de l'effet après l'animation
    setTimeout(() => {
        itemRef.classList.remove('tremble');
    }, 400);
}



// ----------------------------   PARTAGE IMAGES  --------------------------------













// ---------------------------------    OBTENTION-------------------------------------






function onCheckReward(currentActivitySavedName,currentActivityComment) {
    //le nom permet de rechercher selon le type d'activité
    //le commentaire permet de rechercher les évènements spéciaux via le code inclue dans le commentaire
    onInitRewardsVariable();


    //Récupères les valeurs cumulées des activités (tout et type en cours)
    let allActivitiesValues = getActivitiesCumulValue(currentActivitySavedName);
    console.log(allActivitiesValues);


    onTraiteCommunRewards(
        allActivitiesValues.allActivity,
        allActivitiesValues.variousActivitiesNumber,
        allActivitiesValues.oldestDate
    );


    //Traitement "de retour"
    // onCheckDeRetour(rewardAllActivityNonPlannedKeys);



    // Récupère uniquement les données concernant l'activité en question et non planifié
    let specificActivitiesKeys = Object.entries(allUserActivityArray)
        .filter(([key, value]) => value.name === currentActivitySavedName && value.isPlanned === false)
        .map(([key, value]) => key);


    // onSearchSpecifyRewards(currentActivitySavedName,specificActivitiesKeys);
    onTraiteRewardActivities(currentActivitySavedName,specificActivitiesKeys,allActivitiesValues.currentType);


    // SPECIAL EVENTS

    // control si des events sont en cours sinon , passe directement à l'affectation des récompenses
    if (Object.keys(specialEventKey).length > 0) {
        if (devMode === true){console.log("[REWARD] [SPECIAL-EVENT] présence d'un event. controle en cours");};

        // control le code du special event
        onSearchSpecialEventCode(currentActivityComment);

        // Traite les trophés définitifs à affecter à l'utilisateur
        onAffectFinalRewardsToUser();
    }else{
        // Traite les trophés définitifs à affecter à l'utilisateur
        if (devMode === true){console.log("[REWARD] [SPECIAL-EVENT] Aucun event en cours");};

        onAffectFinalRewardsToUser();
    }

}

function onSearchSpecialEventCode(currentActivityComment){
    let tempEligibleSpecialReward = [];
    // Pour chaque key de special event
    Object.keys(specialEventKey).forEach(key =>{
        // Recherche le code dans le texte et si contient
        if(currentActivityComment.includes(key)){
            if (devMode === true){console.log(" [REWARD] [SPECIAL-EVENT] code correspondant : ",key);};
            //ajoute le contenu des recompenses dans le tableau temporaire
            specialEventKey[key].forEach(item=>{
                tempEligibleSpecialReward.push(item);
            });
        };
    });

    // Puis ne garde que ce que l'utilisateur n'a pas déjà
    tempEligibleSpecialReward.forEach(e=>{
        if (!userSpecialRewardsArray.includes(e)) {
            specialRewardsEligibleArray.push(e);
        }else{
            if (devMode === true){console.log("[REWARD] [SPECIAL-EVENT] L'utilisateur possede déjà cette récompense");};
        };
    });

    if (devMode === true){console.log("[REWARD] [SPECIAL-EVENT] spacialRewardsEligibleArray :", specialRewardsEligibleArray);};

};



function onInitRewardsVariable() {
    // Reset la variable
    rewardsEligibleArray = [];
    specialRewardsEligibleArray = [];
    rewardAllActivityNonPlannedKeys = [];

    //filtre sur les clées des activités accomplits
    rewardAllActivityNonPlannedKeys = Object.entries(allUserActivityArray)
        .filter(([key, value]) => value.isPlanned === false)
        .map(([key, value]) => key);

    if (devMode === true){
        console.log("[REWARDS] retrait des activité planifié")
        console.log("Nbre activité retiré = " + (allUserActivityArray.length - rewardAllActivityNonPlannedKeys.length));
    ;};
}




//traitement  commun toutes activités

function onTraiteCommunRewards(allActivitiesValues,variousCount,oldestDate) {
    //récupère les keys des récompenses non spécifiques à une activité
    const communRewardDataKeys = Object.entries(allRewardsObject)
        .filter(([key, value]) => value.activityName === "COMMUN")
        .map(([key, value]) => key);
    
    console.log(communRewardDataKeys);
    
    communRewardDataKeys.forEach(rewardKey =>{
        //si l'utilisateur possede déjà le reward, ne traite pas
        if (userRewardsArray.includes(rewardKey)) {
            if (devMode === false){console.log(`[REWARDS] utilisateur possède déjà ${rewardKey}. Ne traite Pas.`);};
            return;
        }

        //sinon traite
        let currentRewardData = allRewardsObject[rewardKey];
        console.log(currentRewardData);


        switch (currentRewardData.category) {
            case "COMMUN-DURATION-CUMUL":
                onTraiteRewardCount(rewardKey, allActivitiesValues.duration, currentRewardData.target.count);
                break;
            case "COMMUN-DISTANCE-CUMUL":
                onTraiteRewardCount(rewardKey, allActivitiesValues.distance, currentRewardData.target.count);
                break;
            case "COMMUN-COUNT-CUMUL":
                onTraiteRewardCount(rewardKey, allActivitiesValues.count, currentRewardData.target.count);
                break;
            case "COMMUN-VARIOUS-COUNT":
                onTraiteRewardCount(rewardKey, variousCount, currentRewardData.target.count);
                break;
            case "COMMUN-ANNIVERSARY":
                hasReachedAnniversary(rewardKey, oldestDate, currentRewardData.target.count);
                break;
            default:
                break;
        }
    });

}

//Traitement anniversaire
function hasReachedAnniversary(rewardTarget,oldestDate, targetYears) {

    if (devMode === false){
        console.log(`[REWARDS] Test anniversaire pour : ${targetYears} ans`);
        console.log(`[REWARDS] Prémière date : ${oldestDate}. TargetValue : ${targetYears}`);
    };

    const now = new Date();

    const anniversaryDate = oldestDate;
    anniversaryDate.setFullYear(anniversaryDate.getFullYear() + targetYears);

    let isEligible = now >= anniversaryDate;
    if (isEligible) {
        rewardsEligibleArray.push(rewardTarget);
    }
    if (devMode === false){console.log("[REWARDS] Resultat : " + isEligible);};
};

// Traitement leveling activities
function onTraiteRewardActivities(currentActivitySavedName,specificActivitiesKeys,currentTypeValues) {
    
    console.log("currentTypeValues", currentTypeValues);

    //récupère les keys des récompenses spécifiques à l'activité
    const activityRewardDataKeys = Object.entries(allRewardsObject)
        .filter(([key, value]) => value.activityName === currentActivitySavedName)
        .map(([key, value]) => key);

        console.log(activityRewardDataKeys);

    //La key représente également le nom du rewards
    activityRewardDataKeys.forEach(rewardKey =>{

        //si l'utilisateur possede déjà le reward, ne traite pas
        if (userRewardsArray.includes(rewardKey)) {
            if (devMode === false){console.log(`[REWARDS] utilisateur possède déjà ${rewardKey}. Ne traite Pas.`);};
            return;
        }

        //sinon traite
        let currentRewardData = allRewardsObject[rewardKey];
        console.log(currentRewardData);

        switch (currentRewardData.category) {
            case "LEVELING":
                onTraiteRewardCount(rewardKey, currentTypeValues.count, currentRewardData.target.count);
                break;
            case "SPECIFIC-DISTANCE-CUMUL":
                onTraiteRewardCount(rewardKey, currentTypeValues.distance,
                    currentRewardData.target.count);
                break;
            case "SPECIFIC-DURATION-CUMUL":
                onTraiteRewardCount(rewardKey, currentTypeValues.duration,
                    currentRewardData.target.count);
                break;
            case "PERFORMANCE-DISTANCE-SUP":
                onTraiteRewardPerformanceSup(rewardKey,specificActivitiesKeys,"distance",currentRewardData.target.count);
                break;
            case "PERFORMANCE-DURATION-SUP":
                onTraiteRewardPerformanceSup(rewardKey,specificActivitiesKeys,"durationSeconds",currentRewardData.target.count);
                break;
            case "PERFORMANCE-DISTANCE-RANGE":
                onTraiteRewardPerformanceWithRange(
                    rewardKey,specificActivitiesKeys,"distance",
                    currentRewardData.target.minRange,currentRewardData.target.maxRange);
                break;
            case "PERFORMANCE-DURATION-RANGE":
                onTraiteRewardPerformanceWithRange(
                    rewardKey,specificActivitiesKeys,"durationSeconds",
                    currentRewardData.target.minRange,currentRewardData.target.maxRange);
                break;

            default:
                    console.error(`[REWARD] [ERREUR]: pas de traitement pour ${rewardKey}`);

                break;
        }

    });

}


//Traitement pour nombre spécifique égale ou plus
function onTraiteRewardCount(rewardTarget, dataValue, targetValue) {
    if (devMode === false){
        console.log(`[REWARDS] Test eligibilité pour : ${rewardTarget}`);
        console.log(`[REWARDS] dataValue : ${dataValue}. TargetValue : ${targetValue}`);
    };
    let isEligible = dataValue >= targetValue;//car il faut traiter si les gens l'ont utilisé avant la mise à jours
    if (isEligible) {
        rewardsEligibleArray.push(rewardTarget);
    }
    if (devMode === false){console.log("[REWARDS] Resultat : " + isEligible);};

}


function onTraiteRewardPerformanceWithRange(rewardTarget,filteredKeys,rangeType,minValue,maxValue) {
    if (devMode === false){console.log(`[REWARDS] Test eligibilité pour : ${rewardTarget}`);};

    let isEligible = onSearchActivityWithTypeRange(filteredKeys,rangeType,minValue,maxValue);
    if (isEligible) {
        rewardsEligibleArray.push(rewardTarget);
    }
    if (devMode === false){console.log("[REWARDS] Resultat : " + isEligible);};
}


// Fonction pour trouver une activité dont la distance ou la durée sont entre min et max
function onSearchActivityWithTypeRange(dataKeys, rangeType, bottomTarget, topTarget) {
    if (devMode === false){console.log(`[REWARDS] recherche d'une distance ou durée unique comprise entre : ${bottomTarget} et ${topTarget}`);};

    for (let e of dataKeys){
        const value = allUserActivityArray[e][rangeType];
        if (value >= bottomTarget && value <= topTarget) {
            return true;
        }
    }

    return false;
}



function onTraiteRewardPerformanceSup(rewardTarget,filteredKeys,targetType, targetValue) {
    if (devMode === false){console.log(`[REWARDS] Test eligibilité pour : ${rewardTarget}`);};

    let isEligible =  onSearchActivityWithValueSuperior(filteredKeys, targetType, targetValue);
    if (isEligible) {
        rewardsEligibleArray.push(rewardTarget);
    }
    if (devMode === false){console.log("[REWARDS] Resultat : " + isEligible);};

}

// DISTANCE // ou durée UNIQUE d'une activité spécifique. Est-ce que c'est supérieur ? 
function onSearchActivityWithValueSuperior(dataKeys, targetType, targetValue) {

    if (devMode === false){console.log(`[REWARDS] recherche d'une ${targetType} unique supérieures à : ${targetValue}`);};

    for (let e of dataKeys){
        if (allUserActivityArray[e][targetType] >= targetValue) { 
            if (devMode === false){console.log(`[REWARDS] Valeur trouvée :  ${allUserActivityArray[e][targetType]}`);};
            return true;
        };
    };

    return false;
}



// Fonction qui calcule les valeurs cumulées d'un type d'activité
function getActivitiesCumulValue(activityTarget) {

    // Log uniquement en mode debug
    if (devMode === false) {
        console.log(`[REWARDS] récupération des activités pour : ${activityTarget}`);
    }

    // Variables d'accumulation
    let allTotalDuration = 0,
        allTotalDistance = 0,
        allTotalCount = 0,
        specificTotalDuration = 0,
        specificTotalDistance = 0,
        specificTotalCount = 0;

    //Pour le traitement des types d'activités différentes    
    let allTypeActivityList = [];

    //Pour le traitement anniversary
    let oldestDate = null;


    // Parcours de toutes les activités utilisateur
    for (const key in allUserActivityArray) {

        // Récupération directe de l'objet activité
        const activity = allUserActivityArray[key];

        // Ignore immédiatement si activité planifiée
        if (activity.isPlanned) {
            continue;
        }

        // Traitement activité concernée
        if (activity.name === activityTarget) {
            // Addition de la durée convertie en secondes
            specificTotalDuration += activity.durationSeconds || 0;

            // Addition de la distance
            specificTotalDistance += activity.distance || 0;

            // Incrémentation du compteur
            specificTotalCount++;
        }

        //traitement de tous les activités (non planifiées évidement)

        // Addition de la durée convertie en secondes
        allTotalDuration += activity.durationSeconds || 0;

        // Addition de la distance
        allTotalDistance += activity.distance || 0;

        // Incrémentation du compteur
        allTotalCount++;

        //Traitement type d'activité différentes
        if (!allTypeActivityList.includes(activity.name)) {
            allTypeActivityList.push(activity.name);
        }


        //traitement date plus ancienne pour anniversaire
        let activityDate = new Date(activity.date);

        if (oldestDate === null || activityDate < oldestDate) {
            oldestDate = activityDate;
        }

    }

    // Retour des valeurs cumulées
    return { currentType : {
            duration: specificTotalDuration,
            distance: specificTotalDistance,
            count: specificTotalCount
        },
        allActivity : {
            duration: allTotalDuration,
            distance: allTotalDistance,
            count: allTotalCount
        },
        variousActivitiesNumber :allTypeActivityList.length,
        oldestDate : oldestDate
        
    };
}


//De retour
function onCheckDeRetour(activityKeys) {
    if (userRewardsArray.includes("DE-RETOUR")) {
        if (devMode === true){console.log(`[REWARDS] [COMMUN]  : dispose déjà : DE-RETOUR`);};
        return
    }   
    if (!activityKeys || activityKeys.length < 2) {
        return false;
    }

    const dates = activityKeys
        .map(key => {
            const activity = allUserActivityArray[key];
            return activity?.date ? new Date(activity.date) : null;
        })
        .filter(date => date instanceof Date && !isNaN(date))
        .sort((a, b) => a - b); // Tri des dates dans l'ordre chronologique

    for (let i = 1; i < dates.length; i++) {
        const diffInMs = dates[i] - dates[i - 1];
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
        if (diffInDays > 30) {
            rewardsEligibleArray.push("DE-RETOUR");
            if (devMode === true){console.log(`[REWARDS] [COMMUN]  : DE-RETOUR resultat : Eligible`)};   
            return true;
        }
    }

    return false;
}





// Traite les trophés définitifs à affecter à l'utilisateur
async function onAffectFinalRewardsToUser() {
    
    if (devMode === false){
        console.log("[REWARDS] Trouve les trophés réelle à affecter à l'USER ");
        console.log("[REWARDS] User éligible à : ",rewardsEligibleArray);
        console.log("[REWARDS] déjà possédé par l'user : ",userRewardsArray);
    };

    if (devMode === true){console.log("[REWARDS] ajout des récompenses à l'utilisateur ");};
    // Ajout des trophes dans le tableau de l'utilisateur
    rewardsEligibleArray.forEach(e=>{
        userRewardsArray.push(e);
    });

    // Ajout des special event dans le tableau de l'utilisateur
    specialRewardsEligibleArray.forEach(e=>{
        userSpecialRewardsArray.push(e);
    });

    if (devMode === true){
        console.log("[REWARDS] toutes les récompenses utilisateur : ");
        console.log(userRewardsArray.sort());
    };


    // Lance l'event reward obtenu si besoin
    if (rewardsEligibleArray.length >= 1 || specialRewardsEligibleArray.length >= 1) {


        // Insertion reward standard dans la base de donnée
        await updateDocumentInDB(rewardsStoreName, (doc) => {
            doc.rewards = userRewardsArray;
            return doc;
        });

        // Insertion special rewards dans la base de donnée
        await updateDocumentInDB(specialRewardsStoreName, (doc) => {
            doc.specialRewards = userSpecialRewardsArray;
            return doc;
        });


        //fusion de toutes les récompenses (standard et special) pour notification
        let allEligibleRewards = [...rewardsEligibleArray, ...specialRewardsEligibleArray];

        // Recompense in APP
        rewardsEvent(allEligibleRewards);
        // Recompense in MOBILE
        onReceiveNotifyMobileEvent(allEligibleRewards);
    }else{
        if (devMode === true){console.log(`[REWARDS] Aucun traitement necessaire`);};
    }

}





// Animation des reward
function rewardsEvent(newRewardsList) {

    newRewardsToSee = newRewardsList;//pour la visualisation des nouveaux rewards dans le menu rewards


    // *    *   * INTEGRER ICI une animation dans l'application*  *   *

    let newRewardsCount = newRewardsToSee.length;

    onShowPopupReward(newRewardsCount);

    //  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *

    
}




// ------------------------------- POPUP NOTIFICATION REWARD ----------------------------------------


function onShowPopupReward(count = 1) {
    const overlay = document.getElementById('reward-notify-overlay');
    const container = overlay.querySelector('.reward-notify-container');
    const countEl = overlay.querySelector('.reward-notify-count');

    countEl.textContent = count;

    overlay.classList.remove('hidden');
    container.classList.remove('fade-out');

    // reset état
    container.style.opacity = '0';

    // force reflow
    void container.offsetWidth;

    container.style.opacity = '1';

    const DISPLAY_DURATION = 2500;

    setTimeout(() => {
        container.classList.add('fade-out');
    }, DISPLAY_DURATION);

    setTimeout(() => {
    overlay.classList.add('hidden');
    }, DISPLAY_DURATION + 750);
}





//    -----------------------------     QUITTE MENU       ----------------------------------------------





   
//    Reset le menu des récompenses

function onResetRewardsMenu() {

    //vide de contenu
    imgRewardsFullScreenRef= "";
    pRewardsFSActivityNameRef = "";
    pRewardsFullScreenTextRef = "";
    pRewardsFullScreenTitleRef = "";
    divRewardsListRef.replaceChildren();
    divSpecialRewardsListRef.replaceChildren();
    divMemoryListRef.replaceChildren();

    //vide les références
    divRewardsListRef = null;
    divSpecialRewardsListRef = null;
    divMemoryListRef = null;
    btnVisionneuseRewardRightRef = null;
    btnVisionneuseRewardLeftRef = null;
    btnVisionneuseRewardCloseRef = null;
    divTrophyFSAreaRef = null;

    //vide les variables
    newRewardsToSee = [];
    rewardAllActivityNonPlannedKeys = [];
}
   
   
   
   
   // Retour depuis Trophy
function onClickReturnFromRewards() {

    onResetRewardsMenu();

    onClearVisionneuse();
   
    // ferme le menu
    onLeaveMenu("Rewards");
}



