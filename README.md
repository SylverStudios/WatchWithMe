# **WatchWithMe**

## That Syncing Feeling!

### News

The elixir directory has the current server implementation. There is another readme in there that describes how to build and deploy it.

### Server

The new server implementation is written in Elixir! Conceptually, it's not terribly different; Receive messages and people joining the group via websockets, then broadcast the news to everyone else in the group. Structurally, the app looks pretty different because the Erlang is just way different. If you're interested then dive in, if not, just know that the chrome extension still connects via a websocket, and following a redux kind of pattern it pushes actions to the server and the server alerts subscribers to the new 'state' of their group.


### Chrome Extension

I am in the process of moving the UI into the elixir/assets directory. I'm trying to setup something similar to the Java implementation where you can do some basic testing with the server and without having to redeploy the chrome extension every time you want to test the UI.


### Upgrade

```bash
# Elixir v1.9, Erlang and OTP 22 (20-22 will work), Phoenix 1.4
brew upgrade elixir

cd fjord
mix deps.get
mix compile
mix test

```