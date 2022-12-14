# encoding: UTF-8
=begin

  class Scenario::Document
  ------------------------
  Un scénario, donc son document, tel qu'utilisé dans l'application.
  Il contient les scènes, mais aussi toutes les options et autres
  indications.

=end
module Scenario
class Document

  def initialize(path)
    if File.directory?(path)
      path = File.join(path,'Scenario.xml')
    end
    @path = path
  end

  ##
  # Principalement pour les tests, pour forcer à tout recalculer
  #
  def reset
    @data_scenes  = nil
    @metadata     = nil 
    @xml          = nil
  end

  # @return les données pour le client
  def data_for_client
    {
      metadata:     metadata,
      scenes:       data_scenes,
      elements:     elements,
      options:      options,
      infos:        infos,
      preferences:  get_preferences,
      personnages:  personnages,
      decors:       decors
    }    
  end

  # 
  # @return Une table des données de scène contenu dans le scénario
  # (Scenario.xml)
  # 
  def data_scenes
    @data_scenes ||= begin
      table = []
      xml.xpath('//scenes/*').map do |node|
        # puts "node : #{node.inspect}"
        tbl_scene = {}
        node.children.each do |cnode|
          # puts "+++ cnode (class:#{cnode.class}, name:#{cnode.name})"
          next if cnode.text?

          unless cnode.name == 'FD-scene-properties'

            # 
            # Traitement d'un nœud normal de premier niveau 
            # 

            tbl_scene.merge!( cnode.name => cnode.text )

          else

            # 
            # Traitement spécial de la 'FD-scene-properties'
            # (propriété de scène, comme le résumé, le titre, etc.)
            # 

            tbl_scene_properties = {}
            cnode.children.each do |cnode|
              next if cnode.text?

              # puts "Étude de cnode.name = #{cnode.name}".bleu

              # if cnode.children.count > 0
              #   # puts "Le noeud #{cnode.name} contient des enfants.".orange
              #   cnode.children.each do |scnode|
              #     # puts "Enfant de #{cnode.name} : #{cnode.name} = #{cnode.text}".orange
              #   end
              # end

              unless cnode.name == 'personnages'

                # 
                # Traitement d'une propriété de scène de premier 
                # niveau (i.e. sans enfant)
                # 

                tbl_scene_properties.merge!(cnode.name => cnode.text)
              
              else

                # 
                # Traitement de la propriété liste 'personnages'
                # (les personnages de la scène)
                # 

                tbl_scene_properties.merge!('personnages' => [])
                cnode.css('personnage').each do |scnode|
                  tbl_scene_properties['personnages'] << scnode['name']
                end
              end
            end
            # puts "tbl_scene_properties = #{tbl_scene_properties.inspect}".bleu
            tbl_scene_properties = '' if tbl_scene_properties.count == 0
            tbl_scene.merge!( 'FD-scene-properties' => tbl_scene_properties )
          end
        end
        table << tbl_scene
      end
      #
      # Si aucune donnée de scènes n'ont été trouvées, on met
      # les scènes par défaut (c'est juste un petit exemple avec un
      # intitulé et une action).
      # 
      table = Document::DEFAULT_DATA['scenes'] if table.empty?
      # 
      # Pour @data_scenes
      # 
      table
    end
  end
  alias :scenes :data_scenes

  def options
    getNodes('//options/*') || Document::DEFAULT_DATA['options']
  end

  def infos
    getNodes('//infos/*') || Document::DEFAULT_DATA['infos']
  end

  def elements
    tbl_elements = []
    xml.xpath('/scenario/elements/element').each do |node|
      dele = {name: node['name']}
      node.children.each do |cnode|
        dele.merge!(cnode.name => cnode.text)
      end
      tbl_elements << dele
    end

    return tbl_elements
  end

  # La liste des personnages
  # ------------------------
  # Attention : ce n'est pas la liste des personnages qu'on 
  # trouve dans les scènes, mais ceux qui sont définis par une fiche
  # de personnage dans la balise <personnages> qui leur est dédiée.
  # Pour ce qui est des personnages des scènes, ils seront récoltés
  # côté client.
  def personnages
    personnages_node = xml.xpath('/scenario/personnages').first
    if personnages_node.nil?
      return nil
    end
    personnages_node.css('personnage').map do |cnode|
      dpersonnage = {}
      cnode.children.each do |scnode|
        dpersonnage.merge!(scnode.name => scnode.text)
      end
      dpersonnage
    end
  end

  def decors
    getNodes('//decors/*') || []
  end

  def metadata
    @metadata ||= getNode('/scenario/metadata') || {}
  end

  def final_draft_filename
    @final_draft_filename ||= metadata[:final_draft_filename]
  end

  def final_draft_filename=(value)
    metadata.merge!(final_draft_filename: value)
  end

  def getNodes(xpath)
    table = {}
    xml.xpath(xpath).each do |node|
      table.merge!( node.name => node.text)
    end
    if table.empty?
      nil
    else
      table
    end
  end

  def getNode(xpath)
    table = {}
    xml.xpath(xpath).children.each do |child|
      table.merge!(child.name => child.text)
    end
    return table
  end

  def xml
    @xml ||= Nokogiri::XML(File.read_xml(path))
  end

  def export(params)
    require_relative '../modules/export'
    self.send("export_format_#{params[:format]}".to_sym)
  end

  def import(finaldraft_path)
    require_relative '../modules/convert'
    self.class.convert_final_draft_document(finaldraft_path)
  end

  ##
  # = main =
  # 
  # Enregistrer les données
  # 
  # C'est-à-dire reconstruit le fichier scenario.xml avec toutes les
  # données.
  # 
  def update_with_data(data)
    backup_if_already_exists
    File.delete(path) if File.exist?(path)
    build(data)
    if File.exist?(path)
      puts "🍺 Fichier scenario.xml construit avec succès.".vert
      return true
    else
      puts "⛔️ Le Fichier scenario.xml n'a pas été construit…".rouge
      return false
    end
  end

  ##
  #
  # Permet d'empêcher de remplir les dossiers 
  # 
  def clean_up_folders
    [yaml_folder, backups_folder].each do |folder|
      Dir["#{folder}/*.*"].sort.reverse[20..-1]&.each do |pth|
        puts "REMOVE : #{pth}".orange
      end
    end
    puts "= Dossiers cleanés".vert
  end

  # 
  # Enregistrer les données dans un fichier YAML, au cas où ou
  # pour consultation plus facile
  # 
  def save_data_as_yaml(data)
    pth = yaml_path_for_data
    File.open(pth,'wb') do |f| f.write data.to_yaml end
    if File.exist?(pth)
      puts "= Fichier sauvegarde données en YAML OK".vert
    else
      puts "⛔️ Le fichier de sauvegarde des données en YAML n'a pas pu se faire…".rouge
    end
  end
  def yaml_path_for_data
    File.join(yaml_folder, "#{Time.now.strftime('%Y-%m-%d-%H-%M')}.yaml")
  end


  def yaml_folder
    @yaml_folder ||= FileUtils.mkdir_p(File.join(CURRENT_FOLDER,'yaml_data'))
  end

  ##
  # Enregistrement des informations
  #
  def update_infos(infos)
    infos.merge!('updated_at' => Time.now.to_i)
    update('infos' => infos)
    puts "= Informations sur le scénario enregistrées.".vert
  end

  ##
  # Enregistrement de préférences
  #
  def save_preferences(preferences, result)
    File.delete(path_preferences) if File.exist?(path_preferences)
    File.open(path_preferences,'wb') do |f|
      f.write preferences.to_yaml
    end
    unless File.exist?(path_preferences)
      result.merge!(ok: false, error:"Le fichier préférences n'a pas pu être créé.")
    end
    return result
  end

  ##
  # Relève des préférences
  #
  def get_preferences
    if File.exist?(path_preferences)
      YAML.load_file(path_preferences)
    else
      {}
    end
  end

  def path_preferences
    @path_preferences ||= File.join(CURRENT_FOLDER,'preferences.yaml')
  end

  def update(main_data)
    # 
    # Le document Nokogiri
    # 
    xmldoc = Nokogiri::XML::DocumentFragment.parse(File.read(path))
    # 
    # Boucle sur toutes les données à actualiser ou à créer
    # 
    main_data.each do |main_key, sub_data|
      main_node = xmldoc.at_css("scenario #{main_key}")
      sub_data.each do |sub_key, sub_value|
        unless main_node.at_css(sub_key)
          main_node.add_child("<#{sub_key}></#{sub_key}>")
        end
        child_node = main_node.at_css(sub_key)
        child_node.content = sub_value
      end
    end
    # 
    # Écriture du fichier
    # 
    write_xml_doc(xmldoc)    
  end


  ##
  # Construction complète du fichier Scenario.xml
  # 
  # (à partir des données fournies par le client)
  # 
  def build(data)
    nowi = Time.now.to_i
    #
    # Le document actuel ou un nouveau constructeur
    #     
    xml_doc = Nokogiri::XML::Builder.new do |x|
      x.scenario do

        # 
        # Les métadonnées
        # 
        x.metadata do
          metadata.merge!(last_save: nowi)
          metadata.key?(:created_at) || metadata.merge!(created_at: nowi)
          metadata.each do |key, value|
            x.send(key.to_sym, value)
          end
        end

        if data.key?('scenes')
          x.scenes do
            data['scenes'].each do |dscene|
              x.scene('sceneId' => dscene['sceneId']) do
                dscene.each do |k, v|
                  if k == 'content'
                    x.content('xml:space' => 'preserve') do |t|
                      t.text v
                    end
                  else
                    x.send(k.to_sym, v)
                  end
                end
              end
            end
          end
        end # if data['scenes']

        if data.key?('options') && data['options']
          x.options do
            data['options'].each do |k, v|
              x.send(k.to_sym, v)
            end
          end
        end
        
        if data.key?('infos') && data['infos']
          x.infos do
            data['infos'].each do |k, v|
              x.send(k.to_sym, v)
            end
          end
        end

        if data.key?('personnages') && data['personnages']
          x.personnages do
            data['personnages'].each do |k, v|
              x.personnage('name' => k) do
                x.name(k)
                x.description({'xml:space' => "preserve"}, v['description'])
              end
            end
          end
        end

        if data.key?('decors') && data['decors']
          x.decors do
            data['decors'].each do |k, v|
              x.send(k.to_sym, v)
            end
          end
        end

      end
    end
    #
    # Écriture du fichier
    #
    write_xml_doc(xml_doc)    
  end

  def write_xml_doc(doc)
    File.open(path,'wb') do |f| f.write doc.to_xml end
  end

  def backup_if_already_exists
    backup_xml_file if File.exist?(path)    
  end

  def backup_xml_file
    backup_path = File.join(backups_folder, "#{Time.now.strftime('%Y-%m-%d-%H-%M-%S')}.xml")
    FileUtils.copy(path, backup_path)
  end

  def backups_folder
    @backups_folder ||= mkdir(File.join(CURRENT_FOLDER,'xbackups'))
  end

  def path
    @path ||= File.join(CURRENT_FOLDER,'scenario.xml')
  end

end #/Document
end #/module Scenario
