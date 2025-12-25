class KpiDetailItem {
    constructor(dataType,activity,explanation,parentRef) {
        this.dataType = dataType;
        this.activity = activity;
        this.explanation = explanation;
        this.parentRef = parentRef;


        this.textA = "";
        this.textB = "";

        this.imgRef = activityChoiceArray[this.activity].imgRef;
        this.activityDisplayName = activityChoiceArray[this.activity].displayName;

        // Container principal
        this.element = document.createElement("div");
        this.element.classList.add("objectif-list-container");



        this.onConvertText();

        this.render();
    }



    onConvertText(){
        if (this.dataType === "COUNT") {
            this.textA = `${this.explanation.remainingValue} séances restantes`;
            this.textB = `pour ${this.explanation.remainingDay} jours`;

        }else if (this.dataType === "DISTANCE") {

            // Convertion deux chiffre après la virgule
            let remainingDistance = parseFloat(this.explanation.remainingValue.toFixed(2)),
                requiredDistance = parseFloat(this.explanation.requiredPerDay.toFixed(2));

            this.textA = `${remainingDistance} km restants`;
            this.textB = `Moyenne requise : ${requiredDistance} km/jours`;;

        }else if(this.dataType === "DURATION"){
            // Convertion des heures
            let remainingDuration = onConvertSecondesToHours(this.explanation.remainingValue),
                requiredDuration = onConvertSecondesToHours(this.explanation.requiredPerDay);

            this.textA = `${remainingDuration.heures}h${remainingDuration.minutes} restantes`;
            this.textB = `Moyenne requise : ${requiredDuration.heures}h${requiredDuration.minutes} / jours`;

        }else{
            console.warn("Erreur dataType");
        }
    };


    render(){
        this.element.innerHTML = `
            <div class="objectif-list-click-area">
                <div class="objectif-card-icon objectif-list-icon">
                    <img class="activity" src="${this.imgRef}">
                </div>
                <div class="objectif-list-text">
                    <div class="objectif-list-title">${this.activityDisplayName}</div>
                    <div class="objectif-list-sub">${this.textA}</div>
                    <div class="objectif-list-sub">${this.textB}</div>
                </div>
            </div>
        `;
        // Insertion dans le parent
        this.parentRef.appendChild(this.element);
    };
}