import type { Model, TabSetNode, TabNode, Action } from 'flexlayout-react';
import { Layout, Actions } from 'flexlayout-react';
import { i18nMapper } from 'shared/locales';
import { setClientActiveChild } from 'entities/client';
import { selectPresentationTab } from '../lib/update';
import { Form } from './form';


interface FlexLayoutProps {
  /** ID презентации. */
  readonly id: ClientID;
  /** Разметка презентации. */
  readonly model: Model;
  /** true, если это окно презентации. */
  readonly isWindow?: boolean;
}

export const FlexLayout = ({id, model, isWindow}: FlexLayoutProps) => {
  const onAction = (action: Action) => {
    if (action.type === Actions.SET_ACTIVE_TABSET) {
      const tabset = model.getNodeById(action.data.tabsetNode) as TabSetNode;
      const activeTab = tabset?.getChildren()[tabset.getSelected()];
      if (activeTab) setClientActiveChild(id, activeTab.getId());
    } else if (action.type === Actions.SELECT_TAB) {
      if (isWindow) {
        setClientActiveChild(id, action.data.tabNode);
      } else {
        setTimeout(selectPresentationTab, 0, id);
      }
    }
    return action;
  };
  const factory = (node: TabNode) => {
    if (node.getComponent() === 'layout') {
      const model = node.getConfig() as Model;
      return <Layout model={model} factory={factory} onAction={onAction} i18nMapper={i18nMapper}/>;
    } else {
      const formData = node.getConfig() as FormDataWM;
      return <Form id={formData.id}/>;
    }
  };
  return <Layout model={model} factory={factory} onAction={onAction} i18nMapper={i18nMapper}/>;
};
