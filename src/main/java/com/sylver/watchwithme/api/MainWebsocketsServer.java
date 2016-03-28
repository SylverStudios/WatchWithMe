package com.sylver.watchwithme.api;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Metered;
import com.codahale.metrics.annotation.Timed;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sylver.watchwithme.model.ClientEvent;
import com.sylver.watchwithme.model.Command;
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

  private Set sessions;

  @OnOpen
  public void onOpenHandler(final Session session, EndpointConfig config) throws IOException {
    LOGGER.info("[onOpen] Handling session with id: {}", session.getId());
    this.sessions = (Set)config.getUserProperties().get("sessions");
    if (!sessions.contains(session)) {
      sessions.add(session);
      LOGGER.info("[onOpen] Added to sessions set, new size: {}", sessions.size());
    }
  }
  @OnMessage
  public void onMessageHandler(final Session session, final String message) {
    LOGGER.info("[onMessage] Handling session with id: {}", session.getId());
    LOGGER.info("[onMessage] Message is: {}", message);
    try {
      ClientEvent clientEvent = MAPPER.readValue(message, ClientEvent.class);
      LOGGER.info("[onMessage] ClientEvent read as: {}", clientEvent);
      Command.Type commandType = null;
      switch(clientEvent.getType()) {
        case PLAY:
          commandType = Command.Type.PLAY;
          break;
        case PAUSE:
          commandType = Command.Type.PAUSE;
          break;
        case BUFFERING_START:
          break;
        case BUFFERING_COMPLETE:
          break;
        case SEEK:
          break;
      }
      if (null != commandType) {
        Command command = new Command(commandType, clientEvent.getTime());
        for (Object someSession : sessions) {
          ((Session)someSession).getAsyncRemote().sendText(MAPPER.writeValueAsString(command));
        }
      }
    } catch (IOException e) {
      LOGGER.info("[onMessage] Exception while trying to map message to ClientEvent\n{}", e);
    }
  }
  @OnClose
  public void myOnClose(final Session session, final CloseReason cr) {
    LOGGER.info("[onClose] Handling session with id: {}", session.getId());
    LOGGER.info("[onClose] Close reason: {}", cr.getReasonPhrase());
    if (sessions.contains(session)) {
      sessions.remove(session);
      LOGGER.info("[onClose] Removing from sessions set, new size: {}", sessions.size());
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
