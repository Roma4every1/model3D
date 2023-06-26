import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { updateParamDeep } from '../../parameters';
import { stringToTableCell, tableRowToString } from '../../parameters/lib/table-row';
import { setCurrentTraceData } from '../store/traces.actions';
import { traceStateSelector, currentTraceParamSelector } from '../store/traces.selectors';
import { traceItemsChannelSelector } from '../store/traces.selectors';

import { MenuSection, MenuSkeleton } from 'shared/ui';
import { EditTrace } from './traces-panel-buttons/edit-trace';
import { DeleteTrace } from './traces-panel-buttons/delete-trace';
import { CreateTrace } from './traces-panel-buttons/create-trace';
import { ApplyTraceChanges } from './traces-panel-buttons/apply-trace-changes';
import { DenyTraceChanges } from './traces-panel-buttons/deny-trace-changes';


interface TracesPanelProps {
  traces: Channel,
}


const panelTemplate = ['222.363px', '176.8px', '141.488px'];

export const TracesPanel = ({traces}: TracesPanelProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const rootID = useSelector<WState, string>(state => state.root.id);
  const tracesState = useSelector(traceStateSelector);

  // получение значения текущей трассы из параметров
  const currentTraceParamName = traces?.info?.currentRowObjectName;
  const currentTraceParamValue: string | null = useSelector(currentTraceParamSelector.bind(currentTraceParamName));

  // получение ID таблицы со скважинами трассы
  const traceItemsChannel : Channel = useSelector(traceItemsChannelSelector);
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
      items: items ? items.split('---').map(x => parseInt(x)) : null
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
      dispatch(updateParamDeep(rootID, currentTraceParamName, null));
      return;
    }
    dispatch(updateParamDeep(rootID, currentTraceParamName, lastTraceValue));
  }, [dispatch, rootID, currentTraceParamName, traces, tracesState.isTraceCreating])

  if (!traces || !traceItemsChannel) return <MenuSkeleton template={panelTemplate}/>;

  return (
    <div className={'menu'}>
      <MenuSection header={t('trace.controls-section')} className={'map-actions'}>
        <CreateTrace tracesState={tracesState} tracesTableID={traces?.tableID}/>
        <DeleteTrace tracesState={tracesState} traces={traces} itemsTableID={itemsTableID}/>
        <EditTrace tracesState={tracesState}/>
      </MenuSection>
      <MenuSection header={t('trace.edit-section')} className={'map-actions'}>
        <ApplyTraceChanges tracesState={tracesState} traces={traces} itemsTableID={itemsTableID}/>
        <DenyTraceChanges tracesState={tracesState} traces={traces} itemsTableID={itemsTableID}/>
      </MenuSection>
    </div>
  );
};
