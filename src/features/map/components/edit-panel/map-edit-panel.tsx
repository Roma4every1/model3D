import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuSkeleton } from 'shared/ui';
import { MapNavigation } from './dimensions';
import { Export } from './export';
import { Selecting } from './selecting';
import { Editing } from './editing/editing';
import { SaveMap } from './save-map';
import { useMapState, useMultiMapState } from '../../store/map.store';
import './map-edit-panel.scss';


const panelTemplate = ['330px', '90px', '275px', 'calc(100% - 785px)', '90px'];

/** Панель редактирования карты. */
export const MapEditPanel = ({id, parentID}: FormEditPanelProps) => {
  const { t } = useTranslation();
  const mapState = useMapState(id);
  const multiMapState = useMultiMapState(parentID);
  const sync = multiMapState?.sync;

  // при смене активной карты обновить координаты
  useEffect(() => {
    mapState?.stage.render();
  }, [mapState?.stage, id]);

  if (!mapState) return <MenuSkeleton template={panelTemplate}/>;

  return (
    <div className={'map-edit-panel menu'} style={{display: 'grid'}}>
      <MapNavigation id={id} mapState={mapState} sync={sync} parentID={parentID} t={t}/>
      <Export state={mapState} t={t}/>
      <Selecting mapState={mapState} t={t}/>
      <Editing id={id} state={mapState} t={t}/>
      <SaveMap id={id} state={mapState} t={t}/>
    </div>
  );
};
