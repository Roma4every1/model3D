import type { TFunction } from 'react-i18next';
import type { TableState } from '../../lib/types';
import { Button } from 'antd';
import { BigButton } from 'shared/ui';
import { channelAPI } from 'entities/channel/lib/channel.api';
import { showWarningMessage, showDialog, closeWindow } from 'entities/window';
import statIcon from 'assets/table/statistics.png';


interface ColumnStatisticsProps {
  state: TableState;
  t: TFunction;
}
interface StatDialogProps {
  type: TableColumnType;
  stat: ColumnStat;
  t: TFunction;
  onClose: () => void;
}

export const ColumnStat = ({state, t}: ColumnStatisticsProps) => {
  const tableData = state.data;
  const activeColumnID = tableData.activeCell.column;

  const getStat = async () => {
    const column = state.columns.dict[activeColumnID];
    const res = await channelAPI.getColumnStat(state.data.queryID, column.columnName);
    if (!res.ok) { showWarningMessage(res.message); return; }

    const title = t('table.stat.dialog-title', {column: column.displayName});
    const onClose = () => closeWindow('stat');
    const content = <StatDialogContent type={column.type} stat={res.data} t={t} onClose={onClose}/>;
    showDialog('stat', {title, width: 300, onClose}, content);
  };

  return (
    <BigButton
      text={t('table.stat.button-text')} icon={statIcon}
      onClick={getStat} disabled={!activeColumnID || !tableData.records.length}
    />
  );
};

const StatDialogContent = ({type, stat, t, onClose}: StatDialogProps) => {
  let min: string, max: string, avg: string, sum: string;
  if (type === 'date') {
    if (stat.min) min = new Date(stat.min).toLocaleDateString();
    if (stat.max) max = new Date(stat.max).toLocaleDateString();
    if (stat.avg) avg = new Date(stat.avg).toLocaleDateString();
  } else {
    min = stat.min?.toString();
    max = stat.max?.toString();
    avg = stat.avg?.toString();
    sum = stat.sum?.toString();
  }

  return (
    <>
      <ul style={{margin: 0, padding: '0 0 0.75em 2em'}}>
        {min && <li>{t('table.stat.min', {value: min})}</li>}
        {max && <li>{t('table.stat.max', {value: max})}</li>}
        {avg && <li>{t('table.stat.avg', {value: avg})}</li>}
        {sum && <li>{t('table.stat.sum', {value: sum})}</li>}
        {stat.count && <li>{t('table.stat.count', {value: stat.count})}</li>}
        {stat.unique && <li>{t('table.stat.unique', {value: stat.unique})}</li>}
      </ul>
      <div className={'wm-dialog-actions'} style={{gridTemplateColumns: '1fr'}}>
        <Button onClick={onClose}>{t('base.ok')}</Button>
      </div>
    </>
  );
};
