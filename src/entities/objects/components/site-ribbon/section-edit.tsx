import type { ChangeEvent } from 'react';
import type { TFunction } from 'react-i18next';
import { Input } from 'antd';
import { MenuSection, BigButton, IconRow, IconRowButton } from 'shared/ui';
import { setSiteState } from '../../store/objects.actions';
import { deleteSite, saveSite } from '../../store/site.thunks';

import applyIcon from 'assets/objects/apply.png';
import cancelIcon from 'assets/objects/cancel.png';
import movePointIcon from 'assets/map/move-point.png';
import appendPointIcon from 'assets/map/add-end.png';
import insertPointIcon from 'assets/map/add-between.png';
import removePointIcon from 'assets/map/delete-point.png';


interface SiteEditSectionProps {
  state: SiteState;
  t: TFunction;
}
interface SiteEditModesProps {
  mode: SiteEditMode;
  t: TFunction;
}
interface SiteNameEditorProps {
  model: SiteModel;
  editing: boolean;
}

export const SiteEditSection = ({state, t}: SiteEditSectionProps) => {
  const { model, initModel, editMode } = state;
  const editing = editMode !== null;
  const canSave = editing && model && model.points.length > 2;

  const cancel = () => {
    if (initModel) {
      setSiteState({model: initModel, initModel: null, editMode: null});
    } else {
      deleteSite().then();
    }
  };

  return (
    <MenuSection header={t('site.edit-section')} className={'big-buttons'}>
      <BigButton
        text={t('base.apply')} icon={applyIcon}
        onClick={saveSite} disabled={!canSave}
      />
      <BigButton
        text={t('base.cancel')} icon={cancelIcon}
        onClick={cancel} disabled={!editing}
      />
      <div style={{paddingLeft: 4}}>
        <SiteEditModes mode={editMode} t={t}/>
        <SiteNameEditor model={model} editing={editing}/>
      </div>
    </MenuSection>
  );
};

const SiteEditModes = ({mode, t}: SiteEditModesProps) => {
  const setMode = (newMode: SiteEditMode) => {
    if (mode !== newMode) setSiteState({editMode: newMode});
  };
  const disabled = mode === null;

  return (
    <IconRow>
      <IconRowButton
        icon={movePointIcon} title={t('site.move-point')} active={mode === 'site-move-point'}
        onClick={() => setMode('site-move-point')} disabled={disabled}
      />
      <IconRowButton
        icon={appendPointIcon} title={t('site.append-point')} active={mode === 'site-append-point'}
        onClick={() => setMode('site-append-point')} disabled={disabled}
      />
      <IconRowButton
        icon={insertPointIcon} title={t('site.insert-point')} active={mode === 'site-insert-point'}
        onClick={() => setMode('site-insert-point')} disabled={disabled}
      />
      <IconRowButton
        icon={removePointIcon} title={t('site.remove-point')} active={mode === 'site-remove-point'}
        onClick={() => setMode('site-remove-point')} disabled={disabled}
      />
    </IconRow>
  );
};

const SiteNameEditor = ({model, editing}: SiteNameEditorProps) => {
  const canEdit = model && editing;
  let value: string;
  let placeholder: string;

  if (canEdit) {
    value = model.name;
    placeholder = 'Название';
  } else {
    value = '';
  }
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setSiteState({model: {...model, name: newName}});
  };

  return (
    <Input
      style={{width: 140, marginTop: 4}} placeholder={placeholder} spellCheck={false}
      value={value} onChange={onChange} disabled={!canEdit}
    />
  );
};
