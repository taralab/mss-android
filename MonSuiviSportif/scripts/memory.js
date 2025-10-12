let canvasMemoryRef = null,
    memory_ctx = null,
    inputImageMemoryRef = null,
    divMemoryPreviewRef = null,
    inputMemoryDateRef = null,
    inputMemoryTitleRef = null,
    memoryMoveStep = 10, // déplacement en pixels
    memoryImageItem = null,
    memoryOffsetX = 0,
    memoryOffsetY = 0,
    memoryScale = 1,// facteur de zoom
    memoryScaleStep = 0.1, // pas de zoom
    memoryZoomSize = 512, // taille du crop
    isMemoryImageLoaded = false;




// -----------------------  ECOUTEUR D'EVENEMENTS --------------------------------------

function onAddEventListenerForMemoryEditor() {
    if (devMode === true){
        console.log("[EVENT-LISTENER] : Ajoute les évènements pour l'éditeur Hall of fame");
    };

    // Contrôles de déplacement
    //BAS
    let btnMoveDownRef = document.getElementById('btnMemoryDown');
    const onclickBtnDown = () => onMoveDownMemoryImage();
    btnMoveDownRef.addEventListener("click",onclickBtnDown);
    onAddEventListenerInRegistry("memoryEditor",btnMoveDownRef,"click",onclickBtnDown);

    // HAUT
    let btnMoveUpRef = document.getElementById('btnMemoryUp');
    const onClickBtnUp = () => onMoveUpMemoryImage();
    btnMoveUpRef.addEventListener("click",onClickBtnUp);
    onAddEventListenerInRegistry("memoryEditor",btnMoveUpRef,"click",onClickBtnUp);

    // DROIT
    let btnMoveRightRef = document.getElementById('btnMemoryRight');
    const onClickBtnRight = () => onMoveRightMemoryImage();
    btnMoveRightRef.addEventListener("click",onClickBtnRight);
    onAddEventListenerInRegistry("memoryEditor",btnMoveRightRef,"click",onClickBtnRight);

    // GAUCHE
    let btnMoveLeftRef = document.getElementById('btnMemoryLeft');
    const onClickBtnLeft = () => onMoveLeftMemoryImage();
    btnMoveLeftRef.addEventListener("click",onClickBtnLeft);
    onAddEventListenerInRegistry("memoryEditor",btnMoveLeftRef,"click",onClickBtnLeft);

    // Zoom centré sur le canvas

    //AVANT
    let btnZoomInRef = document.getElementById('btnMemoryZoomIn');
    const onClickZoomIn = () => onZoomInMemoryImage();
    btnZoomInRef.addEventListener("click",onClickZoomIn);
    onAddEventListenerInRegistry("memoryEditor",btnZoomInRef,"click",onClickZoomIn);

    // ARRIERE
    let btnZoomOutRef = document.getElementById('btnMemoryZoomOut');
    const onClickZoomOut = () => onZoomOutMemoryImage();
    btnZoomOutRef.addEventListener("click",onClickZoomOut);
    onAddEventListenerInRegistry("memoryEditor",btnZoomOutRef,"click",onClickZoomOut);

    // Import image
    const onImportImage = (event) => onInputMemoryImageChange(event);
    inputImageMemoryRef.addEventListener("change",onImportImage);
    onAddEventListenerInRegistry("memoryEditor",inputImageMemoryRef,"change",onImportImage);
}






// --------------------------OUVERTURE MENU ---------------------------------------------
function onOpenMenuMemory(){
    if (devMode === true){console.log("[MEMORY] Ouverture menu MEMORY");};

    //initialise les références
    onInitMemoryItems();

    //génération du menu principal
    onCreateMainMenuMemory();

    //ajout les écouteurs pour le menu
    onAddEventListenerForMemoryEditor();

}





function onCreateMainMenuMemory() {
    // Vide le précedent contenut
    let divMainMenuParentRef = document.getElementById("divMainBtnMenu");
    divMainMenuParentRef.innerHTML = "";

    //crée les boutons
    //Retour
    new Button_main_menu(btnMainMenuData.return.imgRef,btnMainMenuData.return.text,() => onClickReturnFromMemory());

    //générer
    new Button_main_menu_Valider("Générer",() => onClickGenerateMemory());

}
   
function onInitMemoryItems() {
    canvasMemoryRef = document.getElementById('canvasMemory');
    memory_ctx = canvasMemoryRef.getContext('2d');
    inputImageMemoryRef = document.getElementById('inputMemoryImage');
    divMemoryPreviewRef = document.getElementById('divMemoryPreview');
    inputMemoryDateRef = document.getElementById('inputMemoryDate');
    inputMemoryTitleRef = document.getElementById('inputMemoryTitle');
    memoryImageItem = new Image();

    memoryOffsetX = 0,
    memoryOffsetY = 0,
    memoryScale = 1,// facteur de zoom
    memoryScaleStep = 0.1, // pas de zoom
    memoryZoomSize = 512, // taille du crop
    isMemoryImageLoaded = false;
}



//chargement d'une image
function onInputMemoryImageChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
        memoryImageItem.onload = () => {
            isMemoryImageLoaded = true;
            memoryOffsetX = 0;
            memoryOffsetY = 0;
            onUpdateMemoryPreview();
        };
        memoryImageItem.src = reader.result;
    };
    reader.readAsDataURL(file);
}

