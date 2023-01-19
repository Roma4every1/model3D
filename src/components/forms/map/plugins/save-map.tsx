import { TFunction } from "react-i18next"
import { useSelector, useDispatch } from "react-redux";
import { MenuSection, BigButton } from "../../../common/menu-ui";
import { saveMapIcon as icon } from "../../../../dicts/images";
import { actions, selectors } from "../../../../store";
import { API } from "../../../../api/api";
import { callBackWithNotices } from "../../../../utils/notifications";


interface SaveMapProps {
  mapState: MapState,
  formID: FormID,
  t: TFunction
}


export const SaveMap = ({mapState, formID, t}: SaveMapProps) => {
  const dispatch = useDispatch();
  const sessionID = useSelector(selectors.sessionID);
  const { mapData, owner, mapID, isModified } = mapState;

  const saveMap = () => {
    if (!mapData || !owner || !mapID) return;
    dispatch(actions.setMapField(formID, 'isModified', false));
    dispatch(actions.setWindowNotification(t('map.notices.save-start')));

    const data = {...mapData, x: undefined, y: undefined, scale: undefined, onDrawEnd: undefined};
    const body = {sessionId: sessionID, formId: formID, mapId: mapID, mapData: data, owner};

    const promise = API.maps.saveMap(JSON.stringify(body));
    callBackWithNotices(promise, dispatch, t('map.notices.save-end'));
  };

  return (
    <MenuSection header={'Хранение'} className={'map-actions'}>
      <BigButton text={'Сохранить карту'} icon={icon} action={saveMap} disabled={!isModified}/>
    </MenuSection>
  );
};
