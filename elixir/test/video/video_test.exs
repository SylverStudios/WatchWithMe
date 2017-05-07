defmodule VideoTest do
  use ExUnit.Case
  alias Wwm.Video.State
  alias Wwm.Video

  test "we can generate a default state" do
    default = %State{is_playing: false, time: 0, last_action: nil}

    expect = Video.get_default_state()

    assert default == expect
  end

  test "Play action reduces to playing state" do
    action = Video.play(100, 200, "Shamshirz")
    state = Video.get_default_state()

    result = Video.reduce(state, action)

    assert result.is_playing == true
    assert result.time == action.video_time
  end

  test "Pause action reduces to pause state" do
    action = Video.play(100, 200, "Shamshirz")
    state = Video.get_default_state()

    result = Video.reduce(state, action)

    assert result.is_playing == true
    assert result.time == action.video_time
  end

  test "Reduce can take an action with string keys" do
    action = %{"type" => "PLAY", "video_time" => 100, "world_time" => 200}
    user = "Battleduck"
    state = Video.get_default_state()

    result = Video.reduce(state, action, user)

    assert result.is_playing == true
    assert result.time == action["video_time"]
  end
end
