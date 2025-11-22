class ObjectifListItem {
    constructor(id,activityName,suiviText,isEnabled,imgRef,parentRef) {
        this.id = id;
        this.activityName = activityName;
        this.suiviText = suiviText;
        this.isEnabled = null;//set depuis la fonction updateEnableStatus
        this.parentRef = parentRef;
        this.imgRef = imgRef;

        // Références
        this.checkboxRef = null;

        // conteneur principal
        this.element = document.createElement("div");
        this.element.classList.add("objectif-list-container");
        

        // Fonction de rendu
        this.render();

        // Insertion dans le parent
        this.parentRef.appendChild(this.element);

        //référencement
        this.reference();

        //le statut
        this.updateEnableStatus(isEnabled);

        // Ecouter d'évènement
        this.bindEvent();
    }


    render(){
        this.element.innerHTML = `
            <div class="objectif-list-click-area" id="divObjectifItemList_${this.id}">
                <div class="objectif-card-icon objectif-list-icon">
                    <img src="${this.imgRef}">
                </div>
                <div class="objectif-list-text">
                    <div class="objectif-list-title">${this.activityName}</div>
                    <div class="objectif-list-sub">Objectif : ${this.suiviText}</div>
                </div>
            </div>
            <label class="switch">
                <input type="checkbox" id="objectif_CB_${this.id}">
                <span class="slider"></span>
            </label>
        `;
    }


    // referencement
    reference(){
        this.checkboxRef = this.element.querySelector(`#objectif_CB_${this.id}`);
    }

    // Set le statut activé/désactivé
    updateEnableStatus(newEnabledValue){
        this.isEnabled = newEnabledValue;

        // Gere la class
        if (this.isEnabled) {
            this.element.classList.remove("disabled");
        }else{
            this.element.classList.add("disabled");
        }

        // Gere le checkbox
        this.checkboxRef.checked = this.isEnabled;

    }



    bindEvent(){
        let divClickEditOBjectifRef = this.element.querySelector(`#divObjectifItemList_${this.id}`);
        divClickEditOBjectifRef.addEventListener("click",()=>{
            console.log("Click div id : ",`divObjectifItemList_${this.id}`);
        });
    }

}