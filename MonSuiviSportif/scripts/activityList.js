// Tableau des activités
let activityChoiceArray = {
    "C-A-P": {
        displayName : "Course à pied",
        colorNuanceClass : "nuance-blue-light",
        imgRef : "./images/icon-cap.webp",
        categoryColor:"blue_light"
    },
    "FRACTIONNE": {
        displayName : "Fractionné/interval",
        colorNuanceClass : "nuance-blue-light",
        imgRef : "./images/icon-intense-running.webp",
        categoryColor:"blue_light"
    },
    "MARCHE-RANDO": {
        displayName : "Marche/Randonnée",
        colorNuanceClass : "nuance-blue-light",
        imgRef : "./images/icon-marche.webp",
        categoryColor:"blue_light"
    },
    "VELO": {
        displayName : "Vélo",
        colorNuanceClass : "nuance-blue-light",
        imgRef : "./images/icon-velo.webp",
        categoryColor:"blue_light"
    },
    "NATATION": {
        displayName : "Natation",
        colorNuanceClass : "nuance-turquoise",
        imgRef : "./images/icon-natation.webp",
        categoryColor:"turquoise"
    },
    "CROSSFIT": {
        displayName : "Crossfit",
        colorNuanceClass : "nuance-red",
        imgRef : "./images/icon-crossfit.webp",
        categoryColor:"red"
    },
    "YOGA": {
        displayName : "Yoga",
        colorNuanceClass : "nuance-green-light",
        imgRef : "./images/icon-yoga.webp",
        categoryColor:"green_light"
    },
    "SPORT-CO": {
        displayName : "Sport-co divers",
        colorNuanceClass : "nuance-orange",
        imgRef : "./images/icon-sport-co.webp",
        categoryColor:"orange"
    },
    "ESCALADE": {
        displayName : "Escalade",
        colorNuanceClass : "nuance-dark-gray",
        imgRef : "./images/icon-escalade.webp",
        categoryColor:"dark_grey"
    },
    "BOXE": {
        displayName : "Boxe",
        colorNuanceClass : "nuance-light-bluegray",
        imgRef : "./images/icon-boxe.webp",
        categoryColor:"blue_grey"
    },
    "SKI": {
        displayName : "Ski",
        colorNuanceClass : "nuance-purple",
        imgRef : "./images/icon-ski.webp",
        categoryColor:"purple"
    },
    "TRIATHLON": {
        displayName : "Triathlon",
        colorNuanceClass : "nuance-blue-light",
        imgRef : "./images/icon-triathlon.webp",
        categoryColor:"blue_light"
    },
    "ACTIVITE-NAUTIQUE": {
        displayName : "Activité nautique",
        colorNuanceClass : "nuance-turquoise",
        imgRef : "./images/icon-nautique.webp",
        categoryColor:"turquoise"
    },
    "ETIREMENT": {
        displayName : "Etirements",
        colorNuanceClass : "nuance-green-light",
        imgRef : "./images/icon-stretching.webp",
        categoryColor:"green_light"
    },
    "GOLF": {
        displayName : "Golf",
        colorNuanceClass : "nuance-olive",
        imgRef : "./images/icon-golf.webp",
        categoryColor:"olive"
    },
    "TENNIS": {
        displayName : "Tennis",
        colorNuanceClass : "nuance-olive",
        imgRef : "./images/icon-tennis.webp",
        categoryColor:"olive"
    },
    "PATIN-ROLLER": {
        displayName : "Patinage/Roller",
        colorNuanceClass : "nuance-purple",
        imgRef : "./images/icon-patin.webp",
        categoryColor:"purple"
    },
    "DANSE": {
        displayName : "Danse",
        colorNuanceClass : "nuance-pink",
        imgRef : "./images/icon-danse.webp",
        categoryColor:"pink"
    },
    "MUSCULATION": {
        displayName : "Musculation",
        colorNuanceClass : "nuance-red",
        imgRef : "./images/icon-musculation.webp",
        categoryColor:"red"
    },
    "BADMINTON": {
        displayName : "Badminton",
        colorNuanceClass : "nuance-olive",
        imgRef : "./images/icon-badminton.webp",
        categoryColor:"olive"
    },
    "BASKETBALL": {
        displayName : "Basketball",
        colorNuanceClass : "nuance-orange",
        imgRef : "./images/icon-basketball.webp",
        categoryColor:"orange"
    },
    "FOOTBALL": {
        displayName : "Football",
        colorNuanceClass : "nuance-orange",
        imgRef : "./images/icon-football.webp",
        categoryColor:"orange"
    },
    "HANDBALL": {
        displayName : "Handball",
        colorNuanceClass : "nuance-orange",
        imgRef : "./images/icon-handball.webp",
        categoryColor:"orange"
    },
    "RUGBY": {
        displayName : "Rugby",
        colorNuanceClass : "nuance-orange",
        imgRef : "./images/icon-rugby.webp",
        categoryColor:"orange"
    },
    "TENNIS-TABLE": {
        displayName : "Tennis de table",
        colorNuanceClass : "nuance-olive",
        imgRef : "./images/icon-tennis-de-table.webp",
        categoryColor:"olive"
    },
    "VOLLEYBALL": {
        displayName : "Volleyball",
        colorNuanceClass : "nuance-orange",
        imgRef : "./images/icon-volley.webp",
        categoryColor:"orange"
    },
    "EQUITATION": {
        displayName : "Equitation",
        colorNuanceClass : "nuance-dark-gray",
        imgRef : "./images/icon-equitation.webp",
        categoryColor:"dark_grey"
    },
    "SNOWBOARD": {
        displayName : "Snowboard",
        colorNuanceClass : "nuance-purple",
        imgRef : "./images/icon-snowboard.webp",
        categoryColor:"purple"
    },
    "BASEBALL": {
        displayName : "Baseball",
        colorNuanceClass : "nuance-olive",
        imgRef : "./images/icon-baseball.webp",
        categoryColor:"olive"
    },
    "AUTRE": {
        displayName : "Autre/divers",
        colorNuanceClass : "nuance-light-bluegray",
        imgRef : "./images/icon-autre-divers.webp",
        categoryColor:"blue_grey"
    },
    "ARTS-MARTIAUX": {
        displayName : "Arts martiaux",
        colorNuanceClass : "nuance-light-bluegray",
        imgRef : "./images/icon-art-martiaux.webp",
        categoryColor:"blue_grey"
    },
    "BREAK-DANCE": {
        displayName : "Break dance",
        colorNuanceClass : "nuance-pink",
        imgRef : "./images/icon-breakdance.webp",
        categoryColor:"pink"
    },
    "GYMNASTIQUE": {
        displayName : "Gymnastique",
        colorNuanceClass : "nuance-pink",
        imgRef : "./images/icon-gymnastique.webp",
        categoryColor:"pink"
    },
    "ATHLETISME": {
        displayName : "Athlétisme",
        colorNuanceClass : "nuance-blue-light",
        imgRef : "./images/icon-athletisme.webp",
        categoryColor:"blue_light"
    },
    "RENFORCEMENT": {
        displayName : "Renforcement musculaire",
        colorNuanceClass : "nuance-red",
        imgRef : "./images/icon-renforcement.webp",
        categoryColor:"red"
    },
    "SKATEBOARD": {
        displayName : "Skateboard",
        colorNuanceClass : "nuance-purple",
        imgRef : "./images/icon-skate.webp",
        categoryColor:"purple"
    },
    "RUN-AND-BIKE": {
        displayName : "Run & Bike",
        colorNuanceClass : "nuance-blue-light",
        imgRef : "./images/icon-run-and-bike.webp",
        categoryColor:"blue_light"
    },
    "TIR": {
        displayName : "Tir",
        colorNuanceClass : "nuance-blue-light",
        imgRef : "./images/icon-tir.webp",
        categoryColor:"blue_light"
    },
    "BOWLING": {
        displayName : "Bowling",
        colorNuanceClass : "nuance-olive",
        imgRef : "./images/icon-bowling.webp",
        categoryColor:"olive"
    },
    "PARACHUTE-PARAPENTE": {
        displayName : "Parachute/Parapente",
        colorNuanceClass : "nuance-marron",
        imgRef : "./images/icon-parachute.webp",
        categoryColor:"brown"
    },
    "PO": {
        displayName : "Parcours d'obstacles",
        colorNuanceClass : "nuance-marron",
        imgRef : "./images/icon-po.webp",
        categoryColor:"brown"
    }
};

