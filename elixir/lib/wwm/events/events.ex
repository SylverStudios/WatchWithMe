defmodule Wwm.Events.Events do
    alias Wwm.Events.VideoEvent

	def new_video_event(type, video_time, world_time, username) do
		%VideoEvent{type: type,
			video_time: video_time,
			world_time: world_time,
			initiator: username}
	end

	def message(username, content) do
		%{sender: username, body: createBody(username, content)}
	end

	def joined(username) do
		%{username: username, body: "#{username} joined!"}
	end

	def welcome(username) do
		%{username: username, body: "Welcome #{username}"}
	end

	def exit(username) do
		%{username: username, body: "#{username} left."}
	end

# Helpers
		defp createBody(username, body) do
     "[#{username}] #{body}"
  	end
end
