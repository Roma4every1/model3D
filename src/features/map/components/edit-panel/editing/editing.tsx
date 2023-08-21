import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { EditElement } from './edit-element';
import { CreateElement } from './create-element';
import { DeleteElementWindow } from './delete-element';
import { PropertiesWindow } from '../properties-window/properties';
import { AttrTableWindow } from './attr-table';

import { MapModes } from '../../../lib/enums';
import { getHeaderText } from './editing-utils';
import { applyMouseDownActionToPolyline, applyMouseMoveActionToElement, applyRotateToLabel } from './edit-element-utils';
import { clientPoint, getNearestPointIndex, listenerOptions } from '../../../lib/map-utils';
import { showDialog, showWindow, closeWindow } from 'entities/window';
import { setEditMode, acceptMapEditing, cancelMapEditing, setMapField } from '../../../store/map.actions';
import { startCreatingElement, cancelCreatingElement } from '../../../store/map.actions';


interface EditingProps {
  mapState: MapState,
  formID: FormID,
}


const mouseMoveNeedModes: MapModes[] = [MapModes.MOVE, MapModes.MOVE_POINT, MapModes.ROTATE];
const creatingElementTypes: MapElementType[] = ['polyline', 'sign', 'label'];
const hasPropertiesWindow: MapElementType[] = ['polyline', 'label', 'field'];

