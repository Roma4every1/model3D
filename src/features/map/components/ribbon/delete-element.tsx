import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { MapStage } from '../../lib/map-stage';
import { setMapEditState } from '../../store/map-edit.actions';


interface DeleteElementWindowProps {
  id: FormID;
  stage: MapStage;
  onClose: () => void;
}

export const DeleteElementWindow = ({id, stage, onClose}: DeleteElementWindowProps) => {
  const { t } = useTranslation();
  const activeElement = stage.getActiveElement();
  const activeElementLayer = stage.getActiveElementLayer();

  const deleteElement = () => {
    stage.deleteActiveElement();
    stage.render();
    activeElementLayer.modified = true;
    setMapEditState(id, {modified: true});
    onClose();
  };

  return (
    <>
      <div>{t('map.areYouSureToDelete')}</div>
      <ul style={{paddingLeft: '16px'}}>
        <li><b>Слой: </b><span>{activeElementLayer.displayName}</span></li>
        <li><b>Тип элемента: </b><span>{t('map.' + activeElement.type)}</span></li>
      </ul>
      <div className={'wm-dialog-actions'}>
        <Button onClick={deleteElement}>{t('base.yes')}</Button>
        <Button onClick={onClose}>{t('base.no')}</Button>
      </div>
    </>
  );
};
