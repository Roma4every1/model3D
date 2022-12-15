import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { MenuSkeleton } from "../common/menu-ui";
import { Dimensions } from "../forms/map/plugins/dimensions";
import { Export } from "../forms/map/plugins/export";
import { Selecting } from "../forms/map/plugins/selecting/selecting";
import { Editing } from "../forms/map/plugins/editing/editing";
import { SaveMap } from "../forms/map/plugins/save-map";
import { getParentFormId } from "../../utils/utils";
import { actions, selectors } from "../../store";
import "../../styles/map-edit-panel.scss";


const panelTemplate = ['330px', '90px', '275px', 'calc(100% - 785px)', '90px'];

/** Панель редактирования карты. */
export function MapEditPanel({formID}: PropsFormID) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const sessionID = useSelector(selectors.sessionID);
  const sessionManager = useSelector(selectors.sessionManager);

  const multiMapState: MultiMapState = useSelector(selectors.multiMapState.bind(getParentFormId(formID)));
  const sync = multiMapState?.sync;

  const mapState: MapState = useSelector(selectors.mapState.bind(formID));
  const legendsLoaded = mapState?.legends?.loaded;

  // загрузить легенду карты
  useEffect(() => {
    if (legendsLoaded !== false) return;
    sessionManager
      .fetchData(`mapLegends?sessionId=${sessionID}`)
      .then((data) => {
        const newLegendsState: LoadingState<any> = {loaded: true, success: true, data};
        dispatch(actions.setMapField(formID, 'legends', newLegendsState))
      });
  }, [legendsLoaded, sessionManager, sessionID, dispatch, formID]);

  // при смене активной карты обновить координаты
  useEffect(() => {
    mapState?.utils.updateCanvas();
  }, [mapState?.utils, formID]);

  if (!mapState) return <MenuSkeleton template={panelTemplate}/>;

  return (
    <div className={'map-edit-panel menu'} style={{display: 'grid'}}>
      <Dimensions mapState={mapState} sync={sync} formID={formID} t={t}/>
      <Export mapState={mapState} t={t}/>
      <Selecting mapState={mapState} formID={formID} t={t}/>
      <Editing mapState={mapState} formID={formID}/>
      <SaveMap mapState={mapState} formID={formID} t={t}/>
    </div>
  );
}
