import React, { useState, useEffect, useCallback, useRef, useReducer } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { sum } from "lodash";
import { capitalizeFirstLetter } from "../../utils";
import { pluginsDict } from "../dicts/plugins";
import FlexLayout from "flexlayout-react";
import setFormLayout from "../../store/actionCreators/setFormLayout";

import translator from "../common/LayoutTranslator";
import ErrorBoundary from "../common/ErrorBoundary";
import DockForm from "./Dock/DockForm";
import DockPluginForm from "./Dock/DockPluginForm";
import DockPluginStrip from "./Dock/DockPluginStrip";


function Dock({formData}, ref) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const sessionId = useSelector((state) => state.sessionId);
  const sessionManager = useSelector((state) => state.sessionManager);
  const plugins = useSelector((state) => state.plugins);
  const formLayout = useSelector((state) => state.layout[formData.id]);
  const activeChildId = useSelector((state) => state.childForms[formData.id]?.openedChildren[0]);
  const activeSubChild = useSelector((state) => state.childForms[activeChildId]?.children.find(p => p.id === (state.childForms[activeChildId].activeChildren[0])));
  const parametersJSON = useSelector((state) => state.formParams[activeChildId]);

  useEffect(() => {
    sessionManager.getChildForms(formData.id);
  }, [formData, sessionManager]);

  const [leftBorderSettings] = useState({
    global: {rootOrientationVertical: true},
    layout: {type: 'row', children: plugins.left.sort((a, b) => a.order - b.order)}
  });

  const correctLeftBorderSettings = useCallback((leftSettings) => {
    plugins.left.forEach(plugin => {
      if (plugin.condition === 'presentationParamsNotEmpty') {
        if (parametersJSON) {
          if (parametersJSON.filter(parameterJSON => parameterJSON.editorType).length === 0) {
            const tabToDelete = leftSettings.layout.children.findIndex(ch => ch.children.some(tabch => tabch?.component?.id === plugin.children[0].component.id));
            if (tabToDelete >= 0) {
              leftSettings.layout.children.splice(tabToDelete, 1);
            }
          } else {
            if (!leftSettings.layout.children.some(ch => ch.children.some(tabch => tabch?.component?.id === plugin.children[0].component.id))) {
              if (!plugin.initialWeight) plugin.initialWeight = plugin.weight;
              const totalWeight = sum(leftSettings.layout.children.map(ch => ch.weight));

              plugin.weight = plugin.initialWeight / (100 - plugin.initialWeight) * totalWeight;
              plugin.children[0].id = formData.id + ',' + plugin.WMWname;

              leftSettings.layout.children.forEach(leftPlugin => {
                if (!leftPlugin.order) {
                  let pluginFromLeft = plugins.left.find(p => leftPlugin.children.some(ch => ch?.component?.id === p.children[0].component.id));
                  leftPlugin.order = pluginFromLeft?.order;
                }
              })

              leftSettings.layout.children = [...leftSettings.layout.children, plugin].sort((a, b) => a.order - b.order)             }
          }
        }
      }
    });
    return leftSettings;
  }, [parametersJSON, formData, plugins]);

  function leftLayoutModelReducer(state, action) {
    switch (action.type) {
      case 'reset': return action.value;
      case 'correct': return correctLeftBorderSettings(state);
      default: return state;
    }
  }

  const preLeftBorderApplySettings = useSelector((state) => state.layout[formData.id] ?? leftBorderSettings);
  const [leftBorderApplySettings, dispatchLeftBorderApplySettings] = useReducer(leftLayoutModelReducer, leftBorderSettings);

  useEffect(() => {
    dispatchLeftBorderApplySettings({ type: 'reset', value: preLeftBorderApplySettings });
  }, [preLeftBorderApplySettings])

  useEffect(() => {
    dispatchLeftBorderApplySettings({ type: 'correct' });
  }, [parametersJSON])

  const leftBorderModel = FlexLayout.Model.fromJson(leftBorderApplySettings);

  const onModelChange = useCallback(() => {
    const json = leftBorderModel.toJson();
    json.layout = {
        ...leftBorderApplySettings.layout,
        type: json.layout.type,
        children: json.layout.children
    }
    dispatch(setFormLayout(formData.id, json));
  }, [leftBorderModel, formData, dispatch, leftBorderApplySettings]);

  const barSize = 30;
  const [layoutSettings] = useState({
    global: {
      tabSetEnableTabStrip: false,
      borderEnableDrop: false,
      tabEnableClose: false
    },
    borders: [
      {
        id: 'topBorder',
        type: 'border',
        barSize: barSize,
        size: 34,
        minSize: 34,
        location: 'top',
        children: plugins.top
      },
      {
        type: 'border',
        barSize: barSize,
        enableDrop: 'false',
        size: 300,
        minSize: 300,
        location: 'left',
        children: [{type: 'tab', name: t('base.settings'), component: 'left'}],
      },
      {
        type: 'border',
        barSize: barSize,
        enableDrop: 'false',
        size: 300,
        minSize: 300,
        location: 'right',
        children: plugins.right,
      }
    ],
    layout: {
      type: 'row',
      children: [
        {
          type: 'tabset',
          selected: 0,
          children: [{tabStripHeight: 0, type: 'tab', name: 'test', component: 'form'}],
        }
      ],
    }
  });

  const factory = useCallback((node) => {
    const component = node.getComponent();
    if (component?.path) {
      if (!forms.current[component.id]) {
        forms.current[component.id] = pluginsDict[component.form.toLowerCase()][component.path];
      }
      const FormByType = forms.current[component.id];
      let resultForm = <FormByType/>;
      if (component.form === "Dock") {
        resultForm = <FormByType formId={formData.id} />;
      }
      else if (component.form === "Grid" || component.form === "Map") {
        resultForm = <DockPluginForm formId={formData.id} FormByType={FormByType} />;
      }
      return <ErrorBoundary>{resultForm}</ErrorBoundary>;
    }
    else if (component === "strip") {
      return <DockPluginStrip formId={formData.id} />;
    }
    else if (component === "left") {
      return (
        <div>
          <FlexLayout.Layout
            model={leftBorderModel}
            factory={factory}
            onModelChange={onModelChange}
            i18nMapper={translator}
          />
        </div>
      );
    }
    if (!dockForms.current[formData.id]) {
      dockForms.current[formData.id] = <DockForm formId={formData.id} />;
    }
    return dockForms.current[formData.id];
  }, [formData, leftBorderModel, onModelChange]);

  const correctElement = useCallback((layout, plugins, formData) => {
    if (layout.type === "tab") {
      const plugin = plugins.left?.find(pl => pl.WMWname.split(',').some(p => layout.id === formData.id + ',' + p));
      if (plugin) {
        layout.component = plugin.children[0].component;
        layout.name = plugin.children[0].name;
      }
    }
    if (layout.children) {
      layout.children.forEach(child => correctElement(child, plugins, formData));
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      const data = await sessionManager.fetchData(`getFormLayout?sessionId=${sessionId}&formId=${formData.id}`);
      if (!ignore) {
        if (data.layout && data.layout.children) {
          var newChildren = [];
          data.layout.children.forEach(ch => {
            if (ch.selected !== -1) {
              correctElement(ch, plugins, formData);
              newChildren.push(ch);
            }
          });
          if (newChildren.length > 0) {
            data.layout.children = newChildren;
            dispatch(setFormLayout(formData.id, data));
          }
          layoutSettings.borders.forEach(border => {
            border.selected = data.layout['selected' + border.location];
            if (data.layout['size' + border.location]) {
              border.size = data.layout['size' + border.location];
            }
          });
          dispatchFlexLayoutModel({ type: 'reset', value: FlexLayout.Model.fromJson(layoutSettings) });
        }
      }
    }
    fetchData();
    return () => { ignore = true; }
  }, [correctElement, sessionId, formData, dispatch, plugins, sessionManager, layoutSettings]);

  function flexLayoutModelReducer(state, action) {
    switch (action.type) {
      case 'reset': {
        return action.value;
      }
      case 'rebuild': {
        const activeSubChildType = action.activeSubChildType;
        const settings = state.toJson();

        if (settings) {
          const rightBorder = settings.borders.find(b => b.location === "right");
          if (rightBorder) {
              rightBorder.children = plugins.right.filter(p => p.component.form === "Dock" || p.component.form === capitalizeFirstLetter(activeSubChildType));
              if (rightBorder.selected && rightBorder.selected >= rightBorder.children.length) {
                rightBorder.selected = -1;
              }
          }
          const topBorder = settings.borders.find(b => b.location === "top");
          if (topBorder) {
            const newStrip = plugins.top.find(ch => ch.id === "formStrip");
            topBorder.children = topBorder.children.filter(ch => ch.id !== "formStrip");
            if (activeSubChildType) {
              const pluginsForTypeExists = plugins.strip.some(el => el.component.form === capitalizeFirstLetter(activeSubChildType));
              if (pluginsForTypeExists) {
                newStrip.name = t('formNames.' + activeSubChildType);
                topBorder.children.push(newStrip);
              }
            }
            if (topBorder.selected && topBorder.selected >= topBorder.children.length) {
              topBorder.selected = -1;
            }
          }
          return FlexLayout.Model.fromJson(settings);
        }
        return state;
      }
      default: throw new Error();
    }
  }

  const [flexLayoutModel, dispatchFlexLayoutModel] = useReducer(flexLayoutModelReducer, FlexLayout.Model.fromJson(layoutSettings));
  const forms = useRef([]);
  const dockForms = useRef([]);

  useEffect(() => {
    dispatchFlexLayoutModel({ type: 'rebuild', activeSubChildType: activeSubChild?.type });
  }, [activeSubChild]);

  const onDockModelChange = () => {
    const json = flexLayoutModel.toJson();
    if (json && formLayout?.layout) {
      json.borders.forEach(border => {
        if (border.selected || border.selected === 0) {
          formLayout.layout['selected' + border.location] = border.selected;
        } else {
          formLayout.layout['selected' + border.location] = -1;
        }
        formLayout.layout['size' + border.location] = border.size;
      });
    }
    dispatch(setFormLayout(formData.id, formLayout));
  }

  return (
    <div>
      <FlexLayout.Layout
        model={flexLayoutModel}
        factory={factory}
        onModelChange={onDockModelChange}
        i18nMapper={translator}
      />
    </div>
  );
}

export default Dock = React.forwardRef(Dock); // eslint-disable-line