//Mouvement vers le bas
function onMoveDownMemoryImage() {
    //Ajuste la position
    memoryOffsetY -= memoryMoveStep;
    //actualise l'affichage
    onUpdateMemoryPreview(); 
}

// Mouvement vers le haut
function onMoveUpMemoryImage() {
    memoryOffsetY += memoryMoveStep;
    onUpdateMemoryPreview();
}

// Mouvement vers la droite
function onMoveRightMemoryImage() {
    memoryOffsetX -= memoryMoveStep;
    onUpdateMemoryPreview();
}

// Mouvement vers la gauche
function onMoveLeftMemoryImage() {
    memoryOffsetX += memoryMoveStep;
    onUpdateMemoryPreview();
}

//Zoom avant
function onZoomInMemoryImage() {
    const prevScale = memoryScale;
    memoryScale += memoryScaleStep;
    memoryOffsetX -= ((canvasMemoryRef.width / 2) * (1/prevScale - 1/memoryScale));
    memoryOffsetY -= ((canvasMemoryRef.height / 2) * (1/prevScale - 1/memoryScale));
    onUpdateMemoryPreview(); 
}
// Zoom arrière
function onZoomOutMemoryImage() {
    const prevScale = memoryScale;
    memoryScale = Math.max(0.1, memoryScale - memoryScaleStep);
    memoryOffsetX -= ((canvasMemoryRef.width / 2) * (1/prevScale - 1/memoryScale));
    memoryOffsetY -= ((canvasMemoryRef.height / 2) * (1/prevScale - 1/memoryScale));
    onUpdateMemoryPreview(); 
}



// Génération finale
function onClickGenerateMemory() {
    const title = document.getElementById('title').value.trim();
    const date = document.getElementById('date').value;
    if (!isMemoryImageLoaded || !title || !date) {
        alert('Merci de remplir tous les champs et d’ajuster ton image.');
        return;
    }
    const finalCanvas = document.createElement('canvas');
    const fctx = finalCanvas.getContext('2d');
    const w = 512;
    const h = 640;
    finalCanvas.width = w;
    finalCanvas.height = h;

    // Image cadrée
    // Image cadrée avec zoom
    const minSide = Math.min(memoryImageItem.width, memoryImageItem.height);
    const zoomedSide = minSide / memoryScale; // tenir compte du zoom
    const startX = (memoryImageItem.width - zoomedSide) / 2 + memoryOffsetX;
    const startY = (memoryImageItem.height - zoomedSide) / 2 + memoryOffsetY;

    fctx.drawImage(
        memoryImageItem,
        startX, startY, zoomedSide, zoomedSide, // source
        0, 0, w, w                              // destination
    );

    // Fond sous l'image
    fctx.fillStyle = "#fff";
    fctx.fillRect(0, w, w, h - w);

    // Ligne de séparation
    fctx.fillStyle = "#007bff";
    fctx.fillRect(w * 0.3, w + 3, w * 0.4, 3);

    // Texte
    fctx.fillStyle = "#111";
    fctx.textAlign = "center";
    fctx.font = "bold 28px Poppins";
    fctx.fillText(title, w / 2, w + 60);
    fctx.font = "18px Poppins";
    const formattedDate = new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric", month: "short"
    });
    fctx.fillText(`${formattedDate}`, w / 2, w + 100);


    //   Bordure
    fctx.lineWidth = 10;
    fctx.strokeStyle = "#FFD700";
    drawBorderRadius(fctx, 0, 0, w, h, 20); // 20 = rayon des coins

    const finalImage = finalCanvas.toDataURL('image/webp', 0.8);
    divMemoryPreviewRef.innerHTML = `<img src="${finalImage}" alt="souvenir">`;

    console.log("Souvenir généré ✅", finalImage);
};


function onUpdateMemoryPreview() {
    memory_ctx.clearRect(0, 0, canvasMemoryRef.width, canvasMemoryRef.height);
    if (!isMemoryImageLoaded) return;

    const minSide = Math.min(memoryImageItem.width, memoryImageItem.height);
    const zoomedSide = minSide / memoryScale; // carré recadré selon le zoom

    // Calcul du départ en appliquant offset et zoom centré
    const startX = (memoryImageItem.width - zoomedSide) / 2 + memoryOffsetX;
    const startY = (memoryImageItem.height - zoomedSide) / 2 + memoryOffsetY;

    memory_ctx.drawImage(
        memoryImageItem,
        startX, startY, zoomedSide, zoomedSide,
        0, 0, canvasMemoryRef.width, canvasMemoryRef.height
    );
}

  //dessine les anglre
function drawBorderRadius(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.stroke();
}


//vide la preview
function onClearMemoryPreview() {
    memory_ctx.clearRect(0, 0, canvasMemoryRef.width, canvasMemoryRef.height);
    memoryImageItem.src = "";
}






//retour

function onResetMemoryItems() {
    // Vide les champs
    inputMemoryDateRef.value = null;
    inputMemoryTitleRef.value = null;
    inputImageMemoryRef.value =null;

    //Vide l'image
    onClearMemoryPreview();

    //enlèvement les références
    canvasMemoryRef = null;
    memory_ctx = null;
    inputImageMemoryRef = null;
    divMemoryPreviewRef = null;
    inputMemoryDateRef = null;
    inputMemoryTitleRef = null;
    memoryImageItem = null;
    

}

function onClickReturnFromMemory() {
    onResetMemoryItems();

    // ferme le menu
    onLeaveMenu("Memory");
}