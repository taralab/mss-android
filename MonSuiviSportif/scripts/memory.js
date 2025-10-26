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
    texteareaMemoryCommentRef = document.getElementById('textareaMemoryComment');
    inputCBMemoryRankRef = document.getElementById('inputCBMemoryRank');
    inputCBMemoryRoundReachRef = document.getElementById('inputCBMemoryRoundReach');
    inputMemoryRankRef = document.getElementById("inputMemoryRank");
    selectMemoryRoundReachRef = document.getElementById("selectMemoryRoundReach");
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



function onClickGenerateMemory() {
    const title = inputMemoryTitleRef.value.trim();
    const titleUpper = title.toUpperCase();
    const date = formatMemoryDate(inputMemoryDateStartRef.value, inputMemoryDateEndRef.value);

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

    // 🟣 Arrière-plan
    if (isBackgroundMemoryLoaded) {
        fctx.drawImage(backgroundMemoryImage, 0, 0, w, h);
    } else {
        fctx.fillStyle = "#111";
        fctx.fillRect(0, 0, w, h);
    }

    // 🟦 Image principale avec coins arrondis
    const minSide = Math.min(memoryImageItem.width, memoryImageItem.height);
    const zoomedSide = minSide / memoryScale;
    const startX = (memoryImageItem.width - zoomedSide) / 2 + memoryOffsetX;
    const startY = (memoryImageItem.height - zoomedSide) / 2 + memoryOffsetY;

    // Coordonnées d’affichage sur le canvas final
    const x = 55;
    const y = 50;
    const width = 400;
    const height = 400;
    const radius = 40; // 🔘 ajustable : rayon d’arrondi des coins

    // Sauvegarde du contexte avant clipping
    fctx.save();

    // Dessine la forme arrondie et applique le clip
    drawBorderRadius(fctx, x, y, width, height, radius);
    fctx.clip();

    // Dessine l’image à l’intérieur du masque arrondi
    fctx.drawImage(
        memoryImageItem,
        startX, startY, zoomedSide, zoomedSide,
        x, y, width, height
    );

    // Restaure le contexte pour ne pas clipper le reste
    fctx.restore();

    // 🟡 Bord arrondi autour de l’image
    fctx.lineWidth = 4;
    fctx.strokeStyle = "#FFF";
    drawBorderRadius(fctx, x, y, width, height, radius);
    fctx.stroke();

    // 🟥 Titre + date
    fctx.fillStyle = "#FFF";
    fctx.textAlign = "center";

    fctx.font = "bold 52px Poppins";
    const maxTextWidth = 450;
    const lineHeight = 60;
    const textX = w / 2;
    let textY = w + 10;

    // 🧮 Dessine le titre et récupère le nombre de lignes
    const lineCount = wrapText(fctx, titleUpper, textX, textY, maxTextWidth, lineHeight);

    // 🎯 Position spécifique selon le nombre de lignes
    let dateOffsetY;

    switch (lineCount) {
        case 1:
            dateOffsetY = 10; // ← ajustable : distance sous le titre à 1 ligne
            break;
        case 2:
            dateOffsetY = 10; // ← ajustable : pour 2 lignes
            break;
        case 3:
            dateOffsetY = -20; // ← ajustable : pour 3 lignes
            break;
        default:
            // si titre très long (4+ lignes)
            dateOffsetY = 240 + (lineCount - 3) * 40;
            break;
    }

const dateY = textY + (lineCount * lineHeight) + dateOffsetY;

fctx.font = "28px Poppins";
fctx.fillText(date, w / 2, dateY);

    // 🟨 CLASSEMENT / NIVEAU (affiché en bas à droite)
    const showRank = inputCBMemoryRankRef.checked;
    const showRound = inputCBMemoryRoundReachRef.checked;

    if (showRank) {
        const rankValue = parseInt(inputMemoryRankRef.value);
        if (!isNaN(rankValue) && rankValue > 0) {
            fctx.textAlign = "right";
            fctx.fillStyle =
                rankValue === 1 ? "#E8C547" :  // or doux
                rankValue === 2 ? "#BFC6CC" :  // argent clair
                rankValue === 3 ? "#C58B5E" :  // bronze chaud
                "#D5C5A0";                     // beige clair pour les autres
            fctx.font = rankValue > 999 ? "bold 36px Poppins" : "bold 42px Poppins";
            const rankDisplay = rankValue.toLocaleString("fr-FR");
            fctx.fillText(`${rankDisplay}e`, w - 40, h - 40);
        }
    } else if (showRound) {
        const roundValue = selectMemoryRoundReachRef.value;
        if (roundValue) {
            fctx.textAlign = "right";
            fctx.fillStyle = "#D5C5A0";
            fctx.font = "bold 36px Poppins";
            fctx.fillText(roundValue, w - 40, h - 40);
        }
    }

    // 🟫 Conversion et affichage
    const finalImage = finalCanvas.toDataURL("image/webp", 0.8);
    const divMemoryPreviewRef = document.getElementById("divMemoryPreviewContent");
    divMemoryPreviewRef.innerHTML = `<img class="memory-result" src="${finalImage}" alt="souvenir">`;

    document.getElementById("divMemoryPreview").style.display = "flex";

    // Pour sauvegarde
    memoryToInsert = {
        title: titleUpper,
        date: date,
        imageData: finalImage,
        comment: texteareaMemoryCommentRef.value
    };
}



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
    // Vide les champs
    inputMemoryDateStartRef.value = null;
    inputMemoryDateEndRef.value = null;
    inputMemoryTitleRef.value = null;
    inputImageMemoryRef.value = null;
    texteareaMemoryCommentRef.value = null;
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
    texteareaMemoryCommentRef = null;
    memoryImageItem = null;
    inputCBMemoryRankRef = null;
    inputCBMemoryRoundReachRef = null;
    inputMemoryRankRef = null;
    selectMemoryRoundReachRef = null;
    

}

function onClickReturnFromMemory() {
    onResetMemoryItems();

    // ferme le menu
    onLeaveMenu("Memory");
}