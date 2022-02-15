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
    const { programDisplayName, formId, presentationId, needCheckVisibility, paramsForCheckVisibility } = props;
    const paramValues = useSelector((state) => paramsForCheckVisibility ? state.sessionManager.paramsManager.getParameterValues(paramsForCheckVisibility, formId, false) : null);
    const [reportProcessing, handleProcessing] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const [visible, setVisible] = React.useState(false);

    React.useEffect(() => {
        let ignore = false;
        if (!needCheckVisibility) {
            setVisible(true);
        }
        else {
            async function fetchData() {
                var jsonToSend = { sessionId: sessionId, reportId: formId, paramValues: paramValues };
                const jsonToSendString = JSON.stringify(jsonToSend);
                var data = await sessionManager.fetchData(`programVisibility`,
                    {
                        method: 'POST',
                        body: jsonToSendString
                    });
                if (!ignore) {
                    setVisible(data);
                }
            }
            fetchData();
        }
        return () => { ignore = true; }
    }, [sessionManager, sessionId, formId, paramValues, needCheckVisibility]);

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
            {visible && <Button className="actionbutton" onClick={fillReportParameters}>
                {programDisplayName}
                {reportProcessing && <Loader size="small" type="infinite-spinner" />}
            </Button>}
            {open && (<ProgramParametersList handleProcessing={handleProcessing} formId={formId} presentationId={presentationId} handleClose={handleClose} programDisplayName={programDisplayName} />)}
        </div>
    );
}