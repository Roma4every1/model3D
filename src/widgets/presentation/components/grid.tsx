import { Model, Layout, TabSetNode, TabNode, Action, Actions } from 'flexlayout-react';
import { i18nMapper } from 'shared/locales';
import { setClientActiveChild } from 'entities/client';
import { selectPresentationTab } from '../lib/update';
import { Form } from './form';


interface GridProps {
  /** ID презентации. */
  id: ClientID;
  /** Разметка презентации. */
  model: Model;
}

export const Grid = ({id, model}: GridProps) => {
  const onAction = (action: Action) => {
    if (action.type === Actions.SET_ACTIVE_TABSET) {
      const tabset = model.getNodeById(action.data.tabsetNode) as TabSetNode;
      const activeTab = tabset?.getChildren()[tabset.getSelected()];
      if (activeTab) setClientActiveChild(id, activeTab.getId());
    } else if (action.type === Actions.SELECT_TAB) {
      setTimeout(selectPresentationTab, 0, id);
    }
    return action;
  };
  const factory = (node: TabNode) => {
    if (node.getComponent() === 'layout') {
      const model = node.getConfig() as Model;
      return <Layout model={model} onAction={onAction} factory={factory} i18nMapper={i18nMapper}/>;
    } else {
      const formData = node.getConfig() as FormDataWM;
      return <Form id={formData.id} type={formData.type}/>;
    }
  };
  return <Layout model={model} factory={factory} onAction={onAction} i18nMapper={i18nMapper}/>;
};
