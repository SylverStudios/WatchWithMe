defmodule Wwm.Web.UserSocketTest do
  use Wwm.Web.ChannelCase
  alias Wwm.Web.UserSocket

  @lobby "room:lobby"

  test "new socket connections without a username default to anonymous" do
      params = %{}

      socket = createUserSocket(params, @lobby)

      assert socket.assigns.username == "anonymous"
  end

  test "new socket connections can send a username param and it's mapped to assigns" do
      params = %{"username" => "shamshirz"}
      
      socket = createUserSocket(params, @lobby)

      assert socket.assigns.username == "shamshirz"
  end

# Helper fxns
  defp createUserSocket(connection_params, topic) do
    {:ok, socket} = connect(UserSocket, connection_params)
    {:ok, _, socket} = subscribe_and_join(socket, topic) 
    socket
  end
end