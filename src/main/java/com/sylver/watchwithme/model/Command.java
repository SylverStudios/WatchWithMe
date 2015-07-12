package com.sylver.watchwithme.model;

import java.util.OptionalDouble;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.sylver.watchwithme.jackson.OptionalDoubleSerializer;

/**
 * This class is the form all commands from the server to the client will take.
 */
public class Command {

	public enum Type {
		PLAY,
		PAUSE,
		PAUSE_REQUEST
	}

	private final Type type;
	private final OptionalDouble time;

	public Command(
		final Type type,
		final OptionalDouble time
	) {
		this.type = type;
		this.time = time == null ? OptionalDouble.empty() : time;
	}

	public Type getType() {
		return type;
	}

	@JsonSerialize(using=OptionalDoubleSerializer.class)
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
