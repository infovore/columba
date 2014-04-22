class StationsController < ApplicationController
  protect_from_forgery :except => :nearest
  def index
    @stations = Station.all
  end

  def nearest
    nearest_with_empty_racks = Station.nearest_with_empty_racks_to(params[:lat], params[:lon])
    nearest_with_bikes = Station.nearest_with_bikes_to(params[:lat], params[:lon])

    if params[:name]
      UserLocation.create_from_params(params)
    end

    hash = {:racks => nearest_with_empty_racks,
            :bikes => nearest_with_bikes}

    render :json => hash.to_json(:methods => [:lat,:lon, :distance, :arc]) 
  end
end
