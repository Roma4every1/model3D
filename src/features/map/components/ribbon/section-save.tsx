import type { TFunction } from 'react-i18next'
import type { MapState } from '../../lib/types';
import { MenuSection, BigButton } from 'shared/ui';
import { saveMap } from '../../store/map.thunks';
import saveMapIcon from 'assets/map/save-map.png';


interface SaveMapProps {
  state: MapState;
  t: TFunction;
}


export const MapSaveSection = ({state, t}: SaveMapProps) => {
  const action = () => saveMap(state.id);
  const disabled = !state.edit || !state.edit.modified;

  return (
    <MenuSection header={t('map.saving.header')} className={'big-buttons'}>
      <BigButton
        text={t('map.saving.save-map')} icon={saveMapIcon}
        onClick={action} disabled={disabled}
      />
    </MenuSection>
  );
};
