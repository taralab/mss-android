let canvasMemoryRef = null,
    memory_ctx = null,
    inputImageMemoryRef = null,
    inputMemoryDateStartRef = null,
    inputMemoryDateEndRef = null,
    inputMemoryTitleRef = null,
    inputMemoryRankRef = null,
    selectMemoryRoundReachRef = null,
    inputCBMemoryRankRef = null,
    inputCBMemoryRoundReachRef = null,
    inputDurationMemoryHoursRef = null,
    inputDurationMemoryMinutesRef = null,
    inputDurationMemorySecondsRef = null,
    inputDurationMemoryCentiemeRef = null,
    memoryMoveStep = 10, // déplacement en pixels
    memoryImageItem = null,
    memoryOffsetX = 0,
    memoryOffsetY = 0,
    memoryScale = 1,// facteur de zoom
    memoryScaleStep = 0.1, // pas de zoom
    memoryZoomSize = 512, // taille du crop
    isMemoryImageLoaded = false,
    maxMemory = 10,//Nbre maximal de souvenir. Peut monter à 20 sans problème, mais chargement dans le menu reward un peu plus long. 
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
    backgroundMemoryImage.src = "./Icons/HOF-Background-v3.webp";
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



    //TACTILE
    canvasMemoryRef.addEventListener('pointerdown', onMemoryPointerDown);
    onAddEventListenerInRegistry("memoryEditor",canvasMemoryRef,'pointerdown', onMemoryPointerDown);

    canvasMemoryRef.addEventListener('pointermove', onMemoryPointerMove);
    onAddEventListenerInRegistry("memoryEditor",canvasMemoryRef,'pointermove', onMemoryPointerMove);

    canvasMemoryRef.addEventListener('pointerup', onMemoryPointerUp);
    onAddEventListenerInRegistry("memoryEditor",canvasMemoryRef,'pointerup', onMemoryPointerUp);

    canvasMemoryRef.addEventListener('pointercancel', onMemoryPointerUp);
    onAddEventListenerInRegistry("memoryEditor",canvasMemoryRef,'pointercancel', onMemoryPointerUp);

    canvasMemoryRef.addEventListener('pointerout', onMemoryPointerUp);
    onAddEventListenerInRegistry("memoryEditor",canvasMemoryRef,'pointerout', onMemoryPointerUp);

    canvasMemoryRef.addEventListener('pointerleave', onMemoryPointerUp);
    onAddEventListenerInRegistry("memoryEditor",canvasMemoryRef,'pointerleave', onMemoryPointerUp);





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


    // Bouton pour activer l'input classement
    const changeMemoryRankCB = (event) => onInputCBMemoryRankChange(event);
    inputCBMemoryRankRef.addEventListener("change",changeMemoryRankCB);
    onAddEventListenerInRegistry("memoryEditor",inputCBMemoryRankRef,"change",changeMemoryRankCB);

    //Bouton pour activer l'input round reach
    const changeMemoryRoundReach = (event) => onInputCBMemoryLevelReachChange(event);
    inputCBMemoryRoundReachRef.addEventListener("change",changeMemoryRoundReach);
    onAddEventListenerInRegistry("memoryEditor",inputCBMemoryRoundReachRef,"change",changeMemoryRoundReach);
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

    //reset les éléments pour le tactile
    onResetMemoryTactile();

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
    inputMemoryDateStartRef = document.getElementById('inputMemoryDateStart');
    inputMemoryDateEndRef = document.getElementById("inputMemoryDateEnd");
    inputMemoryTitleRef = document.getElementById('inputMemoryTitle');
    inputCBMemoryRankRef = document.getElementById('inputCBMemoryRank');
    inputCBMemoryRoundReachRef = document.getElementById('inputCBMemoryRoundReach');
    inputMemoryRankRef = document.getElementById("inputMemoryRank");
    selectMemoryRoundReachRef = document.getElementById("selectMemoryRoundReach");
    inputDurationMemoryHoursRef = document.getElementById("inputDurationMemoryHours");
    inputDurationMemoryMinutesRef = document.getElementById("inputDurationMemoryMinutes");
    inputDurationMemorySecondsRef = document.getElementById("inputDurationMemorySeconds");
    inputDurationMemoryCentiemeRef = document.getElementById("inputDurationMemoryCentieme");
    memoryImageItem = new Image();

    memoryOffsetX = 0;
    memoryOffsetY = 0;
    memoryScale = 1;// facteur de zoom
    memoryScaleStep = 0.1; // pas de zoom
    memoryZoomSize = 512; // taille du crop
    memoryMoveStep = 10; //le pas du déplacement
    isMemoryImageLoaded = false;


    //par défaut les inputs pour rank et round reach sont désactivé
    inputMemoryRankRef.disabled = true;
    selectMemoryRoundReachRef.disabled = true;
    inputMemoryRankRef.classList.add("disable");
    selectMemoryRoundReachRef.classList.add("disable");
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

    //reset les éléments pour le tactile
    onResetMemoryTactile();
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







