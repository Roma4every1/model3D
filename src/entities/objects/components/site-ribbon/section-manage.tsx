import type { TFunction } from 'react-i18next';
import { Button } from 'antd';
import { BigButton, MenuSection } from 'shared/ui';
import { showDialog, closeWindow } from 'entities/window';
import { startSiteEditing } from '../../store/objects.actions';
import { createSite, deleteSite } from '../../store/site.thunks';
import createSiteIcon from 'assets/objects/site-create.svg';
import deleteSiteIcon from 'assets/objects/site-delete.svg';
import editSiteIcon from 'assets/objects/site-edit.svg';


interface SiteActionSectionProps {
  state: SiteState;
  hasMap: boolean;
  t: TFunction;
}
interface DeleteSiteDialogProps {
  onClose: () => void;
  t: TFunction;
}

export const SiteManageSection = ({state, hasMap, t}: SiteActionSectionProps) => {
  const { model, editMode } = state;
  const canCreate = editMode === null && hasMap;
  const canDelete = model !== null && editMode === null;
  const canStartEdit = canDelete && hasMap;

  const openDialog = () => {
    const windowID = 'site-delete-window';
    const onClose = () => closeWindow(windowID);
    const content = <DeleteSiteDialog onClose={onClose} t={t}/>;
    showDialog(windowID, {title: t('site.delete-dialog-title'), onClose}, content);
  };

  return (
    <MenuSection header={t('site.manage-section')} className={'big-buttons'}>
      <BigButton
        text={t('base.create')} icon={createSiteIcon}
        onClick={createSite} disabled={!canCreate}
      />
      <BigButton
        text={t('base.delete')} icon={deleteSiteIcon}
        onClick={openDialog} disabled={!canDelete}
      />
      <BigButton
        text={t('base.edit')} icon={editSiteIcon}
        onClick={startSiteEditing} disabled={!canStartEdit}
      />
    </MenuSection>
  );
};

const DeleteSiteDialog = ({onClose, t}: DeleteSiteDialogProps) => {
  const onApply = () => {
    deleteSite().then();
    onClose();
  };

  return (
    <>
      <div style={{marginBottom: 8}}>{t('site.delete-dialog-text')}</div>
      <div className={'wm-dialog-actions'}>
        <Button onClick={onApply}>{t('base.yes')}</Button>
        <Button onClick={onClose}>{t('base.no')}</Button>
      </div>
    </>
  );
};
