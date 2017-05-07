"use strict"

import { Socket } from "phoenix";
const getRandomInt = () => { return Math.floor(Math.random() * (20000)); }

/**
 * Simply connects with these defaults
 * URL = /socket
 * Username = randomInt()
 * Room = room:lobby
 * 
 * Returns the function to connect this socket to the server
 * The function returns a channel object that will receive messages
 * and can push messages.
 * 
 * import connect from 'socketConnect';
 * const channel = connect();
 * 
 * channel.on("EVENT_TYPE", {} => { });
 * 
 * channel.push("EVENT_TYPE", {})
 * 
 */

const connect = function() {
  const username = getRandomInt();
  const socket = new Socket("/socket", {params: { username: username } });
  socket.connect();

  const channel = socket.channel("room:lobby", {});
  channel.username = username;

  channel.join()
    .receive("ok", resp => { console.log("Connected", resp)})
    .receive("error", resp => { 
      appendMessage("Unable to join");
      console.log("failed to connect: ", resp)});
  
  return channel;
}

export default connect();
