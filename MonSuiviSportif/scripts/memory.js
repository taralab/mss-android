let canvasMemoryRef = null,
    memory_ctx = null,
    inputImageMemoryRef = null,
    inputMemoryDateRef = null,
    inputMemoryTitleRef = null,
    texteareaMemoryCommentRef = null,
    memoryMoveStep = 10, // déplacement en pixels
    memoryImageItem = null,
    memoryOffsetX = 0,
    memoryOffsetY = 0,
    memoryScale = 1,// facteur de zoom
    memoryScaleStep = 0.1, // pas de zoom
    memoryZoomSize = 512, // taille du crop
    isMemoryImageLoaded = false,
    maxMemory = 10,//le nombre maximal de souvenir
    currentMemoryIdInView,
    memoryCardInstanceList = {},
    memoryCardKeysList = [];

let allMemoryObjectList = {
        id : {
            title : "",
            date : "",
            imageData : "",
            comment : ""
        }
    },
    memoryToInsert = {},
    isMemoryAlreadyLoaded = false;//pour chargement unique depuis la base


// Variables globales
let backgroundMemoryImage = new Image();
let isBackgroundMemoryLoaded = false;

// Charger le background au moment où l'utilisateur ouvre le menu
function loadBackgroundMemory() {
    backgroundMemoryImage.src = "./Icons/HOF-Background.webp";
    backgroundMemoryImage.onload = () => {
        isBackgroundMemoryLoaded = true;
    };
};
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

    //popup prévisualisation annulation
    let divMemoryPreviewRef = document.getElementById("divMemoryPreview");
    const cancelGenerateMemory = () => onClosePopupMemoryResult();
    divMemoryPreviewRef.addEventListener("click",cancelGenerateMemory);
    onAddEventListenerInRegistry("memoryEditor",divMemoryPreviewRef,"click",cancelGenerateMemory);

    //validation de la génération du memory
    let btnMemoryDownloadRef = document.getElementById("btnMemoryDownload");
    const valideGenerateMemory = (event) => onValideGenerateMemory(event);
    btnMemoryDownloadRef.addEventListener("click",valideGenerateMemory);
    onAddEventListenerInRegistry("memoryEditor",btnMemoryDownloadRef,"click",valideGenerateMemory);

}



// ------------------------- Fonction base de données ------------------------------------------





// fonction pour récupérer les memory
async function onLoadMemoryFromDB() {
    allMemoryObjectList = {}; // devient un objet
    try {
        const result = await db.allDocs({ include_docs: true });

        result.rows
            .map(row => row.doc)
            .filter(doc => doc.type === memoryStoreName)
            .forEach(doc => {
                allMemoryObjectList[doc._id] = { ...doc }; // on garde tout
            });

        if (devMode === true) {
            console.log("[DATABASE] [MEMORY] Activités chargées :", memoryStoreName);
            const firstKey = Object.keys(allMemoryObjectList)[0];
            console.log(allMemoryObjectList[firstKey]);
        }
    } catch (err) {
        console.error("[DATABASE] [MEMORY] Erreur lors du chargement:", err);
    }
}


// Insertion nouveau memory (ID auto, )
async function onInsertNewMemoryInDB(memoryToInsert) {
     try {
        const newMemory = {
            type: memoryStoreName,
            ...memoryToInsert
        };

        // Utilisation de post() pour génération automatique de l’ID
        const response = await db.post(newMemory);

        // Mise à jour de l’objet avec _id et _rev retournés
        newMemory._id = response.id;
        newMemory._rev = response.rev;

        if (devMode === true) {
            console.log("[DATABASE] [MEMORY] Activité insérée :", newMemory);
        }

        return newMemory;
    } catch (err) {
        console.error("[DATABASE] [MEMORY] Erreur lors de l'insertion du mémory :", err);
    }
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

    // Appelle loadBackground() lorsque le menu est ouvert
    loadBackgroundMemory();

}





function onCreateMainMenuMemory() {
    // Vide le précedent contenut
    let divMainMenuParentRef = document.getElementById("divMainBtnMenu");
    divMainMenuParentRef.innerHTML = "";

    //crée les boutons
    //Retour
    new Button_main_menu(btnMainMenuData.return.imgRef,btnMainMenuData.return.text,() => onClickReturnFromMemory());

    //Previsualiser
    new Button_main_menu_Valider("Aperçu",() => onClickGenerateMemory());

}
   
