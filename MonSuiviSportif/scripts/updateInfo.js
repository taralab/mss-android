//contient le nom de la mise à jour
//vérifie si l'utilisateur possède ce nom dans la base 
//pour savoir si on doit lui afficher le popup des nouveautés ou non
const updateName = "Notes";
let isUpdateImgAvailable = false;


//tableau des images pour les nouveautés
const updateImageArray = [
      "./imageUpdate/Structure-share-rewards.png",
      "./imageUpdate/RegroupementSansCouleur.png",
      "./imageUpdate/CompteurMorgane.png"
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
    if (isUpdateImgAvailable) {
        isUpdateImgAvailable = false;
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
    divPopupContentRef.addEventListener("click", e => {
        nextPopupUpdateImage();
    });

    // Tap en dehors = fermeture
    divPopupUpdateRef.addEventListener("click", e => {
        if (e.target === divPopupUpdateRef) onClosePopupUpdate();
    });

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
function onClosePopupUpdate() {
    divPopupUpdateRef.classList.remove("active");
    imgUpdateARef.classList.remove("active");
    imgUpdateBRef.classList.remove("active");



    //retire les écouteur


    //vide les références
    divPopupUpdateRef = null;
    divPopupContentRef = null;
    imgUpdateARef = null;
    imgUpdateBRef = null;
    divPopupUpdatePBRef = null;
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



