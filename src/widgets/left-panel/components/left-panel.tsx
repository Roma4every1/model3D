import { ReactNode, useMemo } from 'react';
import { Model, Layout, TabNode, Action, Actions } from 'flexlayout-react';
import { useSelector } from 'react-redux';
import { i18nMapper } from 'shared/locales';
import { getLeftPanelLayout } from '../lib/left-tabs-layout';
import { globalParamsSelector, presentationParamsSelector } from '../lib/selectors';

import { GlobalParamList } from './global-param-list';
import { PresentationParamList } from './presentation-param-list';
import { PresentationTreeView } from './presentation-tree';


export interface LeftPanelProps {
  rootState: RootFormState,
}


/** Левая боковая панель (содержит параметры и список презентаций). */
export const LeftPanel = ({rootState}: LeftPanelProps) => {
  const globalParams = useSelector(globalParamsSelector);
  const presentationParams = useSelector(presentationParamsSelector);

  const rootID = rootState.id;
  const activeID = rootState.activeChildID;

  const layout = rootState.layout.left;
  const presentationTree = rootState.presentationTree;
  const dateChanging = rootState.settings.dateChanging;

  const model = useMemo<Model>(() => {
    return getLeftPanelLayout(layout, globalParams, presentationParams);
  }, [layout, globalParams, presentationParams]);

  const onAction = (action: Action): Action => {
    if (action.type === Actions.ADJUST_SPLIT) { // ручное регулирование высоты
      const data = action.data;
      layout[data?.node1] = data?.pixelWidth1;
      layout[data?.node2] = data?.pixelWidth2;
    }
    return action;
  };

  const factory = (node: TabNode): ReactNode => {
    const component = node.getComponent();
    if (component === 'global') {
      return <GlobalParamList rootID={rootID} list={globalParams} dateChanging={dateChanging}/>;
    }
    if (component === 'form') {
      return <PresentationParamList list={presentationParams} activeID={activeID}/>;
    }
    return <PresentationTreeView tree={presentationTree}/>;
  };

  return <Layout model={model} factory={factory} onAction={onAction} i18nMapper={i18nMapper}/>;
};
