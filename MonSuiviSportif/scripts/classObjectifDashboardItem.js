class ObjectifDashboardItem {
    constructor(activityName,rythmeType,dataType,remainingValue,targetValue,parentRef){
        this.activityName = activityName;
        this.rythmeType = rythmeType;
        this.dataType = dataType;
        this.remainingValue = Number(remainingValue);
        this.targetValue = Number(targetValue);
        this.imgRef = activityChoiceArray[this.activityName].imgRef;
        this.parentRef = parentRef;


        //Vérifie si objectif atteind ou non
        this.isObjectifDone = this.remainingValue <=0;


        // Les éléments formatés pour affichage
        this.unit = null;
        this.convertedValue = null;
        this.contentToInject = {};
        this.convertedRythme = null;//Semaine,mois
        this.convertedType = null;//Séances,km
        this.convertedTargetValue = null;




        // Conteneur principal
        this.element = document.createElement("div");
        this.element.classList.add("dashbaord-objectif-card");

        // Fonction de rendu
        this.convertToDisplay();
        this.render();

        // Insertion dans le parent
        this.parentRef.appendChild(this.element);

    }



    convertToDisplay(){
        // Convertion pour dataType

        switch (this.dataType) {
            case "COUNT":
                // Aucun traitement parculier pour le moment pour COUNT
                this.convertedValue = this.remainingValue;
                this.unit = "";
                this.convertedType = "séances";
                this.convertedTargetValue = this.targetValue;
                break;
            case "DURATION":
                let timeRemainingResult = onConvertSecondesToHours(this.remainingValue);
                this.convertedValue = `${timeRemainingResult.heures}h${timeRemainingResult.minutes}`;
                this.unit = "";

                let timeTargetResult = onConvertSecondesToHours(this.targetValue);
                this.convertedTargetValue = `${timeTargetResult.heures}h${timeTargetResult.minutes}`;
                break;

            case "DISTANCE":
                // Arrondit à deux chiffre après la virgule et n'affiche jamais le dernier zero si présent
                this.convertedValue = parseFloat(this.remainingValue.toFixed(2));
                this.convertedType = "km";
                this.unit = "km";
                console.log(this.targetValue);
                this.convertedTargetValue = parseFloat(this.targetValue.toFixed(2));
                break;
        
            default:
                break;
        };


        // Convertion pour nommage rythme
        switch (this.rythmeType) {
            case "WEEK":
                this.convertedRythme = "semaine";
                break;
            case "MONTH":
                this.convertedRythme = "mois";
                break;
        
            default:
                break;
        };


        console.log("remainingValue : ", this.convertedValue);
        // Traitement
        this.contentToInject = {
            normal : `
                <img src="${this.imgRef}" alt="">
                <div class="dashbaord-objectif-label">Restant :</div>
                <div class="dashbaord-objectif-remaining">
                    ${this.convertedValue}  <small>${this.unit}</small>
                </div>
                <div class="dashbaord-objectif-target">Objectif : ${this.convertedTargetValue} ${this.convertedType} / ${this.convertedRythme}</div>
            `,
            done :`

                <img src="${this.imgRef}" alt="">
                <div class="dashbaord-objectif-target">Objectif : ${this.convertedTargetValue} ${this.convertedType} / ${this.convertedRythme}</div>
                                <div class="objectif-done-message">Fait ! 🎉</div>
            `
        }

    };

    render(){
        this.element.innerHTML = this.isObjectifDone ? this.contentToInject["done"] : this.contentToInject["normal"];
    };
}