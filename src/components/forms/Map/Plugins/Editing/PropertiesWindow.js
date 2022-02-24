import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Window } from "@progress/kendo-react-dialogs";
import setOpenedWindow from "../../../../../store/actionCreators/setOpenedWindow";
import PolylinePropertiesWindow from "./PolylinePropertiesWindow";
import LabelPropertiesWindow from "./LabelPropertiesWindow";

export default function PropertiesWindow(props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { formId } = props;
    const mapData = useSelector((state) => state.formRefs[formId + "_mapData"]);
    const selectedObject = useSelector((state) => state.formRefs[formId + "_selectedObject"]);
    const modifiedLayer = mapData?.layers?.find(l => l.elements.includes(selectedObject));
    const [windowSize, setWindowSize] = React.useState({ width: 300, height: 300 });

    const close = () => {
        dispatch(setOpenedWindow("propertiesWindow", false, null));
    };

    const getWindowContentByType = (type) => {

        switch (type) {
            case 'polyline':
                return <PolylinePropertiesWindow formId={formId} close={close} setWindowSize={setWindowSize} />;

            case 'label':
                return <LabelPropertiesWindow formId={formId} close={close} setWindowSize={setWindowSize} />;

            default:
                return <div />;
        }
    }

    return (
        <Window
            className="propertiesWindow"
            maximizeButton={false}
            resizable={false}
            title={t('map.propertiesEditing', { sublayerName: modifiedLayer?.name })}
            onClose={() => close()}
            width={windowSize.width}
            height={windowSize.height}
        >
            { getWindowContentByType(selectedObject?.type)}
        </Window>
    );
}