package com.sylver.watchwithme.api;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Metered;
import com.codahale.metrics.annotation.Timed;
import io.dropwizard.Application;
import io.dropwizard.assets.AssetsBundle;
import io.dropwizard.jersey.setup.JerseyEnvironment;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import io.dropwizard.websockets.WebsocketBundle;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;

public class App extends Application<MainConfiguration> {

  public static void main(final String[] args) throws Exception {
    new App().run(args);
  }

  @Override
  public String getName() {
    return "watch-with-me";
  }

  @Override
  public void initialize(Bootstrap<MainConfiguration> bootstrap) {
    bootstrap.addBundle(new AssetsBundle("/assets", "/", "index.html"));
    bootstrap.addBundle(new WebsocketBundle(WebsocketsEchoServer.class));
  }

  @Override
  public void run(MainConfiguration configuration, Environment environment)
    throws Exception {
    final JerseyEnvironment jerseyEnvironment = environment.jersey();
    jerseyEnvironment.register(new MainResource());
    environment.getApplicationContext().setContextPath("abc");
  }

  @Metered
  @Timed
  @ExceptionMetered
  @ServerEndpoint("/ws")
  public static class WebsocketsEchoServer {
    @OnOpen
    public void onOpenHandler(final Session session) throws IOException {
      session.getAsyncRemote().sendText("welcome");
    }
    @OnMessage
    public void onMessageHandler(final Session session, final String message) {
      session.getAsyncRemote().sendText(message.toUpperCase());
    }
    @OnClose
    public void myOnClose(final Session session, final CloseReason cr) {
      session.getAsyncRemote()
        .sendText("closing, reason: " + cr.getReasonPhrase());
    }
  }
}
