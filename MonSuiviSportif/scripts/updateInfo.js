//contient le nom de la mise à jour
//vérifie si l'utilisateur possède ce nom dans la base 
//pour savoir si on doit lui afficher le popup des nouveautés ou non
//l'information sera stocké dans userInfo.updateNameList[]
const updateName = "Notes";

//tableau des images pour les nouveautés
const updateImageArray = [
      "./imageUpdate/UpdateNoteSlide1.webp",
      "./imageUpdate/UpdateNoteSlide2.webp"
    ];



// Référencement
let divPopupUpdateRef = null;
let divPopupContentRef = null;
let imgUpdateARef = null;
let imgUpdateBRef = null;
let divPopupUpdatePBRef = null;

let popupUpdateImgIndex = 0;
let isPopupUpdateShowingImgA = true;






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

    //référencement
    divPopupUpdateRef = document.getElementById("divPopupUpdate");
    divPopupContentRef = document.getElementById("divPopupContent");
    imgUpdateARef = document.getElementById("imgUpdateA");
    imgUpdateBRef = document.getElementById("imgUpdateB");
    divPopupUpdatePBRef = document.getElementById("divPopupUpdatePB");

    // Précharge images
    updateImageArray.forEach(src => { const i = new Image(); i.src = src; });


    // Tout tap dans la popup = image suivante
    const onClickNextUpdateView = () => nextPopupUpdateImage();
    divPopupContentRef.addEventListener("click", onClickNextUpdateView);
    onAddEventListenerInRegistry("updateEvent",divPopupContentRef,"click", onClickNextUpdateView);

    // Tap en dehors = fermeture
    const onClickOutsideUpdate = (e) => {
        if (e.target === divPopupUpdateRef) onClosePopupUpdate();
    };
    divPopupUpdateRef.addEventListener("click", onClickOutsideUpdate);
    onAddEventListenerInRegistry("updateEvent", divPopupUpdateRef, "click", onClickOutsideUpdate);

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