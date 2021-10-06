import React, { Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

export default function Form(props) {
    const { sessionId, formData, ...other } = props;

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

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
