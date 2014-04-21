require 'open-uri'

class Station < ActiveRecord::Base
  attr_accessor :distance_and_arc

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

  def to_geo_json
    {
      :type => "Feature",
      :geometry => {
        :type => "Point",
        :coordinates => [lon,lat]
      },
      :properties => {
        :name => name,
        :is_installed => is_installed,
        :is_locked => is_locked,
        :install_date => install_date,
        :removal_date => removal_date,
        :is_temporary => is_temporary,
        :number_bikes => number_bikes,
        :number_docks => number_docks,
        :number_empty_docks => number_empty_docks,
      }
    }
  end

  def distance_and_arc_from_lonlat_to_station(origin_lon,origin_lat)
    deg = Station.connection.select_all("select degrees( ST_Azimuth(ST_Point(#{origin_lon},#{origin_lat}), ST_Point(#{lon},#{lat})))").rows[0][0] # first field of first row

    distance = Station.connection.select_all("SELECT round(CAST(ST_Distance_Sphere(ST_Point(#{origin_lon},#{origin_lat}), ST_Point(#{lon},#{lat})) As numeric),2) As dist_meters").rows[0][0]

    {:distance => distance, :arc => deg}
  end

  # these two methods access the decorated distance and arc
  def distance
    distance_and_arc[:distance]
  end

  def arc
    distance_and_arc[:arc]
  end

  def self.collection_to_feature_collection(stations)
    { :type => "FeatureCollection",
      :features => stations.map {|s| s.to_geo_json}
    }.to_json
  end

  def self.nearest_with_empty_racks_to(lat,lon)
    station = available_racks.by_proximity(lat,lon).limit(1).first
    # now decorate that with distance and arc from origin
    station.distance_and_arc = station.distance_and_arc_from_lonlat_to_station(lon,lat)
    station
  end

  def self.nearest_with_bikes_to(lat,lon)
    station = available_bikes.by_proximity(lat,lon).limit(1).first
    # now decorate that with distance and arc from origin
    station.distance_and_arc = station.distance_and_arc_from_lonlat_to_station(lon,lat)
    station
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
