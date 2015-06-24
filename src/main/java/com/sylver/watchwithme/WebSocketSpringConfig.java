package com.sylver.watchwithme;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.socket.config.annotation.AbstractWebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;

/**
 * Spring config necessary for websockets stuff.
 */
@Configuration
@EnableWebMvc
@EnableScheduling
@ComponentScan("com.sylver.watchwithme")
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
		registry.addEndpoint("/messaging").withSockJS();
	}

	/**
	 * Actually I'm currently unsure what exactly this does, it will probably be used when we're
	 * delegating messages for different rooms to different users.  The "/topic" broker channel
	 * is taken from the tutorial.
	 * @param registry dunno.
	 */
	@Override
	public void configureMessageBroker(final MessageBrokerRegistry registry) {
		registry.enableSimpleBroker("/topic");
		registry.setApplicationDestinationPrefixes("/");
	}
}
