import { useEffect } from 'react';
import { Layout, TabNode } from 'flexlayout-react';
import { i18nMapper } from 'shared/locales';
import { useRootClient, useActivePresentation } from 'entities/client';
import { useTraceEditing } from 'entities/objects';
import { Presentation } from 'widgets/presentation';
import { LeftPanel, PopupLeftBorder } from 'widgets/left-panel';
import { ActiveOperations, RightTab } from 'widgets/right-panel';
import { MainMenu, TopTab } from 'widgets/top-panel';
import { selectPresentation } from '../store/presentations';


/** Главная форма. */
export const Dock = () => {
  const rootState = useRootClient();
  const presentation = useActivePresentation();
  const needRightTraceTab = useTraceEditing();

  const activeID = rootState.activeChildID;
  const leftLayout = rootState.layout.left;
  const layoutController = rootState.layout.main;

  // обновление видимости вкладок в зависимости от активной презентации
  useEffect(() => {
    layoutController.updateTabVisibility(presentation);
  }, [presentation, layoutController]);

  // обновление видимости вкладки редактирования трассы
  useEffect(() => {
    layoutController.updateTraceEditTabVisibility(needRightTraceTab);
  }, [needRightTraceTab, layoutController]);

  const factory = (node: TabNode) => {
    const id = node.getId();
    if (id === 'left') return <LeftPanel rootState={rootState} selectPresentation={selectPresentation}/>;
    if (id === 'left-border') return <PopupLeftBorder activeID={activeID}/>;

    if (id === 'menu') return <MainMenu activeID={activeID} leftLayout={leftLayout}/>;
    if (id.startsWith('top')) return <TopTab tabID={id} presentation={presentation}/>;

    if (id === 'right-dock') return <ActiveOperations activeID={activeID}/>;
    if (id.startsWith('right')) return <RightTab tabID={id} presentation={presentation}/>;

    return <Presentation state={presentation}/>;
  };

  return <Layout model={layoutController.model} factory={factory} i18nMapper={i18nMapper}/>;
};