// *    *   *   *   *   *   *   *   TEST  TACTILE *  *   *   *   *   *   *   *   *   *   *   *



let isMemoryDragging = false,
    memoryLastTouchDistance = 0,
    memoryLastTouchX = 0,
    memoryLastTouchY = 0;

let memoryActivePointer = new Map();

// Fluidité + inertie
let isMemoryAnimating = false,
    memoryVelocityX = 0,
    memoryVelocityY = 0,
    memoryLastMoveTime = 0;





function onResetMemoryTactile() {
    // Réinitialisation du toucher et du mouvement
    isMemoryDragging = false;
    memoryLastTouchDistance = 0;
    memoryLastTouchX = 0;
    memoryLastTouchY = 0;
    memoryActivePointer.clear();
    isMemoryAnimating = false;
    memoryVelocityX = 0;
    memoryVelocityY = 0;
    memoryLastMoveTime = 0;

    // Remet l'image au centre et au zoom initial
    memoryOffsetX = 0;
    memoryOffsetY = 0;
    memoryScale = 1;

}


// ==================================
//   Boucle d’animation fluide
// ==================================
function startMemoryRenderLoop() {
    if (!isMemoryAnimating) {
        isMemoryAnimating = true;
        requestAnimationFrame(memoryRenderLoop);
    }
}

function stopMemoryRenderLoop() {
  isMemoryAnimating = false;
}

function memoryRenderLoop() {
  onUpdateMemoryPreview();
  if (isMemoryAnimating) requestAnimationFrame(memoryRenderLoop);
}

// ==================================
//   Gestion des POINTER EVENTS
// ==================================


function onMemoryPointerDown(event) {
    event.preventDefault();
    canvasMemoryRef.setPointerCapture(event.pointerId);
    memoryActivePointer.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (memoryActivePointer.size === 1) {
        // un seul doigt → déplacement
        isMemoryDragging = true;
        memoryLastTouchX = event.clientX;
        memoryLastTouchY = event.clientY;
        startMemoryRenderLoop();
    } else if (memoryActivePointer.size === 2) {
        // deux doigts → zoom
        isMemoryDragging = false;
        memoryLastTouchDistance = getPointerDistance();
        startMemoryRenderLoop();
    }
}

function onMemoryPointerMove(event) {
    if (!memoryActivePointer.has(event.pointerId)) return;
    memoryActivePointer.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.preventDefault();

    if (isMemoryDragging && memoryActivePointer.size === 1) {
        const touch = memoryActivePointer.get(event.pointerId);
        const now = performance.now();
        const dx = touch.x - memoryLastTouchX;
        const dy = touch.y - memoryLastTouchY;
        const dt = now - memoryLastMoveTime || 16;

        memoryOffsetX -= dx / memoryScale;
        memoryOffsetY -= dy / memoryScale;

        memoryVelocityX = dx / dt;
        memoryVelocityY = dy / dt;

        memoryLastTouchX = touch.x;
        memoryLastTouchY = touch.y;
        memoryLastMoveTime = now;
    }
    else if (memoryActivePointer.size === 2) {
        const newDistance = getPointerDistance();
        const zoomFactor = newDistance / memoryLastTouchDistance;

        const prevScale = memoryScale;
        memoryScale *= zoomFactor;
        memoryScale = Math.max(0.1, Math.min(memoryScale, 10));

        memoryOffsetX -= ((canvasMemoryRef.width / 2) * (1 / prevScale - 1 / memoryScale));
        memoryOffsetY -= ((canvasMemoryRef.height / 2) * (1 / prevScale - 1 / memoryScale));

        memoryLastTouchDistance = newDistance;
    }
}

