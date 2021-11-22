import React, { Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ErrorBoundary from '../common/ErrorBoundary';
import setFormRefs from '../../store/actionCreators/setFormRefs';
import { capitalizeFirstLetter } from '../../utils';

export default function Form(props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const sessionManager = useSelector((state) => state.sessionManager);
    const { formData } = props;
    const [activeChannels, setActiveChannels] = React.useState([]);
    const [activeParams, setActiveParams] = React.useState([]);
    const _form = React.useRef(null);

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
            sessionManager.channelsManager.setFormInactive(formData.id);
        };
    }, [formData, sessionManager]);

    const FormByType = React.lazy(() => import('./' + capitalizeFirstLetter(formData.type)));

    React.useLayoutEffect(() => {
        dispatch(setFormRefs(formData.id, _form))
    }, [formData, dispatch])

    return (
        <div className="form-container">
            <ErrorBoundary>
                <Suspense fallback={<p><em>{t('base.loading')}</em></p>}>
                    <FormByType formData={formData} channels={activeChannels} params={activeParams} ref={_form} />
                </Suspense>
            </ErrorBoundary>
        </div>
    );
}
