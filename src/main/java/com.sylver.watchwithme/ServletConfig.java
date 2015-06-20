package com.sylver.watchwithme;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

/**
 * The {@link WebMvcConfigurerAdapter} enables Spring WebMvc functionality, and has methods that
 * can be overridden to provide custom configuration.  The {@link ComponentScan} annotation tells
 * Spring which packages to scan for {@link Component}s, like {@link Controller}s
 */
@Configuration
@ComponentScan("com.sylver.watchwithme")
public class ServletConfig extends WebMvcConfigurerAdapter {
}
