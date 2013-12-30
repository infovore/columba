class Station < ActiveRecord::Base

  set_rgeo_factory_for_column(:latlon,
    RGeo::Geographic.spherical_factory(:srid => 4326))

  def self.create_or_update_from(station_hash)
    station = Station.find_or_initialize_by(:terminal_name => station_hash['terminalName'])
    station.update(
      :original_id => station_hash['id'],
      :name => station_hash['name'],
      :latlon => "POINT(#{station_hash['lat']} #{station_hash['long']})",
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

  def self.nearest_to(lat,lon)
    srid = 4326
    order("ST_Distance(stations.latlon, ST_GeomFromText('POINT (#{lat} #{lon})', #{srid}))").limit(1).first
  end
end
