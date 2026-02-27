let evaluations = {
  "2026-01": {//Toujours le mois à deux digits
    evaluationDate: "2026-02-02",//Peut servir plus tard pour des statistiques
    modificationDate : "YYYY-MM-DD",//Peut servir pour des statistiques
    appreciation: 1,        // numéraire
    marquant: "INJURY",    // SPECIAL | INJURY | GOAL | RESTART | OBSTACLE | noSet
    comment: "Je me suis cassé le pied"
  }
 
};



// Pour la gestion des évaluations et du popup
let evaluationReminders = {
  "2026-01": {
    reminderShown: true
  }
};

let isEvaluationPopupOpen = false,//utilisé pour éviter le double affichage
  isEvaluationNotifyOpen = false,//utilisé pour éviter le double affichage
  dateLimiteEvaluation = 27;//entre le premier et le 7 du mois



// Référence
let selectEvalAppreciationRef,
    selectEvalMarquantRef,
    pEvalMarquantRenduRef,
    textareaEvalCommentRef,
    divPopupEvaluationRef,
    divPopupEvaluationContentRef,
    btnReturnEvalEditorRef,
    btnValideEvalEditorRef,
    pEvaluationEditorMontTitleRef;

const EVAL_MARQUANT_DATA = {
  "noSet":{
    value :"noSet",
    displayTitle:"Néant",
    imgRef :"./Icons/mss_no-set.webp",
    precision :"Néant",
    placeholder : "Exprimez votre ressenti sur ce mois"
  },
  "SPECIAL":{
    value :"SPECIAL",
    displayTitle:"Mois spécial",
    imgRef :"./Icons/icon_eval-marquant-special.webp",
    precision :"Evènement positif marquant.",
    placeholder : "Ex. : événement marquant, course importante, moment particulier…"
  },
  "INJURY":{
    value :"INJURY",
    displayTitle:"Blessure",
    imgRef :"./Icons/icon_eval-marquant-blessure.webp",
    precision :"Contrainte physique",
    placeholder : "Ex. : blessure, douleur persistante…"
  },
  "GOAL":{
    value :"GOAL",
    displayTitle:"Objectif accompli",
    imgRef :"./Icons/icon_eval-marquant-accompli.webp",
    precision :"Objectif défini et atteint",
    placeholder : "Ex. : objectif mensuel atteint, plan respecté, défi validé…"
  },
  "RESTART":{
    value :"RESTART",
    displayTitle:"Reprise",
    imgRef :"./Icons/icon_eval-marquant-reprise.webp",
    precision :"Retour après pause, blessure",
    placeholder : "Ex. : reprise en douceur après une pause, blessure…"
  },
  "OBSTACLE":{
    value :"OBSTACLE",
    displayTitle:"Contrainte",
    imgRef :"./Icons/icon_eval-marquant-contrainte.webp",
    precision :"Facteur extérieur limitant",
    placeholder : "Ex. : travail, météo, manque de temps…"
  },
};


// APPRECIATION

// 0 => Non évalué
// 1 => Insatisfait
// 2 => Déçu
// 3 => Mitigé
// 4 => Satisfait
// 5 => Très content

const EVAL_APPRECIATION_DATA = {
  0 : {
    value : 0,
    displayTitle:"Non évalué",
    imgRef :"./Icons/mss_no-set.webp"
  },
    1 : {
    value :1,
    displayTitle:"Insatisfait",
    imgRef :"./Icons/mss_eval-red.webp"
  },
    2 : {
    value :2,
    displayTitle:"Déçu",
    imgRef :"./Icons/mss_eval-yellow.webp"
  },
    3 : {
    value :3,
    displayTitle:"Mitigé",
    imgRef :"./Icons/mss_eval-grey.webp"
  },
    4 : {
    value :4,
    displayTitle:"Satisfait",
    imgRef :"./Icons/mss_eval-green-light.webp"
  },
    5 : {
    value :5,
    displayTitle:"Très content",
    imgRef :"./Icons/MSS_KPI-GREEN.webp"
  }
}

let initialEvalData = {},
  evalEditorMode = "",//CREATION ou MODIFICATION
  currentEvaluationMonth = "";








