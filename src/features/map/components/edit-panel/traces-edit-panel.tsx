import {MenuSection, MenuSkeleton} from "../../../../shared/ui";
import {CreateTrace} from "./editing/traces-edit-panel/create-trace";
import {DeleteTrace} from "./editing/traces-edit-panel/delete-trace";
import {EditTrace} from "./editing/traces-edit-panel/edit-trace";
import {useDispatch, useSelector} from "react-redux";
import {mapStateSelector} from "../../store/maps.selectors";
import {SaveTrace} from "./editing/traces-edit-panel/save-trace";
import {UploadTrace} from "./editing/traces-edit-panel/upload-trace";
import {ApplyTraceChanges} from "./editing/traces-edit-panel/accept-changes";
import {DenyTraceChanges} from "./editing/traces-edit-panel/deny-changes";
import {useCallback, useEffect} from "react";
import {
  clientPoint,
  getPointToMap,
  listenerOptions
} from "../../lib/map-utils";
import {
  applyMouseDownActionToPolyline,
} from "./editing/edit-element-utils";
import {addPointToCurrentTrace, setOnDrawEnd} from "../../store/maps.actions";
import {findMapPoint, getNearestSignMapElement} from "../../lib/traces-utils";

const panelTemplate = ['330px', '90px', '275px', 'calc(100% - 785px)', '90px'];

/** Панель редактирования трассы. */
export const TracesEditPanel = ({id}: FormEditPanelProps) => {
  const dispatch = useDispatch();

  const mapState: MapState = useSelector(mapStateSelector.bind(id));
  const { canvas, utils, mode, isElementEditing, mapData } = mapState;
  const scale = mapData.scale;
  const selectedElement = mapState.element;

  // при смене активной карты обновить координаты
  useEffect(() => {
    mapState?.utils.updateCanvas();
  }, [mapState?.utils, id]);

  const onDrawEnd = useCallback((canvas, x, y, scale) => {
    utils.pointToMap = getPointToMap(canvas, x, y, scale);
  }, [utils]);

  useEffect(() => {
    if (mapData) dispatch(setOnDrawEnd(id, onDrawEnd));
  }, [mapData, onDrawEnd, dispatch, id]);

  // добавление точек к текущей трассе
  const mouseDown = useCallback((event: MouseEvent) => {
    if (!isElementEditing) return;
    if (selectedElement.type !== 'polyline') return;

    const point = utils.pointToMap(clientPoint(event));

    const newPoint = getNearestSignMapElement(point, canvas, scale, mapData.layers);
    if (!newPoint) return;
    const newDataPoint : MapPoint = findMapPoint(newPoint, mapData.points)
    if(newDataPoint) dispatch(addPointToCurrentTrace(id, newDataPoint))

    applyMouseDownActionToPolyline(selectedElement, {mode, point: newPoint, scale});
    utils.updateCanvas();
  }, [isElementEditing, utils, selectedElement, mode, mapData, canvas, dispatch, id, scale]);

  // ставим слушатели на <canvas>
  useEffect(() => {
    if (canvas) {
      canvas.addEventListener('mousedown', mouseDown, listenerOptions);
    }
    return () => {
      if (canvas) {
        canvas.removeEventListener('mousedown', mouseDown);
      }
    }
  }, [canvas, mouseDown]);

  if (!mapState) return <MenuSkeleton template={panelTemplate}/>;

  return (
    <div className={'menu'}>
      <MenuSection header={'Управление'} className={'map-actions'}>
        <CreateTrace mapState={mapState} formID={id}/>
        <DeleteTrace mapState={mapState} formID={id}/>
        <EditTrace mapState={mapState} formID={id}/>
      </MenuSection>
      <MenuSection header={'Экспорт'} className={'map-actions'}>
        <SaveTrace mapState={mapState} formID={id}/>
        <UploadTrace mapState={mapState} formID={id}/>
      </MenuSection>
      <MenuSection header={'Редактирование'} className={'map-actions'}>
        <ApplyTraceChanges mapState={mapState} formID={id}/>
        <DenyTraceChanges mapState={mapState} formID={id}/>
      </MenuSection>
    </div>
  );
};
