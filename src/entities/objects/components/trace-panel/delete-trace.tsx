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
  trace: TraceState,
}


export const DeleteTrace = ({trace}: DeleteTraceProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const showDeleteTraceWindow = () => {
    const window = <DeleteTraceWindow key={'traceDeleteWindow'} trace={trace}/>;
    dispatch(setOpenedWindow('traceDeleteWindow', true, window));
  };

  return (
    <BigButton
      text={t('trace.delete')} icon={deleteTraceIcon}
      action={showDeleteTraceWindow} disabled={!trace.model || trace.editing || trace.creating}
    />
  );
};

export const DeleteTraceWindow = ({trace}: DeleteTraceWindowProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const closeDeleteWindow = () => {
    dispatch(setOpenedWindow('traceDeleteWindow', false, null));
  };

  const handleDelete = () => {
    dispatch(deleteTrace());
    closeDeleteWindow();
  };

  return (
    <Dialog key={'traceDeleteWindow'} title={t('trace.delete-dialog')} onClose={closeDeleteWindow}>
      <div>{t('trace.areYouSureToDeleteTrace')}</div>
      <ul style={{paddingLeft: '16px'}}>
        <li style={{fontWeight: 'bold'}}>{trace.model.name}</li>
      </ul>
      <DialogActionsBar>
        <div className={'windowButtonContainer'}>
          <Button className={'windowButton'} onClick={handleDelete}>{t('base.yes')}</Button>
        </div>
        <div className={'windowButtonContainer'}>
          <Button className={'windowButton'} onClick={closeDeleteWindow}>{t('base.no')}</Button>
        </div>
      </DialogActionsBar>
    </Dialog>
  );
};
