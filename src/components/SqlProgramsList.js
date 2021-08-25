import {
    Toolbar
} from "@progress/kendo-react-buttons";
import React from 'react';
import ProgramParametersList from './ProgramParametersList';
import { useTranslation } from 'react-i18next';
var utils = require("../utils")

export default function SqlProgramsList(props) {
    const { t } = useTranslation();
    const { sessionId, presentationId, ...other } = props;
    const [state, setState] = React.useState({
        programNames: [],
        loading: true
    });

    React.useEffect(() => {
        let ignore = false;
        if (presentationId) {
            async function fetchData() {
                const response = await utils.webFetch(`programsList?sessionId=${sessionId}&presentationId=${presentationId}`);
                const data = await response.json();
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
    }, [sessionId, presentationId]);

    return (
        <div>
            {state.loading
                ? <p><em>{t('base.loading')}</em></p>
                : <Toolbar style={{padding: 1 }}>
                    {state.programNames.map(programName =>
                        <ProgramParametersList
                            key={programName.id}
                            sessionId={sessionId}
                            programId={programName.id}
                            programDisplayName={programName.displayName}
                            open="true"
                            {...other}
                        />
                    )}
                </Toolbar>
            }
        </div>
    );
}
