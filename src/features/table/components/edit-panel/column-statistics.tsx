import { useDispatch } from 'react-redux';
//import { useTranslation } from 'react-i18next';
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


export const ColumnStatistics = ({state}: {state: TableState}) => {
  //const { t } = useTranslation();
  const dispatch = useDispatch();
  const activeColumnID = state.activeCell.columnID;

  const getStat = async () => {
    const { ok, data } = await channelsAPI.getStatistics(state.tableID, activeColumnID);
    if (!ok) { dispatch(setWindowWarning(data)); return; }
    if (typeof data !== 'object' || !data.Values) return;

    const info = <ColumnStatisticsList stat={data.Values}/>;
    const windowTitle = 'Статистика: ' + state.columns[activeColumnID].title;
    dispatch(setWindowInfo(info, null, windowTitle));
  };

  return (
    <BigButton
      text={'Статистика'} icon={statisticsIcon}
      action={getStat} disabled={!activeColumnID}
    />
  );
};

const ColumnStatisticsList = ({stat}: {stat: ColumnStat}) => {
  return (
    <ul>
      {stat.MIN && <li>Минимум: {stat.MIN}</li>}
      {stat.MAX && <li>Максимум: {stat.MAX}</li>}
      {stat.AVG && <li>В среднем: {stat.AVG}</li>}
      {stat.SUM && <li>Сумма: {stat.SUM}</li>}
      {stat.COUNT && <li>Количество строк: {stat.COUNT}</li>}
      {stat.UNIQ && <li>Уникальных значений: {stat.UNIQ}</li>}
    </ul>
  );
};
