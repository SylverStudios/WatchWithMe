package com.sylver.watchwithme.api;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Metered;
import com.codahale.metrics.annotation.Timed;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sylver.watchwithme.model.WwmEvent;
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
import java.util.HashSet;
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

      WwmEvent joinEvent = new WwmEvent(WwmEvent.Type.USER_JOIN, null, null, sessions.size());
      sendEventToOthers(session, joinEvent);
      LOGGER.info("[onOpen] Added to sessions set, new size: {}", sessions.size());
    }
  }

  // We can expect these to only be PLAY and PAUSE, so we will just pass it on.
  @OnMessage
  public void onMessageHandler(final Session mySession, final String message) {
    LOGGER.info("[onMessage] Handling session with id: {}", mySession.getId());
    LOGGER.info("[onMessage] Message is: {}", message);
    try {
      WwmEvent event = MAPPER.readValue(message, WwmEvent.class);
      event.setPartySize(sessions.size());
      LOGGER.info("[onMessage] Incoming WwmEvent read as: {}", event);

      sendEventToOthers(mySession, event);

    } catch (IOException e) {
      LOGGER.info("[onMessage] Exception while trying to map message to WwmEvent\n{}", e);
    }
  }


  @OnClose
  public void onCloseHandler(final Session session, final CloseReason cr) {
    LOGGER.info("[onClose] Handling session with id: {}", session.getId());
    LOGGER.info("[onClose] Close reason: {}", cr.getReasonPhrase());
    if (sessions.contains(session)) {
      sessions.remove(session);

      WwmEvent exitEvent = new WwmEvent(WwmEvent.Type.USER_EXIT, null, null, sessions.size());
      sendEventToOthers(session, exitEvent);
      LOGGER.info("[onClose] Removing from sessions set, new size: {}", sessions.size());
    }
  }

  private void sendEventToOthers(Session mySession, WwmEvent event) {
    LOGGER.info("[sendEventToOthers] Outgoing WwmEvent looks like: {}", event);

    try {
      if (null != event.getType()) {
        LOGGER.info("[sendEventToOthers] MySession is: ", mySession.getId());

        for (Object userSession : sessions) {
          if (userSession != mySession) {
            LOGGER.info("[sendEventToOthers] Sending to session: ", userSession);
            ((Session)userSession).getAsyncRemote().sendText(MAPPER.writeValueAsString(event));
          }
        }
      }

    } catch (IOException e) {
      LOGGER.info("[onMessage] Exception while trying to map message to WwmEvent\n{}", e);
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
