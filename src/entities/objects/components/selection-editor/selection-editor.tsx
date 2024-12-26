import { type ChangeEvent, useMemo } from 'react';
import { type TFunction, useTranslation } from 'react-i18next';
import { useChannel, createLookupMap } from 'entities/channel';
import { useSelectionState } from '../../store/objects.store';
import { setSelectionState, cancelSelectionEditing } from '../../store/selection.actions';
import { saveSelection } from '../../store/selection.thunks';
import { SelectionManager } from '../../lib/selection';

import './selection-editor.scss';
import { Button, Input } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { SelectionItemEditor } from './selection-item-editor';


interface SelectionEditorProps {
  manager: SelectionManager;
  close: () => void;
}
interface SelectionNameEditorProps {
  model: SelectionModel;
  placeMap: Map<LookupItemID, string>;
  t: TFunction;
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
      <SelectionNameEditor model={model} placeMap={placeNameMap} t={t}/>
      <SelectionItemEditor model={model} placeMap={placeNameMap} info={itemInfo}/>
      <div className={'wm-dialog-actions'} style={{paddingTop: 8}}>
        <Button onClick={apply}>{t('base.apply')}</Button>
        <Button onClick={cancel}>{t('base.cancel')}</Button>
      </div>
    </>
  );
};

const SelectionNameEditor = ({model, placeMap, t}: SelectionNameEditorProps) => {
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setSelectionState({model: {...model, name: newName}});
  };
  const setDefault = () => {
    const newName = getDefaultName(model, placeMap);
    setSelectionState({model: {...model, name: newName}});
  };

  const addon = (
    <SyncOutlined title={t('selection.default-name')} onClick={setDefault} style={{padding: 5}}/>
  );
  return (
    <Input
      className={'selection-name-editor'} spellCheck={false} addonAfter={addon}
      value={model.name} placeholder={t('selection.name-placeholder')} onChange={onChange}
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
