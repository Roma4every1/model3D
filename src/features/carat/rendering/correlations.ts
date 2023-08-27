import { CaratDrawer } from './drawer';
import { CaratTrack } from './track';
import { CaratCorrelation, StratumCorrelation, CaratIntervalModel } from '../lib/types';
import { defaultSettings } from '../lib/constants';


/** Модель корреляций. */
export class CaratCorrelations implements ICaratCorrelations {
  /** Отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Оригинальные настройки вида корреляций. */
  private readonly init: CaratColumnInit;
  /** Ширина корреляций. */
  private readonly width: number;

  /** Верхняя координата треков. */
  private trackTop: number;
  /** Данные колонок корреляций. */
  private correlations: CaratCorrelation[];

  constructor(init: CaratColumnInit, drawer: CaratDrawer) {
    this.init = init;
    this.drawer = drawer;
    this.width = init.settings.width;
    this.trackTop = 0;
    this.correlations = [];
  }

  public getInit(): CaratColumnInit {
    return this.init;
  }

  public getWidth(): number {
    return this.width;
  }

  public updateRects(trackList: CaratTrack[]): void {
    const maxHeaderHeight = Math.max(...trackList.map(t => t.maxGroupHeaderHeight));
    const top = this.drawer.trackHeaderSettings.height + maxHeaderHeight;
    const height = trackList[0].rect.height - top;

    for (let i = 0; i < this.correlations.length; i++) {
      const rect = trackList[i].rect;
      const left = rect.left + rect.width + 1;
      this.correlations[i].rect = {top, left, width: this.width - 2, height};
    }
    this.trackTop = trackList[0].rect.top;
  }

  public setData(trackList: CaratTrack[]): void {
    this.correlations = [];
    for (let i = 0; i < trackList.length - 1; i++) {
      const leftTrack = trackList[i];
      const leftGroup = leftTrack.getBackgroundGroup();
      const rightTrack = trackList[i + 1];
      const rightGroup = rightTrack.getBackgroundGroup();

      const trackRect = leftTrack.rect;
      const correlation: CaratCorrelation = {
        rect: {...trackRect, left: trackRect.left + trackRect.width + 1, width: this.width - 2},
        leftTop: leftGroup.getDataRect().top,
        rightTop: rightGroup.getDataRect().top,
        leftViewport: leftTrack.viewport,
        rightViewport: rightTrack.viewport,
        data: this.findCorrelations(leftGroup.getIntervals(), rightGroup.getIntervals()),
      };
      this.correlations.push(correlation);
    }
  }

  /** Находит корреляции между пластами. */
  private findCorrelations(left: CaratIntervalModel[], right: CaratIntervalModel[]): StratumCorrelation[] {
    const result: StratumCorrelation[] = [];
    const leftIDs = [...new Set(left.map(s => s.stratumID).filter(Boolean))];

    for (const id of leftIDs) {
      const leftStrata = left.filter(s => s.stratumID === id);
      const rightStrata = right.filter(s => s.stratumID === id);
      if (leftStrata.length === 0 || rightStrata.length === 0) continue;

      const leftTopValues = leftStrata.map(s => s.top);
      const leftBottomValues = leftStrata.map(s => s.bottom);
      const rightTopValues = rightStrata.map(s => s.top);
      const rightBottomValues = rightStrata.map(s => s.bottom);

      const leftTop = Math.min(...leftTopValues);
      const leftBottom = Math.max(...leftBottomValues);
      const rightTop = Math.min(...rightTopValues);
      const rightBottom = Math.max(...rightBottomValues);

      const style =
        leftStrata.find(s => s.style)?.style ??
        rightStrata.find(s => s.style)?.style ??
        defaultSettings.intervalStyle;
      result.push({leftTop, leftBottom, rightTop, rightBottom, style});
    }
    return result;
  }

  public render(index?: number): void {
    if (index !== undefined) {
      const correlation = this.correlations[index];
      if (correlation) this.drawer.drawCorrelation(this.trackTop, correlation);
    } else {
      for (const correlation of this.correlations) {
        this.drawer.drawCorrelation(this.trackTop, correlation);
      }
    }
  }
}
