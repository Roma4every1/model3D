import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Window } from "@progress/kendo-react-dialogs";
import setOpenedWindow from "../../../../../store/actionCreators/setOpenedWindow";
import PolylinePropertiesWindow from "./PolylinePropertiesWindow";
import LabelPropertiesWindow from "./LabelPropertiesWindow";
import {
    IntlProvider,
    LocalizationProvider,
    loadMessages,
} from "@progress/kendo-react-intl";
import ruMessages from "../../../../locales/kendoUI/ru.json";
loadMessages(ruMessages, "ru-RU");

export default function PropertiesWindow(props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { formId, initialReadyForApply, onClosed } = props;
    const windows = useSelector((state) => state.windowData?.windows);
    const mapData = useSelector((state) => state.formRefs[formId + "_mapData"]);
    const selectedObject = useSelector((state) => state.formRefs[formId + "_selectedObject"]);
    const modifiedLayer = mapData?.layers?.find(l => l.elements.includes(selectedObject));
    const [windowSize, setWindowSize] = React.useState({ width: 300, height: 300 });
    const _windowRef = React.useRef(null);

    const close = (applied) => {
        let position;
        if (_windowRef.current) {
            position = { top: _windowRef.current.top, left: _windowRef.current.left }
        }
        dispatch(setOpenedWindow("propertiesWindow", false, null, position));
        if (onClosed) {
            onClosed(applied);
        }
    };

    const getWindowContentByType = (type) => {

        switch (type) {
            case 'polyline':
                return <PolylinePropertiesWindow formId={formId} close={close} setWindowSize={setWindowSize} initialReadyForApply={initialReadyForApply} />;

            case 'label':
                return <LabelPropertiesWindow formId={formId} close={close} setWindowSize={setWindowSize} initialReadyForApply={initialReadyForApply} />;

            default:
                if (windowSize?.width !== 200 || windowSize?.height !== 100) {
                    setWindowSize({ width: 200, height: 100 });
                }
                return <div>
                    {t('map.elementNotSelected')}
                </div>;
        }
    }

    return (
        <LocalizationProvider language='ru-RU'>
            <IntlProvider locale='ru'>
                <Window
                    ref={_windowRef}
                    className="propertiesWindow"
                    maximizeButton={false}
                    resizable={false}
                    title={t('map.propertiesEditing', { sublayerName: modifiedLayer?.name })}
                    onClose={() => close()}
                    initialLeft={windows?.propertiesWindow?.position?.left}
                    initialTop={windows?.propertiesWindow?.position?.top}
                    width={windowSize.width}
                    height={windowSize.height}
                >
                    {getWindowContentByType(selectedObject?.type)}
                </Window>
            </IntlProvider>
        </LocalizationProvider>
    );
}