//contient le nom de la mise à jour
//vérifie si l'utilisateur possède ce nom dans la base 
//pour savoir si on doit lui afficher le popup des nouveautés ou non
//l'information sera stocké dans userInfo.updateNameList[]
const updateName = "October-2025";

//tableau des images pour les nouveautés
const updateImageArray = [
      "./imageUpdate/UpdateRecupSlide1.webp",
      "./imageUpdate/UpdateRecupSlide2.webp",
      "./imageUpdate/UpdateRecupSlide3.webp",
      "./imageUpdate/UpdateRecupSlide4.webp"
    ];



// Référencement
let divPopupUpdateRef = null;
let divPopupContentRef = null;
let imgUpdateARef = null;
let imgUpdateBRef = null;
let divPopupUpdatePBRef = null;

let popupUpdateImgIndex = 0;
let isPopupUpdateShowingImgA = true;

// Variables pour le swipe
let popupEventSwipeStartX = 0,
    popupEventSwipeEndX = 0,
    swipeDetected = false; // pour différencier swipe et tap



//vérification condition affiche nouveauté
function onCheckUpdateEvent(){

    //Nom de la mise à jour dans la liste de l'user ?
    let isUpdateDisplayRequiered = !userInfo.updateNameList.includes(updateName);

    if (isUpdateDisplayRequiered) {
        onInitUpdateEvent();
        startUpdateEvent();
    }
}



function onInitUpdateEvent() {

    // Référencement des éléments
    divPopupUpdateRef = document.getElementById("divPopupUpdate");
    divPopupContentRef = document.getElementById("divPopupContent");
    imgUpdateARef = document.getElementById("imgUpdateA");
    imgUpdateBRef = document.getElementById("imgUpdateB");
    divPopupUpdatePBRef = document.getElementById("divPopupUpdatePB");

    // Précharge des images pour éviter les temps de chargement
    updateImageArray.forEach(src => { const i = new Image(); i.src = src; });

    // -----------------------------------------
    // 1️⃣ Tap / Click : avance à l'image suivante
    // -----------------------------------------
    const onClickPopupUpdateEvent = () => {
        // Ne déclenche le next que si aucun swipe n'a été détecté
        if (!swipeDetected) {
            nextPopupUpdateImage();
        }
        // Reset pour le prochain événement
        swipeDetected = false;
    };
    divPopupContentRef.addEventListener("click", onClickPopupUpdateEvent);
    onAddEventListenerInRegistry("updateEvent", divPopupContentRef, "click", onClickPopupUpdateEvent);

    // -----------------------------------------
    // 2️⃣ Swipe : détection du début du geste
    // -----------------------------------------
    const onSwipeUpdateViewStart = (e) => {
        popupEventSwipeStartX = e.touches[0].clientX;
    };
    divPopupContentRef.addEventListener("touchstart", onSwipeUpdateViewStart);
    onAddEventListenerInRegistry("updateEvent", divPopupContentRef, "touchstart", onSwipeUpdateViewStart);

    // -----------------------------------------
    // 3️⃣ Swipe : détection de la fin du geste
    // -----------------------------------------
    const onSwipeUpdateViewEnd = (e) => {
        popupEventSwipeEndX = e.changedTouches[0].clientX;
        // Retourne true si un swipe a été effectué
        swipeDetected = checkHandleRecupSwipe();
    };
    divPopupContentRef.addEventListener("touchend", onSwipeUpdateViewEnd);
    onAddEventListenerInRegistry("updateEvent", divPopupContentRef, "touchend", onSwipeUpdateViewEnd);

}

// -----------------------------------------
// Gestion du swipe : détermine direction et action
// Retourne true si un swipe a été détecté
// -----------------------------------------
function checkHandleRecupSwipe() {
    const threshold = 50; // distance minimale pour valider le swipe
    const diff = popupEventSwipeEndX - popupEventSwipeStartX;
    let swipeDone = false;

    if (diff > threshold) {
        // Swipe vers la droite -> image précédente (à activer si voulu)
        // prevPopupUpdateImage();
        swipeDone = true;
    } else if (diff < -threshold) {
        // Swipe vers la gauche -> image suivante
        nextPopupUpdateImage();
        swipeDone = true;
    }

    // Reset des positions pour le prochain swipe
    popupEventSwipeStartX = 0;
    popupEventSwipeEndX = 0;

    return swipeDone;
}


//lancement du popup
function startUpdateEvent() {
    divPopupUpdateRef.classList.add("active");
    popupUpdateImgIndex = 0;
    isPopupUpdateShowingImgA = true;
    imgUpdateARef.src = updateImageArray[0];
    imgUpdateARef.classList.add("active");
    imgUpdateBRef.classList.remove("active");
    onSetUpdateProgress();
}


//ferme le popup
async function onClosePopupUpdate() {
    divPopupUpdateRef.classList.remove("active");
    imgUpdateARef.classList.remove("active");
    imgUpdateBRef.classList.remove("active");



    //retire les écouteur
    onRemoveEventListenerInRegistry(["updateEvent"]);

    //vide les références
    divPopupUpdateRef = null;
    divPopupContentRef = null;
    imgUpdateARef = null;
    imgUpdateBRef = null;
    divPopupUpdatePBRef = null;

    //lance la sauvegarde de l'information
    await eventSaveUpdateDisplayed();
}




//mise à jour des progress bar
function onSetUpdateProgress() {
    const percent = ((popupUpdateImgIndex + 1) / updateImageArray.length) * 100;
    divPopupUpdatePBRef.style.width = percent + "%";
    document.getElementById("divPopupCountImgUpdate").textContent = `${popupUpdateImgIndex + 1} / ${updateImageArray.length}`;
}



//images suivantes
function nextPopupUpdateImage() {
    popupUpdateImgIndex++;
    if (popupUpdateImgIndex >= updateImageArray.length) {
        onClosePopupUpdate();
        return;
    }

    const incoming = isPopupUpdateShowingImgA ? imgUpdateBRef : imgUpdateARef;
    const outgoing = isPopupUpdateShowingImgA ? imgUpdateARef : imgUpdateBRef;

    incoming.onload = () => {
        incoming.classList.add("active");
        outgoing.classList.remove("active");
        isPopupUpdateShowingImgA = !isPopupUpdateShowingImgA;
        onSetUpdateProgress();
    };
    incoming.src = updateImageArray[popupUpdateImgIndex];

    if (incoming.complete) {
        incoming.classList.add("active");
        outgoing.classList.remove("active");
        isPopupUpdateShowingImgA = !isPopupUpdateShowingImgA;
        onSetUpdateProgress();
    }
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