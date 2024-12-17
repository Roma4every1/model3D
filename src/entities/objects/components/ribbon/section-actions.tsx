import type { TFunction } from 'react-i18next';
import { TraceManager } from '../../lib/trace';
import { setCurrentTrace } from '../../store/objects.actions';
import { createTrace, deleteTrace } from '../../store/objects.thunks';
import { closeWindow, showDialog } from 'entities/window';
import { Button } from 'antd';
import { BigButton, MenuSection } from 'shared/ui';
import createTraceIcon from 'assets/trace/create-trace.png';
import deleteTraceIcon from 'assets/trace/detele-trace.png';
import editTraceIcon from 'assets/trace/edit-trace.png';


interface TraceActionSectionProps {
  manager: TraceManager;
  t: TFunction;
  hasMap: boolean;
}
interface DeleteTraceWindowProps {
  model: TraceModel;
  onClose: () => void;
  t: TFunction;
}

export const TraceActionSection = ({manager, t, hasMap}: TraceActionSectionProps) => {
  const { model, editing, creating } = manager;
  const editTrace = () => setCurrentTrace(undefined, undefined, true);

  const openDialog = () => {
    const windowID = 'trace-delete-window';
    const onClose = () => closeWindow(windowID);
    const dialogProps = {title: t('trace.delete-dialog'), onClose};
    const content = <DeleteTraceDialog model={model} onClose={onClose} t={t}/>;
    showDialog(windowID, dialogProps, content);
  };

  return (
    <MenuSection header={t('trace.controls-section')} className={'big-buttons'}>
      <BigButton
        text={t('trace.create')} icon={createTraceIcon}
        onClick={createTrace} disabled={editing || creating || !hasMap}
      />
      <BigButton
        text={t('trace.delete')} icon={deleteTraceIcon}
        onClick={openDialog} disabled={!model || editing || creating}
      />
      <BigButton
        text={t('trace.edit')} icon={editTraceIcon}
        onClick={editTrace} disabled={!model || editing || creating || !hasMap}
      />
    </MenuSection>
  );
};

const DeleteTraceDialog = ({model, onClose, t}: DeleteTraceWindowProps) => {
  const onApply = () => {
    deleteTrace().then();
    onClose();
  };

  return (
    <>
      <div>{t('trace.delete-dialog-label')}</div>
      <ul style={{margin: 0, padding: '0.5em 1.5em'}}>
        <li>Название: <b>{model.name}</b></li>
        <li>Узлов: <b>{model.nodes.length}</b></li>
      </ul>
      <div className={'wm-dialog-actions'}>
        <Button onClick={onApply}>{t('base.yes')}</Button>
        <Button onClick={onClose}>{t('base.no')}</Button>
      </div>
    </>
  );
};
