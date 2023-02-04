import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { TFunction, useTranslation } from 'react-i18next';
import { MapModes } from '../../enums';
import { clientPoint, listenerOptions } from '../../map-utils';
import { polylineByLegends, getDefaultSign, getDefaultLabel } from './editing-utils';
import { actions } from '../../../../../store';

import createPolylineIcon from '../../../../../assets/images/map/create-polyline.png';
import createLabelIcon from '../../../../../assets/images/map/create-label.png';
import createSignIcon from '../../../../../assets/images/map/create-sign.png';


interface CreateElementProps {
  mapState: MapState,
  formID: FormID,
}
interface CreateItemProps {
  ownType: MapElementType,
  selected: boolean,
  action: () => void,
  t: TFunction,
}


/** Иконки создания новых элементов карты. */
const mapCreatingIcons: ImagesDict<'polyline' | 'label' | 'sign'> = {
  'polyline': createPolylineIcon,
  'label': createLabelIcon,
  'sign': createSignIcon,
};

const creatingElementTypes: MapElementType[] = ['polyline', 'sign', 'label'];
const defaultSignProto: SignImageProto = {fontName: 'PNT.CHR', symbolCode: 68, color: '#DDDDDD'}

const CreateItem = ({ownType, selected, action, t}: CreateItemProps) => {
  const src = mapCreatingIcons[ownType], title = t('map.creating.' + ownType);
  return (
    <button className={'map-panel-button' + (selected ? ' selected' : '')} title={title} onClick={action}>
      <img src={src} alt={'create-' + ownType}/>
    </button>
  );
}


export const CreateElement = ({mapState, formID}: CreateElementProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { activeLayer, legends, canvas } = mapState;

  const [defaultSignImage, setDefaultSignImage] = useState<HTMLImageElement>(null);
  const [selectedType, setSelectedType] = useState<MapElementType>(null);

  const signProto = useMemo<SignImageProto>(() => {
    for (const e of activeLayer.elements) {
      if (e.type === 'sign') return {fontName: e.fontname, symbolCode: e.symbolcode, color: e.color};
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
    dispatch(actions.createMapElement(formID, defaultElement));
    dispatch(actions.startMapEditing(formID));
  }, [defaultSignImage, signProto, legends, activeLayer, dispatch, formID]);

  const mapCreatingTypes = useCallback((type: MapElementType) => {
    const action = () => {
      setSelectedType(type);

      if (mapState.mode !== MapModes.AWAIT_POINT) {
        dispatch(actions.setEditMode(formID, MapModes.AWAIT_POINT));
      }
    }
    return <CreateItem key={type} ownType={type} selected={selectedType === type} action={action} t={t}/>
  }, [mapState.mode, selectedType, t, dispatch, formID]);

  const mouseUp = useCallback((event: MouseEvent) => {
    if (mapState.mode !== MapModes.AWAIT_POINT) return;
    const point = mapState.utils.pointToMap(clientPoint(event));
    point.x = Math.round(point.x);
    point.y = Math.round(point.y);
    createElement(selectedType, point);
  }, [mapState.utils, mapState.mode, createElement, selectedType]);

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

  return <div>{creatingElementTypes.map(mapCreatingTypes)}</div>;
}
