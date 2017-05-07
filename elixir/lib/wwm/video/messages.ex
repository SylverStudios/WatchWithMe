defmodule Wwm.Video.Messages do
	@moduledoc """
	This is only temporary, going to transition this
	into an action that can be reduced
	"""

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
