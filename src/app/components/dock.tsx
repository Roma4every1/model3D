import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { i18nMapper } from 'shared/locales';
import { Presentation } from 'widgets/presentation';
import { LeftPanel } from 'widgets/left-panel';
import { ActiveOperations, RightTab } from 'widgets/right-panel';
import { MainMenu, PresentationReports, TopTab } from 'widgets/top-panel';

import { Layout, TabNode } from 'flexlayout-react';
import { LayoutManager } from '../lib/layout.ts';
import { rootStateSelector, presentationSelector, needTraceRightTabSelector } from '../store/root-form/root-form.selectors';


/** Главная форма. */
export const Dock = ({config}: {config: ClientConfiguration}) => {
  const rootState = useSelector(rootStateSelector);
  const presentation = useSelector(presentationSelector);
  const needRightTraceTab = useSelector(needTraceRightTabSelector);

  const activeID = rootState.activeChildID;
  const leftLayout = rootState.layout.left;
  const layoutManager: LayoutManager = rootState.layout.common;
  const model = layoutManager.model;

  // обновление видимости вкладок в зависимости от активной презентации
  useEffect(() => {
    layoutManager.updateTabVisibility(presentation);
  }, [presentation, layoutManager]);

  // обновление видимости вкладки редактирования трассы
  useEffect(() => {
    layoutManager.updateTraceEditTabVisibility(needRightTraceTab);
  }, [needRightTraceTab, layoutManager]);

  const factory = (node: TabNode) => {
    const id = node.getId();
    if (id === 'left') return <LeftPanel rootState={rootState}/>;

    if (id === 'menu') return <MainMenu leftLayout={leftLayout} config={config}/>;
    if (id === 'reports') return <PresentationReports id={activeID}/>;
    if (id.startsWith('top')) return <TopTab tabID={id} presentation={presentation}/>;

    if (id === 'right-dock') return <ActiveOperations activeID={activeID}/>;
    if (id.startsWith('right')) return <RightTab tabID={id} presentation={presentation}/>;

    return <Presentation id={activeID} state={presentation}/>;
  };

  return <Layout model={model} factory={factory} i18nMapper={i18nMapper}/>;
};
