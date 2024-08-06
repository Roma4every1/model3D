import { ReactNode } from 'react';
import { Layout, TabNode } from 'flexlayout-react';
import { useEffect } from 'react';
import { i18nMapper } from 'shared/locales';
import { useClientParameters } from 'entities/parameter';
import { setLeftLayout } from '../store/left-panel.actions';
import { showLeftTab, hideLeftTab } from '../lib/layout-actions';
import { ClientParameterList } from './client-parameter-list';
import { PresentationTreeView } from './presentation-tree';


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
    const { show, disabled } = layout.presentationParameters;

    if (!needPresentationTab && !disabled) {
      layout.presentationParameters.disabled = true;
      if (show) hideLeftTab(layout, 'presentationParameters');
      setLeftLayout({...layout});
    } else if (needPresentationTab && disabled) {
      layout.presentationParameters.disabled = false;
      if (!show) showLeftTab(layout, 'presentationParameters');
      setLeftLayout({...layout});
    }
  }, [layout, needPresentationTab]);

  const factory = (node: TabNode): ReactNode => {
    const component = node.getComponent();
    if (component === 'globalParameters') {
      const channels = rootState.neededChannels;
      const groups = rootState.settings.parameterGroups;
      return <ClientParameterList list={globalParameters} groups={groups} channelIDs={channels}/>;
    }
    if (component === 'presentationParameters') {
      return <ClientParameterList list={presentationParameters ?? []}/>;
    }
    if (component === 'presentationTree') {
      const tree = rootState.settings.presentationTree;
      return <PresentationTreeView tree={tree} onSelect={selectPresentation}/>;
    }
    return null;
  };

  return <Layout model={layout.model} factory={factory} i18nMapper={i18nMapper}/>;
};
