import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { GridLayout, GridLayoutItem } from "@progress/kendo-react-layout";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Button } from "@progress/kendo-react-buttons";
import closeWindow from "../../store/actionCreators/closeWindow";

export default function WindowHandler() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [stackTraceVisible, setStackTraceVisible] = React.useState(false);

    const handleStackTrace = () => {
        setStackTraceVisible(!stackTraceVisible);
    };

    const handleClose = () => {
        dispatch(closeWindow());
    };

    const windowData = useSelector((state) => state.windowData);

    var typeIcon = "k-i-x-circle";
    var classbutton = '';

    if (windowData?.opened) {
        switch (windowData.type) {
            case 'error':
                typeIcon = "k-i-x-circle";
                classbutton = "k-icon-red";
                break;
            case 'warning':
                typeIcon = "k-i-warning";
                classbutton = "k-icon-red";
                break;
            case 'info':
                typeIcon = "k-i-info";
                classbutton = "k-icon-blue";
                break;
            default:
                typeIcon = "k-i-x-circle";
                classbutton = "k-icon-red";
                break;
        }
    }

    var classIcon = `k-icon ${typeIcon} k-icon-32`;

    return (
        <div>
            {windowData?.opened && <Dialog title={windowData.header} onClose={handleClose}>
                <div className={"grid-layout-container-" + stackTraceVisible} >
                    <GridLayout
                        gap={{
                            rows: 2,
                            cols: 2,
                        }}
                    >
                        <GridLayoutItem row={1} col={1} rowSpan={2}>
                            <button className={"margin-5 k-button k-button-clear " + classbutton} onClick={handleStackTrace}>
                                <span className={classIcon} />
                            </button>
                        </GridLayoutItem>
                        <GridLayoutItem row={1} col={2}>
                            <div className="margin-5 textAlign-left">
                                {windowData.text}
                            </div>
                        </GridLayoutItem>
                        {stackTraceVisible && <GridLayoutItem row={2} col={2}>
                            <div className="textAlign-left">
                                {windowData.stackTrace}
                            </div>
                        </GridLayoutItem>}
                    </GridLayout>
                </div>
                <DialogActionsBar>
                    <div className="windowButtonContainer">
                        <Button className="windowButton" onClick={handleClose}>
                            {t('base.ok')}
                        </Button>
                    </div>
                </DialogActionsBar>
            </Dialog>}
        </div>);
}