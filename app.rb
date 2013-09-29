
require 'rubygems'
require 'haml'
require 'sinatra'
require 'date'

get '/' do
  haml :index, :format => :html5
end

get '/about' do 

end

get '/contact' do 

end



