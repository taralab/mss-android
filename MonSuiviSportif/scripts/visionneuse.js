let currentVisionneuseIndex = 0;
const visionneuseSliderRef = document.getElementById("visionneuseSlider");
const divVisionneuseRef = document.getElementById("divVisionneuse");


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
    }
}

function prevVisionneuseImage() {
    if (currentVisionneuseIndex > 0) {
        currentVisionneuseIndex--;
        updateVisionneuseSlider();
    }
}

// Gestion du swipe tactile
let startX = 0;

visionneuseSliderRef.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
});

visionneuseSliderRef.addEventListener("touchend", e => {
    const endX = e.changedTouches[0].clientX;
    const delta = endX - startX;

    if (delta > 50) prevVisionneuseImage();
    if (delta < -50) nextVisionneuseImage();
});