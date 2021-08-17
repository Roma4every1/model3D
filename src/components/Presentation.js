import React from 'react';
import Form from './Form';
import { FormsContainer } from './FormsContainer';
var utils = require("../utils")

export default function Presentation(props) {
    const { sessionId, presentationId, ...other } = props;
    const [formsData, setFormsData] = React.useState([]);
    React.useEffect(() => {
        if (presentationId) {
            let ignore = false;

            async function fetchData() {
                const response = await utils.webFetch(`presentationForms?sessionId=${sessionId}&presentationId=${presentationId}`);
                const data = await response.json();
                if (!ignore) {
                    setFormsData(data);
                }
            }
            fetchData();
            return () => { ignore = true; }
        }
    }, [sessionId, presentationId]);

    return (
        <FormsContainer>
            {formsData.map(formData =>
                <Form
                    key={formData.id}
                    sessionId={sessionId}
                    formData={formData}
                    {...other}
                />
            )}
        </FormsContainer>);
}
