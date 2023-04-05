import { TFunction } from 'react-i18next'
import { useDispatch } from 'react-redux';
import { MenuSection, BigButton } from 'shared/ui';
import { setMapField } from '../../store/maps.actions';
import { mapsAPI } from '../../lib/maps.api';
import { setWindowNotification, callBackWithNotices } from 'entities/windows';
import saveMapIcon from 'assets/images/map/save-map.png';


interface SaveMapProps {
  mapState: MapState,
  formID: FormID,
  t: TFunction
}


export const SaveMap = ({mapState, formID, t}: SaveMapProps) => {
  const dispatch = useDispatch();
  const { mapData, owner, mapID, isModified } = mapState;

  const saveMap = () => {
    if (!mapData || !owner || !mapID) return;
    dispatch(setMapField(formID, 'isModified', false));
    dispatch(setWindowNotification(t('map.notices.save-start')));

    const data = {...mapData,
      x: undefined,
      y: undefined,
      scale: undefined,
      onDrawEnd: undefined,
      layers: mapData.layers.filter(layer => layer.uid !== '{TRACES-LAYER}')
    };

    const promise = mapsAPI.saveMap(formID, mapID, data, owner);
    callBackWithNotices(promise, dispatch, t('map.notices.save-end'));
  };

  return (
    <MenuSection header={'Хранение'} className={'map-actions'}>
      <BigButton text={'Сохранить карту'} icon={saveMapIcon} action={saveMap} disabled={!isModified}/>
    </MenuSection>
  );
};
