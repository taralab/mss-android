class ObjectifListItem {
    constructor(id,activityName,textTargetNumber,suiviText,isEnabled,imgRef,parentRef) {
        this.id = id;
        this.activityName = activityName;
        this.textTargetNumber = null;//set depuis la fonction updateSuiviText
        this.suiviText = suiviText;
        this.isEnabled = null;//set depuis la fonction updateEnableStatus
        this.parentRef = parentRef;
        this.imgRef = imgRef;

        // Références
        this.checkboxRef = null;
        this.textSuiviRef = null;

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

        //le texte de suivi
        this.updateSuiviText(textTargetNumber);


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
                    <div class="objectif-list-sub" id="objectif_Text_${this.id}"></div>
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
        this.textSuiviRef = this.element.querySelector(`#objectif_Text_${this.id}`);
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
        // Click pour modifier
        let divClickEditOBjectifRef = this.element.querySelector(`#divObjectifItemList_${this.id}`);
        divClickEditOBjectifRef.addEventListener("click",()=>{
            onClickModifyObjectif(this.id);
        });

        // Change l'état (activité/désactivé)
        let inputCBObjectifRef = this.element.querySelector(`#objectif_CB_${this.id}`);
        inputCBObjectifRef.addEventListener("change",(event)=>{
            this.changeEnableStatus(event.target.checked);
        });

    }

    changeEnableStatus(newEnabledStatus){
        // Met à jour cette instance visuellement
        this.updateEnableStatus(newEnabledStatus);

        // Actualisation en array et en base
        onUpdateObjectifEnableStatus(this.id,event.target.checked);
    }


    updateSuiviText(newValue){
        // Récupère la nouvelle valeur
        this.textTargetNumber = newValue;

        //Set le texte
        this.textSuiviRef.textContent = `Objectif: ${this.textTargetNumber} ${this.suiviText}`;
    }

}