package com.sylver.watchwithme;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * This Controller is for demonstration of a properly configured Spring Controller
 */
@Controller
public class HelloController {

	/**
	 * The {@link RequestMapping} annotation tells Spring which url-mappings, from the root context,
	 * this method should handle.  eg if this webapp was hosted at localhost:8080, then this
	 * {@link RequestMapping} of "/" would tell Spring that if a Http Get request (like a webpage load)
	 * on localhost:8080/ was made, this method should handle it.
	 *
	 * Returning a String without the method-level {@link ResponseBody} annotation tells
	 * Spring to use that String to find an internal resource with that name.  This, along with
	 * other configuration, resolves to our /webapp/resources/hello.jsp file.
	 *
	 * The method name is irrelevant as far as Spring is concerned.
	 *
	 * @return The String "hello" to tell Spring to serve the hello.jsp file.
	 */
	@RequestMapping(value = "/", method = RequestMethod.GET)
	public String hello() {
		return "hello";
	}
}
