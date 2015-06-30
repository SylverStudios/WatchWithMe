/*
Background.html

This is a script that will get loaded into the chrome background page.
The background page has a default html that just loads any scripts you put in the manifest.
You would only need to define an html if you had to do something unique (I'm not totally sure what that would be).
The html isn't actually visible, it just exists behind the scenes.

Background pages will exist as long as the browser is open. The scripts functions can be found by
other scripts in the extension.

The alternative to the background page is an "event" page, which is disposed after it is used.
We should probably convert this page to an "event" page at some point, I just didn't know what to do.

I believe this would be a suitable position for all server contact. Then we can distribute messages to
the tab UI and to the BROWSER ACTION.
*/


// This function is accessible by any other page in the extension and it will use the message API to send a
// generic window message to the current window. These can be easily modified to send any object.
function sendPlayCommand() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
	    chrome.tabs.sendMessage(tabs[0].id, {command: "PLAY"});
	});
}

function sendPauseCommand() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
	    chrome.tabs.sendMessage(tabs[0].id, {command: "PAUSE"});
	});
}

// Template for sending window messages

function messageTemplate() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
	    chrome.tabs.sendMessage(tabs[0].id, {key : "value"});
	});
}

// Explaination of chrome.tabs.query
// This method is essential to communicating between different pages of the extension
// The first term is basically your 'where' statement and the second term is the callback
// function and the query is asynchronous so you need to wait for it to return before you
// access the variables.