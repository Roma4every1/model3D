import React, { Suspense } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ErrorBoundary from './ErrorBoundary';

export default function Form(props) {
    const { t } = useTranslation();
    const sessionManager = useSelector((state) => state.sessionManager);
    const { formData } = props;
    const [activeChannels, setActiveChannels] = React.useState([]);
    const [activeParams, setActiveParams] = React.useState([]);

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    React.useEffect(() => {
        let ignore = false;
        async function fetchParams() {
            const params = await sessionManager.paramsManager.loadFormParameters(formData.id, false);
            if (!ignore) {
                setActiveParams(params);
            }
        }
        async function fetchChannels() {
            const channels = await sessionManager.channelsManager.loadFormChannelsList(formData.id);
            if (!ignore) {
                setActiveChannels(channels);
            }
        }
        fetchParams();
        fetchChannels();
        return () => {
            ignore = true;
        };
    }, [formData, sessionManager]);

    const FormByType = React.lazy(() => import('./forms/' + capitalizeFirstLetter(formData.type)));

    return (
        <div>
            <ErrorBoundary>
                <Suspense fallback={<p><em>{t('base.loading')}</em></p>}>
                    <FormByType formData={formData} channels={activeChannels} params={activeParams} />
                </Suspense>
            </ErrorBoundary>
        </div>
    );
}
