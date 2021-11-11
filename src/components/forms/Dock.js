import React, { Suspense } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ErrorBoundary from '../common/ErrorBoundary';
import FlexLayout from "flexlayout-react";
import DockForm from './Dock/DockForm';
import DockPluginForm from './Dock/DockPluginForm';
import DockPluginStrip from './Dock/DockPluginStrip';
import { capitalizeFirstLetter } from '../../utils';

function Dock(props, ref) {
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
                "id": "topBorder",
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
    const forms = React.useRef([]);
    const dockforms = React.useRef([]);

    const factory = React.useCallback((node) => {
        var component = node.getComponent();
        if (component.path) {
            if (!forms.current[component.id]) {
                let LoadFormByType = React.lazy(() => import('./' + component.form + '/Plugins/' + component.path));
                forms.current[component.id] = LoadFormByType;
            }
            const FormByType = forms.current[component.id];
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
        else if (component === "strip") {
            return <DockPluginStrip formId={formData.id} />;
        }
        if (!dockforms.current[formData.id]) {
            let formToShow = <DockForm formId={formData.id} />;
            dockforms.current[formData.id] = formToShow;
        }
        return dockforms.current[formData.id];
    }, [formData, t])

    const activeChildId = useSelector((state) => state.childForms[formData.id]?.openedChildren[0]);
    const activeSubChild = useSelector((state) => state.childForms[activeChildId]?.children.find(p => p.id === (state.childForms[activeChildId].activeChildren[0])));

    React.useEffect(() => {
        if (activeSubChild) {
            var pluginsForTypeExists = plugins.strip.some(el => el.component.form === capitalizeFirstLetter(activeSubChild.type));
            if (pluginsForTypeExists) {
                flexLayoutModel.doAction(FlexLayout.Actions.renameTab("formStrip", t('formNames.' + activeSubChild.type)));
            }
            else {
                flexLayoutModel.doAction(FlexLayout.Actions.renameTab("formStrip", ""));
            }
        }
        else {
            flexLayoutModel.doAction(FlexLayout.Actions.renameTab("formStrip", ""));
        }
    }, [flexLayoutModel, activeSubChild, formData, sessionManager, plugins, t]);

    return (
        <div>
            <FlexLayout.Layout model={flexLayoutModel} factory={factory} />
        </div>);
}
export default Dock = React.forwardRef(Dock); // eslint-disable-line