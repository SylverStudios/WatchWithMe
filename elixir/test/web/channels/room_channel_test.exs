defmodule Wwm.Web.RoomChannelTest do
  use Wwm.Web.ChannelCase
  # alias Wwm.Web.RoomChannel
  alias Wwm.Web.UserSocket
  alias Wwm.Video

  @topic "room:lobby"
  @username "Shamshirz"

  setup do
    socket = createUserSocket(%{"username" => @username}, @topic)
    {:ok, socket: socket}
  end

  test "Event:new_msg - reply prepends message with username", %{socket: socket} do
      message = "Welcome to OASIS"
      body = createBody(socket, message)

      ref = push socket, "new_msg", %{username: socket.assigns.username, body: message}
      
      assert_broadcast "new_msg", %{body: ^body}
      assert_reply ref, :ok, %{body: ^body}
  end

  test "Event:user_joined - broadcast is send to channel" do
    message = %{username: @username, body: "#{@username} joined!"}

    assert_broadcast "user_joined", ^message
  end

  test "Event:user_joined - message is different for the joiner" do
    message = %{username: @username, body: "Welcome #{@username}"}

    assert_push "user_joined", ^message
  end

  test "Event:action - state is broadcast to everyone after an action", %{socket: socket} do
    incoming_event = new_incoming_play()

    ref = push socket, "action", incoming_event
    
    assert_broadcast "state_change", %{is_playing: true}
    assert_reply ref, :ok, %{is_playing: true}
  end

  test "Event:heartbeat - server accepts heartbeat messages", %{socket: socket} do
    heartbeat_message = new_heartbeat()

    ref = push socket, "heartbeat", heartbeat_message

    assert_reply ref, :ok
  end

# Helper fxns
  defp createBody(socket, body) do
     "[#{socket.assigns.username}] #{body}" 
  end

  defp createUserSocket(connection_params, topic) do
    {:ok, socket} = connect(UserSocket, connection_params)
    {:ok, _, socket} = subscribe_and_join(socket, topic) 
    socket
  end

  defp get_time() do
    :os.system_time(:milli_seconds)
  end

  defp video_time() do
    14
  end

  defp new_incoming_play() do
    %{"type" => "PLAY", "video_time" => video_time(), "world_time" => get_time()}
  end

  defp new_heartbeat() do
    %{"video_time" => video_time(), "world_time" => get_time()}
  end
end