// Référencement du popup
function onReferenceEvaluationPopup() {
  selectEvalAppreciationRef = document.getElementById("selectEvalAppreciation");
  textareaEvalCommentRef = document.getElementById("textareaEvalComment");
  selectEvalMarquantRef = document.getElementById("selectEvalMarquant");
  divPopupEvaluationRef = document.getElementById("divPopupEvaluation");
  divPopupEvaluationContentRef = document.getElementById("divPopupEvaluationContent");
  btnReturnEvalEditorRef = document.getElementById("btnReturnEvalEditor");
  btnValideEvalEditorRef = document.getElementById("btnValideEvalEditor");
  pEvaluationEditorMontTitleRef = document.getElementById("pEvaluationEditorMontTitle");
}

// Vide les references
function onEmptyEvaluationPopupReference(){
  selectEvalAppreciationRef = null;
  textareaEvalCommentRef = null;
  selectEvalMarquantRef = null;
  divPopupEvaluationRef = null;
  divPopupEvaluationContentRef = null;
  btnReturnEvalEditorRef = null;
  btnValideEvalEditorRef = null;
  pEvaluationEditorMontTitleRef = null;
}

// Ecouteur d'évènement
function addEventListenerForEvalPopup() {
  // appréciation
  const onChangeAppreciation = (event) => onChangeEvalAppreciation(event.target.value);
  selectEvalAppreciationRef.addEventListener("change",onChangeAppreciation);
  onAddEventListenerInRegistry("evaluationPopup",selectEvalAppreciationRef,"change",onChangeAppreciation);

  //marquant
  const onChangeMarquant = (event) => onChangeEvalMarquant(event.target.value);
  selectEvalMarquantRef.addEventListener("change",onChangeMarquant);
  onAddEventListenerInRegistry("evaluationPopup",selectEvalMarquantRef,"change",onChangeMarquant);


  // click hors et en zone
  const onClickOutsideArea = () => onCloseEvalPopup();
  divPopupEvaluationRef.addEventListener("click",onClickOutsideArea);
  onAddEventListenerInRegistry("evaluationPopup",divPopupEvaluationRef,"click",onClickOutsideArea);

  const onClickInsideArea = (event) => onClickInsideEvalPopupContent(event);
  divPopupEvaluationContentRef.addEventListener("click", onClickInsideArea);
  onAddEventListenerInRegistry("evaluationPopup",divPopupEvaluationContentRef,"click", onClickInsideArea);

  //retour
  const onClickReturnEval = () => onCloseEvalPopup();
  btnReturnEvalEditorRef.addEventListener("click",onClickReturnEval);
  onAddEventListenerInRegistry("evaluationPopup",btnReturnEvalEditorRef,"click",onClickReturnEval);

  //Valider
  const onClickValideEval = () => onValideEval();
  btnValideEvalEditorRef.addEventListener("click",onClickValideEval);
  onAddEventListenerInRegistry("evaluationPopup",btnValideEvalEditorRef,"click",onClickValideEval);
}




function onConvertEvalMonth(monthTarget) {
  let evalMonthRef = {
    "01" : "Janvier",
    "02" : "Février",
    "03" : "Mars",
    "04" : "Avril",
    "05" : "Mai",
    "06" : "Juin",
    "07" : "Juillet",
    "08" : "Aout",
    "09" : "Septembre",
    "10" : "Octobre",
    "11" : "Novembre",
    "12" : "Décembre"
  };


  //format monthTarget YYYY-MM
  //séparation
  const [year, month] = monthTarget.split("-");

  let monthText = evalMonthRef[month];

  return `${monthText} ${year}`;
}







// Demande d'évaluation
function onAskEvaluation(monthTarget) {

  currentEvaluationMonth = monthTarget;
  isEvaluationPopupOpen = true;


  //vérifie le monthTarget dans la base
  let evaluationKeys = Object.keys(evaluations);

  let isKeysExist = evaluationKeys.includes(currentEvaluationMonth);


  //si Existe, ouvre le popup en modification
  if (isKeysExist) {
    onDisplayModifyEvaluation(currentEvaluationMonth);
    console.log("Evaluation : Mois présent. Ouvre en modification");

  }else{
    //si Existe pas, ouvre en création
    onDisplayNewEvaluation(currentEvaluationMonth);
    console.log("Evaluation : Mois non présent. Création d'une nouvelle évaluation");
  }

  

}



