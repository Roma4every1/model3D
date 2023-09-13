import {imageZoomStepSize, maxImageZoom, minImageZoom} from "./constants.ts"

/** Функция для приближения изображения */
export const zoomImage = (
    direction: number,
    zoom: number,
    setCurrentZoom: (value: number) => void,
    image: HTMLImageElement) => {

  if (!image) return;
  let newZoom = zoom + direction * imageZoomStepSize;
  if (newZoom < minImageZoom || newZoom > maxImageZoom) {
    return;
  }
  setCurrentZoom(newZoom);
  image.style.transform = 'scale(' + zoom + ')';
}
