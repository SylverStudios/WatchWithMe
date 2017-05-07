defmodule Wwm.Video.State do
  @moduledoc """
  Provides a struct describing the video state

  Using the redux store pattern, this is the
  app state. 
  """

  @enforce_keys [:is_playing, :time]
  defstruct [:is_playing, :time, last_action: nil]
end
