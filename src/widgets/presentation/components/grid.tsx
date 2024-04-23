import { Model, Layout, TabSetNode, TabNode, Action, Actions } from 'flexlayout-react';
import { i18nMapper } from 'shared/locales';
import { setActiveForm } from '../store/presentation.actions';


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
      const activeTab = tabset.getChildren()[tabset.getSelected()];
      if (activeTab) setActiveForm(id, activeTab.getId());
    } else if (action.type === Actions.SELECT_TAB) {
      setActiveForm(id, action.data.tabNode);
    }
    return action;
  };

  return <Layout model={model} factory={factory} onAction={onAction} i18nMapper={i18nMapper}/>;
};

function factory(node: TabNode) {
  return node.getComponent();
}
