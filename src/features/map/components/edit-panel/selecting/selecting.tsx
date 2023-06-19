import { TFunction } from 'react-i18next';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Checkbox } from '@progress/kendo-react-inputs';
import { MapModes } from '../../../lib/enums';
import { clientPoint, listenerOptions } from '../../../lib/map-utils';
import { checkDistance, checkDistancePoints, getNearestElements } from './selecting-utils';
import { selectElement, unselectElement } from './selecting-utils';
import { setSelectedElement, clearMapSelect, setEditMode, cancelMapEditing } from '../../../store/maps.actions';
import selectingIcon from '../../../../../assets/images/map/selecting-mode.png';


interface SelectingProps {
  mapState: MapState,
  formID: FormID,
  t: TFunction
}


export const Selecting = ({mapState, formID, t}: SelectingProps) => {
  const dispatch = useDispatch();

  const { canvas, utils, activeLayer, mapData } = mapState;
  const { element: selectedElement, selecting: selectState } = mapState;
  const isInSelectingMode = mapState.mode === MapModes.SELECTING;

  const [isSelectAll, setIsSelectAll] = useState(true);
  const [isSelectContours, setIsSelectContours] = useState(false);
  const [isSelectSign, setIsSelectSign] = useState(false);
  const [isSelectLabels, setIsSelectLabels] = useState(false);
  const [isOnlyActiveLayer, setIsOnlyActiveLayer] = useState(false);

  const allowedTypes = useMemo<string[]>(() => {
    const types = [];
    if (isSelectAll) types.push('all');
    if (isSelectContours) types.push('polyline');
    if (isSelectSign) types.push('sign');
    if (isSelectLabels) types.push('label');
    return types;
  }, [isSelectAll, isSelectContours, isSelectSign, isSelectLabels]);

  const mouseDown = useCallback((event) => {
    if (!isInSelectingMode) return;

    const point = utils.pointToMap(clientPoint(event));
    const scale = mapData.scale;

    if (checkDistancePoints(selectState.lastPoint, point, scale) && selectState.activeIndex >= 0) {
      if (selectState.nearestElements.length === 0) return;
      const setActive = async () => {
        if (selectedElement) await unselectElement(selectedElement);
        selectState.activeIndex = -1;
        dispatch(clearMapSelect(formID));
      }
      setActive().then(() => utils.updateCanvas());
    } else {
      const getTextWidth = (text) => canvas.getContext('2d').measureText(text).width;
      const filterFn = (element) => {
        if (allowedTypes[0] !== 'all' && !allowedTypes.includes(element.type)) return false;
        return checkDistance(element, point, scale, getTextWidth);
      }
      const activeLayer_ = isOnlyActiveLayer ? activeLayer : null;
      const nearestElements = getNearestElements(mapData.layers, activeLayer_, scale, filterFn);

      if (nearestElements.length === 0) return selectState.lastPoint = null;

      const setActive = async () => {
        if (selectedElement) await unselectElement(selectedElement);

        let activeIndex = 0;
        let newElement = nearestElements[activeIndex];
        await selectElement(newElement);
        selectState.activeIndex = 0;
        selectState.nearestElements = nearestElements;
        selectState.lastPoint = point;
        dispatch(setSelectedElement(formID, newElement));
      }
      setActive().then(() => utils.updateCanvas());
    }
  }, [
    allowedTypes, selectedElement, dispatch, formID, isInSelectingMode, isOnlyActiveLayer,
    canvas, utils, selectState, activeLayer, mapData
  ]);

  const mouseWheel = useCallback(() => {
    selectState.lastPoint = null;
  }, [selectState]);

  useEffect(() => {
    if (canvas) {
      canvas.addEventListener('mousedown', mouseDown, listenerOptions);
      canvas.addEventListener('wheel', mouseWheel, listenerOptions);
    }
    return () => {
      if (canvas) {
        canvas.removeEventListener('mousedown', mouseDown);
        canvas.removeEventListener('wheel', mouseWheel);
      }
    }
  }, [canvas, mouseDown, mouseWheel]);

  const toggleSelecting = useCallback(() => {
    if (isInSelectingMode && selectedElement) {
      dispatch(clearMapSelect(formID, false));
      unselectElement(selectedElement).then(() => utils.updateCanvas());
    }
    if (!isInSelectingMode && mapState.isElementEditing) dispatch(cancelMapEditing(formID));
    dispatch(setEditMode(formID, isInSelectingMode ? MapModes.NONE : MapModes.SELECTING));
  }, [dispatch, formID, selectedElement, utils, isInSelectingMode, mapState.isElementEditing]);

  const isSelectAllClick = () => {
    setIsSelectAll(!isSelectAll);

    if (!isSelectAll) {
      setIsSelectContours(false);
      setIsSelectSign(false);
      setIsSelectLabels(false);
    }
  }
  const isSelectContoursClick = () => {
    setIsSelectContours(!isSelectContours);
    setIsSelectAll(false);
  }
  const isSelectWellsClick = () => {
    setIsSelectSign(!isSelectSign);
    setIsSelectAll(false);
  }
  const isSelectLabelsClick = () => {
    setIsSelectLabels(!isSelectLabels);
    setIsSelectAll(false);
  }
  const isOnlyActiveLayerClick = () => {
    setIsOnlyActiveLayer(!isOnlyActiveLayer);
  }

  return (
    <section className={'map-selecting'}>
      <div className={'menu-header'}>{t('map.selecting.header')}</div>
      <div className={'map-panel-main'}>
        <div>
          <button
            className={'map-panel-button' + (isInSelectingMode ? ' active' : '')}
            onClick={toggleSelecting} title={t('map.selecting.button-hint')}
          >
            <img src={selectingIcon} alt={'selecting'}/>
          </button>
        </div>
        <div>
          <Checkbox
            label={t('map.selecting.all')} title={t('map.selecting.all-hint')}
            checked={isSelectAll} onClick={isSelectAllClick}
          />
          <Checkbox
            label={t('map.selecting.contours')} title={t('map.selecting.contours-hint')}
            checked={isSelectContours} onClick={isSelectContoursClick}
          />
          <Checkbox
            label={t('map.selecting.layer')} title={t('map.selecting.layer-hint')}
            checked={isOnlyActiveLayer} onClick={isOnlyActiveLayerClick}
          />
          <Checkbox
            label={t('map.selecting.sign')} title={t('map.selecting.sign-hint')}
            checked={isSelectSign} onClick={isSelectWellsClick}
          />
          <div/>
          <Checkbox
            label={t('map.selecting.label')} title={t('map.selecting.label-hint')}
            checked={isSelectLabels} onClick={isSelectLabelsClick}
          />
        </div>
      </div>
    </section>
  );
}
