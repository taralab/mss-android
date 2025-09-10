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
async function vibrationRecupEnding() {
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
