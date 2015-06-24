package com.sylver.watchwithme.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.sylver.watchwithme.model.ClientEvent;
import com.sylver.watchwithme.model.Command;

/**
 * This Controller will handle websockets updates regarding Sync Rooms.
 */
@Controller
public class RoomController {

	private static final Logger LOG = LoggerFactory.getLogger(RoomController.class);

	private final SimpMessagingTemplate messagingTemplate;

	private static final String SAMPLE_EVENT_CHANNEL = "/sampleeventchannel";
	private static final String SAMPLE_COMMAND_CHANNEL = "/samplecommandchannel";

	/**
	 * The {@link Autowired} annotation tells Spring's dependency injection magic to make whatever
	 * the constructor requires and pass it in.  Since {@link SimpMessagingTemplate} is a thing
	 * that Spring knows about, it can do this out of the box and we don't have to tell Spring
	 * how to instantiate the class.
	 * @param messagingTemplate A {@link SimpMessagingTemplate} that can be used to send messages
	 *                          over websockets channels.
	 */
	@Autowired
	public RoomController(SimpMessagingTemplate messagingTemplate) {
		this.messagingTemplate = messagingTemplate;
	}

	/**
	 * This method will be triggered whenever a websockets message comes into the channel specified
	 * in the {@link MessageMapping} annotation.
	 * @param clientEvent All messages coming from the client will be {@link ClientEvent}s.
	 */
	@MessageMapping(SAMPLE_EVENT_CHANNEL)
	public void handleClientEvent(ClientEvent clientEvent) {
		LOG.info("handleClientEvent: {}", clientEvent.toString());

		/**
		 * For now, just send the play and pause events back to clients as {@link Command}s.
		 */
		switch(clientEvent.getType()) {
			case PLAY:
				sendCommand(new Command(Command.Type.PLAY, clientEvent.getTime()));
				break;
			case PAUSE:
				sendCommand(new Command(Command.Type.PAUSE, clientEvent.getTime()));
				break;
			case BUFFERING_START:
				break;
			case BUFFERING_COMPLETE:
				break;
			case SEEK:
				break;
		}
	}

	/**
	 * Sends a {@link Command} to all clients subscribed to the default channel (will change to accept
	 * a room id and send only to that room).
	 * @param command The {@link Command} to send.
	 */
	private void sendCommand(Command command) {
		LOG.info("sendCommand: {}", command.toString());
		this.messagingTemplate.convertAndSend(UrlDesign.BROKER_PREFIX + SAMPLE_COMMAND_CHANNEL, command);
	}
}
