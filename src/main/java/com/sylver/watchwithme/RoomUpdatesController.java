package com.sylver.watchwithme;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

/**
 * This Controller will handle websockets updates regarding Sync Rooms.
 */
@Controller
public class RoomUpdatesController {

	private final SimpMessagingTemplate messagingTemplate;

	private static final String SAMPLE_CHANNEL_INBOUND = "/samplechannelinbound";
	private static final String SAMPLE_CHANNEL_OUTBOUND = "/samplechanneloutbound";

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
	@SubscribeMapping(UrlDesign.BROKER_PREFIX + SAMPLE_CHANNEL_OUTBOUND)
	public RoomUpdate subscribeToRoomUpdates() {
		System.out.println("here");
		return new RoomUpdate(RoomUpdate.Type.SUBSCRIBE, "Successfully subscribed.");
	}
	@SubscribeMapping(UrlDesign.INBOUND_MESSAGE_HANDLING_PREFIX + SAMPLE_CHANNEL_OUTBOUND)
	public RoomUpdate subscribeToRoomUpdates2() {
		System.out.println("here2");
		return new RoomUpdate(RoomUpdate.Type.SUBSCRIBE, "Successfully subscribed2.");
	}
	@SubscribeMapping(SAMPLE_CHANNEL_OUTBOUND)
	public RoomUpdate subscribeToRoomUpdates3() {
		System.out.println("here3");
		return new RoomUpdate(RoomUpdate.Type.SUBSCRIBE, "Successfully subscribed3.");
	}
	@SubscribeMapping(SAMPLE_CHANNEL_INBOUND)
	public RoomUpdate subscribeToRoomUpdates4() {
		System.out.println("here4");
		return new RoomUpdate(RoomUpdate.Type.SUBSCRIBE, "Successfully subscribed4.");
	}
	@SubscribeMapping(UrlDesign.BROKER_PREFIX + SAMPLE_CHANNEL_INBOUND)
	public RoomUpdate subscribeToRoomUpdates5() {
		System.out.println("here5");
		return new RoomUpdate(RoomUpdate.Type.SUBSCRIBE, "Successfully subscribed5.");
	}
	@SubscribeMapping(UrlDesign.INBOUND_MESSAGE_HANDLING_PREFIX + SAMPLE_CHANNEL_INBOUND)
	public RoomUpdate subscribeToRoomUpdates6() {
		System.out.println("here6");
		return new RoomUpdate(RoomUpdate.Type.SUBSCRIBE, "Successfully subscribed6.");
	}
	@SubscribeMapping("/messaging" + SAMPLE_CHANNEL_INBOUND)
	public RoomUpdate subscribeToRoomUpdates7() {
		System.out.println("here7");
		return new RoomUpdate(RoomUpdate.Type.SUBSCRIBE, "Successfully subscribed7.");
	}
	@SubscribeMapping("/messaging" + UrlDesign.INBOUND_MESSAGE_HANDLING_PREFIX + SAMPLE_CHANNEL_INBOUND)
	public RoomUpdate subscribeToRoomUpdates8() {
		System.out.println("here8");
		return new RoomUpdate(RoomUpdate.Type.SUBSCRIBE, "Successfully subscribed8.");
	}
	@SubscribeMapping("/messaging")
	public RoomUpdate subscribeToRoomUpdates9() {
		System.out.println("here9");
		return new RoomUpdate(RoomUpdate.Type.SUBSCRIBE, "Successfully subscribed9.");
	}
	@SubscribeMapping(UrlDesign.BROKER_PREFIX)
	public RoomUpdate subscribeToRoomUpdates10() {
		System.out.println("here10");
		return new RoomUpdate(RoomUpdate.Type.SUBSCRIBE, "Successfully subscribed10.");
	}
	@SubscribeMapping(UrlDesign.INBOUND_MESSAGE_HANDLING_PREFIX)
	public RoomUpdate subscribeToRoomUpdates11() {
		System.out.println("here11");
		return new RoomUpdate(RoomUpdate.Type.SUBSCRIBE, "Successfully subscribed11.");
	}



	@MessageMapping(SAMPLE_CHANNEL_INBOUND)
	public void handleMessage(String message) {
		this.messagingTemplate.convertAndSend(UrlDesign.BROKER_PREFIX + SAMPLE_CHANNEL_OUTBOUND, "from server: " + message);
	}

	/**
	 * Untested, but I'm pretty sure this is how we will publish messages to subscribed clients.
	 * @param message The message to send.
	 */
//	private void updateTaskMessage(String message) {
//		this.messagingTemplate.convertAndSend(UPDATES_CHANNEL, message);
//	}
}
