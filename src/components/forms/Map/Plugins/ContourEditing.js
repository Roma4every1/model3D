import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from "@progress/kendo-react-buttons";
var _ = require("lodash");

export default function ContourEditing(props) {
    const { t } = useTranslation();
    const { formId } = props;
    const sessionId = useSelector((state) => state.sessionId);
    const sessionManager = useSelector((state) => state.sessionManager);
    const formRef = useSelector((state) => state.formRefs[formId]);
    const selectedObject = useSelector((state) => state.formRefs[formId].current.selectedObject());
    const control = useSelector((state) => state.formRefs[formId].current.control());
    const [onEditing, setOnEditing] = React.useState(false);
    const movedPoint = React.useRef(null);

    const getNearestNamedPoint = (point, scale, polyline) => {
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

    control.addEventListener("mousedown", event => {
        if (onEditing && selectedObject) {
            var coords = formRef.current.coords();
            const point = coords.pointToMap(clientPoint(event));
            if (selectedObject.type === 'polyline') {
                var nearestPoint = getNearestNamedPoint(point, formRef.current.centerScale().scale, selectedObject);
                movedPoint.current = nearestPoint;
            }
        }
    }, { passive: true })

    control.addEventListener("mouseup", event => {
        movedPoint.current = null;
    }, { passive: true })

    control.addEventListener("mousemove", event => {
        if (movedPoint.current && selectedObject) {
            var coords = formRef.current.coords();
            const point = coords.pointToMap(clientPoint(event));
            selectedObject.arcs[0].path[movedPoint.current.index * 2] = Math.round(point.x);
            selectedObject.arcs[0].path[movedPoint.current.index * 2 + 1] = Math.round(point.y);
            formRef.current.updateCanvas();
        }
    }, { passive: true })

    const startEditing = (event) => {
        control.blocked = true;
        setOnEditing(true);
    };

    const finishEditing = (event) => {
        movedPoint.current = null;
        setOnEditing(false);
        control.blocked = false;
        formRef.current.mapData().layers[3].modified = true;
    };

    const save = async (event) => {
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

    return (
        <div>
            <Button className="actionbutton" onClick={startEditing}>
                {t('map.startEditing')}
            </Button>
            <Button className="actionbutton" onClick={finishEditing} disabled={!onEditing}>
                {t('map.finishEditing')}
            </Button>
            <Button className="actionbutton" onClick={save}>
                {t('base.save')}
            </Button>
        </div>
    );
}