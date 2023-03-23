import {BigButton} from "../../../../../../shared/ui";
import {useCallback, useEffect} from "react";
import {MapModes} from "../../../../lib/enums";
import {clientPoint, listenerOptions} from "../../../../lib/map-utils";
import {
  createMapElement,
  setActiveLayer, setCurrentTrace,
  setEditMode, startCreatingElement,
  startMapEditing
} from "../../../../store/maps.actions";
import {useDispatch, useSelector} from "react-redux";
import {
  currentMestParamName,
  findMapPoint,
  getNearestSignMapElement,
  getTraceMapElementProto,
  traceLayerProto
} from "../../../../lib/traces-utils";
import createTraceIcon from './../../../../../../assets/images/trace/trace_add_L.png'
import {stringToTableCell} from "../../../../../../entities/parameters/lib/table-row";

interface CreateTraceProps {
  mapState: MapState,
  formID: FormID,
  isTracesChannelLoaded: boolean
}

export const CreateTrace = ({mapState, formID, isTracesChannelLoaded}: CreateTraceProps) => {
  const dispatch = useDispatch();

  const { canvas } = mapState;
  const mapData = mapState.mapData;
  const layers = mapData.layers;
  const scale = mapData.scale;

  // создание элемента трассы на карте
  const createElement = useCallback((point: ClientPoint) => {
    const defaultElement = getTraceMapElementProto({ path: [ point.x, point.y ], closed: false});
    dispatch(createMapElement(formID, defaultElement));
    dispatch(startMapEditing(formID));
  }, [dispatch, formID]);

  // текущее месторождение, используется для получения stratumID
  const currentMestValue = useSelector<WState, string | null>(
    (state: WState) =>
      state.parameters[state.root.id]
        .find(el => el.id === currentMestParamName)
        ?.value?.toString() || null
  )

  const disabled = !currentMestValue ||
    !isTracesChannelLoaded ||
    mapState?.isTraceEditing ||
    mapState?.isElementEditing;

  const mouseUp = useCallback((event: MouseEvent) => {
    if (mapState.mode !== MapModes.AWAIT_POINT) return;

    // получение коодинат точки на карте
    const point = mapState.utils.pointToMap(clientPoint(event));

    // получение ближайшего элемента типа sign (скважина) на карте
    const newPoint = getNearestSignMapElement(point, canvas, scale, layers);
    if (!newPoint) return;

    // получение точки на карте из списка mapData.points
    const newDataPoint : MapPoint = findMapPoint(newPoint, mapData.points);

    // получение stratumID
    const currentStratumID = stringToTableCell(currentMestValue, 'LOOKUPCODE');

    // создание новой строки трассы для записи в канал
    const newTraceRow : TraceRow = {
      ID: null,
      Cells: {
        ID: null,
        name: newDataPoint.name,
        stratumID: currentStratumID,
        items: newDataPoint.UWID
      }
    };

    // установка значения новой трассы в store
    if(newDataPoint) dispatch(setCurrentTrace(formID, newTraceRow));

    // создание элемента трассы на карте
    newPoint.x = Math.round(newPoint.x);
    newPoint.y = Math.round(newPoint.y);
    createElement(newPoint);
  }, [mapState.utils, mapState.mode, createElement, canvas,
    dispatch, layers, mapData.points, scale, formID, currentMestValue]);

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

  const action = () => {
    dispatch(setActiveLayer(formID, traceLayerProto));
    dispatch(startCreatingElement(formID));

    if (mapState.mode !== MapModes.AWAIT_POINT) {
      dispatch(setEditMode(formID, MapModes.AWAIT_POINT));
    }
  }

  return <BigButton
    text={'Создать'} icon={createTraceIcon}
    action={action} disabled={disabled}
  />;
}
