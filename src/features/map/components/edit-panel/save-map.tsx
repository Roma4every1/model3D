import { TFunction } from 'react-i18next'
import { MenuSection, BigButton } from 'shared/ui';
import { saveMap } from '../../store/map.thunks';
import saveMapIcon from 'assets/map/save-map.png';


interface SaveMapProps {
  id: FormID;
  state: MapState;
  t: TFunction;
}


export const SaveMap = ({id, state, t}: SaveMapProps) => {
  const disabled = !state.editable || !state.modified;
  const action = () => saveMap(id);

  return (
    <MenuSection header={t('map.saving.header')} className={'big-buttons'}>
      <BigButton
        text={t('map.saving.save-map')} icon={saveMapIcon}
        action={action} disabled={disabled}
      />
    </MenuSection>
  );
};
