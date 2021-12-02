import * as React from "react";
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Window } from "@progress/kendo-react-dialogs";
import Form from "../../Form";
var utils = require("../../../../utils");

export const ButtonCell = (props) => {
    const { t } = useTranslation();
    const [opened, setOpened] = React.useState(false);
    const [staticFormData] = React.useState({
        id: props.secondLevelFormId,
        type: "dataSet",
        displayName: t('table.linkedTable')
    });

    const openNestedForm = async () => {
        setOpened(true);
    };

    const handleClose = () => {
        setOpened(false);
    };

    var formData = useSelector((state) => (state.childForms[utils.getParentFormId(props.secondLevelFormId)]?.children.find(p => p.id === props.secondLevelFormId)) ?? staticFormData);

    return (
        <div>
            {opened && <Window title={formData.displayName} onClose={handleClose} initialHeight={350}>
                <Form formData={formData} data={{ activeChannels: [props.channelName] }} />
            </Window>}
            {props.data}
            <div className="buttonCell">
                <span className="k-icon k-i-window font-10" alt={t('table.showDetailInfo')} title={t('table.showDetailInfo')} onClick={openNestedForm} />
            </div>
        </div>
    );
};