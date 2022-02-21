import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from "@progress/kendo-react-buttons";
import { Window } from "@progress/kendo-react-dialogs";
import setOpenedWindow from "../../../../store/actionCreators/setOpenedWindow";
var _ = require("lodash");

export default function ContourEditing(props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { formId } = props;
    const sessionId = useSelector((state) => state.sessionId);
    const sessionManager = useSelector((state) => state.sessionManager);
    const formRef = useSelector((state) => state.formRefs[formId]);
    const control = useSelector((state) => state.formRefs[formId]?.current?.control());
    const mapData = useSelector((state) => state.formRefs[formId + "_mapData"]);
    const selectedObject = useSelector((state) => state.formRefs[formId + "_selectedObject"]);
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

    if (control) {
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
    }

    const startEditing = (event) => {
        const imageSize = 32;
        control.blocked = true;
        setOnEditing(true);
        let modifiedLayer = mapData?.layers?.find(l => l.elements.includes(selectedObject));
        dispatch(setOpenedWindow("editWindow", true, <Window
            className="mapEditWindow"
            maximizeButton="false"
            resizable={false}
            key="editWindow"
            title={t('map.editing', { sublayerName: modifiedLayer.name })}
            initialWidth={267}
            initialHeight={82}
            setOpened={(arg) =>
            dispatch(setOpenedWindow("editWindow", arg, null))
        }>
            <Button className="mapEditing" togglable={true}>
                <img width={imageSize} height={imageSize} src={window.location.pathname + 'images/map/vector_add.png'} alt={t('map.addPointToEnd')} title={t('map.addPointToEnd')} />
            </Button>
            <Button className="mapEditing" togglable={true}>
                <img width={imageSize} height={imageSize} src={window.location.pathname + 'images/map/draw_vertex.png'} alt={t('map.addPointBetweenPoints')} title={t('map.addPointBetweenPoints')} />
            </Button>
            <Button className="mapEditing" togglable={true}>
                <img width={imageSize} height={imageSize} src={window.location.pathname + 'images/map/transform_path.png'} alt={t('map.movePoint')} title={t('map.movePoint')} />
            </Button>
            <Button className="mapEditing" togglable={true}>
                <img width={imageSize} height={imageSize} src={window.location.pathname + 'images/map/vector_delete.png'} alt={t('map.deletePoint')} title={t('map.deletePoint')} />
            </Button>
            <Button className="mapEditingHorSpace" togglable={true}>
                <img width={imageSize} height={imageSize} src={window.location.pathname + 'images/map/hand.png'} alt={t('map.moveMap')} title={t('map.moveMap')} />
            </Button>
            <Button className="mapEditing" togglable={true}>
                <img width={imageSize} height={imageSize} src={window.location.pathname + 'images/map/accept.png'} alt={t('base.apply')} title={t('base.apply')} />
            </Button>
            <Button className="mapEditing" togglable={true}>
                <img width={imageSize} height={imageSize} src={window.location.pathname + 'images/map/cancel.png'} alt={t('base.cancel')} title={t('base.cancel')} />
            </Button>
        </Window>));
    };

    const finishEditing = (event) => {
        movedPoint.current = null;
        setOnEditing(false);
        control.blocked = false;
        let modifiedLayer = mapData?.layers?.find(l => l.elements.includes(selectedObject));
        if (modifiedLayer) {
            modifiedLayer.modified = true;
        }
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
            <Button className="actionbutton" onClick={startEditing} disabled={(!selectedObject) || (selectedObject.type !== 'polyline')}>
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