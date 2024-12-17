import type { WindowProps } from '@progress/kendo-react-dialogs';
import { createElement } from 'react';
import { closeWindow, showWindow } from 'entities/window';

import { t } from 'shared/locales';
import { mapEditConfig } from '../lib/constants';
import { useMapStore } from './map.store';
import { setMapEditState, startMapEditing, cancelMapEditing } from './map-edit.actions';
import { AttrTableWindow } from '../components/ribbon/attr-table';
import { ElementEditWindow } from '../components/element-editors/edit-window';


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
