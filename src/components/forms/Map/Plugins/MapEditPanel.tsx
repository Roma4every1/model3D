import { RootState } from "../../../../store/rootReducer";
import { useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { Skeleton } from "@progress/kendo-react-indicators";

import { Dimensions } from "./dimensions";
import { Actions } from "./actions";
import { Selecting } from "./selecting/selecting";
import { Editing } from "./editing/editing";

import { setMapField } from "../../../../store/actionCreators/maps.actions";
import setWindowNotification from "../../../../store/actionCreators/setWindowNotification";
import closeWindowNotification from "../../../../store/actionCreators/closeWindowNotification";

import "../../../../styles/map-edit-panel.scss";


interface MapEditPanelProps {
  formId: FormID,
}


const EditPanelItemSkeleton = ({width}: {width: string}) => {
  return (
    <div className={'map-panel-skeleton'} style={{width}}>
      <Skeleton shape={'rectangle'} animation={{type: 'wave'}}/>
      <Skeleton shape={'rectangle'} animation={{type: 'wave'}}/>
    </div>
  );
}

const MapEditPanelSkeleton = () => {
  return (
    <div className={'map-edit-panel'}>
      <EditPanelItemSkeleton width={'14%'}/>
      <EditPanelItemSkeleton width={'14%'}/>
      <EditPanelItemSkeleton width={'24%'}/>
      <EditPanelItemSkeleton width={'48%'}/>
    </div>
  );
}

/** Панель редактирования карты. */
export default function MapEditPanel({formId: formID}: MapEditPanelProps) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const sessionManager = useSelector((state: RootState) => state.sessionManager);
  const sessionID = useSelector((state: RootState) => state.appState.sessionID.data);

  const mapState = useSelector((state: RootState) => state.maps[formID]);
  const legendsLoaded = mapState?.legends?.loaded;
  const owner = mapState?.owner;
  const mapID = mapState?.mapID;
  const mapData = mapState?.mapData;

  // загрузить легенду карты
  useEffect(() => {
    if (legendsLoaded !== false) return;
    sessionManager
      .fetchData(`mapLegends?sessionId=${sessionID}`)
      .then((data) => {
        const newLegendsState: LoadingState<any> = {loaded: true, success: true, data};
        dispatch(setMapField(formID, 'legends', newLegendsState))
      });
  }, [legendsLoaded, sessionManager, sessionID, dispatch, formID]);

  const saveMap = useCallback(() => {
    if (!mapData || !owner || !mapID) return;
    dispatch(setMapField(formID, 'isModified', false));
    dispatch(setWindowNotification(t('map.notices.save-start')));

    const body = JSON.stringify({sessionId: sessionID, formId: formID, mapId: mapID, mapData, owner});
    sessionManager
      .fetchData('saveMap', {method: 'POST', body})
      .then(() => {
        dispatch(setWindowNotification(t('map.notices.save-end')));
        setTimeout(() => {dispatch(closeWindowNotification())}, 2000);
      });
  }, [owner, mapData, mapID, sessionManager, sessionID, formID, dispatch, t]);

  if (!mapState || mapState.isLoadSuccessfully === undefined) return <MapEditPanelSkeleton/>;

  return (
    <div className={'map-edit-panel'} style={{display: 'grid'}}>
      <Dimensions mapState={mapState} formID={formID} t={t}/>
      <Actions mapState={mapState} saveMap={saveMap} t={t}/>
      <Selecting mapState={mapState} formID={formID} t={t}/>
      <Editing mapState={mapState} formID={formID}/>
    </div>
  );
};
