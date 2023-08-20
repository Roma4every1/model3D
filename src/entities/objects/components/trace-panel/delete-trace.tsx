import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setOpenedWindow } from '../../../windows';
import { deleteTrace } from '../../store/objects.thunks';

import { BigButton } from 'shared/ui';
import { Button } from '@progress/kendo-react-buttons';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import deleteTraceIcon from 'assets/images/trace/detele-trace.png';


interface DeleteTraceProps {
  trace: TraceState,
}
interface DeleteTraceWindowProps {
  model: TraceModel,
}


export const DeleteTrace = ({trace}: DeleteTraceProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const openDialog = () => {
    const window = <DeleteTraceDialog key={'trace-delete-window'} model={trace.model}/>;
    dispatch(setOpenedWindow('trace-delete-window', true, window));
  };

  return (
    <BigButton
      text={t('trace.delete')} icon={deleteTraceIcon}
      action={openDialog} disabled={!trace.model || trace.editing || trace.creating}
    />
  );
};

const DeleteTraceDialog = ({model}: DeleteTraceWindowProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const onClose = () => {
    dispatch(setOpenedWindow('trace-delete-window', false, null));
  };

  const onApply = () => {
    dispatch(deleteTrace());
    onClose();
  };

  return (
    <Dialog title={t('trace.delete-dialog')} onClose={onClose}>
      <div>{t('trace.delete-dialog-label')}</div>
      <ul style={{margin: 0, padding: '0.5em 1.5em'}}>
        <li>Название: <b>{model.name}</b></li>
        <li>Узлов: <b>{model.nodes.length}</b></li>
      </ul>
      <DialogActionsBar>
        <Button onClick={onApply}>{t('base.yes')}</Button>
        <Button onClick={onClose}>{t('base.no')}</Button>
      </DialogActionsBar>
    </Dialog>
  );
};
