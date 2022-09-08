import Events from "events";
import { translator } from "./geom";
import { clientPoint, listenerOptions } from "../../map-utils";

const wheelStep = 1.5;
const minMouseMove = 2;


function Scroller(control) {
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

	const stopActionEvent = event => {
		if (action) {
			// event.preventDefault();
			stopAction(event);
		}
	};

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
