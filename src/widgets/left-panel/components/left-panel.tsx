import { ReactNode } from 'react';
import { Layout, TabNode } from 'flexlayout-react';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { i18nMapper } from 'shared/locales';
import { setLeftLayout } from '../../../app/store/root-form/root-form.actions';
import { showLeftTab, hideLeftTab } from '../lib/layout-actions';
import { globalParamsSelector, presentationParamsSelector } from '../lib/selectors';
import { globalParamsTabID, presentationParamsTabID, presentationTreeTabID } from '../lib/constants';

import { ClientParameterList } from './client-parameter-list.tsx';
import { PresentationTreeView } from './presentation-tree';


export interface LeftPanelProps {
  rootState: RootFormState;
}


/** Левая боковая панель (содержит параметры и список презентаций). */
export const LeftPanel = ({rootState}: LeftPanelProps) => {
  const dispatch = useDispatch();
  const globalParams = useSelector(globalParamsSelector);
  const presentationParams = useSelector(presentationParamsSelector);
  const presentationParamsLength = presentationParams?.filter(p => p.editorType).length;

  const rootID = rootState.id;
  const activeID = rootState.activeChildID;
  const layout = rootState.layout.left;
  const presentationTree = rootState.presentationTree;

  useEffect(() => {
    if (presentationParamsLength === undefined) return;
    const { show, disabled } = layout.presentation;

    if (presentationParamsLength === 0 && !disabled) {
      layout.presentation.disabled = true;
      if (show) hideLeftTab(layout, 'presentation');
      dispatch(setLeftLayout({...layout}));
    } else if (presentationParamsLength > 0 && disabled) {
      layout.presentation.disabled = false;
      if (!show) showLeftTab(layout, 'presentation');
      dispatch(setLeftLayout({...layout}));
    }
  }, [layout, presentationParamsLength, dispatch]);

  const factory = (node: TabNode): ReactNode => {
    const id = node.getId();
    if (id === globalParamsTabID)
      return <ClientParameterList clientID={rootID} list={globalParams}/>;
    if (id === presentationParamsTabID)
      return <ClientParameterList clientID={activeID} list={presentationParams ?? []}/>;
    if (id === presentationTreeTabID)
      return <PresentationTreeView tree={presentationTree}/>;
    return null;
  };

  return <Layout model={layout.model} factory={factory} i18nMapper={i18nMapper}/>;
};
