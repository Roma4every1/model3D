import { TFunction } from 'react-i18next';
import { EditPanelItemProps } from '../../lib/types';
import { BigButton } from 'shared/ui';
import { channelsAPI } from 'entities/channels/lib/channels.api';
import { setWindowInfo, setWindowWarning } from 'entities/windows';
import statisticsIcon from 'assets/images/dataset/statistics.png';


/** Статистика по колонке из таблицы в БД. */
interface ColumnStat {
  /** Минимальное значение. */
  MIN?: string,
  /** Максимальное значение. */
  MAX?: string,
  /** Среднее значение. */
  AVG?: string,
  /** Сумма всех значений. */
  SUM?: string,
  /** Количество значений. */
  COUNT?: string,
  /** Количество уникальных значений. */
  UNIQ?: string,
}


export const ColumnStatistics = ({state, dispatch, t}: EditPanelItemProps) => {
  const activeColumnID = state.activeCell.columnID;

  const getStat = async () => {
    const { ok, data } = await channelsAPI.getStatistics(state.tableID, activeColumnID);
    if (!ok) { dispatch(setWindowWarning(data)); return; }
    if (typeof data !== 'object' || !data.Values) return;

    const info = <ColumnStatisticsList stat={data.Values} t={t}/>;
    const windowTitle = t('table.stat.window-title', {column: state.columns[activeColumnID].title});
    dispatch(setWindowInfo(info, null, windowTitle));
  };

  return (
    <BigButton
      text={t('table.panel.functions.stat')} icon={statisticsIcon}
      action={getStat} disabled={!activeColumnID || !state.total}
    />
  );
};

const ColumnStatisticsList = ({stat, t}: {stat: ColumnStat, t: TFunction}) => {
  return (
    <ul>
      {stat.MIN && <li>{t('table.stat.min', {value: stat.MIN})}</li>}
      {stat.MAX && <li>{t('table.stat.max', {value: stat.MAX})}</li>}
      {stat.AVG && <li>{t('table.stat.avg', {value: stat.AVG})}</li>}
      {stat.SUM && <li>{t('table.stat.sum', {value: stat.SUM})}</li>}
      {stat.COUNT && <li>{t('table.stat.count', {value: stat.COUNT})}</li>}
      {stat.UNIQ && <li>{t('table.stat.unique', {value: stat.UNIQ})}</li>}
    </ul>
  );
};
