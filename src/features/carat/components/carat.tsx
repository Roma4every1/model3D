import { KeyboardEvent, MouseEvent, WheelEvent } from 'react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { compareObjects } from 'shared/lib';
import { currentWellIDSelector } from 'entities/parameters';
import { channelDictSelector } from 'entities/channels';
import { TextInfo } from 'shared/ui';

import './carat.scss';
import { caratStateSelector } from '../store/carats.selectors';
import { setCaratData } from '../store/carats.thunks';
import { setCaratActiveCurve, setCaratActiveGroup, setCaratCanvas } from '../store/carats.actions';


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
    dispatch(setCaratData(id, channelData));
  }, [channelData]); // eslint-disable-line

  // обновление ссылки на холст
  useLayoutEffect(() => {
    if (canvasRef.current === canvas) return;
    dispatch(setCaratCanvas(id, canvasRef.current));
  });

  if (wellID === null) {
    return <TextInfo text={'carat.empty'}/>;
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const changed = stage.handleKeyDown(e.nativeEvent.key);
    if (changed) stage.render();
  };

  const onMouseDown = (e: MouseEvent) => {
    const { offsetX: x, offsetY: y } = e.nativeEvent;
    const result = stage.handleMouseDown({x, y});
    if (!result) return;
    isOnMoveRef.current = true; stage.render();
    dispatch(setCaratActiveGroup(id, stage.getActiveTrack().getActiveGroup()));
    if (typeof result === 'object') dispatch(setCaratActiveCurve(id, result));
  };

  const onMouseUp = () => {
    isOnMoveRef.current = false;
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isOnMoveRef.current) return;
    stage.handleMouseMove(e.nativeEvent.movementY);
  };

  const onWheel = (e: WheelEvent) => {
    if (e.ctrlKey) return;
    const direction = e.deltaY > 0 ? 1 : -1;
    const { offsetX: x, offsetY: y } = e.nativeEvent;
    stage.handleMouseWheel({x, y}, direction);
  };

  return (
    <div className={'carat-container'}>
      <canvas
        ref={canvasRef} tabIndex={0} onKeyDown={onKeyDown}
        onMouseDown={onMouseDown} onMouseUp={onMouseUp}
        onMouseMove={onMouseMove} onWheel={onWheel}
      />
    </div>
  );
};
