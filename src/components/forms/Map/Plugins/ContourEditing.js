import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from "@progress/kendo-react-buttons";
var _ = require("lodash");
var geom = require("../maps/src/geom");
var pixelPerMeter = require("../maps/src/pixelPerMeter");

export default function ContourEditing(props) {
    const { t } = useTranslation();
    const { formId } = props;
    const formRef = useSelector((state) => state.formRefs[formId]);
    const selectedObject = useSelector((state) => state.formRefs[formId].current.selectedObject());
    const control = useSelector((state) => state.formRefs[formId].current.control());
    var dotsPerMeter = control.width / (control.clientWidth / pixelPerMeter());
    const [onEditing, setOnEditing] = React.useState(false);
    const movedPoint = React.useRef(null);
    const centerScale = React.useRef({
        scale: 100000,
        centerx: 0,
        centery: 0
    });

    React.useEffect(() => {
        formRef.current.subscribeOnCenterScaleChanging((cs) => {
            centerScale.current = cs;
        });
    }, [formRef]);

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
        var coords = geom.translator(centerScale.current.scale, { x: centerScale.current.centerx, y: centerScale.current.centery }, dotsPerMeter, { x: control.width / 2, y: control.height / 2 });
        const point = coords.pointToMap(clientPoint(event));
        if (onEditing && selectedObject) {
            if (selectedObject.type === 'polyline') {
                var nearestPoint = getNearestNamedPoint(point, centerScale.current.scale, selectedObject);
                movedPoint.current = nearestPoint;
            }
        }
    }, { passive: true })

    control.addEventListener("mouseup", event => {
        movedPoint.current = null;
    }, { passive: true })

    control.addEventListener("mousemove", event => {
        if (movedPoint.current && selectedObject) {
            var coords = geom.translator(centerScale.current.scale, { x: centerScale.current.centerx, y: centerScale.current.centery }, dotsPerMeter, { x: control.width / 2, y: control.height / 2 });
            const point = coords.pointToMap(clientPoint(event));
            selectedObject.arcs[0].path[movedPoint.current.index * 2] = point.x;
            selectedObject.arcs[0].path[movedPoint.current.index * 2 + 1] = point.y;
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
    };

    return (
        <div>
            <Button className="actionbutton" onClick={startEditing}>
                {t('map.startEditing')}
            </Button>
            <Button className="actionbutton" onClick={finishEditing} disabled={!onEditing}>
                {t('map.finishEditing')}
            </Button>
        </div>
    );
}