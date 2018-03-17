defmodule FjordWeb.RoomChannel do
  use Phoenix.Channel
  require Logger
  alias Fjord.Cache
  alias Fjord.Cache.{Action, Video}
  @moduledoc """
  As far as I can tell, each socket that connects to this channel (room:*)
  will have a separate process waiting to call these functions.

  So when a socket sends a message to the server, the server will run a
  handle_in function appropriately, and broadcast will push to each socket,
  but you can create an interceptor to do more work before the push, such as
  something socket specific, because it will run for each socket!

  Current contracts
  Event: new_msg
    Message requires a "body" key with the message contents

  Event: action
    Message requires format
    {type, video_time, world_time}
     - type     => PLAY|PAUSE
     - *time    => millisecond timestamp

  Event: heartbeat
    Message requires format
    {video_time, world_time}
      - *time    => millisecond timestamp
  """

  intercept ["new_msg"]

  def join("room:lobby", _message, socket) do
    send(self(), :after_join)
    {:ok, socket}
  end

  def join("room:" <> _private_room_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

# Update state and broadcast it, no validate because we know it's a join
  def handle_info(:after_join, socket) do

    :join
    |> Action.create(socket.assigns.username)
    |> update_and_broadcast(socket)

    {:noreply, socket}
  end

# HANDLE IN

# handle_in take the event type, the message, and the socket
  def handle_in("new_msg", %{"body" => body}, socket) do
    message_event = %{sender: socket.assigns.username, body: "[#{socket.assigns.username}] #{body}"}
    broadcast! socket, "new_msg", message_event
    {:reply, {:ok, message_event}, socket}
  end

  def handle_in("heartbeat", %{"video_time" => v_time, "world_time" => w_time}, socket) do
    Logger.debug fn ->
      "Good to know #{socket.assigns.username}'s video is at #{v_time}, as of #{w_time}"
    end
    {:reply, :ok, socket}
  end

  def handle_in("action", %{"type" => type, "video_time" => v_time, "world_time" => w_time}, socket) do

    case Action.decode_type(type) do
      {:ok, atom_type} ->
        atom_type
        |> Action.create(v_time, w_time, socket.assigns.username)
        |> update_and_broadcast(socket)
        |> simple_reply(socket)

      {:error, message} ->
        {:reply, message, socket}
    end
  end

  @doc """
  This runs for each socket that is about to output a user_joined message
  We intercept the message then we can edit it based on the something
  specific to this socket - like welcome vs. other user joined
  """
  def handle_out("new_msg", payload, socket) do
    if socket.assigns.username === payload.sender do
      {:noreply, socket}
    else
      push socket, "new_msg", payload
      {:noreply, socket}
    end
  end

  # Private convenience methods
  defp broadcast_and_return(video_state, socket) do
    broadcast! socket, "state_change", video_state
    video_state
  end

  defp get_video_state(socket) do
    Cache.fetch(socket.topic, %Video{})
  end

  defp set_video_state(state, socket) do
    Cache.set(socket.topic, state)
  end

  defp simple_reply(result, socket) do
    {:reply, {:ok, result}, socket}
  end

  defp update_and_broadcast(action, socket) do
    socket
    |> get_video_state
    |> Video.reduce(action)
    |> broadcast_and_return(socket)
    |> set_video_state(socket)
  end
end
