package com.sylver.watchwithme.api;

import com.codahale.metrics.annotation.Timed;

import javax.ws.rs.GET;
import javax.ws.rs.Path;

@Path("asdf")
public class MainResource {
  @Timed
  @GET
  public String getSomething() {
    return "you've got something";
  }
}
