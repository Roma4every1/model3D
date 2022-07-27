import React from "react";
import { chunk } from "lodash";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";

import EditWindow from "./EditWindow";
import PropertiesWindow from "./PropertiesWindow";
import AttrTableWindow from "./AttrTableWindow";
import CreateElementWindow from "./CreateElementWindow";
import setOpenedWindow from "../../../../../store/actionCreators/setOpenedWindow";
import setFormRefs from "../../../../../store/actionCreators/setFormRefs";


const squaredDistanceBetweenPointAndSegment = (segment, point) => {
  const aSquared = Math.pow(segment[0][0] - point.x, 2) + Math.pow(segment[0][1] - point.y, 2);
  const bSquared = Math.pow(segment[1][0] - point.x, 2) + Math.pow(segment[1][1] - point.y, 2);
  const cSquared = Math.pow(segment[1][0] - segment[0][0], 2) + Math.pow(segment[1][1] - segment[0][1], 2);

  if (aSquared > bSquared + cSquared) return bSquared;
  if (bSquared > aSquared + cSquared) return aSquared;

  const doubleSquare = Math.abs((segment[0][0] - point.x) * (segment[1][1] - point.y) - (segment[1][0] - point.x) * (segment[0][1] - point.y));
  return (doubleSquare * doubleSquare / cSquared);
};

const clientPoint = (event) => {
  return 'offsetX' in event
    ? {x: event.offsetX, y: event.offsetY}
    : {x: event.clientX, y: event.clientY};
};

