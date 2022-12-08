import { useEffect, useLayoutEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectors, actions } from "../../../store";
import { drawCarat } from "./drawer";


// function caratSelector(this: ChannelName[], state: WState) {
//   console.log('state:', state);
//   return this.map(channel => state.channelsData[channel]);
// }

export default function Carat({data: {activeChannels, formId: formID}}) {
  const dispatch = useDispatch();

  const caratState: CaratState = useSelector(selectors.caratState.bind(formID));
  //const channels: any[] = useSelector(caratSelector.bind(activeChannels));

  const canvas = caratState?.canvas;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!caratState) dispatch(actions.createCaratState(formID));
  }, [caratState, formID, dispatch]);

  useLayoutEffect(() => {
    if (canvasRef.current && canvasRef.current !== canvas) {
      dispatch(actions.setCaratCanvas(formID, canvasRef.current));
    }
    drawCarat(canvasRef.current, 'well id');
  });

  return (
    <div className={'carat-container'}>
      <canvas ref={canvasRef}/>
    </div>
  );
}
