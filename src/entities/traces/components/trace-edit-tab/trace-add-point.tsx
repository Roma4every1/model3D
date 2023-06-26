import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setTraceItems } from '../../store/traces.actions';
import { filterBy, FilterDescriptor } from '@progress/kendo-data-query';

import './traces-edit-tab.scss';
import { Button } from '@progress/kendo-react-buttons';
import { ComboBox } from '@progress/kendo-react-dropdowns';
import { ComboBoxFilterChangeEvent, ComboBoxChangeEvent } from '@progress/kendo-react-dropdowns';


interface TraceAddPointProps {
  items: number[],
  points: TracePoint[]
}

export const TraceAddPoint = ({items, points} : TraceAddPointProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // получение скважин, которых ещё нет в данной трассе
  const pointsToAddData = items ? points.filter(p => items.every(i => i !== p.UWID)) : points;

  // скважина, выбранная для добавления
  const [selectedPointToAdd, setSelectedPointToAdd] = useState<TracePoint | null>(null);

  const [pointsToAdd, setPointsToAdd] = useState<TracePoint[] | null>(pointsToAddData);

  // выбор точки для добавления в ComboBox компоненте
  const handleComboBoxChange = (event: ComboBoxChangeEvent) => {
    setSelectedPointToAdd(event.target.value);
  };

  // добавление точки в трассу
  const addPoint = (pointUWID: number) => {
    if (pointUWID === null) return;

    const newItems = items ? [...items] : [];
    newItems.push(pointUWID);

    setSelectedPointToAdd(null);
    dispatch(setTraceItems(newItems));
  }

  // фильтрация при выборе точки для добавления в трассу
  const filterData = (filter: FilterDescriptor) => {
    const data = pointsToAddData.slice();
    return filterBy(data, filter);
  };

  // изменение фильтра (введенного текста) в ComboBox
  const filterChange = (event: ComboBoxFilterChangeEvent) => {
    setPointsToAdd(filterData(event.filter));
  };

  return (
    <div className='trace-edit-tab__inner-block'>
      <div className='menu-header trace-edit-tab__title-text'>
        {t('trace.add-point-title')}
      </div>
      <ComboBox style={{fontSize: '12px'}}
                data={pointsToAdd}
                dataItemKey='UWID'
                value={selectedPointToAdd}
                textField='name'
                onChange={handleComboBoxChange}
                filterable={true}
                onFilterChange={filterChange}
      />
      <Button
        style={{fontSize: '12px'}}
        disabled={!selectedPointToAdd}
        onClick={()=> addPoint(selectedPointToAdd.UWID)}
      >
        <span>{t('trace.add-point-button')}</span>
      </Button>
    </div>
  );
};
