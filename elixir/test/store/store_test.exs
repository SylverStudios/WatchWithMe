defmodule StoreTest do
  use ExUnit.Case
  alias Wwm.VideoState
  alias Wwm.Store

  test "fetch will set default value if not found" do
    default = default_video_state();

    value_at_1 = Store.fetch(1, default)

    assert default == value_at_1
  end

  test "fetch will return value stored" do
    video_state = custom_video_state(true, 120, nil)

    Store.set(5, video_state)

    assert video_state == Store.fetch(5, default_video_state())
  end

# Private
  defp default_video_state() do
    %VideoState{is_playing: true, time: 100, last_action: nil}
  end

  defp custom_video_state(playing, time, last_action) do
    %VideoState{is_playing: playing, time: time, last_action: last_action}
  end
end
