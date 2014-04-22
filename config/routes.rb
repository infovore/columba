BorisbikeCompass::Application.routes.draw do
  resources :stations do 
    collection do 
      post 'nearest'
    end
  end
  resource :compass, :controller => "compass"
  resources :user_locations
  root "compass#show"
end
