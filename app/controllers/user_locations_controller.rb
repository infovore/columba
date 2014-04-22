class UserLocationsController < ApplicationController
  def index
    @locations = UserLocation.all
  end
end
