defmodule Wwm.Video do
  alias Wwm.Video.State
  alias Wwm.Video.Action
  require Logger

  @moduledoc """
  Set of functions for manipulating a videoState struct

  """

  @type action :: %Action{type: String.t, video_time: Number, world_time: Number, initiator: String.t}
  @type video_state :: %State{is_playing: Boolean, time: Integer, last_action: action}

# REDUCE
  @spec reduce(video_state, action) :: video_state
# Play case
  def reduce(video_state, %Action{type: "PLAY", video_time: v_time} = action) do
    video_state
    |> struct([is_playing: true, time: v_time, last_action: action])
  end

# Pause case
  def reduce(video_state, %Action{type: "PAUSE", video_time: v_time} = action) do
    video_state
    |> struct([is_playing: false, time: v_time, last_action: action])
  end

# action with string keys
  def reduce(video_state, %{"type" => type, "video_time" => v_time, "world_time" => w_time}, initiator) do
    reduce(video_state, create_action(type, v_time, w_time, initiator))
  end

# Catch all
  def reduce(video_state, action) do
    Logger.info fn ->
      "The action didn't match any of the expected cases: #{action}'"
    end
    video_state
  end

  @spec get_default_state() :: video_state
  def get_default_state() do
    %State{is_playing: false, time: 0, last_action: nil}
  end

  @spec play(number, number, String.t) :: action
  def play(v_time, w_time, initiator) do
    %Action{type: "PLAY",
      video_time: v_time,
      world_time: w_time,
      initiator: initiator}
  end

  @spec pause(number, number, String.t) :: action
  def pause(v_time, w_time, initiator) do
    %Action{type: "PAUSE",
      video_time: v_time,
      world_time: w_time,
      initiator: initiator}
  end

  def create_action(type, video_time, world_time, initiator) do
    %Action{type: type,
      video_time: video_time,
      world_time: world_time,
      initiator: initiator}
  end

end
