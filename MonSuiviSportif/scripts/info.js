
// Gestion condition utilisation
 const conditionText = `
            <p>
                ℹ️ Cette application est conçue pour t'aider à 
                 suivre tes activités physiques. 
                 <b>Toutes tes données sont stockées en local sur ton appareil</b> et rien n’est collecté ou envoyé 
                 sur un serveur.
            </p>
            <p>
                ⚠️ <b>ATTENTION : </b>
                <ul>
                    <li>
                        <b>Ne stocke pas d'informations sensibles</b> (mots de passe, informations bancaires, données de santé ou personnelles, etc...) dans l'application.
                    </li>
                    <li>    
                        Il est recommandé d'<b>effectuer des sauvegardes régulières</b> (menu "Paramètres")  pour éviter toute perte.
                    </li>
                </ul>
            </p>
    
            <p>
                📌  <b>Chaque effort compte !</b>
            </p>
`;


// Insertion du texte dans les conditions et dans A propos







function onOpenMenuInfo(){
    // Insert les conditions dynamique
    document.getElementById("divConditionDynamicTextInfo").innerHTML = conditionText;


    // Récupère le numéro de version dans le HTML pour l'afficher dans info contextuel
    let version = document.getElementById("pInfoVersion").innerHTML;
    document.getElementById("customInfo").innerHTML = version;

    // Creation du menu principal
    onCreateMainMenuInfo();

}
   
   
   
   
   
// Génération du menu principal

function onCreateMainMenuInfo() {
    // Vide le précedent contenut
    let divMainMenuParentRef = document.getElementById("divMainBtnMenu");
    divMainMenuParentRef.innerHTML = "";

    //crée les boutons
    //Retour
    new Button_main_menu(false,btnMainMenuData.return.imgRef,btnMainMenuData.return.text,() => onClickReturnFromInfo());

}
   
   

   
   
   
   
   // Retour depuis Info
   function onClickReturnFromInfo() {
    // Vide les conditions
    document.getElementById("divConditionDynamicTextInfo").innerHTML = "";
   
       // ferme le menu
       onLeaveMenu("Info");
   };