defmodule VideoTest do
  use ExUnit.Case
  alias Wwm.Video
  alias Wwm.Video.Action

  test "video struct has a sensible default" do
    default = %Video{is_playing: false, time: 0, group_size: 0, last_action: nil}

    expect = %Video{}

    assert default == expect
  end

  test "Play action reduces to playing state" do
    action = Action.play(100, 200, "Shamshirz")
    state = %Video{}

    result = Video.reduce(state, action)

    assert result.is_playing == true
    assert result.time == action.video_time
  end

  test "Pause action reduces to pause state" do
    action = Action.play(100, 200, "Shamshirz")
    state = %Video{}

    result = Video.reduce(state, action)

    assert result.is_playing == true
    assert result.time == action.video_time
  end

  test "Properly reduce JOIN action" do
    action = Action.create_action("JOIN", 100, 200, "Shamshirz")
    state = %Video{}

    result = Video.reduce(state, action)

    assert result.is_playing == false
    assert result.group_size == 1
  end

  test "Properly reduce LEAVE action, doesn't change video_time'" do
    action = Action.join("Shamshirz")
    second_action = Action.leave("Shamshirz")
    original_state = %Video{}

    new_state = Video.reduce(original_state, action)
    result = Video.reduce(new_state, second_action)

    assert result.is_playing == false
    assert result.time == original_state.time
    assert result.group_size == 0
  end

  test "Reduce can take an action with string keys" do
    action = %{"type" => "PLAY", "video_time" => 100, "world_time" => 200}
    user = "Battleduck"
    state = %Video{}

    result = Video.reduce(state, action, user)

    assert result.is_playing == true
    assert result.time == action["video_time"]
  end
end
