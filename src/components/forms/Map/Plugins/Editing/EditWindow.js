import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from "@progress/kendo-react-buttons";
import { Window } from "@progress/kendo-react-dialogs";
import setOpenedWindow from "../../../../../store/actionCreators/setOpenedWindow";
import setFormRefs from '../../../../../store/actionCreators/setFormRefs';
var _ = require("lodash");

export default function EditWindow(props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { setOnEditing, formId, modeHandler, initialMode, onClosed } = props;
    const control = useSelector((state) => state.formRefs[formId]?.current?.control());
    const mapData = useSelector((state) => state.formRefs[formId + "_mapData"]);
    const windows = useSelector((state) => state.windowData?.windows);
    const selectedObject = useSelector((state) => state.formRefs[formId + "_selectedObject"]);
    const selectedObjectLength = useSelector((state) => state.formRefs[formId + "_selectedObjectLength"]);
    const modifiedLayer = mapData?.layers?.find(l => l.elements?.includes(selectedObject));
    const [oldObjectPath, setOldObjectPath] = React.useState(selectedObject ? [...selectedObject.arcs[0].path] : null);
    const imageSize = 32;
    const [mode, setMode] = React.useState(initialMode ?? "movePoint");
    const canApply = selectedObjectLength ? selectedObjectLength > 2 : selectedObjectLength !== 0;
    const _windowRef = React.useRef(null);

    React.useEffect(() => {
        modeHandler(mode);
        control.blocked = (mode !== "moveMap");
    }, [mode, control, modeHandler]);

    const closeEditing = (noSave) => {
        control.blocked = false;
        if (!noSave && selectedObject) {
            selectedObject.arcs[0].path = oldObjectPath;
        }
        setOnEditing(false);
        let position;
        if (_windowRef.current) {
            position = { top: _windowRef.current.top, left: _windowRef.current.left }
        }
        dispatch(setOpenedWindow("editWindow", false, null, position));
        if (onClosed) {
            onClosed(noSave);
        }
    };

    const cancelEditing = () => {
        closeEditing();
    };

    const acceptEditing = () => {
        var points = _.chunk(selectedObject.arcs[0].path, 2);
        let maxX = _.max(points.map(p => p[0]));
        let minX = _.min(points.map(p => p[0]));
        let maxY = _.max(points.map(p => p[1]));
        let minY = _.min(points.map(p => p[1]));
        selectedObject.bounds = {
            min: { x: minX, y: minY },
            max: { x: maxX, y: maxY },
        }
        closeEditing(true);
        setOldObjectPath([...selectedObject.arcs[0].path]);
        let modifiedLayer = mapData?.layers?.find(l => l.elements?.includes(selectedObject));
        if (modifiedLayer) {
            modifiedLayer.modified = true;
            dispatch(setFormRefs(formId + "_modified", true));
        }
    };

    return (
        <Window
            ref={_windowRef}
            className="mapEditWindow"
            maximizeButton={false}
            resizable={false}
            key="editWindow"
            title={t('map.editing', { sublayerName: modifiedLayer?.name })}
            onClose={() => closeEditing()}
            initialLeft={windows?.editWindow?.position?.left}
            initialTop={windows?.editWindow?.position?.top}
            initialWidth={267}
            initialHeight={82}
        >
            <Button className="mapEditing" togglable={true} selected={mode === "addPointToEnd"} onClick={() => setMode("addPointToEnd")}>
                <img width={imageSize} height={imageSize} src={window.location.pathname + 'images/map/vector_add.png'} alt={t('map.addPointToEnd')} title={t('map.addPointToEnd')} />
            </Button>
            <Button className="mapEditing" togglable={true} selected={mode === "addPointBetween"} onClick={() => setMode("addPointBetween")}>
                <img width={imageSize} height={imageSize} src={window.location.pathname + 'images/map/draw_vertex.png'} alt={t('map.addPointBetweenPoints')} title={t('map.addPointBetweenPoints')} />
            </Button>
            <Button className="mapEditing" togglable={true} selected={mode === "movePoint"} onClick={() => setMode("movePoint")}>
                <img width={imageSize} height={imageSize} src={window.location.pathname + 'images/map/transform_path.png'} alt={t('map.movePoint')} title={t('map.movePoint')} />
            </Button>
            <Button className="mapEditing" togglable={true} disabled={!canApply} selected={mode === "deletePoint"} onClick={() => setMode("deletePoint")}>
                <img width={imageSize} height={imageSize} src={window.location.pathname + 'images/map/vector_delete.png'} alt={t('map.deletePoint')} title={t('map.deletePoint')} />
            </Button>
            <Button className="mapEditingHorSpace" togglable={true} selected={mode === "moveMap"} onClick={() => setMode("moveMap")}>
                <img width={imageSize} height={imageSize} src={window.location.pathname + 'images/map/hand.png'} alt={t('map.moveMap')} title={t('map.moveMap')} />
            </Button>
            <Button className="mapEditing" onClick={acceptEditing} disabled={!canApply}>
                <img width={imageSize} height={imageSize} src={window.location.pathname + 'images/map/accept.png'} alt={t('base.apply')} title={t('base.apply')} />
            </Button>
            <Button className="mapEditing" onClick={cancelEditing}>
                <img width={imageSize} height={imageSize} src={window.location.pathname + 'images/map/cancel.png'} alt={t('base.cancel')} title={t('base.cancel')} />
            </Button>
        </Window>);
}