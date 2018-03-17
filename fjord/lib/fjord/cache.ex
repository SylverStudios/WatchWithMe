defmodule Fjord.Cache do
  use GenServer

  @moduledoc """
  Standard ETS table supervised genserver for
  storing Key:Value pairs

  Exposes a fetch(key, default_value)
  and set(key, value)
  """

# Create an ETS table named :cache_table with 1000 entries max
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, [
      {:ets_table_name, :cache_table},
      {:log_limit, 1_000}
    ], opts)
  end

# public method -> get value or set default by room_id
  def fetch(room_id, default_value) do
    case get(room_id) do
      {:not_found} -> set(room_id, default_value)
      {:found, result} -> result
    end
  end

  def set(room_id, value) do
    GenServer.call(__MODULE__, {:set, room_id, value})
  end

# Private get
  defp get(room_id) do
    case GenServer.call(__MODULE__, {:get, room_id}) do
      []                    -> {:not_found}
      [{_room_id, result}]  -> {:found, result}
    end
  end

  # GenServer callbacks
  # Calls are synchronous
  # Casts are async

# Get table name from state, lookup by room_id and reply
  def handle_call({:get, room_id}, _from, state) do
    %{ets_table_name: ets_table_name} = state
    result = :ets.lookup(ets_table_name, room_id)
    {:reply, result, state}
  end

# Get table name from state, insert into table by room_id and reply
  def handle_call({:set, room_id, value}, _from, state) do
    %{ets_table_name: ets_table_name} = state
    true = :ets.insert(ets_table_name, {room_id, value})
    {:reply, value, state}
  end

#
  def init(args) do
    [{:ets_table_name, ets_table_name}, {:log_limit, log_limit}] = args

    :ets.new(ets_table_name, [:named_table, :set, :private])

    {:ok, %{log_limit: log_limit, ets_table_name: ets_table_name}}
  end
end
