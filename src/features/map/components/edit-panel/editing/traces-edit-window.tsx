import {useState} from "react";
import './traces-edit-window.scss'
import {useDispatch} from "react-redux";
import {
  setCurrentTrace,
  setTraceEditing,
  setTraceOldData
} from "../../../store/maps.actions";
import {ComboBox, DropDownListChangeEvent} from "@progress/kendo-react-dropdowns";
import {Button} from "@progress/kendo-react-buttons";
import {Input, InputChangeEvent} from "@progress/kendo-react-inputs";
import {ListView, ListViewItemProps} from "@progress/kendo-react-listview";

interface TracesEditWindowProps {
  formID: string | null,
  mapState: MapState,
  traces: Channel
}

export const TracesEditWindow = ({formID, mapState}: TracesEditWindowProps) => {
  const dispatch = useDispatch();
  const [selectedTraceItemUWID, setSelectedTraceItemUWID] = useState<string | null>(null);
  const [selectedPointToAdd, setSelectedPointToAdd] = useState<MapPoint | null>(null);

  const handleComboBoxChange = (event: DropDownListChangeEvent) => {
    setSelectedPointToAdd(event.target.value);
  };

  const pointsToAdd = mapState?.mapData?.points;

  if(!mapState?.currentTraceRow) return <div></div>;

  const { Cells } = mapState.currentTraceRow;
  if(!Cells) return <div></div>;

  const { name, items } = Cells;
  const itemsArray = items.split('---');

  const changeName = (event: InputChangeEvent) => {
    const newTraceRow : TraceRow = {
      ID: mapState.currentTraceRow.ID,
      Cells: { ...Cells, name: event.target.value.toString() }
    };
    dispatch(setCurrentTrace(formID, newTraceRow));
  }

  const movePoint = (pointUWID: string, direction: 'down' | 'up') => {
    if(!pointUWID) return;

    const oldPoints = Cells.items.split('---');
    const pointIndex = oldPoints.findIndex(p => p === pointUWID);

    let newPoints = oldPoints.concat().filter(p => p !== pointUWID);
    if (direction === 'up') {
      newPoints.splice(pointIndex <= 0 ? newPoints.length : pointIndex - 1, 0, pointUWID);
    }
    if (direction === 'down') {
      newPoints.splice(pointIndex >= newPoints.length ? 0 : pointIndex + 1, 0, pointUWID);
    }

    const newTraceRow : TraceRow = {
      ID: mapState.currentTraceRow.ID,
      Cells: { ...Cells, items: newPoints.join('---') }
    };
    dispatch(setCurrentTrace(formID, newTraceRow));
  }

  const removePoint = (pointUWID: string) => {
    if (pointUWID === null) return;

    const newTraceRow : TraceRow = {
      ID: mapState.currentTraceRow.ID,
      Cells: { ...Cells, items: Cells.items.split('---').filter(p => p !== pointUWID).join('---') }
    };
    dispatch(setCurrentTrace(formID, newTraceRow));
  }

  const addPoint = (pointUWID: string) => {
    if (pointUWID === null) return;

    const newItems = Cells.items.split('---');
    newItems.push(pointUWID);

    const newTraceRow : TraceRow = {
      ID: mapState.currentTraceRow.ID,
      Cells: { ...Cells, items: newItems.join('---') }
    };
    dispatch(setCurrentTrace(formID, newTraceRow))
  }

  const TraceListItemContainer = (props: ListViewItemProps) => (
    <TraceListItem
      {...props}
      pointsToAdd={pointsToAdd}
      selectedTraceItemUWID={selectedTraceItemUWID}
      setSelectedTraceItemUWID={setSelectedTraceItemUWID}
      removePoint={removePoint}
    />
  )

  return (
    <div className="trace-edit-window-container">
      <section className='trace-edit-window'>
        <div className="trace-edit-window__header">
          <div className='title'>
            <div>Трасса</div>
          </div>
          <span className='k-clear-value'>
          <span className={'k-icon k-i-close'}
                onClick={() => {
                  dispatch(setTraceEditing(formID, false));
                  dispatch(setTraceOldData(formID, null));
                }}
          />
        </span>
        </div>
        <div className='trace-edit-window__body'>
          <div className='trace-edit-window__inner-block'>
            <div className='menu-header trace-edit-window__title-text'>Имя</div>
            <Input style={{fontSize: '12px'}}
                   className='change-name'
                   type='text' value={name}
                   onChange={changeName}
            />
          </div>
          <div className='trace-edit-window__inner-block'>
            <div className='menu-header trace-edit-window__title-text'>Элементы</div>
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
            <ListView
              data={itemsArray}
              item={TraceListItemContainer}
              className='items'
              style={{maxHeight: '240px'}}
            />
          </div>
          <div className='trace-edit-window__inner-block'>
            <div className='menu-header trace-edit-window__title-text'>Добавление</div>
            <ComboBox style={{fontSize: '12px'}}
                      data={pointsToAdd}
                      dataItemKey='UWID'
                      value={selectedPointToAdd}
                      textField='name'
                      onChange={handleComboBoxChange}
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
      <div className="flexlayout__splitter flexlayout__splitter_vert" style={{width: "8px"}}></div>
    </div>
  );
};

interface TraceListItemProps extends ListViewItemProps {
  pointsToAdd: MapPoint[],
  selectedTraceItemUWID: string | null,
  setSelectedTraceItemUWID,
  removePoint
}

const TraceListItem = (props: TraceListItemProps) => {
  const data = props.dataItem
  const point= props.pointsToAdd.find(p => p.UWID === data)
  return (
    <button
      className={props.selectedTraceItemUWID === point.UWID ? 'k-button trace-item selected' : 'k-button trace-item'}
      disabled={false} onClick={() => props.setSelectedTraceItemUWID(point.UWID)}
    >
      <span>{point.name}</span>
      <span className='k-clear-value'>
        <span className={'k-icon k-i-x'} onClick={() => props.removePoint(point.UWID)}/>
      </span>
    </button>
  );
}
