defmodule Fjord.Cache.Video do
  alias Fjord.Cache.Action
  alias Fjord.Cache.Video
  require Logger


  @moduledoc """
  Set of functions for manipulating a videoState struct

  """

  @doc """
  Provides a struct describing the video state

  Using the redux store pattern, this is the
  app state.

  The `Wwm.Video` struct. It stores:

    * :is_playing - boolean
    * :time - time of the video itself in microseconds, integer
    * :group_size - number of people in the room, integer
    * :last_action - struct with last action used to change the state

  """

  defstruct [is_playing: false, time: 0, group_size: 0, last_action: nil]

  @type video :: %Video{}
  @type action :: %Action{}
  @type inbound_action :: %Action{type: atom, video_time: number,
                                  world_time: number, initiator: String.t}


# Proper reducers using action structs reduce/2
  @spec reduce(video, inbound_action) :: video
  # Play case
  def reduce(video, %Action{type: :play, video_time: v_time} = action) do
    struct(video, [is_playing: true, time: v_time, last_action: action])
  end

  # Pause case
  def reduce(video, %Action{type: :pause, video_time: v_time} = action) do
    struct(video, [is_playing: false, time: v_time, last_action: action])
  end

  # Join
  def reduce(video, %Action{type: :join} = action) do
    struct(video, [group_size: video.group_size + 1, last_action: action])
  end

  # Leave - still don't know how to monitor this one
  def reduce(video, %Action{type: :leave} = action) do
    struct(video, [group_size: video.group_size - 1, last_action: action])
  end

# Catch all
  def reduce(video, action) do
    Logger.info fn ->
      "The action didn't match any of the expected cases: #{action}'"
    end
    video
  end
end