function onInitMemoryItems() {
    canvasMemoryRef = document.getElementById('canvasMemory');
    memory_ctx = canvasMemoryRef.getContext('2d');
    inputImageMemoryRef = document.getElementById('inputMemoryImage');
    inputMemoryDateRef = document.getElementById('inputMemoryDate');
    inputMemoryTitleRef = document.getElementById('inputMemoryTitle');
    texteareaMemoryCommentRef = document.getElementById('textareaMemoryComment');
    memoryImageItem = new Image();

    memoryOffsetX = 0;
    memoryOffsetY = 0;
    memoryScale = 1;// facteur de zoom
    memoryScaleStep = 0.1; // pas de zoom
    memoryZoomSize = 512; // taille du crop
    memoryMoveStep = 10; //le pas du déplacement
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
    memoryOffsetY -= getAdjustedMoveMemoryStep();
    //actualise l'affichage
    onUpdateMemoryPreview(); 
}

// Mouvement vers le haut
function onMoveUpMemoryImage() {
    memoryOffsetY += getAdjustedMoveMemoryStep();
    onUpdateMemoryPreview();
}

// Mouvement vers la droite
function onMoveRightMemoryImage() {
    memoryOffsetX -= getAdjustedMoveMemoryStep();
    onUpdateMemoryPreview();
}

// Mouvement vers la gauche
function onMoveLeftMemoryImage() {
    memoryOffsetX += getAdjustedMoveMemoryStep();
    onUpdateMemoryPreview();
}

//fonction pour ajuster le pas de déplacement
function getAdjustedMoveMemoryStep() {
    return memoryMoveStep / memoryScale;
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


// Fonction principale
function onClickGenerateMemory() {
    const title = inputMemoryTitleRef.value.trim();
    const titleUpper = title.toUpperCase();
    const date = inputMemoryDateRef.value;

    if (!isMemoryImageLoaded || !title || !date) {
        alert('Merci de remplir tous les champs et d’ajuster ton image.');
        return;
    }

    const finalCanvas = document.createElement('canvas');
    const fctx = finalCanvas.getContext('2d');
    const w = 512;
    const h = 768;
    finalCanvas.width = w;
    finalCanvas.height = h;

    // 🟟 Background complet
    if (isBackgroundMemoryLoaded) {
        fctx.drawImage(backgroundMemoryImage, 0, 0, w, h);
    } else {
        // fallback si le background n'est pas chargé
        fctx.fillStyle = "#111";
        fctx.fillRect(0, 0, w, h);
    }

    // 🟦 Image principale cadrée (taille inchangée)
    const minSide = Math.min(memoryImageItem.width, memoryImageItem.height);
    const zoomedSide = minSide / memoryScale;
    const startX = (memoryImageItem.width - zoomedSide) / 2 + memoryOffsetX;
    const startY = (memoryImageItem.height - zoomedSide) / 2 + memoryOffsetY;

    fctx.drawImage(
        memoryImageItem,
        startX, startY, zoomedSide, zoomedSide,
        110, 100, 300, 300
    );

    // 🟥 Texte (titre + date) en gold
    fctx.fillStyle = "#FFF";
    fctx.textAlign = "center";

    fctx.font = "bold 52px Poppins";
    const maxTextWidth = 450; // largeur max pour le texte
    const lineHeight = 60;
    const textX = w / 2;
    let textY = w + 10;

    wrapText(fctx, titleUpper, textX, textY, maxTextWidth, lineHeight);

    fctx.font = "28px Poppins";
    const formattedDate = new Date(date).toLocaleDateString("fr-FR", {
        day:"numeric", month:"short", year: "numeric"
    });
    fctx.fillText(formattedDate, w / 2, w + 150);

    // 🟫 Conversion en image et affichage
    const finalImage = finalCanvas.toDataURL('image/webp', 0.8);
    const divMemoryPreviewRef = document.getElementById('divMemoryPreviewContent');
    divMemoryPreviewRef.innerHTML = `<img class="memory-result" src="${finalImage}" alt="souvenir">`;

    document.getElementById("divMemoryPreview").style.display = "flex";

    // Formatage pour la sauvegarde
    memoryToInsert = {
        title: titleUpper,
        date: date,
        imageData: finalImage,
        comment: texteareaMemoryCommentRef.value
    };
}


function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
}

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



//retour ou annulation préview 
function onClosePopupMemoryResult() {
    //masque le popup
    document.getElementById("divMemoryPreview").style.display = "none";
}






// Sauvegarde
async function onValideGenerateMemory(event) {
    event.stopPropagation();

    // Ferme le popup
    onClosePopupMemoryResult();

    //sauvegarde en base
    let newMemoryDate = await onInsertNewMemoryInDB(memoryToInsert);

    //sauvegarde dans l'array
    allMemoryObjectList[newMemoryDate._id] = newMemoryDate;

    //ajoute la key au tableau de key
    memoryCardKeysList.push(allMemoryObjectList[newMemoryDate._id]);

    //gestion text si memory ou pas
    gestionTextAndBtnMemory();

    if (devMode === true){console.log("allMemoryObjectList :",allMemoryObjectList);};


    // Quitte le menu
    onClickReturnFromMemory();
    console.log(allMemoryObjectList);

    //notification
    onShowNotifyPopup("memorySaved");
}



