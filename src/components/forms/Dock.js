import React, { useState, useEffect, useMemo, useCallback, useRef, useReducer } from "react";
import FlexLayout from "flexlayout-react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { sum } from "lodash";
import { capitalizeFirstLetter } from "../../utils";
import { setFormLayout } from "../../store/actionCreators/layout.actions";
import { pluginsDict } from "../dicts/plugins";

import translator from "../common/LayoutTranslator";
import ErrorBoundary from "../common/ErrorBoundary";
import DockForm from "./Dock/DockForm";
import DockPluginForm from "./Dock/DockPluginForm";
import DockPluginStrip from "./Dock/DockPluginStrip";


const barSize = 30;
const initTopBorderSize = 40;
const initLeftBorderSize = 280;
const initRightBorderSize = 300;

const topTabs = ['menu', 'sqlPrograms', 'formStrip'];
const topTabsHeight = {
  'menu': 40,
  'sqlPrograms': 40,
  'formStrip': 92,
};

const correctElement = (layout, plugins, formData) => {
  if (layout.type === 'tab') {
    const findPlugin = (pl) => pl.WMWname.split(',').some(p => layout.id === formData.id + ',' + p);
    const plugin = plugins.left?.find(findPlugin);
    if (plugin) {
      layout.component = plugin.children[0].component;
      layout.name = plugin.children[0].name;
    }
  }
  if (layout.children) {
    layout.children.forEach(child => correctElement(child, plugins, formData));
  }
};

const pluginsSelector = (state) => state.layout.plugins;
const sessionIDSelector = (state) => state.sessionId;
const sessionManagerSelector = (state) => state.sessionManager;

