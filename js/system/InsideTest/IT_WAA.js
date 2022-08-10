'use strict';
/**
 * Pour faire attendre la fin des InsideTest quand il y a des 
 * tests côté serveur et réceptionner les résultats pour les 
 * envoyer à InsideTest
 * 
 */
const IT_ERRORS = {
    requireCurrentTest  : "Il faut impérativement appeler IT_WAA send en mettant en premier argument 'InsideTest.current' pour obtenir l'instance du test (car 'this' est indéfini, dans la définition du test)."
  , testIdRequired      : "IT_WAA.receive attend impérativement data.testId."
}
class IT_WAA {
  static get working(){
    if ( undefined === this.workers ) return false
    // Nombre de workers en activité
    const workersCount = Object.keys(this.workers).length
    // Nombre de retours de résultats non traités
    const ResultatCount = this.stackForInsideTestModule.length
    // S'il reste des choses à faire, on retourne false
    return not(workersCount == 0 && ResultatCount == 0)

  }

  static send(test, data){
    test || raise(IT_ERRORS.requireCurrentTest)
    if ( undefined === this.stackForInsideTestModule ) {
      this.workers = {}
      this.stackForInsideTestModule = []
    }
    /*
    | On consigne ce "worker" (ça donnera aussi la valeur true à
    | this.working)
    */
    Object.assign(this.workers, { [test.id]: test })
    /*
    |  On peut envoyer la requête serveur en ajoutant aux données
    |  l'identifiant du test.
    */
    Object.assign(data.data, {testId: test.id})
    /*
    |  Transmission de la requête au serveur
    */
    WAA.send(data)
  }

  /**
   * Méthode qui reçoit la réponse des tests côté serveur
   * 
   * @param data  {Object} Table des résultat
   *              note : elle doit contenir :testId, l'identifiant 
   *              du test.
   */
  static receive(data){
    // console.log("Données reçues par IT_WAA.receive", data)
    data.testId || raise(IT_ERRORS.testIdRequired)
    const testId = data.testId
    /*
    |  On passe les résultats au test
    */
    this.stackForInsideTestModule.push(data)
    /*
    |  On détruit ce worker
    */
    delete this.workers[testId]
  }



}
