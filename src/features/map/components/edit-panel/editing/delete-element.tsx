import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from '@progress/kendo-react-buttons';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { setOpenedWindow } from 'entities/windows';
import { clearMapSelect } from '../../../store/map.actions';


interface DeleteElementWindowProps {
  mapState: MapState,
  formID: FormID,
}

export const DeleteElementWindow = ({mapState, formID}: DeleteElementWindowProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const selectedElement = mapState.element;
  const modifiedLayer = mapState.mapData?.layers?.find(l => l.elements?.includes(selectedElement));

  const closeDeleteWindow = useCallback(() => {
    dispatch(setOpenedWindow('mapDeleteWindow', false, null));
  }, [dispatch]);

  const handleDelete = useCallback(() => {
    if (!mapState || !selectedElement || !mapState.utils.updateCanvas) return;

    let index = modifiedLayer.elements.indexOf(selectedElement);
    modifiedLayer.elements.splice(index, 1);
    modifiedLayer.modified = true;
    mapState.isModified = true;

    dispatch(clearMapSelect(formID));
    mapState.utils.updateCanvas();
    closeDeleteWindow();
  }, [mapState, selectedElement, modifiedLayer, closeDeleteWindow, dispatch, formID]);

  return (
    <Dialog
      key={'deleteMapElementWindow'}
      title={t('map.delete-element')}
      onClose={closeDeleteWindow}
    >
      <div>{t('map.areYouSureToDelete')}</div>
      <ul style={{paddingLeft: '16px'}}>
        <li><b>Подслой: </b><span>{modifiedLayer?.name}</span></li>
        <li><b>Тип элемента: </b><span>{t('map.' + selectedElement.type)}</span></li>
      </ul>
      <DialogActionsBar>
        <Button onClick={handleDelete}>{t('base.yes')}</Button>
        <Button onClick={closeDeleteWindow}>{t('base.no')}</Button>
      </DialogActionsBar>
    </Dialog>
  );
};
