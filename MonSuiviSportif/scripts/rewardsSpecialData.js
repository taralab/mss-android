
// *    *   *   *   *   *   *   * SPECIAL EVENTS *    *   *   *   *   





// Cet objet contient tous les spécials event de tous les temps
// Ne jamais retirer un special event sinon l'utilisateur ne pourra plus accéder à sa récompense.
const allSpecialEventsRewardsObject = {
    "COLLAB-EXCEPTION":{
        imgRef :"./Badges-special/Badge-special-the-best.webp",
        title : "Collaboratrice d'exception !",
        text: " contribué au projet de cette application",
    },
    "TRAVERSE-974":{
        imgRef :"./Badges-special/Badge-special-Traverse-974.webp",
        title : "En diagonale",
        text: "traversé l'ile de la Réunion",
    }
};

// code de débloquage avec les key des trophés débloqués
// Cette array n'est remplit que s'il y a des spécial events en cours
//elle référence la code de déverrouillage et les noms des récompenses associées (key allSpecialsEventsRewardsObject).
const specialEventKey = {
    COLLAB_25_B: [
        "COLLAB-EXCEPTION",
    ],
    GRR_974_26: [
        "TRAVERSE-974",
    ],

};
