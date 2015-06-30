/*
This is the script for the BROWSER ACTION.
Pretty standard stuff i think. I wrapped everything in
a single object, but that's just a convention we use at work,
let me know your thoughts.

Since this is part of the BROWSER ACTION we have access to other
pages of the extension via the chrome APIs.

First thing we do is get the background.html so we can use the methods
Eventually we will need to be able to receive message to display connected
parties etc.
*/


document.addEventListener('DOMContentLoaded', function() {

	console.log("popup script is live.");

	var wwm = {
		page : chrome.extension.getBackgroundPage(),

		init : function() {
			console.log("Init method hit.");

			wwm.setupButtons();
		},

		setupButtons : function() {
			$('.create-button').click(wwm.createRoom);
			
			$('.join-button').click(wwm.joinRoom);

			$('.play-button').click(wwm.playRoom);

			$('.pause-button').click(wwm.pauseRoom);
		},

		playRoom : function() {
			console.log("playRoom isn't implemented yet.");
			wwm.page.sendPlayCommand();
		},

		pauseRoom : function() {
			console.log("pauseRoom isn't implemented yet.");
			wwm.page.sendPauseCommand();
		},

		createRoom : function() {
			console.log("CreateRoom isn't implemented yet.");
		},

		joinRoom : function() {
			console.log("JoinRoom isn't implemented yet.");
		}
	};

	wwm.init();
});