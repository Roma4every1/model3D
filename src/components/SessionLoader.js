import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import WindowHandler from './common/WindowHandler';
import Form from './forms/Form';


export default function SessionLoader() {
  const { t } = useTranslation();
  const sessionId = useSelector((state) => state.sessionId);
  const sessionManager = useSelector((state) => state.sessionManager);

  const [formData, setFormData] = React.useState();

  React.useEffect(() => {
    let ignore = false;

    async function getFormData() {
      if (sessionId && !ignore) {
        const data = await sessionManager.fetchData(`getRootForm?sessionId=${sessionId}`);
        setFormData(data);
      }
    }
    getFormData();

    return () => { ignore = true; }
  }, [sessionId, sessionManager]);

  return (
    <>
      <WindowHandler />
        {(!formData) || (sessionManager.getSessionLoading())
          ? <p><em>{t('session.loading')}</em></p>
          : <Form key="root" formData={formData}/>
        }
    </>
  );
}
