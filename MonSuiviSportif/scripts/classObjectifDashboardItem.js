class ObjectifDashboardItem {
    constructor(activityName,textTargetValue,textSuiviType,textCurrentValue,imgRef,categoryColor,unit,parentRef){
        this.activityName = activityName;
        this.textTargetValue = textTargetValue;
        this.textSuiviType = textSuiviType;
        this.textCurrentValue = textCurrentValue;
        this.imgRef = imgRef;
        this.categoryColor = categoryColor;
        this.unit = unit;
        this.parentRef = parentRef;


        // Conteneur principal
        this.element = document.createElement("div");
        this.element.classList.add("dashbaord-objectif-card");

        // Fonction de rendu
        this.render();

        // Insertion dans le parent
        this.parentRef.appendChild(this.element);

    }



    render(){
        this.element.innerHTML = `
            <div class="donut-wrapper">
                .<div class="donut"></div>

                <div class="dashbaord-objectif-icon">
                <img src="${this.imgRef}" alt="">
                </div>
            </div>

            <div class="dashbaord-objectif-title">${this.activityName}</div>
            <div class="dashbaord-objectif-remaining">
                ${this.textCurrentValue} ${this.unit} <small>restants</small>
            </div>
            <div class="dashbaord-objectif-target">Objectif : ${this.textTargetValue} ${this.textSuiviType}</div>
        `;
    }
}