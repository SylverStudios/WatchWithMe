package com.sylver.watchwithme.api;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Metered;
import com.codahale.metrics.annotation.Timed;
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
  final static Logger LOGGER = LoggerFactory.getLogger(MainWebsocketsServer.class);

  private Set sessions;

  @OnOpen
  public void onOpenHandler(final Session session, EndpointConfig config) throws IOException {
    LOGGER.info("[onOpen] Handling session with id: {}", session.getId());
    this.sessions = (Set)config.getUserProperties().get("sessions");
    if (!sessions.contains(session)) {
      sessions.add(session);
      LOGGER.info("Added to sessions set, new size: {}", sessions.size());
    }
    session.getAsyncRemote().sendText("welcome");
  }
  @OnMessage
  public void onMessageHandler(final Session session, final String message) {
    LOGGER.info("[onMessage] Handling session with id: {}", session.getId());
    LOGGER.info("Sending message to all sessions: {}", message);
    for (Object someSession : sessions) {
      ((Session)someSession).getAsyncRemote().sendText(message);
    }
  }
  @OnClose
  public void myOnClose(final Session session, final CloseReason cr) {
    LOGGER.info("[onClose] Handling session with id: {}", session.getId());
    if (sessions.contains(session)) {
      sessions.remove(session);
      LOGGER.info("Removing from sessions set, new size: {}", sessions.size());
    }
  }

  public static class SessionsAwareConfig extends ServerEndpointConfig.Configurator {
    private Set<Session> sessions;

    public SessionsAwareConfig() {}

    @Override
    public void modifyHandshake(ServerEndpointConfig config, HandshakeRequest request, HandshakeResponse response) {
      if (sessions == null) {
        sessions = new ConcurrentHashSet<Session>();
      }
      config.getUserProperties().put("sessions", sessions);
    }
  }
}