// Ouverture du popup evaluation
function onDisplayNewEvaluation(monthTarget) {
   evalEditorMode = "CREATION";

  // Lancement du référencement
  onReferenceEvaluationPopup();

  //Génération des éléments pour appréciation et marquant
  onGenerateEvalOptionAppreciation();
  onGenerateEvalOptionMarquant();

  //reset les éléments
  selectEvalAppreciationRef.value = EVAL_APPRECIATION_DATA[0].value;
  onChangeEvalAppreciation(EVAL_APPRECIATION_DATA[0].value);
  selectEvalMarquantRef.value = EVAL_MARQUANT_DATA["noSet"].value;
  onChangeEvalMarquant(EVAL_MARQUANT_DATA["noSet"].value);
  textareaEvalCommentRef.value = "";
  pEvaluationEditorMontTitleRef.textContent = onConvertEvalMonth(monthTarget);

  // Ecouteur d'évènement
  addEventListenerForEvalPopup();

  // Affiche
  divPopupEvaluationRef.style.display = "flex";
}










function onGenerateEvalOptionMarquant() {

  //Vide le parent
  selectEvalMarquantRef.innerHTML = "";

  // Génération des éléments pour marquants
  let marquantKeys = Object.keys(EVAL_MARQUANT_DATA);

  // Pour chaque clé
  marquantKeys.forEach(key=>{
    let marquantData = EVAL_MARQUANT_DATA[key];

    //Crée une option
    let newOption = document.createElement("option");
    newOption.value = marquantData.value;
    newOption.textContent = marquantData.displayTitle;

    //et l'insère

    selectEvalMarquantRef.appendChild(newOption);
  });
}



function onGenerateEvalOptionAppreciation() {
  //vide la parent
  selectEvalAppreciationRef.innerHTML = "";

  let appreciationKeys = Object.keys(EVAL_APPRECIATION_DATA);

  //Pour chaque clé
  appreciationKeys.forEach(key=>{
    let evaluationData = EVAL_APPRECIATION_DATA[key];

    //Crée une option
    let newOption = document.createElement("option");
    newOption.value = evaluationData.value;
    newOption.textContent = evaluationData.displayTitle;

    //Et l'insère
    selectEvalAppreciationRef.appendChild(newOption);

  });
}




//changement de marquant
function onChangeEvalMarquant(value) {
  let newValue = value;

  // Set le placeholder selon 
  textareaEvalCommentRef.placeholder = EVAL_MARQUANT_DATA[newValue].placeholder;

  //Set l'image background du sélecteur
  selectEvalMarquantRef.style.backgroundImage = `url('${EVAL_MARQUANT_DATA[newValue].imgRef}')`;

}



//changement d'appreciation
function onChangeEvalAppreciation(value) {
  let newValue= value;

  //Set l'image background du sélecteur
  selectEvalAppreciationRef.style.backgroundImage = `url('${EVAL_APPRECIATION_DATA[newValue].imgRef}')`;


   //Traitement champ obligatoire. Enlève le rouge si correspondant pas à 0
   if (newValue !== 0 && selectEvalAppreciationRef.classList.contains("fieldRequired")) {
    selectEvalAppreciationRef.classList.remove("fieldRequired");
   }
}










// ---------------------------------------- MODIFICATION ---------------------------------------






// Ouverture du popup evaluation
function onDisplayModifyEvaluation(monthTarget) {
  evalEditorMode = "MODIFICATION";

  //récupère les données selon la date choisie
  initialEvalData = { ...evaluations[monthTarget] };

  // Lancement du référencement
  onReferenceEvaluationPopup();

  //Génération des éléments pour appréciation et marquant
  onGenerateEvalOptionAppreciation();
  onGenerateEvalOptionMarquant();

  //Set les éléments
  selectEvalAppreciationRef.value = initialEvalData.appreciation;
  onChangeEvalAppreciation(initialEvalData.appreciation);
  selectEvalMarquantRef.value = initialEvalData.marquant;
  onChangeEvalMarquant(initialEvalData.marquant);
  textareaEvalCommentRef.value = initialEvalData.comment;
  pEvaluationEditorMontTitleRef.textContent = onConvertEvalMonth(monthTarget);


  addEventListenerForEvalPopup();

  // Affiche
  divPopupEvaluationRef.style.display = "flex";
}











