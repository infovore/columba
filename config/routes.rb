BorisbikeCompass::Application.routes.draw do
  resources :stations do 
    collection do 
      post 'nearest'
    end
  end
  resource :compass, :controller => "compass"
  root "compass#show"
end
