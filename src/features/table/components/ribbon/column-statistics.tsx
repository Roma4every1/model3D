import type { TFunction } from 'react-i18next';
import type { TableState } from '../../lib/types';
import { Button } from 'antd';
import { BigButton } from 'shared/ui';
import { channelAPI } from 'entities/channel/lib/channel.api';
import { showWarningMessage, showDialog, closeWindow } from 'entities/window';
import statisticsIcon from 'assets/table/statistics.png';


interface ColumnStatisticsProps {
  state: TableState;
  t: TFunction;
}
interface StatDialogProps {
  title: string;
  stat: ColumnStatDTO;
  t: TFunction;
  onClose: () => void;
}

/** Статистика по колонке из таблицы в БД. */
interface ColumnStatDTO {
  /** Минимальное значение. */
  MIN?: string;
  /** Максимальное значение. */
  MAX?: string;
  /** Среднее значение. */
  AVG?: string;
  /** Сумма всех значений. */
  SUM?: string;
  /** Количество значений. */
  COUNT?: string;
  /** Количество уникальных значений. */
  UNIQ?: string;
}


export const ColumnStatistics = ({state, t}: ColumnStatisticsProps) => {
  const tableData = state.data;
  const activeColumnID = tableData.activeCell.column;

  const getStat = async () => {
    const { displayName, columnName } = state.columns.dict[activeColumnID];
    const { ok, data } = await channelAPI.getStatistics(state.data.queryID, columnName);
    if (!ok) { showWarningMessage(data); return; }
    if (typeof data !== 'object' || !data.Values) return;

    const title = t('table.stat.dialog-title', {column: displayName});
    const onClose = () => closeWindow('stat');
    const content = <StatDialogContent title={title} stat={data.Values} t={t} onClose={onClose}/>;
    showDialog('stat', {title, width: 300, onClose}, content);
  };

  return (
    <BigButton
      text={t('table.stat.button-text')} icon={statisticsIcon}
      onClick={getStat} disabled={!activeColumnID || !tableData.records.length}
    />
  );
};

const StatDialogContent = ({stat, t, onClose}: StatDialogProps) => {
  return (
    <>
      <ul style={{margin: 0, padding: '0 0 0.75em 2em'}}>
        {stat.MIN && <li>{t('table.stat.min', {value: stat.MIN})}</li>}
        {stat.MAX && <li>{t('table.stat.max', {value: stat.MAX})}</li>}
        {stat.AVG && <li>{t('table.stat.avg', {value: stat.AVG})}</li>}
        {stat.SUM && <li>{t('table.stat.sum', {value: stat.SUM})}</li>}
        {stat.COUNT && <li>{t('table.stat.count', {value: stat.COUNT})}</li>}
        {stat.UNIQ && <li>{t('table.stat.unique', {value: stat.UNIQ})}</li>}
      </ul>
      <div className={'wm-dialog-actions'} style={{gridTemplateColumns: '1fr'}}>
        <Button onClick={onClose}>{t('base.ok')}</Button>
      </div>
    </>
  );
};