function onMemoryPointerUp(event) {
    memoryActivePointer.delete(event.pointerId);
    canvasMemoryRef.releasePointerCapture(event.pointerId);

    if (memoryActivePointer.size === 0) {
        isMemoryDragging = false;
        stopMemoryRenderLoop();

        // inertie
        const friction = 0.95;
        function inertia() {
        if (Math.abs(memoryVelocityX) < 0.01 && Math.abs(memoryVelocityY) < 0.01) return;
        memoryOffsetX -= memoryVelocityX * 10;
        memoryOffsetY -= memoryVelocityY * 10;
        memoryVelocityX *= friction;
        memoryVelocityY *= friction;
        onUpdateMemoryPreview();
        requestAnimationFrame(inertia);
        }
        inertia();
    }
}

function getPointerDistance() {
    const points = Array.from(memoryActivePointer.values());
    if (points.length < 2) return 0;
    const dx = points[0].x - points[1].x;
    const dy = points[0].y - points[1].y;
    return Math.sqrt(dx * dx + dy * dy);
}


// *    *   *   *   *   *   *   *   FIN TEST TACTILE *  *   *   *   *   *   *   *   *   *   *   *


const iconMemoryElevation = new Image();
    iconMemoryElevation.src = "./icons/icon_elevation.svg";

const MEMORY_LAYOUT = {
    canvas: {
        width: 512,
        height: 768,
    },

    image: {
        x: 57,
        y: 28,
        width: 400,
        height: 400,
        radius: 40,
    },

    title: {
        x: 256,
        y: 520,
        maxWidth: 450,
        lineHeight: 50,
        maxLines: 3,
        font: "bold 42px Poppins",
        align: "center",
        color: "#FFF",
    },

    date: {
        x: 256,
        y: 632,
        font: "28px Poppins",
        align: "center",
        color: "#d1cdd8",
    },

    rank: {
        x: 482,
        y: 745,
        align: "right",
    },

    duration: {
        x: 30,
        y: 738,
        font:"bold 28px Poppins",
        align: "left",
        color: "#FFF",
    },

    distance: {
        x: 150,
        y: 683,
        align: "center",
        font: "24px Poppins",
        color: "#d1cdd8",
        unit: "km",
    },

    elevation: {
        x: 330,
        y: 683,
        align: "left",
        font: "24px Poppins",
        color: "#d1cdd8",
        unit: "m"
    },

    elevationIcon: { // icône séparée
        x: 280, // position fixe sur le canvas
        y: 652,
        size: 40,
        image: iconMemoryElevation, // Image SVG chargée
        offsetX: 0,
        offsetY: 0,
    },
};



function onClickGenerateMemory() {

    if (!validateMemoryInputs()) return;

    const title = inputMemoryTitleRef.value.trim().toUpperCase();
    const date = formatMemoryDate(
        inputMemoryDateStartRef.value,
        inputMemoryDateEndRef.value
    );

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = MEMORY_LAYOUT.canvas.width;
    canvas.height = MEMORY_LAYOUT.canvas.height;

    drawBackground(ctx);
    drawMainImage(ctx);
    drawWrappedTitle(ctx, title);
    drawDate(ctx, date);

    drawDistance(ctx);

    let isElevationIconRequired = drawElevation(ctx);
    if (isElevationIconRequired) {
        drawElevationIcon(ctx);
    }
        

    drawRankOrRound(ctx);
    drawDuration(ctx);

    exportMemoryCanvas(canvas, title, date);
};


// Vérification des champs obligatoires
function validateMemoryInputs() {
    const fields = [
        { value: inputMemoryTitleRef.value.trim(), ref: inputMemoryTitleRef },
        { value: inputMemoryDateStartRef.value, ref: inputMemoryDateStartRef },
        { value: isMemoryImageLoaded, ref: inputImageMemoryRef }
    ];

    let hasError = false;

    fields.forEach(field => {
        if (!field.value) {
            field.ref.classList.add("fieldRequired");
            hasError = true;
        } else {
            field.ref.classList.remove("fieldRequired");
        }
    });

    if (hasError) {
        alert("Merci de remplir tous les champs et d’ajuster ton image.");
        return false;
    }

    return true;
}



