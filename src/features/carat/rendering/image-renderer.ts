import { CaratDrawer } from './drawer';
import { CaratStage } from './stage';
import { getBrowserSize } from '../lib/utils';
import { CaratTrack } from './track';

export class CaratImageRenderer {
  /** Отрисовщик. */
  public readonly drawer: CaratDrawer;
  /** Сцена диаграммы. */
  public readonly stage: CaratStage;

  constructor(stage:  CaratStage, drawer: CaratDrawer) {
    this.stage = stage;
    this.drawer = drawer;
  }

  private getCanvasSize(options: CaratExportOptions) {
    const {startDepth, endDepth, selectedTrack} = options;
    const trackPadding = this.drawer.trackBodySettings.padding;
    const trackHeaderHeight = this.drawer.trackHeaderSettings.height;
    const startY = [];
    const endY = [];

    selectedTrack.forEach((track, index) => {
      startY.push(Array.isArray(startDepth) ? startDepth[index] : startDepth);
      endY.push(Array.isArray(endDepth) ? endDepth[index] : endDepth);
    });

    const width = selectedTrack.length === 1
      ? selectedTrack[0].rect.width + 2 * trackPadding
      : selectedTrack.reduce((totalWidth, track, index) => {
        return totalWidth + track.rect.width + (index < selectedTrack.length - 1 ? this.stage.correlations.getWidth() : 0);
    }, 0) + trackPadding * 2;

    const height = selectedTrack[0].rect.top + trackHeaderHeight + Math.max(...selectedTrack.map((track, index) => {
      const rectHeight = track.viewport.scale * window.devicePixelRatio * (endY[index] - startY[index]);
      return track.maxGroupHeaderHeight + rectHeight;
    })) + 2 * trackPadding;

    return {width, height, startY, endY};
  }

  private getOriginalValues(selectedTracks: CaratTrack[]) {
    return selectedTracks.map(track => ({
      y: track.viewport.y,
      left: track.rect.left,
      height: track.rect.height,
    }));
  }

  private createCanvas(width: number, height: number) {
    const canvas = document.createElement('canvas');
    canvas.width = width * CaratDrawer.ratio;
    canvas.height = height * CaratDrawer.ratio;
    return canvas;
  }

  private renderSingleTrack(track: CaratTrack, startDepth: number, startY: number, endY: number, trackPadding: number) {
    track.viewport.y = startY;
    const rectHeight = track.viewport.scale * window.devicePixelRatio * (endY - startY);
    const trackHeight = this.drawer.trackHeaderSettings.height + track.maxGroupHeaderHeight + rectHeight;

    track.setHeight(trackHeight);
    track.rect.left = trackPadding;
    track.viewport.y = startDepth;
    track.render();
  }

  private renderAllTracks(selectedTracks: CaratTrack[], startY: number[], endY: number[], trackPadding: number) {
    let currentLeft = trackPadding;

    selectedTracks.forEach((track, index) => {
      track.viewport.y = startY[index];
      const rectHeight = track.viewport.scale * window.devicePixelRatio * (endY[index] - startY[index]);
      const trackHeight = this.drawer.trackHeaderSettings.height + track.maxGroupHeaderHeight + rectHeight;

      track.rect.left = selectedTracks.length > 1 ? currentLeft : trackPadding;
      track.setHeight(trackHeight);

      if (selectedTracks.length > 1) {
        currentLeft += track.rect.width + (index < selectedTracks.length - 1 ? this.stage.correlations.getWidth() : 0);
      }
    });

    this.stage.correlations.updateRects(selectedTracks);
    this.stage.render();
  }

  private restoreOriginalValues(selectedTracks: CaratTrack[], originalValues: any[]) {
    selectedTracks.forEach((track, index) => {
      track.viewport.y = originalValues[index].y;
      track.rect.left = originalValues[index].left;
      track.setHeight(originalValues[index].height);
    });
  }

  private renderConstruction(canvasStage: HTMLCanvasElement) {
    const canvas = document.createElement('canvas');
    canvas.width = canvasStage.width;
    canvas.height = canvasStage.height;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(canvasStage, 0, 0);
    return canvas;
  }

  private renderTracks(options: CaratExportOptions,) {
    const {startDepth, transparent, selectedTrack} = options;
    const {width, height, startY, endY} = this.getCanvasSize(options);
    const trackPadding = this.drawer.trackBodySettings.padding;
    const {maxArea, maxWidth, maxHeight} = getBrowserSize();

    const canvas = this.createCanvas(width, height);
    const currentArea = canvas.width * canvas.height;

    if (canvas.width <= maxWidth && canvas.height <= maxHeight && currentArea <= maxArea) {
      CaratDrawer.ratio = Math.min(2, maxHeight / height);
    } else {
      CaratDrawer.ratio = Math.min(1, maxArea / (width * height));
    }

    canvas.width = width * CaratDrawer.ratio;
    canvas.height = height * CaratDrawer.ratio;

    const ctx = canvas.getContext('2d');
    this.drawer.setContext(ctx);
    if (!transparent) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const originalValues = this.getOriginalValues(selectedTrack);

    if (selectedTrack.length === 1) {
      this.renderSingleTrack(selectedTrack[0], startDepth as number, startY[0], endY[0], trackPadding);
    } else {
      this.renderAllTracks(selectedTrack, startY, endY, trackPadding);
    }

    this.restoreOriginalValues(selectedTrack, originalValues);
    return canvas;
  }

  public renderCaratImage(options?: CaratExportOptions, canvasStage?: HTMLCanvasElement) {
    return this.stage.getActiveTrack().constructionMode
    ? this.renderConstruction(canvasStage)
    : this.renderTracks(options)
  }
}
