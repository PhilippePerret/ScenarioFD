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
 *   condition || raise("La valeur devrait être %s", [valeur])
 * 
 *   condition || raise("Son nom devrait être %{nom} !", {nom: 'Personne'})
 *
 * } catch (err) {
 * 
 * }
 */
function raise(foo, remp) { 
  if ( remp ) foo = tp(foo, remp)
  erreur(foo)
  throw foo 
}

/**
 * Retourne la version JSON de +foo+
 * Utile car de nombreuses comparaisons, comme celle de Array, ne
 * fonctionnent pas simplement.
 * 
 * @param foo {Any} La chose à stringifier
 * @param noCatch {Boolean} Si true, le traitement dans le catch sera
 *                sauté. Cela est nécessaire pour éviter la boucle 
 *                infinie dans le cas ou App.JStringEpure est utili-
 *                sée.
 */
function JString(foo, noCatch){
  try {
    return JSON.stringify(foo)
  } catch(err) {
    if ( noCatch ) return foo
    if ( 'string' == typeof foo.inspect ) {
      return foo.inspect
    } else if ( 'function' == typeof App.JStringEpure ) {
      return JString(App.JStringEpure(foo), true)
    } else {
      Log.warn("Impossible de jsonner : ", foo)
    }
    return foo
  }  
}

function prettyInspect(foo, output, indent){
  indent = indent || 0
  output = output || 'console'
  switch(typeof foo){
  case 'string':
    return '"' + foo + '"'
  case 'boolean':
    return foo ? 'true' : 'false'
  case 'object':
    if ( undefined !== foo.sticky ) { // expression régulière
      return String(foo)
    } else if ( Array.isArray(foo) ) {
      return prettyInspectArray(foo, output, indent + 1)
    } else { // table de hashage
      return prettyInspectObject(foo, output, indent + 1)
    }
  default :
    return foo
  }
}
/**
 * Pour un affichage d'une table
 * 
 * @param table {Hash} La table à afficher
 * @param output {string} Le format ou la sortie ('console', 'html')
 * @param indent {Number} Indentation (nombre de doubles espaces)
 * 
 */
function prettyInspectObject(table, output, indent){
  indent = indent || 1
  output = output || 'console'
  if (output == 'text') { output = 'console' }
  const alinea = alineaFor(indent)
  const lines = [alinea+'{']
  var val
  for(var key in table) {
    val = prettyInspect(table[key], output, indent + 1)
    var line;
    switch(output){
    case 'console':
      line = alinea + key + ': ' + val + ',' ; break
    default:
      line = '<div style="text-indent:'+indent+'em;"><span class="key">'+key+'</span><span class="value">'+val+'</span></div>'
      break
    }
    lines.push(line)
  }
  lines.push(alinea+'}')
  return lines.join(output == 'console' ? "\n" : '')
}

function prettyInspectArray(ary, output, indent){
  const alinea = alineaFor(indent)
  var lines = [alinea+'[']
  ary.forEach( foo => {
    lines.push(prettyInspect(foo, output, indent + 1 ))
  })
  lines.push(alinea+']')
  switch(output){
    case 'console': case 'text':
      lines = alinea + lines.join("\n" + alinea)
      break
    case 'html':
      lines = lines.join("")
      break
  }
  return lines
}


function alineaFor(nombre, unite){
  unite = unite || '  '
  var a = ''
  ++nombre
  while(--nombre){a += unite}
  return a
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
  if ('string' == typeof values) { values = [values] }
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
