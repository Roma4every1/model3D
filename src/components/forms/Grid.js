import React from 'react';
import Form from '../Form';
import Container from './Grid/Container';
var utils = require("../../utils")

export default function Grid(props) {
    const { sessionId, presentationId, formData, ...other } = props;
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
        <Container>
            {formsData.map(formData =>
                (formData.opened) && <Form
                    key={formData.id}
                    sessionId={sessionId}
                    formData={formData}
                    presentationId={presentationId}
                    {...other}
                />)}
        </Container>);
}
