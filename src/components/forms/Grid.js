import React from 'react';
import Form from '../Form';
import Container from './Grid/Container';
var utils = require("../../utils")

export default function Grid(props) {
    const { sessionId, formId, formData, ...other } = props;
    const [formsData, setFormsData] = React.useState([]);
    React.useEffect(() => {
        if (formId) {
            let ignore = false;

            async function fetchData() {
                const response = await utils.webFetch(`getChildrenForms?sessionId=${sessionId}&formId=${formId}`);
                const data = await response.json();
                if (!ignore) {
                    setFormsData(data);
                }
            }
            fetchData();
            return () => { ignore = true; }
        }
    }, [sessionId, formId]);

    return (
        <Container>
            {formsData.map(formData =>
                (formData.opened) && <Form
                    key={formData.id}
                    sessionId={sessionId}
                    formData={formData}
                    formId={formId}
                    {...other}
                />)}
        </Container>);
}
