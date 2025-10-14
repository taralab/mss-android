class MemoryCard{
    constructor(memoryKey,imgData,parentRef){
        this.memoryKey = memoryKey;
        this.imgData = imgData;
        this.parentRef = parentRef;

        // Conteneur principal
        this.element = document.createElement("div");
        this.element.classList.add("reward-card", "unlocked");

        this.element.onclick = (event) => {
            // affiche en plein écran
            console.log("click sur Memory");
            // onDisplayRewardsFullScreen(this.memoryKey,shareMode);
        };

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



}
