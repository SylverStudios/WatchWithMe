# **WatchWithMe**

## That Syncing Feeling!

### News

The elixir directory has the current server implementation. There is another readme in there that describes how to build and deploy it.

### Server

The new server implementation is written in Elixir! Conceptually, it's not terribly different; Receive messages and people joining the group via websockets, then broadcast the news to everyone else in the group. Structurally, the app looks pretty different because the Erlang is just way different. If you're interested then dive in, if not, just know that the chrome extension still connects via a websocket, and following a redux kind of pattern it pushes actions to the server and the server alerts subscribers to the new 'state' of their group.


### Chrome Extension

I am in the process of moving the UI into the elixir/assets directory. I'm trying to setup something similar to the Java implementation where you can do some basic testing with the server and without having to redeploy the chrome extension every time you want to test the UI.


### Try it out

```bash
# Run the server
cd fjord
mix phx.server

# Build the chrome extension
cd client/chrome-extention
npm run build

# Add extension to chrome
# Open Chrome
# Settings -> More Tools -> Extensions
# Load Unpacked (Top Left) -> Select the `dist` folder
# Should see icon added to chrome top right
# Open a youtube page and click the extension, then click `connect`

# Repeat with a Chrome signed in as another user
# I did some crazy arcane thing to have 2 versions of chrome on my compy, not sure how to repeat.

```