// Création de l'arrière plan
function drawBackground(ctx) {
    const { width, height } = MEMORY_LAYOUT.canvas;

    if (isBackgroundMemoryLoaded) {
        ctx.drawImage(backgroundMemoryImage, 0, 0, width, height);
    } else {
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, width, height);
    }
}



// Création du logo
function drawMainImage(ctx) {
    const cfg = MEMORY_LAYOUT.image;

    const minSide = Math.min(memoryImageItem.width, memoryImageItem.height);
    const zoomedSide = minSide / memoryScale;

    const startX = (memoryImageItem.width - zoomedSide) / 2 + memoryOffsetX;
    const startY = (memoryImageItem.height - zoomedSide) / 2 + memoryOffsetY;

    ctx.save();
    drawBorderRadius(ctx, cfg.x, cfg.y, cfg.width, cfg.height, cfg.radius);
    ctx.clip();

    ctx.drawImage(
        memoryImageItem,
        startX,
        startY,
        zoomedSide,
        zoomedSide,
        cfg.x,
        cfg.y,
        cfg.width,
        cfg.height
    );

    ctx.restore();

    ctx.lineWidth = 4;
    ctx.strokeStyle = "#FFF";
    drawBorderRadius(ctx, cfg.x, cfg.y, cfg.width, cfg.height, cfg.radius);
    ctx.stroke();
}



// Création du titre
function drawWrappedTitle(ctx, title) {
    const cfg = MEMORY_LAYOUT.title;

    ctx.save();
    ctx.font = cfg.font;
    ctx.fillStyle = cfg.color;
    ctx.textAlign = cfg.align;
    ctx.textBaseline = "middle";

    const lines = getWrappedLines(
        ctx,
        title,
        cfg.maxWidth,
        cfg.maxLines
    );

    const totalHeight = lines.length * cfg.lineHeight;
    let startY = cfg.y - totalHeight / 2 + cfg.lineHeight / 2;

    lines.forEach((line, index) => {
        ctx.fillText(
            line,
            cfg.x,
            startY + index * cfg.lineHeight
        );
    });

    ctx.restore();
}


function getWrappedLines(ctx, text, maxWidth, maxLines) {
    const words = text.split(" ");
    const lines = [];
    let line = "";

    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + " ";
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && line !== "") {
            lines.push(line.trim());
            line = words[i] + " ";
            if (lines.length === maxLines) break;
        } else {
            line = testLine;
        }
    }

    if (lines.length < maxLines && line) {
        lines.push(line.trim());
    }

    return lines;
}


// Création de la date
function drawDate(ctx, date) {
    const cfg = MEMORY_LAYOUT.date;

    ctx.save();
    ctx.font = cfg.font;
    ctx.fillStyle = cfg.color;
    ctx.textAlign = cfg.align;
    ctx.fillText(date, cfg.x, cfg.y);
    ctx.restore();
}



//création du classement
function drawRankOrRound(ctx) {
    const cfg = MEMORY_LAYOUT.rank;

    if (inputCBMemoryRankRef.checked) {
        const rank = parseInt(inputMemoryRankRef.value);
        if (isNaN(rank)) return;

        ctx.save();
        ctx.textAlign = cfg.align;
        ctx.font = rank > 999 ? "bold 36px Poppins" : "bold 42px Poppins";
        ctx.fillStyle =
            rank === 1 ? "#E8C547" :
            rank === 2 ? "#BFC6CC" :
            rank === 3 ? "#C58B5E" : "#D5C5A0";

        ctx.fillText(`${rank}e`, cfg.x, cfg.y);
        ctx.restore();

    } else if (inputCBMemoryRoundReachRef.checked) {
        const round = selectMemoryRoundReachRef.value;
        if (!round) return;

        ctx.save();
        ctx.textAlign = cfg.align;
        ctx.font = "bold 36px Poppins";
        ctx.fillStyle = "#D5C5A0";
        ctx.fillText(round, cfg.x, cfg.y);
        ctx.restore();
    }
}

