import {useCallback, useEffect, useMemo, useRef} from "react";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";

import {MapPanelHeader} from "../map-panel-header";
import {EditElement} from "./edit-element";
import {CreateElement} from "./create-element";
import {DeleteElementWindow} from "./delete-element";
import {PropertiesWindow} from "../properties-window/properties";
import {AttrTableWindow} from "./attr-table";

import {MapModes} from "../../enums";
import {getHeaderText} from "./editing-utils";
import {applyMouseDownActionToPolyline, applyMouseMoveActionToElement, applyRotateToLabel} from "./edit-element-utils";
import {clientPoint, getNearestPointIndex, listenerOptions} from "../../map-utils";
import {
  acceptMapEditing,
  cancelCreatingElement,
  cancelMapEditing,
  setEditMode,
  startCreatingElement
} from "../../../../../store/actionCreators/maps.actions";
import setOpenedWindow from "../../../../../store/actionCreators/setOpenedWindow";


interface EditingProps {
  mapState: MapState,
  formID: FormID,
}

const mouseMoveNeedModes: MapModes[] = [MapModes.MOVE, MapModes.MOVE_POINT, MapModes.ROTATE];

export const Editing = ({mapState, formID}: EditingProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { canvas, activeLayer, utils, mode, isElementEditing, oldData, mapData } = mapState;
  const selectedElement = mapState.element;

  const isOnMove = useRef(false);
  const initPoint = useRef<ClientPoint>(null);
  const pIndex = useRef<number>(null);

  const mouseDown = useCallback((event: MouseEvent) => {
    if (!isElementEditing) return;
    const point = utils.pointToMap(clientPoint(event));

    initPoint.current = point;
    isOnMove.current = mouseMoveNeedModes.includes(mode);

    if (selectedElement.type !== 'polyline') return;

    const scale = mapData.scale;
    if (mode === MapModes.MOVE_POINT) {
      pIndex.current = getNearestPointIndex(point, scale, selectedElement);
    }
    applyMouseDownActionToPolyline(selectedElement, {mode, point, scale});
    utils.updateCanvas();
  }, [isElementEditing, utils, selectedElement, mode, mapData]);

  const mouseMove = useCallback((event: MouseEvent) => {
    if (!isOnMove.current) return;
    const point = utils.pointToMap(clientPoint(event));
    const action = {mode, point, pIndex: pIndex.current, initPoint: initPoint.current};

    applyMouseMoveActionToElement(selectedElement, action);
    utils.updateCanvas();
  }, [selectedElement, utils, mode]);

  const mouseUp = useCallback(() => {
    isOnMove.current = false;
    initPoint.current = null;
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

  const toggleCreating = useCallback(() => {
    isCreating
      ? dispatch(cancelCreatingElement(formID))
      : dispatch(startCreatingElement(formID));
  }, [isCreating, dispatch, formID]);

  const acceptEditing = useCallback(() => {
    if (!selectedElement) return;
    dispatch(acceptMapEditing(formID));
  }, [selectedElement, dispatch, formID]);

  const cancelEditing = useCallback(() => {
    if (!selectedElement) return;
    dispatch(cancelMapEditing(formID));
  }, [selectedElement, dispatch, formID]);

  const showDeleteWindow = useCallback(() => {
    const name = 'mapDeleteWindow';
    const window = <DeleteElementWindow key={name} mapState={mapState} formID={formID}/>;
    dispatch(setOpenedWindow(name, true, window));
  }, [mapState, dispatch, formID]);

  const showPropertiesWindow = useCallback(() => {
    const name = 'mapPropertiesWindow';
    const window = <PropertiesWindow key={name} mapState={mapState} formID={formID}/>;
    if (mapState.mode < MapModes.MOVE_MAP) dispatch(setEditMode(formID, MapModes.MOVE_MAP));
    dispatch(setOpenedWindow(name, true, window));
  }, [mapState, dispatch, formID]);

  const showAttrTableWindow = useCallback(() => {
    const name = 'mapAttrTableWindow';
    const window = <AttrTableWindow key={name} formID={formID} />;
    dispatch(setOpenedWindow(name, true, window));
  }, [dispatch, formID]);

  const headerText = useMemo(() => {
    return getHeaderText(isCreating, selectedElement?.type, activeLayer?.name, t);
  }, [activeLayer, selectedElement, isCreating, t]);

  const disabledCreate = !(activeLayer && activeLayer.visible);
  const disabledProperties = !['polyline', 'label'].includes(selectedElement?.type);
  const disabledAccept = oldData.x === null && oldData.arc === null;
  const disabledAttrTable = !selectedElement?.attrTable || Object.keys(selectedElement?.attrTable).length === 0;

  const headerButtonProto = {
    selected: isCreating,
    disabled: disabledCreate,
    action: toggleCreating,
    title: t('map.creating.button-hint'),
    icon: 'creating',
  };

  return (
    <section className={'map-editing'}>
      <MapPanelHeader text={headerText} button={headerButtonProto}/>
      <div className={'map-panel-main'}>
        <div className={'common-buttons'}>
          <div>
            <button
              className={'k-button'} title={t('map.editing.accept')}
              disabled={disabledAccept} onClick={acceptEditing}
            >
              <span className={'k-icon k-i-check-outline'} />
            </button>
            <button
              className={'k-button'} title={t('map.editing.cancel')}
              disabled={disabledAccept} onClick={cancelEditing}
            >
              <span className={'k-icon k-i-close-outline'} />
            </button>
            <button
              className={'k-button'} title={t('map.editing.delete')}
              disabled={!selectedElement} onClick={showDeleteWindow}
            >
              <span className={'k-icon k-i-delete'} />
            </button>
          </div>
          <div>
            <button
              className={'k-button'} title={t('map.editing.properties')}
              disabled={disabledProperties} onClick={() => showPropertiesWindow()}
            >
              <span className={'k-icon k-i-saturation'} />
            </button>
            <button
              className={'k-button'} title={t('map.attr-table')}
              disabled={disabledAttrTable} onClick={showAttrTableWindow}
            >
              <span className={'k-icon k-i-table'} />
            </button>
          </div>
        </div>
        {isCreating
          ? <CreateElement mapState={mapState} formID={formID}/>
          : selectedElement ? <EditElement type={selectedElement.type} mode={mode} formID={formID}/> : <div/>
        }
      </div>
    </section>
  );
}
