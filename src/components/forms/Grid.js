import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Form from '../Form';
import Container from './Grid/Container';

export default function Grid(props) {
    const { t } = useTranslation();
    const sessionManager = useSelector((state) => state.sessionManager);
    const { formData } = props;

    React.useEffect(() => {
        sessionManager.getChildForms(formData.id);
    }, [formData, sessionManager]);

    const formsData = useSelector((state) => state.childForms[formData.id]?.children);
    const openedData = useSelector((state) => state.childForms[formData.id]?.openedChildren);

    const openedForms = openedData?.map(od => formsData?.find(p => p.id === (formData.id + ',' + od)));

    return (
        <div>
            {!openedForms
                ? <p><em>{t('base.loading')}</em></p>
                : <Container>
                    {openedForms.map(formData =>
                        <Form
                            key={formData.id}
                            formData={formData}
                        />)}
                </Container>
            }
        </div>);
}
