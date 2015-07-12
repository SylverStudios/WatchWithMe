package com.sylver.watchwithme.model;

import java.util.OptionalDouble;
import java.util.OptionalInt;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

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
	private final OptionalDouble time;

	@JsonCreator
	public ClientEvent(
		@JsonProperty("type") final Type type,
		@JsonProperty("time") final OptionalDouble time
	) {
		this.type = type;
		this.time = time == null ? OptionalDouble.empty() : time;
	}

	public Type getType() {
		return type;
	}

	public OptionalDouble getTime() {
		return time;
	}

	public String toString() {
		return String.format(
			"%s{Type: %s, Time: %s}",
			getClass().toString(),
			type.name(),
			time
		);
	}
}
