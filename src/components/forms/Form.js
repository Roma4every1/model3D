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
    const { formData, data } = props;
    const [formLoadedData, setFormLoadedData] = React.useState(
        {
            formId: formData.id,
            loaded: false,
            activeChannels: data?.activeChannels ?? [],
            activeParams: [],
            settings: []
        });
    const _form = React.useRef(null);

    React.useEffect(() => {
        if (formLoadedData.formId !== formData.id) {
            setFormLoadedData({
                formId: formData.id,
                loaded: false,
                activeChannels: formLoadedData.activeChannels,
                activeParams: formLoadedData.activeParams,
                settings: formLoadedData.settings
            });
        }
    }, [formData, formLoadedData]);

    React.useEffect(() => {
        let ignore = false;
        if (!data || data.needLoad) {
            async function fetchParams() {
                const params = await sessionManager.paramsManager.loadFormParameters(formData.id, false);
                return params;
            }

            async function fetchChannels() {
                const channels = await sessionManager.channelsManager.loadFormChannelsList(formData.id);
                return channels;
            }

            async function fetchSettings() {
                const settings = await sessionManager.paramsManager.loadFormSettings(formData.id, false);
                return settings;
            }
            if (!formLoadedData.loaded) {
                Promise.all([fetchParams(), fetchChannels(), fetchSettings()]).then(values => {
                    if (!ignore) {
                        setFormLoadedData({
                            formId: formData.id,
                            loaded: true,
                            activeChannels: values[1],
                            activeParams: values[0],
                            settings: values[2]
                        });
                    }
                });
            }
        }
        else {
            Promise.all(formLoadedData.activeChannels.map(async ch =>
                await sessionManager.channelsManager.loadAllChannelData(ch, formData.id, false)
            )).then(values => {
                if (!formLoadedData.loaded) {
                    setFormLoadedData({
                        formId: formData.id,
                        loaded: true,
                        activeChannels: data.activeChannels,
                        activeParams: data.activeParams,
                        settings: data.settings
                    });
                }
            });
        }

        return () => {
            ignore = true;
            if (formLoadedData.loaded) {
                sessionManager.channelsManager.setFormInactive(formData.id);
            }
        };
    }, [formData, sessionManager, formLoadedData, data]);

    const FormByType = React.lazy(() => import('./' + capitalizeFirstLetter(formData.type)));

    React.useLayoutEffect(() => {
        dispatch(setFormRefs(formData.id, _form))
    }, [formData, dispatch]);

    const allplugins = useSelector((state) => state.layout["plugins"]?.inner);
    const plugins = allplugins.filter(plugin => plugin?.component?.form === capitalizeFirstLetter(formData.type));

    return (
        <div className="form-container">
            <ErrorBoundary>
                <Suspense fallback={<p><em>{t('base.loading')}</em></p>}>
                    {formLoadedData.loaded ?
                        <div className="form-container">
                            <FormByType formData={formData} data={formLoadedData} ref={_form} />
                            {plugins?.map(pl => {
                                var PluginByType = React.lazy(() => import('./' + capitalizeFirstLetter(formData.type) + '/Plugins/' + pl.component.path));
                                return <PluginByType formId={formData.id} />
                            })}
                        </div> :
                        <p><em>{t('base.loading')}</em></p>
                    }
                </Suspense>
            </ErrorBoundary>
        </div>
    );
}
