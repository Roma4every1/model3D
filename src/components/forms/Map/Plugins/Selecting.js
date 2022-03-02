import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Popup } from "@progress/kendo-react-popup";
import { Button } from "@progress/kendo-react-buttons";
var pixelPerMeter = require("../maps/src/pixelPerMeter");
var mapDrawerTypes = require("../maps/src/mapDrawer");
var _ = require("lodash");

export default function Selecting(props) {
    const { t } = useTranslation();
    const { formId } = props;
    const formRef = useSelector((state) => state.formRefs[formId]);
    const mapData = useSelector((state) => state.formRefs[formId + "_mapData"]);
    const activeLayer = useSelector((state) => state.formRefs[formId + "_activeLayer"]);
    const selectedObject = useSelector((state) => state.formRefs[formId + "_selectedObject"]);
    const selectedObjectEditing = useSelector((state) => state.formRefs[formId + "_selectedObjectEditing"]);
    const control = useSelector((state) => state.formRefs[formId]?.current?.control());
    const [pressed, setPressed] = React.useState(control?.selectingMode);
    const [mode, setMode] = React.useState("sublayer");

    React.useEffect(() => {
        if (!mapData) {
            if (control) {
                control.selectingMode = false;
            }
            setPressed(false);
        }
    }, [mapData]);

    var SELECTION_RADIUS = 0.005;

    var distanceBetweenPointAndSegment = (segment, point, minDistance) => {
        let asquared = Math.pow(segment[0][0] - point.x, 2) + Math.pow(segment[0][1] - point.y, 2);
        if (asquared < minDistance * minDistance) {
            return true;
        }
        let bsquared = Math.pow(segment[1][0] - point.x, 2) + Math.pow(segment[1][1] - point.y, 2);
        if (bsquared < minDistance * minDistance) {
            return true;
        }
        let csquared = Math.pow(segment[1][0] - segment[0][0], 2) + Math.pow(segment[1][1] - segment[0][1], 2);
        if (asquared > bsquared + csquared || bsquared > asquared + csquared) {
            return false;
        }
        let c = Math.hypot(segment[1][0] - segment[0][0], segment[1][1] - segment[0][1]);
        let doublesquare = Math.abs((segment[0][0] - point.x) * (segment[1][1] - point.y) - (segment[1][0] - point.x) * (segment[0][1] - point.y));
        if (doublesquare / c < minDistance) {
            return true;
        }
        return false;
    }

    var distance = React.useCallback((element, point, scale) => {
        if (element.type === "polyline" && element.fillbkcolor) {
            let sum = 0;
            let points = _.chunk(element.arcs[0].path, 2);
            points = [...(points.map(p => [p[0] - point.x, p[1] - point.y])), [points[0][0] - point.x, points[0][1] - point.y]];
            for (let i = 0; i < points.length - 1; i++) {
                let tg1 = (points[i][0] * points[i][0] + points[i][1] * points[i][1] - points[i][0] * points[i + 1][0] - points[i][1] * points[i + 1][1]) / (points[i][0] * points[i + 1][1] - points[i][1] * points[i + 1][0]);
                let tg2 = (points[i + 1][0] * points[i + 1][0] + points[i + 1][1] * points[i + 1][1] - points[i][0] * points[i + 1][0] - points[i][1] * points[i + 1][1]) / (points[i][0] * points[i + 1][1] - points[i][1] * points[i + 1][0]);
                sum += Math.atan(tg1) + Math.atan(tg2);
            }
            return (Math.abs(sum) > 0.0000001);
        }
        else if (element.type === "polyline" && !element.fillbkcolor) {
            let points = _.chunk(element.arcs[0].path, 2);
            if (element.arcs[0].closed) {
                points = [...points, points[0]];
            }
            for (let i = 0; i < points.length - 1; i++) {
                let segment = [points[i], points[i + 1]];
                if (distanceBetweenPointAndSegment(segment, point, SELECTION_RADIUS * scale)) {
                    return true;
                }
            }
        }
        else if (element.type === "label") {
            var fontsize = (element.fontsize + (element.selected ? 2 : 0)) * // pt
                (1 / 72 * 0.0254) * // meters
                scale; // pixels
            var width = control.getContext("2d").measureText(element.text).width * scale / pixelPerMeter();
            var x = element.x;
            var y = element.y;
            x += (element.xoffset || 0) * 0.001 * scale;
            y -= (element.yoffset || 0) * 0.001 * scale;
            var xx = point.x - x;
            var yy = point.y - y;
            var angle = element.angle / 180 * Math.PI;
            var xtrans = xx * Math.cos(angle) - yy * Math.sin(angle) + (width + 2) / 2 * element.halignment;
            var ytrans = xx * Math.sin(angle) + yy * Math.cos(angle) - (fontsize + 2) * (element.valignment / 2 - 1);
            var result = (0 <= xtrans) && (xtrans <= width) && (0 <= ytrans) && (ytrans <= fontsize + 3);
            return result;
        }
        return false;
    }, [SELECTION_RADIUS, control]);

    var clientPoint = (event, point) => {
        var ret;
        if ("offsetX" in event)
            ret = {
                x: event.offsetX,
                y: event.offsetY,
            }
        else
            ret = {
                x: event.clientX,
                y: event.clientY,
            }
        return ret;
    };

    var oldPointData = React.useRef(null);

    var mouseDown = React.useCallback((event) => {
        if ((!selectedObjectEditing) && pressed && formRef.current) {
            var coords = formRef.current.coords();
            const point = coords.pointToMap(clientPoint(event));
            let scale = formRef.current.centerScale().scale;
            if (oldPointData.current && (Math.pow(oldPointData.current.point.x - point.x, 2) + Math.pow(oldPointData.current.point.y - point.y, 2) < SELECTION_RADIUS * scale * SELECTION_RADIUS * scale)) {
                if (oldPointData.current.nearestElements.length > 0) {
                    oldPointData.current.activeIndex++;
                    const setActive = async () => {
                        let selectedObject = formRef.current.selectedObject();
                        if (selectedObject) {
                            selectedObject.selected = false;
                            if (selectedObject.fillname && !selectedObject.transparent) {
                                selectedObject.img = await mapDrawerTypes.types["polyline"].getPattern(selectedObject.fillname, selectedObject.fillcolor, mapDrawerTypes.types["polyline"].bkcolor(selectedObject));
                            }
                        }
                        if (oldPointData.current.activeIndex < oldPointData.current.nearestElements.length) {
                            let newSelectedObject = oldPointData.current.nearestElements[oldPointData.current.activeIndex];
                            newSelectedObject.selected = true;
                            if (newSelectedObject.fillname && !newSelectedObject.transparent) {
                                newSelectedObject.img = await mapDrawerTypes.types["polyline"].getPattern(newSelectedObject.fillname, newSelectedObject.fillcolor, mapDrawerTypes.types["polyline"].bkcolor(newSelectedObject));
                            }
                            formRef.current.setSelectedObject(newSelectedObject);
                        }
                        else {
                            oldPointData.current.activeIndex = -1;
                            formRef.current.setSelectedObject(null);
                        }
                        formRef.current.updateCanvas();
                    }
                    setActive();
                }
            }
            else {
                let nearestElements = [];
                if (activeLayer && (mode === "sublayer")) {
                    nearestElements = activeLayer.elements.filter(element => distance(element, point, scale));
                }
                else {
                    let mapData = formRef.current.mapData();
                    mapData.layers.forEach(layer => {
                        if (layer.visible) {
                            nearestElements = [...nearestElements, ...layer.elements.filter(element => distance(element, point, formRef.current.centerScale().scale))];
                        }
                    })
                }
                nearestElements.reverse();
                if (nearestElements.length > 0) {
                    const setActive = async () => {
                        let activeIndex = 0;
                        let selectedObject = formRef.current.selectedObject();
                        if (selectedObject) {
                            selectedObject.selected = false;
                            if (selectedObject.fillname && !selectedObject.transparent) {
                                selectedObject.img = await mapDrawerTypes.types["polyline"].getPattern(selectedObject.fillname, selectedObject.fillcolor, mapDrawerTypes.types["polyline"].bkcolor(selectedObject));
                            }
                        }
                        let newSelectedObject = nearestElements[activeIndex];
                        newSelectedObject.selected = true;
                        if (newSelectedObject.fillname && !newSelectedObject.transparent) {
                            newSelectedObject.img = await mapDrawerTypes.types["polyline"].getPattern(newSelectedObject.fillname, newSelectedObject.fillcolor, mapDrawerTypes.types["polyline"].bkcolor(newSelectedObject));
                        }
                        formRef.current.setSelectedObject(newSelectedObject);
                        formRef.current.updateCanvas();

                        oldPointData.current = {
                            point: point,
                            nearestElements: nearestElements,
                            activeIndex: 0
                        }
                    }
                    setActive();
                }
                else {
                    oldPointData.current = null;
                }
            }
        }
    }, [mode, pressed, activeLayer, SELECTION_RADIUS, formRef, distance, selectedObjectEditing]);

    React.useEffect(() => {
        if (control) {
            control.addEventListener("mousedown", mouseDown, { passive: true });
        }
        return () => {
            if (control) {
                control.removeEventListener("mousedown", mouseDown, { passive: true });
            }
        }
    }, [control, mouseDown]);

    const setButtonPressed = () => {
        if (control) {
            control.selectingMode = !pressed;
        }
        if (pressed) {
            if (selectedObject) {
                selectedObject.selected = false;
                formRef.current.setSelectedObject(null);
                formRef.current.updateCanvas();
            }
        }
        setPressed(!pressed);
    };

    const [popoverState, setPopoverState] = React.useState({
        anchorEl: null,
        open: false
    });

    const showColumnListClick = (event) => {
        setPopoverState({
            anchorEl: event.currentTarget,
            open: !popoverState.open,
        });
    };

    return (
        <div>
            <Button togglable={true} selected={pressed} className='mapPickButton' onClick={setButtonPressed} title={t('map.pick')}>
                <span className="k-icon k-i-button" />
            </Button>
            <Button className="mapPickPopupButton" onClick={showColumnListClick}>
                <span className="k-icon k-i-arrow-60-down" />
            </Button>
            <Popup className="popup"
                id={formId}
                show={popoverState.open}
                anchor={popoverState.anchorEl}
            >
                <div className="mapPickPopup">
                    <div onClick={() => setMode("sublayer")} className="mapPickPopupItem" >
                        <div className="mapPickPopupItemCheck" >
                            {mode === "sublayer" ? <span className="k-icon k-i-check" /> : <span className="k-icon" />}
                        </div>
                        <div className="mapPickPopupItemLabel">
                            {t('map.sublayer')}
                        </div>
                    </div>
                    <div onClick={() => setMode("none")} className="mapPickPopupItem" >
                        <div className="mapPickPopupItemCheck" >
                            {mode === "none" ? <span className="k-icon k-i-check" /> : <span className="k-icon" />}
                        </div>
                        <div className="mapPickPopupItemLabel">
                            {t('base.none')}
                        </div>
                    </div>
                </div>
            </Popup>
        </div >);
}