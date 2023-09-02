import { useDispatch } from 'shared/lib';
import { useTranslation } from 'react-i18next';
import { closeWindow, showDialog } from 'entities/window';
import { deleteTrace } from '../../store/objects.thunks';

import { BigButton } from 'shared/ui';
import { Button } from '@progress/kendo-react-buttons';
import deleteTraceIcon from 'assets/images/trace/detele-trace.png';


interface DeleteTraceProps {
  trace: TraceState;
}
interface DeleteTraceWindowProps {
  model: TraceModel;
  onClose: () => void;
}


export const DeleteTrace = ({trace}: DeleteTraceProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const openDialog = () => {
    const windowID = 'trace-delete-window';
    const onClose = () => dispatch(closeWindow(windowID));
    const dialogProps = {title: t('trace.delete-dialog'), onClose};
    const content = <DeleteTraceDialog model={trace.model} onClose={onClose}/>;
    dispatch(showDialog(windowID, dialogProps, content));
  };

  return (
    <BigButton
      text={t('trace.delete')} icon={deleteTraceIcon}
      action={openDialog} disabled={!trace.model || trace.editing || trace.creating}
    />
  );
};

const DeleteTraceDialog = ({model, onClose}: DeleteTraceWindowProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const onApply = () => {
    dispatch(deleteTrace());
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
