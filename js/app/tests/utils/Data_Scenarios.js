

export const DataScenarioComplet = {
  scenes: [
      // SCENE #1
      // Simple action
      {sceneId:'3', content:":INT. SALON - JOUR\nUne action dans le salon."}
      // SCENE #2
      // Personnage avec dialogue
    , {sceneId:'5', content:":EXT. RANCH - NUIT\nMarion va parler.\nMARION:\n  Je m’appelle Marion."}
      // SCENE #3
      // Personnage avec dialogue et note de jeu
    , {sceneId:'1', content:":INT. PLACARD - NUIT\nBERNARD:\n  (apeuré)\n  Même pas peur."}
      // SCENE #4
      // Dialogue alternatif
    , {sceneId:'4', content:":INT. WAGON - NUIT\nSAM:\n  Je dis ça.\n  ^Mais je pourrais aussi dire ça.\nValence se retourne."}
      // SCENE #5
      // Transition
    , {sceneId:'7', content:":EXT. AUTOROUTE - JOUR\nUne action avant un cut.\n> CUT"}
      // SCENE #6
      // Décor et sous-décor
    , {sceneId:'12', content:":EXT. APPART : TERRASSE - JOUR\nLes personnages sont sur la terrasse.\nIls regardent au loin."}
      // SCENE #7
      // Même décor et autre sous-décor
    , {sceneId:'8', content:":INT. APPART: CHAMBRE - NUIT\nLes personnages sont dans la chambre de l'appartement."}
      // SCENE #8
      // Scène avec des notes
    , {sceneId:'10', content:":EXT. IMPASSE DES FAUVETTES - NUIT\nUn homme marche dans la rue [1].\nIl[2] est déterminé.\n[2] C'est une note dans le texte.\n[1] C'est notre rue d'Aubagne, près de Marseille."}
      // Commentaires et lignes vides
    , {sceneId:'20', content:"# Un commentaire\n# Un autre commentaire\n\n\n$page = 20\n:EXT. ÉGLISE - JOUR\n\n\nPHIL est devant l'église.\n\nMARION la regarde aussi."}
      // Donnée $page
    , {sceneId:'18', content:":INT. VOITURE DE MARION - JOUR\n$page = 14\nUn action à la 14e minute du film."}
      // Donnée $resume
    , {sceneId:'15', content:":EXT. PLAINE - NUIT\nUn paysage idylique de plaine.\n$resume = La scène décrit la plaine au commencement du film.\nUne deuxième description de la plaine."}
      // Donnée $titre
    , {sceneId:'17', content:":INT. CUISINE - JOUR\n# Cette scène ne possède qu'un intitulé et un titre\n$titre = La scène dans la cuisine."}
      // Donnée $duree
    , {sceneId: '11', content:"# Une scène de durée imposée\n:EXT. CHAMP DE BLÉ - JOUR\nC'est une scène courte, mais longue.\n\n$duree = 20"}
      // Scène totale
    , {sceneId:'24', content:"# Cette scène contient tous les formatages\n$page = 12\n$titre = La scène totale\n:INT./EXT. APPART - NUIT\nUne action simple.\nUne action avec une note [1]\nMARIE:\n  Je m'appelle Marie.\n  ^Je ne m'appelle pas Marie.\nJOSEPH:\n  (fermant les yeux)\n  Comment t'appelles-tu alors ?\nIl la regarde [3] avec la note 3.\n[1] La première note.•\n> Fondu enchaîné\n[3] La seconde note d'id 3."}
  ]
, infos: {
    titre_scenario: "Test du parsing des scènes"
  }
}

