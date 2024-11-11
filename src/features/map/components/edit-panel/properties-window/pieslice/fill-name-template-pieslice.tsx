import { useLayoutEffect, useRef } from 'react';
import { fillPatterns } from 'shared/drawing';


export const FillNameTemplate = ({fillName, fillColor, bkColor, transparent}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const background = transparent ? 'none' : (bkColor ?? 'none');
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = fillPatterns.createFillStyle(fillName, fillColor, background);
    ctx.fillRect(0, 0, 50, 20);
  });

  return <canvas ref={canvasRef} style={{marginTop: 6}} width={50} height={20}/>;
}
