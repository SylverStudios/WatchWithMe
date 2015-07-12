package com.sylver.watchwithme.jackson;

import java.io.IOException;
import java.util.OptionalDouble;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

/**
 * I couldn't figure out how to get the Custom Jackson Object Mapper going.
 */
public class OptionalDoubleSerializer extends JsonSerializer<OptionalDouble> {

	@Override
	public void serialize(OptionalDouble value, JsonGenerator jgen,
						  SerializerProvider provider) throws IOException,
		JsonProcessingException {
		if (value.isPresent()) {
			jgen.writeNumber(value.getAsDouble());
		} else {
			jgen.writeBoolean(false);
		}
	}

}

