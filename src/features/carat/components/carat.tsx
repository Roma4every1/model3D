import { MouseEvent, WheelEvent } from 'react';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { compareObjects} from 'shared/lib';
import { currentWellIDSelector } from 'entities/parameters';
import { channelDictSelector, channelSelector } from 'entities/channels';

// import { findStrataAppearanceInfo } from '../lib/channels';
import { caratStateSelector } from '../store/carats.selectors';
import { setCaratCanvas } from '../store/carats.actions';


/** Каротажная диаграмма. */
export const Carat = ({id, channels}: FormState) => {
  const dispatch = useDispatch();

  const { stage, canvas }: CaratState = useSelector(caratStateSelector.bind(id));
  const channelData: ChannelDict = useSelector(channelDictSelector.bind(channels), compareObjects);

  const wellID = useSelector(currentWellIDSelector);
  // const strataChannel: Channel = useSelector(channelSelector.bind('colColorSpr'));

  // const strataAppearanceInfo = useMemo(() => {
  //   return findStrataAppearanceInfo(strataChannel);
  // }, [strataChannel]);

  // console.log(strataAppearanceInfo);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isOnMoveRef = useRef<boolean>(false);
  const observer = useRef<ResizeObserver>();

  // обновление данных каналов и активной скважины
  useEffect(() => {
    stage.setWell(wellID);
    stage.setChannelData(channelData)
  }, [channelData, wellID, stage]);

  useEffect(() => {
    if (!observer.current) observer.current = new ResizeObserver(() => stage.resize());
    if (canvas) observer.current.observe(canvas);
    return () => { if (canvas) observer.current.unobserve(canvas); };
  }, [stage, canvas]);

  // обновление ссылки на холст
  useLayoutEffect(() => {
    const currentCanvas = canvasRef.current;
    if (!currentCanvas || currentCanvas === canvas) return;
    dispatch(setCaratCanvas(id, currentCanvas));
  });

  const onWheel = (e: WheelEvent) => {
    stage.handleMouseWheel(e.deltaY > 0 ? 5 : -5);
  };

  const onMouseDown = (e: MouseEvent) => {
    const { offsetX: x, offsetY: y } = e.nativeEvent;
    stage.handleMouseDown(x, y);
    isOnMoveRef.current = true;
  };

  const onMouseUp = () => {
    isOnMoveRef.current = false;
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isOnMoveRef.current) return;
    stage.handleMouseMove(e.nativeEvent.movementY);
  };

  return (
    <div className={'carat-container'}>
      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown} onMouseUp={onMouseUp}
        onMouseMove={onMouseMove} onWheel={onWheel}
      />
    </div>
  );
};
