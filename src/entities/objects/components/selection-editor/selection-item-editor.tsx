import { type ChangeEvent, useState, useMemo } from 'react';
import { useChannel } from 'entities/channel';
import { setSelectionState } from '../../store/selection.actions';
import { Input, List } from 'antd';
import VirtualList from 'rc-virtual-list';


type ListItem = SelectionItem & {text: string};

interface SelectionItemEditorProps {
  model: SelectionModel;
  placeMap: LookupMap<string>;
  info: ChannelRecordInfo<keyof SelectionItem>;
}
interface ItemPickerProps {
  model: SelectionModel;
  placeMap: LookupMap<string>;
  info: ChannelRecordInfo<keyof SelectionItem>;
}

export const SelectionItemEditor = ({model, placeMap, info}: SelectionItemEditorProps) => {
  const toItemElement = (item: SelectionItem) => {
    let text = item.name;
    const placeName = placeMap.get(item.place);
    if (placeName) text += ' (' + placeName + ')';

    const onClick = () => {
      const newItems = model.items.filter(i => i !== item);
      setSelectionState({model: {...model, items: newItems}});
    };

    return (
      <li key={item.id}>
        <span>{text}</span>
        <button onClick={onClick}/>
      </li>
    );
  };

  return (
    <div className={'selection-item-editor'}>
      <section>
        <span>Элементы</span>
        <ul className={'selection-items'}>{model.items.map(toItemElement)}</ul>
      </section>
      <section>
        <span>Все</span>
        <ItemPicker model={model} placeMap={placeMap} info={info}/>
      </section>
    </div>
  );
};

const ItemPicker = ({model, placeMap, info}: ItemPickerProps) => {
  const { id: channelID, info: wellInfo } = info.id.lookups.name;
  const channel = useChannel(channelID);
  const [search, setSearch] = useState('');

  const data = useMemo(() => {
    return createListData(channel, placeMap, wellInfo);
  }, [channel, placeMap, wellInfo]);

  const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const rowToElement = (item: ListItem) => {
    const onClick = () => {
      const newItem: SelectionItem = {id: item.id, name: item.name, place: item.place};
      setSelectionState({model: {...model, items: [...model.items, newItem]}});
    };
    return (
      <div className={'picker-list-item'}>
        <button onClick={onClick}/>
        <span>{item.text}</span>
      </div>
    );
  };

  return (
    <>
      <Input
        style={{margin: '0 2px 4px', fontFamily: 'Roboto'}} spellCheck={false}
        value={search} placeholder={'Поиск'} onChange={onSearchChange}
      />
      <List className={'selection-item-picker'}>
        <VirtualList
          data={filterListData(data, model.items, search)} children={rowToElement}
          height={215} itemKey={'id'} itemHeight={22}
        />
      </List>
    </>
  );
};

function filterListData(data: ListItem[], items: SelectionItem[], search: string): ListItem[] {
  if (search) {
    return data.filter(li => items.every(i => i.id !== li.id) && li.text.startsWith(search));
  } else {
    return data.filter(li => items.every(i => i.id !== li.id));
  }
}

function createListData(channel: Channel, placeMap: LookupMap, info: ChannelRecordInfo): ListItem[] {
  const { config, data } = channel;
  if (!data || data.rows.length === 0) return [];

  const idIndex = config.lookupColumns.id.columnIndex;
  const nameIndex = config.lookupColumns.value.columnIndex;
  const placeIndex = data.columns.findIndex(c => c.name === info.place.columnName);

  return data.rows.map((row: ChannelRow) => {
    const name = row[nameIndex];
    const place = row[placeIndex];
    let text = name;
    const placeName = placeMap.get(place);
    if (placeName) text += ' (' + placeName + ')';
    return {id: row[idIndex], name, place, text};
  });
}
