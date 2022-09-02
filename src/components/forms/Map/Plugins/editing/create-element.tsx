import { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { TFunction, useTranslation } from "react-i18next";

import { MapModes } from "../../enums";
import { clientPoint, listenerOptions } from "../../map-utils";
import { createDefaultElement, createDefaultSign } from "./editing-utils";
import { createMapElement, setEditMode } from "../../../../../store/actionCreators/maps.actions";
import { mapCreatingIcons, mapIconsDict } from "../../../../dicts/images";


interface CreateElementProps {
  mapState: MapState,
  formID: FormID,
}
interface CreateItemProps {
  ownType: CreatingElementType,
  selected: boolean,
  action: () => void,
  t: TFunction,
}
interface PointsInfoProps {
  points: ClientPoint[] | null,
  isPolyline: boolean,
}


// TODO: polygon
const creatingElementTypes: CreatingElementType[] = ['polyline', 'sign', 'label'];
const defaultSignProto: SignImageProto = {fontName: 'PNT.CHR', symbolCode: 68, color: '#DDDDDD'}

const CreateItem = ({ownType, selected, action, t}: CreateItemProps) => {
  const src = mapCreatingIcons[ownType], title = t('map.creating.' + ownType);
  return (
    <button className={selected ? 'selected' : undefined} title={title} onClick={action}>
      <img src={src} alt={'create-' + ownType}/>
    </button>
  );
}

const NoPoint = () => <div><i>не выбрана</i></div>;
const PointsInfo = ({points, isPolyline}: PointsInfoProps) => {
  if (!points) {
    return isPolyline ? <div><NoPoint/><NoPoint/></div> : <div><NoPoint/></div>;
  }

  const [p1, p2] = points;
  if (isPolyline) {
    return (
      <div>
        <div>({p1.x}, {p1.y})</div>
        {p2 ? <div>({p2.x}, {p2.y})</div> : <NoPoint/>}
      </div>
    );
  }
  return <div>({p1.x}, {p1.y})</div>;
}

export const CreateElement = ({mapState, formID}: CreateElementProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { activeLayer, legends, canvas } = mapState;

  const [defaultSignImage, setDefaultSignImage] = useState<HTMLImageElement>(null);
  const [selectedType, setSelectedType] = useState<CreatingElementType>(null);
  const [points, setPoints] = useState<ClientPoint[] | null>(null);

  const readyToCreate = useMemo<boolean>(() => {
    if (!points) return false;
    return points.length > (selectedType === 'polyline' ? 1 : 0);
  }, [selectedType, points]);

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

  const createElement = useCallback((type: CreatingElementType, points: ClientPoint[]) => {
    const defaultElement = type === 'sign'
      ? createDefaultSign(points[0], defaultSignImage, signProto)
      : createDefaultElement(type, points, legends, activeLayer?.name);
    dispatch(createMapElement(formID, defaultElement));
  }, [defaultSignImage, signProto, legends, activeLayer, dispatch, formID]);

  const mapCreatingTypes = useCallback((type: CreatingElementType) => {
    const action = () => {
      setSelectedType(type);

      if (mapState.mode !== MapModes.AWAIT_POINT) {
        dispatch(setEditMode(formID, MapModes.AWAIT_POINT));
      }
    }
    return <CreateItem key={type} ownType={type} selected={selectedType === type} action={action} t={t}/>
  }, [mapState.mode, selectedType, t, dispatch, formID]);

  const mouseDown = useCallback((event: MouseEvent) => {
    if (mapState.mode !== MapModes.AWAIT_POINT) return;
    const point = mapState.utils.pointToMap(clientPoint(event));
    point.x = Math.round(point.x);
    point.y = Math.round(point.y);

    if (!points || selectedType !== 'polyline') return setPoints([point]);
    if (points.length === 1) return setPoints([points[0], point]);
    if (points.length === 2) return setPoints([point]);
  }, [mapState.utils, mapState.mode, selectedType, points]);

  useEffect(() => {
    if (canvas) canvas.addEventListener('mousedown', mouseDown, listenerOptions);
    return () => {canvas.removeEventListener('mousedown', mouseDown)}
  }, [canvas, mouseDown]);

  return (
    <div className={'map-create-element'}>
      <div>
        <div>{t('map.creating.type')}</div>
        <div>{creatingElementTypes.map(mapCreatingTypes)}</div>
      </div>
      <div>&#10148;</div>
      <div>
        <div>{t('map.creating.points')}</div>
        <PointsInfo points={points} isPolyline={selectedType === 'polyline'}/>
      </div>
      <div>&#10148;</div>
      <div>
        <div>{t('map.creating.create')}</div>
        <button onClick={() => createElement(selectedType, points)} disabled={!readyToCreate}>
          <img src={mapIconsDict['accept']} alt={'accept'}/>
        </button>
      </div>
    </div>
  );
}