// ------------------------------------------ VALIDATION -------------------






async function onValideEval() {
  //regarde si le champ obligatoire est remplit (apprecation)

  if(Number(selectEvalAppreciationRef.value) === 0){
    //Ajoute la class rouge
    selectEvalAppreciationRef.classList.add("fieldRequired");

    if (devMode === true) {
      console.log("Evaluation : Champ obligatoire non renseigné");
    }

    //Envoie une notification
    onShowNotifyPopup("inputIncrementEmpty");

    //arret la séquence
    return
  }


  //Si modification, regarde si sauvegarde nécessaire
  if (evalEditorMode === "MODIFICATION") {
    console.log("Traitement modification evaluation");

    let modifySaveRequired = onCheckIfEvalModifySaveRequired();

    if (modifySaveRequired) {
      console.log("Modification effectué, sauvegarde justifiée");
    
      //formatage
      let dataToSave = onFormatEvalBeforeSave(evalEditorMode);

      //sauvegarde dans l'array
      evaluations[currentEvaluationMonth] = dataToSave;

      //ICI détecter si le module stat evaluation est présent pour mise à jour visuelle
      onCheckIfStatEvalUpdateRequired(currentEvaluationMonth);

      if (devMode === true) {
        console.log("dataToSave = ", dataToSave);
      }


      // Sauvegarde la modification en base
      await updateDocumentInDB(evaluationStoreName, (doc) => {
        doc.data = evaluations;
        return doc;
      });

      onShowNotifyPopup("evaluationModify");

    }else{
      console.log("Aucune modification. Traitement sauvegarde annulé");
    }
  }else{
    //traitement si création

    //formatage
    let dataToSave = onFormatEvalBeforeSave(evalEditorMode);
      
    //sauvegarde dans l'array
    evaluations[currentEvaluationMonth] = dataToSave;


    //ICI détecter si le module stat evaluation est présent pour mise à jour visuelle
    onCheckIfStatEvalUpdateRequired(currentEvaluationMonth);

    if (devMode === true) {
      console.log("dataToSave = ", dataToSave);
    }


    // Sauvegarde la modification en base
    await updateDocumentInDB(evaluationStoreName, (doc) => {
      doc.data = evaluations;
      return doc;
    });

    onShowNotifyPopup("evaluationModify");

  }

  //ferme le popup
  onCloseEvalPopup();
}


//vérification si actualisation stat eval nécessaire
function onCheckIfStatEvalUpdateRequired(monthTarget) {
  //regarde si deux images avec l'id du mois sont existant

  const imgEvaluationID = `imgStatEvalAppreciation_${monthTarget}`,
    imgMarquantID = `imgStatEvalMarquant_${monthTarget}`;

  const imgAppreciationRef = document.getElementById(imgEvaluationID),
    imgMarquantRef = document.getElementById(imgMarquantID);

  if (imgAppreciationRef !== null && imgMarquantRef !== null) {
    console.log("Actualisation affichage requis");

    //Récupère les éléments
    let appreciationValue = evaluations[monthTarget].appreciation,
    marquantValue = evaluations[monthTarget].marquant;

    //Set les nouvelles images
    imgAppreciationRef.src = EVAL_APPRECIATION_DATA[appreciationValue].imgRef;
    imgMarquantRef.src = EVAL_MARQUANT_DATA[marquantValue].imgRef; 

  }

}

// Vérification si sauvegarde nécessaire
function onCheckIfEvalModifySaveRequired() {
  //création d'une liste de champs à comparer

  const fieldsToCompare = [
    { oldValue: initialEvalData.appreciation, newValue: Number(selectEvalAppreciationRef.value)},
    { oldValue: initialEvalData.marquant, newValue: selectEvalMarquantRef.value},
    { oldValue: initialEvalData.comment, newValue: textareaEvalCommentRef.value}
  ];

  // Vérification si une différence est présente
  // some s'arrete automatiquement si il y a une différence
  const updateDataRequiered = fieldsToCompare.some(field => field.oldValue != field.newValue);

  return updateDataRequiered;
}


