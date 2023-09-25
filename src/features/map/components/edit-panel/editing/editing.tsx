import { TFunction } from 'react-i18next';
import { useState, useMemo } from 'react';
import { useDispatch } from 'shared/lib';

import { EditElement } from './edit-element';
import { DeleteElementWindow } from './delete-element';

import { getHeaderText } from './editing-utils';
import { showDialog, closeWindow } from 'entities/window';
import { showMapPropertyWindow, showMapAttrTableWindow } from '../../../store/map.thunks.ts';
import { canCreateTypes, canEditPropertyTypes } from '../../../lib/constants.ts';


interface EditingProps {
  id: FormID;
  state: MapState;
  t: TFunction;
}


export const Editing = ({id, state, t}: EditingProps) => {
  const dispatch = useDispatch();
  const [_signal, setSignal] = useState(false);

  const { stage, propertyWindowOpen, attrTableWindowOpen } = state;
  stage.listeners.editPanelChange = () => setSignal(!_signal);

  const activeLayer = stage.getActiveLayer();
  const activeElement = stage.getActiveElement();

  const isCreating = stage.isElementCreating();
  const creatingType = activeLayer?.elementType;
  const isPolylineCreating = isCreating && creatingType === 'polyline';

  const showDeleteWindow = () => {
    const windowID = 'mapDeleteWindow';
    const onClose = () => dispatch(closeWindow(windowID));
    const content = <DeleteElementWindow id={id} stage={stage} onClose={onClose}/>;
    dispatch(showDialog(windowID, {title: t('map.delete-element'), onClose}, content));
  };

  const showPropertiesWindow = () => {
    dispatch(showMapPropertyWindow(id, activeElement));
  };
  const showAttrTableWindow = () => {
    dispatch(showMapAttrTableWindow(id));
  };

  const create = () => stage.startCreating();
  const accept = () => stage.accept();
  const cancel = () => stage.cancel();

  const headerText = useMemo(() => {
    return getHeaderText(isCreating, activeElement?.type, activeLayer?.displayName, t);
  }, [activeLayer, activeElement, isCreating, t]);

  const disableAll = propertyWindowOpen || attrTableWindowOpen;
  const canAccept = activeElement !== null;
  const canCancel = activeElement !== null;
  const canCreate = activeLayer && canCreateTypes.includes(creatingType) && !isCreating;
  const canDelete = activeElement && !isCreating;
  const canEditProperties = activeElement && canEditPropertyTypes.includes(activeElement.type);
  const canEditAttrTable = activeElement && activeElement.attrTable;

  return (
    <section className={'map-editing'}>
      <div className={'menu-header'}>{headerText}</div>
      <div className={'map-panel-main'}>
        <div className={'common-buttons'}>
          <button
            className={'map-panel-button k-button'} title={t('map.editing.accept')}
            disabled={disableAll || !canAccept}
            onClick={isPolylineCreating ? showPropertiesWindow : accept}
          >
            <span className={'k-icon k-i-check-outline'} />
          </button>
          <button
            className={'k-button map-panel-button'} title={t('map.editing.cancel')}
            disabled={disableAll || !canCancel} onClick={cancel}
          >
            <span className={'k-icon k-i-close-outline'} />
          </button>
          <button
            className={'k-button map-panel-button' + (isCreating ? ' active' : '')} title={t('map.creating.button-hint')}
            disabled={disableAll || !canCreate} onClick={create}
          >
            <span className={'k-icon k-i-add'} />
          </button>
          <button
            className={'k-button map-panel-button'} title={t('map.editing.properties')}
            disabled={disableAll || !canEditProperties} onClick={showPropertiesWindow}
          >
            <span className={'k-icon k-i-saturation'} />
          </button>
          <button
            className={'k-button map-panel-button'} title={t('map.attr-table')}
            disabled={disableAll || !canEditAttrTable} onClick={showAttrTableWindow}
          >
            <span className={'k-icon k-i-table'} />
          </button>
          <button
            className={'k-button map-panel-button'} title={t('map.editing.delete')}
            disabled={disableAll || !canDelete} onClick={showDeleteWindow}
          >
            <span className={'k-icon k-i-delete'}/>
          </button>
        </div>
        {!isCreating && activeElement ? <EditElement stage={stage}/> : <div/>}
      </div>
    </section>
  );
};
