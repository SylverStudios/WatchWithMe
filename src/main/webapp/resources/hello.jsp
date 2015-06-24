<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>WatchWithMe</title>

	<!-- websockets libraries -->
	<script src="sockjs.min.js"></script>
	<script src="stomp.min.js"></script>

	<!-- our script -->
	<script src="websockets.js"></script>

</head>
<body>
For now this is just a dummy html page that our script can run off of.  I think the best plan is to
use this as a testing area for what would go into the chrome extension (using websockets to subscribe
to room updates, listening to / interacting with video elements based on updates, and so forth) then
port this to the chrome extension after it's all set up and working.
</body>
</html>
