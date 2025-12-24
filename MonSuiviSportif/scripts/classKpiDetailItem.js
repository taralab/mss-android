class KpiDetailItem {
    constructor(activity,remainingText,requiredText,parentRef) {
        this.activity = activity;
        this.remainingText = remainingText;
        this.requiredText = requiredText;
        this.parentRef = parentRef;



        this.imgRef = activityChoiceArray[this.activity].imgRef;
        this.activityDisplayName = activityChoiceArray[this.activity].displayName;

        // Container principal
        this.element = document.createElement("div");
        this.element.classList.add("objectif-list-container");



        this.render();
    }



    render(){
        this.element.innerHTML = `
            <div class="objectif-list-click-area">
                <div class="objectif-card-icon objectif-list-icon">
                    <img class="activity" src="${this.imgRef}">
                </div>
                <div class="objectif-list-text">
                    <div class="objectif-list-title">${this.remainingText}</div>
                    <div class="objectif-list-sub">${this.requiredText}</div>
                </div>
            </div>
        `;
        // Insertion dans le parent
        this.parentRef.appendChild(this.element);
    };
}