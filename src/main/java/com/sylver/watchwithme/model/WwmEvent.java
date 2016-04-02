package com.sylver.watchwithme.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.MoreObjects;

import java.util.Optional;

/**
 * This class is the form all commands from the server to the client will take.
 */
public class WwmEvent {

  public enum Type {
    PLAY,
    PAUSE,
    USER_JOIN,
    USER_EXIT
  }

  private final Type type;
  private final Optional<Double> time;
  private final Optional<String> username;
  private Optional<Integer> partySize;

  @JsonCreator
  public WwmEvent(
          @JsonProperty(value = "type", required = true) final Type type,
          @JsonProperty("time") final Double time,
          @JsonProperty("username") final String username,
          @JsonProperty("partySize") final Integer partySize
  ) {
    this.type = type;
    this.time = Optional.ofNullable(time);
    this.username = Optional.ofNullable(username);
    this.partySize = Optional.ofNullable(partySize);
  }

  public Type getType() {
    return type;
  }

  public Double getTime() {
    return time.isPresent() ? time.get() : null;
  }

  public String getUsername() { return username.isPresent() ? username.get() : null; }

  public Integer getPartySize() { return partySize.isPresent() ? partySize.get() : null; }

  public void setPartySize(Integer partySize) {
    this.partySize = Optional.ofNullable(partySize);
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;

    WwmEvent wwmEvent = (WwmEvent) o;

    if (type != wwmEvent.type) return false;
    if (time != null ? !time.equals(wwmEvent.time) : wwmEvent.time != null) return false;
    if (username != null ? !username.equals(wwmEvent.username) : wwmEvent.username != null) return false;
    return partySize != null ? partySize.equals(wwmEvent.partySize) : wwmEvent.partySize == null;

  }

  @Override
  public int hashCode() {
    int result = type != null ? type.hashCode() : 0;
    result = 31 * result + (time != null ? time.hashCode() : 0);
    result = 31 * result + (username != null ? username.hashCode() : 0);
    result = 31 * result + (partySize != null ? partySize.hashCode() : 0);
    return result;
  }

  @Override
  public String toString() {
    return MoreObjects.toStringHelper(this)
            .add("type", type)
            .add("time", time)
            .add("username", username)
            .add("partySize", partySize)
            .toString();
  }
}
