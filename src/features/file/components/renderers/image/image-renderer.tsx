import './../renderers.scss' 
import {useCallback, useEffect, useRef, useState} from "react";
import {zoomImage} from "../../../lib/utils.ts";

export const ImageRenderer = ({model}: FileRendererProps) => {
  const objectURL = model.fileType !== 'svg' ?
    URL.createObjectURL(model.data) :
    URL.createObjectURL(new Blob([model.data], { type: 'image/svg+xml' }));

  let containerRef = useRef();
  let imageRef = useRef();

  const [currentZoom, setCurrentZoom] = useState(1);

  const onWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    zoomImage(direction, currentZoom, setCurrentZoom, imageRef?.current);
  },[currentZoom, setCurrentZoom]);

  useEffect(()=>{
    if (!containerRef) return;
    const container: HTMLElement = containerRef.current;
    container.addEventListener('wheel', onWheel);
    return () => container.removeEventListener('wheel', onWheel);
  }, [containerRef, onWheel]);

  return (
    <div id={'imageRendererContainer'} ref={containerRef}>
      <img id={'imageRenderer'} alt={model.fileName} src={objectURL} ref={imageRef} />
    </div>
  );
};
