window.onload = function() {

	var urls = {
		stompEndpoint: '/messaging',
		commandChannelPrefix: '/commandchannels',
		eventChannelPrefix: '/eventchannels',
		sampleEventChannel: '/sampleeventchannel',
		sampleCommandChannel: '/samplecommandchannel'
	};

	/**
	 * Sets up a SockJS websockets object using the STOMP messaging protocol (to play nicely with
	 * Spring's Spring Messaging stuff).  Doesn't make a websockets connection or subscribe to a
	 * channel, just sets the object up.
	 *
	 * The STOMP protocol is just that, a protocol of types of requests / responses (eg CONNECT,
	 * CONNECTED, SUBSCRIBED, MESSAGE) and things to be included in them (eg url destinations, messages).
	 *
	 * When "http" or "https" is not the first thing in the argument string, it assumes the current
	 * domain and resolves it to, for the localhost domain, "ws://localhost:8080/messaging" and then
	 * appends more unreadable crap to the end of that.  The point is we can hit a static server
	 * we've set up if we want.
 	 */
	var stomp = Stomp.over(new SockJS(urls.stompEndpoint));

	/**
	 * We must have a callback function for when a message comes over a subscribed channel.
	 * For now, this will get called once because a message is automatically sent back upon
	 * channel subscription.
	 */
	function handleCommand(stompMessageObject) {
		var command = JSON.parse(stompMessageObject.body);

		switch(command.type) {
			case CommandType.PLAY:
				console.log("Play command received.");
				break;
			case CommandType.PAUSE:
				console.log("Pause command received, time is " + command.time);
				break;
			case CommandType.PAUSE_REQUEST:
				break;
			default:
				throw "Unknown command type received, command type was " + command.type;
		}
	}

	/**
	 * stomp.connect() connects to the STOMP messaging service set up above.  The second argument is
	 * a callback on successful connection in which we immediately subscribe to the channel
	 * "/roomupdates".
	 *
	 * When stomp.connect() fires, in the console you'll see
	 *     >>> CONNECT
	 * The >>> is for outgoing request, CONNECT is the STOMP type of request.  The stuff under it,
	 * as with the other ">>>"-style console messages, are the arguments the each request / response
	 * is required to provide according to the STOMP protocol.
	 * Afterward you'll see
	 *     <<< CONNECTED
	 * The <<< is for an incoming response, CONNECTED means it was successful.
	 *
	 * When stomp.subscribe fires, in the console you'll see
	 *     >>> SUBSCRIBE
	 * And later you'll see
	 *     <<< MESSAGE
	 * Because a message is automatically sent back on successful channel subscription.  That message
	 * is automatically printed to the console, and sent along to the specified callback.
	 */
	var roomSubscription;
	stomp.connect({}, function () {
		roomSubscription = stomp.subscribe(urls.commandChannelPrefix + urls.sampleCommandChannel, handleCommand);
	});

	/**
	 * Object.freeze() basically creates an immutable object.  It acts kinda like an enum.
	 * Both CommandType and EventType need to be kept in sync with the corresponding enums
	 * on the java side (including the order).
	 */
	var CommandType = Object.freeze({
		PLAY: "PLAY",
		PAUSE: "PAUSE",
		PAUSE_REQUEST: "PAUSE_REQUEST"
	});
	var EventType = Object.freeze({
		PLAY: 0,
		PAUSE: 1,
		BUFFERING_START: 2,
		BUFFERING_COMPLETE: 3,
		SEEK: 4
	});

	/**
	 *
	 * @param type
	 * @param time
	 */
	function sendEvent(type, time) {
		var event = {};
		event.type = type;
		if (time) {
			event.time = time;
		}
		stomp.send(urls.eventChannelPrefix + urls.sampleEventChannel, {}, JSON.stringify(event));
	}

	document.getElementById('sendPlayEvent').onclick = function() {
		sendEvent(EventType.PLAY);
	};
	document.getElementById('sendPauseEvent').onclick = function() {
		sendEvent(EventType.PAUSE, 1337);
	};

};
