<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>WatchWithMe</title>

	<link rel="stylesheet" href="css/watchwithme.css" />

	<!-- websockets libraries -->
	<script src="lib/sockjs.min.js"></script>
	<script src="lib/stomp.min.js"></script>

	<script src="lib/jquery.js"></script>

	<!-- our script -->
	<script src="js/room.js"></script>

</head>
<body>
<h1>Watch With Me</h1>
<h3>Testing environment</h3>
<video src="vid/samplevideo.mp4" controls></video>

<div class="controls">
	<div class="control play-button">Play</div>
	<div class="control pause-button">Pause</div>
	<div class="control seek-container">
		<input class="seek-input" type="text">
		<div class="seek-button">Seek</div>
	</div>
	<div class="control current-time">
		Current time: <span class="current-time-value"></span>
	</div>
	<div class="control duration">
		Duration: <span class="duration-value"></span>
	</div>
</div>
</body>
</html>
