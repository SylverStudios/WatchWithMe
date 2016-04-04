package com.sylver.watchwithme.api;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Metered;
import com.codahale.metrics.annotation.Timed;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sylver.watchwithme.model.ClientMessage;
import com.sylver.watchwithme.model.RoomState;
import io.dropwizard.jackson.Jackson;
import org.eclipse.jetty.util.ConcurrentHashSet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.CloseReason;
import javax.websocket.EndpointConfig;
import javax.websocket.HandshakeResponse;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.HandshakeRequest;
import javax.websocket.server.ServerEndpoint;
import javax.websocket.server.ServerEndpointConfig;
import java.io.IOException;
import java.util.Set;

@Metered
@Timed
@ExceptionMetered
@ServerEndpoint(value="/ws", configurator=MainWebsocketsServer.SessionsAwareConfig.class)
public class MainWebsocketsServer {
  private static final Logger LOGGER = LoggerFactory.getLogger(MainWebsocketsServer.class);
  private static final ObjectMapper MAPPER = Jackson.newObjectMapper();

  private static final String STATE_REQUEST_MESSAGE = "Request for video state.";

  private Set<Session> sessions;
  private RoomState lastState = new RoomState(false, false, 0, 0, null);

  @OnOpen
  public void onOpenHandler(final Session session, EndpointConfig config) throws IOException {
    LOGGER.info("[onOpen] Session id: {}", session.getId());
    this.sessions = (Set)config.getUserProperties().get("sessions");
    if (!sessions.contains(session)) {
      sessions.add(session);
      // request state from someone in the room
      sendRequestForState(session);
      LOGGER.info("[onOpen] Added to sessions set, new size: {}", sessions.size());
    }
  }

  @OnMessage
  public void onMessageHandler(final Session mySession, final String message) {
    LOGGER.info("[onMessage] Session id: {}, message: {}", mySession.getId(), message);
    try {
      ClientMessage clientMessage = MAPPER.readValue(message, ClientMessage.class);
      RoomState newState = new RoomState(
        clientMessage.isPlaying(),
        lastState.getIsPlaying(),
        clientMessage.getTime(),
        sessions.size(),
        clientMessage.getUsername()
      );
      sendStateToOthers(mySession, newState);
      lastState = newState;
    } catch (IOException e) {
      LOGGER.info("[onMessage] Exception while trying to map message to ClientMessage, exception: {}", e);
    }
  }


  @OnClose
  public void onCloseHandler(final Session session, final CloseReason cr) {
    LOGGER.info("[onClose] Session id: {}, close reason: {}", session.getId(), cr.getReasonPhrase());
    if (sessions.contains(session)) {
      sessions.remove(session);
      sendRequestForState(session); // FIXME unnecessary to send session since it's already gone
      LOGGER.info("[onClose] Removed from sessions set, new size: {}", sessions.size());
    }
  }

  private void sendRequestForState(Session mySession) {
    Session randomOther = null;
    for (Object someSession : this.sessions) {
      if (!someSession.equals(mySession)) {
        randomOther = (Session)someSession;
        break;
      }
    }
    if (null == randomOther) {
      LOGGER.info("[sendRequestForState] Could not find another session");
    } else {
      LOGGER.info("[sendRequestForState] Sending request to session: {}", randomOther.getId());
      randomOther.getAsyncRemote().sendText(STATE_REQUEST_MESSAGE);
    }
  }

  private void sendStateToOthers(Session mySession, RoomState state) {
    LOGGER.info("[sendStateToOthers] State is: {}", state);
    try {
      for (Session userSession : sessions) {
        if (userSession != mySession) {
          userSession.getAsyncRemote().sendText(MAPPER.writeValueAsString(state));
        }
      }
    } catch (IOException e) {
      LOGGER.info("[sendStateToOthers] Exception while trying to send state, exception: {}", e);
    }
  }

  public static class SessionsAwareConfig extends ServerEndpointConfig.Configurator {
    private static final Logger LOGGER = LoggerFactory.getLogger(SessionsAwareConfig.class);

    private Set<Session> sessions;

    public SessionsAwareConfig() {}

    @Override
    public void modifyHandshake(ServerEndpointConfig config, HandshakeRequest request, HandshakeResponse response) {
      LOGGER.info("[modifyHandshake] Making handshake.");
      if (sessions == null) {
        sessions = new ConcurrentHashSet<Session>();
      }
      config.getUserProperties().put("sessions", sessions);
    }
  }
}
