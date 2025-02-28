import { useTranslation } from 'react-i18next';
import { useMapState } from '../../store/map.store';
import { MenuSkeleton } from 'shared/ui';

import './map-ribbon.scss';
import { MapNavigationSection } from './section-nav';
import { MapSelectSection } from './section-select';
import { MapEditSection } from './section-edit';
import { MapOtherSection } from './section-other';


export const MapRibbon = ({id, parentID}: FormRibbonProps) => {
  const { t } = useTranslation();
  const state = useMapState(id);

  if (!state) {
    return <MenuSkeleton template={['330px', '250px', '250px', '160px']}/>;
  }
  return (
    <div className={'map-edit-panel menu'} style={{display: 'grid'}}>
      <MapNavigationSection state={state} parentID={parentID} t={t}/>
      <MapSelectSection state={state} t={t}/>
      <MapEditSection state={state} t={t}/>
      <MapOtherSection state={state} t={t}/>
    </div>
  );
};
