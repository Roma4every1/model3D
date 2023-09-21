import { IntlProvider, LocalizationProvider } from '@progress/kendo-react-intl';
import { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { MapModes } from '../../../lib/enums';
import { updateWindow, closeWindow } from 'entities/window';
import { mapStateSelector } from '../../../store/map.selectors';

import {
  setMapField, setEditMode,
  acceptCreatingElement, cancelCreatingElement,
} from '../../../store/map.actions';

import {
  createSignInit, createFieldInit, createLabelInit, createPolylineInit,
  rollbackSign, rollbackField, rollbackLabel, rollbackPolyline,
} from './properties-utils';

import { SignProperties } from './sign/sign-properties.tsx';
import { PolylineProperties } from './polyline/polyline-properties';
import { LabelProperties } from './label/label-properties';
import { FieldProperties } from './field/field-properties';


const windowSizeDict: Record<MapElementType, [number, number]> = {
  sign: [410, 186],
  polyline: [335, 235],
  label: [350, 210],
  field: [320, 260],
};

interface PropertiesWindowProps {
  formID: FormID;
  setOpen?;
}

export const PropertiesWindow = ({formID, setOpen}: PropertiesWindowProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const windowID = 'mapPropertiesWindow';
  const mapState: MapState = useSelector(mapStateSelector.bind(formID))
  const { element, utils, legends, mode, isElementCreating } = mapState;

  useEffect(() => {
    setOpen(true);
    return () => setOpen(false);
  }, []); // eslint-disable-line

  const close = useCallback(() => {
    dispatch(closeWindow(windowID));
  }, [dispatch]);

  const update = useCallback(() => {
    utils.updateCanvas();
  }, [utils]);

  const apply = () => {
    if (!element) return;
    if (isElementCreating) { acceptCreating(); return; }
    const modifiedLayer = mapState.mapData.layers.find(l => l.elements?.includes(element));
    modifiedLayer.modified = true;
    dispatch(setMapField(formID, 'isModified', true));
    dispatch(setEditMode(formID, MapModes.SELECTING));
    update(); close();
  };

  const init = useMemo<any>(() => {
    if (!element) return;
    if (element.type === 'sign') return createSignInit(element);
    if (element.type === 'polyline') return createPolylineInit(element);
    if (element.type === 'label') return createLabelInit(element);
    if (element.type === 'field') return createFieldInit(element);
  }, [element]);

  const rollbackElement = (element: MapElement, init: any) => {
    if (element.type === 'sign') {
      rollbackSign(element, init);
    }
    else if (element.type === 'polyline') {
      rollbackPolyline(element, init);
    }
    else if (element.type === 'label') {
      if (mode === MapModes.MOVE_MAP && element.edited) element.edited = false;
      rollbackLabel(element, init);
    }
    else if (element.type === 'field') {
      rollbackField(element, init);
    }
  }

  const cancel = useCallback(() => {
    if (isElementCreating) { cancelCreating(); return; }
    if (element) rollbackElement(element, init);
    update(); close();
  }, [element, mode, init, update, close, setOpen, isElementCreating]); // eslint-disable-line

  const acceptCreating = () => {
    if (!element) return;
    dispatch(acceptCreatingElement(formID));
    close();
  };

  const cancelCreating = () => {
    if (!element) return;
    dispatch(cancelCreatingElement(formID));
    close();
  };

  const ElementProperties = () => {
    if (element?.type === 'sign') return (
      <SignProperties
        element={element} init={init}
        apply={apply} update={update} cancel={cancel} t={t} isElementCreating={isElementCreating}
      />
    );
    if (element?.type === 'polyline') return (
      <PolylineProperties
        element={element} init={init} legends={legends.data}
        apply={apply} update={update} cancel={cancel} t={t} isElementCreating={isElementCreating}
      />
    );
    if (element?.type === 'label') return (
      <LabelProperties
        element={element} init={init}
        apply={apply} update={update} cancel={cancel} t={t} isElementCreating={isElementCreating}
      />
    );
    if (element?.type === 'field') return (
      <FieldProperties
        element={element} init={init}
        apply={apply} update={update} cancel={cancel} t={t} isElementCreating={isElementCreating}
      />
    );
    return <div>{t('map.selecting.no-selected')}</div>;
  };

  useEffect(() => {
    if (!element) { update(); close(); return; }
    const title = t('map.properties-edit', {elementType: t('map.' + element.type)});
    const [width, height] = windowSizeDict[element.type] ?? [];
    dispatch(updateWindow(windowID, {title, width, height}))
  }, [element, t, dispatch, close, update, init]);

  return (
    <LocalizationProvider language={'ru-RU'}>
      <IntlProvider locale={'ru'}>
        <ElementProperties/>
      </IntlProvider>
    </LocalizationProvider>
  );
};
