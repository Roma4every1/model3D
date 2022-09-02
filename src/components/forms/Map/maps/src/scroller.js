import Events from "events";
import {translator} from "./geom";

const wheelStep = 1.5;
const minMouseMove = 2;
//const slice = [].slice;

// const compareTouches = (a, b) => a.identifier < b.identifier ? -1 : a.identifier > b.identifier ? 1 : 0;
// const touchIdentifier = a => a.identifier;

// const touches = t => {
// 	const ret = slice.call(t).sort(compareTouches);
// 	ret.keyString = ret.map(touchIdentifier).join(" ")
// 	return ret
// };
const clientPoint = (event) => {
	return {x: event.offsetX, y: event.offsetY};
};
// const distance = (p1, p2) => {
// 	const dx = p1.x - p2.x;
// 	const dy = p1.y - p2.y;
// 	return Math.sqrt(dx * dx + dy * dy)
// };
// const middlePoint = (p1, p2) => ({
// 	x: (p1.x + p2.x) * 0.5,
// 	y: (p1.y + p2.y) * 0.5
// });
const listenerOptions = {passive: true};

function Scroller(control) {
	this.control = control;
	const events = control.events = new Events();
	let uiMode = false;
	let coords = translator(1, {x: 0, y: 0}, 1, {x: 0, y: 0});

	const sendCoords = (coords) => {
		return events.emit('changed', {control, coords});
	};
	const enterUIMode = () => {
		if (uiMode) return;
		uiMode = true;
		events.emit('uimode', { control, uimode: uiMode });
	};
	const exitUIMode = () => {
		if (!uiMode) return;
		uiMode = false;
		events.emit('uimode', {control, uimode: uiMode})
	};
	const pointPicked = (point) => {
	  return events.emit('pointPicked', {control, point});
	};

	events.on('init', newCoords => coords = newCoords)
	let action = null;

	const updateView = (info) => {
		return sendCoords(action.initialCoords.zoom(info.scaleMul, info.screenPoint, action.mapMovePoint));
	};
	const startAction = (event, data) => {
		enterUIMode();
		action = data;
		action.initialCoords = coords;
		action.mapMovePoint = coords.pointToMap(action.movePoint);
	};
	const stopAction = (event) => {
		exitUIMode();
		if (action && action.stop) action.stop(event);
		action = null;
	};
	const callAction = (event, points) => {
		enterUIMode();
		for (let i = 0; i < action.oldPoints.length; ++i)
			if (
				Math.abs(action.oldPoints[i].x - points[i].x) >= minMouseMove ||
				Math.abs(action.oldPoints[i].y - points[i].y) >= minMouseMove
			) {
				action.moved = true;
				action.oldPoints = points;
				action.move(event, points);
			}
	};
	const startMove = (event, points) => startAction(event, {
		move: (event, points) => {
			if (control.blocked) return;
			updateView({screenPoint: points[0], scaleMul: 1});
		},
		stop: () => {
			if (!action.moved) pointPicked(action.mapMovePoint);
		},
		oldPoints: [points[0]],
		movePoint: points[0],
	});
	// const startResize = (event, points) => startAction(event, {
	// 	move: (event, points) => {
	// 		if (control.blocked) return;
	// 		updateView({
	// 			screenPoint: middlePoint(points[0], points[1]),
	// 			scaleMul: action.oldDistance / distance(points[0], points[1])
	// 		})
	// 	},
	// 	oldPoints: [points[0], points[1]],
	// 	oldDistance: distance(points[0], points[1]),
	// 	movePoint: middlePoint(points[0], points[1]),
	// });
	const stopActionEvent = event => {
		if (action) {
			// event.preventDefault();
			stopAction(event);
		}
	};

	// control.addEventListener('touchstart', event => {
	// 	if (control.blocked) return;
	// 	if (event.target !== control) return;
	//
	// 	stopAction(event)
	// 	let actionFactory = null;
	//
	// 	if (event.touches.length === 1) actionFactory = startMove;
	// 	if (event.touches.length >= 2) actionFactory = startResize;
	// 	if (actionFactory) {
	// 		//event.preventDefault();
	// 		const t = touches(event.touches);
	// 		actionFactory(event, t.map(clientPoint.bind(null, event)));
	// 		action.keyString = t.keyString;
	// 	}
	// }, listenerOptions)

	// control.addEventListener('touchmove', event => {
	// 	if (event.target !== control) return;
	// 	if (!action) return;
	//
	// 	const t = touches(event.touches);
	// 	if (action.keyString !== t.keyString) {
	// 		stopAction(event);
	// 	} else {
	// 		// event.preventDefault();
	// 		callAction(event, t.map(clientPoint.bind(null, event)));
	// 	}
	// }, listenerOptions);
	//
	// control.addEventListener('touchend', stopActionEvent, listenerOptions);
	// control.addEventListener('touchcancel', stopActionEvent, listenerOptions);

	control.addEventListener('wheel', event => {
		if (event.target !== control || control.blocked) return;

		const delta = event.wheelDelta < 0 ? -1 : 1;
		const moving = !!action;
		// event.preventDefault();

		stopAction(event);
		startAction(event, { movePoint: clientPoint(event) });
		updateView({
			screenPoint: action.movePoint,
			scaleMul: Math.pow(wheelStep, -delta)
		});
		stopAction(event);
		if (moving) {
			startMove(event, [clientPoint(event)]);
			action.moved = true;
		}
	}, listenerOptions);

	control.addEventListener('mousedown', event => {
		stopAction(event)
		if (event.which !== 1) return;
		if (event.target !== control) return;
		// event.preventDefault();
		startMove(event, [clientPoint(event)]);
	}, listenerOptions);

	control.addEventListener('mouseup', stopActionEvent, listenerOptions);

	control.addEventListener('mousemove', event => {
		if (!action) return;
		if (event.which !== 1) return stopAction(event);
		if (event.target !== control) return;
		// event.preventDefault()
		callAction(event, [clientPoint(event)]);
	}, listenerOptions);
}

export default Scroller;
