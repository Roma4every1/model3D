import type { CaratColumnDTO, CaratColumnInit } from '../lib/dto.types';
import type { CaratCorrelation, StratumCorrelation, CaratIntervalModel } from '../lib/types';
import { CaratDrawer } from './drawer';
import { CaratTrack } from './track';
import { defaultSettings } from '../lib/constants';
import { formatDistance } from '../lib/utils';


/** Модель корреляций. */
export class CaratCorrelations {
  /** Отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Оригинальные настройки вида корреляций. */
  private readonly init: CaratColumnInit;
  /** Ширина корреляций. */
  private readonly width: number;

  /** Данные колонок корреляций. */
  private correlations: CaratCorrelation[];
  /** Флаг, указывающий на наличие расстояния. */
  private hasDistance: boolean;
  /** Расстояния между треками */
  public distance: number[];

  constructor(init: CaratColumnInit, drawer: CaratDrawer) {
    this.init = init;
    this.drawer = drawer;
    this.width = init?.settings?.width ?? 50;
    this.correlations = [];
    this.hasDistance = true;
    this.distance = [];
  }

  public getInit(): CaratColumnDTO {
    return this.init;
  }

  public getWidth(): number {
    return this.width;
  }

  public updateRects(trackList: CaratTrack[]): void {
    const dataRect = trackList[0].getBackgroundGroup().getDataRect();
    const top = trackList[0].rect.top + dataRect.top;
    const height = dataRect.height;

    for (let i = 0; i < this.correlations.length; i++) {
      const rect = trackList[i].rect;
      const left = rect.left + rect.width + 1;
      this.correlations[i].rect = {top, left, width: this.width - 2, height};
    }
  }

  public setData(trackList: CaratTrack[]): void {
    this.correlations = [];
    for (let i = 0; i < trackList.length - 1; i++) {
      const leftTrack = trackList[i];
      const rightTrack = trackList[i + 1];
      const leftStrata = leftTrack.getBackgroundGroup().getStrata();
      const rightStrata = rightTrack.getBackgroundGroup().getStrata();

      const trackRect = leftTrack.rect;
      const correlation: CaratCorrelation = {
        rect: {...trackRect, left: trackRect.left + trackRect.width + 1, width: this.width - 2},
        leftViewport: leftTrack.viewport,
        rightViewport: rightTrack.viewport,
        data: this.findCorrelations(leftStrata, rightStrata),
        label: this.distance.length > i ? formatDistance(this.distance[i]) : '',
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
      const correlations = this.correlations[index];
      if (correlations) this.drawer.drawCorrelations(correlations, this.hasDistance);
    } else {
      for (const correlations of this.correlations) {
        this.drawer.drawCorrelations(correlations, this.hasDistance);
      }
    }
  }
}
