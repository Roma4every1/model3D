import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setTraceItems } from '../../store/traces.actions';

import './traces-edit-tab.scss';
import { Button } from '@progress/kendo-react-buttons';
import { TraceListItem } from './trace-list-item';


interface TracePointsListProps {
  items: number[],
  points: TracePoint[],
}


export const TracePointsList = ({items, points}: TracePointsListProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // скважина, выбранная в списке скважин
  const [selectedTraceItemUWID, setSelectedTraceItemUWID] = useState<number>(null);

  // изменение порядка в списке определенной точки
  const movePoint = (pointUWID: number, direction: 'down' | 'up') => {
    if(!pointUWID) return;

    const oldPoints = items ? [...items] : [];
    const pointIndex = oldPoints.findIndex(p => p === pointUWID);
    const newPoints = oldPoints.concat().filter(p => p !== pointUWID);

    if (direction === 'up') {
      const start = pointIndex <= 0 ? newPoints.length : pointIndex - 1;
      newPoints.splice(start, 0, pointUWID);
    }
    if (direction === 'down') {
      const start = pointIndex >= newPoints.length ? 0 : pointIndex + 1;
      newPoints.splice(start, 0, pointUWID);
    }
    dispatch(setTraceItems(newPoints));
  }

  // удаление точки из трассы
  const removePoint = (pointUWID: number) => {
    if (pointUWID === null) return;
    const newPoints = items.filter(p => p !== pointUWID);
    dispatch(setTraceItems(newPoints));
  }

  const itemToTraceListItem = (item: number, i: number) => {
    return (
      <TraceListItem
        key={i} pointUWID={item} points={points} selectedTraceItemUWID={selectedTraceItemUWID}
        setSelectedTraceItemUWID={setSelectedTraceItemUWID} removePoint={removePoint}
      />
    );
  };

  if (!items?.length) return (
    <div className='trace-edit-tab__inner-block'>
      <div className='menu-header trace-edit-tab__title-text'>
        {t('trace.change-items-title')}
      </div>
      <div>{t('trace.empty-trace')}</div>
    </div>
  );

  if (!points?.length) return (
    <div className='trace-edit-tab__inner-block'>
      <div className='menu-header trace-edit-tab__title-text'>
        {t('trace.change-items-title')}
      </div>
      <div>{t('trace.wells-not-loaded')}</div>
    </div>
  );

  return (
    <div className='trace-edit-tab__inner-block'>
      <div className='menu-header trace-edit-tab__title-text'>
        {t('trace.change-items-title')}
      </div>
      <div className='change-order-buttons'>
        <Button
          style={{width: '20px', height: '20px'}}
          icon='sort-asc-sm'
          disabled={false}
          onClick={() => movePoint(selectedTraceItemUWID, 'up')}
        />
        <Button
          style={{width: '20px', height: '20px'}}
          icon='sort-desc-sm'
          disabled={false}
          onClick={() => movePoint(selectedTraceItemUWID, 'down')}
        />
      </div>
      <div className='items'>
        {items && items.map(itemToTraceListItem)}
      </div>
    </div>
  );
};
