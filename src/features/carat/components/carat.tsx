import { KeyboardEvent, MouseEvent, WheelEvent } from 'react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { compareObjects } from 'shared/lib';
import { channelDataDictSelector } from 'entities/channels';
import { wellStateSelector, traceStateSelector, stratumStateSelector } from 'entities/objects';
import { TextInfo } from 'shared/ui';

import './carat.scss';
import { channelDataDictToRecords } from '../lib/channels';
import { caratStateSelector } from '../store/carat.selectors';
import { setCaratData } from '../store/carat.thunks';
import { setCaratActiveCurve, setCaratActiveGroup, setCaratCanvas } from '../store/carat.actions';


/** Каротажная диаграмма. */
export const Carat = ({id}: FormState) => {
  const dispatch = useDispatch();
  const { model: currentWell } = useSelector(wellStateSelector);
  const { model: currentTrace } = useSelector(traceStateSelector);
  const { model: currentStratum } = useSelector(stratumStateSelector);

  const caratState: CaratState = useSelector(caratStateSelector.bind(id));
  const { stage, canvas, channelNames, lookupNames, loading } = caratState;

  const channelData: ChannelDataDict =
    useSelector(channelDataDictSelector.bind(channelNames), compareObjects);
  const lookupData: ChannelDataDict =
    useSelector(channelDataDictSelector.bind(lookupNames), compareObjects);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isOnMoveRef = useRef<boolean>(false);

  // обновление данных каналов-справочников
  useEffect(() => {
    stage.setLookupData(channelDataDictToRecords(lookupData));
    stage.render();
  }, [lookupData, stage]);

  // обновление данных каналов
  useEffect(() => {
    dispatch(setCaratData(id, channelData));
  }, [channelData, currentWell, currentTrace, id, dispatch]);

  useEffect(() => {
    if (loading || !currentStratum) return;
    stage.alignByStratum(currentStratum.id, true);
    stage.render();
  }, [currentStratum, loading, stage]);

  // обновление ссылки на холст
  useLayoutEffect(() => {
    if (canvasRef.current === canvas) return;
    dispatch(setCaratCanvas(id, canvasRef.current));
  });

  if (loading) {
    return <TextInfo text={'carat.loading'}/>;
  }
  if (!currentWell && !currentTrace) {
    return <TextInfo text={'carat.no-data'}/>;
  }
  if (currentTrace && currentTrace.nodes.length === 0) {
    return <TextInfo text={'carat.no-nodes'}/>;
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const changed = stage.handleKeyDown(e.nativeEvent.key);
    if (changed) stage.render();
  };

  const onMouseDown = (e: MouseEvent) => {
    isOnMoveRef.current = true;
    const { offsetX: x, offsetY: y } = e.nativeEvent;

    const result = stage.handleMouseDown({x, y});
    if (result) {
      stage.render();
      dispatch(setCaratActiveGroup(id, stage.getActiveTrack().getActiveGroup()));
      if (typeof result === 'object') dispatch(setCaratActiveCurve(id, result));
    }
  };

  const onMouseUp = () => {
    isOnMoveRef.current = false;
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isOnMoveRef.current) return;
    const { offsetX: x, offsetY: y } = e.nativeEvent;
    stage.handleMouseMove({x, y}, e.nativeEvent.movementY);
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
