import { TFunction } from "react-i18next"
import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { mapIconsDict } from "../../../../dicts/images";
import { actions, selectors } from "../../../../store";
import { converter } from "../../../../utils/maps-api.utils";
import { callBackWithNotices } from "../../../../utils/notifications";


interface ActionsProps {
  mapState: MapState,
  formID: FormID,
  t: TFunction
}


export const SaveMap = ({mapState, formID, t}: ActionsProps) => {
  const dispatch = useDispatch();
  const { mapData, owner, mapID, isModified } = mapState;

  const sessionID = useSelector(selectors.sessionID);
  const sessionManager = useSelector(selectors.sessionManager);

  const saveMap = useCallback(() => {
    if (!mapData || !owner || !mapID) return;
    dispatch(actions.setMapField(formID, 'isModified', false));
    dispatch(actions.setWindowNotification(t('map.notices.save-start')));

    const mapDataToSave = {...mapData, x: undefined, y: undefined, scale: undefined, onDrawEnd: undefined};
    const body = {sessionId: sessionID, formId: formID, mapId: mapID, mapData: mapDataToSave, owner};
    const fetchInit = {method: 'POST', body: converter.encode(JSON.stringify(body))};

    const promise = sessionManager.fetchData('saveMap', fetchInit);
    callBackWithNotices(promise, dispatch, t('map.notices.save-end'));
  }, [owner, mapData, mapID, sessionManager, sessionID, formID, dispatch, t]);

  return (
    <section className={'map-save'}>
      <div className={'menu-header'}>{'Хранение'}</div>
      <div className={'map-panel-main map-actions'}>
        <button className={'map-action'} onClick={saveMap} disabled={!isModified}>
          <div><img src={mapIconsDict['save']} alt={'save'}/></div>
          <div>{'Сохранить карту'}</div>
        </button>
      </div>
    </section>
  );
};
