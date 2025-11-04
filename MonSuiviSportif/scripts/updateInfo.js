//contient le nom de la mise à jour
//vérifie si l'utilisateur possède ce nom dans la base 
//pour savoir si on doit lui afficher le popup des nouveautés ou non
//l'information sera stocké dans userInfo.updateNameList[]
const updateName = "Hall-of-fame";

//tableau des images pour les nouveautés
const updateImageArray = [
        "./imageUpdate/UpdateAPI36Slide1.webp",
        "./imageUpdate/UpdateAPI36Slide2.webp",
        "./imageUpdate/UpdateAPI36Slide3.webp"
    ];


// Variable et références
let currentUpdateViewIndex = 0,
    btnUpdateViewNavLeftRef = null,
    btnUpdateViewNavRightRef = null,
    btnUpdateViewCloseRef = null,
    visionneuseUpdateSliderRef = null,
    divPopupUpdateRef = null;




//vérification condition affiche nouveauté
function onCheckUpdateEvent(){
    console.log("Verification update Event");

    //Nom de la mise à jour dans la liste de l'user ?
    let isUpdateDisplayRequiered = !userInfo.updateNameList.includes(updateName);

    if (isUpdateDisplayRequiered) {
        console.log("update disponible");
        onInitUpdateEvent();
        startUpdateEvent();
    }
}


// Initialisation
function onInitUpdateEvent() {

    visionneuseUpdateSliderRef = document.getElementById("visionneuseUpdateSlider");
    divPopupUpdateRef = document.getElementById("divPopupUpdate");

    btnUpdateViewNavLeftRef = document.getElementById("btnUpdateViewNavLeft");
    const onClickUpdateViewLeft = () => prevViewUpdate();
    btnUpdateViewNavLeftRef.addEventListener("click",onClickUpdateViewLeft);
    onAddEventListenerInRegistry("updateEvent",btnUpdateViewNavLeftRef,"click",onClickUpdateViewLeft);

    //image suivante
    btnUpdateViewNavRightRef = document.getElementById("btnUpdateViewNavRight");
    const onClickUpdateViewRight = () => nextViewUpdate();
    btnUpdateViewNavRightRef.addEventListener("click",onClickUpdateViewRight);
    onAddEventListenerInRegistry("updateEvent",btnUpdateViewNavRightRef,"click",onClickUpdateViewRight);

    //ferme visionneuse
    btnUpdateViewCloseRef = document.getElementById("btnUpdateViewClose");
    const onClickCloseUpdateView = () => onCloseViewUpdate();
    btnUpdateViewCloseRef.addEventListener("click",onClickCloseUpdateView);
    onAddEventListenerInRegistry("updateEvent",btnUpdateViewCloseRef,"click",onClickCloseUpdateView); 
}



//lancement du popup
function startUpdateEvent() {
    console.log("start update");
    // Construit les slides à partir des images stockées dans updateImageArray
    visionneuseUpdateSliderRef.innerHTML = updateImageArray
    .map(imageData => {
        return `<div class="visionneuse-slide"><img src="${imageData}" alt="image"></div>`;
    })
    .join("");

    //affiche
    divPopupUpdateRef.style.display = "flex";

    updateViewInfoSlider();
    // Première actualisation des boutons
    updateViewBtnInfo();
    updateViewCounter();
}


// Image suivante
function nextViewUpdate() {
    if (currentUpdateViewIndex < updateImageArray.length -1) {
        currentUpdateViewIndex++;
        updateViewInfoSlider();
        updateViewBtnInfo();
        updateViewCounter();
    }
}



// Image précédente
function prevViewUpdate() {
    if (currentUpdateViewIndex > 0) {
        currentUpdateViewIndex--;
        updateViewInfoSlider();
        updateViewBtnInfo();
        updateViewCounter();    
    }
}



// Met à jour la position du slider
function updateViewInfoSlider() {
    visionneuseUpdateSliderRef.style.transform = `translateX(-${currentUpdateViewIndex * 100}%)`;
}


// Actualisation bouton
function updateViewBtnInfo() {
        // Gestion bouton de droite
    if (currentUpdateViewIndex == 0) {
        // Premier Masque bouton gauche
        btnUpdateViewNavLeftRef.style.display = "none";
    }else{
        //affiche bouton gauche
        btnUpdateViewNavLeftRef.style.display = "block";
    }


    if (currentUpdateViewIndex >= (updateImageArray.length - 1)) {
        // Si c'est le dernier masque btn de droite
        btnUpdateViewNavRightRef.style.display = "none";

    }else{
        // Affiche bouton droite
        btnUpdateViewNavRightRef.style.display = "block";
    }
}




function updateViewCounter() {
  const counterRef = document.getElementById("updateCounter");
  if (counterRef) {
    counterRef.textContent = `${currentUpdateViewIndex + 1} / ${updateImageArray.length}`;
  }
}




//ferme le popup
async function onCloseViewUpdate() {
    
    // Ferme le popup
    divPopupUpdateRef.style.display = "none";

    //retire les écouteur
    onRemoveEventListenerInRegistry(["updateEvent"]);

    // Nettoye
    onClearUpdateInfoView();

    //lance la sauvegarde de l'information
    await eventSaveUpdateDisplayed();
}


// Clear

function onClearUpdateInfoView() {
    btnUpdateViewNavLeftRef = null;
    btnUpdateViewNavRightRef = null;
    btnUpdateViewCloseRef = null;
    visionneuseUpdateSliderRef = null;
    divPopupUpdateRef = null;
}


//sauvegarde

async function eventSaveUpdateDisplayed() {
    if (devMode === true){console.log("L'utilisateur à vue les nouveauté. Sauvegarde");};

    userInfo.updateNameList.push(updateName);

    //Sauvegarde
    await updateDocumentInDB(profilStoreName, (doc) => {
        doc.data = userInfo;
        return doc;
    });
}