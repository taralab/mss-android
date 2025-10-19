class MemoryCard{
    constructor(memoryKey,imgData,parentRef){
        this.memoryKey = memoryKey;
        this.imgData = imgData;
        this.parentRef = parentRef;

        // Conteneur principal
        this.element = document.createElement("div");
        // this.element.classList.add(""); Class à ajouter ici si besoin

        //Ajout de l'évènement
        this.element.addEventListener("click",() => {
            // affiche en plein écran
            currentMemoryIdInView = this.memoryKey;
            onDisplayMemoryFullScreen(this.imgData);
        });

        // Fonction de rendu
        this.render();
    }

    render(){
        this.element.innerHTML = `
            <img class="rewardCardEnable" src="${this.imgData}" loading="lazy">
        `;
        // Insertion dans le parent
        this.parentRef.appendChild(this.element);
    }


    //pour supprimer l'item
    removeItem(){
        this.element.remove();
    }

}
