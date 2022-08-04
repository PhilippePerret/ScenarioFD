'use strict';
/**
 * common.js
 * 
 * Méthode communes
 * 
 * version 2.1
 * 
 */
function not(v){ return ! v }

/**
 * Pour pouvoir utiliser par exemple :
 * 
 * try {
 * 
 *   condition || raise("C'est une erreur")
 *
 * } catch (err) {
 * 
 * }
 */
function raise(foo) { throw foo }

/**
 * Retourne la version JSON de +foo+
 * Utile car de nombreuses comparaison, comme celle de Array, ne
 * fonctionnent pas simplement
 */
function JString(foo){
  try {
    return JSON.stringify(foo)
  } catch(err) {
    if ( 'function' == typeof foo.inspect ) {
      return foo.inspect
    } else {
      Log.warn("Impossible de jsonner : ", foo)
    }
    return foo
  }  
}

/**
 * Template string
 *
 *  Par exemple :
 *    tp("Mon %s", ['String']) 
 *      => "Mon String"
 *    tp("Mon %{animal} s'appelle %{nom}", {nom:'Toby', animal:'chien'})
 *      => "Mon chien s'appelle Toby"
 * 
 */
function tp(str, values){
  if ( values.length ) {
    while(str.match(/\%s/)){
      str = str.replace(/\%s/, values.shift())
    }
  } else {
    for(var value in values){
      var reg = new RegExp(`\%\{${value}\}`)
      str = str.replace(reg, values[value])
    }
  }
  return str
}
/* TEST DE tp() */
if ( tp("Mon %{animal} s'appelle %{nom}", {nom:'Toby', animal:'chien'}) != "Mon chien s'appelle Toby"){
  console.error("La méthode tp(…) ne fonctionne pas\nAttendu: %s\nObtenu: %s", "Mon animal s'appelle Toby", tp("Mon %{animal} s'appelle %{nom}", {nom:'Toby', animal:'chien'}))
}
if ( tp("Je lis mon %s.", ['journal']) != "Je lis mon journal."){
  console.error("La méthode tp(…) fonctionne mal\nAttendu: %s\nObtenu: %s", "Je lis mon journal.", tp("Je lis mon %s.", ['journal']))
}

function log_rouge(msg){
  console.log("%c" + msg, "color:red;")
}
function log_bleu(msg){
 console.log("%c" + msg, "color:blue;") 
}
function log_vert(msg){
 console.log("%c" + msg, "color:green;")  
}
function log_orange(msg){
 console.log("%c" + msg, "color:orange;") 
}
