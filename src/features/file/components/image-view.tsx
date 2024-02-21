import { useLayoutEffect, useRef, useCallback } from 'react';
import { ImageViewport } from '../lib/image-viewport';


export const ImageView = ({fileName, uri}: FileViewModel) => {
  const containerRef = useRef<HTMLDivElement>();
  const imageRef = useRef<HTMLImageElement>();
  const viewportRef = useRef<ImageViewport>();

  useLayoutEffect(() => {
    if (!viewportRef.current) {
      viewportRef.current = new ImageViewport(imageRef.current);
    }
  }, []);

  const onWheel = useCallback((event: WheelEvent) => {
    viewportRef.current.handleWheel(event);
    event.preventDefault();
  },[]);

  const onMouseMove = useCallback((event: MouseEvent) => {
    viewportRef.current.handleMouseMove(event);
    event.preventDefault();
  }, []);

  // через onWheel нельзя из-за passive: false
  useLayoutEffect(() => {
    const container = containerRef.current;
    container.addEventListener('wheel', onWheel, {passive: false});
    container.addEventListener('mousemove', onMouseMove, {passive: false});

    return () => {
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('mousemove', onMouseMove);
    };
  }, [onWheel, onMouseMove]);

  const onMouseDown = () => viewportRef.current.handleMouseDown();
  const onMouseUpOrLeave = () => viewportRef.current.handleMouseUpOrLeave();

  // контейнер нужен для корректного получения .offsetX и .offsetY у MouseEvent
  return (
    <div className={'file-view-image'}>
      <img alt={fileName} src={uri} ref={imageRef}/>
      <div
        ref={containerRef} onMouseLeave={onMouseUpOrLeave}
        onMouseDown={onMouseDown} onMouseUp={onMouseUpOrLeave}
      />
    </div>
  );
};
