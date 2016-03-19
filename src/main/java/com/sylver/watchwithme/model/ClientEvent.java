package com.sylver.watchwithme.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.MoreObjects;
import com.google.common.base.Objects;

import java.util.Optional;

/**
 * This class is the form all events coming from clients will take.
 */
public class ClientEvent {

  public enum Type {
    PLAY,
    PAUSE,
    BUFFERING_START,
    BUFFERING_COMPLETE,
    SEEK
  }

  private final Type type;
  private final Optional<Double> time;

  @JsonCreator
  public ClientEvent(
    @JsonProperty(value = "type", required = true) final Type type,
    @JsonProperty("time") final Double time
  ) {
    this.type = type;
    this.time = Optional.ofNullable(time);
  }

  public Type getType() {
    return type;
  }

  public Double getTime() {
    return time.isPresent() ? time.get() : null;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    ClientEvent that = (ClientEvent) o;
    return type == that.type &&
      Objects.equal(time, that.time);
  }

  @Override
  public int hashCode() {
    return Objects.hashCode(type, time);
  }

  @Override
  public String toString() {
    return MoreObjects.toStringHelper(this)
      .add("type", type)
      .add("time", time)
      .toString();
  }
}