// Fonction de DEV pour calculer le poids de l'image importée
function getBase64Size(base64String) {
  // Supprime la partie "data:image/webp;base64," si présente
  let base64Clean = base64String.split(',')[1] || base64String;

  // Longueur du contenu base64 (en caractères)
  const stringLength = base64Clean.length;

  // Chaque caractère représente 6 bits → 3 octets pour 4 caractères
  const sizeInBytes = (stringLength * 3) / 4;

  // Conversion en Ko arrondie
  const sizeInKB = sizeInBytes / 1024;

  return sizeInKB.toFixed(2);
}



//-----------------------------Affichage des memory -----------------------------------



//dans la liste
function onDisplayMemoryCardsList() {
    // Vide le parent et l'instance
    divMemoryListRef.innerHTML = "";
    memoryCardInstanceList = {};

    //pour chaque key
    memoryCardKeysList.forEach(key =>{
        // Crée un éléments
        let imageData = allMemoryObjectList[key].imageData;
        memoryCardInstanceList[key] = new MemoryCard(key,imageData,divMemoryListRef);
    });
}


//En gros plan
function onDisplayMemoryFullScreen(imageData) {
    //set l'image
    imgMemoryFullScreenRef.src = imageData;

    //Affiche
    document.getElementById("divFullScreenMemory").classList.add("show");
}

//masque gros plan
function onHiddenFullScreenMemory() {
    if (devMode === true){console.log("cache la div de visualisation du mémory");};
    document.getElementById("divFullScreenMemory").classList.remove("show");
};



// Gestion affichage message pour aucun Memory et disponibilité bouton
function gestionTextAndBtnMemory() {

    // Message pas d'item
    let pTarget = document.getElementById("pMemoryListNoItem");
    pTarget.style.display = memoryCardKeysList.length >= 1 ? "none" : "block";

    //nombre d'item
    let spanNbreTarget = document.getElementById("spanTextNbreMemory");
    spanNbreTarget.textContent = `${memoryCardKeysList.length}/${maxMemory}`;

    //Disponibilité bouton add new

    let btnRef = document.getElementById("btnMenuMemory");
    btnRef.disabled = memoryCardKeysList.length >= maxMemory;
}


// -+------------------------------ SUPPRESSION   ---------------------------------------



// demande de suppression
function onclickDeleteMemory(event){
    event.stopPropagation();

    // Popup de confirmation
    let textToDisplay = `<b>Supprimer cet évènement ?</b>`;
    addEventForGlobalPopupConfirmation(removeEventForGlobalPopupConfirmation,eventDeleteMemory,textToDisplay,"delete");
}



// Sequence de suppression d'un Memory
async function eventDeleteMemory() {

    //Retire le popup de visualisation
    onHiddenFullScreenMemory();

    let idToDelete = currentMemoryIdInView;

    // Envoie vers la corbeille
    await sendToRecycleBin(idToDelete);
    
    // retire l'objet de l'array
    delete allMemoryObjectList[idToDelete];

    if (devMode === true){console.log("allMemoryObjectList :",allMemoryObjectList);};

    // Retire du dom via l'instance
    memoryCardInstanceList[idToDelete].removeItem();
    //suppression de l'instance
    delete memoryCardInstanceList[idToDelete];

    //supprime la key to tableau de key
    let indexToDelete = memoryCardKeysList.indexOf(idToDelete);
    memoryCardKeysList.splice(indexToDelete,1);


    //gestion text si memory ou pas
    gestionTextAndBtnMemory();
    if (devMode === true){console.log("allMemoryObjectList :",allMemoryObjectList);};

    // Popup notification
    onShowNotifyPopup("memoryDeleted");


}




//----------------------------- retour ----------------------------------------------






function onResetMemoryItems() {
    // Vide les champs
    inputMemoryDateRef.value = null;
    inputMemoryTitleRef.value = null;
    inputImageMemoryRef.value = null;
    texteareaMemoryCommentRef.value = null;

    //Vide l'image
    onClearMemoryPreview();

    //enlèvement les références
    canvasMemoryRef = null;
    memory_ctx = null;
    inputImageMemoryRef = null;
    inputMemoryDateRef = null;
    inputMemoryTitleRef = null;
    texteareaMemoryCommentRef = null;
    memoryImageItem = null;
    

}

function onClickReturnFromMemory() {
    onResetMemoryItems();

    // ferme le menu
    onLeaveMenu("Memory");
}