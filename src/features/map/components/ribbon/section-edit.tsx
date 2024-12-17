import type { TFunction } from 'react-i18next';
import type { MapState } from '../../lib/types';
import { useEffect } from 'react';
import { useRender } from 'shared/react';
import { MenuSection } from 'shared/ui';
import { ElementEditModes } from './element-edit-modes';
import { DeleteElementWindow } from './delete-element';
import { showDialog, closeWindow } from 'entities/window';
import { showMapPropertyWindow, showMapAttrTableWindow } from '../../store/map-window.actions';
import { startMapCreating, acceptMapEditing, cancelMapEditing } from '../../store/map-edit.actions';
import { validateMapElement } from '../../lib/map-utils';
import { mapEditConfig } from '../../lib/constants';


interface MapEditSectionProps {
  state: MapState;
  t: TFunction;
}

export const MapEditSection = ({state, t}: MapEditSectionProps) => {
  const render = useRender();
  const { stage, edit } = state;

  useEffect(() => {
    stage.subscribe('mode', render);
    stage.subscribe('active-layer', render);
    stage.subscribe('active-element', render);
    stage.subscribe('element-change', render);

    return () => {
      stage.unsubscribe('mode', render);
      stage.unsubscribe('active-layer', render);
      stage.unsubscribe('active-element', render);
      stage.unsubscribe('element-change', render);
    };
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeLayer = stage.getActiveLayer();
  const activeElement = stage.getActiveElement();
  const isCreating = edit && edit.creating;
  const isPolyline = activeElement?.type === 'polyline';

  const disableAll = !edit || edit.propertyWindowOpen || edit.attrTableWindowOpen;
  const canAccept = activeElement && validateMapElement(activeElement);
  const canCancel = activeElement !== null || isCreating;
  const canCreate = activeLayer && !isCreating && mapEditConfig[activeLayer.elementType].canCreate;
  const canDelete = activeElement && !isCreating;
  const canEditProperties = activeElement && !isCreating;
  const canEditAttrTable = activeElement && Boolean(activeElement.attrTable);

  const showDeleteWindow = () => {
    const windowID = 'mapDeleteWindow';
    const onClose = () => closeWindow(windowID);
    const content = <DeleteElementWindow id={state.id} stage={stage} onClose={onClose}/>;
    showDialog(windowID, {title: t('map.delete-element'), onClose}, content);
  };

  const accept = () => acceptMapEditing(state.id);
  const cancel = () => cancelMapEditing(state.id);
  const showPropertyWindow = () => showMapPropertyWindow(state.id, activeElement);
  const showAttrTableWindow = () => showMapAttrTableWindow(state.id, activeElement);

  const sectionHeader = isCreating
    ? t('map.editing.header-creating', {name: activeLayer?.displayName})
    : (activeElement
      ? t('map.editing.header-editing', {type: t('map.' +activeElement.type)})
      : t('map.editing.header-default'));

  return (
    <MenuSection header={sectionHeader} className={'map-edit-section'}>
      <div className={'common-buttons'}>
        <button
          className={'map-panel-button k-button'} title={t('map.editing.accept')}
          disabled={disableAll || !canAccept}
          onClick={isCreating && isPolyline ? showPropertyWindow : accept}
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
          disabled={disableAll || !canCreate} onClick={() => startMapCreating(state.id)}
        >
          <span className={'k-icon k-i-add'} />
        </button>
        <button
          className={'k-button map-panel-button'} title={t('map.editing.properties')}
          disabled={disableAll || !canEditProperties} onClick={showPropertyWindow}
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
      {edit && activeElement && (!isCreating || isPolyline)
        ? <ElementEditModes id={state.id} stage={stage}/>
        : <div/>}
    </MenuSection>
  );
};
