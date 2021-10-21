import React, { Suspense } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ErrorBoundary from './Form/ErrorBoundary';
import FlexLayout from "flexlayout-react";
import DockForm from './Dock/DockForm';
import DockPluginForm from './Dock/DockPluginForm';

export default function Dock(props) {
    const { t } = useTranslation();
    const sessionManager = useSelector((state) => state.sessionManager);
    const { formData } = props;

    React.useEffect(() => {
        sessionManager.getChildForms(formData.id);
    }, [formData, sessionManager]);

    const plugins = useSelector((state) => state.layout["plugins"]);

    const [layoutSettings] = React.useState({
        global: {
            tabSetEnableTabStrip: false,
            borderEnableDrop: false
        },
        borders: [
            {
                "type": "border",
                "size": 34,
                "minSize": 34,
                "location": "top",
                "children": plugins.top
            },
            {
                "type": "border",
                "enableDrop": "false",
                "size": 300,
                "minSize": 300,
                "location": "left",
                "children": plugins.left,
            }],
        layout: {
            "type": "row",
            "children": [
                {
                    "type": "tabset",
                    "selected": 0,
                    "children": [
                        {
                            "tabStripHeight": 0,
                            "type": "tab",
                            "name": "test",
                            "component": "form"
                        }
                    ]
                }]
        }
    });

    const [flexLayoutModel] = React.useState(FlexLayout.Model.fromJson(layoutSettings));

    const forms = [];

    const factory = React.useCallback((node) => {
        var component = node.getComponent();
        if (component.path) {
            if (!forms[component.id]) {
                let LoadFormByType = React.lazy(() => import('./' + component.form + '/Plugins/' + component.path));
                forms[component.id] = LoadFormByType;
            }
            const FormByType = forms[component.id];
            var resultForm = <FormByType />
            if (component.form === "Dock") {
                resultForm = <FormByType formId={formData.id} />;
            }
            else if (component.form === "Grid") {
                resultForm = <DockPluginForm formId={formData.id} FormByType={FormByType} />;
            }
            return (<ErrorBoundary>
                <Suspense fallback={<p><em>{t('base.loading')}</em></p>}>
                    {resultForm}
                </Suspense>
            </ErrorBoundary>);
        }
        return <DockForm formId={formData.id} />;
    }, [formData, t])

    return (
        <div>
            <FlexLayout.Layout model={flexLayoutModel} factory={factory} />
        </div>);
}
