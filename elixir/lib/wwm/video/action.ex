defmodule Wwm.Video.Action do
  alias Wwm.Video.Action
  @moduledoc """
  Provides a struct describing the change in video state
  """

  @doc """
  Provides a struct describing actions taken on a video

  The `Wwm.Video.Action` struct. It stores:

    * :type - upcase string name of action
    * :video_time - the video time that the action took place, in microseconds, integer
    * :world_time - the UTC time that the action took place, in microseconds, integer
    * :username - the username of the socket that sent the action

  """

  @enforce_keys [:type, :video_time, :world_time, :initiator]
  defstruct [:type, :video_time, :world_time, :initiator]

  @type action :: %Action{}

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

  @spec join(String.t) :: action
  def join(initiator) do
    %Action{type: "JOIN",
      video_time: 0,
      world_time: :os.system_time(:milli_seconds),
      initiator: initiator}
  end

  @spec leave(String.t) :: action
  def leave(initiator) do
    %Action{type: "LEAVE",
      video_time: 0,
      world_time: :os.system_time(:milli_seconds),
      initiator: initiator}
  end

  @spec create_action(String.t, number, number, String.t) :: action
  def create_action(type, video_time, world_time, initiator) do
    %Action{type: type,
      video_time: video_time,
      world_time: world_time,
      initiator: initiator}
  end
end
