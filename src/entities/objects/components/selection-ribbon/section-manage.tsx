import type { TFunction } from 'react-i18next';
import { Button } from 'antd';
import { MenuSection, BigButton } from 'shared/ui';
import { closeWindow, showDialog } from 'entities/window';
import { startSelectionCreating, startSelectionEditing } from '../../store/selection.actions';
import { createSelection, deleteSelection } from '../../store/selection.thunks';
import createSelectionIcon from 'assets/objects/selection-create.svg';
import deleteSelectionIcon from 'assets/objects/selection-delete.svg';
import editSelectionIcon from 'assets/objects/selection-edit.svg';


interface SelectionManageSectionProps {
  state: SelectionState;
  t: TFunction;
}
interface DeleteSelectionDialogProps {
  onClose: () => void;
  t: TFunction;
}

export const SelectionManageSection = ({state, t}: SelectionManageSectionProps) => {
  const { model, editing } = state;
  const create = () => createSelection().then(startSelectionCreating);

  const openDialog = () => {
    const windowID = 'selection-delete-window';
    const onClose = () => closeWindow(windowID);
    const content = <DeleteSelectionDialog onClose={onClose} t={t}/>;
    showDialog(windowID, {title: t('selection.delete-dialog-title'), onClose}, content);
  };

  return (
    <MenuSection header={t('selection.manage-section')} className={'big-buttons'}>
      <BigButton
        text={t('base.create')} icon={createSelectionIcon}
        onClick={create} disabled={editing}
      />
      <BigButton
        text={t('base.delete')} icon={deleteSelectionIcon}
        onClick={openDialog} disabled={editing || !model}
      />
      <BigButton
        text={t('base.edit')} icon={editSelectionIcon}
        disabled={editing || !model} onClick={startSelectionEditing}
      />
    </MenuSection>
  );
};

const DeleteSelectionDialog = ({onClose, t}: DeleteSelectionDialogProps) => {
  const onApply = () => {
    deleteSelection().then();
    onClose();
  };

  return (
    <>
      <div style={{marginBottom: 8}}>{t('selection.delete-dialog-text')}</div>
      <div className={'wm-dialog-actions'}>
        <Button onClick={onApply}>{t('base.yes')}</Button>
        <Button onClick={onClose}>{t('base.no')}</Button>
      </div>
    </>
  );
};
