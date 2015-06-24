package com.sylver.watchwithme;

public class RoomUpdate {

	public enum Type {
		SUBSCRIBE,
		MESSAGE
	}

	private final Type type;
	private final String message;

	public RoomUpdate(Type type, String message) {
		this.type = type;
		this.message = message;
	}

	public Type getType() {
		return type;
	}

	public String getMessage() {
		return message;
	}

}
