import React from 'react';
import { useSelector } from 'react-redux';
import {
    Button
} from "@progress/kendo-react-buttons";
import ProgramParametersList from './ProgramParametersList';

export default function ProgramButton(props) {
    const sessionManager = useSelector((state) => state.sessionManager);
    const sessionId = useSelector((state) => state.sessionId);
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
        const data = await sessionManager.fetchData(`getAllNeedParametersForForm?sessionId=${sessionId}&formId=${formId}`);
        await sessionManager.paramsManager.getParameterValues(data, formId, true);
        handleOpen();
    }, [sessionManager, sessionId, formId]);

    return (
        <div>
            <Button className="actionbutton" onClick={fillReportParameters}>
                {programDisplayName}
            </Button>
            {open && (<ProgramParametersList formId={formId} handleClose={handleClose} />)}
        </div>
    );
}