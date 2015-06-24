package com.sylver.watchwithme.model;

import java.util.OptionalInt;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.sylver.watchwithme.jackson.OptionalIntSerializer;

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
	private final OptionalInt time;

	public Command(
		final Type type,
		final OptionalInt time
	) {
		this.type = type;
		this.time = time == null ? OptionalInt.empty() : time;
	}

	public Type getType() {
		return type;
	}

	@JsonSerialize(using=OptionalIntSerializer.class)
	public OptionalInt getTime() {
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
