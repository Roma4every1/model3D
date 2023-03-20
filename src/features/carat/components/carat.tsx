import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { compareArrays } from 'shared/lib';
import { currentWellIDSelector } from 'entities/parameters';
import { channelsSelector } from 'entities/channels';
import { caratStateSelector } from '../store/carats.selectors';
import { setCaratCanvas } from '../store/carats.actions';
import { CaratDrawer, CaratRenderData } from '../drawer/drawer';


export const Carat = ({id: formID, channels}: FormState) => {
  const dispatch = useDispatch();

  const caratState: CaratState = useSelector(caratStateSelector.bind(formID));
  const wellID = useSelector(currentWellIDSelector);
  const channelData: Channel[] = useSelector(channelsSelector.bind(channels), compareArrays);

  // const lookupChannelNames = useMemo(() => {
  //   const result = [];
  //   channelData.forEach(channel => result.push(...channel.info.lookupChannels));
  //   return result;
  // }, [channelData]);

  // const lookupChannelData = useSelector(channelsSelector.bind(lookupChannelNames), compareArrays);

  console.log(channelData);
  // console.log(lookupChannelData);
  // console.log([...channelData, ...lookupChannelData].map(c => c.info.displayName))

  const canvas = caratState?.canvas;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawerRef = useRef<CaratDrawer>(new CaratDrawer());

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
    dispatch(setCaratCanvas(formID, currentCanvas));
  });

  return (
    <div className={'carat-container'}>
      <canvas ref={canvasRef}/>
    </div>
  );
};
