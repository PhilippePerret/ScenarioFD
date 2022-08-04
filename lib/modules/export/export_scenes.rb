# encoding: UTF-8
=begin

Export des scènes au format Final Draft

=end
module Scenario
class Document

def fd_export_scenes(
  xmldoc:,
  scenes:,
  options: nil
  )

  #
  # La balise principale contenant les scènes
  # 
  xfd_content_tag = xmldoc.xpath('/FinalDraft/Content').first
  
  #
  # Nettoyage de la balise initiale
  # 
  xfd_content_tag.children.remove

  # 
  # ENREGISTREMENT DE CHAQUE SCÈNE
  #

  #
  # Un offset courant va nous permettre de définir le rang de chaque
  # script-note (qui sera retourné pour écriture ultérieure)
  # 
  current_offset = 0

  #
  # Pour mettre les script_notes qui seront retournées
  # 
  script_notes = []

  # 
  # Boucle sur toutes les scènes
  # 
  fdscenes = scenes.map do |dscene|
    #
    # Instanciation des scènes
    # 
    puts "\n*** Export dscene: #{dscene.inspect}"
    fdscene = FdScene.new(dscene.merge(offset: current_offset))
    fdscene.parse
    current_offset += fdscene.length
    fdscene # -> map
  end.each do |fdscene|
    # 
    # Insertion des paragraphes de la scène
    # 
    fdscene.fd_paragraphs.each do |paragraph|
      puts "*** Export paragraphe: #{paragraph.inspect}"
      xfd_content_tag.add_child(paragraph.node)
    end
  end.each do |fdscene|
    # 
    # Récupération de toutes les script-notes
    # 
    fdscene.script_notes.each do |script_note|
      script_notes << script_note
    end
  end

  return {
    script_notes: script_notes
  }
end

end #/class Document
end #/module Scenario
