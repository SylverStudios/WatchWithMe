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
	 * The {@link ResponseBody} annotation tells Spring not to try to use the returned value to further
	 * resolve to a view (if it returned the String "hello" Spring would try to find a "hello.jsp"
	 * or "hello.html" or something), but rather just wrap the returned value in a http response and
	 * send it back to whoever made the request.
	 *
	 * The method name is irrelevant as far as Spring is concerned.
	 *
	 * @return A "hello world"-style {@link ResponseBody} {link String}
	 */
	@RequestMapping(value = "/", method = RequestMethod.GET)
	public @ResponseBody String hello() {
		return "hello";
	}
}
