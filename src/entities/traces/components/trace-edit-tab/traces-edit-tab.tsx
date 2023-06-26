import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { traceStateSelector, wellsChannelSelector } from '../../store/traces.selectors';
import { setCurrentTraceData, setTraceEditing } from "../../store/traces.actions";

import './traces-edit-tab.scss';
import { TraceChangeName } from './trace-change-name';
import { TracePointsList } from './trace-points-list';
import { TraceAddPoint } from './trace-add-point';


export const TracesEditTab = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const tracesState = useSelector(traceStateSelector);
  const wellsChannel: Channel = useSelector(wellsChannelSelector);

  const name = tracesState?.currentTraceData?.name;
  const items = tracesState?.currentTraceData?.items;

  // получение значения точек для добавления в трассу из канала "Скважины"
  const points: TracePoint[] = wellsChannel ? wellsChannel.data.rows.map(row => ({
    UWID: row.Cells[1],
    name: row.Cells[2] || row.Cells[3] || row.Cells[1],
  })) : [];

  if(!tracesState?.currentTraceData) return <div/>;

  const onClick = () => {
    dispatch(setCurrentTraceData(tracesState.oldTraceData));
    dispatch(setTraceEditing(false));
  };

  return (
    <section className='trace-edit-tab'>
      <div className='trace-edit-tab__header'>
        <div className='title'>
          <div>{t('trace.edit-panel')}</div>
        </div>
        <span className='k-clear-value'>
        <span className={'k-icon k-i-close'} onClick={onClick}/>
      </span>
      </div>
      <div className='trace-edit-tab__body'>
        <TraceChangeName name={name}/>
        <TracePointsList items={items} points={points}/>
        {points.length > 0 && <TraceAddPoint items={items} points={points}/>}
      </div>
    </section>
  );
};
