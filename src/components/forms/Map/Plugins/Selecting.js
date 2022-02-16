import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Popup } from "@progress/kendo-react-popup";
import { Button } from "@progress/kendo-react-buttons";

export default function Selecting(props) {
    const { t } = useTranslation();
    const { formId } = props;
    const [pressed, setPressed] = React.useState(false);
    const [mode, setMode] = React.useState("sublayer");

    const setNoneMode = () => {
        setMode("none");
    };

    const setSublayerMode = () => {
        setMode("sublayer");
    };

    const setButtonPressed = () => {
        setPressed(!pressed);
    };

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
            <Button togglable={true} className='mapPickButton' onClick={setButtonPressed} title={t('map.pick')}>
                <span className="k-icon k-i-button" />
            </Button>
            <Button className="mapPickPopupButton" onClick={showColumnListClick}>
                <span className="k-icon k-i-arrow-60-down" />
            </Button>
            <Popup className="popup"
                id={formId}
                show={popoverState.open}
                anchor={popoverState.anchorEl}
            >
                <div style={{ width: 125 }} >
                    <div onClick={() => setMode("sublayer")} className="mapPickPopupItem" >
                        <div className="mapPickPopupItemCheck" >
                            {mode === "sublayer" ? <span className="k-icon k-i-check" /> : <span className="k-icon" />}
                        </div>
                        <div className="mapPickPopupItemLabel">
                            {t('map.sublayer')}
                        </div>
                    </div>
                    <div onClick={() => setMode("none")} className="mapPickPopupItem" >
                        <div className="mapPickPopupItemCheck" >
                            {mode === "none" ? <span className="k-icon k-i-check" /> : <span className="k-icon" />}
                        </div>
                        <div className="mapPickPopupItemLabel">
                            {t('base.none')}
                        </div>
                    </div>
                </div>
            </Popup>
        </div >);
}