// Création de la durée
function drawDuration(ctx) {
    if (!onCheckMemoryDurationFilled()) return;

    const { text, fontSize } = formatMemoryDuration({
        heure: +inputDurationMemoryHoursRef.value || 0,
        minute: +inputDurationMemoryMinutesRef.value || 0,
        seconde: +inputDurationMemorySecondsRef.value || 0,
        centieme: +inputDurationMemoryCentiemeRef.value || 0,
    });

    if (!text) return;

    const cfg = MEMORY_LAYOUT.duration;

    ctx.save();
    ctx.textAlign = cfg.align;
    ctx.font = cfg.font;
    ctx.fillStyle = cfg.color;
    ctx.fillText(text, cfg.x, cfg.y);
    ctx.restore();
}

// Creation de la distance
function drawDistance(ctx) {
    let inputDistanceRef = document.getElementById("inputMemoryDistance");
    const value = inputDistanceRef?.value;
    const text = formatMemoryDistance(value);

    if (!text) return;

    const cfg = MEMORY_LAYOUT.distance;

    ctx.save();
    ctx.textAlign = cfg.align;
    ctx.font = cfg.font;
    ctx.fillStyle = cfg.color;
    ctx.fillText(text, cfg.x, cfg.y);
    ctx.restore();
}

function formatMemoryDistance(newValue) {
    const value = parseFloat(newValue);

    if (isNaN(value) || value <= 0) return null;

    // Arrondi intelligent (2 décimales max)
    const formatted =
        value % 1 === 0
            ? value.toLocaleString("fr-FR")
            : value.toLocaleString("fr-FR", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2
              });

    return `⟷ ${formatted} km`;
}




// Création du dénivelé (texte uniquement)
function drawElevation(ctx) {
    // Récupération des éléments DOM
    const selectElevationRef = document.getElementById("selectMemoryElevation");
    const elevationType = selectElevationRef.value;

    const inputMemoryElevationRef = document.getElementById("inputMemoryElevation");
    const elevationValue = inputMemoryElevationRef.value;

    // Formatage du texte
    const text = formatMemoryElevationFromInputs(elevationValue, elevationType);
    if (!text) return false;//si pas de texte, pas d'icone non plus

    const cfg = MEMORY_LAYOUT.elevation;

    ctx.save();

    // Dessin du texte
    ctx.textAlign = cfg.align;  // alignement défini dans le layout
    ctx.font = cfg.font;
    ctx.fillStyle = cfg.color;
    ctx.fillText(text, cfg.x, cfg.y);

    ctx.restore();

    return true;//un texte présent on met l'icone aussi
}


function drawElevationIcon(ctx) {
    const cfg = MEMORY_LAYOUT.elevationIcon;
    if (!cfg.image?.complete) return;

    const iconX = cfg.x + (cfg.offsetX || 0);
    const iconY = cfg.y + (cfg.offsetY || 0);
    const iconSize = cfg.size || 28;

    ctx.drawImage(cfg.image, iconX, iconY, iconSize, iconSize);
}


function formatMemoryElevationFromInputs(newValue,elevationType) {
    const value = parseInt(newValue, 10);//texte en base 10=decimal
    if (isNaN(value) || value <= 0) return null;

    const sign = elevationType === "-" ? "D−" : "D+";
    return `${sign} ${value.toLocaleString("fr-FR")} m`;
}


// Export de l'image
function exportMemoryCanvas(canvas, title, date) {
    const imageData = canvas.toDataURL("image/webp", 0.8);

    document.getElementById("divMemoryPreviewContent").innerHTML =
        `<img class="memory-result" src="${imageData}" alt="souvenir">`;

    document.getElementById("divMemoryPreview").style.display = "flex";

    memoryToInsert = {
        title,
        date,
        imageData
    };
}



