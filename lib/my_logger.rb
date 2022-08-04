# encoding: UTF-8
=begin

  Premier module appelé pour les messages log

  Produit les constantes :

    LOGGER.info|warn|error|fatal|debug

              Pour écrire dans journal.log
              Avec LOGGER.info, LOGGER.warn "Mon message", etc.

    ERROR << "message"

              Pour écrire dans ~/Library/Logs/Scenario/error.log

    DEBUG << message

              Pour écrire dans ~/Library/Logs/Scenario/debug.log

    CRASH_LOG << message

              Pour écrire dans ~/Library/Logs/Scenario/crash.log
=end
require 'logger'
require 'fileutils'

class MySysLogger < Logger
  def initialize(type = :info, life = nil)
    @logger_type = type
    super(log_journal_path, life)
  end

  def << message
    case @logger_type
    when :debug
      self.debug(message)
    when :info
      self.info(message)
    when :warn
      self.warn(message)
    when :error
      self.error(message)
    when :fatal
      self.fatal(message)
    end
  end

  def log_journal_path
    @log_journal_path ||= File.join(log_folder,"#{@logger_type}.log")
  end
  def log_folder
    @log_folder ||= FileUtils.mkdir_p(File.join(Dir.home,'Library','Logs','Scenario'))
  end
end

LOG   = MySysLogger.new(:info, 'daily')
DEBUG = MySysLogger.new(:debug, 'daily')
SUIVI = MySysLogger.new(:info, 'daily')
ERROR = MySysLogger.new(:error, 'daily')
CRASH = MySysLogger.new(:fatal, 'daily')
