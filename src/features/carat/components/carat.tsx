import { MouseEvent, WheelEvent } from 'react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { compareObjects} from 'shared/lib';
import { currentWellIDSelector } from 'entities/parameters';
import { channelDictSelector } from 'entities/channels';
import { caratStateSelector } from '../store/carats.selectors';
import { setCaratCanvas } from '../store/carats.actions';


/** Каротажная диаграмма. */
export const Carat = ({id, channels}: FormState) => {
  const dispatch = useDispatch();

  const wellID = useSelector(currentWellIDSelector);
  const { stage, canvas, lookupNames }: CaratState = useSelector(caratStateSelector.bind(id));

  const channelData: ChannelDict = useSelector(channelDictSelector.bind(channels), compareObjects);
  const lookupData: ChannelDict = useSelector(channelDictSelector.bind(lookupNames), compareObjects);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isOnMoveRef = useRef<boolean>(false);

  // обновление данных каналов-справочников
  useEffect(() => {
    stage.setLookupData(lookupData);
    stage.render();
  }, [lookupData, stage]);

  // обновление данных каналов и активной скважины
  useEffect(() => {
    stage.setWell(wellID);
    stage.setChannelData(channelData); stage.render();
    stage.setCurveData(channelData).then(() => stage.render());
  }, [channelData, wellID, stage]);

  // обновление ссылки на холст
  useLayoutEffect(() => {
    const currentCanvas = canvasRef.current;
    if (!currentCanvas || currentCanvas === canvas) return;
    dispatch(setCaratCanvas(id, currentCanvas));
  });

  const onMouseDown = (e: MouseEvent) => {
    const { offsetX: x, offsetY: y } = e.nativeEvent;
    const isIntersect = stage.handleMouseDown(x, y);
    if (isIntersect) { isOnMoveRef.current = true; stage.render(); }
  };

  const onMouseUp = () => {
    isOnMoveRef.current = false;
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isOnMoveRef.current) return;
    stage.handleMouseMove(e.nativeEvent.movementY);
  };

  const onWheel = (e: WheelEvent) => {
    const by = e.deltaY > 0 ? 5 : -5;
    const { offsetX: x, offsetY: y } = e.nativeEvent;
    stage.handleMouseWheel(x, y, by);
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
