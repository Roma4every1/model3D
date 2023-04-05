import { Model, Layout, TabNode } from 'flexlayout-react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { i18nMapper } from 'shared/locales';
import { getDockLayout } from '../lib/dock-layout';
import { rootStateSelector, presentationSelector } from '../store/root-form/root-form.selectors';
import { traceChannelSelector } from 'entities/traces';

import { Presentation } from 'widgets/presentation';
import { LeftPanel } from 'widgets/left-panel';
import { TracePanel } from 'entities/traces';
import { ActiveOperations, RightTab } from 'widgets/right-panel';
import { MainMenu, PresentationReports, FormPanel } from 'widgets/top-panel';


/** Главная форма. */
export const Dock = ({config}: {config: ClientConfiguration}) => {
  const rootState = useSelector(rootStateSelector);
  const presentation = useSelector(presentationSelector);
  const traceChannel = useSelector(traceChannelSelector);

  const activeID = rootState.activeChildID;
  const { common: dockLayout, left: leftLayout } = rootState.layout;
  const formTypes = presentation?.childrenTypes;
  const needTracePanel = Boolean(traceChannel?.data);

  const model = useMemo<Model>(() => {
    return getDockLayout(formTypes, dockLayout, needTracePanel);
  }, [formTypes, dockLayout, needTracePanel]);

  const onModelChange = (model: Model) => {
    const [topBorder, rightBorder] = model.getBorderSet().getBorders();
    dockLayout.topPanelHeight = topBorder.getSize();
    dockLayout.leftPanelWidth = model.getNodeById('left').getRect().width;
    dockLayout.rightPanelWidth = rightBorder.getSize();
    dockLayout.selectedTopTab = topBorder.getSelected();
    dockLayout.selectedRightTab = rightBorder.getSelected();
  };

  const factory = (node: TabNode) => {
    const id = node.getId();
    if (id === 'left') return <LeftPanel rootState={rootState}/>;

    if (id === 'menu') return <MainMenu leftLayout={leftLayout} config={config}/>;
    if (id === 'reports') return <PresentationReports id={activeID}/>;
    if (id.startsWith('top')) return <FormPanel panelID={id} presentation={presentation}/>;

    if (id === 'right-dock') return <ActiveOperations activeID={activeID}/>;
    if (id === 'right-trace') return <TracePanel channel={traceChannel}/>;
    if (id.startsWith('right')) return <RightTab presentation={presentation}/>;

    return <Presentation id={activeID} state={presentation}/>;
  };

  return (
    <Layout
      model={model} factory={factory}
      onModelChange={onModelChange} i18nMapper={i18nMapper}
    />
  );
};
