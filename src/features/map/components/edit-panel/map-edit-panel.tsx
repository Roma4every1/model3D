import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { MenuSkeleton } from 'shared/ui';
import { Dimensions } from './dimensions';
import { Export } from './export';
import { Selecting } from './selecting/selecting';
import { Editing } from './editing/editing';
import { SaveMap } from './save-map';
import { multiMapStateSelector, mapStateSelector } from '../../store/map.selectors';
import './map-edit-panel.scss';


const panelTemplate = ['330px', '90px', '275px', 'calc(100% - 785px)', '90px'];

/** Панель редактирования карты. */
export const MapEditPanel = ({id, parentID}: FormEditPanelProps) => {
  const { t } = useTranslation();
  const mapState: MapState = useSelector(mapStateSelector.bind(id));
  const multiMapState: MultiMapState = useSelector(multiMapStateSelector.bind(parentID));
  const sync = multiMapState?.sync;

  // при смене активной карты обновить координаты
  useEffect(() => {
    mapState?.utils.updateCanvas();
  }, [mapState?.utils, id]);

  if (!mapState) return <MenuSkeleton template={panelTemplate}/>;

  return (
    <div className={'map-edit-panel menu'} style={{display: 'grid'}}>
      <Dimensions mapState={mapState} sync={sync} parentID={parentID} t={t}/>
      <Export mapState={mapState} t={t}/>
      <Selecting mapState={mapState} formID={id} t={t}/>
      <Editing mapState={mapState} formID={id}/>
      <SaveMap id={id} state={mapState} t={t}/>
    </div>
  );
};
