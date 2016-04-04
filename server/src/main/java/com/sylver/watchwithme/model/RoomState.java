package com.sylver.watchwithme.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.MoreObjects;
import com.google.common.base.Objects;

import java.util.List;
import java.util.Optional;

/**
 * Represents the state of a room of viewers
 */
public class RoomState {

  private final boolean isPlaying;
  private final boolean wasPlaying;
  private final double time;
  private final int partySize;
  private final String definedBy; // user name

  @JsonCreator
  public RoomState(
    @JsonProperty("isPlaying") final boolean isPlaying,
    @JsonProperty("wasPlaying") final boolean wasPlaying,
    @JsonProperty("time") final double time,
    @JsonProperty("partySize") final int partySize,
    @JsonProperty("definedBy") final String definedBy
  ) {
    this.isPlaying = isPlaying;
    this.wasPlaying = wasPlaying;
    this.time = time;
    this.partySize = partySize;
    this.definedBy = definedBy;
  }

  public boolean getIsPlaying() {
    return isPlaying;
  }

  public boolean getWasPlaying() {
    return wasPlaying;
  }

  public double getTime() {
    return time;
  }

  public int getPartySize() {
    return partySize;
  }

  public String getDefinedBy() {
    return definedBy;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    RoomState roomState = (RoomState) o;
    return isPlaying == roomState.isPlaying &&
      wasPlaying == roomState.wasPlaying &&
      Double.compare(roomState.time, time) == 0 &&
      partySize == roomState.partySize &&
      Objects.equal(definedBy, roomState.definedBy);
  }

  @Override
  public int hashCode() {
    return Objects.hashCode(isPlaying, wasPlaying, time, partySize, definedBy);
  }

  @Override
  public String toString() {
    return MoreObjects.toStringHelper(this)
      .add("isPlaying", isPlaying)
      .add("wasPlaying", wasPlaying)
      .add("time", time)
      .add("partySize", partySize)
      .add("definedBy", definedBy)
      .toString();
  }
}
