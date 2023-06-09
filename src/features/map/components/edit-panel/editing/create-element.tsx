import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { MapModes } from '../../../lib/enums';
import { clientPoint, listenerOptions } from '../../../lib/map-utils';
import { polylineByLegends, getDefaultSign, getDefaultLabel } from './editing-utils';
import {
  createMapElement,
  startMapEditing,
  setEditMode,
  acceptCreatingElement
} from '../../../store/maps.actions';

const creatingElementTypes: MapElementType[] = ['polyline', 'sign', 'label'];
const hasPropertiesWindow: MapElementType[] = ['polyline', 'label'];

interface CreateElementProps {
  mapState: MapState,
  formID: FormID,
  creatingType: MapElementType,
  showPropertiesWindow?
}

const defaultSignProto: SignImageProto = {fontName: 'PNT.CHR', symbolCode: 68, color: '#DDDDDD'}


export const CreateElement = ({mapState, formID, creatingType, showPropertiesWindow}: CreateElementProps) => {
  const dispatch = useDispatch();
  if (mapState.mode !== MapModes.AWAIT_POINT) {
    dispatch(setEditMode(formID, MapModes.AWAIT_POINT));
  }

  const { activeLayer, legends, canvas } = mapState;

  const [defaultSignImage, setDefaultSignImage] = useState<HTMLImageElement>(null);

  const signProto = useMemo<SignImageProto>(() => {
    for (const e of activeLayer.elements) {
      if (e.type === 'sign') return {fontName: e.fontname, symbolCode: 0, color: e.color};
    }
    return defaultSignProto;
  }, [activeLayer]);

  useEffect(() => {
    const { fontName, symbolCode, color } = signProto;
    mapState.drawer.getSignImage(fontName, symbolCode, color).then((img) => {
      setDefaultSignImage(img);
    });
  }, [mapState.drawer, signProto])

  const createElement = useCallback((type: MapElementType, point: ClientPoint) => {
    let defaultElement;
    if (type === 'sign') defaultElement = getDefaultSign(point, defaultSignImage, signProto);
    if (type === 'label') defaultElement = getDefaultLabel(point, 'текст');
    if (type === 'polyline') defaultElement = polylineByLegends(point, legends, activeLayer?.name);
    if (!defaultElement) return;
    dispatch(createMapElement(formID, defaultElement));
    if (type === 'sign' || type === 'label') {
      if (hasPropertiesWindow.includes(creatingType)) showPropertiesWindow();
      else dispatch(acceptCreatingElement(formID));
    }
    dispatch(startMapEditing(formID));
  }, [defaultSignImage, signProto, legends, activeLayer, dispatch, formID]);

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

  return <div></div>;
}
