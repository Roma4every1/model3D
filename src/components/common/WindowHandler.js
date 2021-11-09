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

    const handleClose = () => {
        dispatch(closeWindow());
    };

    const windowData = useSelector((state) => state.windowData);

    var typeIcon = "k-i-x-circle";

    if (windowData?.opened) {
        switch (windowData.type) {
            case 'error':
                typeIcon = "k-i-x-circle";
                break;
            case 'warning':
                typeIcon = "k-i-warning";
                break;
            case 'info':
                typeIcon = "k-i-info";
                break;
            default:
                typeIcon = "k-i-x-circle";
                break;
        }
    }

    var classIcon = `k-icon ${typeIcon} k-icon-32`;

    return (
        <div>
            {windowData?.opened && <Dialog title={windowData.header} onClose={handleClose}>
                <div className="grid-layout-container">
                    <GridLayout
                        gap={{
                            rows: 1,
                            cols: 2,
                        }}
                    >
                        <GridLayoutItem row={1} col={1}>
                            <div style={{ display: "table-cell" }} className={classIcon} />
                        </GridLayoutItem>
                        <GridLayoutItem row={1} col={2}>
                            <div style={{ textAlign: "center" }}>
                                {windowData.text}
                            </div>
                        </GridLayoutItem>
                    </GridLayout>
                </div>
                <DialogActionsBar>
                    <Button onClick={handleClose}>
                        {t('base.ok')}
                    </Button>
                </DialogActionsBar>
            </Dialog>}
        </div>);
}