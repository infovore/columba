require 'open-uri'

class Station < ActiveRecord::Base
  set_rgeo_factory_for_column(:latlon,
    RGeo::Geographic.spherical_factory(:srid => 4326))


  delegate :lat, :to => :latlon
  delegate :lon, :to => :latlon

  scope :active, -> {
    where(is_installed: true,
          is_locked: false)
  }

  scope :available_racks, -> {
    active.where("number_empty_docks > 0")
  }

  scope :available_bikes, -> {
    active.where("number_bikes > 0")
  }

  scope :by_proximity, ->(lat,lon) {
    srid = 4326
    order("ST_Distance(stations.latlon, ST_GeomFromText('POINT (#{lon} #{lat})', #{srid}))")
  }

  def self.nearest_with_empty_racks_to(lat,lon)
    available_racks.by_proximity(lat,lon).limit(1).first
  end

  def self.nearest_with_bikes_to(lat,lon)
    available_bikes.by_proximity(lat,lon).limit(1).first
  end

  def self.create_or_update_from(station_hash)
    station = Station.find_or_initialize_by(:terminal_name => station_hash['terminalName'])
    station.update(
      :original_id => station_hash['id'],
      :name => station_hash['name'],
      :latlon => "POINT(#{station_hash['long']} #{station_hash['lat']})",
      :is_installed => station_hash['installed'].eql?('true'),
      :is_locked => station_hash['locked'].eql?('true'),
      :install_date => station_hash['installDate'] ? Time.at(station_hash['installDate'].to_i / 1000).to_datetime : nil,
      :removal_date => station_hash['removalDate'] ? Time.at(station_hash['removalDate'].to_i / 1000).to_datetime : nil,
      :is_temporary => station_hash['temporary'].eql?('true'),
      :number_bikes => station_hash['nbBikes'].to_i,
      :number_docks => station_hash['nbDocks'].to_i,
      :number_empty_docks => station_hash['nbEmptyDocks'].to_i
    )
  end

  def self.ingest_latest
    path = "http://www.tfl.gov.uk/tfl/syndication/feeds/cycle-hire/livecyclehireupdates.xml"
    hash = Hash.from_xml(open(path).read)

    hash['stations']['station'].each do |station_hash|
      Station.create_or_update_from(station_hash)
    end
  end

end
