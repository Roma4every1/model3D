import { RootState} from "../../../../../store/rootReducer";
import { IntlProvider, LocalizationProvider} from "@progress/kendo-react-intl";
import { useCallback, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Window } from "@progress/kendo-react-dialogs";

import { MapModes } from "../../enums";
import { PolylineProperties } from "./polyline-properties";
import { LabelProperties } from "./label-properties";
import { setEditMode, setMapField } from "../../../../../store/actionCreators/maps.actions";
import setOpenedWindow from "../../../../../store/actionCreators/setOpenedWindow";
import {
  createLabelInit,
  createPolylineInit,
  rollbackLabel,
  rollbackPolyline
} from "./properties-utils";


interface PropertiesWindowProps {
  formID: FormID,
  mapState: MapState,
}


const windowsSelector = (state: RootState) => state.windowData?.windows;

export const PropertiesWindow = ({formID, mapState}: PropertiesWindowProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const windowName = 'mapPropertiesWindow';
  const windows = useSelector(windowsSelector);
  const { element, utils, legends } = mapState;

  const windowRef = useRef(null);

  const close = useCallback(() => {
    let position;
    if (windowRef.current) position = {top: windowRef.current.top, left: windowRef.current.left};
    dispatch(setOpenedWindow(windowName, false, null, position));
  }, [dispatch]);

  const update = useCallback(() => {
    utils.updateCanvas();
  }, [utils]);

  const apply = () => {
    const modifiedLayer = mapState.mapData.layers.find(l => l.elements?.includes(element));
    modifiedLayer.modified = true;
    dispatch(setMapField(formID, 'isModified', true));
    dispatch(setEditMode(formID, MapModes.SELECTING))
    update();
    close();
  }

  const init = useMemo<any>(() => {
    if (element.type === 'polyline') return createPolylineInit(element);
    if (element.type === 'label') return createLabelInit(element);
  }, [element]);

  const cancel = useCallback(() => {
    if (element.type === 'polyline') {
      rollbackPolyline(element, init).then(update).then(close);
    }
    if (element.type === 'label') {
      rollbackLabel(element, init);
      update(); close();
    }
  }, [element, init, update, close]);

  const ElementProperties = () => {
    if (element.type === 'polyline')
      return (
        <PolylineProperties
          element={element} init={init} legends={legends.data}
          apply={apply} update={update} cancel={cancel} t={t}
        />
      );
    if (element.type === 'label')
      return (
        <LabelProperties
          element={element} init={init}
          apply={apply} update={update} cancel={cancel} t={t}
        />
      );
    return <div>{t('map.selecting.no-selected')}</div>;
  }

  const title = t('map.properties-edit', {elementType: t('map.' + element.type)});

  return (
    <LocalizationProvider language={'ru-RU'}>
      <IntlProvider locale={'ru'}>
        <Window
          ref={windowRef} className={'propertiesWindow'}
          resizable={false} title={title}
          width={320} height={260}
          initialLeft={windows[windowName]?.position?.left}
          initialTop={windows[windowName]?.position?.top}
          onClose={cancel}
        >
          <ElementProperties/>
        </Window>
      </IntlProvider>
    </LocalizationProvider>
  );
}
