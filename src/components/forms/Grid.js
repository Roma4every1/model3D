import React from 'react';
import { useSelector } from 'react-redux';
import Form from '../Form';
import Container from './Grid/Container';
var utils = require("../../utils")

export default function Grid(props) {
    const sessionId = useSelector((state) => state.sessionId);
    const { formData } = props;
    const [formsData, setFormsData] = React.useState([]);

    React.useEffect(() => {
        if (formData.id) {
            let ignore = false;

            async function fetchData() {
                const response = await utils.webFetch(`getChildrenForms?sessionId=${sessionId}&formId=${formData.id}`);
                const data = await response.json();
                if (!ignore) {
                    setFormsData(data);
                }
            }
            fetchData();
            return () => { ignore = true; }
        }
    }, [sessionId, formData]);

    return (
        <Container>
            {formsData.map(formData =>
                (formData.opened) && <Form
                    key={formData.id}
                    formData={formData}
                />)}
        </Container>);
}