// Formatage des dates
function formatMemoryDate(startDate, endDate) {

    if (!startDate && !endDate) return "";

    // Conversion en objet Date (si ce n’est pas déjà le cas)
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    // Liste des mois abrégés selon les conventions françaises
    const months = ["jan.", "fév.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

    // Fonction utilitaire pour formater une seule date
    const fmt = (d, showYear = true) => {
        const day = d.getDate();
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        return showYear ? `${day} ${month} ${year}` : `${day} ${month}`;
    };

    // Cas 1 : une seule date connue
    if (!end) return fmt(start);
    if (!start) return fmt(end);

    // Cas 2 : mêmes dates
    if (start.getTime() === end.getTime()) return fmt(start);

    // Cas 3 : même mois et même année
    if (
        start.getMonth() === end.getMonth() &&
        start.getFullYear() === end.getFullYear()
    ) {
        return `${start.getDate()}–${end.getDate()} ${months[start.getMonth()]} ${start.getFullYear()}`;
    }

    // Cas 4 : mois différents mais même année
    if (start.getFullYear() === end.getFullYear()) {
        return `${fmt(start, false)} – ${fmt(end)}`;
    }

    // Cas 5 : années différentes
    return `${fmt(start)} – ${fmt(end)}`;
}



// passage automatique à la ligne avec comptage du nombre de ligne
function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let lineCount = 0; // 👈 compteur de lignes

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
            lineCount++; // 🧮 nouvelle ligne dessinée
        } else {
            line = testLine;
        }
    }

    context.fillText(line, x, y);
    lineCount++; // 🧮 dernière ligne

    return lineCount; // ✅ on retourne le nombre total de lignes affichées
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

  //dessine les angles
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





// Gestion rank ou niveau atteind
//Le but est d'avoir un seul bouton d'active à chaque fois. l'un activé désactive l'autre