function onFormatEvalBeforeSave(editMode) {

  //formatage date
  let dateToday =  new Date(),
  formatedDate = dateToday.toISOString().split('T')[0]; // Format YYYY-MM-DD

  // Formatage commentaire (taille max)
  let textComment = textareaEvalCommentRef.value;
  if (textComment.length > 250) {
    textComment = textComment.slice(0, 250);
  }


 let dataToSave = {};


 if (editMode ==="MODIFICATION") {
  //mise en object avec la date de modification et on garde la date de création
  dataToSave = {
    evaluationDate: initialEvalData.evaluationDate,
    modificationDate : formatedDate,
    appreciation : Number(selectEvalAppreciationRef.value),
    marquant: selectEvalMarquantRef.value,
    comment :textComment
  };
 }else{
  //mise en object avec la date de création. Date de modification vide
  dataToSave = {
    evaluationDate: formatedDate,
    modificationDate : "",
    appreciation : Number(selectEvalAppreciationRef.value),
    marquant: selectEvalMarquantRef.value,
    comment :textComment
  };
 }
  

  return dataToSave;
}



// Quitte le popup
function onCloseEvalPopup() {
  divPopupEvaluationRef.style.display = "none";

  //retirer les écoutes d'évènement
  onRemoveEventListenerInRegistry(["evaluationPopup"]);

  isEvaluationPopupOpen = false;

}

// Empeche de fermer la div lorsque l'utilisateur clique dans cette zone
function onClickInsideEvalPopupContent(event) {
    event.stopPropagation();
}






// ------------------Partie statistique evaluation------------------------

//Si statistique général, la div principale sera en display flex sinon
//en display none.
//On se basera sur le display pour savoir si c'est en cours d'affichage ou non



