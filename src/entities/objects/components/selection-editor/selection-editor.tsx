import { type ChangeEvent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useChannel, createLookupMap } from 'entities/channel';
import { useSelectionState } from '../../store/objects.store';
import { setSelectionState, cancelSelectionEditing } from '../../store/selection.actions';
import { saveSelection } from '../../store/selection.thunks';
import { SelectionManager } from '../../lib/selection';

import './selection-editor.scss';
import { Button, Input } from 'antd';
import { SelectionItemEditor } from './selection-item-editor';


interface SelectionEditorProps {
  manager: SelectionManager;
  close: () => void;
}

export const SelectionEditor = ({manager, close}: SelectionEditorProps) => {
  const { t } = useTranslation();
  const { model, initModel } = useSelectionState();

  const itemInfo = manager.info.items.details.info;
  const placeChannel = useChannel(itemInfo.place.lookups.name.id);

  const placeNameMap = useMemo(() => {
    return createLookupMap<string>(placeChannel);
  }, [placeChannel]);

  const apply = () => {
    if (!model.name || (initModel && model.name === getDefaultName(initModel, placeNameMap))) {
      model.name = getDefaultName(model, placeNameMap);
    }
    saveSelection().then();
    close();
  };
  const cancel = () => {
    cancelSelectionEditing();
    close();
  };

  return (
    <>
      <SelectionNameEditor model={model}/>
      <SelectionItemEditor model={model} placeMap={placeNameMap} info={itemInfo}/>
      <div className={'wm-dialog-actions'} style={{paddingTop: 8}}>
        <Button onClick={apply}>{t('base.apply')}</Button>
        <Button onClick={cancel}>{t('base.cancel')}</Button>
      </div>
    </>
  );
};

const SelectionNameEditor = ({model}: {model: SelectionModel}) => {
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setSelectionState({model: {...model, name: newName}});
  };

  return (
    <Input
      style={{fontFamily: 'Roboto'}} spellCheck={false}
      value={model.name} placeholder={'Название'} onChange={onChange}
    />
  );
};

function getDefaultName(model: SelectionModel, placeMap: LookupMap<string>): string {
  const toText = (item: SelectionItem) => {
    let text = item.name;
    const placeName = placeMap.get(item.place);
    if (placeName) text += ' (' + placeName + ')';
    return text;
  };
  return model.items.map(toText).join(', ');
}
