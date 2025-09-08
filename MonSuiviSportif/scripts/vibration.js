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
function vibrationRecupEnding() {
    if (!isMobileVibration || !Haptics) return;

    // Première vibration courte
    Haptics.vibrate({ duration: 500 });

    // // Impact haptique Medium optionnel, juste après la première vibration
    // Haptics.impact({ style: 'Medium' });

}
