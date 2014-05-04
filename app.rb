require 'rubygems'
require 'haml'
require 'sinatra'
require 'date'

#if ENV['RACK_ENV'] = 'production' 

  #use Rack::Auth::Basic, "Restricted Area" do |username, password|
    #username == 'admin' and password == 'somepasswordhere'
  #end

#end

get '/' do
  haml :index, :format => :html5
end

get '/treemap' do 
  erb :treemap, :format => :html5
end

get '/contact' do 

end



