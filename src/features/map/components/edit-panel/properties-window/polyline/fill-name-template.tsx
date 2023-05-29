import { useLayoutEffect, useRef } from 'react';
import { polylineType } from '../../selecting/selecting-utils';


const width = 40;
const height = 20;

export const FillNameTemplate = ({fillName, fillColor, bkColor, transparent}) => {
  useLayoutEffect(() => {
    let ignore = false;
    let context = canvasRef.current.getContext('2d');
    context.clearRect(0, 0, width, height);

    async function fetchData() {
      if (!fillName) return;
      context.beginPath();
      let image = await polylineType.getPattern(fillName, fillColor, transparent ? 'none' : (bkColor ?? 'none'));
      if (!ignore) {
        if (typeof image === 'string') {
          if (transparent) {
            image = image.substring(0, image.length - 2);
            image += '0.3)';
          }
          context.fillStyle = image;
        } else {
          context.fillStyle = context.createPattern(image, 'repeat');
        }
        context.rect(0, 0, width, height);
        context.fill();
      }
    }
    fetchData();
    return () => { ignore = true; }
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  return <canvas ref={canvasRef} width={width} height={height}/>;
}
