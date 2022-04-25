import {
    Toolbar
} from "@progress/kendo-react-buttons";
import { Loader } from "@progress/kendo-react-indicators";
import React from 'react';
import { useSelector } from 'react-redux';
import ProgramButton from './ProgramButton';

export default function SqlProgramsList(props) {
    const sessionId = useSelector((state) => state.sessionId);
    const sessionManager = useSelector((state) => state.sessionManager);
    const { formId } = props;
    const [state, setState] = React.useState({
        programNames: [],
        loading: true
    });

    React.useEffect(() => {
        let ignore = false;
        if (formId) {
            async function fetchData() {
                const data = await sessionManager.fetchData(`programsList?sessionId=${sessionId}&formId=${formId}`);
                if (!ignore) {
                    setState({
                        programNames: data,
                        loading: false
                    });
                }
            }
            fetchData();
        }
        return () => { ignore = true; }
    }, [sessionId, formId, sessionManager]);

    return (
        <div>
            {state.loading
                ? <Loader size="small" type="infinite-spinner" /> 
                : <Toolbar style={{ padding: 1 }}>
                    {state.programNames.map(programName =>
                        <ProgramButton
                            key={programName.id}
                            formId={programName.id}
                            presentationId={formId}
                            programDisplayName={programName.displayName}
                            needCheckVisibility={programName.needCheckVisibility}
                            paramsForCheckVisibility={programName.paramsForCheckVisibility}
                        />
                    )}
                </Toolbar>
            }
        </div>
    );
}
