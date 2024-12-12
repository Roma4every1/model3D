import { CaratDrawer } from './drawer';
import { CaratStage } from './stage';
import { getBrowserSize } from '../lib/utils';

export class CaratImageRengering {
  /** Отрисовщик. */
  public readonly drawer: CaratDrawer;
  /** Сцена диаграммы. */
  public readonly stage: CaratStage;

  constructor(stage:  CaratStage, drawer: CaratDrawer) {
    this.stage = stage;
    this.drawer = drawer;
  }

  public caratImage(options: CaratExportOptions) {
    const {startDepth, endDepth, transparent, selectedTrack} = options;
    const trackPadding = this.drawer.trackBodySettings.padding;
    const trackHeaderHeight = this.drawer.trackHeaderSettings.height;
    const {maxArea, maxWidth, maxHeight} = getBrowserSize();

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

    const ctx = canvas.getContext('2d');
    this.drawer.setContext(ctx);
    if (!transparent) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    let currentLeft = trackPadding;

    const originalValues = selectedTrack.map((track) => ({
      y: track.viewport.y,
      left: track.rect.left,
      height: track.rect.height,
    }));

    if (selectedTrack.length === 1) {
      const track = selectedTrack[0];

      track.viewport.y = startY;
      const rectHeight = track.viewport.scale * window.devicePixelRatio * (endY[0] - startY[0]);
      const trackHeight = trackHeaderHeight + track.maxGroupHeaderHeight + rectHeight;

      track.setHeight(trackHeight);
      track.rect.left = trackPadding;
      track.viewport.y = startDepth;
      track.render();

    } else {
      selectedTrack.forEach((track, index) => {
        track.viewport.y = startY[index];
        const rectHeight = track.viewport.scale * window.devicePixelRatio * (endY[index] - startY[index]);
        const trackHeight = trackHeaderHeight + track.maxGroupHeaderHeight + rectHeight;

        track.rect.left = selectedTrack.length > 1 ? currentLeft : trackPadding;
        track.setHeight(trackHeight);

        if (selectedTrack.length > 1) {
          currentLeft += track.rect.width + (index < selectedTrack.length - 1 ? this.stage.correlations.getWidth() : 0);
        }
      })
      this.stage.correlations.updateRects(selectedTrack);
      this.stage.render();
    }

    selectedTrack.forEach((track, index) => {
      track.viewport.y = originalValues[index].y;
      track.rect.left = originalValues[index].left;
      track.setHeight(originalValues[index].height);
    });

    return canvas;
  }
}
