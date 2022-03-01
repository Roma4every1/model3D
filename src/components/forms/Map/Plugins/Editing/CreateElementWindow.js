import React from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Label } from "@progress/kendo-react-labels";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { RadioButton } from "@progress/kendo-react-inputs";
import setOpenedWindow from "../../../../../store/actionCreators/setOpenedWindow";

export default function CreateElementWindow(props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { modifiedLayerName, setResult } = props;
    const [selectedValue, setSelectedValue] = React.useState("polyline");

    const close = () => {
        dispatch(setOpenedWindow("createElementWindow", false, null));
    };

    const apply = () => {
        setResult(selectedValue);
        close();
    };

    const cancel = () => {
        close();
    };

    const handleChange = React.useCallback(
        (e) => {
            setSelectedValue(e.value);
        },
        [setSelectedValue]
    );

    return (
        <Dialog
            title={t('map.createElement', { sublayerName: modifiedLayerName })}
            onClose={() => close()}
            width={290}
            height={190}
        >
                        <Label>
                {t('map.chooseType')}
            </Label>
            <br />
            <RadioButton
                name="group1"
                value="polyline"
                checked={selectedValue === "polyline"}
                label={t('map.polyline')}
                onChange={handleChange}
            />
            <br />
            <RadioButton
                name="group1"
                value="label"
                checked={selectedValue === "label"}
                label={t('map.label')}
                onChange={handleChange}
            />
            <br />
            <br />
            <Button onClick={() => apply()}>
                {t('base.continue')}
            </Button>
            <Button onClick={() => cancel()}>
                {t('base.cancel')}
            </Button>
        </Dialog>
    );
}