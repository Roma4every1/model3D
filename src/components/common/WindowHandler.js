import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
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

    return (
        <div>
            {windowData?.opened && <Dialog title={t('menucommands.about')} onClose={handleClose}>
                <p
                    style={{
                        margin: "25px",
                        textAlign: "center",
                    }}
                >
                    {windowData.text}
                </p>
                <DialogActionsBar>
                    <Button onClick={handleClose}>
                        {t('base.ok')}
                    </Button>
                </DialogActionsBar>
            </Dialog>}
        </div>);
}