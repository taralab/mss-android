let evaluations = {
  "2026-01": {//Toujours le mois à deux digits
    evaluationDate: "2026-02-02",//Peut servir plus tard pour des statistiques
    modificationDate : "YYYY-MM-DD",//Peut servir pour des statistiques
    appreciation: 1,        // numéraire
    marquant: "INJURY",    // SPECIAL | INJURY | GOAL | RESTART | OBSTACLE | noSet
    comment: "Je me suis cassé le pied",

  },
    "2025-01": {//Toujours le mois à deux digits
    evaluationDate: "2026-02-02",//Peut servir plus tard pour des statistiques
    modificationDate : "",//Peut servir pour des statistiques
    appreciation: 5,        // numéraire
    marquant: "GOAL",    // SPECIAL | INJURY | GOAL | RESTART | OBSTACLE | noSet
    comment: "",

  },
    "2025-02": {//Toujours le mois à deux digits
    evaluationDate: "2026-02-02",//Peut servir plus tard pour des statistiques
    modificationDate : "",//Peut servir pour des statistiques
    appreciation: 3,        // numéraire
    marquant: "noSet",    // SPECIAL | INJURY | GOAL | RESTART | OBSTACLE | noSet
    comment: "Pas terrible",

  },
    "2025-03": {//Toujours le mois à deux digits
    evaluationDate: "2026-02-02",//Peut servir plus tard pour des statistiques
    modificationDate : "",//Peut servir pour des statistiques
    appreciation: 4,        // numéraire
    marquant: "OBSTACLE",    // SPECIAL | INJURY | GOAL | RESTART | OBSTACLE | noSet
    comment: "Salle de sport fermée",

  },
    "2025-05": {//Toujours le mois à deux digits
    evaluationDate: "2026-02-02",//Peut servir plus tard pour des statistiques
    modificationDate : "",//Peut servir pour des statistiques
    appreciation: 1,        // numéraire
    marquant: "INJURY",    // SPECIAL | INJURY | GOAL | RESTART | OBSTACLE | noSet
    comment: "",

  },
    "2025-07": {//Toujours le mois à deux digits
    evaluationDate: "2026-02-02",//Peut servir plus tard pour des statistiques
    modificationDate : "",//Peut servir pour des statistiques
    appreciation: 2,        // numéraire
    marquant: "noSet",    // SPECIAL | INJURY | GOAL | RESTART | OBSTACLE | noSet
    comment: "Pas terrible",

  },
    "2025-08": {//Toujours le mois à deux digits
    evaluationDate: "2026-02-02",//Peut servir plus tard pour des statistiques
    modificationDate : "",//Peut servir pour des statistiques
    appreciation: 1,        // numéraire
    marquant: "noSet",    // SPECIAL | INJURY | GOAL | RESTART | OBSTACLE | noSet
    comment: "Je me suis cassé le pied",

  },
    "2025-10": {//Toujours le mois à deux digits
    evaluationDate: "2026-02-02",//Peut servir plus tard pour des statistiques
    modificationDate : "",//Peut servir pour des statistiques
    appreciation: 1,        // numéraire
    marquant: "INJURY",    // SPECIAL | INJURY | GOAL | RESTART | OBSTACLE | noSet
    comment: "Commentaire 2025-10",

  },
    "2025-11": {//Toujours le mois à deux digits
    evaluationDate: "2026-02-02",//Peut servir plus tard pour des statistiques
    modificationDate : "",//Peut servir pour des statistiques
    appreciation: 5,        // numéraire
    marquant: "noSet",    // SPECIAL | INJURY | GOAL | RESTART | OBSTACLE | noSet
    comment: "Je me suis cassé le pied",

  },
    "2025-12": {//Toujours le mois à deux digits
    evaluationDate: "2026-02-02",//Peut servir plus tard pour des statistiques
    modificationDate : "",//Peut servir pour des statistiques
    appreciation: 4,        // numéraire
    marquant: "SPECIAL",    // SPECIAL | INJURY | GOAL | RESTART | OBSTACLE | noSet
    comment: "Tout à bien fonctionné",

  },
    "2024-07": {//Toujours le mois à deux digits
    evaluationDate: "2026-02-02",//Peut servir plus tard pour des statistiques
    modificationDate : "",//Peut servir pour des statistiques
    appreciation: 5,        // numéraire
    marquant: "noSet",    // SPECIAL | INJURY | GOAL | RESTART | OBSTACLE | noSet
    comment: "Je me suis cassé le pied",

  },
    "2024-08": {//Toujours le mois à deux digits
    evaluationDate: "2026-02-02",//Peut servir plus tard pour des statistiques
    modificationDate : "",//Peut servir pour des statistiques
    appreciation: 3,        // numéraire
    marquant: "INJURY",    // SPECIAL | INJURY | GOAL | RESTART | OBSTACLE | noSet
    comment: "Je me suis cassé le pied",

  }
};



// Pour la gestion des évaluations et du popup
let evaluationReminders = {
  "2026-01": {
    reminderShown: true
  }
};



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






function onValideEval() {
  //regarde si le champ obligatoire est remplit (apprecation)
  console.log(selectEvalAppreciationRef.value);

  if(Number(selectEvalAppreciationRef.value) === 0){
    //Ajoute la class rouge
    selectEvalAppreciationRef.classList.add("fieldRequired");

    console.log("Evaluation : Champ obligatoire non renseigné");
    //Envoie une notification

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

      //sauvegarde en base


      //ICI détecter si le module stat evaluation est présent pour mise à jour visuelle
      onCheckIfStatEvalUpdateRequired(currentEvaluationMonth);

      console.log("dataToSave = ", dataToSave);
    }else{
      console.log("Aucune modification. Traitement sauvegarde annulé");
    }
  }else{
    //traitement si création

    //formatage
    let dataToSave = onFormatEvalBeforeSave(evalEditorMode);
      
    //sauvegarde dans l'array
    evaluations[currentEvaluationMonth] = dataToSave;

    //sauvegarde en base


    //ICI détecter si le module stat evaluation est présent pour mise à jour visuelle
    onCheckIfStatEvalUpdateRequired(currentEvaluationMonth);

    console.log("dataToSave = ", dataToSave);

  }

  console.log(evaluations);



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

    console.log("Traitement boucle mensuel");
    console.log("CurrentMonthKey : ", monthKey);
    console.log("isMonthInRange ? ", isMonthInRange);
    console.log("monthRange :" ,monthRange);

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

  const monthRange = {
    firstMonthEver :"2025-01",//a rendre dynamique
    lastMonthEver : "2026-05"//a rendre dynamique
  };

  return monthRange;
};


function  isYearEvalMonthInRange(date, min, max) {
  console.log(`verification Range : date : ${date}, min = ${min}, max = ${max}`);

  return date >= min && date <= max;
};



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
