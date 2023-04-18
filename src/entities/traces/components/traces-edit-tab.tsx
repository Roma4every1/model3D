import {useDispatch, useSelector} from "react-redux";
import {useState} from "react";
import {
  ComboBox,
  ComboBoxFilterChangeEvent,
  DropDownListChangeEvent
} from "@progress/kendo-react-dropdowns";
import {Input, InputChangeEvent} from "@progress/kendo-react-inputs";
import {filterBy, FilterDescriptor} from "@progress/kendo-data-query";
import {Button} from "@progress/kendo-react-buttons";
import {traceStateSelector, wellsChannelSelector} from "../store/traces.selectors";
import {setTraceEditing, setTraceItems, setTraceName} from "../store/traces.actions";
import './traces-edit-tab.scss'

interface TracePoint {
  UWID: string,
  name: string,
}

export const TracesEditTab = () => {
  const dispatch = useDispatch();
  const tracesState = useSelector(traceStateSelector);
  const wellsChannel = useSelector(wellsChannelSelector);

  const { name, items } = tracesState.currentTraceData;

  // скважина, выбранная в списке скважин
  const [selectedTraceItemUWID, setSelectedTraceItemUWID] = useState<string | null>(null);

  // скважина, выбранная для добавления
  const [selectedPointToAdd, setSelectedPointToAdd] = useState<TracePoint | null>(null);

  // получение значения точек для добавления в трассу из канала "Скважины"
  const points: TracePoint[] = wellsChannel ? wellsChannel.data.rows.map(row => ({
    UWID: row.Cells[1],
    name: row.Cells[2] || row.Cells[3] || 'Без имени',
  })) : [];

  // получение скважин, которых ещё нет в данной трассе
  const pointsToAddData = items ? points.filter(p => items.every(i => i !== p.UWID)) : points;
  const [pointsToAdd, setPointsToAdd] = useState<TracePoint[] | null>(pointsToAddData);

  // выбор точки для добавления в ComboBox компоненте
  const handleComboBoxChange = (event: DropDownListChangeEvent) => {
    setSelectedPointToAdd(event.target.value);
  };

  // изменение имени трассы
  const changeName = (event: InputChangeEvent) => {
    const newName = event.target.value.toString();
    dispatch(setTraceName(newName));
  }

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

  // добавление точки в трассу
  const addPoint = (pointUWID: string) => {
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

  // список точек трассы
  const itemsListElements = items ? items.map(i => <TraceListItem
    key={i}
    pointUWID={i}
    points={points}
    selectedTraceItemUWID={selectedTraceItemUWID}
    setSelectedTraceItemUWID={setSelectedTraceItemUWID}
    removePoint={removePoint}
  />) : <div></div>;

  if(!tracesState.currentTraceData) return <div></div>;

  return (
    <section className='trace-edit-tab'>
      <div className='trace-edit-tab__header'>
        <div className='title'>
          <div>Трасса</div>
        </div>
        <span className='k-clear-value'>
        <span className={'k-icon k-i-close'}
              onClick={() => {
                dispatch(setTraceEditing(false));
              }}
        />
      </span>
      </div>
      <div className='trace-edit-tab__body'>
        <div className='trace-edit-tab__inner-block'>
          <div className='menu-header trace-edit-tab__title-text'>Имя</div>
          <Input style={{fontSize: '12px'}}
                 className='change-name'
                 type='text' value={name}
                 onChange={changeName}
          />
        </div>
        <div className='trace-edit-tab__inner-block'>
          <div className='menu-header trace-edit-tab__title-text'>Элементы</div>
          <div className='change-order-buttons'>
            <Button
              style={{width: '20px', height: '20px'}}
              icon='sort-asc-sm'
              disabled={false}
              onClick={()=> movePoint(selectedTraceItemUWID, 'up')}
            />
            <Button
              style={{width: '20px', height: '20px'}}
              icon='sort-desc-sm'
              disabled={false}
              onClick={()=> movePoint(selectedTraceItemUWID, 'down')}
            />
          </div>
          <div className='items'>
            {items && wellsChannel && itemsListElements}
            {!wellsChannel && <p>Не удалось загрузить данные скважин</p>}
          </div>
        </div>
        <div className='trace-edit-tab__inner-block'>
          <div className='menu-header trace-edit-tab__title-text'>Добавление</div>
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
            <span>Добавить точку</span>
          </Button>
        </div>
      </div>
    </section>
  );
};

interface TraceListItemProps {
  pointUWID: string | null,
  points,
  selectedTraceItemUWID: string | null,
  setSelectedTraceItemUWID,
  removePoint
}

// компонент для списка скважин трассы
const TraceListItem = ( {pointUWID, points, selectedTraceItemUWID,
                          setSelectedTraceItemUWID, removePoint}: TraceListItemProps) => {
  if (!pointUWID ||
    !points
  ) return <></>;
  const point= points.find(p => p.UWID === pointUWID)
  return (
    <button
      className={selectedTraceItemUWID === point?.UWID ? 'k-button trace-item selected' : 'k-button trace-item'}
      disabled={false} onClick={() => setSelectedTraceItemUWID(point?.UWID)}
    >
      <span>{point?.name || "Без имени"}</span>
      <span className='k-clear-value'>
        <span className={'k-icon k-i-x'} onClick={() => removePoint(point?.UWID)}/>
      </span>
    </button>
  );
}
