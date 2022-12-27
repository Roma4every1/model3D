import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectors, actions } from "../../../store";
import { CaratDrawer, CaratRenderData } from "./drawer";


// function caratSelector(this: ChannelName[], state: WState) {
//   console.log('state:', state);
//   return this.map(channel => state.channelsData[channel]);
// }


export default function Carat({data: {formId: formID}}) {
  const dispatch = useDispatch();

  const caratState: CaratState = useSelector(selectors.caratState.bind(formID));
  //const settings = useSelector(selectors.formSettings.bind(formID));
  const wellID = useSelector(selectors.currentWellID);
  //const channels: any[] = useSelector(caratSelector.bind(activeChannels));
  //console.log(settings);

  const canvas = caratState?.canvas;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawerRef = useRef<CaratDrawer>(new CaratDrawer());

  useEffect(() => {
    if (!caratState) dispatch(actions.createCaratState(formID));
  }, [caratState, formID, dispatch]);

  const renderData = useMemo<CaratRenderData>(() => {
    return {wellID, columns: caratState?.columns}
  }, [caratState, wellID]);

  useEffect(() => {
    drawerRef.current.render(renderData);
  }, [renderData]);

  // обновление ссылки на холст
  useLayoutEffect(() => {
    const currentCanvas = canvasRef.current;
    if (!currentCanvas || currentCanvas === canvas || !caratState) return;
    drawerRef.current.setCanvas(currentCanvas);
    dispatch(actions.setCaratCanvas(formID, currentCanvas));
  });

  return (
    <div className={'carat-container'}>
      <canvas ref={canvasRef}/>
    </div>
  );
}
