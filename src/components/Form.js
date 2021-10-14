import React, { Suspense } from 'react';
import { useSelector } from 'react-redux';
import { ErrorBoundary } from './ErrorBoundary';

export default function Form(props) {
    const sessionManager = useSelector((state) => state.sessionManager);
    const { sessionId, formData, ...other } = props;

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    React.useEffect(() => {
        async function fetchData() {
            await sessionManager.paramsManager.loadFormParameters(formData.id, false);
        }
        fetchData();
    }, [sessionId, formData, sessionManager]);

    const FormByType = React.lazy(() => import('./forms/' + capitalizeFirstLetter(formData.type)));

    return (
        <div>
            <ErrorBoundary>
                <Suspense fallback={<div>Загрузка...</div>}>
                    <FormByType
                        sessionId={sessionId}
                        formData={formData}
                        {...other}
                    />
                </Suspense>
            </ErrorBoundary>
        </div>
    );
}
