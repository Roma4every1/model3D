import { useEffect, useLayoutEffect, useRef, useCallback } from 'react';


export const ImageView = ({fileName, uri}: FileViewModel) => {
  const containerRef = useRef<HTMLDivElement>();
  const imageRef = useRef<HTMLImageElement>();
  const zoomRef = useRef(1);

  // вернуть масштаб в исходное положение при смене картинки
  useEffect(() => {
    zoomRef.current = 1;
    imageRef.current.style.transform = 'scale(1)';
  }, [fileName]);

  const onWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = zoomRef.current + delta;
    if (newZoom < 1 || newZoom > 3) return;
    zoomRef.current = newZoom;
    imageRef.current.style.transform = `scale(${newZoom})`;
  },[]);

  // через onWheel нельзя из-за passive: false
  useLayoutEffect(() => {
    const container = containerRef.current;
    container.addEventListener('wheel', onWheel, {passive: false});
    return () => container.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  return (
    <div className={'file-view-image'} ref={containerRef}>
      <img alt={fileName} src={uri} ref={imageRef}/>
    </div>
  );
};