function  onGenerateEvalMonthItem(yearTarget){
  //vide le parent
  let monthAreaParentRef = document.getElementById("divEvalStatMonth");
    monthAreaParentRef.innerHTML = "";

  const monthNameArray = [
    "Jan","Fév","Mars","Avr","Mai","Juin","Jui",
    "Aout","Sept","Oct","Nov","Déc"
  ];


  for (let i = 1; i <= 12; i++) {
    //12 pour 12 mois de l'années


    //contruction de la keys
    const month2Digits = String(i).padStart(2, '0');
    let monthKey = `${yearTarget}-${month2Digits}`;

    // récupère la fourchette des mois des activités existantes
    let monthRange = onFindEvalMonthRange();
    //regarde si le mois en question est antérieur ou supérieur aux spectres des activités
    let isMonthInRange = isYearEvalMonthInRange(monthKey, monthRange.firstMonthEver, monthRange.lastMonthEver);

    if (devMode === true) {
      console.log("Traitement boucle mensuel");
      console.log("CurrentMonthKey : ", monthKey);
      console.log("isMonthInRange ? ", isMonthInRange);
      console.log("monthRange :" ,monthRange);
    }


    //si hors du spectre
    if (!isMonthInRange) {  
      //On grise

      //Création de la div du mois
      let newDivMonth = document.createElement("div");
      newDivMonth.classList.add("eval-month-disabled");

      //création du span pour le texte
      let newSpanMonthText = document.createElement("span");
      newSpanMonthText.textContent = monthNameArray[i-1];

      //insertion du span dans la div
      newDivMonth.appendChild(newSpanMonthText);

      //insertion de la div mensuel
      monthAreaParentRef.appendChild(newDivMonth);
        


    // Sinon est qu'une clé correspond ?
    }else if (Object.keys(evaluations).includes(monthKey)){

      //Récupère les éléments
      let appreciationValue = evaluations[monthKey].appreciation,
        marquantValue = evaluations[monthKey].marquant;

      //Création de la div du mois (cliquable)
      let newDivMonth = document.createElement("div");
      newDivMonth.classList.add("eval-month-enabled");
      newDivMonth.addEventListener("click", ()=> onAskEvaluation(monthKey));


      //création de la div des images
      let newDivImg = document.createElement("div");
      newDivImg.classList.add("eval-month-img");

      //création des images
      let newImgAppreciation = document.createElement("img");
      newImgAppreciation.src = EVAL_APPRECIATION_DATA[appreciationValue].imgRef;
      newImgAppreciation.id = `imgStatEvalAppreciation_${monthKey}`;//id utilisé lors d'une modification pour réactualisation

      let newImgMarquant = document.createElement("img");
      newImgMarquant.src = EVAL_MARQUANT_DATA[marquantValue].imgRef;
      newImgMarquant.id = `imgStatEvalMarquant_${monthKey}`;//id utilisé lors d'une modification pour réactualisation

      //création du span pour le texte
      let newSpanMonthText = document.createElement("span");
      newSpanMonthText.textContent = monthNameArray[i-1];


      //insertion des images dans la div image
      newDivImg.appendChild(newImgAppreciation);
      newDivImg.appendChild(newImgMarquant);

      newDivMonth.appendChild(newDivImg);

      //insertion du span dans la div
      newDivMonth.appendChild(newSpanMonthText);

      //insertion de la div mensuel
      monthAreaParentRef.appendChild(newDivMonth);



        //aucune clé correspondante
    }else{
      //on met les deux éléments avec l'image non évaluée


      //Création de la div du mois (clicable)
      let newDivMonth = document.createElement("div");
      newDivMonth.classList.add("eval-month-enabled");
      newDivMonth.addEventListener("click", ()=> onAskEvaluation(monthKey));

      //création de la div des images
      let newDivImg = document.createElement("div");
      newDivImg.classList.add("eval-month-img");

      //création des images
      let newImgAppreciation = document.createElement("img");
      newImgAppreciation.src = "./Icons/mss_no-set.webp";
      newImgAppreciation.id = `imgStatEvalAppreciation_${monthKey}`;//id utilisé lors d'une modification pour réactualisation

      let newImgMarquant = document.createElement("img");
      newImgMarquant.src = "./Icons/mss_no-set.webp";
      newImgMarquant.id = `imgStatEvalMarquant_${monthKey}`;//id utilisé lors d'une modification pour réactualisation

      //création du span pour le texte
      let newSpanMonthText = document.createElement("span");
      newSpanMonthText.textContent = monthNameArray[i-1];


      //insertion des images dans la div image
      newDivImg.appendChild(newImgAppreciation);
      newDivImg.appendChild(newImgMarquant);

      newDivMonth.appendChild(newDivImg);

      //insertion du span dans la div
      newDivMonth.appendChild(newSpanMonthText);

      //insertion de la div mensuel
      monthAreaParentRef.appendChild(newDivMonth);

    }

      
  }
}


//recupère le premiers et le dernier mois contenant des activités 
function  onFindEvalMonthRange(){


  // Le mois en cours au format "YYYY-MM"
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const lastMonth = `${year}-${month}`;


  //Le premier tout d'activité (non planifié) au format "YYYY-MM"
  const firstMonth = getOldestYearMonth(allUserActivityArray);


  const monthRange = {
    firstMonthEver :firstMonth,
    lastMonthEver : lastMonth
  };

  return monthRange;
};


function  isYearEvalMonthInRange(date, min, max) {

  if (devMode === true) {
    console.log(`verification Range : date : ${date}, min = ${min}, max = ${max}`);
  }


  return date >= min && date <= max;
};



function getOldestYearMonth(allUserActivityArray) {
  if (!allUserActivityArray || typeof allUserActivityArray !== "object") {
    return null;
  }

  let oldestDate = null;

  for (const item of Object.values(allUserActivityArray)) {
    if (!item || item.isPlanned === true) continue;

    const date = item.date;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;

    if (oldestDate === null || date < oldestDate) {
      oldestDate = date;
    }
  }

  return oldestDate ? oldestDate.slice(0, 7) : null;
}

//affiche la partie evaluation stat
function onDisplayEvalMonthItem(yearTarget) {
  //rend la div visible
  document.getElementById("divStatGraphiqueEvaluation").style.display = "block";


  //et lance la génération
  onGenerateEvalMonthItem(yearTarget);
}


