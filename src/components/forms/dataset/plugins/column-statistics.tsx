import { useDispatch } from 'react-redux';
import { BigButton } from '../../../common/menu-ui';
import { showNotice } from '../../../../utils/notifications';
import { API } from '../../../../api/api';
import { actions } from '../../../../store';
import { statisticsIcon } from '../../../../dicts/images';


/** Статистика по колонке из таблицы в БД. */
interface ColumnStat {
  /** Минимальное значение. */
  MIN: string,
  /** Максимальное значение. */
  MAX: string,
  /** Среднее значение. */
  AVG: string,
  /** Сумма всех значений. */
  SUM: string,
  /** Количество значений. */
  COUNT: string,
  /** Количество уникальных значений. */
  UNIQ: string,
}


export const ColumnStatistics = ({formRef, t}) => {
  const dispatch = useDispatch();
  const title = t('pluginNames.statistics');

  const getStat = async () => {
    const cell = formRef.activeCell();
    const tableID = formRef.tableId();
    if (!cell) { showNotice(dispatch, t('messages.statistics')); return; }

    const { ok, data } = await API.channels.getStatistics(tableID, cell.column);
    if (!ok) { dispatch(actions.setWindowWarning(data)); return; }
    if (typeof data !== 'object' || !data.Values) return;

    const info = <ColumnStatisticsList stat={data.Values}/>;
    dispatch(actions.setWindowInfo(info, null, title));
  };

  return <BigButton text={title} icon={statisticsIcon} action={getStat}/>;
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
