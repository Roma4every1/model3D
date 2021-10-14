import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Dialog } from "@progress/kendo-react-dialogs";
import {
    Button
} from "@progress/kendo-react-buttons";
import ProgramParametersList from './ProgramParametersList';
var utils = require("../utils");

export default function ProgramButton(props) {
    const sessionManager = useSelector((state) => state.sessionManager);
    const sessionId = useSelector((state) => state.sessionId);
    const { t } = useTranslation();
    const { programDisplayName, formId } = props;
    const [open, setOpen] = React.useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const fillReportParameters = React.useCallback(async () => {
        await sessionManager.paramsManager.loadFormParameters(formId, true);
        const allNeededParams = await utils.webFetch(`getAllNeedParametersList?sessionId=${sessionId}&reportguid=${formId}`);
        const allNeededParamsJSON = await allNeededParams.json();
        await sessionManager.paramsManager.getParameterValues(allNeededParamsJSON, formId, true);
        handleOpen();
    }, [sessionManager, sessionId, formId]);

    return (
        <div>
            <Button className="programmbutton" onClick={fillReportParameters}>
                {programDisplayName}
            </Button>
            {open && (
                <Dialog title={t('report.params')} onClose={handleClose} initialHeight={350}>
                    <ProgramParametersList formId={formId} handleClose={handleClose} />
                </Dialog>
            )}
        </div>
    );
}