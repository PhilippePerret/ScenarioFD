# encoding: UTF-8
=begin

  Module d'export d'un scénario Scenario vers Final Draft.

  Soit on fabrique entièrement un document Final Draft, à partir 
  d'un template,
  Soit on prend le fichier d'origine qui a permis de produire le
  document Scenario et on l'actualise.

=end
require_relative 'export/constants'
require_relative 'export/utils'
require_relative 'export/FdScene'
require_relative 'export/ScLine'
require_relative 'export/FdParagraph'
require_relative 'export/ScriptNote'
require_relative 'export/export_scenes'
require_relative 'export/export_script_notes'

module Scenario
class Document

  ##
  # = main =
  # 
  # Méthode principale pour exporter le document courant sous forme
  # de fichier FinalDraft
  # 
  def export_format_final_draft
    result = {ok:true, error:nil, format:'final_draft'}

    puts "J'apprends à exporter au format final draft".jaune
    
    if final_draft_path
      
      #
      # On fait un nouveau document FinalDraft pour ne pas
      # toucher à l'original
      #
      backup_final_draft_file(final_draft_path)

      File.delete(final_draft_path)

    else

      #
      # Le fichier scenario.fdx n'existe pas encore, il faut prendre
      # le template pour le fabriquer
      # 
      make_a_scenario_final_draft_from_template

    end

    #
    # On prend l'instance XML du document final Final-Draft
    # 
    xfd = Nokogiri::XML(File.read(final_draft_path))

    #
    # Exportation des SCÈNES
    # 
    # Le +result+ de l'exportation des scènes comprend de nombreuses
    # informations à enregistrer plus tard, à commencer par les notes
    # de script, qui sont contenues dans le corps complet des scènes.
    #
    scenes_retour = fd_export_scenes(
      xmldoc:   xfd, 
      scenes:   self.scenes, 
      options:  nil)

    #
    # Exportation des SCRIPTS-NOTES
    # 
    scnotes_retour = fd_export_script_notes(
      xmldoc:       xfd, 
      script_notes: scenes_retour[:script_notes],
      options:      nil
      )


    #
    # Écriture du fichier Final-Draft
    # 
    File.write(final_draft_path, xfd.to_xml)

    #
    # Vérification
    # 
    if File.exist?(final_draft_path)
      puts "🍺 Le scénario a été exporté avec succès au format FinalDraft.".vert
    else
      puts "⛔️ Impossible de fabriquer le document FinalDraft…".rouge
    end

  rescue Exception => e
    result[:ok] = false
    result[:error] = e.message
    puts e.message.rouge + "\n" + e.backtrace.join("\n").rouge
  ensure
    WAA.send(class:'Scenario',method:'onExported',data:result)
  end


  # @return {String} Chemin d'accès au scénario final draft
  #
  # Si le scénario provient d'un document FinalDraft, son nom
  # a été enregistré dans les métadonnées du fichier XML Scenario
  #
  def final_draft_path
    @final_draft_path ||= begin
      if final_draft_filename
        File.join(CURRENT_FOLDER, final_draft_filename)
      end
    end
  end


  private

    ##
    # Produire un backup du fichier Final-Draft initial
    # 
    def backup_final_draft_file(fd_path)
      backup_path = File.join(backups_folder, "FD-#{Time.now.strftime('%Y-%m-%d-%H-%M')}.fdx")      
      FileUtils.copy(fd_path, backup_path)
    end

    ##
    # Produire le document Final-Draf de départ à partir du
    # template
    # 
    def make_a_scenario_final_draft_from_template
      self.final_draft_filename = 'scenario.fdx'
      template = Document.template_final_draft
      (template && File.exist?(template)) || raise("Impossible de trouver le document XML Final-Draft template.")
      puts "final_draft_path: #{final_draft_path.inspect}".bleu
      !File.directory?(final_draft_path) || raise("Le fichier Final-Draft de destination ne devrait pas être un dossier…")
      FileUtils.copy(template, final_draft_path)
    end

end #/class Document
end #/module Scenario
