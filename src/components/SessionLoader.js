import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import WindowHandler from './common/WindowHandler';
import Form from './forms/Form';

export default function SessionLoader() {
    const { t } = useTranslation();
    const sessionId = useSelector((state) => state.sessionId);
    const sessionManager = useSelector((state) => state.sessionManager);
    const sessionLoading = useSelector((state) => state.sessionManager.getSessionLoading());

    const [formData, setFormData] = React.useState();

    React.useEffect(() => {
        let ignore = false;

        async function getFormData() {
            if (sessionId) {
                const data = await sessionManager.fetchData(`getRootForm?sessionId=${sessionId}`);
                if (!ignore) {
                    setFormData(data);
                }
            }
        }
        getFormData();
        return () => { ignore = true; }
    }, [sessionId, sessionManager]);

    return (
        <div>
            <WindowHandler />
            {(!formData) || (sessionLoading)
                ? <p><em>{t('session.loading')}</em></p>
                : <div>
                    <Form
                        key="root"
                        formData={formData}
                    />
                </div>
            }
        </div>
    );
}
