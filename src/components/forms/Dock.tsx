import { ReactNode, FunctionComponent } from "react";
import { useEffect, useMemo, useCallback, useRef, useReducer } from "react";
import { IJsonModel, Model, Layout, TabNode } from "flexlayout-react";
import { IJsonRowNode } from "flexlayout-react/declarations/model/IJsonModel";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { capitalizeFirstLetter } from "../../utils/utils";
import { actions, selectors } from "../../store";
import { pluginsDict } from "../dicts/plugins";

import { LeftPanel } from "./Dock/left-panel";
import ErrorBoundary from "../common/ErrorBoundary";
import DockForm from "./Dock/DockForm";
import DockPluginForm from "./Dock/DockPluginForm";
import DockPluginStrip from "./Dock/dock-plugin-strip";
import translator from "../../locales/layout";


const barSize = 30;
const initTopBorderSize = 90;
const initLeftBorderSize = 270;
const initRightBorderSize = 300;


export default function Dock({formData}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const plugins = useSelector(selectors.plugins);
  const sessionID = useSelector(selectors.sessionID);
  const sessionManager = useSelector(selectors.sessionManager);

  const formLayout: FormLayout = useSelector(selectors.formLayout.bind(formData.id));
  const activeChildId = useSelector((state: WState) => {
    //console.log(state);
    return state.childForms[formData.id]?.activeChildren[0]
  });
  const activeSubChild = useSelector((state: WState) => state.childForms[activeChildId]?.children
    .find(p => p.id === (state.childForms[activeChildId].activeChildren[0])));

  const forms = useRef<Record<string, FunctionComponent<any>>>({});
  const dockForms = useRef<Record<FormID, any>>({});

  useEffect(() => {
    sessionManager.getChildForms(formData.id);
  }, [formData, sessionManager]);

  const layoutSettings = useMemo<IJsonModel>(() => {
    return {
      global: {
        tabSetEnableTabStrip: false,
        borderEnableDrop: false,
        tabEnableClose: false,
        splitterSize: 6,
      },
      borders: [
        {
          id: 'topBorder', type: 'border', location: 'top',
          barSize: barSize, size: initTopBorderSize,
          children: plugins.top as IJsonRowNode[],
        },
        {
          type: 'border', location: 'right',
          barSize: barSize, size: initRightBorderSize, minSize: initRightBorderSize,
          enableDrop: false,
          children: plugins.right as IJsonRowNode[],
        },
      ],
      layout: {
        type: 'row',
        children: [
          {
            type: 'tabset', width: initLeftBorderSize,
            children: [{type: 'tab', component: 'left'}],
          },
          {
            type: 'tabset', minWidth: 200,
            children: [{type: 'tab', component: 'form'}],
          },
        ],
      },
    };
  }, [plugins]);

  const factory = useCallback((node: TabNode): ReactNode => {
    //const id = node.getId();
    const component: FormPluginComponent = node.getComponent() as any;
    if (component === 'strip') return <DockPluginStrip formId={formData.id} />;
    if (component === 'left') return <LeftPanel rootFormID={formData.id}/>;

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
    if (!dockForms.current[formData.id]) {
      dockForms.current[formData.id] = <DockForm formId={formData.id} />;
    }
    return dockForms.current[formData.id];
  }, [formData]);

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      const data = await sessionManager
        .fetchData(`getFormLayout?sessionId=${sessionID}&formId=${formData.id}`);
      if (!ignore) {
        if (data.layout && data.layout.children) {
          const newChildren = [];
          data.layout.children.forEach(ch => { if (ch.selected !== -1) newChildren.push(ch); });
          if (newChildren.length > 0) {
            data.layout.children = newChildren;
            dispatch(actions.setFormLayout(formData.id, data));
          }
          layoutSettings.borders.forEach(border => {
            border['selected'] = data.layout['selected' + border.location];
            if (data.layout['size' + border.location]) {
              border.size = data.layout['size' + border.location];
            }
          });
          dispatchFlexLayoutModel({type: 'reset', payload: Model.fromJson(layoutSettings as IJsonModel)});
        }
      }
    }
    fetchData();
    return () => { ignore = true; }
  }, [sessionID, formData, dispatch, plugins, sessionManager, layoutSettings]);

  const flexLayoutModelReducer = useCallback((state: Model, action) => {
    switch (action.type) {

      case 'reset': {
        return action.payload;
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

          rightBorder.children = plugins.right.filter(filterRightPlugins) as any;
          if (rightBorder.selected && rightBorder.selected >= rightBorder.children.length) {
            rightBorder.selected = -1;
          }
        }

        const topBorder = settings.borders.find(b => b.location === 'top');
        if (topBorder) {
          const newStrip = plugins.top.find(ch => ch.id === 'formStrip');
          topBorder.children = topBorder.children.filter(ch => ch.id !== 'formStrip');

          if (activeSubChildType) {
            const pluginsForTypeExists = plugins.strip.some(el => {
              return (el.component as any).form === capitalizeFirstLetter(activeSubChildType)
            });
            if (pluginsForTypeExists) {
              newStrip.name = t('formNames.' + activeSubChildType);
              topBorder.children.push(newStrip as any);
            }
          }
          if (topBorder.selected && topBorder.selected >= topBorder.children.length) {
            topBorder.selected = -1;
          }
        }
        return Model.fromJson(settings);
      }

      default: throw new Error();
    }
  }, [plugins, t]);

  const [flexLayoutModel, dispatchFlexLayoutModel] = useReducer(
    flexLayoutModelReducer,
    Model.fromJson(layoutSettings as IJsonModel),
  );

  useEffect(() => {
    dispatchFlexLayoutModel({type: 'rebuild', activeSubChildType: activeSubChild?.type});
  }, [activeSubChild]);

  const onDockModelChange = useCallback((model: Model) => {
    const json = model.toJson();
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
    dispatch(actions.setFormLayout(formData.id, formLayout));
  },[formLayout, dispatch, formData.id])

  return (
    <Layout
      model={flexLayoutModel}
      factory={factory}
      onModelChange={onDockModelChange}
      i18nMapper={translator}
    />
  );
}
