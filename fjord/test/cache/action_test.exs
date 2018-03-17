defmodule Cache.ActionTest do
  use ExUnit.Case, async: true
  alias Fjord.Cache.Action

  test "actions have default time values" do
    type = :play
    video_time = 0
    world_time = 12345
    initiator = "Shamshirz"

    result = Action.create(type, video_time, world_time, initiator)

    assert result.video_time == 0
    assert result.world_time == 12345
    assert result.type == :play
    assert result.initiator == "Shamshirz"
  end

  test "decode_type ignores case" do
    type = "play"
    type_two = "PAUSE"

    {:ok, :play} = Action.decode_type(type)
    {:ok, :pause} = Action.decode_type(type_two)
  end

  test "decode_type returns errors on types that don't exist" do
    type = "lpay"

    {:error, _} = Action.decode_type(type)
  end
end
