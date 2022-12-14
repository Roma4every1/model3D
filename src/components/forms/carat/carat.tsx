import { useEffect, useLayoutEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectors, actions } from "../../../store";
import { CaratDrawer } from "./drawer";


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
  const drawerRef = useRef<CaratDrawer>(null);

  useEffect(() => {
    if (!caratState) dispatch(actions.createCaratState(formID));
  }, [caratState, formID, dispatch]);

  useEffect(() => {
    if (caratState?.columns) drawerRef.current?.render(caratState.columns);
  }, [caratState?.columns]);

  // обновление ссылки на холст
  useLayoutEffect(() => {
    const currentCanvas = canvasRef.current;
    if (!currentCanvas || currentCanvas === canvas) return;
    drawerRef.current
      ? drawerRef.current.setCanvas(currentCanvas)
      : drawerRef.current = new CaratDrawer(currentCanvas);
    dispatch(actions.setCaratCanvas(formID, currentCanvas));
  });

  return (
    <div className={'carat-container'}>
      <canvas ref={canvasRef}/>
    </div>
  );
}
