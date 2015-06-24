package com.sylver.watchwithme;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

/**
 * This Controller will handle websockets updates regarding Sync Rooms.
 */
@Controller
public class RoomUpdatesController {

	private final SimpMessagingTemplate messagingTemplate;

	private static final String UPDATES_CHANNEL = "/roomupdates";

	/**
	 * The {@link Autowired} annotation tells Spring's dependency injection magic to make whatever
	 * the constructor requires and pass it in.  Since {@link SimpMessagingTemplate} is a thing
	 * that Spring knows about, it can do this out of the box and we don't have to tell Spring
	 * how to instantiate the class.
	 * @param messagingTemplate A {@link SimpMessagingTemplate} that can be used to send messages
	 *                          over websockets channels.
	 */
	@Autowired
	public RoomUpdatesController(SimpMessagingTemplate messagingTemplate) {
		this.messagingTemplate = messagingTemplate;
	}

	/**
	 * The {@link SubscribeMapping} annotation designates this method to fire when a client is
	 * using STOMP messaging to subscribe to a channel.  The String parameter is the channel's name.
	 * @return A confirmation message to the client.
	 */
	@SubscribeMapping(UPDATES_CHANNEL)
	public String subscribeToRoomUpdates() {
		return "subscribed to room updates";
	}

	/**
	 * Untested, but I'm pretty sure this is how we will publish messages to subscribed clients.
	 * @param message The message to send.
	 */
	private void updateTaskMessage(String message) {
		this.messagingTemplate.convertAndSend(UPDATES_CHANNEL, message);
	}
}
