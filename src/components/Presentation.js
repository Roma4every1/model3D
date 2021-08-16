import React from 'react';
import Form from './Form';
import { FormsContainer } from './FormsContainer';
var utils = require("../utils")

export default function Presentation(props) {
    const { sessionId, presentationId, ...other } = props;
    const [formsData, setFormsData] = React.useState([]);
    React.useEffect(() => {
        if (presentationId) {
            loadForms(sessionId, presentationId);
        }
    }, [sessionId, presentationId]);

    const loadForms = async (sessionId, presentationId) => {
        const response = await utils.webFetch(`presentationForms?sessionId=${sessionId}&presentationId=${presentationId}`);
        const data = await response.json();
        setFormsData(data);
    }

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
