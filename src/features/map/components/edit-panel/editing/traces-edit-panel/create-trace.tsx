import {BigButton} from "../../../../../../shared/ui";
import {useCallback, useEffect} from "react";
import {clientPoint, listenerOptions} from "../../../../lib/map-utils";
import {
  setCurrentTrace,
  setTraceCreating,
} from "../../../../store/maps.actions";
import {useDispatch, useSelector} from "react-redux";
import {
  currentMestParamName,
  findMapPoint,
  getNearestSignMapElement,
} from "../../../../lib/traces-utils";
import createTraceIcon from './../../../../../../assets/images/trace/trace_add_L.png'
import {stringToTableCell} from "../../../../../../entities/parameters/lib/table-row";

interface CreateTraceProps {
  mapState: MapState,
  formID: FormID,
}

export const CreateTrace = ({mapState, formID}: CreateTraceProps) => {
  const dispatch = useDispatch();

  const { canvas } = mapState;
  const mapData = mapState.mapData;
  const layers = mapData.layers;
  const scale = mapData.scale;

  // текущее месторождение, используется для получения stratumID
  const currentMestValue = useSelector<WState, string | null>(
    (state: WState) =>
      state.parameters[state.root.id]
        .find(el => el.id === currentMestParamName)
        ?.value?.toString() || null
  );

  // состояние активности кнопки
  const disabled = !currentMestValue ||
    mapState?.isTraceEditing ||
    mapState?.isElementEditing ||
    mapState?.isTraceCreating;

  const mouseUp = useCallback((event: MouseEvent) => {
    if (!(mapState?.isTraceCreating && mapState?.currentTraceRow === null) ) return;

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

  }, [mapState.utils, mapState.isTraceCreating, canvas,
    dispatch, layers, mapData.points, scale, formID, currentMestValue, mapState?.currentTraceRow]);

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

  // onClick коллэк для компонента
  const action = () => {
    const traceLayer = mapData.layers.find(layer => layer.uid==='{TRACES-LAYER}');
    if (!traceLayer) return;
    traceLayer.elements = [];

    dispatch(setCurrentTrace(formID, null));
    dispatch(setTraceCreating(formID, true));
  }

  return <BigButton
    text={'Создать'} icon={createTraceIcon}
    action={action} disabled={disabled}
  />;
}
