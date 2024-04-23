import { ReactNode } from 'react';
import { Layout, TabNode } from 'flexlayout-react';
import { useEffect } from 'react';
import { i18nMapper } from 'shared/locales';
import { setLeftLayout } from '../../../app/store/root-form.actions';
import { showLeftTab, hideLeftTab } from '../lib/layout-actions';
import { useGlobalParameters, useClientParameters } from 'entities/parameter';
import { globalParamsTabID, presentationParamsTabID, presentationTreeTabID } from '../lib/constants';

import { ClientParameterList } from './client-parameter-list';
import { PresentationTreeView } from './presentation-tree';


export interface LeftPanelProps {
  rootState: RootFormState;
}


/** Левая боковая панель (содержит параметры и список презентаций). */
export const LeftPanel = ({rootState}: LeftPanelProps) => {
  const activeID = rootState.activeChildID;
  const layout = rootState.layout.left;
  const presentationTree = rootState.settings.presentationTree;

  const globalParameters = useGlobalParameters();
  const presentationParameters = useClientParameters(activeID);
  const needPresentationTab = presentationParameters?.some(p => p.editor);

  useEffect(() => {
    if (needPresentationTab === undefined) return;
    const { show, disabled } = layout.presentation;

    if (!needPresentationTab && !disabled) {
      layout.presentation.disabled = true;
      if (show) hideLeftTab(layout, 'presentation');
      setLeftLayout({...layout});
    } else if (needPresentationTab && disabled) {
      layout.presentation.disabled = false;
      if (!show) showLeftTab(layout, 'presentation');
      setLeftLayout({...layout});
    }
  }, [layout, needPresentationTab]);

  const factory = (node: TabNode): ReactNode => {
    const id = node.getId();
    if (id === globalParamsTabID)
      return <ClientParameterList clientID={'root'} list={globalParameters}/>;
    if (id === presentationParamsTabID)
      return <ClientParameterList clientID={activeID} list={presentationParameters ?? []}/>;
    if (id === presentationTreeTabID)
      return <PresentationTreeView tree={presentationTree}/>;
    return null;
  };

  return <Layout model={layout.model} factory={factory} i18nMapper={i18nMapper}/>;
};
