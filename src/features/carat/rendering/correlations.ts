import { CaratDrawer } from './drawer';
import { CaratTrack } from './track';
import { CaratCorrelation, StratumCorrelation, CaratIntervalModel } from '../lib/types';


/** Модель корреляций. */
export class CaratCorrelations implements ICaratCorrelations {
  /** Отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Оригинальные настройки вида корреляций. */
  private readonly init: CaratColumnInit;
  /** Ширина корреляций. */
  private readonly width: number;

  /** Данные колонок корреляций. */
  private correlations: CaratCorrelation[];

  constructor(init: CaratColumnInit, drawer: CaratDrawer) {
    this.init = init;
    this.drawer = drawer;
    this.width = init.settings.width;
    this.correlations = [];
  }

  public getInit(): CaratColumnInit {
    return this.init;
  }

  public getWidth(): number {
    return this.width;
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
      result.push({leftTop, leftBottom, rightTop, rightBottom});
    }
    return result;
  }

  public render(index?: number): void {
    if (index !== undefined) {
      const correlation = this.correlations[index];
      if (correlation) this.drawer.drawCorrelation(correlation);
    } else {
      for (const correlation of this.correlations) {
        this.drawer.drawCorrelation(correlation);
      }
    }
  }
}
