import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Form from '../Form';
import SqlProgramsList from '../SqlProgramsList';
import Layout from './Dock/Layout';
var utils = require("../../utils")

export default function Dock(props) {
    const { t } = useTranslation();
    const sessionId = useSelector((state) => state.sessionId);
    const { formData } = props;

    const [modifiedTables, setModifiedTables] = React.useState([]);
    const [state, setState] = React.useState({
        childsJSON: [],
        loading: true
    });
    const [activeChild, setActiveChild] = React.useState('');

    const setActiveChildById = (id) => {
        var child = state.childsJSON.find(p => p.id === id);
        if (child) {
            setActiveChild(child);
        }
    }

    React.useEffect(() => {
        let ignore = false;
        if (sessionId) {
            async function fetchData() {
                const response = await utils.webFetch(`getChildrenForms?sessionId=${sessionId}`);
                const data = await response.json();
                if (!ignore) {
                    setState({
                        childsJSON: data,
                        loading: false
                    });
                    var openedChild = data.find(p => p.opened);
                    if (openedChild) {
                        setActiveChild(openedChild)
                    }
                }
            }
            fetchData();
        }
        return () => { ignore = true; }
    }, [sessionId]);

    const activeForm = <Form
        key={activeChild.id}
        formData={activeChild}
    />;

    return (
        <div>
            {state.loading
                ? <p><em>{t('base.loading')}</em></p>
                : <div>
                    <div style={{ height: 30 }}>
                        <SqlProgramsList
                            sessionId={state.sessionId}
                            formId={activeChild.id}
                            tablesModified={(target) => {
                                setModifiedTables(target);
                            }}
                        />
                    </div>
                    <div>
                        <Layout
                            formId={formData.id}
                            form={activeForm}
                            activeChild={activeChild}
                            setActiveChildById={setActiveChildById}
                            modifiedTables={modifiedTables}>
                        </Layout>
                    </div>
                </div>
            }
        </div>);
}
