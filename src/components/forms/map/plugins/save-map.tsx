import { TFunction } from "react-i18next"
import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { MenuSection, BigButton } from "../../../common/menu-ui";
import { saveMapIcon } from "../../../../dicts/images";
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
    <MenuSection header={'Хранение'} className={'map-actions'}>
      <BigButton text={'Сохранить карту'} icon={saveMapIcon} action={saveMap} disabled={!isModified}/>
    </MenuSection>
  );
};
