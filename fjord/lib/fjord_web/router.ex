defmodule FjordWeb.Router do
  use FjordWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", FjordWeb do
    pipe_through :api
  end
end
