import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Form from '../Form';
import SqlProgramsList from '../SqlProgramsList';
import Layout from './Dock/Layout';

export default function Dock(props) {
    const { t } = useTranslation();
    const sessionManager = useSelector((state) => state.sessionManager);
    const { formData } = props;

    React.useEffect(() => {
        sessionManager.getChildForms(formData.id);
    }, [formData, sessionManager]);
    const activeChild = useSelector((state) => state.childForms[formData.id]?.children.find(p => p.id === (formData.id + ',' + state.childForms[formData.id].openedChildren[0])));

    const activeForm = <Form
        key={activeChild?.id}
        formData={activeChild}
    />;

    const sqlProgramsList = <SqlProgramsList
        formId={activeChild?.id}
    />;

    return (
        <div>
            {!activeForm
                ? <p><em>{t('base.loading')}</em></p>
                : <Layout
                    sqlProgramsList={sqlProgramsList}
                    formId={formData.id}
                    form={activeForm}
                    activeChild={activeChild}
                >
                </Layout>
            }
        </div>);
}
