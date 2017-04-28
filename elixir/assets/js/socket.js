// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "assets/js/app.js".

// To use Phoenix channels, the first step is to import Socket
// and connect at the socket path in "lib/web/endpoint.ex":
import {Socket} from "phoenix"

const getRandomInt = () => { return Math.floor(Math.random() * (20000)); }

let socket = new Socket("/socket", {params: {token: window.userToken, username: getRandomInt()}})

// When you connect, you'll often need to authenticate the client.
// For example, imagine you have an authentication plug, `MyAuth`,
// which authenticates the session and assigns a `:current_user`.
// If the current user exists you can assign the user's token in
// the connection for use in the layout.
//
// In your "lib/web/router.ex":
//
//     pipeline :browser do
//       ...
//       plug MyAuth
//       plug :put_user_token
//     end
//
//     defp put_user_token(conn, _) do
//       if current_user = conn.assigns[:current_user] do
//         token = Phoenix.Token.sign(conn, "user socket", current_user.id)
//         assign(conn, :user_token, token)
//       else
//         conn
//       end
//     end
//
// Now you need to pass this token to JavaScript. You can do so
// inside a script tag in "lib/web/templates/layout/app.html.eex":
//
//     <script>window.userToken = "<%= assigns[:user_token] %>";</script>
//
// You will need to verify the user token in the "connect/2" function
// in "lib/web/channels/user_socket.ex":
//
//     def connect(%{"token" => token}, socket) do
//       # max_age: 1209600 is equivalent to two weeks in seconds
//       case Phoenix.Token.verify(socket, "user socket", token, max_age: 1209600) do
//         {:ok, user_id} ->
//           {:ok, assign(socket, :user, user_id)}
//         {:error, reason} ->
//           :error
//       end
//     end
//
// Finally, pass the token on connect as below. Or remove it
// from connect if you don't care about authentication.

socket.connect()

// Now that you are connected, you can join channels with a topic:
let channel           = socket.channel("room:lobby", {});
let chatInput         = document.querySelector("#chat-input");
let messagesContainer = document.querySelector("#messages");
let playButton        = document.querySelector("#playButton");
let hbButton          = document.querySelector("#hbButton");

const appendMessage = (text) => {
  let messageItem = document.createElement("li");
  messageItem.innerText = `${text}`
  messagesContainer.appendChild(messageItem)
};

playButton.addEventListener("click", event => {
  const now = Date.now();
  channel.push("action", {type: "PLAY", video_time: now, world_time: now});
});

// Once we add a video element, test that we can get time from it
hbButton.addEventListener("click", event => {
  const now = Date.now();
  channel.push("heartbeat", {video_time: now, world_time: now});
});

chatInput.addEventListener("keypress", event => {
  if(event.keyCode === 13){
    appendMessage(chatInput.value)
    channel.push("new_msg", {body: chatInput.value})
    chatInput.value = ""
  }
});

channel.on("new_msg", payload => {
  appendMessage(payload.body);
});

channel.on("action", payload => {
  appendMessage(`DO: ${payload.type} @ ${payload.video_time}`);
});

channel.on("user_joined", payload => {
  appendMessage(payload.body);
});

channel.join()
  .receive("ok", resp => { console.log("Connected", resp)})
  .receive("error", resp => { 
    appendMessage("Unable to join");
    console.log("failed to connect: ", resp)});

export default socket
