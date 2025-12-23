class ObjectifListItem {
    constructor(id,activityName,rythmeType,dataType,targetValue,isEnabled,parentRef) {
        this.id = id;
        this.activityName = activityName;
        this.rythmeType = rythmeType;
        this.dataType = dataType;
        this.targetValue = Number(targetValue);

        this.parentRef = parentRef;
        this.imgRef = activityChoiceArray[activityName].imgRef;


        this.isEnabled = null;//set depuis la fonction updateEnableStatus
        this.displayText = "";
        this.activityDisplayName = activityChoiceArray[activityName].displayName;

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
        this.updateSuiviText(this.targetValue);


        // Ecouter d'évènement
        this.bindEvent();
    }


    render(){
        this.element.innerHTML = `
            <div class="objectif-list-click-area" id="divObjectifItemList_${this.id}">
                <div class="objectif-card-icon objectif-list-icon">
                    <img class="activity" src="${this.imgRef}">
                </div>
                <div class="objectif-list-text">
                    <div class="objectif-list-title">${this.activityDisplayName}</div>
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
        onUpdateObjectifEnableStatus(this.id,newEnabledStatus);
    }


    updateSuiviText(newTargetValue){
        // Récupère la nouvelle valeur
        this.targetValue = Number(newTargetValue);

        let textToDisplay = this.convertDisplayText();

        //Set le texte
        this.textSuiviRef.textContent = textToDisplay;
    }



    convertDisplayText(){

        let convertedRythme = "",
            convertedType = "",
            convertedTargetValue = "";

        switch (this.dataType) {
            case "COUNT":
                // Aucun traitement parculier pour le moment pour COUNT
                convertedType = "séances";
                convertedTargetValue = this.targetValue;
                break;

            case "DURATION":
                let timeTargetResult = onConvertSecondesToHours(this.targetValue);
                convertedTargetValue = `${timeTargetResult.heures}h${timeTargetResult.minutes}`;
                convertedType = "";
                break;

            case "DISTANCE":
                // Arrondit à deux chiffre après la virgule et n'affiche jamais le dernier zero si présent
                convertedType = "km";
                convertedTargetValue = parseFloat(this.targetValue.toFixed(2));
                break;
        
            default:
                break;
        };


        // Convertion pour nommage rythme
        switch (this.rythmeType) {
            case "WEEK":
                convertedRythme = "semaine";
                break;
            case "MONTH":
                convertedRythme = "mois";
                break;
        
            default:
                break;
        };


        let finalText = `Objectif : ${convertedTargetValue} ${convertedType} / ${convertedRythme}`;

        return finalText;
    }


    //pour supprimer l'item
    removeItem(){
        this.element.remove();
    }

}