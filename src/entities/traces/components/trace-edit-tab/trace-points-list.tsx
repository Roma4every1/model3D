import {Button} from "@progress/kendo-react-buttons";
import {setTraceItems} from "../../store/traces.actions";
import {TraceListItem} from "./trace-list-item";
import {useState} from "react";
import {useDispatch} from "react-redux";
import './traces-edit-tab.scss'
import {useTranslation} from "react-i18next";

interface TracePointsListProps {
  items: string[],
  points: TracePoint[],
}

export const TracePointsList = ({items, points}: TracePointsListProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // скважина, выбранная в списке скважин
  const [selectedTraceItemUWID, setSelectedTraceItemUWID] = useState<string | null>(null);

  // изменение порядка в списке определенной точки
  const movePoint = (pointUWID: string, direction: 'down' | 'up') => {
    if(!pointUWID) return;

    const oldPoints = items ? [...items] : [];
    const pointIndex = oldPoints.findIndex(p => p === pointUWID);

    let newPoints = oldPoints.concat().filter(p => p !== pointUWID);
    if (direction === 'up') {
      newPoints.splice(pointIndex <= 0 ? newPoints.length : pointIndex - 1, 0, pointUWID);
    }
    if (direction === 'down') {
      newPoints.splice(pointIndex >= newPoints.length ? 0 : pointIndex + 1, 0, pointUWID);
    }

    dispatch(setTraceItems(newPoints));
  }

  // удаление точки из трассы
  const removePoint = (pointUWID: string) => {
    if (pointUWID === null) return;
    const newPoints = items.filter(p => p !== pointUWID);

    dispatch(setTraceItems(newPoints));
  }

  // список точек трассы
  const itemsListElements = items ? items.map(i => <TraceListItem
    key={i}
    pointUWID={i}
    points={points}
    selectedTraceItemUWID={selectedTraceItemUWID}
    setSelectedTraceItemUWID={setSelectedTraceItemUWID}
    removePoint={removePoint}
  />) : <div></div>;

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
        {items && itemsListElements}
      </div>
    </div>
  )
}
