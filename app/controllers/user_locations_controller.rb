class UserLocationsController < ApplicationController
  def index
    @locations = UserLocation.all
  end

  def nearest_station
    ul = UserLocation.where(:name => params[:id]).first
    if ul
      nearest_with_empty_racks = Station.nearest_with_empty_racks_to(ul.lat,ul.lon, ul.heading)
      nearest_with_bikes = Station.nearest_with_bikes_to(ul.lat,ul.lon,ul.heading)

      hash = {:racks => nearest_with_empty_racks,
              :bikes => nearest_with_bikes}

      render :json => hash.to_json(:methods => [:lat,:lon, :distance_rounded, :arc_rounded, :offset_bearing_rounded])
    end
  end
end
