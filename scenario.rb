#!/usr/bin/env ruby
# encoding: UTF-8
=begin

  Script maitre de l'application Scenario

=end
require_relative 'lib/my_logger'
SUIVI << 'Entrée dans Scenario'
require_relative 'lib/required'

begin

  # S'il faut convertir le fichier Final Draft du dossier
  Scenario::Document.check_if_final_draft

  WAA.goto File.join(__dir__,'main.html')
  WAA.run
  # On passe ici quand on en a fini
  puts "On en a fini. À la prochaine avec Scénario !"
rescue Exception => e
  puts e.message + "\n" + e.backtrace.join("\n")
ensure
  WAA.driver.quit
  SUIVI << 'Sortie de Scenario'
end
