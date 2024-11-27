import { useTranslation } from 'react-i18next';
import { closeWindow, showDialog } from 'entities/window';
import { deleteTrace } from '../../store/objects.thunks';

import { BigButton } from 'shared/ui';
import { Button } from '@progress/kendo-react-buttons';
import deleteTraceIcon from 'assets/trace/detele-trace.png';


interface DeleteTraceProps {
  traceManager: ITraceManager;
}
interface DeleteTraceWindowProps {
  model: TraceModel;
  onClose: () => void;
}


export const DeleteTrace = (props: DeleteTraceProps) => {
  const { t } = useTranslation();
  const { model, editing, creating } = props.traceManager;

  const openDialog = () => {
    const windowID = 'trace-delete-window';
    const onClose = () => closeWindow(windowID);
    const dialogProps = {title: t('trace.delete-dialog'), onClose};
    const content = <DeleteTraceDialog model={model} onClose={onClose}/>;
    showDialog(windowID, dialogProps, content);
  };

  return (
    <BigButton
      text={t('trace.delete')} icon={deleteTraceIcon}
      onClick={openDialog} disabled={!model || editing || creating}
    />
  );
};

const DeleteTraceDialog = ({model, onClose}: DeleteTraceWindowProps) => {
  const { t } = useTranslation();

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
