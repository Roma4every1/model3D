import type { WindowProps } from '@progress/kendo-react-dialogs';
import type { FieldValueContext } from '../modes/field-value.mode';
import { createElement } from 'react';
import { getGlobalVariable, setGlobalVariable } from 'shared/global';
import { closeWindow, showWindow } from 'entities/window';

import { t } from 'shared/locales';
import { mapEditConfig } from '../lib/constants';
import { useMapStore } from './map.store';
import { MapStage } from '../lib/map-stage';
import { setMapEditState, startMapEditing, cancelMapEditing } from './map-edit.actions';
import { AttrTableWindow } from '../components/ribbon/attr-table';
import { ElementEditWindow } from '../components/element-editors/edit-window';
import { FieldValueWindow } from '../components/ribbon/field-value-window';


/** Показать окно свойств активного элемента. */
export function showMapPropertyWindow(id: FormID, element: MapElement): void {
  const close = () => {
    setMapEditState(id, {propertyWindowOpen: false});
    closeWindow('map-properties-window');
  };
  const cancel = () => {
    cancelMapEditing(id);
    close();
  };
  startMapEditing(id);

  const [width, height] = mapEditConfig[element.type].propertyEditor.windowSize;
  const title = t('map.properties-edit', {elementType: t('map.' + element.type)});

  const windowProps: WindowProps = {
    className: 'propertiesWindow', style: {zIndex: 99}, title,
    width, height, resizable: false, maximizeButton: () => null, onClose: cancel,
  };

  const window = createElement(ElementEditWindow, {id, element, cancel, close});
  setMapEditState(id, {propertyWindowOpen: true});
  showWindow('map-properties-window', windowProps, window);
}

/** Показать аттрибутивную таблицу активного элемента. */
export function showMapAttrTableWindow(id: FormID, element: MapElement): void {
  const windowID = 'map-attr-table';
  const stage = useMapStore.getState()[id].stage;

  const onClose = () => {
    setMapEditState(id, {attrTableWindowOpen: false});
    closeWindow(windowID);
  };
  const windowProps: WindowProps = {
    className: 'attr-table-window', title: t('map.attr-table'),
    width: 320, height: 260, onClose, maximizeButton: () => null,
  };

  const content = createElement(AttrTableWindow, {id, stage, element, onClose});
  setMapEditState(id, {attrTableWindowOpen: true});
  showWindow(windowID, windowProps, content);
}

export function showMapFieldValueWindow(stage: MapStage): void {
  const context: FieldValueContext = {stage, state: {}};
  setGlobalVariable('fv', context);

  MapStage.onClick = (newStage: MapStage): void => {
    const oldStage = context.stage;
    if (oldStage === newStage) return;
    context.stage = newStage;

    oldStage.setExtraObject('field-value', null);
    oldStage.setMode('default');
    newStage.setMode('show-field-value');
  };

  const windowProps: WindowProps = {
    style: {zIndex: 99}, className: 'field-value-window',
    width: 286, height: 192, resizable: false, title: t('map.field-value.title'),
    maximizeButton: () => null, onClose: closeMapFieldValueWindow,
  };
  showWindow('map-field-value', windowProps, createElement(FieldValueWindow));
}

export function closeMapFieldValueWindow(): void {
  const context = getGlobalVariable<FieldValueContext>('fv');
  if (!context) return;

  context.stage.setExtraObject('field-value', null);
  context.stage.setMode('default');
  MapStage.onClick = undefined;

  closeWindow('map-field-value');
  setGlobalVariable('fv', undefined);
}
