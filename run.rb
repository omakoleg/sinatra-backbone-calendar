require 'sinatra'
require "json"
require 'data_mapper'

DataMapper.setup(:default,"sqlite3://#{Dir.pwd}/development.db")

class Task
  include DataMapper::Resource
  property :id,         Serial
  property :title,      String, :required => true
  property :start, 		DateTime
  property :end, 		DateTime
  property :color, 		String
end
DataMapper.finalize

get '/' do
	erb :index
end

get '/events' do
  @tasks = Task.all
  content_type :json
  @tasks.to_json
end

post '/events' do
  p = JSON.parse(request.body.read.to_s)
  task = Task.create p
  task.to_json
end

put '/events/:id' do
  id = params[:id]
  p = JSON.parse(request.body.read.to_s)
  task = Task.get(id)
  task.update p
  task.to_json
end

delete '/events/:id' do
  id = params[:id]
  task = Task.get(id)
  task.destroy
  task.to_json
end