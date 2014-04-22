class UserLocation < ActiveRecord::Base

  set_rgeo_factory_for_column(:latlon,
    RGeo::Geographic.spherical_factory(:srid => 4326))

  delegate :lat, :to => :latlon
  delegate :lon, :to => :latlon

  def self.create_from_params(params)
    ul = self.find_or_create_by(:name => params[:name])

    ul.heading = params[:heading]
    ul.latlon = "POINT(#{params[:lon]} #{params[:lat]})"

    ul.save
  end
end
