# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# General application configuration
config :wwm,
  ecto_repos: [Wwm.Repo]

# Configures the endpoint
config :wwm, Wwm.Web.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "LgODNdDuZZZgW+3oZjeVAjoEX0MMVlk7sebsKGKQBoOi7WVqZpjkMr+N3BhXYJCb",
  render_errors: [view: Wwm.Web.ErrorView, accepts: ~w(html json)],
  pubsub: [name: Wwm.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"
