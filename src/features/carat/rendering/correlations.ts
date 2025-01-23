import type { CaratColumnDTO, CaratColumnInit } from '../lib/dto.types';
import type { CaratCorrelation, StratumCorrelation, CaratIntervalModel } from '../lib/types';
import { distance } from 'shared/lib';
import { CaratDrawer } from './drawer';
import { CaratTrack } from './track';
import { formatDistance } from '../lib/utils';
import { defaultSettings } from '../lib/constants';


/** Модель корреляций. */
export class CaratCorrelations {
  /** Отрисовщик. */
  private readonly drawer: CaratDrawer;
  /** Оригинальные настройки вида корреляций. */
  private readonly init: CaratColumnInit;
  /** Ширина корреляций. */
  private readonly width: number;
  /** Флаг, указывающий на наличие расстояния. */
  private readonly showDistance: boolean;

  /** Данные колонок корреляций. */
  private correlations: CaratCorrelation[];
  /** Расстояния между треками */
  private distances: number[];

  constructor(init: CaratColumnInit, drawer: CaratDrawer) {
    this.init = init;
    this.drawer = drawer;
    this.width = init?.settings?.width ?? 50;
    this.showDistance = true;
    this.correlations = [];
    this.distances = [];
  }

  public getInit(): CaratColumnDTO {
    return this.init;
  }

  public getWidth(): number {
    return this.width;
  }

  public updateRects(trackList: CaratTrack[]): void {
    for (let i = 0; i < this.correlations.length; ++i) {
      const lTrack = trackList[i];
      const rTrack = trackList[i + 1];
      const lDataRect = lTrack.getBackgroundGroup().getDataRect();
      const rDataRect = rTrack.getBackgroundGroup().getDataRect();

      const top = lTrack.rect.top + lDataRect.top;
      const left = lTrack.rect.left + lTrack.rect.width + 1;
      const height = Math.min(lDataRect.height, rDataRect.height);
      this.correlations[i].rect = {top, left, width: this.width - 2, height};
    }
  }

  public setPoints(points: Point[]): void {
    this.distances = [];
    for (let i = 0; i < points.length - 1; ++i) {
      const p1 = points[i];
      const p2 = points[i + 1];

      const valid =
        typeof p1.x === 'number' && typeof p1.y === 'number' &&
        typeof p2.x === 'number' && typeof p2.y === 'number';
      this.distances.push(valid ? distance(p1, p2) : null);
    }
  }

  public setData(trackList: CaratTrack[]): void {
    this.correlations = [];
    for (let i = 0; i < trackList.length - 1; ++i) {
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
        distance: this.distances[i],
        distanceLabel: formatDistance(this.distances[i]),
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
      if (correlations) this.drawer.drawCorrelations(correlations, this.showDistance);
    } else {
      for (const correlations of this.correlations) {
        this.drawer.drawCorrelations(correlations, this.showDistance);
      }
    }
  }

  public renderForImage(): void {
    for (const correlations of this.correlations) {
      this.drawer.drawCorrelations(correlations, this.showDistance, true);
    }
  }
}
