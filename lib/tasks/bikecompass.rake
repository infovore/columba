require 'open-uri'

namespace :bikecompass do
  task :ingest => :environment do
    path = "http://www.tfl.gov.uk/tfl/syndication/feeds/cycle-hire/livecyclehireupdates.xml"
    hash = Hash.from_xml(open(path).read)

    hash['stations']['station'].each do |station_hash|
      Station.create_or_update_from(station_hash)
    end
  end
end