//Masque la partie evaluation stat
function onHideEvalMonthItem() {
  //masque le div et vide le contenu des mois
  document.getElementById("divStatGraphiqueEvaluation").style.display = "none";
  document.getElementById("divEvalStatMonth").innerHTML = "";


}



// Reset la partie stat evaluation graphique
function resetStatEvaluationGraph() {
  document.getElementById("divStatGraphiqueEvaluation").style.display = "none";
  document.getElementById("divEvalStatMonth").innerHTML = "";
}




// ---------------------------- NOTIFICATION EVALUATION ----------------------------------



//Afficher le popup si :
//Entre le 1 et le 7
//Activité antérieure au mois en cours
//Mois précédent non évalué (!evaluation[key])
//Pas déjà rappelé (!evaluationReminders[key])
//Popup non déjà affiché (!isEvaluationPopupOpen)

//Déclenches la vérification :
//Au lancement complet (cold start)

//Au retour en foreground (resume)



function onCheckPopupEvaluationNotify() {
  console.log("Evaluation, vérification condition affichage popup");

  // Notification activée ?
  if (!userSetting.evaluationNotifyEnabled) {
    console.log("Evaluation notify : Notification désactivé");
    return
  } 

  // Entre le 1 et le 7 ?
  let iSEvalDateInRange = onCheckEvalDatePopupNotifyRange();
  if (!iSEvalDateInRange) {
    console.log("Evaluation notify : Pas dans le créneaux d'evaluation");
    return
  } 

  // Popup déjà ouvert ?
  if (isEvaluationPopupOpen) {
    console.log("Evaluation notify : Popup d'évaluation déjà en cours d'affichage");
    return
  }

  // Notification déjà ouverte ?
  if (isEvaluationNotifyOpen) {
    console.log("Evaluation notify : Popup de notification déjà en cours d'affichage");
    return
  }


  // Mois précédent déjà évalué ,
  let previousMonthKey = getEvalNotifyPreviousMonthKey();
  console.log("Evaluation notify : Previous month Key : ", previousMonthKey);

  if (evaluations[previousMonthKey]) {
    console.log("Evaluation notify : Mois précédent déjà evalué");
    return
  }

  // Popup de notification déjà présenté une fois à l'utilisateur ?
  if (evaluationReminders[previousMonthKey].reminderShown) {
    console.log("Evaluation notify : Notification déjà présenté à l'utilisateur");
    return
  }


  // Activité antérieure existante ?
  let hasActivityBefore = hasActivityBeforeCurrentMonth(allUserActivityArray);
  if (!hasActivityBefore) {
    console.log("Evaluation notify : Aucune activité antérieur au mois en cours");
    return
  }

  console.log("Toutes les conditions sont réunis pour affiche popup notification evaluation");

 
  
}



//vérifie si au moins une activité antérieur au mois en cours
function hasActivityBeforeCurrentMonth(allActivityArray) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1–12

  const currentMonthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  for (const key in allActivityArray) {
    const activity = allActivityArray[key];

    if (!activity.date) continue;

    // activity.date format "YYYY-MM-DD"
    const activityMonthKey = activity.date.substring(0, 7);

    if (activityMonthKey < currentMonthKey) {
      return true; // dès qu’on trouve une activité antérieure → stop
    }
  }

  return false;
}

//vérifie si les dates sont bonnes (entre le premier et le 7 du mois)
function onCheckEvalDatePopupNotifyRange() {
  return new Date().getDate() <= dateLimiteEvaluation;
}


//récupère la key du mois précédent
function getEvalNotifyPreviousMonthKey() {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth(); // 0-11

  // obtenir le mois précédent
  month -= 1;
  if (month < 0) { // janvier
    month = 11; // décembre
    year -= 1; //pour l'année précédente si concerne le mois de décembre
  }

  // Format YYYY-MM
  const locPreviousMonthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

  console.log(locPreviousMonthKey);

  return locPreviousMonthKey;
}


// Pour test à retirer à la fin du dev
// setTimeout(() => {
//   onCheckPopupEvaluationNotify();
// }, 3000);