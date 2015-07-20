package com.sylver.watchwithme.spring;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.socket.config.annotation.AbstractWebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;

import com.sylver.watchwithme.controller.UrlDesign;

/**
 * Spring config necessary for websockets stuff.
 */
@Configuration
@EnableWebMvc
@EnableScheduling
@ComponentScan("com.sylver.watchwithme.controller")
@EnableWebSocketMessageBroker
public class WebSocketSpringConfig extends AbstractWebSocketMessageBrokerConfigurer {

	/**
	 * This is the back-end answer to the JS line:
	 *     {@code
	 *     var stomp = Stomp.over(new SockJS('/messaging'));
	 *     }
	 * @param registry self-explanatory.
	 */
	@Override
	public void registerStompEndpoints(final StompEndpointRegistry registry) {
		registry.addEndpoint(UrlDesign.STOMP_ENDPOINT).withSockJS();
	}

	/**
	 * Actually I'm currently unsure what exactly this does, it will probably be used when we're
	 * delegating messages for different rooms to different users.  The "/topic" broker channel
	 * is taken from the tutorial.
	 * @param registry dunno.
	 */
	@Override
	public void configureMessageBroker(final MessageBrokerRegistry registry) {
		registry.enableSimpleBroker(UrlDesign.BROKER_PREFIX);
		registry.setApplicationDestinationPrefixes(UrlDesign.INBOUND_MESSAGE_HANDLING_PREFIX);
	}
}
