defmodule Fjord.Application do
  use Application
  @moduledoc """
  Fjord keeps the contexts that define your domain
  and business logic.

  Contexts are also responsible for managing your data, regardless
  if it comes from the database, an external API or others.
  """

  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  def start(_type, _args) do
    import Supervisor.Spec

    # Define workers and child supervisors to be supervised
    children = [
      # Start the endpoint when the application starts
      supervisor(FjordWeb.Endpoint, []),
      # Start your own worker by calling: Fjord.Worker.start_link(arg1, arg2, arg3)
      # worker(Fjord.Worker, [arg1, arg2, arg3]),
      supervisor(Fjord.Cache.Supervisor, []),
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Fjord.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    FjordWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end