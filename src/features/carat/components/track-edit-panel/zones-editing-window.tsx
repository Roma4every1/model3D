import { FunctionComponent, KeyboardEvent, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Window } from '@progress/kendo-react-dialogs';
import { TextBox, TextBoxChangeEvent } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import { ListBox, ListBoxToolbar, processListBoxData } from '@progress/kendo-react-listbox';
import { ListBoxItemClickEvent, ListBoxToolbarClickEvent } from '@progress/kendo-react-listbox';
import { setOpenedWindow } from 'entities/windows';
import './zones-editing-window.scss';


interface ZonesEditingWindowProps {
  stage: ICaratStage,
}
interface ZoneEditorProps {
  i: number,
  data: ZoneListItem[],
  toolbar: FunctionComponent,
  onItemClick: any,
  allTypes: Set<CaratCurveType>,
  addItem: (newType: CaratCurveType, index: number) => void,
  deleteZone: (index: number) => void,
}

type ZoneListItem = {type: CaratCurveType, selected: boolean};
type ZoneList = ZoneListItem[][];


const toolbarTools = ['transferTo', 'transferFrom', 'transferAllTo', 'transferAllFrom', 'remove'];

export const ZonesEditingWindow = ({stage}: ZonesEditingWindowProps) => {
  const dispatch = useDispatch();
  const [state, setState] = useState<ZoneList>([]);
  const [allTypes, setAllTypes] = useState<Set<CaratCurveType>>();

  useEffect(() => {
    const [newState, newAllTypes] = zonesToState(stage.getZones());
    setState(newState);
    setAllTypes(newAllTypes);
  }, [stage]);

  const itemClick = (e: ListBoxItemClickEvent, index: number) => {
    for (const list of state) for (const item of list) item.selected = false;
    const itemType = e.dataItem.type;
    state[index].find((item) => item.type === itemType).selected = true;
    setState([...state]);
  };

  const toolClick = (e: ListBoxToolbarClickEvent, index: number, connectedIndex: number) => {
    const list = state[index], connectedList = state[connectedIndex];
    const result = processListBoxData(list, connectedList, e.toolName, 'selected');
    state[index] = result.listBoxOneData;
    state[connectedIndex] = result.listBoxTwoData;
    setState([...state]);
  };

  const addItem = (newType: CaratCurveType, index: number) => {
    state[index].push({type: newType, selected: false});
    allTypes.add(newType);
    setAllTypes(allTypes);
    setState([...state]);
  };

  const addZone = () => {
    setState([...state, []]);
  };

  const deleteZone = (index: number) => {
    const [zone] = state.splice(index, 1);
    for (const item of zone) allTypes.delete(item.type);
    setState([...state]);
  };

  const onClose = () => {
    dispatch(setOpenedWindow('curve-zones', false, null));
  };

  const onSubmit = () => {
    stage.setZones(stateToZones(state));
    stage.render(); onClose();
  };

  return (
    <Window
      title={'Редактирование зон кривых'} maximizeButton={() => null}
      width={720} height={480} resizable={false} style={{zIndex: 99}} onClose={onClose}
    >
      <div className={'zones-editing-window'}>
        {state.length
          ? <div style={{gridTemplateColumns: '1fr '.repeat(state.length)}}>
              {state.map(listToEditor, {allTypes, itemClick, toolClick, addItem, deleteZone})}
            </div>
          : <div className={'map-not-found'}>Зоны отсутствуют</div>}
        <div>
          <Button onClick={addZone}>Добавить зону</Button>
          <Button onClick={onSubmit} style={{width: 50}}>Ок</Button>
        </div>
      </div>
    </Window>
  );
};

const ZoneEditor = ({i, data, toolbar, onItemClick, allTypes, addItem, deleteZone}: ZoneEditorProps) => {
  const [value, setValue] = useState('');
  const [valid, setValid] = useState(true);

  const onAdd = () => {
    if (value) addItem(value, i);
    setValue('');
  };

  const onZoneDelete = () => {
    deleteZone(i);
  };

  const onChange = (e: TextBoxChangeEvent) => {
    const newValue = e.value as string;
    const newValid = !allTypes.has(newValue);
    setValid(newValid);
    setValue(newValue);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.nativeEvent.key === 'Enter' && valid) onAdd();
  };

  return (
    <div className={'zone-editor'}>
      <ListBox
        data={data} textField={'type'} selectedField={'selected'}
        onItemClick={onItemClick} draggable={false} toolbar={toolbar}
      />
      <Button icon={'delete'} themeColor={'primary'} title={'Удалить зону'} onClick={onZoneDelete}/>
      <div>
        <TextBox rounded={null} value={value} valid={valid} onChange={onChange} onKeyDown={onKeyDown}/>
        <Button icon={'plus'} disabled={!valid} onClick={onAdd} title={'Добавить тип'}/>
      </div>
    </div>
  );
};

function listToEditor(this: any, list: ZoneListItem[], i: number, state: ZoneList) {
  const { allTypes, itemClick, toolClick, addItem, deleteZone } = this;
  const connectedIndex = (i + 1) % state.length;

  const Toolbar = () => {
    return (
      <ListBoxToolbar
        data={list} dataConnected={state[connectedIndex]}
        tools={toolbarTools} onToolClick={(e) => toolClick(e, i, connectedIndex)}
      />
    );
  };
  return (
    <ZoneEditor
      key={i} i={i} data={list}
      onItemClick={(e) => itemClick(e, i)}
      toolbar={Toolbar} allTypes={allTypes}
      addItem={addItem} deleteZone={deleteZone}
    />
  );
}

function zonesToState(zones: CaratZone[]): [ZoneList, Set<CaratCurveType>] {
  const allTypes = new Set<CaratCurveType>();
  const zoneToList = (type: CaratCurveType) => { allTypes.add(type); return {type, selected: false}; };
  return [zones.map((zone) => zone.types.map(zoneToList)), allTypes];
}

function stateToZones(state: ZoneList): CaratZone[] {
  const listToZone = (item: ZoneListItem) => item.type;
  return state.map((list) => ({relativeWidth: null, types: list.map(listToZone)}));
}
