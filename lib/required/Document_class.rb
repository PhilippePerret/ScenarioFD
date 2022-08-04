# encoding: UTF-8
=begin

  class Scenario::Document
  ------------------------
  Méthodes de classe

=end
module Scenario
class Document
class << self

  ##
  # Vérifier s'il y a un fichier Final Draft et pas de fichier
  # scénario.
  # S'il y a un fichier scenario.xml dans le dossier, on ne fait
  # rien (le scénario sera chargé à l'ouverture)
  # 
  def check_if_final_draft
    scenario_path = File.join(CURRENT_FOLDER,'scenario.xml')
    unless File.exist?(scenario_path)
      fichiers_finaldraft = Dir["#{CURRENT_FOLDER}/*.fdx"]
      if fichiers_finaldraft.any?
        finaldraft_path = fichiers_finaldraft.first
        plusieurs = fichiers_finaldraft.count > 1
        question = 
          if plusieurs
            "Plusieurs fichiers Final Draft ont été trouvés. Dois-je en convertir un en scénario Scenario ?"
          else
            "Un fichier Final Draft a été trouvé (#{File.basename(finaldraft_path)}). Dois-je le convertir en fichier Scenario et l'ouvrir ?"
          end
        if Q.yes?(question.bleu)
          if plusieurs
            finaldraft_path = Q.select("Quel scénario choisir ?".bleu) do |q|
              fichiers_finaldraft.each do |spath|
                q.choice File.basename(spath), spath
              end
              q.per_page fichiers_finaldraft.count
            end
          end
          require_relative '../modules/convert'
          convert_final_draft_document(finaldraft_path)
        end
      end
    end
  end

  ##
  # Si un scénario courant existe, on le remonte pour l'afficher
  # 
  def get_current_scenario
    path = File.join(CURRENT_FOLDER,'scenario.xml')
    scenario_data = 
      if File.exist?(path)
        new(path).data_for_client
      else
        DEFAULT_DATA
      end
    WAA.send(class:'Scenario', method:'onLoad', data: scenario_data)
  end

  ##
  # Pour sauvegarder le scénario courant (i.e. reconstruire le 
  # fichier XML scenario.xml)
  #
  def save_current(data)
    result = {ok:nil, error:nil}
    data['infos']['updated_at'] = Time.now.to_i
    data['infos']['created_at'] = Time.now.to_i if data['infos']['created_at'].nil?
    begin
      current.save_data_as_yaml(data)
      if current.update_with_data(data)
        result[:ok] = true
      else
        result[:ok] = false
        result[:error] = 'erreur inconnue'
      end      
      current.clean_up_folders
    rescue StandardError => e
      result[:ok]    = false
      result[:error] = e.message
      puts e.message.rouge
      puts e.backtrace.join("\n").rouge
    ensure
      WAA.send(class:'Scenario.current',method:'onSaved',data:{ok:true})
    end
  end

  def save_infos_current(data)
    result = {ok:true, error:nil}
    puts "Informations à enregistrer : #{data['infos']}".jaune
    current.update_infos(data['infos'])
    WAA.send(class:'InfosScenario',method:'onSavedInfos',data:result)
  end

  def save_preferences(data)
    result = {ok:true, error:nil}
    puts "Préférences à enregistrer : #{data['preferences']}".jaune
    result = current.save_preferences(data['preferences'], result)
    WAA.send(class:'Preferences',method:'afterSaved',data:result)
  end

  ##
  # Pour exporter le scénario courant
  #
  def export_current(data)
    current.export(format: data['format'], options:data['options'])
  end

  def current
    @current ||= new(File.join(CURRENT_FOLDER,'scenario.xml'))
  end

  def template_final_draft
    @template_final_draft ||= File.join(APP_FOLDER,'lib','assets','finaldraft_template.fdx')
  end

end #/<< self

DEFAULT_DATA = {
    scenes: [
      {sceneId: 1, content: ":INT. BUREAU - JOUR\nPremière action.\nNOM:\n  (note de jeu)\n  Un dialogue."}
    ],
    options: {
      preview_disposition: 'top',
      pages_number: 120
    },
    infos: {
      path: nil,
      created_at: nil,
      updated_at: nil,
      final_draft_version: 12
    }
}
end #/Document
end #/module Scenario
