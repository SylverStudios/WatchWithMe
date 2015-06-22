window.onload = function() {

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
	var stomp = Stomp.over(new SockJS('/messaging'));

	/**
	 * We must have a callback function for when a message comes over a subscribed channel.
	 * For now, this will get called once because a message is automatically sent back upon
	 * channel subscription.
	 */
	function callback(stompMessageObject) {
		console.log("within callback, message is: " + stompMessageObject.body);
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
	stomp.connect({}, function () {
		stomp.subscribe('/roomupdates', callback);
	});

};
