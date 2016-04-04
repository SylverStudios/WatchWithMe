package com.sylver.watchwithme.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.MoreObjects;
import com.google.common.base.Objects;

public class ClientMessage {

  private final boolean isPlaying;
  private final double time;
  private final String username;

  @JsonCreator
  public ClientMessage(
    @JsonProperty("isPlaying") final boolean isPlaying,
    @JsonProperty("time") final double time,
    @JsonProperty("username") final String username
  ) {
    this.isPlaying = isPlaying;
    this.time = time;
    this.username = username;
  }

  public boolean isPlaying() {
    return isPlaying;
  }

  public double getTime() {
    return time;
  }

  public String getUsername() {
    return username;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    ClientMessage that = (ClientMessage) o;
    return isPlaying == that.isPlaying &&
      Double.compare(that.time, time) == 0 &&
      Objects.equal(username, that.username);
  }

  @Override
  public int hashCode() {
    return Objects.hashCode(isPlaying, time, username);
  }

  @Override
  public String toString() {
    return MoreObjects.toStringHelper(this)
      .add("isPlaying", isPlaying)
      .add("time", time)
      .add("username", username)
      .toString();
  }
}
