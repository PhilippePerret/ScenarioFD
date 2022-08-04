# encoding: UTF-8
=begin

  Class FdScene::FdParagraph
  --------------------------
  Pour les paragraphes des scènes, à convertir au format 
  XMLFinalDraft

=end
module Scenario
class Document
class FdScene
class FdParagraph

  attr_reader :scene

  # Instance ScLine du paragraphe
  attr_reader :scline 
  attr_reader :type
  attr_reader :text
  attr_reader :offset

  def initialize(
    fdscene:,     # Intance FdScene de la scène du paragraphe
    scline:       # Type Scénario du paragraphe
  )
    @scene    = fdscene
    @scline   = scline
    @text     = scline.text
    @offset   = scline.offset
    @type     = scline.sctype
  end

  def inspect
    text # pour le moment
  end

  ##
  # = main =
  #
  # @return le nœud XML à écrire dans le fichier
  #
  def node
    <<-XML
<Paragraph Type=\"#{fd_type}\">
  <Text>#{fd_text}</Text>
</Paragraph>
    XML
  end

  #
  # Le type FinalDraft en fonction du type Scenario
  # 
  def fd_type
    @fd_type ||= begin
      case type
      when 'intitule' then 'Scene Heading'
      when 'action'   then 'Action'
      when 'note-jeu' then 'Parenthetical'
      when 'dialogue' then 'Dialogue'
      when 'nom'      then 'Character'
      when 'shot'     then 'Shot'
      end
    end
  end


  #
  # Le texte à écrire dans le fichier Final-Draft
  # 
  def fd_text
    @fd_text ||= begin
      text # pour le moment
    end
  end

  # raccourcis
  def length; scline.length end

end #/FdParagraph

##
# Class spéciale pour l'intitulé de scène, qui est très différent
# des autres paragraphes.
# 
class FdSceneHeadingParagraph < FdParagraph

  def node
    <<-XML
<Paragraph Number="#{number}" Type=\"Scene Heading\">
  <SceneProperties>
    <Summary></Summary>
  </SceneProperties>
  <Text>#{fd_text}</Text>
</Paragraph>
    XML
  end

  def number
    @number ||= 'indéfini'
  end
end



end #/FdScene
end #/Document
end #/Scenario
