defmodule Wwm.Events.VideoEvent do
  @moduledoc """
  Provides a struct describing the change in video state
  """

  @enforce_keys [:type, :video_time, :world_time, :initiator]
  defstruct [:type, :video_time, :world_time, :initiator]
end
