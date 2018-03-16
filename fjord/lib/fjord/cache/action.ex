defmodule Fjord.Cache.Action do
  alias Fjord.Cache.Action
  @moduledoc """
  Provides a struct describing the change in video state
  """

  @doc """
  Provides a struct describing actions taken on a video

  The `Fjord.Cache.Action` struct. It stores:

    * :type - upcase string name of action
    * :video_time - the video time that the action took place, in microseconds, integer
    * :world_time - the UTC time that the action took place, in microseconds, integer
    * :username - the username of the socket that sent the action

  """

  @enforce_keys [:type, :video_time, :world_time, :initiator]
  defstruct [:type, :video_time, :world_time, :initiator]

  @type action :: %Action{}

  @valid_types ["play", "pause", "join", "leave"]


  @doc """
  Convenience for creating actions that don't affect the video time
  """
  @spec create(atom, String.t) :: action
  def create(type, initiator) do
    create(type, 0, :os.system_time(:milli_seconds), initiator)
  end

  @doc """
  Creates an action from the passed in details

  First arg 'type' should an atom
   - [:play, :pause, :join, :leave]

  """
  @spec create(atom, number, number, String.t) :: action
  def create(type, video_time, world_time, initiator) do
    %Action{type: type,
      video_time: video_time,
      world_time: world_time,
      initiator: initiator}
  end


  @doc """
  Validation functions
    Test if the type is valid
  """
  @spec decode_type(String.t) :: {atom, atom | String.t}
  def decode_type(type) do
    downcase_type = String.downcase(type)
    if Enum.member?(@valid_types, downcase_type) do
      {:ok, String.to_atom(downcase_type)}
    else
      {:error, "Invalid action type -- #{type}"}
    end
  end

end
