defmodule Store do
  use Application

  def start(_type, _args) do
    Store.Supervisor.start_link
  end
end
