import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Button } from "@progress/kendo-react-buttons";
import { Loader } from "@progress/kendo-react-indicators";
import ProgramParametersList from "./ProgramParametersList";


export default function ProgramButton(props) {
  const { programDisplayName, formID, presentationId, needCheckVisibility, paramsForCheckVisibility } = props;

  const sessionManager = useSelector((state) => state.sessionManager);
  const sessionId = useSelector((state) => state.sessionId);
  const paramValues = useSelector((state) => paramsForCheckVisibility ? state.sessionManager.paramsManager.getParameterValues(paramsForCheckVisibility, formID, false) : null);

  const [reportProcessing, handleProcessing] = useState(false);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ignore = false;
    if (!needCheckVisibility) {
        setVisible(true);
    } else {
      async function fetchData() {
        const jsonToSendString = JSON.stringify({sessionId, reportId: formID, paramValues});
        const data = await sessionManager.fetchData(
          'programVisibility',
          {method: 'POST', body: jsonToSendString}
        );

        if (!ignore) setVisible(data);
      }
      fetchData();
    }
    return () => { ignore = true; }
  }, [sessionManager, sessionId, formID, paramValues, needCheckVisibility]);

  const handleOpen = () => {setOpen(true)};
  const handleClose = () => {setOpen(false)};

  const fillReportParameters = useCallback(async () => {
    await sessionManager.paramsManager.loadFormParameters(formID, true);
    const data = await sessionManager.fetchData(`getAllNeedParametersForForm?sessionId=${sessionId}&formId=${formID}`);
    await sessionManager.paramsManager.getParameterValues(data, formID, true);
    handleOpen();
  }, [sessionManager, sessionId, formID]);

  return (
    <div>
      {visible &&
        <Button className={'actionbutton'} onClick={fillReportParameters}>
          {programDisplayName}
          {reportProcessing && <Loader size={'small'} type={'infinite-spinner'} />}
        </Button>
      }
      {open &&
        <ProgramParametersList
          handleProcessing={handleProcessing}
          formId={formID} presentationId={presentationId}
          handleClose={handleClose} programDisplayName={programDisplayName}
        />
      }
    </div>
  );
}
