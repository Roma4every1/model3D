import './../renderers.scss'
import {useRef} from "react";

export const TXTRenderer = ({model}: FileRendererProps) => {
  const reader = new FileReader();
  reader.readAsText(model.data);
  let containerRef = useRef<HTMLDivElement>(null);
  reader.onload = () => {
    if (containerRef.current) containerRef.current.innerHTML = reader.result as string;
  };
  return (
    <div className={'basicRenderer'} ref={containerRef} />
  );
};
