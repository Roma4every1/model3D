import { TFunction } from 'react-i18next';
import { useState } from 'react';
import { EditElement } from './edit-element';
import { DeleteElementWindow } from './delete-element';

import { showDialog, closeWindow } from 'entities/window';
import { setMapField } from '../../../store/map.actions';
import { showMapPropertyWindow, showMapAttrTableWindow } from '../../../store/map.thunks';
import { getHeaderText } from './editing-utils';
import { canCreateTypes } from '../../../lib/constants';


interface EditingProps {
  id: FormID;
  state: MapState;
  t: TFunction;
}


export const Editing = ({id, state, t}: EditingProps) => {
  const [_signal, setSignal] = useState(false);
  const { stage, propertyWindowOpen, attrTableWindowOpen } = state;
  stage.listeners.editPanelChange = () => setSignal(!_signal);

  const activeLayer = stage.getActiveLayer();
  const activeElement = stage.getActiveElement();
  const isPolyline = activeElement?.type === 'polyline';

  const isCreating = stage.isElementCreating();
  const creatingType = activeLayer?.elementType;

  const showDeleteWindow = () => {
    const windowID = 'mapDeleteWindow';
    const onClose = () => closeWindow(windowID);
    const content = <DeleteElementWindow id={id} stage={stage} onClose={onClose}/>;
    showDialog(windowID, {title: t('map.delete-element'), onClose}, content);
  };

  const showPropertiesWindow = () => showMapPropertyWindow(id, activeElement);
  const showAttrTableWindow = () => showMapAttrTableWindow(id);

  const accept = () => {
    stage.accept(); stage.render();
    setMapField(id, 'modified', true);
  };

  const create = () => stage.startCreating();
  const cancel = () => stage.cancel();

  const disableAll = !state.editable || propertyWindowOpen || attrTableWindowOpen;
  const canCancel = activeElement !== null || isCreating;
  const canDelete = activeElement && !isCreating;
  const canEditAttrTable = activeElement && activeElement.attrTable;

  let canAccept = activeElement !== null;
  if (canAccept && isPolyline) canAccept = activeElement.arcs[0].path.length > 2;

  const canCreate = activeLayer && !activeLayer.temporary && !isCreating
    && canCreateTypes.includes(creatingType);
  const canEditProperties = activeElement && !isCreating;

  return (
    <section className={'map-editing'}>
      <div className={'menu-header'}>
        {getHeaderText(isCreating, activeElement?.type, activeLayer?.displayName, t)}
      </div>
      <div className={'map-panel-main'}>
        <div className={'common-buttons'}>
          <button
            className={'map-panel-button k-button'} title={t('map.editing.accept')}
            disabled={disableAll || !canAccept}
            onClick={isCreating && isPolyline ? showPropertiesWindow : accept}
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
        {state.editable && activeElement && (!isCreating || isPolyline)
          ? <EditElement stage={stage}/>
          : <div/>}
      </div>
    </section>
  );
};
