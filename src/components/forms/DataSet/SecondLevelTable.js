import * as React from "react";
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Window } from "@progress/kendo-react-dialogs";
import Form from "../Form";
var utils = require("../../../utils");

export const SecondLevelTable = (props) => {
    const { t } = useTranslation();
    const [staticFormData] = React.useState({
        id: props.secondLevelFormId,
        type: "dataSet",
        displayName: t('table.linkedTable')
    });

    const handleClose = () => {
        props.setOpened(false);
    };

    var formData = useSelector((state) => (state.childForms[utils.getParentFormId(props.secondLevelFormId)]?.children.find(p => p.id === props.secondLevelFormId)) ?? staticFormData);

    return (
        <Window key={props.keyProp} title={formData.displayName} onClose={handleClose}>
            <Form formData={formData} data={{ activeChannels: [props.channelName] }} />
        </Window>
    );
};