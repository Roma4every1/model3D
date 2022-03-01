// module scroll

var Events = require("events");
var geom = require("./geom");

var wheelStep = 1.5;
var minMouseMove = 2;
var slice = [].slice;

module.exports = Scroller

function Scroller(control) {
	this.control = control
	var events = control.events = new Events();

	var uimode = false

	var coords = geom.translator(1, { x: 0, y: 0 }, 1, { x: 0, y: 0 })

	var sendCoords = coords =>
		events.emit("changed", { control, coords })
	var enterUIMode = () => {
		if (uimode)
			return
		uimode = true
		events.emit("uimode", { control, uimode })
	}
	var exitUIMode = () => {
		if (!uimode)
			return
		uimode = false
		events.emit("uimode", { control, uimode })
	}
	var pointPicked = point =>
		events.emit("pointPicked", { control, point })

	events.on("init", newCoords => coords = newCoords)

	var action = null

	var updateView = info =>
		sendCoords(action.initialCoords.zoom(info.scaleMul, info.screenPoint, action.mapMovePoint))

	var startAction = (event, data) => {
		enterUIMode()
		action = data
		action.initialCoords = coords
		action.mapMovePoint = coords.pointToMap(action.movePoint)
	}

	var stopAction = event => {
		exitUIMode()
		if (action && action.stop)
			action.stop(event)
		action = null
	}

	var callAction = (event, points) => {
		enterUIMode()
		for (var i = 0; i < action.oldPoints.length; ++i)
			if (Math.abs(action.oldPoints[i].x - points[i].x) >= minMouseMove ||
				Math.abs(action.oldPoints[i].y - points[i].y) >= minMouseMove
			) {
				action.moved = true
				action.oldPoints = points
				action.move(event, points)
			}
	}

	var startMove = (event, points) => startAction(event, {
		move: (event, points) => {
			if (control.blocked)
				return
			updateView({
				screenPoint: points[0],
				scaleMul: 1
			})
		},
		stop: event => {
			if (!action.moved)
				pointPicked(action.mapMovePoint)
		},
		oldPoints: [points[0]],
		movePoint: points[0],
	})

	var startResize = (event, points) => startAction(event, {
		move: (event, points) => {
			if (control.blocked)
				return
			updateView({
				screenPoint: middlePoint(points[0], points[1]),
				scaleMul: action.oldDistance / distance(points[0], points[1])
			})
		},
		oldPoints: [points[0], points[1]],
		oldDistance: distance(points[0], points[1]),
		movePoint: middlePoint(points[0], points[1]),
	})

	var stopActionEvent = event => {
		if (action) {
			// event.preventDefault()
			stopAction(event)
		}
	}

	control.addEventListener("touchstart", event => {
		if (control.blocked)
			return
		if (event.target !== control)
			return
		stopAction(event)
		var actionFactory = null
		if (event.touches.length === 1)
			actionFactory = startMove
		if (event.touches.length >= 2)
			actionFactory = startResize
		if (actionFactory) {
			//event.preventDefault()
			var t = touches(event.touches)
			actionFactory(event, t.map(clientPoint.bind(null, event)))
			action.keyString = t.keyString
		}
	}, { passive: true })

	control.addEventListener("touchmove", event => {
		if (event.target !== control)
			return
		if (action) {
			var t = touches(event.touches)
			if (action.keyString !== t.keyString)
				stopAction(event)
			else {
				// event.preventDefault()
				callAction(event, t.map(clientPoint.bind(null, event)))
			}
		}
	}, { passive: true })

	control.addEventListener("touchend", stopActionEvent, { passive: true })
	control.addEventListener("touchcancel", stopActionEvent, { passive: true })

	control.addEventListener("mousewheel", event => {
		if (event.target !== control)
			return
		var delta = event.wheelDelta < 0 ? -1 : 1
		var moving = !!action
		// event.preventDefault()
		stopAction(event)
		startAction(event, { movePoint: clientPoint(event) })
		updateView({
			screenPoint: action.movePoint,
			scaleMul: Math.pow(wheelStep, -delta)
		})
		stopAction(event)
		if (moving) {
			startMove(event, [clientPoint(event)])
			action.moved = true
		}
	}, { passive: true })

	control.addEventListener("mousedown", event => {
		stopAction(event)
		if (event.which !== 1)
			return
		if (event.target !== control)
			return
		// event.preventDefault()
		startMove(event, [clientPoint(event)])
	}, { passive: true })

	control.addEventListener("mouseup", stopActionEvent, { passive: true })

	control.addEventListener("mousemove", event => {
		if (!action)
			return
		if (event.which !== 1) {
			stopAction(event)
			return
		}
		if (event.target !== control)
			return
		// event.preventDefault()
		callAction(event, [clientPoint(event)])
	}, { passive: true })
}

var compareTouches = (a, b) =>
	a.identifier < b.identifier
		? -1
		: a.identifier > b.identifier
			? 1
			: 0;

var touchIdentifier = a => a.identifier;

var touches = t => {
	var ret = slice.call(t).sort(compareTouches)
	ret.keyString = ret.map(touchIdentifier).join(" ")
	return ret
};

var clientPoint = (event, point) => {
	var ret
	if ("offsetX" in event)
		ret = {
			x: event.offsetX,
			y: event.offsetY,
		}
	else
		ret = {
			x: event.clientX,
			y: event.clientY,
		}
	return ret
};

var distance = (p1, p2) => {
	var dx = p1.x - p2.x
	var dy = p1.y - p2.y
	return Math.sqrt(dx * dx + dy * dy)
};

var middlePoint = (p1, p2) => ({
	x: (p1.x + p2.x) * 0.5,
	y: (p1.y + p2.y) * 0.5
});
