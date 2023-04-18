import {MenuSection, MenuSkeleton} from "../../../shared/ui";
import {ApplyTraceChanges} from "./traces-panel-buttons/accept-changes";
import {DenyTraceChanges} from "./traces-panel-buttons/deny-changes";
import {EditTrace} from "./traces-panel-buttons/edit-trace";
import {DeleteTrace} from "./traces-panel-buttons/delete-trace";
import {CreateTrace} from "./traces-panel-buttons/create-trace";
import {useDispatch, useSelector} from "react-redux";
import {useEffect} from "react";
import {stringToTableCell, tableRowToString} from "../../parameters/lib/table-row";
import {setCurrentTraceData} from "../store/traces.actions";
import {updateParam} from "../../parameters";
import {channelSelector} from "../../channels";

interface TracesPanelProps {
  traces: Channel,
}

const panelTemplate = ['222.363px', '176.8px', '141.488px'];

export const TracesPanel = ({traces}: TracesPanelProps) => {
  const dispatch = useDispatch();

  const rootID = useSelector<WState, string | null>(state => state.root.id);
  const tracesState = useSelector<WState, TracesState>(state => state.traces);
  const tracesTableID = traces?.tableID;
  // получение значения текущей трассы из параметров
  const currentTraceParamName = traces?.info?.currentRowObjectName;
  const currentTraceParamValue = useSelector<WState, string | null>(
    (state: WState) =>
      state.parameters[state.root.id]
        .find(el => el.id === currentTraceParamName)
        ?.value?.toString() || null
  );

  // получение ID таблицы со скважинами трассы
  const traceItemsChannelName = traces?.info?.properties[3]?.secondLevelChannelName;
  const traceItemsChannel : Channel = useSelector(channelSelector.bind(traceItemsChannelName));
  const itemsTableID = traceItemsChannel.tableID;

  // установка mapState.currentTraceRow при изменении трассы в параметрах
  useEffect( () => {
    // если текущая трасса не задана в параметрах
    if (!currentTraceParamValue) {
      dispatch(setCurrentTraceData(null));
      return;
    }

    // установка mapState.currentTraceRow из значения в параметрах
    const items = stringToTableCell(currentTraceParamValue, 'ITEMS');
    const currentTraceData : TraceModel = {
      id: +stringToTableCell(currentTraceParamValue, 'ID') ?? null,
      name: stringToTableCell(currentTraceParamValue, 'NAME') || 'Без названия',
      stratumID: stringToTableCell(currentTraceParamValue, 'STRATUM_ID') ?? null,
      items: items ? items.split("---") : null
    };

    dispatch(setCurrentTraceData(currentTraceData))
  }, [dispatch, currentTraceParamValue])

  // установка в параметры последней добавленой трассы при её создании
  useEffect(() => {
    // если канал с трассами не загружен или канал с трассами пустой
    if (!traces?.data?.rows) return;
    if (!tracesState.isTraceCreating) return;

    // получение последней добавленной трассы из каналов
    const tracesRows = traces.data.rows;
    const lastTrace = tracesRows[tracesRows.length-1];
    const lastTraceValue = tableRowToString(traces, lastTrace)?.value;

    if (!lastTrace) {
      dispatch(updateParam(rootID, currentTraceParamName, null));
      return;
    }
    dispatch(updateParam(rootID, currentTraceParamName, lastTraceValue));
  }, [dispatch, rootID, currentTraceParamName, traces, tracesState.isTraceCreating])

  if (!traces || !traceItemsChannel) return <MenuSkeleton template={panelTemplate}/>;

  return (
    <div className={'menu'}>
      <MenuSection header={'Управление'} className={'map-actions'}>
        <CreateTrace tracesState={tracesState} tracesTableID={tracesTableID}/>
        <DeleteTrace tracesState={tracesState} traces={traces} itemsTableID={itemsTableID}/>
        <EditTrace tracesState={tracesState}/>
      </MenuSection>
      {/*<MenuSection header={'Экспорт'} className={'map-actions'}>*/}
      {/*  <SaveTrace formID={id}/>*/}
      {/*  <UploadTrace formID={id}/>*/}
      {/*</MenuSection>*/}
      <MenuSection header={'Редактирование'} className={'map-actions'}>
        <ApplyTraceChanges tracesState={tracesState} traces={traces} itemsTableID={itemsTableID}/>
        <DenyTraceChanges tracesState={tracesState} traces={traces} itemsTableID={itemsTableID}/>
      </MenuSection>
    </div>
  )
};
