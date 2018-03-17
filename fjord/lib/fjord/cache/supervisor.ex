defmodule Fjord.Cache.Supervisor do
  use Supervisor

  @moduledoc """
  Standard supervisor for the KV genserver
  """

  def start_link do
    Supervisor.start_link(__MODULE__, :ok, name: __MODULE__)
  end

  def init(:ok) do
    children = [
      worker(Fjord.Cache, [[name: Fjord.Cache]])
    ]

    supervise(children, strategy: :one_for_one)
  end
end
