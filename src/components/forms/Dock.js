import React, { Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import translator from '../common/LayoutTranslator';
import ErrorBoundary from '../common/ErrorBoundary';
import FlexLayout from "flexlayout-react";
import DockForm from './Dock/DockForm';
import DockPluginForm from './Dock/DockPluginForm';
import DockPluginStrip from './Dock/DockPluginStrip';
import { capitalizeFirstLetter } from '../../utils';
import setFormLayout from '../../store/actionCreators/setFormLayout';

function Dock(props, ref) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const sessionId = useSelector((state) => state.sessionId);
    const sessionManager = useSelector((state) => state.sessionManager);
    const { formData } = props;

    React.useEffect(() => {
        sessionManager.getChildForms(formData.id);
    }, [formData, sessionManager]);

    const plugins = useSelector((state) => state.layout["plugins"]);
    const formLayout = useSelector((state) => state.layout[formData.id]);

    const [leftBorderSettings] = React.useState({
        global: {
            rootOrientationVertical: true
        },
        layout: {
            "type": "row",
            "children": plugins.left.sort((a, b) => a.order - b.order)
        }
    });

    const leftBorderApplySettings = useSelector((state) => state.layout[formData.id] ?? leftBorderSettings);
    const leftBorderModel = FlexLayout.Model.fromJson(leftBorderApplySettings);

    const onModelChange = React.useCallback(() => {
        var json = leftBorderModel.toJson();
        dispatch(setFormLayout(formData.id, json));
    }, [leftBorderModel, formData, dispatch]);

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
                "children": [{
                    "type": "tab",
                    "name": t('base.settings'),
                    "component": "left"
                }],
            },
            {
                "type": "border",
                "enableDrop": "false",
                "size": 300,
                "minSize": 300,
                "location": "right",
                "children": plugins.right,
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
            else if (component.form === "Grid" || component.form === "Map") {
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
        else if (component === "left") {
            return <div>
                <FlexLayout.Layout model={leftBorderModel} factory={factory} onModelChange={onModelChange} i18nMapper={translator} />
            </div>;
        }
        if (!dockforms.current[formData.id]) {
            let formToShow = <DockForm formId={formData.id} />;
            dockforms.current[formData.id] = formToShow;
        }
        return dockforms.current[formData.id];
    }, [formData, t, leftBorderModel, onModelChange]);

    React.useEffect(() => {
        let ignore = false;
        async function fetchData() {
            const data = await sessionManager.fetchData(`getFormLayout?sessionId=${sessionId}&formId=${formData.id}`);
            if (!ignore) {
                if (data.layout && data.layout.children) {
                    var newChildren = [];
                    data.layout.children.forEach(ch => {
                        if (ch.selected !== -1) {
                            ch.children.forEach(tabch => {
                                var plugin = plugins.left?.find(pl => pl.WMWname.split(',').some(p => tabch.id === formData.id + ',' + p));
                                if (plugin) {
                                    tabch.component = plugin.children[0].component;
                                    tabch.name = plugin.children[0].name;
                                    //tabch.order = plugin.order;
                                }
                            });
                            newChildren.push(ch);
                        }
                    });
                    if (newChildren.length > 0) {
                        data.layout.children = newChildren;
                        dispatch(setFormLayout(formData.id, data));
                    }
                    layoutSettings.borders.forEach(border => {
                        border.selected = data.layout['selected' + border.location];
                    });
                    setFlexLayoutModel(FlexLayout.Model.fromJson(layoutSettings));
                }
            }
        }
        fetchData();
        return () => { ignore = true; }
    }, [sessionId, formData, dispatch, plugins, sessionManager, layoutSettings]);

    const [flexLayoutModel, setFlexLayoutModel] = React.useState(FlexLayout.Model.fromJson(layoutSettings));
    const forms = React.useRef([]);
    const dockforms = React.useRef([]);

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

            plugins.right.forEach(plugin => {
                if (capitalizeFirstLetter(activeSubChild.type) === plugin.component.form || "Dock" === plugin.component.form) {
                    flexLayoutModel.doAction(FlexLayout.Actions.renameTab(plugin.component.id, plugin.name));
                }
                else {
                    flexLayoutModel.doAction(FlexLayout.Actions.renameTab(plugin.component.id, ""));
                }
            })
        }
        else {
            flexLayoutModel.doAction(FlexLayout.Actions.renameTab("formStrip", ""));
            plugins.right.forEach(plugin => {
                flexLayoutModel.doAction(FlexLayout.Actions.renameTab(plugin.component.id, ""));
            })
        }
    }, [flexLayoutModel, activeSubChild, formData, sessionManager, plugins, t]);

    const onDockModelChange = () => {
        var json = flexLayoutModel.toJson();
        if (json && formLayout?.layout) {
            json.borders.forEach(border => {
                if (border.selected || border.selected === 0) {
                    formLayout.layout['selected' + border.location] = border.selected;
                }
                else {
                    formLayout.layout['selected' + border.location] = -1;
                }
            });
        }
        dispatch(setFormLayout(formData.id, formLayout));
    }

    return (
        <div>
            <FlexLayout.Layout model={flexLayoutModel} factory={factory} onModelChange={onDockModelChange} i18nMapper={translator} />
        </div>);
}
export default Dock = React.forwardRef(Dock); // eslint-disable-line