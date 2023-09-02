import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from '@progress/kendo-react-buttons';
import { clearMapSelect } from '../../../store/map.actions';


interface DeleteElementWindowProps {
  mapState: MapState;
  formID: FormID;
  onClose: () => void;
}


export const DeleteElementWindow = ({mapState, formID, onClose}: DeleteElementWindowProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const selectedElement = mapState.element;
  const modifiedLayer = mapState.mapData?.layers?.find(l => l.elements?.includes(selectedElement));

  const deleteElement = () => {
    if (!mapState || !selectedElement || !mapState.utils.updateCanvas) return;

    let index = modifiedLayer.elements.indexOf(selectedElement);
    modifiedLayer.elements.splice(index, 1);
    modifiedLayer.modified = true;
    mapState.isModified = true;

    dispatch(clearMapSelect(formID));
    mapState.utils.updateCanvas();
    onClose();
  };

  return (
    <>
      <div>{t('map.areYouSureToDelete')}</div>
      <ul style={{paddingLeft: '16px'}}>
        <li><b>Подслой: </b><span>{modifiedLayer?.name}</span></li>
        <li><b>Тип элемента: </b><span>{t('map.' + selectedElement.type)}</span></li>
      </ul>
      <div className={'wm-dialog-actions'}>
        <Button onClick={deleteElement}>{t('base.yes')}</Button>
        <Button onClick={onClose}>{t('base.no')}</Button>
      </div>
    </>
  );
};
