import { Layout, Model, Action, Actions, TabSetNode, TabNode } from 'flexlayout-react';
import { i18nMapper } from 'shared/locales';
import { setClientActiveChild } from 'entities/client';
import { Form } from './form';


interface PresentationWindowViewProps {
  /** ID презентации. */
  readonly id: ClientID;
  /** Модель разметки. */
  readonly layout: Model;
}

export const PresentationWindowView = (props: PresentationWindowViewProps) => {
  const id = props.id;
  const model = props.layout;

  const onAction = (action: Action) => {
    if (action.type === Actions.SET_ACTIVE_TABSET) {
      const tabset = model.getNodeById(action.data.tabsetNode) as TabSetNode;
      const activeTab = tabset.getChildren()[tabset.getSelected()];
      if (activeTab) setClientActiveChild(id, activeTab.getId());
    } else if (action.type === Actions.SELECT_TAB) {
      setClientActiveChild(id, action.data.tabNode);
    }
    return action;
  };
  return <Layout model={model} factory={factory} i18nMapper={i18nMapper} onAction={onAction}/>;
};

function factory(node: TabNode) {
  const type = node.getConfig().type;
  return <Form id={node.getId()} type={type}/>;
}
