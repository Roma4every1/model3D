import {
    Toolbar
} from "@progress/kendo-react-buttons";
import React from 'react';
import { useSelector } from 'react-redux';
import ProgramButton from './ProgramButton';
import { useTranslation } from 'react-i18next';

export default function SqlProgramsList(props) {
    const { t } = useTranslation();
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
                ? <p><em>{t('base.loading')}</em></p>
                : <Toolbar style={{ padding: 1 }}>
                    {state.programNames.map(programName =>
                        <ProgramButton
                            key={programName.id}
                            formId={programName.id}
                            programDisplayName={programName.displayName}
                        />
                    )}
                </Toolbar>
            }
        </div>
    );
}
