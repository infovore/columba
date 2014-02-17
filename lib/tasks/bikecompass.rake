require 'open-uri'

namespace :bikecompass do
  desc "Ingest latest state of all station"
  task :ingest => :environment do
    Station.ingest_latest
  end
end
