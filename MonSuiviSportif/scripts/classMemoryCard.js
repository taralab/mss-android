class MemoryCard{
    constructor(memoryKey,imgData,parentRef){
        this.memoryKey = memoryKey;
        this.imgData = imgData;
        this.parentRef = parentRef;

        // Conteneur principal
        this.element = document.createElement("div");
        this.element.classList.add("memory-card"); 
        
        // Clic sur la carte → ouverture de la visionneuse
        this.element.addEventListener("click", () => {
            console.log("click");
            currentMemoryIdInView = this.memoryKey;
            onOpenVisionneuse(this.memoryKey);
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
