defmodule Wwm.VideoState do
  @moduledoc """
  Provides a struct describing the video state

  Using the redux store pattern, this is the
  app state. 
  """

  @enforce_keys [:is_playing, :time]
  defstruct [:is_playing, :time, last_action: nil]

  @type action :: {String.t, Number, String.t}
  @type video_state :: %VideoState{Boolean, Integer, action}

  @spec reduce(video_state, action) :: video_state
  def reduce(video_state, %{"type" => action, "video_time" => v_time, "initiator" => initiator}) do
    IO.puts "will reduce here"
    video_state
  end

  @spec append_last_action(video_state, action) :: video_state
  def append_last_action(video_state, %{last_action: last_action}) do
    IO.puts "map merge with last action"
    video_state
  end

end
