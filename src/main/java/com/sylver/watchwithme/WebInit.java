package com.sylver.watchwithme;

import javax.servlet.ServletContext;
import javax.servlet.ServletRegistration;

import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.DispatcherServlet;

/**
 * {@link WebApplicationInitializer} is a Servlet 3.0 replacement for web.xml, to tell the Servlet
 * Container (eg Tomcat) how to start/use this webapp.
 */
public class WebInit implements WebApplicationInitializer{

	@Override
	public void onStartup(ServletContext container) {
		final AnnotationConfigWebApplicationContext appContext =
			new AnnotationConfigWebApplicationContext();
		appContext.setDisplayName("Watch With Me");

		// All Spring Configuration classes need to be registered
		appContext.register(ServletConfig.class);

		final ServletRegistration.Dynamic dispatcher =
			container.addServlet("Watch With Me Servlet", new DispatcherServlet(appContext));
		dispatcher.setLoadOnStartup(1);
		dispatcher.addMapping("/");
		dispatcher.setAsyncSupported(true);
	}
}