function Dock({formData}, ref) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const plugins = useSelector(pluginsSelector);
  const sessionID = useSelector(sessionIDSelector);
  const sessionManager = useSelector(sessionManagerSelector);

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

  const leftLayoutModelReducer = useCallback((state, action) => {
    switch (action.type) {
      case 'reset': return action.payload;
      case 'correct': return correctLeftBorderSettings(state);
      default: return state;
    }
  }, [correctLeftBorderSettings]);

  const preLeftBorderApplySettings = useSelector((state) => state.layout[formData.id] ?? leftBorderSettings);
  const [leftBorderApplySettings, dispatchLeftBorderApplySettings] = useReducer(leftLayoutModelReducer, leftBorderSettings);

  useEffect(() => {
    dispatchLeftBorderApplySettings({type: 'reset', payload: preLeftBorderApplySettings});
  }, [preLeftBorderApplySettings])

  useEffect(() => {
    dispatchLeftBorderApplySettings({type: 'correct'});
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

  const layoutSettings = useMemo(() => {
    return {
      global: {
        tabSetEnableTabStrip: false,
        borderEnableDrop: false,
        tabEnableClose: false,
      },
      borders: [
        {
          id: 'topBorder', type: 'border', location: 'top',
          barSize: barSize, size: initTopBorderSize, minSize: initTopBorderSize,
          children: plugins.top
        },
        {
          type: 'border', location: 'left',
          barSize: barSize, size: initLeftBorderSize, minSize: initLeftBorderSize,
          enableDrop: 'false',
          children: [{type: 'tab', name: t('base.settings'), component: 'left'}],
        },
        {
          type: 'border', location: 'right',
          barSize: barSize, size: initRightBorderSize, minSize: initRightBorderSize,
          enableDrop: 'false',
          children: plugins.right,
        },
      ],
      layout: {
        type: 'row',
        children: [
          {
            type: 'tabset', selected: 0,
            children: [{tabStripHeight: 0, type: 'tab', name: 'test', component: 'form'}],
          }
        ],
      },
    };
  }, [plugins, t]);

  const factory = useCallback((node) => {
    const component = node.getComponent();
    if (component?.path) {
      if (!forms.current[component.id]) {
        forms.current[component.id] = pluginsDict[component.form.toLowerCase()][component.path];
      }
      const FormByType = forms.current[component.id];
      let resultForm = <FormByType/>;
      if (component.form === 'Dock') {
        resultForm = <FormByType formId={formData.id} />;
      }
      else if (component.form === 'Grid' || component.form === 'Map') {
        resultForm = <DockPluginForm formId={formData.id} FormByType={FormByType} />;
      }
      return <ErrorBoundary>{resultForm}</ErrorBoundary>;
    }
    else if (component === 'strip') {
      return <DockPluginStrip formId={formData.id} />;
    }
    else if (component === 'left') {
      return (
        <FlexLayout.Layout
          model={leftBorderModel}
          factory={factory}
          onModelChange={onModelChange}
          i18nMapper={translator}
        />
      );
    }
    if (!dockForms.current[formData.id]) {
      dockForms.current[formData.id] = <DockForm formId={formData.id} />;
    }
    return dockForms.current[formData.id];
  }, [formData, leftBorderModel, onModelChange]);

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      if (!ignore) {
        const data = await sessionManager.fetchData(`getFormLayout?sessionId=${sessionID}&formId=${formData.id}`);
        if (data.layout && data.layout.children) {
          const newChildren = [];
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
          dispatchFlexLayoutModel({type: 'reset', payload: FlexLayout.Model.fromJson(layoutSettings)});
        }
      }
    }
    fetchData();
    return () => { ignore = true; }
  }, [sessionID, formData, dispatch, plugins, sessionManager, layoutSettings]);

  const flexLayoutModelReducer = useCallback((state, action) => {
    switch (action.type) {

      case 'reset': {
        return action.payload;
      }

      case 'select': {
        const settings = state.toJson();
        if (!settings) return state;
        const topBorder = settings.borders.find(b => b.location === 'top');
        let newTopBorderSize = topTabsHeight[action.payload] || initTopBorderSize;
        if (topBorder.children.find(child => child.id === 'formStrip').name !== 'Карта') {
          newTopBorderSize = topTabsHeight['menu'];
        }
        topBorder.size = newTopBorderSize;
        topBorder.minSize = newTopBorderSize;
        return FlexLayout.Model.fromJson(settings);
      }

      case 'rebuild': {
        const activeSubChildType = action.activeSubChildType;
        const settings = state.toJson();
        if (!settings) return state;

        const rightBorder = settings.borders.find(b => b.location === 'right');
        if (rightBorder) {
          const filterRightPlugins = (p) =>
            p.component.form === 'Dock' ||
            p.component.form === capitalizeFirstLetter(activeSubChildType);

          rightBorder.children = plugins.right.filter(filterRightPlugins);
          if (rightBorder.selected && rightBorder.selected >= rightBorder.children.length) {
            rightBorder.selected = -1;
          }
        }

        const topBorder = settings.borders.find(b => b.location === 'top');
        if (topBorder) {
          const newStrip = plugins.top.find(ch => ch.id === 'formStrip');
          topBorder.children = topBorder.children.filter(ch => ch.id !== 'formStrip');

          if (activeSubChildType) {
            const pluginsForTypeExists = plugins.strip.some(el => el.component.form === capitalizeFirstLetter(activeSubChildType));
            if (pluginsForTypeExists) {
              newStrip.name = t('formNames.' + activeSubChildType);
              topBorder.children.push(newStrip);
            }
          }
          if (topBorder.children.find(child => child.id === 'formStrip')?.name === 'Карта') {
            topBorder.size = topTabsHeight['formStrip'];
            topBorder.minSize = topTabsHeight['formStrip'];
          }
          if (topBorder.selected && topBorder.selected >= topBorder.children.length) {
            topBorder.selected = -1;
          }
        }
        return FlexLayout.Model.fromJson(settings);
      }

      default: throw new Error();
    }
  }, [plugins, t]);

  const [flexLayoutModel, dispatchFlexLayoutModel] = useReducer(
    flexLayoutModelReducer,
    FlexLayout.Model.fromJson(layoutSettings),
  );
  const forms = useRef([]);
  const dockForms = useRef([]);

  useEffect(() => {
    dispatchFlexLayoutModel({type: 'rebuild', activeSubChildType: activeSubChild?.type});
  }, [activeSubChild]);

  const onDockModelChange = useCallback(() => {
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
  },[flexLayoutModel, formLayout, dispatch, formData.id])

  const onAction = useCallback((action) => {
    if (action.type === FlexLayout.Actions.SELECT_TAB) {
      const selectedTab = action.data.tabNode;
      if (topTabs.includes(selectedTab))
        dispatchFlexLayoutModel({type: 'select', payload: selectedTab});
    }
    return action;
  }, [dispatchFlexLayoutModel]);

  return (
    <FlexLayout.Layout
      model={flexLayoutModel}
      factory={factory}
      onModelChange={onDockModelChange}
      onAction={onAction}
      i18nMapper={translator}
    />
  );
}

export default Dock = React.forwardRef(Dock); // eslint-disable-line
