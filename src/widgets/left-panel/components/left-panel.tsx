import { ReactNode } from 'react';
import { Layout, TabNode } from 'flexlayout-react';
import { useEffect } from 'react';
import { i18nMapper } from 'shared/locales';
import { useClientParameters } from 'entities/parameter';
import { setLeftLayout } from '../store/left-panel.actions';
import { showLeftTab, hideLeftTab } from '../lib/layout-actions';
import { ClientParameterList } from './client-parameter-list';
import { PresentationTreeView } from './presentation-tree';
import { globalParamsTabID, presentationParamsTabID, presentationTreeTabID } from '../lib/constants';


interface LeftPanelProps {
  rootState: RootClient;
  selectPresentation: (id: ClientID) => void;
}


/** Левая боковая панель (содержит параметры и список презентаций). */
export const LeftPanel = ({rootState, selectPresentation}: LeftPanelProps) => {
  const layout = rootState.layout.left;
  const globalParameters = useClientParameters(rootState.id);
  const presentationParameters = useClientParameters(rootState.activeChildID);
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
    if (id === globalParamsTabID) {
      return <ClientParameterList list={globalParameters}/>;
    }
    if (id === presentationParamsTabID) {
      return <ClientParameterList list={presentationParameters ?? []}/>;
    }
    if (id === presentationTreeTabID) {
      const tree = rootState.settings.presentationTree;
      return <PresentationTreeView tree={tree} onSelect={selectPresentation}/>;
    }
    return null;
  };

  return <Layout model={layout.model} factory={factory} i18nMapper={i18nMapper}/>;
};
