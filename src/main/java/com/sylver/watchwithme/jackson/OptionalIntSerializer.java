package com.sylver.watchwithme.jackson;

import java.io.IOException;
import java.util.OptionalInt;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

/**
 * I couldn't figure out how to get the Custom Jackson Object Mapper going.
 */
public class OptionalIntSerializer extends JsonSerializer<OptionalInt> {

	@Override
	public void serialize(OptionalInt value, JsonGenerator jgen,
						  SerializerProvider provider) throws IOException,
		JsonProcessingException {
		if (value.isPresent()) {
			jgen.writeNumber(value.getAsInt());
		} else {
			jgen.writeBoolean(false);
		}
	}

}

