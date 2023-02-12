import { IntlProvider, LocalizationProvider } from '@progress/kendo-react-intl';
import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Window } from '@progress/kendo-react-dialogs';

import { MapModes } from '../../../lib/enums';
import { PolylineProperties } from './polyline/polyline-properties';
import { LabelProperties } from './label/label-properties';
import { windowsSelector, setOpenedWindow } from 'entities/windows';
import { setMapField, setEditMode } from '../../../store/maps.actions';
import { mapStateSelector } from '../../../store/maps.selectors';
import { createLabelInit, createPolylineInit, rollbackLabel, rollbackPolyline } from './properties-utils';


const windowSizeDict: Record<'polyline' | 'label', [number, number]> = {
  polyline: [320, 260],
  label: [350, 205],
};

export const PropertiesWindow = ({formID}: PropsFormID) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const windowName = 'mapPropertiesWindow';
  const windows = useSelector(windowsSelector);
  const mapState: MapState = useSelector(mapStateSelector.bind(formID))
  const { element, utils, legends, mode } = mapState;

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
      if (mode === MapModes.MOVE_MAP && element.edited) element.edited = false;
      rollbackLabel(element, init);
      update(); close();
    }
  }, [element, mode, init, update, close]);

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

  const initElement = useRef(element);

  useEffect(() => {
    if (element !== initElement.current) cancel();
    if (element.type === 'label' && !element.edited) { element.edited = true; update(); }
  }, [element, initElement, update, cancel]);

  const title = t('map.properties-edit', {elementType: t('map.' + element.type)});
  const [width, height] = windowSizeDict[element.type];

  return (
    <LocalizationProvider language={'ru-RU'}>
      <IntlProvider locale={'ru'}>
        <Window
          ref={windowRef} className={'propertiesWindow'}
          resizable={false} title={title}
          width={width} height={height}
          initialLeft={windows[windowName]?.position?.left}
          initialTop={windows[windowName]?.position?.top}
          style={{zIndex: 99}} onClose={cancel}
        >
          <ElementProperties/>
        </Window>
      </IntlProvider>
    </LocalizationProvider>
  );
};
