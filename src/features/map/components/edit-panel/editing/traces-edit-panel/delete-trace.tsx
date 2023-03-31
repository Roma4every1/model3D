import {BigButton} from "../../../../../../shared/ui";
import deleteTraceIcon from './../../../../../../assets/images/trace/trace_remove_L.png'
import {useDispatch} from "react-redux";
import {deleteTraceThunk} from "../../../../store/traces.thunks";
import {useTranslation} from "react-i18next";
import {useCallback} from "react";
import {setOpenedWindow} from "../../../../../../entities/windows";
import {clearMapSelect} from "../../../../store/maps.actions";
import {Dialog, DialogActionsBar} from "@progress/kendo-react-dialogs";
import {Button} from "@progress/kendo-react-buttons";

interface DeleteTraceProps {
  mapState: MapState,
  formID: FormID,
  traces: Channel
}

export const DeleteTrace = ({mapState, formID, traces}: DeleteTraceProps) => {
  const dispatch = useDispatch();

  const isTraceEditing = mapState?.isTraceEditing;

  // получение значения текущей трассы из store
  const currentTraceRow = mapState.currentTraceRow;

  const disabled = !currentTraceRow ||
    isTraceEditing ||
    mapState?.isElementEditing;

  const showDeleteTraceWindow = () => {
    const name = 'traceDeleteWindow';
    const window = <DeleteTraceWindow key={name} mapState={mapState} formID={formID} traces={traces}/>;
    dispatch(setOpenedWindow(name, true, window));
  };

  return <BigButton
    text={'Удалить'} icon={deleteTraceIcon}
    action={showDeleteTraceWindow} disabled={disabled}
  />;
}

interface DeleteTraceWindowProps {
  mapState: MapState,
  formID: FormID,
  traces: Channel
}

export const DeleteTraceWindow = ({mapState, formID, traces}: DeleteTraceWindowProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const traceName = mapState.currentTraceRow.Cells.name
  const closeDeleteWindow = useCallback(() => {
    dispatch(setOpenedWindow('traceDeleteWindow', false, null));
  }, [dispatch]);

  const handleDelete = useCallback(() => {
    if (!mapState || !mapState.utils.updateCanvas) return;
    const currentTraceRow = mapState.currentTraceRow;
    if(!currentTraceRow) return;

    // получение всех трасс из каналов
    const tableID = traces.tableID;
    const deleteID = traces.data.rows.findIndex((row) => row.ID === currentTraceRow.ID);
    dispatch(deleteTraceThunk(formID, tableID, deleteID));

    dispatch(clearMapSelect(formID));
    mapState.utils.updateCanvas();
    closeDeleteWindow();
  }, [mapState, closeDeleteWindow, dispatch, formID]);

  return (
    <Dialog
      key={'traceDeleteWindow'}
      title={t('map.delete-element')}
      onClose={closeDeleteWindow}
    >
      <div>{t('map.areYouSureToDeleteTrace')}</div>
      <ul style={{paddingLeft: '16px'}}>
        <li><b>Трасса: </b><span>{traceName}</span></li>
      </ul>
      <DialogActionsBar>
        <div className={'windowButtonContainer'}>
          <Button className={'windowButton'} onClick={handleDelete}>
            {t('base.yes')}
          </Button>
        </div>
        <div className={'windowButtonContainer'}>
          <Button className={'windowButton'} onClick={closeDeleteWindow}>
            {t('base.no')}
          </Button>
        </div>
      </DialogActionsBar>
    </Dialog>
  );
};