//le classement
function onInputCBMemoryRankChange(event) {

    if (event.target.checked) {
        //désactive les éléments de l'autre CB et son input
        inputCBMemoryRoundReachRef.checked = false;
        selectMemoryRoundReachRef.disabled = true;
        selectMemoryRoundReachRef.classList.add("disable");
        
        //active mon input
        inputMemoryRankRef.disabled = false;
        inputMemoryRankRef.classList.remove("disable");
    }else{
        //désactive l'input
        inputMemoryRankRef.disabled = true;
        inputMemoryRankRef.classList.add("disable");
    }
}
// LE niveau atteind
function onInputCBMemoryLevelReachChange(event) {

    if (event.target.checked) {
        //désactive les éléments de l'autre CB et son input
        inputCBMemoryRankRef.checked = false;
        inputMemoryRankRef.disabled = true;
        inputMemoryRankRef.classList.add("disable");

        //active mon input
        selectMemoryRoundReachRef.disabled = false;
        selectMemoryRoundReachRef.classList.remove("disable");
    }else{
        //désactive l'input
        selectMemoryRoundReachRef.disabled = true;
        selectMemoryRoundReachRef.classList.add("disable");
    }
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



// Verifie si au moins une durée est renseigné

function onCheckMemoryDurationFilled() {
    const h = inputDurationMemoryHoursRef.value.trim();
    const m = inputDurationMemoryMinutesRef.value.trim();
    const s = inputDurationMemorySecondsRef.value.trim();
    const c = inputDurationMemoryCentiemeRef.value.trim();

    // Retourne true si au moins un champ a une valeur non vide et différente de 0
    return [h, m, s, c].some(val => val !== "" && Number(val) > 0);
}


// Formate la date et la taille selon le nombre d'élements à afficher
function formatMemoryDuration({ heure = 0, minute = 0, seconde = 0, centieme = 0 }) {
    heure = Number(heure) || 0;
    minute = Number(minute) || 0;
    seconde = Number(seconde) || 0;
    centieme = Number(centieme) || 0;

    // Si rien du tout → pas d'affichage
    if (heure === 0 && minute === 0 && seconde === 0 && centieme === 0) {
        return { text: "", fontSize: 0 };
    }

    const toSuperscript = (num) => {
        const map = { "0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹" };
        return String(num).split("").map(d => map[d] || d).join("");
    };

    const parts = [];
    let count = 0;

    if (heure > 0) { parts.push(`${heure} h`); count++; }
    if (minute > 0) { parts.push(`${String(minute).padStart(2,"0")} min`); count++; }

    if (seconde > 0 || centieme > 0) {
        let secPart;
        if (centieme > 0) {
        secPart = `${String(seconde).padStart(2,"0")}.${toSuperscript(String(centieme).padStart(2,"0"))}`;
        count += 2; // seconde + centième → deux unités
        } else {
        secPart = `${String(seconde).padStart(2,"0")}″`;
        count++;
        }
        parts.push(secPart);
    }

    const text = parts.join(" ");

    // 🟣 Détermination de la taille selon le nombre d’unités
    let fontSize;
    if (count === 1) fontSize = 36;
    else if (count === 2) fontSize = 30;
    else if (count === 3) fontSize = 26;
    else fontSize = 24;

    return { text, fontSize };
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
    document.getElementById("divVisionneuse").style.display = "flex";
}

//masque gros plan
function onHiddenFullScreenMemory() {
    if (devMode === true){console.log("cache la div de visualisation du mémory");};
    document.getElementById("divVisionneuse").style.display = "none";
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
function onclickDeleteMemory(){

    // Popup de confirmation
    let textToDisplay = `<b>Supprimer cet évènement ?</b>`;
    addEventForGlobalPopupConfirmation(removeEventForGlobalPopupConfirmation,eventDeleteMemory,textToDisplay,"delete");
}



// Sequence de suppression d'un Memory
async function eventDeleteMemory() {
    // Ferme le plein écran actuel (visionneuse)
    onCloseVisionneuse();

    //Retire le popup de visualisation
    onHiddenFullScreenMemory();

    let idToDelete = memoryCardKeysList[currentVisionneuseIndex];

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

    // 🔹 Si des images restent, on rouvre la visionneuse sur la suivante
    if (memoryCardKeysList.length > 0) {
        // Si on supprime la dernière image, on recule d’un cran
        const newIndex = Math.min(indexToDelete, memoryCardKeysList.length - 1);
        const newKey = memoryCardKeysList[newIndex];

        //Lance à nouveau la visionneuse
        onOpenVisionneuse(newKey);

    } else {
        // Sinon on ferme définitivement
        onCloseVisionneuse();
    }

    //gestion text si memory ou pas
    gestionTextAndBtnMemory();
    if (devMode === true){console.log("allMemoryObjectList :",allMemoryObjectList);};

    // Popup notification
    onShowNotifyPopup("memoryDeleted");


}




//----------------------------- retour ----------------------------------------------






function onResetMemoryItems() {

    // Retire field required si présent
    inputMemoryTitleRef.classList.remove("fieldRequired");
    inputMemoryDateStartRef.classList.remove("fieldRequired");
    inputImageMemoryRef.classList.remove("fieldRequired");

    // Vide les champs
    inputMemoryDateStartRef.value = null;
    inputMemoryDateEndRef.value = null;
    inputMemoryTitleRef.value = null;
    inputImageMemoryRef.value = null;
    inputDurationMemoryHoursRef.value = "";
    inputDurationMemoryMinutesRef.value = "";
    inputDurationMemorySecondsRef.value = "";
    inputDurationMemoryCentiemeRef.value = "";
    inputCBMemoryRankRef.checked = false;
    inputCBMemoryRoundReachRef.checked = false;
    inputMemoryRankRef.value = "";
    selectMemoryRoundReachRef.value = "Finale";
    inputMemoryRankRef.disabled = true;
    selectMemoryRoundReachRef.disabled = true;


    //Vide l'image
    onClearMemoryPreview();

    //enlèvement les références
    canvasMemoryRef = null;
    memory_ctx = null;
    inputImageMemoryRef = null;
    inputMemoryDateStartRef = null;
    inputMemoryDateEndRef = null;
    inputMemoryTitleRef = null;
    memoryImageItem = null;
    inputCBMemoryRankRef = null;
    inputCBMemoryRoundReachRef = null;
    inputMemoryRankRef = null;
    selectMemoryRoundReachRef = null;
    inputDurationMemoryHoursRef = null;
    inputDurationMemoryMinutesRef = null;
    inputDurationMemorySecondsRef = null;
    inputDurationMemoryCentiemeRef = null;
    

}

function onClickReturnFromMemory() {
    onResetMemoryItems();

    // ferme le menu
    onLeaveMenu("Memory");
}