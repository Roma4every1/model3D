import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Form from './Form';
var utils = require("../utils")

export default function SessionLoader() {
    const { t } = useTranslation();
    const sessionId = useSelector((state) => state.sessionId);
    const sessionLoading = useSelector((state) => state.sessionManager.getSessionLoading());

    const [formData, setFormData] = React.useState();

    React.useEffect(() => {
        let ignore = false;

        async function getFormData() {
            if (sessionId) {
                const serverFormData = await utils.webFetch(`getRootForm?sessionId=${sessionId}`);
                const data = await serverFormData.json();
                if (!ignore) {
                    setFormData(data);
                }
            }
        }
        getFormData();
        return () => { ignore = true; }
    }, [sessionId]);

    return (
            <div>
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
