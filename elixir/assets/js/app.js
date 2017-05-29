import "phoenix_html"

// import socket from "./socket"
import channel from '../src/wrappers/channelConnect';
import Video from '../src/wrappers/Video';
import actions from '../src/models/actions';
import VideoHistory from '../src/models/VideoHistory';

let video = new Video();
const videoHistory = new VideoHistory();


// Thought
// On a video event, we just get the state and pass it.
// Difference being, on an event we just send
// { playing: boolean, time: time }
// instead of sending the eventype {type: PLAY }



let chatInput         = document.querySelector("#chat-input");
let messagesContainer = document.querySelector("#messages");

const appendMessage = (text) => {
  let messageItem = document.createElement("li");
  messageItem.innerText = `${text}`
  messagesContainer.appendChild(messageItem)
};

chatInput.addEventListener("keypress", event => {
  if(event.keyCode === 13){
    appendMessage(chatInput.value)
    channel.push("new_msg", {body: chatInput.value})
    chatInput.value = ""
  }
});

/**
 * Annoyingly unbind the listener
 * change the video state
 * then rebind the listener
 * 
 * For local stuff, don't send the time.
 * If you send time and it's a local video it just goes to 0 because
 * the server can't handle requests with partial headers
 */
const updateVideoState = (state) => {
  if (state.is_playing) {
    video.play();
  } else {
    video.pause();
    return
  }
}

const updateVideoHistory = (state) => {
  videoHistory.add(state);

  // Remove old content
  const myNode = document.getElementById("history-list");
  while (myNode.firstChild) {
      myNode.removeChild(myNode.firstChild);
  }

  // Add new content
  videoHistory.queue.forEach((historyEntry) => {
    let li = document.createElement("li");
    li.appendChild(document.createTextNode(historyEntry));
    myNode.appendChild(li);
  });
}
/**
 * State looks like this
 * { is_playing: boolean,
 *   time: time,
 *   last_action: action
 * }
 */
const handleStateChange = (state) => {
  updateVideoHistory(state);

  console.log("recieved a state change from ", state.last_action.initiator);
  console.log(`I am user: ${channel.username}`);
  if (state.last_action.initiator == channel.username) {
    console.log("Looks like I made the last action, don't effect video");
    return
  } else {
    console.log("here is the state_change payload");
    console.log(state);
    updateVideoState(state);
  }
}

// Listen to video events
const handlePlay = (event) => {
  console.log("Play-", event);
  channel.push("action", actions.play(video.time, channel.username));
}

const handlePause = (event) => {
  console.log("Pause-", event);
  channel.push("action", actions.pause(video.time, channel.username));
}


video.on("play", handlePlay);
video.on("pause", handlePause);



// Listen to channel events
channel.on("new_msg", payload => {
  appendMessage(payload.body);
});

channel.on("action", payload => {
  console.log("received an action, probably shouldn't have");
});

channel.on("user_joined", payload => {
  appendMessage(payload.body);
});

channel.on("state_change", payload => {
  handleStateChange(payload);
});


// channel.on("EVENT_TYPE", {} => { });
// channel.push("EVENT_TYPE", {})


// What I need to do
// 1. Find the video element
// 2. Send commands to the video
// 3. Listen to video state change
// 4. 



// Video Wrapper
//  - Listen to events
//  - Send commands

// Socket Wrapper
//  - Send actions out
//  - Listen for messages in
//    - determine whether state change is necessary
//    - do something about it.


// Socket wrapper
// - handle connecting to channel, expose channel


// Find and connect to both the socket and the Video
// Listen to events on both and transmit them to the other
// Do some logic between