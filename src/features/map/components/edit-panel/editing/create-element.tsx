import { useEffect } from 'react';
import { useDispatch } from 'shared/lib';
import { MapMode } from '../../../lib/constants.ts';
import { clientPoint, listenerOptions } from '../../../lib/map-utils';
import { getDefaultMapElement } from './editing-utils';
import { createMapElement, startMapEditing } from '../../../store/map.actions';
import { showMapPropertyWindow } from '../../../store/map.thunks.ts';


interface CreateElementProps {
  formID: FormID;
  mapState: MapState;
  creatingType: MapElementType;
}


export const CreateElement = ({formID, mapState, creatingType}: CreateElementProps) => {
  const dispatch = useDispatch();
  const { canvas, mode, utils } = mapState;

  const mouseUp = (event: MouseEvent) => {
    if (mode !== MapMode.AWAIT_POINT) return;
    if (creatingType !== 'polyline' && creatingType !== 'sign' && creatingType !== 'label') return;

    const point = utils.pointToMap(clientPoint(event));
    point.x = Math.round(point.x);
    point.y = Math.round(point.y);
    const element = getDefaultMapElement(creatingType, point);

    dispatch(createMapElement(formID, element));
    dispatch(startMapEditing(formID));

    if (creatingType === 'sign' || creatingType === 'label') {
      dispatch(showMapPropertyWindow(formID, element));
    }
  };

  useEffect(() => {
    if (canvas) canvas.addEventListener('mouseup', mouseUp, listenerOptions);
    return () => { if (canvas) canvas.removeEventListener('mouseup', mouseUp); }
  });

  return <div/>;
};
