import { Model, Layout, TabNode, Actions, DockLocation } from 'flexlayout-react';
import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { i18nMapper } from 'shared/locales';
import { getDockLayout } from '../lib/dock-layout';
import { rootStateSelector, presentationSelector } from '../store/root-form/root-form.selectors';
import { needTraceTopTabSelector, needTraceRightTabSelector } from 'entities/objects';
import { Presentation } from 'widgets/presentation';
import { LeftPanel } from 'widgets/left-panel';
import { ActiveOperations, RightTab } from 'widgets/right-panel';
import { MainMenu, PresentationReports, TopPanel } from 'widgets/top-panel';


// вкладка для редактирования трассы
const traceEditTabJSON = {
  type: 'tab', enableDrag: false,
  id: 'right-trace', name: 'Редактирование трассы',
}

/** Главная форма. */
export const Dock = ({config}: {config: ClientConfiguration}) => {
  const rootState = useSelector(rootStateSelector);
  const presentation = useSelector(presentationSelector);

  const needTopTraceTab = useSelector(needTraceTopTabSelector);
  const needRightTraceTab = useSelector(needTraceRightTabSelector);

  const activeID = rootState.activeChildID;
  const { common: dockLayout, left: leftLayout } = rootState.layout;
  const formTypes = presentation?.childrenTypes;

  const model = useMemo<Model>(() => {
    return getDockLayout(formTypes, dockLayout, needTopTraceTab);
  }, [formTypes, dockLayout, needTopTraceTab]);

  useEffect(() => {
    if (!needTopTraceTab) return;
    if (needRightTraceTab) {
      if (!model.getNodeById('right-trace'))
        model.doAction(Actions.addNode(traceEditTabJSON, 'border_right', DockLocation.RIGHT, 1, true))
    } else {
      if (model.getNodeById('right-trace')) {
        model.doAction(Actions.selectTab('right-trace'));
        model.doAction(Actions.deleteTab('right-trace'));
      }
    }
  }, [needTopTraceTab, needRightTraceTab, model]);

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
    if (id.startsWith('top')) return <TopPanel panelID={id} presentation={presentation}/>;

    if (id === 'right-dock') return <ActiveOperations activeID={activeID}/>;
    if (id.startsWith('right')) return <RightTab panelID={id} presentation={presentation}/>;

    return <Presentation id={activeID} state={presentation}/>;
  };

  return (
    <Layout
      model={model} factory={factory}
      onModelChange={onModelChange} i18nMapper={i18nMapper}
    />
  );
};
