import { TFunction } from 'react-i18next';
import { EditPanelItemProps } from '../../lib/types';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { Button } from '@progress/kendo-react-buttons';
import { BigButton } from 'shared/ui';
import { channelsAPI } from 'entities/channels/lib/channels.api';
import { setOpenedWindow, setWindowWarning } from 'entities/windows';
import statisticsIcon from 'assets/images/dataset/statistics.png';


interface StatDialogProps {
  title: string;
  stat: ColumnStat;
  t: TFunction;
  onClose: () => void;
}

/** Статистика по колонке из таблицы в БД. */
interface ColumnStat {
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


export const ColumnStatistics = ({state, dispatch, t}: EditPanelItemProps) => {
  const activeColumnID = state.activeCell.columnID;

  const getStat = async () => {
    const columnState = state.columns[activeColumnID];
    const { ok, data } = await channelsAPI.getStatistics(state.tableID, columnState.colName);
    if (!ok) { dispatch(setWindowWarning(data)); return; }
    if (typeof data !== 'object' || !data.Values) return;

    const title = t('table.stat.window-title', {column: columnState.title});
    const onClose = () => dispatch(setOpenedWindow('stat', false, null));
    const window = <StatDialog key={'stat'} title={title} stat={data.Values} t={t} onClose={onClose}/>;
    dispatch(setOpenedWindow('stat', true, window));
  };

  return (
    <BigButton
      text={t('table.panel.functions.stat')} icon={statisticsIcon}
      action={getStat} disabled={!activeColumnID || !state.total}
    />
  );
};

const StatDialog = ({title, stat, t, onClose}: StatDialogProps) => {
  return (
    <Dialog title={title} onClose={onClose} width={300}>
      <ul style={{margin: 0, paddingLeft: '2em'}}>
        {stat.MIN && <li>{t('table.stat.min', {value: stat.MIN})}</li>}
        {stat.MAX && <li>{t('table.stat.max', {value: stat.MAX})}</li>}
        {stat.AVG && <li>{t('table.stat.avg', {value: stat.AVG})}</li>}
        {stat.SUM && <li>{t('table.stat.sum', {value: stat.SUM})}</li>}
        {stat.COUNT && <li>{t('table.stat.count', {value: stat.COUNT})}</li>}
        {stat.UNIQ && <li>{t('table.stat.unique', {value: stat.UNIQ})}</li>}
      </ul>
      <DialogActionsBar>
        <Button onClick={onClose}>{t('base.ok')}</Button>
      </DialogActionsBar>
    </Dialog>
  );
};