export default function Editing({formId}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const sessionId = useSelector((state) => state.sessionId);
  const sessionManager = useSelector((state) => state.sessionManager);

  const formRef = useSelector((state) => state.formRefs[formId]);
  const control = useSelector((state) => state.formRefs[formId]?.current?.control());
  const activeLayer = useSelector((state) => state.formRefs[formId + '_activeLayer']);
  const mapData = useSelector((state) => state.formRefs[formId + '_mapData']);
  const changed = useSelector((state) => state.formRefs[formId + '_modified']);
  const selectedObject = useSelector((state) => state.formRefs[formId + '_selectedObject']);

  const modifiedLayer = mapData?.layers?.find(l => l.elements?.includes(selectedObject));

  const [onEditing, setOnEditing] = React.useState(false);
  const [legendsData, setLegendsData] = React.useState(null);
  const [labelCreating, setLabelCreating] = React.useState(false);

  const movedPoint = React.useRef(null);
  const isOnMove = React.useRef(false);
  const mode = React.useRef("movePoint");


  const clearForm = React.useCallback(() => {
    if (formRef?.current) {
      formRef.current.setSelectedObject(null);
    }

    dispatch(setFormRefs(formId + '_cursor', 'auto'));
    dispatch(setFormRefs(formId + '_selectedObjectLength', 0));
    dispatch(setOpenedWindow('editWindow', false, null));
    dispatch(setOpenedWindow('propertiesWindow', false, null));
    dispatch(setOpenedWindow('createElementWindow', false, null));
    dispatch(setOpenedWindow('attrTableWindow', false, null));
    dispatch(setOpenedWindow('deleteMapElementWindow', false, null));
    dispatch(setFormRefs(formId + '_modified', false));
    dispatch(setFormRefs(formId + '_selectedObjectEditing', false));
  }, [formId, formRef, dispatch]);

  React.useEffect(() => {
    if (!mapData) clearForm();
  }, [mapData, clearForm]);

  React.useEffect(() => {
    if (selectedObject) {
      selectedObject.edited = onEditing;
      if (formRef.current) formRef.current.updateCanvas();
    }
    dispatch(setFormRefs(formId + '_selectedObjectEditing', onEditing));
  }, [selectedObject, onEditing, formRef, dispatch, formId]);

  const modeHandler = (newMode) => {mode.current = newMode};

  const getNearestSegment = React.useCallback((point, polyline) => {
    let nearestNp = 0;
    let points = chunk(polyline.arcs[0].path, 2);
    if (polyline.arcs[0].closed) {
      points = [...points, points[0]];
    }
    let minDist = squaredDistanceBetweenPointAndSegment([points[0], points[1]], point);

    for (let i = 1; i < points.length - 1; i++) {
      let segment = [points[i], points[i + 1]];
      let dist = squaredDistanceBetweenPointAndSegment(segment, point);

      if (dist < minDist) {
          minDist = dist;
          nearestNp = i;
      }
    }

    if (!polyline.arcs[0].closed) {
      const d1 = Math.pow(points[0][0] - point.x, 2) + Math.pow(points[0][1] - point.y, 2);
      const d2 = Math.pow(points[points.length - 1][0] - point.x, 2) + Math.pow(points[points.length - 1][1] - point.y, 2);

      if (d1 <= minDist) nearestNp = -1;
      if (d2 <= minDist && d2 < d1) nearestNp = points.length - 1;
    }
    return nearestNp;
  }, []);

  const getNearestPoint = (point, scale, polyline) => {
    const SELECTION_RADIUS = 0.015;
    let minRadius;
    let nearestNp = null;
    const points = chunk(polyline.arcs[0].path, 2);

    points.forEach((p, i) => {
      var localDist = Math.sqrt(Math.pow(p[0] - point.x, 2) + Math.pow(p[1] - point.y, 2));
      if (!minRadius || localDist < minRadius) {
        minRadius = localDist;
        if ((minRadius / scale) < SELECTION_RADIUS) {
          nearestNp = { point: p, index: i };
        }
      }
    });
    return nearestNp;
  };

  const showPropertiesWindow = React.useCallback((initialReadyForApply) => {
    dispatch(setOpenedWindow("propertiesWindow", true,
      <PropertiesWindow
        initialReadyForApply={initialReadyForApply}
        key="mapElementProperties"
        formId={formId}
        onClosed={(applied) => {
          if (!applied && initialReadyForApply) {
            activeLayer.elements.splice(activeLayer.elements.length - 1, 1);
            formRef.current.setSelectedObject(null);
            formRef.current.updateCanvas();
          }
        }}
      />));
  }, [activeLayer, dispatch, formId, formRef]);

  const mouseDown = React.useCallback((event) => {
    if (onEditing) {
      if (selectedObject?.type === 'polyline') {
        isOnMove.current = true;
        let coords = formRef.current.coords();
        const point = coords.pointToMap(clientPoint(event));

        if (mode.current === 'deletePoint') {
          let nearestPoint = getNearestPoint(point, formRef.current.centerScale().scale, selectedObject);
          if (nearestPoint) {
            selectedObject.arcs[0].path.splice(nearestPoint.index * 2, 2);
            dispatch(setFormRefs(formId + '_selectedObjectLength', selectedObject.arcs[0].path.length));
            formRef.current.updateCanvas();
          }
        } else if (mode.current === 'movePoint') {
          movedPoint.current = getNearestPoint(point, formRef.current.centerScale().scale, selectedObject);
        } else if (mode.current === 'addPointToEnd') {
          selectedObject.arcs[0].path = [...selectedObject.arcs[0].path, point.x, point.y];
          dispatch(setFormRefs(formId + '_selectedObjectLength', selectedObject.arcs[0].path.length));
          formRef.current.updateCanvas();
        } else if (mode.current === 'addPointBetween') {
          let nearestPoint = getNearestSegment(point, selectedObject);
          selectedObject.arcs[0].path.splice(nearestPoint * 2 + 2, 0, point.x, point.y);
          movedPoint.current = nearestPoint;
          formRef.current.updateCanvas();
        }
      }
    }
  }, [onEditing, formRef, selectedObject, dispatch, formId, getNearestSegment]);

  const createNewLabel = React.useCallback(() => {
    let newElement;
    // const sublayerSettings = legendsData?.sublayers?.find(d => d.name === activeLayer?.name);
    //
    // if (sublayerSettings) {
    //   let legendToSet = sublayerSettings.legends.find(l => l.default);
    //   if (!legendToSet && sublayerSettings.legends.length > 0) {
    //     legendToSet = sublayerSettings.legends[0];
    //   }
    //   if (legendToSet && sublayerSettings.type === 'LabelModel') {}
    // }

    if (activeLayer?.elements?.length > 0) {
        newElement = {...activeLayer.elements[0]};
    } else {
      newElement = {
        type: 'label',
        fontname: 'Arial',
        fontsize: 12,
        color: '#000000',
        halignment: 1,
        valignment: 1,
        angle: 0,
      };
    }
    newElement.text = 'text';
    return newElement;
  }, [activeLayer]); //, legendsData]);

  const mouseUp = React.useCallback((event) => {
    if (onEditing) {
      isOnMove.current = false;
      if (labelCreating) {
        dispatch(setFormRefs(formId + '_cursor', 'auto'));
        let coords = formRef.current.coords();
        const point = coords.pointToMap(clientPoint(event));
        let newElement = createNewLabel();

        newElement.x = point.x;
        newElement.y = point.y;
        activeLayer.elements.push(newElement);
        formRef.current.setSelectedObject(newElement);
        showPropertiesWindow(true);
        setLabelCreating(false);
        setOnEditing(false);

      } else if (mode.current === 'movePoint') {

        movedPoint.current = null;

      } else if (mode.current === 'addPointToEnd') {

        const coords = formRef.current.coords();
        const point = coords.pointToMap(clientPoint(event));

        selectedObject.arcs[0].path[-2] = Math.round(point.x);
        selectedObject.arcs[0].path[-1] = Math.round(point.y);
        formRef.current.updateCanvas();
      }
    }
  }, [onEditing, formRef, selectedObject, dispatch, formId, labelCreating, activeLayer, showPropertiesWindow, createNewLabel]);

  const mouseMove = React.useCallback((event) => {
    if (onEditing) {
      if (selectedObject?.type === 'polyline' && isOnMove.current) {
        const coords = formRef.current.coords();
        const point = coords.pointToMap(clientPoint(event));

        if (mode.current === 'movePoint' && movedPoint.current) {
          selectedObject.arcs[0].path[movedPoint.current.index * 2] = Math.round(point.x);
          selectedObject.arcs[0].path[movedPoint.current.index * 2 + 1] = Math.round(point.y);
        } else if (mode.current === 'addPointToEnd') {
          selectedObject.arcs[0].path[selectedObject.arcs[0].path.length - 2] = Math.round(point.x);
          selectedObject.arcs[0].path[selectedObject.arcs[0].path.length - 1] = Math.round(point.y);
        } else if (mode.current === 'addPointBetween') {
          selectedObject.arcs[0].path[movedPoint.current * 2 + 2] = Math.round(point.x);
          selectedObject.arcs[0].path[movedPoint.current * 2 + 3] = Math.round(point.y);
        }
        formRef.current.updateCanvas();
      }
    }
  }, [onEditing, selectedObject, formRef]);

  React.useEffect(() => {
    if (control) {
      control.addEventListener('mousedown', mouseDown, { passive: true });
      control.addEventListener('mousemove', mouseMove, { passive: true });
      control.addEventListener('mouseup', mouseUp, { passive: true });
    }
    return () => {
      if (control) {
        control.removeEventListener('mousedown', mouseDown, { passive: true });
        control.removeEventListener('mousemove', mouseMove, { passive: true });
        control.removeEventListener('mouseup', mouseUp, { passive: true });
      }
    }
  }, [control, mouseDown, mouseMove, mouseUp]);

  const startEditing = () => {
    control.blocked = true;
    setOnEditing(true);
    dispatch(setOpenedWindow('editWindow', true,
      <EditWindow
        key="mapPolylineEditing"
        setOnEditing={setOnEditing}
        formId={formId}
        modeHandler={modeHandler}
      />));
  };

  const save = async () => {
    const jsonToSend = {
      sessionId: sessionId,
      formId: formId,
      mapData: formRef.current.mapData(),
      owner: formRef.current.mapInfo().Cells[12],
      mapId: formRef.current.mapInfo().Cells[0]
    };

    const jsonToSendString = JSON.stringify(jsonToSend);
    await sessionManager.fetchData('saveMap', {method: 'POST', body: jsonToSendString});
  };

  const handleCloseDeleteWindow = () => {
    dispatch(setOpenedWindow('deleteMapElementWindow', false, null));
  };

  const handleDelete = () => {
    let index = modifiedLayer.elements.indexOf(selectedObject);
    modifiedLayer.elements.splice(index, 1);
    modifiedLayer.modified = true;

    dispatch(setFormRefs(formId + "_modified", true));
    handleCloseDeleteWindow();

    formRef.current.setSelectedObject(null);
    formRef.current.updateCanvas();
  };

  const showDeleteWindow = () => {
    dispatch(setOpenedWindow('deleteMapElementWindow', true,
      <Dialog key="deleteMapElementWindow" title={t('map.deleteElement', { sublayerName: modifiedLayer?.name })} onClose={handleCloseDeleteWindow}>
        {t('map.areYouSureToDelete')}
        <DialogActionsBar>
          <div className="windowButtonContainer">
            <Button className="windowButton" onClick={handleDelete}>
              {t('base.yes')}
            </Button>
          </div>
          <div className="windowButtonContainer">
            <Button className="windowButton" onClick={handleCloseDeleteWindow}>
              {t('base.no')}
            </Button>
          </div>
        </DialogActionsBar>
      </Dialog>));
  };

  const create = () => {
    async function fetchData() {
      const data = await sessionManager.fetchData(`mapLegends?sessionId=${sessionId}`);
      setLegendsData(data);
      createByLegends(data);
    }
    !legendsData ? fetchData() : createByLegends(legendsData);
  };

  const startNewLabel = React.useCallback(() => {
    if (selectedObject) {
      selectedObject.selected = false;
      formRef.current.updateCanvas();
    }
    formRef.current.setSelectedObject(null);
    setOnEditing(true);
    dispatch(setFormRefs(formId + '_cursor', 'crosshair'));
    setLabelCreating(true);
  }, [dispatch, formRef, formId, selectedObject]);

  const getDefaultPolyline = () => {
    return {
      attrTable: {},
      type: 'polyline',
      arcs: [{ closed: false, path: [] }],
      bounds: null,
      borderstyle: 0,
      fillbkcolor: '#FFFFFF',
      fillcolor: '#000000',
      bordercolor: '#000000',
      borderwidth: 0.25,
      transparent: true,
    }
  }

  const startNewPolyline = React.useCallback((newElement) => {
    if (selectedObject) {
      selectedObject.selected = false;
      formRef.current.updateCanvas();
    }
    activeLayer.elements.push(newElement);
    dispatch(setFormRefs(formId + '_selectedObjectLength', 0));
    formRef.current.setSelectedObject(newElement);
    setOnEditing(true);
    dispatch(setOpenedWindow('editWindow', true,
      <EditWindow
        initialMode="addPointToEnd"
        key="mapPolylineEditing"
        setOnEditing={setOnEditing}
        formId={formId}
        modeHandler={modeHandler}
        onClosed={(applied) => {
          if (applied) {
            showPropertiesWindow(true);
          } else {
            activeLayer.elements.splice(activeLayer.elements.length - 1, 1);
            formRef.current.setSelectedObject(null);
            formRef.current.updateCanvas();
          }
        }}
      />));
  }, [dispatch, formRef, formId, activeLayer, showPropertiesWindow, selectedObject]);

  const setResult = React.useCallback((res) => {
    switch (res) {
      case 'label': {
        startNewLabel();
        break;
      }
      case 'polyline': {
        let newElement = getDefaultPolyline();
        startNewPolyline(newElement);
        break;
      }
      default: break;
    }
  }, [startNewLabel, startNewPolyline]);

  const createByLegends = React.useCallback((legends) => {

        const sublayerSettings = legends?.sublayers?.find(d => d.name === activeLayer?.name);
        if (sublayerSettings) {
            let legendToSet = sublayerSettings.legends.find(l => l.default);
            if (!legendToSet && sublayerSettings.legends.length > 0) {
                legendToSet = sublayerSettings.legends[0];
            }
            if (legendToSet) {
                switch (sublayerSettings.type) {
                    case 'LabelModel':
                        break;
                    case 'PolylineModel':
                        let newElement = getDefaultPolyline();
                        legendToSet.attrTable.forEach(p => {
                            newElement.attrTable[p.name] = p.value
                        });
                        newElement.legend = legendToSet;

                        legendToSet.properties.forEach(p => {
                            switch (p.name) {
                                case "BorderStyle":
                                    newElement.borderstyle = Number(p.value.replace(',', '.'));
                                    break;
                                case "BorderStyleId":
                                    newElement.borderstyle = null;
                                    newElement.borderstyleid = p.value;
                                    break;
                                case "Closed":
                                    newElement.arcs[0].closed = (p.value === "True");
                                    break;
                                case "FillBkColor":
                                    newElement.fillbkcolor = '#' + (p.value.slice(-6));
                                    break;
                                case "FillColor":
                                    newElement.fillcolor = '#' + (p.value.slice(-6));
                                    break;
                                case "FillName":
                                    newElement.fillname = p.value;
                                    break;
                                case "StrokeColor":
                                    newElement.bordercolor = '#' + (p.value.slice(-6));
                                    break;
                                case "StrokeThickness":
                                    newElement.borderwidth = Number(p.value.replace(',', '.'));
                                    break;
                                case "Transparency":
                                    newElement.transparent = (p.value !== "Nontransparent");
                                    break;
                                default:
                                    break;
                            }
                        });
                        startNewPolyline(newElement);
                        break;
                    default:
                        break;
                }
            }
        }
        else {
            if (activeLayer.elements.length > 0) {
                switch (activeLayer.elements[0].type) {
                    case 'label':
                        startNewLabel();
                        break;
                    case 'polyline':
                        let newElement = { ...activeLayer.elements[0] };
                        newElement.arcs = [{ closed: activeLayer.elements[0].arcs[0].closed, path: [] }];
                        newElement.bounds = null;
                        startNewPolyline(newElement);
                        break;
                    default:
                        break;
                }
            }
            else {
                dispatch(setOpenedWindow('createElementWindow', true,
                    <CreateElementWindow
                        key="createElementWindow"
                        modifiedLayerName={activeLayer?.name}
                        setResult={setResult}
                    />));
            }
        }
    }, [activeLayer, dispatch, setResult, startNewLabel, startNewPolyline]);

  const showAttrTableWindow = () => {
    dispatch(setOpenedWindow('attrTableWindow', true,
            <AttrTableWindow key="attrTableWindow" formId={formId} />));
  };

  return (
    <div>
      <Button className="actionbutton" onClick={startEditing} disabled={(!selectedObject) || (selectedObject.type !== 'polyline')}>
        {t('map.startEditing')}
      </Button>
      <Button className="actionbutton" onClick={create} disabled={(!(activeLayer?.visible)) || (activeLayer.elements.length > 0 && activeLayer.elements[0].type !== 'label' && activeLayer.elements[0].type !== 'polyline')}>
        {t('map.create')}
      </Button>
      <Button className="actionbutton" onClick={showDeleteWindow} disabled={!selectedObject}>
        {t('map.delete')}
      </Button>
      <Button className="actionbutton" onClick={() => showPropertiesWindow()} disabled={(!selectedObject) || (selectedObject.type !== 'polyline' && selectedObject.type !== 'label')}>
        {t('map.properties')}
      </Button>
      <Button className="actionbutton" onClick={showAttrTableWindow} disabled={!selectedObject}>
        {t('map.attrTable')}
      </Button>
      <Button className="actionbutton" onClick={save} disabled={!changed}>
        {t('base.save')}
      </Button>
    </div>
  );
}