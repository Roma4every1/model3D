import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from "@progress/kendo-react-buttons";
import setOpenedWindow from "../../../../../store/actionCreators/setOpenedWindow";
import setFormRefs from '../../../../../store/actionCreators/setFormRefs';
import EditWindow from "./EditWindow";
import PropertiesWindow from "./PropertiesWindow";
var _ = require("lodash");

export default function Editing(props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { formId } = props;
    const sessionId = useSelector((state) => state.sessionId);
    const sessionManager = useSelector((state) => state.sessionManager);
    const formRef = useSelector((state) => state.formRefs[formId]);
    const control = useSelector((state) => state.formRefs[formId]?.current?.control());
    const selectedObject = useSelector((state) => state.formRefs[formId + "_selectedObject"]);
    const [onEditing, setOnEditing] = React.useState(false);
    const movedPoint = React.useRef(null);
    const isOnMove = React.useRef(false);
    const mode = React.useRef("movePoint");
    const [mouseDownEvent, setMouseDownEvent] = React.useState(null);
    const [mouseMoveEvent, setMouseMoveEvent] = React.useState(null);
    const [mouseUpEvent, setMouseUpEvent] = React.useState(null);

    React.useEffect(() => {
        if (selectedObject) {
            selectedObject.edited = onEditing;
            formRef.current.updateCanvas();
            dispatch(setFormRefs(formId + "_selectedObjectEditing", onEditing));
        }
    }, [selectedObject, onEditing, formRef, dispatch, formId]);

    const modeHandler = (newMode) => {
        mode.current = newMode;
    }

    var squaredDistanceBetweenPointAndSegment = (segment, point) => {
        let asquared = Math.pow(segment[0][0] - point.x, 2) + Math.pow(segment[0][1] - point.y, 2);
        let bsquared = Math.pow(segment[1][0] - point.x, 2) + Math.pow(segment[1][1] - point.y, 2);
        let csquared = Math.pow(segment[1][0] - segment[0][0], 2) + Math.pow(segment[1][1] - segment[0][1], 2);
        if (asquared > bsquared + csquared) {
            return bsquared;
        }
        if (bsquared > asquared + csquared) {
            return asquared;
        }
        let doublesquare = Math.abs((segment[0][0] - point.x) * (segment[1][1] - point.y) - (segment[1][0] - point.x) * (segment[0][1] - point.y));
        return (doublesquare * doublesquare / csquared);
    }

    const getNearestSegment = React.useCallback((point, polyline) => {
        var nearestNp = 0;
        var points = _.chunk(polyline.arcs[0].path, 2);
        if (polyline.arcs[0].closed) {
            points = [...points, points[0]];
        }
        var minDist = squaredDistanceBetweenPointAndSegment([points[0], points[1]], point);
        for (let i = 1; i < points.length - 1; i++) {
            let segment = [points[i], points[i + 1]];
            let dist = squaredDistanceBetweenPointAndSegment(segment, point);
            if (dist < minDist) {
                minDist = dist;
                nearestNp = i;
            }
        }
        return nearestNp;
    }, []);

    const getNearestPoint = (point, scale, polyline) => {
        var SELECTION_RADIUS = 0.015;
        var minRadius;
        var nearestNp = null;
        var points = _.chunk(polyline.arcs[0].path, 2);
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

    var clientPoint = (event) => {
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

    var mouseDownHandler = React.useCallback((event) => {
        if (selectedObject) {
            isOnMove.current = true;
            let coords = formRef.current.coords();
            const point = coords.pointToMap(clientPoint(event));
            if (mode.current === "deletePoint") {
                let nearestPoint = getNearestPoint(point, formRef.current.centerScale().scale, selectedObject);
                if (nearestPoint) {
                    selectedObject.arcs[0].path.splice(nearestPoint.index * 2, 2);
                    dispatch(setFormRefs(formId + "_selectedObjectLength", selectedObject.arcs[0].path.length));
                    formRef.current.updateCanvas();
                }
            }
            else if (mode.current === "movePoint") {
                let nearestPoint = getNearestPoint(point, formRef.current.centerScale().scale, selectedObject);
                movedPoint.current = nearestPoint;
            }
            else if (mode.current === "addPointToEnd") {
                selectedObject.arcs[0].path = [...selectedObject.arcs[0].path, point.x, point.y];
                formRef.current.updateCanvas();
            }
            else if (mode.current === "addPointBetween") {
                let nearestPoint = getNearestSegment(point, selectedObject);
                selectedObject.arcs[0].path.splice(nearestPoint * 2 + 2, 0, point.x, point.y);
                movedPoint.current = nearestPoint;
                formRef.current.updateCanvas();
            }
        }
    }, [formRef, selectedObject, dispatch, formId, getNearestSegment]);

    var mouseMoveHandler = React.useCallback((event) => {
        if (selectedObject && isOnMove.current) {
            var coords = formRef.current.coords();
            const point = coords.pointToMap(clientPoint(event));
            if (mode.current === "movePoint" && movedPoint.current) {
                selectedObject.arcs[0].path[movedPoint.current.index * 2] = Math.round(point.x);
                selectedObject.arcs[0].path[movedPoint.current.index * 2 + 1] = Math.round(point.y);
            }
            else if (mode.current === "addPointToEnd") {
                selectedObject.arcs[0].path[selectedObject.arcs[0].path.length - 2] = Math.round(point.x);
                selectedObject.arcs[0].path[selectedObject.arcs[0].path.length - 1] = Math.round(point.y);
            }
            else if (mode.current === "addPointBetween") {
                selectedObject.arcs[0].path[movedPoint.current * 2 + 2] = Math.round(point.x);
                selectedObject.arcs[0].path[movedPoint.current * 2 + 3] = Math.round(point.y);
            }
            formRef.current.updateCanvas();
        }
    }, [formRef, selectedObject]);

    var mouseUpHandler = React.useCallback((event) => {
        isOnMove.current = false;
        if (mode.current === "movePoint") {
            movedPoint.current = null;
        }
        else if (mode.current === "addPointToEnd") {
            var coords = formRef.current.coords();
            const point = coords.pointToMap(clientPoint(event));
            selectedObject.arcs[0].path[-2] = Math.round(point.x);
            selectedObject.arcs[0].path[-1] = Math.round(point.y);
            formRef.current.updateCanvas();
        }
    }, [formRef, selectedObject]);

    React.useEffect(() => {
        if (mouseDownEvent && onEditing) {
            mouseDownHandler(mouseDownEvent);
        }
    }, [mouseDownEvent, mouseDownHandler, onEditing]);

    React.useEffect(() => {
        if (mouseMoveEvent && onEditing) {
            mouseMoveHandler(mouseMoveEvent);
        }
    }, [mouseMoveEvent, mouseMoveHandler, onEditing]);

    React.useEffect(() => {
        if (mouseUpEvent && onEditing) {
            mouseUpHandler(mouseUpEvent);
        }
    }, [mouseUpEvent, mouseUpHandler, onEditing]);

    React.useEffect(() => {
        var ignore = false;
        if (control) {
            control.addEventListener("mousedown", event => {
                if (!ignore) {
                    setMouseDownEvent(event);
                }
            }, { passive: true })

            control.addEventListener("mousemove", event => {
                if (!ignore) {
                    setMouseMoveEvent(event);
                }
            }, { passive: true })

            control.addEventListener("mouseup", event => {
                if (!ignore) {
                    setMouseUpEvent(event);
                }
            }, { passive: true })
        }
        return () => { ignore = true; }
    }, [control]);

    const startEditing = () => {
        control.blocked = true;
        setMouseDownEvent(null);
        setMouseMoveEvent(null);
        setMouseUpEvent(null);
        setOnEditing(true);
        dispatch(setOpenedWindow("editWindow", true,
            <EditWindow
                key="mapPolylineEditing"
                setOnEditing={setOnEditing}
                formId={formId}
                modeHandler={modeHandler}
            />));
    };

    const save = async () => {
        var jsonToSend = {
            sessionId: sessionId,
            formId: formId,
            mapData: formRef.current.mapData(),
            owner: formRef.current.mapInfo().Cells[12],
            mapId: formRef.current.mapInfo().Cells[0]
        };
        const jsonToSendString = JSON.stringify(jsonToSend);
        await sessionManager.fetchData(`saveMap`,
            {
                method: 'POST',
                body: jsonToSendString
            });
    };

    const showPropertiesWindow = () => {
        dispatch(setOpenedWindow("propertiesWindow", true,
            <PropertiesWindow
                key="mapElementProperties"
                formId={formId}
            />));
    };

    return (
        <div>
            <Button className="actionbutton" onClick={startEditing} disabled={(!selectedObject) || (selectedObject.type !== 'polyline')}>
                {t('map.startEditing')}
            </Button>
            <Button className="actionbutton" onClick={showPropertiesWindow} disabled={(!selectedObject) || (selectedObject.type !== 'polyline' && selectedObject.type !== 'label')}>
                {t('map.properties')}
            </Button>
            <Button className="actionbutton" onClick={save}>
                {t('base.save')}
            </Button>
        </div>
    );
}