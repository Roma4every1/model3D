import Events from 'events';
import { Translator, getTranslator } from './geom';
import { clientPoint, listenerOptions } from '../map-utils';


interface ScrollerAction {
	stop?: any,
	moved?: boolean,
	movePoint: ClientPoint,
	mapMovePoint?: ClientPoint,
	oldPoint?: ClientPoint,
	initialCoords?: any,
}
interface IScroller {
	setCanvas(canvas: MapCanvas): void
	setList(list: MapCanvas[]): void
}


const changed = 'changed';
const uiMode = 'uimode';

export class Scroller implements IScroller {
	private canvas: MapCanvas;
	private list: MapCanvas[];
	private action: ScrollerAction;
	private translator: Translator;

	constructor(canvas: MapCanvas) {
		this.action = null;
		this.translator = getTranslator(1, {x: 0, y: 0}, 1, {x: 0, y: 0});

		this.list = [];
		this.setCanvas(canvas);
	}

	public setCanvas(canvas: MapCanvas) {
		this.canvas = canvas;
		canvas.events = new Events();
		canvas.events.on('init', (t: Translator) => { this.translator = t; });
		canvas.events.on('sync', (newCs) => { this.emit('cs', newCs); })

		canvas.addEventListener('wheel', this.mouseWheelListener.bind(this), listenerOptions);
		canvas.addEventListener('mousedown', this.mouseDownListener.bind(this), listenerOptions);
		canvas.addEventListener('mousemove', this.mouseMoveListener.bind(this), listenerOptions);
		canvas.addEventListener('mouseup', this.mouseUpListener.bind(this), listenerOptions);
	}

	public setList(list: MapCanvas[]) {
		this.list = list;
	}

	private emit(eventName: string, arg: ClientPoint | boolean | object) {
		this.canvas.events.emit(eventName, arg);
		for (const canvas of this.list) {
			canvas.events.emit(eventName, arg);
		}
	}

	private startAction(data: ScrollerAction) {
		this.emit(uiMode, true);
		this.action = data;
		this.action.initialCoords = this.translator;
		this.action.mapMovePoint = this.translator.pointToMap(this.action.movePoint);
	}
	private stopAction(event: MouseEvent | WheelEvent) {
		this.emit(uiMode, false);
		if (this.action && this.action.stop) this.action.stop(event);
		this.action = null;
	}

	private updateView = (screenPoint: ClientPoint, scaleMultiplier: number) => {
		const coords = this.action.initialCoords.zoom(scaleMultiplier, screenPoint, this.action.mapMovePoint);
		const args = {control: this.canvas, coords};

		this.canvas.events.emit(changed, args);
		for (const canvas of this.list) {
			args.control = canvas;
			canvas.events.emit(changed, args);
		}
	}

	/* --- Listeners --- */

	private mouseWheelListener = (event: WheelEvent) => {
		if (event.target !== this.canvas || this.canvas.blocked) return;

		const moving = !!this.action;
		const movedPoint = clientPoint(event);
		const delta = event.deltaY < 0 ? 1 : -1;

		this.stopAction(event);
		this.startAction({movePoint: movedPoint});
		this.updateView(this.action.movePoint, Math.pow(1.5, -delta));
		this.stopAction(event);

		if (moving) {
			this.startAction({
				stop: () => {
					if (this.action.moved) return;
					this.emit('pointPicked', this.action.mapMovePoint);
				},
				oldPoint: movedPoint, movePoint: movedPoint,
			});
			this.action.moved = true;
		}
	}

	private mouseDownListener(event: MouseEvent) {
		this.stopAction(event);
		if (event.button !== 0) return;
		if (event.target !== this.canvas) return;

		const movedPoint = clientPoint(event);
		this.startAction({
			stop: () => {
				if (this.action.moved) return;
				this.emit('pointPicked', this.action.mapMovePoint);
			},
			oldPoint: movedPoint, movePoint: movedPoint,
		});
	}

	private mouseMoveListener(event: MouseEvent) {
		if (!this.action) return;
		if (event.button !== 0) return this.stopAction(event);
		if (event.target !== this.canvas || this.canvas.blocked) return;
		const point = clientPoint(event);

		this.emit(uiMode, true);
		this.action.moved = true;
		this.action.oldPoint = point;
		this.updateView(point, 1);
	}

	private mouseUpListener(event: MouseEvent) {
		if (this.action) this.stopAction(event);
	}
}
