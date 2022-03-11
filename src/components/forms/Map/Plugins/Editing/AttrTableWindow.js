import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Label } from "@progress/kendo-react-labels";
import { Button } from "@progress/kendo-react-buttons";
import { Window } from "@progress/kendo-react-dialogs";
import { Input } from "@progress/kendo-react-inputs";
import setOpenedWindow from "../../../../../store/actionCreators/setOpenedWindow";
import setFormRefs from '../../../../../store/actionCreators/setFormRefs';
var _ = require("lodash");

export default function AttrTableWindow(props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { formId } = props;
    const windows = useSelector((state) => state.windowData?.windows);
    const mapData = useSelector((state) => state.formRefs[formId + "_mapData"]);
    const selectedObject = useSelector((state) => state.formRefs[formId + "_selectedObject"]);
    const modifiedLayer = mapData?.layers?.find(l => l.elements?.includes(selectedObject));
    const [readyForApply, setReadyForApply] = React.useState(false);
    const [attrTable, setAttrTable] = React.useState(null);
    const _windowRef = React.useRef(null);

    React.useEffect(() => {
        setAttrTable({ ...selectedObject?.attrTable })
    }, [selectedObject]);

    const close = () => {
        let position;
        if (_windowRef.current) {
            position = { top: _windowRef.current.top, left: _windowRef.current.left }
        }
        dispatch(setOpenedWindow("attrTableWindow", false, null, position));
    };

    const apply = () => {
        dispatch(setFormRefs(formId + "_modified", true));
        modifiedLayer.modified = true;
        selectedObject.attrTable = attrTable;
        close();
    };

    const cancel = () => {
        close();
    };

    return (
        <Window
            ref={_windowRef}
            title={t('map.attrTableEditing', { sublayerName: modifiedLayer?.name })}
            onClose={() => close()}
            initialLeft={windows?.attrTableWindow?.position?.left}
            initialTop={windows?.attrTableWindow?.position?.top}
            width={300}
            height={300}
        >
            <Button
                disabled={!readyForApply}
                onClick={() => apply()}
            >
                {t('base.apply')}
            </Button>
            <Button
                disabled={!readyForApply}
                onClick={() => cancel()}
            >
                {t('base.cancel')}
            </Button>
            {(_.toPairs(attrTable)).map(val => {
                return (
                    <div className='attrTableBlock'>
                        <Label className='attrTableLabel'>
                            {val[0]}
                        </Label>
                        <Input className='attrTableEditor'
                            value={val[1]}
                            name={val[0]}
                            onChange={(event) => {
                                setReadyForApply(true);
                                attrTable[val[0]] = event.value;
                                setAttrTable({ ...attrTable });
                            }}
                        />
                    </div>);
            })}
        </Window>
    );
}