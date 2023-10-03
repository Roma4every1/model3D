import Events from 'events';
import { Translator, getTranslator } from './geom';


interface ScrollerAction {
	mapMovePoint: Point;
	initTranslator: Translator;
}


export class Scroller implements IMapScroller {
  public sync: boolean = false;
  public list: MapCanvas[] = [];

  private canvas: MapCanvas = null;
	private action: ScrollerAction = null;
	private translator: Translator = null;

	public setCanvas(canvas: MapCanvas) {
		this.canvas = canvas;
		canvas.events = new Events();
		canvas.events.on('init', (t: Translator) => { this.translator = t; });
		canvas.events.on('sync', (view: MapViewport) => { this.emit('cs', view); })
	}

	private emit(eventName: string, arg: Point | boolean | object) {
		this.canvas.events.emit(eventName, arg);
		if (this.sync) for (const canvas of this.list) {
			canvas.events.emit(eventName, arg);
		}
	}

	/* --- Listeners --- */

	public wheel(event: WheelEvent): void {
		if (this.canvas.blocked) return;
		const point = {x: event.offsetX * devicePixelRatio, y: event.offsetY * devicePixelRatio};
    const mapPoint = this.translator.pointToMap(point);

    const newScale = this.translator.mapScale * (event.deltaY < 0 ? 2 / 3 : 1.5);
    const translator = getTranslator(newScale, mapPoint, point);
    this.emit('mode', this.sync);
    this.emit('changed', translator);

		if (this.action) {
      this.emit('mode', true);
      this.action.mapMovePoint = mapPoint;
      this.action.initTranslator = this.translator;
    }
	}

	public mouseDown(event: MouseEvent): void {
    this.emit('mode', true);
    const movePoint = {x: event.offsetX * devicePixelRatio, y: event.offsetY * devicePixelRatio};
    const mapMovePoint = this.translator.pointToMap(movePoint);
    this.action = {mapMovePoint, initTranslator: this.translator};
	}

	public mouseMove(event: MouseEvent): void {
		if (!this.action || this.canvas.blocked) return;
		this.emit('mode', true);

    const scale = this.action.initTranslator.mapScale;
    const point = {x: event.offsetX * devicePixelRatio, y: event.offsetY * devicePixelRatio};
    const translator = getTranslator(scale, this.action.mapMovePoint, point);
    this.emit('changed', translator);
	}

	public mouseUp(): void {
		if (this.action) {
      this.emit('mode', false);
      this.action = null;
    }
	}
}
