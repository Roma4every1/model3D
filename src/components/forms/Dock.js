import React, { Suspense } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ErrorBoundary from './Form/ErrorBoundary';
import FlexLayout from "flexlayout-react";
import DockForm from './Dock/DockForm';
import DockPluginForm from './Dock/DockPluginForm';
import DockPluginStrip from './Dock/DockPluginStrip';

export default function Dock(props) {
    const { t } = useTranslation();
    const sessionManager = useSelector((state) => state.sessionManager);
    const { formData } = props;

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

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
                    "id": "tabsettttt",
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
    const dockforms = [];

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
        else if (component === "strip") {
            return <DockPluginStrip formId={formData.id} />;
        }
        if (!dockforms[formData.id]) {
            let formToShow = <DockForm formId={formData.id} />;
            dockforms[formData.id] = formToShow;
        }
        return dockforms[formData.id];
    }, [formData, t, flexLayoutModel])

   // const [formStripExist, setFormStripExist] = React.useState(false);
    const activeChildId = useSelector((state) => state.childForms[formData.id]?.openedChildren[0]);
    const activeSubChild = useSelector((state) => state.childForms[activeChildId]?.children.find(p => p.id === (state.childForms[activeChildId].activeChildren[0])));
    if (activeSubChild) {
        var pluginsForTypeExists = plugins.strip.some(el => el.component.form === capitalizeFirstLetter(activeSubChild.type));
        if (pluginsForTypeExists) {
        //if (!formStripExist && pluginsForTypeExists) {
            flexLayoutModel.doAction(FlexLayout.Actions.renameTab("formStrip", t('formNames.' + activeSubChild.type)));
            //flexLayoutModel.doAction(FlexLayout.Actions.addNode(
            //    {
            //        type: "tab",
            //        component: {bla: "1"},
            //        name: t('formNames.' + activeSubChild.type),
            //        id: "formStrip"
            //    },
            //    "tabsettttt", FlexLayout.DockLocation.CENTER, 1));
            //flexLayoutModel.doAction(FlexLayout.Actions.moveNode(
            //    "tabsettttt", "topBorder", FlexLayout.DockLocation.CENTER, 3))
           // setFormStripExist(true);
        }
        else {//if (formStripExist) {
            flexLayoutModel.doAction(FlexLayout.Actions.renameTab("formStrip", ""));
            //  flexLayoutModel.doAction(FlexLayout.Actions.deleteTab("formStrip"));
        }
        //else if (formStripExist && pluginsForTypeExists) {
        //    flexLayoutModel.doAction(FlexLayout.Actions.renameTab("formStrip", t('formNames.' + activeSubChild.type)));
        //}
        //else if (formStripExist && !pluginsForTypeExists) {
        //    flexLayoutModel.doAction(FlexLayout.Actions.renameTab("formStrip", ""));
        //    // flexLayoutModel.doAction(FlexLayout.Actions.deleteTab("formStrip"));
        //    setFormStripExist(false);
        //}
    }
    else {//if (formStripExist) {
        flexLayoutModel.doAction(FlexLayout.Actions.renameTab("formStrip", ""));
      //  flexLayoutModel.doAction(FlexLayout.Actions.deleteTab("formStrip"));
      //  setFormStripExist(false);
    }

    return (
        <div>
            <FlexLayout.Layout model={flexLayoutModel} factory={factory} />
        </div>);
}
