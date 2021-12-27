import React from 'react';
import { useSelector } from 'react-redux';
import {
    Button
} from "@progress/kendo-react-buttons";
import { Loader } from "@progress/kendo-react-indicators";
import ProgramParametersList from './ProgramParametersList';

export default function ProgramButton(props) {
    const sessionManager = useSelector((state) => state.sessionManager);
    const sessionId = useSelector((state) => state.sessionId);
    const { programDisplayName, formId, presentationId } = props;
    const [reportProcessing, handleProcessing] = React.useState(false);
    const [open, setOpen] = React.useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const fillReportParameters = React.useCallback(async () => {
        await sessionManager.paramsManager.loadFormParameters(formId, true);
        const data = await sessionManager.fetchData(`getAllNeedParametersForForm?sessionId=${sessionId}&formId=${formId}`);
        await sessionManager.paramsManager.getParameterValues(data, formId, true);
        handleOpen();
    }, [sessionManager, sessionId, formId]);

    return (
        <div>
            <Button className="actionbutton" onClick={fillReportParameters}>
                {programDisplayName}
                {reportProcessing && <Loader size="small" type="infinite-spinner" />}
            </Button>
            {open && (<ProgramParametersList handleProcessing={handleProcessing} formId={formId} presentationId={presentationId} handleClose={handleClose} programDisplayName={programDisplayName} />)}
        </div>
    );
}