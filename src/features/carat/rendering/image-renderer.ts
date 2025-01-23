import { CaratDrawer } from './drawer';
import { CaratStage } from './stage';
import { CaratTrack } from './track';
import { getCanvasConstraints } from '../lib/utils';


export class CaratImageRenderer {
  constructor(
    private readonly stage: CaratStage,
    private readonly drawer: CaratDrawer,
  ) {}

  public renderConstruction(): HTMLCanvasElement {
    const stageCanvas = this.stage.getCanvas();
    const canvas = document.createElement('canvas');
    canvas.width = stageCanvas.width;
    canvas.height = stageCanvas.height;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(stageCanvas, 0, 0);
    return canvas;
  }

  public renderTracks(options: CaratExportOptions): HTMLCanvasElement {
    const { width, height, startY, endY } = this.getCanvasSize(options);
    const { maxArea, maxWidth, maxHeight } = getCanvasConstraints();

    const canvas = document.createElement('canvas');
    canvas.width = width * CaratDrawer.ratio;
    canvas.height = height * CaratDrawer.ratio;
    const currentArea = canvas.width * canvas.height;

    if (canvas.width <= maxWidth && canvas.height <= maxHeight && currentArea <= maxArea) {
      CaratDrawer.ratio = Math.min(2, maxHeight / height);
    } else {
      CaratDrawer.ratio = Math.min(1, maxArea / (width * height));
    }
    canvas.width = width * CaratDrawer.ratio;
    canvas.height = height * CaratDrawer.ratio;

    this.drawer.setContext(canvas.getContext('2d'));
    if (options.selectedTrack) {
      const { startDepth, selectedTrack } = options;
      this.renderSingleTrack(selectedTrack, startDepth as number, startY[0], endY[0]);
    } else {
      this.renderAllTracks(startY, endY);
    }
    return canvas;
  }

  private getCanvasSize(options: CaratExportOptions) {
    const { startDepth, endDepth, selectedTrack } = options;
    const tracks: CaratTrack[] = selectedTrack ? [selectedTrack] : this.stage.trackList;

    const startY = Array.isArray(startDepth) ? startDepth : new Array(tracks.length).fill(startDepth);
    const endY = Array.isArray(endDepth) ? endDepth : new Array(tracks.length).fill(endDepth);

    const trackPadding = this.drawer.trackBodySettings.padding;
    const trackHeaderHeight = this.drawer.trackHeaderSettings.height;

    let trackTotalWidth = 0;
    for (const track of tracks) trackTotalWidth += track.rect.width;
    const correlationWidth = this.stage.correlations.getWidth() * (tracks.length - 1);
    const width = 2 * trackPadding + trackTotalWidth + correlationWidth;

    const maxDataHeight = Math.max(...tracks.map((track: CaratTrack, i: number) => {
      const dataHeight = track.viewport.scale * window.devicePixelRatio * (endY[i] - startY[i]);
      return track.maxGroupHeaderHeight + dataHeight;
    }));
    const height = 2 * trackPadding + trackHeaderHeight + maxDataHeight;
    return {width, height, startY, endY};
  }

  private renderSingleTrack(track: CaratTrack, startDepth: number, startY: number, endY: number): void {
    const initY = track.viewport.y;
    const initLeft = track.rect.left;
    const initHeight = track.rect.height;

    track.viewport.y = startY;
    const rectHeight = track.viewport.scale * window.devicePixelRatio * (endY - startY);
    const trackHeight = this.drawer.trackHeaderSettings.height + track.maxGroupHeaderHeight + rectHeight;

    track.setHeight(trackHeight);
    track.rect.left = this.drawer.trackBodySettings.padding;
    track.viewport.y = startDepth;
    track.render();

    track.viewport.y = initY;
    track.rect.left = initLeft;
    track.setHeight(initHeight);
  }

  private renderAllTracks(startY: number[], endY: number[]): void {
    const tracks = this.stage.trackList;
    const headerHeight = this.drawer.trackHeaderSettings.height;

    const originalValues = tracks.map(track => ({
      y: track.viewport.y,
      height: track.rect.height,
    }));

    tracks.forEach((track: CaratTrack, i: number) => {
      track.viewport.y = startY[i];
      const rectHeight = track.viewport.scale * window.devicePixelRatio * (endY[i] - startY[i]);
      track.setHeight(headerHeight + track.maxGroupHeaderHeight + rectHeight);
    });
    this.stage.correlations.updateRects(tracks);

    this.drawer.clear();
    this.stage.correlations.renderForImage();
    for (const track of this.stage.trackList) track.render();

    tracks.forEach((track: CaratTrack, i: number) => {
      track.viewport.y = originalValues[i].y;
      track.setHeight(originalValues[i].height);
    });
    this.stage.correlations.updateRects(tracks);
  }
}
