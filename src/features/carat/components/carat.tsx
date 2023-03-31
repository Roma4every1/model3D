import { MouseEvent, WheelEvent } from 'react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { compareObjects} from 'shared/lib';
import { currentWellIDSelector } from 'entities/parameters';
import { channelDictSelector } from 'entities/channels';

import { applyIndexesToModel } from '../lib/initialization';
import { getCaratIntervals } from '../lib/channels';
import { moveSmoothly } from '../lib/smooth-scroll';
import { caratStateSelector } from '../store/carats.selectors';
import { setCaratData, setCaratActiveColumn, setCaratCanvas } from '../store/carats.actions';


/** Каротажная диаграмма. */
export const Carat = ({id, channels}: FormState) => {
  const dispatch = useDispatch();

  const state: CaratState = useSelector(caratStateSelector.bind(id));
  const { model, data, drawer, canvas } = state;

  const viewport = model.getViewport();
  const columns = model.getColumns();

  const wellID = useSelector(currentWellIDSelector);
  const channelData: ChannelDict = useSelector(channelDictSelector.bind(channels), compareObjects);

  // console.log(channelData['Carottage curves'].data.rows.map((row) => {
  //   return row.Cells[5];
  // }));

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isOnMoveRef = useRef<boolean>(false);
  const observer = useRef<ResizeObserver>();

  useEffect(() => {
    let initY = Infinity;
    for (const channelName in data) {
      const dataModel = data[channelName];
      const datum = channelData[channelName].data;

      if (!datum?.columns) continue;
      if (!dataModel.applied) applyIndexesToModel(dataModel, datum.columns);

      const intervals = getCaratIntervals(datum.rows, dataModel.info);
      initY = Math.min(initY, ...intervals.map(i => i.top));
      dataModel.data = intervals;
    }
    viewport.y = initY === Infinity ? 0 : initY;
    dispatch(setCaratData(id, {...data}));
  }, [channelData]); // eslint-disable-line

  useEffect(() => {
    if (!observer.current) observer.current = new ResizeObserver(() => drawer.render());
    if (canvas) observer.current.observe(canvas);
    return () => { if (canvas) observer.current.unobserve(canvas); };
  }, [drawer, canvas]);

  useLayoutEffect(() => {
    drawer.render(wellID, viewport, columns, data);
  }, [viewport, columns, data, wellID, drawer]);

  // обновление ссылки на холст
  useLayoutEffect(() => {
    const currentCanvas = canvasRef.current;
    if (!currentCanvas || currentCanvas === canvas) return;
    drawer.setCanvas(currentCanvas);
    dispatch(setCaratCanvas(id, currentCanvas));
  });

  const onWheel = (e: WheelEvent) => {
    moveSmoothly(viewport, drawer, e.deltaY > 0 ? 5 : -5);
  };

  const onMouseDown = (e: MouseEvent) => {
    const xCoordinate = e.nativeEvent.offsetX;
    const idx = model.getColumnIndex(xCoordinate);

    if (idx !== -1) {
      model.setActiveColumn(idx); drawer.render();
      dispatch(setCaratActiveColumn(id, columns[idx]));
    }
    isOnMoveRef.current = true;
  };

  const onMouseUp = () => {
    isOnMoveRef.current = false;
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isOnMoveRef.current) return;
    viewport.y -= e.nativeEvent.movementY / viewport.scale;
    drawer.render();
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
