import {MenuSection, MenuSkeleton} from "../../../../shared/ui";
import {CreateTrace} from "./editing/traces-edit-panel/create-trace";
import {DeleteTrace} from "./editing/traces-edit-panel/delete-trace";
import {EditTrace} from "./editing/traces-edit-panel/edit-trace";
import {useDispatch, useSelector} from "react-redux";
import {mapStateSelector} from "../../store/maps.selectors";
import {ApplyTraceChanges} from "./editing/traces-edit-panel/accept-changes";
import {DenyTraceChanges} from "./editing/traces-edit-panel/deny-changes";
import {useCallback, useEffect, useState} from "react";
import {
  clientPoint,
  getPointToMap,
  listenerOptions
} from "../../lib/map-utils";
import {
  applyMouseDownActionToPolyline,
} from "./editing/edit-element-utils";
import {
  addPointToCurrentTrace, cancelCreatingElement, setCurrentTrace,
  setOnDrawEnd,
  setTraceCreating, setTraceEditing,
  setTraceOldData
} from "../../store/maps.actions";
import {findMapPoint, getNearestSignMapElement, tracesChannelName} from "../../lib/traces-utils";
import {channelSelector} from "../../../../entities/channels";

const panelTemplate = ['222.363px', '176.8px', '141.488px'];

/** Панель редактирования трассы. */
export const TracesEditPanel = ({id}: FormEditPanelProps) => {
  const dispatch = useDispatch();

  const mapState: MapState = useSelector(mapStateSelector.bind(id));
  const rootID = useSelector<WState, string | null>(state => state.root.id);

  const selectedTopTab = useSelector<WState, number | null>(state => state.root.layout.common.selectedTopTab);
  // const [prevSelectedTopTab, setPrevSelectedTopTab] = useState<number | null>(null)

  // получение всех трасс из каналов
  const traces: Channel = useSelector(channelSelector.bind(tracesChannelName));
  const isTracesChannelLoaded = !!traces;

  // добавление точек к текущей трассе
  const mouseDown = useCallback((event: MouseEvent) => {
    if(!mapState) return;

    const { canvas, utils, mode, isElementEditing, mapData } = mapState;
    const selectedElement = mapState.element;

    if (!mapData) return;
    if (!mapState.isLoadSuccessfully) return;
    if (!isElementEditing) return;
    if (selectedElement?.type !== 'polyline') return;

    const point = utils.pointToMap(clientPoint(event));

    const newPoint = getNearestSignMapElement(point, canvas, mapData.scale, mapData.layers);
    if (!newPoint) return;
    const newDataPoint : MapPoint = findMapPoint(newPoint, mapData.points)
    if(newDataPoint) dispatch(addPointToCurrentTrace(id, newDataPoint))

    applyMouseDownActionToPolyline(selectedElement, {mode, point: newPoint, scale: mapData.scale});
    utils.updateCanvas();
  }, [mapState, dispatch, id]);

  // при смене активной карты обновить координаты
  useEffect(() => {
    mapState?.utils.updateCanvas();
  }, [mapState?.utils, id]);

  const onDrawEnd = useCallback((canvas, x, y, scale) => {
    if(!mapState) return;
    mapState.utils.pointToMap = getPointToMap(canvas, x, y, scale);
  }, [mapState]);

  useEffect(() => {
    if (mapState?.mapData) dispatch(setOnDrawEnd(id, onDrawEnd));
  }, [mapState, onDrawEnd, dispatch, id]);

  // ставим слушатели на <canvas>
  useEffect(() => {
    if(!mapState) return;
    const { canvas } = mapState

    if (canvas) {
      canvas.addEventListener('mousedown', mouseDown, listenerOptions);
    }
    return () => {
      if (canvas) {
        canvas.removeEventListener('mousedown', mouseDown);
      }
    }
  }, [mapState, mouseDown]);

  useEffect(() => {
    console.log(selectedTopTab)
    if( (selectedTopTab === 3) ) {
      // if (mapState?.isTraceCreating) {
      //   // dispatch(updateParam(rootID, currentTraceParamName, null));
      //   dispatch(setTraceCreating(id, false));
      //   dispatch(setTraceOldData(id, null));
      //   dispatch(cancelCreatingElement(id));
      // }
      if (mapState?.isTraceEditing) {
        console.log('editing false')
        // dispatch(setCurrentTrace(id, mapState?.oldTraceDataRow));
        // dispatch(setTraceEditing(id, false));
        // dispatch(setTraceOldData(id, null));
      }
    }
    // setPrevSelectedTopTab(selectedTopTab)
  }, [selectedTopTab])

  if (!mapState.isLoadSuccessfully) return <MenuSkeleton template={panelTemplate}/>;

  return (
    <div className={'menu'}>
      <MenuSection header={'Управление'} className={'map-actions'}>
        <CreateTrace mapState={mapState} formID={id} isTracesChannelLoaded={isTracesChannelLoaded}/>
        <DeleteTrace mapState={mapState} formID={id} traces={traces}/>
        <EditTrace mapState={mapState} formID={id}/>
      </MenuSection>
      {/*<MenuSection header={'Экспорт'} className={'map-actions'}>*/}
      {/*  <SaveTrace mapState={mapState} formID={id}/>*/}
      {/*  <UploadTrace mapState={mapState} formID={id}/>*/}
      {/*</MenuSection>*/}
      <MenuSection header={'Редактирование'} className={'map-actions'}>
        <ApplyTraceChanges mapState={mapState} formID={id} traces={traces}/>
        <DenyTraceChanges mapState={mapState} formID={id} rootID={rootID} traces={traces}/>
      </MenuSection>
    </div>
  );
};
