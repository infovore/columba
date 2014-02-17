class StationsController < ApplicationController
  def nearest
    station = Station.nearest_to(params[:lat], params[:lon])
    render :json => station.to_json(:methods => [:lat,:lon]) 
  end
end