export const Editing = ({mapState, formID}: EditingProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { canvas, activeLayer, utils, mode, isElementEditing, isElementCreating, oldData, mapData } = mapState;
  const selectedElement = mapState.element;

  const creatingType = activeLayer?.elementType;

  const isOnMove = useRef(false);
  const pIndex = useRef<number>(null);

  const mouseDown = useCallback((event: MouseEvent) => {
    if (!isElementEditing) return;
    const point = utils.pointToMap(clientPoint(event));
    isOnMove.current = mouseMoveNeedModes.includes(mode);

    if (selectedElement.type !== 'polyline') return;

    const scale = mapData.scale;
    if (mode === MapModes.MOVE_POINT) {
      pIndex.current = getNearestPointIndex(point, scale, selectedElement);
    }
    applyMouseDownActionToPolyline(selectedElement, {mode, point, scale});
    dispatch(setMapField(formID, 'element', selectedElement));
    utils.updateCanvas();
  }, [isElementEditing, utils, selectedElement, mode, mapData, formID, dispatch]);

  const mouseMove = useCallback((event: MouseEvent) => {
    if (!isOnMove.current) return;
    const point = utils.pointToMap(clientPoint(event));
    const action = {mode, point, pIndex: pIndex.current};

    applyMouseMoveActionToElement(selectedElement, action);
    utils.updateCanvas();
  }, [selectedElement, utils, mode]);

  const mouseUp = useCallback(() => {
    isOnMove.current = false;
    pIndex.current = null;
  }, []);

  const mouseWheel = useCallback((event: WheelEvent) => {
    if (mode !== MapModes.ROTATE || !(selectedElement?.type === 'label')) return;
    applyRotateToLabel(selectedElement, event.deltaY > 0, event.shiftKey);
    utils.updateCanvas();
  }, [selectedElement, mode, utils]);

  // ставим слушатели на <canvas>
  useEffect(() => {
    if (canvas) {
      canvas.addEventListener('mousedown', mouseDown, listenerOptions);
      canvas.addEventListener('mousemove', mouseMove, listenerOptions);
      canvas.addEventListener('mouseup', mouseUp, listenerOptions);
      canvas.addEventListener('wheel', mouseWheel, listenerOptions);
    }
    return () => {
      if (canvas) {
        canvas.removeEventListener('mousedown', mouseDown);
        canvas.removeEventListener('mousemove', mouseMove);
        canvas.removeEventListener('mouseup', mouseUp);
        canvas.removeEventListener('wheel', mouseWheel);
      }
    }
  }, [canvas, mouseDown, mouseMove, mouseUp, mouseWheel]);

  const isCreating = mode === MapModes.CREATING || mode === MapModes.AWAIT_POINT;
  const [isPropertiesWindowOpen, setPropertiesWindowOpen] = useState(false);
  const [isAttrTableOpen, setAttrTableOpen] = useState(false);
  const isPolylineCreating = isElementCreating && creatingType === 'polyline';

  const toggleCreating = () => {
    if (isCreating) dispatch(cancelCreatingElement(formID));
    else {
      dispatch(startCreatingElement(formID));
      dispatch(setEditMode(formID, MapModes.AWAIT_POINT));
    }
  };

  const acceptEditing = () => {
    if (!selectedElement) return;
    dispatch(acceptMapEditing(formID));
  };

  const acceptPolylineValid = () => {
    showPropertiesWindow();
  }

  const cancelCreating = () => {
    dispatch(cancelCreatingElement(formID));
  };

  const cancelEditing = () => {
    if (!selectedElement) return;
    dispatch(cancelMapEditing(formID));
  };

  const showDeleteWindow = () => {
    const windowID = 'mapDeleteWindow';
    const onClose = () => dispatch(closeWindow(windowID));
    const content = <DeleteElementWindow mapState={mapState} formID={formID} onClose={onClose}/>;
    dispatch(showDialog(windowID, {title: t('map.delete-element'), onClose}, content));
  };

  const showPropertiesWindow = () => {
    const content = <PropertiesWindow formID={formID} setOpen={setPropertiesWindowOpen}/>;
    if (mapState.mode < MapModes.MOVE_MAP) dispatch(setEditMode(formID, MapModes.MOVE_MAP));

    const windowProps = {
      className: 'propertiesWindow', resizable: false,
      style: {zIndex: 99},
    };
    dispatch(showWindow('mapPropertiesWindow', windowProps, content));
  };

  const showAttrTableWindow = () => {
    const windowID = 'mapAttrTableWindow';
    const onClose = () => dispatch(closeWindow(windowID));
    const content = <AttrTableWindow formID={formID} setOpen={setAttrTableOpen} onClose={onClose}/>;
    const windowProps = {title: t('map.attr-table'), width: 300, height: 300, onClose};
    dispatch(showWindow(windowID, windowProps, content));
  };

  const headerText = useMemo(() => {
    return getHeaderText(isCreating, selectedElement?.type, activeLayer?.name, t);
  }, [activeLayer, selectedElement, isCreating, t]);

  const disableAll = isPropertiesWindowOpen || isAttrTableOpen;

  const disabledCreate = disableAll ||
    (isElementCreating && !isCreating) ||
    !(activeLayer && activeLayer.visible) ||
    (creatingElementTypes.indexOf(creatingType) === -1);

  const disabledProperties = disableAll||
    isElementCreating ||
    !hasPropertiesWindow.includes(selectedElement?.type);

  const arcPathInvalid = selectedElement?.type === 'polyline' ? selectedElement?.arcs[0]?.path?.length <= 2 : false;

  const disabledAccept = disableAll ||
    (!isElementCreating && !isElementEditing) ||
    arcPathInvalid ||
    (oldData.x === null && oldData.arc === null);
  const disabledCancel  = disabledAccept && !(isPolylineCreating && !isPropertiesWindowOpen);

  const disabledAttrTable = disableAll ||
    !selectedElement?.attrTable ||
    Object.keys(selectedElement?.attrTable).length === 0;

  const disabledDelete = disableAll ||
    isElementCreating ||
    !selectedElement;

  return (
    <section className={'map-editing'}>
      <div className={'menu-header'}>{headerText}</div>
      <div className={'map-panel-main'}>
        <div className={'common-buttons'}>
          <button
            className={'map-panel-button k-button'} title={t('map.editing.accept')}
            disabled={disabledAccept}
            onClick={isPolylineCreating ? acceptPolylineValid : acceptEditing}
          >
            <span className={'k-icon k-i-check-outline'} />
          </button>
          <button
            className={'k-button map-panel-button'} title={t('map.editing.cancel')}
            disabled={disabledCancel} onClick={isElementCreating ? cancelCreating : cancelEditing}
          >
            <span className={'k-icon k-i-close-outline'} />
          </button>
          <button
            className={'k-button map-panel-button' + (isCreating ? ' active' : '')} title={t('map.creating.button-hint')}
            disabled={disabledCreate} onClick={toggleCreating}
          >
            <span className={'k-icon k-i-add'} />
          </button>
          <button
            className={'k-button map-panel-button'} title={t('map.editing.properties')}
            disabled={disabledProperties} onClick={showPropertiesWindow}
          >
            <span className={'k-icon k-i-saturation'} />
          </button>
          <button
            className={'k-button map-panel-button'} title={t('map.attr-table')}
            disabled={disabledAttrTable} onClick={showAttrTableWindow}
          >
            <span className={'k-icon k-i-table'} />
          </button>
          <button
            className={'k-button map-panel-button'} title={t('map.editing.delete')}
            disabled={disabledDelete} onClick={showDeleteWindow}
          >
            <span className={'k-icon k-i-delete'}/>
          </button>
        </div>
        {isCreating
          ? <CreateElement
            mapState={mapState}
            formID={formID}
            creatingType={creatingType}
            showPropertiesWindow={showPropertiesWindow}
          />
          : selectedElement
            ? <EditElement type={selectedElement.type} mode={mode} formID={formID}/>
            : <div/>}
      </div>
    </section>
  );
};
