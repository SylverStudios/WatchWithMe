package com.sylver.watchwithme.spring;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;
import org.springframework.web.servlet.ViewResolver;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.servlet.view.InternalResourceViewResolver;

/**
 * The {@link WebMvcConfigurerAdapter} enables Spring WebMvc functionality, and has methods that
 * can be overridden to provide custom configuration.  The {@link ComponentScan} annotation tells
 * Spring which packages to scan for {@link Component}s, like {@link Controller}s
 */
@Configuration
@ComponentScan("com.sylver.watchwithme")
public class ServletConfig extends WebMvcConfigurerAdapter {

	/**
	 * Maps requests made by the client (eg browser) to internal resources.
	 * For example, mapping "/*.js" to "/resources/" means "any request made for a root-level
	 * resource with the extension .js should be resolved in our internal /resources/ directory".
	 * @param registry to make the mappings.
	 */
	@Override
	public void addResourceHandlers(final ResourceHandlerRegistry registry) {
		registry.addResourceHandler("/lib/*.js")
			.addResourceLocations("/resources/lib/");

		registry.addResourceHandler("/js/*.js")
			.addResourceLocations("/resources/js/");

		registry.addResourceHandler("/vid/*.mp4")
			.addResourceLocations("/resources/vid/");

		registry.addResourceHandler("/css/*.css")
			.addResourceLocations("/resources/css/");

		registry.addResourceHandler("/webjars/**")
			.addResourceLocations("classpath:/META-INF/resources/webjars/");
	}

	/**
	 * A special view resolver for .jsp files. Could be done in {@link #addResourceHandlers} but w/e.
	 * @return How to find the .jsp file.
	 */
	@Bean
	public ViewResolver jspViewResolver() {
		final InternalResourceViewResolver resolver = new InternalResourceViewResolver();
		resolver.setOrder(2);
		resolver.setCache(false);
		resolver.setPrefix("/resources/");
		resolver.setSuffix(".jsp");
		return resolver;
	}
}
