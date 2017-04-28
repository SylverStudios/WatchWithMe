# Phoenix and Webpack template

This is cool because is uses the Phoenix framework 1.3RC and Webpack.
Phoenix handles all of the the normal server stuff, but part of the build process is to trigger the webpack build.
The config for that lives in root/assets, and everything builds to /root/priv/static
And phoenix serves it's static content from there.

So new age JS and stuff, built and bundled into the static serve directory.

This is a pretty standard Elixir Phoenix App that supplies the backend for WWM.

Basics -

To start your Phoenix server:

  * Install dependencies with `mix deps.get`
  * Create and migrate your database with `mix ecto.create && mix ecto.migrate`
  * Install Node.js dependencies with `cd assets && npm install`
  * Start Phoenix endpoint with `mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

Ready to run in production? Please [check our deployment guides](http://www.phoenixframework.org/docs/deployment).

## Learn more

  * Official website: http://www.phoenixframework.org/
  * Guides: http://phoenixframework.org/docs/overview
  * Docs: https://hexdocs.pm/phoenix
  * Mailing list: http://groups.google.com/group/phoenix-talk
  * Source: https://github.com/phoenixframework/phoenix


# Setup help

http://mockra.com/2016/07/21/osx-postgres-phoenix

Install
brew install postgres
createuser -s postgres
mix ecto.setup

I think I will make more ecto tasks for this stuff, since it's annoying but there is a definitive way to solve it.



# Other stuff

## Plugs

What are plugs?
They are just http middlewares.
They modify the conn struct and return it, straight and simple.
Basically everything that happens to conn is a plug.


## Channels

This is an abstraction around message passing in general, we will use websockets I think.


## Where's the Beef?
There are basically two projects in here, but for testing sake I've built them together.

### Server

To be replaced soon as I generisize(?) everything.

The Server lives in the `lib/wwm` directory, and it's a pretty standard Phoenix app. The beef is in `/web/channels` and the tests in the same place.

Summary, we have 1 page endpoint (the index) and it only serves a test page to autoconnect to the socket and provide a basic UI.

The channels directory is the socket connection logic. Channels are an abstraction for sockets, where a channel on the backend can serve multiple "topics" and a client socket can connect to those. It is pub/sub from there and we can send messages to the topic with an "event" which is basically what type of message are you sending. Watch With me allows
 * new_msg    : {body: "the message you want to send to everyone}
 * action     : {type, video\_time, world\_time}
 * heartbeat  : {video\_time, world\_time}

The server will handle each one differently, for more specifics check out the `handle_in` functions.

Note: any message send to the server will be broadcast to the other connected sockets, but not back to the sender. The sender will only get an acknowledgement, basically a receipt.

### UI

This is very incomplete, but it will house the Chrome extension code. In addition, we will build the JS required for the locally served test page.