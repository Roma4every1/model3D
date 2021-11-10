import * as React from "react";
import { useSelector } from 'react-redux';
import StringComboEditorView from './TableRowComboEditorView';

export default function StringComboEditor(props) {
    const sessionManager = useSelector((state) => state.sessionManager);
    const { id, formId, formIdToLoad, ...other } = props;

    const [externalChannelName, setExternalChannelName] = React.useState('');

    React.useEffect(() => {
        let ignore = false;

        async function getExternalChannelName() {
            const resultExternalChannelName = await sessionManager.paramsManager.loadNeededChannelForParam(id, formIdToLoad ?? formId);
            if (!ignore) {
                setExternalChannelName(resultExternalChannelName);
            }
        }
        getExternalChannelName();
        return () => { ignore = true; }
    }, [id, formIdToLoad, formId, sessionManager]);

    return (
        <StringComboEditorView id={id} externalChannelName={externalChannelName} {...other} />
    );
}
