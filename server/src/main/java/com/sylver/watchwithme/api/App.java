package com.sylver.watchwithme.api;

import io.dropwizard.Application;
import io.dropwizard.assets.AssetsBundle;
import io.dropwizard.jersey.setup.JerseyEnvironment;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import io.dropwizard.websockets.WebsocketBundle;

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
    bootstrap.addBundle(new WebsocketBundle(MainWebsocketsServer.class));
  }

  @Override
  public void run(MainConfiguration configuration, Environment environment)
    throws Exception {
    final JerseyEnvironment jerseyEnvironment = environment.jersey();
    jerseyEnvironment.register(new MainResource());
    environment.getApplicationContext().setContextPath("abc");
  }
}
