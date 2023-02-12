import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { MenuSkeleton } from 'shared/ui';
import { Dimensions } from './dimensions';
import { Export } from './export';
import { Selecting } from './selecting/selecting';
import { Editing } from './editing/editing';
import { SaveMap } from './save-map';
import { multiMapStateSelector, mapStateSelector } from '../../store/maps.selectors';
import { setMapField } from '../../store/maps.actions';
import { mapsAPI } from 'features/map/lib/maps.api';
import './map-edit-panel.scss';


const panelTemplate = ['330px', '90px', '275px', 'calc(100% - 785px)', '90px'];

/** Панель редактирования карты. */
export const MapEditPanel = ({id, parentID}: FormEditPanelProps) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const multiMapState: MultiMapState = useSelector(multiMapStateSelector.bind(parentID));
  const sync = multiMapState?.sync;

  const mapState: MapState = useSelector(mapStateSelector.bind(id));
  const legendsLoaded = mapState?.legends?.loaded;

  // загрузить легенду карты
  useEffect(() => {
    if (legendsLoaded !== false) return;
    mapsAPI.getMapLegend().then((res) => {
      const newLegendsState = {loaded: true, success: res.ok, data: res.data};
      dispatch(setMapField(id, 'legends', newLegendsState));
    });
  }, [legendsLoaded, id, dispatch]);

  // при смене активной карты обновить координаты
  useEffect(() => {
    mapState?.utils.updateCanvas();
  }, [mapState?.utils, id]);

  if (!mapState) return <MenuSkeleton template={panelTemplate}/>;

  return (
    <div className={'map-edit-panel menu'} style={{display: 'grid'}}>
      <Dimensions mapState={mapState} sync={sync} formID={id} parentID={parentID} t={t}/>
      <Export mapState={mapState} t={t}/>
      <Selecting mapState={mapState} formID={id} t={t}/>
      <Editing mapState={mapState} formID={id}/>
      <SaveMap mapState={mapState} formID={id} t={t}/>
    </div>
  );
};
