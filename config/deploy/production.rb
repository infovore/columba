set :stage, :production
set :rails_env, "production"

set :branch, "master"
set :deploy_to, "/var/www/borisbike_compass"

server 'paprika.tomarmitage.com', user: 'twra2', roles: %w{app db web}

