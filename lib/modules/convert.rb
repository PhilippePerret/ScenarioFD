# encoding: UTF-8
=begin

  Module de conversion d'un fichier Final Draft vers Scenario

=end
module Scenario
class Document
class << self

  ##
  # @param  fd_color {String} La couleur FD stupide
  # @return {String} La couleur en hexadécimal
  # 
  def fd_color_to_color(fd_color)
    '#' + fd_color[1..2] + fd_color[5..6] + fd_color[9..10]
  end

  ##
  # Conversion d'un scénario Final Draft vers un scénario Scenario,
  # donc un fichier XML de nom scenario.sce
  # 
  def convert_final_draft_document(fd_path)
    puts "J'apprends [encore] à convertir le fichier #{File.basename(fd_path)} en fichier Scenario".jaune

    xsce = Nokogiri::XML(File.read_xml(fd_path))

    #
    # === TRAITEMENT DES SCÈNES ===
    # 

    # 
    # Pour les données des scènes
    # 
    data_scenes = []
    # 
    # Pour les données d'Outline
    # 
    doutline = []
    new_scene = nil
    xsce.xpath('/FinalDraft/Content/*').each do |parag|
      type = parag['Type']
      text = parag.text.strip
      case type
      when 'Scene Heading'
        #
        # La scène d'entête contient beaucoup d'informations à
        # reprendre
        # 
        new_scene && data_scenes << new_scene
        number = parag['Number'] || data_scenes.count + 1
        fd_props = get_scene_property_from_node(parag.css('SceneProperties').first)
        intitule = parag.css('> Text').first.text
        new_scene = {sceneId: number, index: data_scenes.count, content: [":#{intitule}"], fd_props: fd_props}
        add_scene_properties_to_content(new_scene) if fd_props
      when 'Dialogue'
        new_scene[:content] << "  #{text}"
      when 'Action'
        new_scene[:content] << text
      when 'Character'
        new_scene[:content] << "#{text}:"
      when 'Parenthetical'
        new_scene[:content] << "  (#{text})"
      when 'Transition'
        new_scene.merge!(transition: "> #{text}")
      when 'Outline 1'
        doutline << {level:1, text:text}
      when 'Outline 2'
        doutline << {level:2, text:text}
      when 'Outline 3'
        doutline << {level:3, text:text}
      when 'Outline Body'
        doutline << {level:0, text:text}
      else
        puts "Balise inconnue : #{parag['Type'].inspect}".rouge
      end
    end
    data_scenes << new_scene

    data_scenes.each do |dscene|
      dscene[:content] = dscene[:content].join("\n")
    end

    # POUR VOIR LES DONNÉES DES SCÈNES
    # puts "\n\ndata_scenes:\n#{data_scenes.pretty_inspect}"

    # 
    # --- Données des styles d'éléments
    # 
    data_elements = []
    xsce.xpath('/FinalDraft/ElementSettings').each do |node|
      delement = {}
      delement.merge!(:type => node['Type'])
      font_spec = node.css('FontSpec').first
      para_spec = node.css('ParagraphSpec').first
      behavior  = node.css('Behavior').first
      outline   = node.css('Ouline').first
      delement.merge!({
        font:       font_spec['Font'],
        size:       font_spec['Size'],
        color:      fd_color_to_color(font_spec['Color']),
        background: fd_color_to_color(font_spec['Background']),
        align:      para_spec['Alignment'],
        indent1:    para_spec['FirstIndent'],
        indentL:    para_spec['LeftIndent'],
        indentR:    para_spec['RightIndent'],
        before:     para_spec['SpaceBefore'],
        spacing:    para_spec['Spacing'],
      })
      data_elements << delement
    end

    # POUR VOIR LES DONNÉES DES STYLES ÉLÉMENTS
    # puts "\n\ndata_elements:\n#{data_elements.pretty_inspect}"


    #
    # Le constructeur
    # 
    @builder = Nokogiri::XML::Builder.new do |x|

      # root
      x.scenario do

        #
        # --- Les métadonnées ---
        #
        x.metadata do
          x.final_draft_filename File.basename(fd_path)
          x.converted_at  Time.now.to_i
          x.scenario_version APP_VERSION
          x.finaldraft_version xsce.xpath('/FinalDraft').first['Version']
        end

        #
        # --- Les scènes ---
        # 
        x.scenes do
          data_scenes.each do |dscene|
            x.scene(sceneId: dscene[:sceneId]) do
              x.sceneId dscene[:sceneId]
              x.content({'xml:space' => "preserve"}, dscene[:content])
              if dscene[:fd_props]
                x.send('FD-scene-properties') do
                  x.title dscene[:fd_props][:title]
                  x.summary({'xml:space' => "preserve"}, dscene[:fd_props][:summary])
                  x.personnages do 
                    dscene[:fd_props][:personnages].each do |nom, dnom|
                      x.personnage(name: dnom[:name]) do
                        x.name( dnom[:name] )
                        x.description({'xml:space' => "preserve"}, dnom[:text])
                      end
                    end
                  end
                end
              end # if dscene[:fd_props]
            end #/scene
            # break # pour en voir une seule
          end

        end # /x.scenes

        # 
        # --- Les éléments ---
        # 
        x.elements do
          data_elements.each do |delement|
            x.element({'name' => delement[:type]}) do
              x.font_family(delement[:font])
              x.font_size(delement[:size])
              x.font_color(delement[:color])
              x.background(delement[:background])
              x.align(delement[:align])
              x.first_indent(delement[:indent1])
              x.left_indent(delement[:indentL])
              x.right_indent(delement[:indentR])
              x.space_before(delement[:before])
              x.spacing(delement[:spacing])
            end
          end
        end #/ x.elements

      end
    
    end # @builder


    # POUR VOIR LE CODE XML
    # puts @builder.to_xml

    # 
    # === TRAITEMENT DES NOTES ===
    # 

    dnotes = xsce.xpath('/FinalDraft/ScriptNotes/*').map do |note|
      {
        titre:        note['Name'], 
        created_at:   note['DateTime'], 
        updated_at:   note['DateModified'], 
        range:        note['Range'], 
        color:        note['Color'], 
        writer:       note['WriterName'], 
        writer_id:    note['WriterID'],
        text:         note.css("Paragraph Text").text
      }
    end

    # POUR VOIR LES DONNÉES DES NOTES
    # puts "\n\ndnotes:\n#{dnotes}"

    #
    # On peut écrire le code XML dans le fichier
    #
    write_xml_code_in_scenario_doc(fd_path)

  end #/convert_final_draft_document


  def write_xml_code_in_scenario_doc(fd_path)
    scenario = new(File.join(File.dirname(fd_path),'scenario.xml'))
    scenario.write_xml_doc(@builder)
    if File.exist?(scenario.path)
      puts "Le fichier scenario.xml a été construit avec succès !".vert
    else
      puts "Malheureusement, impossible de trouver le fichier scenario.xml…".rouge
    end
  end


  ##
  # Les propriétés de la scène ont été récupérées de SceneProperties,
  # il faut en mettre certaines dans le code de Scenario pour qu'il
  # en prenne connaissance.
  # 
  def add_scene_properties_to_content(new_scene)
    props = new_scene[:fd_props]
    [:color, :title, :summary].each do |key|
      if props.key?(key)
        value = case key
          when :summary then props[key].gsub(/\n/,'_RET_')
          else props[key]
          end
        new_scene[:content] << "$#{key} = #{value}" 
      end
    end
  end

  ##
  # Pour récupérer les informations contenu dans la balise
  # SceneProperties d'un paragraphe de type 'Scene Heading'
  # Cette balise contient de nombreuses informations sur la scène.
  #
  def get_scene_property_from_node(node)
    return if node.nil?
    # puts "--- node = #{node.inspect}"
    data_scene = {}
    # Titre de la scène
    data_scene.merge!(title: node['Title'])

    #
    # Couleur de la scène
    # 
    # Stupidement, la couleur est définie en redoublant chaque valeur
    # hexadécimal. Par exemple, la couleur #0099CC va donner le code
    # #00009999CCCC.
    # 
    if ( node['Color'] )
      data_scene.merge!(color: fd_color_to_color(node['Color']) )
    end

    #
    # Résumé (Summary)
    #
    node.css('Summary').each do |snode|
      data_scene.merge!(summary: [])
      snode.css('Paragraph').each do |ssnode|
        data_scene[:summary] << ssnode.text.strip
      end
      data_scene[:summary] = data_scene[:summary].join("\n")
    end

    #
    # Arcs de personnages
    #
    personnages = {}
    node.css('SceneArcBeats').first.children.each do |snode|
      if snode.name == 'CharacterArcBeat'
        personnage = snode['Name']
        personnages.merge!(personnage => [])
        snode.css('Paragraph').each do |ssnode|
          next if ssnode.text?
          strnode = ssnode.text.strip
          unless strnode.empty?
            personnages[personnage] << strnode
          end
        end
        personnages[personnage] = {name:personnage, text:personnages[personnage].join("\n")}
      end
    end
    data_scene.merge!(personnages:  personnages)

    return data_scene
  end #/get_scene_property_from_node

end #<< self
end #/Document
end #/module Scenario
