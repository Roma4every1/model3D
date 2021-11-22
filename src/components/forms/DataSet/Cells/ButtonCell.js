import * as React from "react";
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from "@progress/kendo-react-buttons";
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

    const formData = useSelector((state) => state.childForms[utils.getParentFormId(props.secondLevelFormId)]?.children.find(p => p.id === props.secondLevelFormId));

    return (
        <div>
            {opened && <Window title={formData.displayName} onClose={handleClose} initialHeight={350}>
                <Form formData={formData} channels={[props.channelName]}/>
            </Window>}
            <div className="buttonCell">
                <Button className="k-button k-button-clear colored-gray" onClick={openNestedForm}>
                    {/*                <span className="k-icon k-i-group-section" />*/}
                    <img src={process.env.PUBLIC_URL + '/images/tableDetails.png'} alt={t('table.showDetailInfo')} title={t('table.showDetailInfo')} />
                </Button>
            </div>
        </div>
    );
};