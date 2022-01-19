import React from 'react';
import { useTranslation } from 'react-i18next';
import { Popup } from "@progress/kendo-react-popup";
import { Button } from "@progress/kendo-react-buttons";
import SublayersTreeContent from "./SublayersTreeContent";

export default function SublayersTree(props) {
    const { t } = useTranslation();
    const { formId } = props;
    const [popoverState, setPopoverState] = React.useState({
        anchorEl: null,
        open: false
    });

    const showSublayersTreeClick = (event) => {
        setPopoverState({
            anchorEl: event.currentTarget,
            open: !popoverState.open,
        });
    };

    return (
        <div>
            <Button className="actionbutton" onClick={showSublayersTreeClick}>
                {t('map.sublayers')}
            </Button>
            <Popup className="popup"
                id={formId}
                show={popoverState.open}
                anchor={popoverState.anchorEl}
            >
                <SublayersTreeContent formId={formId} />
            </Popup>
        </div>);
}