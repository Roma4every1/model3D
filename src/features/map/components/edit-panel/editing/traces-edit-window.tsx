import {useState} from "react";
import './traces-edit-window.scss'
import {useDispatch} from "react-redux";
import {setCurrentTrace, setTraceEditing} from "../../../store/maps.actions";
import {ComboBox, DropDownListChangeEvent} from "@progress/kendo-react-dropdowns";
import {Button} from "@progress/kendo-react-buttons";
import {Input, InputChangeEvent} from "@progress/kendo-react-inputs";

interface TracesEditWindowProps {
  formID: string | null,
  mapState: MapState,
  traces: Channel
}

interface TraceListItemProps {
  point: MapPoint,
  selectedTraceItemUWID: string | null,
  setSelectedTraceItemUWID,
  removePoint
}

export const TracesEditWindow = ({formID, mapState}: TracesEditWindowProps) => {
  const dispatch = useDispatch();
  const [selectedTraceItemUWID, setSelectedTraceItemUWID] = useState<string | null>();
  const [selectedPointToAdd, setSelectedPointToAdd] = useState<MapPoint | null>()

  const handleComboBoxChange = (event: DropDownListChangeEvent) => {
    setSelectedPointToAdd(event.target.value);
  };

  const pointsToAdd = mapState?.mapData?.points;

  // useEffect(() => {
  //   console.log(selectedTraceItemUWID)
  //   console.log(mapState?.currentTraceRow?.Cells)
  // }, [mapState?.currentTraceRow?.Cells, selectedTraceItemUWID])

  if(!mapState?.currentTraceRow) return <div></div>;

  const { Cells } = mapState.currentTraceRow;
  if(!Cells) return <div></div>;

  const { name, items } = Cells
  const itemsArray = items.split('---')

  const changeName = (event: InputChangeEvent) => {
    const newTraceRow : TraceRow = {
      ID: mapState.currentTraceRow.ID,
      Cells: { ...Cells, name: event.target.value.toString() }
    };
    dispatch(setCurrentTrace(formID, newTraceRow))
  }

  const movePoint = (pointUWID: string, direction: 'down' | 'up') => {
    if(pointUWID === null) return;

    const oldPoints = Cells.items.split('---')
    const pointIndex = oldPoints.findIndex(p => p === pointUWID)

    let newPoints = oldPoints.concat().filter(p => p !== pointUWID)
    if (direction === 'up') {
      newPoints.splice(pointIndex <= 0 ? newPoints.length : pointIndex - 1, 0, pointUWID)
    }
    if (direction === 'down') {
      newPoints.splice(pointIndex >= newPoints.length ? 0 : pointIndex + 1, 0, pointUWID)
    }

    const newTraceRow : TraceRow = {
      ID: mapState.currentTraceRow.ID,
      Cells: { ...Cells, items: newPoints.join('---') }
    };
    dispatch(setCurrentTrace(formID, newTraceRow))
  }

  const removePoint = (pointUWID: string) => {
    if (pointUWID === null) return;

    const newTraceRow : TraceRow = {
      ID: mapState.currentTraceRow.ID,
      Cells: { ...Cells, items: Cells.items.split('---').filter(p => p !== pointUWID).join('---') }
    };
    dispatch(setCurrentTrace(formID, newTraceRow))
  }

  const addPoint = (pointUWID: string) => {
    if (pointUWID === null) return;

    const newItems = Cells.items.split('---')
    newItems.push(pointUWID)

    const newTraceRow : TraceRow = {
      ID: mapState.currentTraceRow.ID,
      Cells: { ...Cells, items: newItems.join('---') }
    };
    dispatch(setCurrentTrace(formID, newTraceRow))
  }

  const itemsListComponents = itemsArray.map(i =>
    <TraceListItem point={mapState.mapData.points.find(p => p.UWID === i)}
                   key={i}
                   setSelectedTraceItemUWID={setSelectedTraceItemUWID}
                   selectedTraceItemUWID={selectedTraceItemUWID}
                   removePoint={removePoint}
    />
  )

  return (
    <section className='trace-edit-window'>
      <div className="trace-edit-window__header">
        <div className='title'>
          <div>Трасса</div>
        </div>
        <span className='k-clear-value'>
          <span className={'k-icon k-i-close'}
                onClick={() => dispatch(setTraceEditing(formID, false))}
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
              icon='sort-asc-sm'
              disabled={false}
              onClick={()=> movePoint(selectedTraceItemUWID, 'up')}
            />
            <Button
              icon='sort-desc-sm'
              disabled={false}
              onClick={()=> movePoint(selectedTraceItemUWID, 'down')}
            />
          </div>
          <div className='items'>
            { itemsListComponents }
          </div>
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
            disabled={false}
            onClick={()=> addPoint(selectedPointToAdd.UWID)}
          >
            <span>Добавить точку</span>
          </Button>
        </div>
      </div>
    </section>
  );
};

export const TraceListItem = ({point, selectedTraceItemUWID, setSelectedTraceItemUWID, removePoint} : TraceListItemProps) => <button
  className={selectedTraceItemUWID === point.UWID ? 'k-button trace-item selected' : 'k-button trace-item'}
  disabled={false} onClick={() => setSelectedTraceItemUWID(point.UWID)}
>
  <span>{point.name}</span>
  <span className='k-clear-value'>
    <span className={'k-icon k-i-x'} onClick={() => removePoint(point.UWID)}/>
  </span>
</button>
