let currentVisionneuseIndex = 0,
    visionneuseSliderRef = null,
    divVisionneuseRef = null,
    btnVisionneuseNavLeftRef = null,
    btnVisionneuseNavRightRef = null,
    btnVisionneuseCloseRef = null,
    btnVisionneuseDeleteRef = null;



function onInitVisionneuse() {

    //référence
    visionneuseSliderRef = document.getElementById("visionneuseSlider");
    divVisionneuseRef = document.getElementById("divVisionneuse");

    btnVisionneuseNavLeftRef = document.getElementById("btnVisionneuseNavLeft");
    btnVisionneuseNavRightRef = document.getElementById("btnVisionneuseNavRight");
    btnVisionneuseCloseRef = document.getElementById("btnVisionneuseClose");
    btnVisionneuseDeleteRef = document.getElementById("btnVisionneuseDelete");


    // Evènement
    //image précedente
    const onClickVisionneuseLeft = () => prevVisionneuseImage();
    btnVisionneuseNavLeftRef.addEventListener("click",onClickVisionneuseLeft);
    onAddEventListenerInRegistry("visionneuse",btnVisionneuseNavLeftRef,"click",onClickVisionneuseLeft);

    //image suivante
    const onClickVisionneuseRight = () => nextVisionneuseImage();
    btnVisionneuseNavRightRef.addEventListener("click",onClickVisionneuseRight);
    onAddEventListenerInRegistry("visionneuse",btnVisionneuseNavRightRef,"click",onClickVisionneuseRight);

    //ferme visionneuse
    const onClickCloseVisionneuse = () => onCloseVisionneuse();
    btnVisionneuseCloseRef.addEventListener("click",onClickCloseVisionneuse);
    onAddEventListenerInRegistry("visionneuse",btnVisionneuseCloseRef,"click",onClickCloseVisionneuse);

    //demande de suppression
    const onClickDeleteMemory = () => deleteCurrentMemory();
    btnVisionneuseDeleteRef.addEventListener("click",onClickDeleteMemory);
    onAddEventListenerInRegistry("visionneuse",btnVisionneuseDeleteRef,"click",onClickDeleteMemory);


}


function onClearVisionneuse() {
    currentVisionneuseIndex = 0;
    visionneuseSliderRef = null;
    divVisionneuseRef = null;
    btnVisionneuseNavLeftRef = null;
    btnVisionneuseNavRightRef = null;
    btnVisionneuseCloseRef = null;
    btnVisionneuseDeleteRef = null;
}

// Ouvre la visionneuse depuis un objet de mémoire
function onOpenVisionneuse(key) {

    console.log("openVisionneuse");
    // Récupère la position de la clé dans la liste
    const index = memoryCardKeysList.indexOf(key);
    if (index === -1) {
        console.warn("Clé introuvable dans memoryCardKeysList :", key);
        return;
    }

    // Met à jour les variables globales
    currentVisionneuseIndex = index;

    // Construit les slides à partir des images stockées dans allMemoryObjectList
    visionneuseSliderRef.innerHTML = memoryCardKeysList
        .map(k => {
            const imageData = allMemoryObjectList[k]?.imageData || "";
            return `<div class='visionneuse-slide'><img src='${imageData}' alt='image'></div>`;
        })
        .join("");

    divVisionneuseRef.style.display = "flex";
    updateVisionneuseSlider();
    upDateVisionneuseNavBtn();
}


// Ferme la visionneuse
function onCloseVisionneuse() {
    divVisionneuseRef.style.display = "none";
    visionneuseSliderRef.innerHTML = "";
}

// Met à jour la position du slider
function updateVisionneuseSlider() {
    visionneuseSliderRef.style.transform = `translateX(-${currentVisionneuseIndex * 100}%)`;
}

// Navigation manuelle
function nextVisionneuseImage() {
    if (currentVisionneuseIndex < memoryCardKeysList.length - 1) {
        currentVisionneuseIndex++;
        updateVisionneuseSlider();
        upDateVisionneuseNavBtn();
    }
}

function prevVisionneuseImage() {
    if (currentVisionneuseIndex > 0) {
        currentVisionneuseIndex--;
        updateVisionneuseSlider();
        upDateVisionneuseNavBtn();
    }
}

// Gestion de l'affichage des boutons gauche droites

function upDateVisionneuseNavBtn() {
    // Gestion bouton de droite
    if (currentVisionneuseIndex == 0) {
        // Premier Masque bouton gauche
        btnVisionneuseNavLeftRef.style.display = "none";
    }else{
        //affiche bouton gauche
        btnVisionneuseNavLeftRef.style.display = "block";
    }


    if (currentVisionneuseIndex >= (memoryCardKeysList.length - 1)) {
        // Si c'est le dernier masque btn de droite
        btnVisionneuseNavRightRef.style.display = "none";

    }else{
        // Affiche bouton droite
        btnVisionneuseNavRightRef.style.display = "block";
    }
}