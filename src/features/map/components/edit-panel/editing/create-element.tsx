import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { MapModes } from '../../../lib/enums';
import { clientPoint, listenerOptions } from '../../../lib/map-utils';
import { polylineByLegends, getDefaultSign, getDefaultLabel } from './editing-utils';
import { createMapElement, startMapEditing, acceptCreatingElement } from '../../../store/maps.actions';

const creatingElementTypes: MapElementType[] = ['polyline', 'sign', 'label'];
const hasPropertiesWindow: MapElementType[] = ['polyline', 'label'];
const signProto = {fontName: 'PNT.CHR', symbolCode: 0, color: '#000000'};

interface CreateElementProps {
  mapState: MapState,
  formID: FormID,
  creatingType: MapElementType,
  showPropertiesWindow?
}

export const CreateElement = ({mapState, formID, creatingType, showPropertiesWindow}: CreateElementProps) => {
  const dispatch = useDispatch();

  const { activeLayer, legends, canvas } = mapState;
  const [defaultSignImage, setDefaultSignImage] = useState<HTMLImageElement>(null);

  useEffect(() => {
    const { fontName, symbolCode, color } = signProto;
    mapState.drawer.getSignImage(fontName, symbolCode, color).then((img) => {
      setDefaultSignImage(img);
    });
  }, [mapState.drawer]);

  const createElement = useCallback((type: MapElementType, point: Point) => {
    let defaultElement;
    if (type === 'sign') defaultElement = getDefaultSign(point, defaultSignImage, signProto);
    if (type === 'label') defaultElement = getDefaultLabel(point, 'текст');
    if (type === 'polyline') defaultElement = polylineByLegends(point, legends, activeLayer?.name);
    if (!defaultElement) return;
    dispatch(createMapElement(formID, defaultElement));
    dispatch(startMapEditing(formID));
    if (type === 'sign' || type === 'label') {
      if (hasPropertiesWindow.includes(creatingType)) showPropertiesWindow();
      else {
        dispatch(acceptCreatingElement(formID));
      }
    }
  }, [defaultSignImage, legends, activeLayer, creatingType, showPropertiesWindow, dispatch, formID]);

  const mouseUp = useCallback((event: MouseEvent) => {
    if (creatingElementTypes.indexOf(creatingType) === -1) {
      return;
    }
    if (mapState.mode !== MapModes.AWAIT_POINT) return;
    const point = mapState.utils.pointToMap(clientPoint(event));
    point.x = Math.round(point.x);
    point.y = Math.round(point.y);
    createElement(creatingType, point);
  }, [mapState.utils, mapState.mode, createElement, creatingType]);

  useEffect(() => {
    if (canvas) {
      canvas.addEventListener('mouseup', mouseUp, listenerOptions);
    }
    return () => {
      if (canvas) {
        canvas.removeEventListener('mouseup', mouseUp);
      }
    }
  }, [canvas, mouseUp]);

  return <div/>;
}
