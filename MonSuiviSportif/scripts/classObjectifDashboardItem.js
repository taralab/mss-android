class ObjectifDashboardItem {
    constructor(activityName,textTargetValue,textSuiviType,textCurrentValue,imgRef,categoryColor,unit,parentRef,isObjectifDone = false){
        this.activityName = activityName;
        this.textTargetValue = textTargetValue;
        this.textSuiviType = textSuiviType;
        this.textCurrentValue = textCurrentValue;
        this.imgRef = imgRef;
        this.categoryColor = categoryColor;
        this.unit = unit;
        this.parentRef = parentRef;
        this.isObjectifDone = isObjectifDone;



        // Contenu dynamique selon l'état

        this.contentToInject = {
            normal : `
                <img src="${this.imgRef}" alt="">
                <div class="dashbaord-objectif-label">Restant :</div>
                <div class="dashbaord-objectif-remaining">
                    ${this.textCurrentValue}  <small>${this.unit}</small>
                </div>
                <div class="dashbaord-objectif-target">Objectif : ${this.textTargetValue} ${this.textSuiviType}</div>
            `,
            done :`

                <img src="${this.imgRef}" alt="">
                <div class="dashbaord-objectif-target">Objectif : ${this.textTargetValue} ${this.textSuiviType}</div>
                                <div class="objectif-done-message">Fait ! 🎉</div>
            `
        }


        // Conteneur principal
        this.element = document.createElement("div");
        this.element.classList.add("dashbaord-objectif-card");

        // Fonction de rendu
        this.render();

        // Insertion dans le parent
        this.parentRef.appendChild(this.element);

    }



    render(){
        this.element.innerHTML = this.isObjectifDone ? this.contentToInject["done"] : this.contentToInject["normal"];
    }
}