import { InsideTest, page, mouse } from '../../../system/inside-test.lib.js'
/**
 * Classe qui définit tout un tas d'actions à accomplir au cours des
 * tests, pour simplifier l'écriture.
 * 
 */
class ITActionClass {

  /**
   * Simule une souris qui survole le bouton de choix du type de
   * contenu dans l'+incadre+ défini (le contenu du cadre) et clique
   * sur le bouton pour choisir le type de contenu +incadreType+ (par
   * exemple 'console' ou 'filter')
   * 
   */
  chooseInCadreIn(incadreType, incadre){
      const consoleCourante = Console.current
      // Faire apparaitre les types
      incadre.btnTypeContent.classList.remove('hidden')
      // On choisit l'incadre 'filtre' dans le cadre qui contient 
      // pour le moment la console.
      mouse.clickOn(DGet(`div[data-content="${incadreType}"]`, incadre.btnTypeContent))

  }
}

export const ITAction = new ITActionClass()
