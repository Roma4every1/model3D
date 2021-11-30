import * as React from "react";
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Window } from "@progress/kendo-react-dialogs";
import Form from "../../Form";
var utils = require("../../../../utils");

export const ButtonCell = (props) => {
    const { t } = useTranslation();
    const [opened, setOpened] = React.useState(false);

    const openNestedForm = async () => {
        setOpened(true);
    };

    const handleClose = () => {
        setOpened(false);
    };

    var formData = useSelector((state) => state.childForms[utils.getParentFormId(props.secondLevelFormId)]?.children.find(p => p.id === props.secondLevelFormId));
    if (!formData) {
        formData = {
            id: props.secondLevelFormId,
            type: "dataSet",
            displayName: t('table.linkedTable')
        };
    }

    return (
        <div>
            {opened && <Window title={formData.displayName} onClose={handleClose} initialHeight={350}>
                <Form formData={formData} channels={[props.channelName]} />
            </Window>}
            <div className="buttonCell">
                <span className="k-icon k-i-window font-10" alt={t('table.showDetailInfo')} title={t('table.showDetailInfo')} onClick={openNestedForm} />
            </div>
        </div>
    );
};