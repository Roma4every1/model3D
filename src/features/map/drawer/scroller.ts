import Events from 'events';
import { Translator, getTranslator } from './geom';


interface ScrollerAction {
	moved?: boolean;
	movePoint: Point;
	mapMovePoint?: Point;
	oldPoint?: Point;
	initialCoords?: any;
  noUiMode?: boolean;
}


const changed = 'changed';
const uiMode = 'uimode';

export class Scroller implements IMapScroller {
  public sync: boolean = false;
  public list: MapCanvas[];

  private canvas: MapCanvas = null;
	private action: ScrollerAction = null;
	private translator: Translator;

	constructor() {
    this.list = [];
		this.translator = getTranslator(1, {x: 0, y: 0}, 1, {x: 0, y: 0});
	}

	public setCanvas(canvas: MapCanvas) {
		this.canvas = canvas;
		canvas.events = new Events();
		canvas.events.on('init', (t: Translator) => { this.translator = t; });
		canvas.events.on('sync', (newCs) => { this.emit('cs', newCs); })
	}

	private emit(eventName: string, arg: Point | boolean | object) {
		this.canvas.events.emit(eventName, arg);
		if (this.sync) for (const canvas of this.list) {
			canvas.events.emit(eventName, arg);
		}
	}

	private startAction(data: ScrollerAction) {
		if (!data.noUiMode) this.emit(uiMode, true);
		this.action = data;
		this.action.initialCoords = this.translator;
		this.action.mapMovePoint = this.translator.pointToMap(this.action.movePoint);
	}
	private stopAction() {
		this.emit(uiMode, false);
		this.action = null;
	}

	private updateView = (screenPoint: Point, scaleMultiplier: number) => {
		const coords = this.action.initialCoords.zoom(scaleMultiplier, screenPoint, this.action.mapMovePoint);
		const args = {control: this.canvas, coords};

		this.canvas.events.emit(changed, args);
		if (this.sync) for (const canvas of this.list) {
			args.control = canvas;
			canvas.events.emit(changed, args);
		}
	}

	/* --- Listeners --- */

	public wheel(event: WheelEvent): void {
		if (this.canvas.blocked) return;
		const moving = !!this.action;
		const movedPoint = {x: event.offsetX, y: event.offsetY};
		const delta = event.deltaY < 0 ? 1 : -1;

		this.stopAction();
		this.startAction({movePoint: movedPoint, noUiMode: !this.sync});
		this.updateView(this.action.movePoint, Math.pow(1.5, -delta));
		this.stopAction();

		if (moving) {
			this.startAction({oldPoint: movedPoint, movePoint: movedPoint});
			this.action.moved = true;
		}
	}

	public mouseDown(event: MouseEvent): void {
		this.stopAction();
		if (event.button !== 0) return;
		if (event.target !== this.canvas) return;

		const movedPoint = {x: event.offsetX, y: event.offsetY};
		this.startAction({oldPoint: movedPoint, movePoint: movedPoint});
	}

	public mouseMove(event: MouseEvent): void {
		if (!this.action) return;
		if (event.button !== 0) return this.stopAction();
		if (event.target !== this.canvas || this.canvas.blocked) return;
		const point = {x: event.offsetX, y: event.offsetY};

		this.emit(uiMode, true);
		this.action.moved = true;
		this.action.oldPoint = point;
		this.updateView(point, 1);
	}

	public mouseUp(): void {
		if (this.action) this.stopAction();
	}
}
