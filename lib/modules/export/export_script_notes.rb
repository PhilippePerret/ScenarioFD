# encoding: UTF-8
=begin

Export des notes de script au format Final Draft

=end
module Scenario
class Document

def fd_export_script_notes(
  xmldoc:,
  script_notes:,
  options: nil
  )

  #
  # La balise principale contenant les script-notes
  # 
  xfd_scnotes_tag = xmldoc.xpath('/FinalDraft/ScriptNotes').first
  
  #
  # Nettoyage de la balise initiale
  #
  xfd_scnotes_tag.children.remove

  #
  # Ajout de toutes les notes
  #
  script_notes.each do |script_note|
    xfd_scnotes_tag.add_child(script_note.node)
  end

end

end #/class Document
end #/module Scenario
