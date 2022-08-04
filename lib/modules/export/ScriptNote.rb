# encoding: UTF-8
=begin

  class ScriptNote
  ----------------
  Gestion des script-notes

=end
module Scenario
class Document
class FdScene
class ScriptNote

  # L'instance FdScene de la scène définissant la script-note
  attr_reader :scene

  # L'instance ScLine
  attr_reader :scline

  # ID de la note (son numéro)
  attr_reader :id

  # Le texte de la note
  attr_reader :text

  # Le rang (range) de la note
  attr_reader :range

  def initialize(
    fdscene:,     # La FdScene définissant la script-note
    scline:       # L'instance ScLine de la script-note
  )
    @scene  = fdscene
    @scline = scline
    # Toutes les données sont définies dans ScLine
    @data   = scline.script_note
    @id     = @data[:id]
    @text   = @data[:text]
    @range  = @data[:range]
  end

  ##
  # @return Le nœud XML à écrire dans le fichier
  # 
  def node
    text_attributes = SCRIPT_NOTE_TEXT_ATTRIBUTES.merge('RevisionID' => revision_id)
    <<-XML
<ScriptNote #{define_attributes(scriptnote_attributes)}>
  <Paragraph #{define_attributes(PARAGRAPH_ATTRIBUTES)}>
    <Text #{define_attributes(text_attributes)}>#{text}</Text>
  </Paragraph>
</ScriptNote>
    XML
  end

  def scriptnote_attributes 
    {
      'Color'         => color,
      'DateModified'  => updated_at,
      'DateTime'      => created_at,
      'Id'            => id,
      'Name'          => title,
      'Range'         => range,
      'Type'          => '',
      'WriterID'      => writer_id,
      'WriterName'    => writer
    }
  end

  def color
    @color ||= @data[:color] || '#000000000000'
  end
  def updated_at
    @updated_at ||= @data[:updated_at] || Time.now.to_i
  end
  def created_at
    @created_at ||= @data[:created_at] || Time.now.to_i
  end
  def title
    @title ||= @data[:title] || ''
  end
  def writer_id
    @writer_id ||= @data[:writer_id] || WRITER_ID
  end
  def writer
    @writer ||= @data[:writer] || WRITER
  end
  def revision_id
    @revision_id ||= @data[:revision_id] || 0
  end
end #/class ScriptNote
end #/class FdScene
end #/class Document
end #/module Scenario
