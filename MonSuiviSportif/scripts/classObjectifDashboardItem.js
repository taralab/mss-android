class ObjectifDashboardItem {
    constructor(activityName,textSuiviTarget,textCurrentValue,imgRef,progressValue,categoryColor,unit,parentRef){
        this.activityName = activityName;
        this.textSuiviTarget = textSuiviTarget;
        this.textCurrentValue = textCurrentValue;
        this.imgRef = imgRef;
        this.progressValue = progressValue;
        this.categoryColor = categoryColor;
        this.unit = unit;
        this.parentRef = parentRef;


        // Conteneur principal
        this.element = document.createElement("div");
        this.element.classList.add("objectif-card");

        // Fonction de rendu
        this.render();

        // Insertion dans le parent
        this.parentRef.appendChild(this.element);

    }



    render(){
        this.element.innerHTML = `
            <div class="objectif-top-row">
                <div class="objectif-card-icon">
                    <img src=${this.imgRef}>
                </div>
                <div class="objectif-progress-badge" style="--progress: ${this.progressValue} ; --bar-color:${this.categoryColor}">
                    <svg viewBox="0 0 36 36">
                        <path class="objectif-track" d="M18 2.5
                            a 15.5 15.5 0 1 1 0 31
                            a 15.5 15.5 0 1 1 0 -31" />
                        <path class="objectif-progress" d="M18 2.5
                            a 15.5 15.5 0 1 1 0 31
                            a 15.5 15.5 0 1 1 0 -31" />
                    </svg>
                    <div class="objectif-card-value">
                        <span class="value-number">${this.textCurrentValue}</span>
                        <span class="value-unit">${this.unit ?? ""}</span>
                    </div>
                </div>
            </div>
            <p>${this.textSuiviTarget}</p>
        `;
    }
}