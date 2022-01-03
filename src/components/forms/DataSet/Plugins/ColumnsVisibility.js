import React from 'react';
import { useTranslation } from 'react-i18next';
import { Popup } from "@progress/kendo-react-popup";
import { Button } from "@progress/kendo-react-buttons";
import ColumnsVisibilityContent from "./ColumnsVisibilityContent";

export default function ColumnSettings(props) {
    const { t } = useTranslation();
    const { formId } = props;
    const [popoverState, setPopoverState] = React.useState({
        anchorEl: null,
        open: false
    });

    const showColumnListClick = (event) => {
        setPopoverState({
            anchorEl: event.currentTarget,
            open: !popoverState.open,
        });
    };

    return (
        <div>
            <Button className="actionbutton" onClick={showColumnListClick}>
                {t('table.columnsVisibility')}
            </Button>
            <Popup className="popup"
                id={formId}
                show={popoverState.open}
                anchor={popoverState.anchorEl}
            >
                <ColumnsVisibilityContent formId={formId} />
            </Popup>
        </div>);
}