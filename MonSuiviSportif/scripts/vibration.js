// --- Initialisation du plugin Haptics ---
let isMobileVibration = false;
let Haptics = null;

function initHaptics() {
    if (window.Capacitor) {
        isMobileVibration = true;
        // Destructuration recommandée par Capacitor
        ({ Haptics } = Capacitor.Plugins);
        console.log("Vibration Haptics disponible");
    } else {
        isMobileVibration = false;
        console.log("Vibration désactivée (PC / navigateur)");
    }
}

// Appel au lancement de l'app
initHaptics();


// --- Fonction de vibration propre et standard ---
async function vibrationDouble() {

    //ne fait rien si l'utilisateur à désactivé les vibrations
    if (userSetting.vibrationEnabled === false) {
        return;
    }


    if (isMobileVibration && Haptics) {
        try {
            // Premier buzz
            await Haptics.vibrate({ duration: 200 });

            // Petite pause (logicielle, pas de vibration)
            setTimeout(async () => {
                // Deuxième buzz
                await Haptics.vibrate({ duration: 200 });
            }, 300); // 600ms de pause pour bien marquer la séparation
        } catch (err) {
            console.warn("Erreur vibration :", err);
        }
    }
}



// fonction de vibration unique.
async function vibrationSimple() {

    //ne fait rien si l'utilisateur à désactivé les vibrations
    if (userSetting.vibrationEnabled === false) {
        return;
    }


    if (isMobileVibration && Haptics) {
        try {
            await Haptics.vibrate({ duration: 200 });
        } catch (err) {
            console.warn("Erreur vibration :", err);
        }
    }
}