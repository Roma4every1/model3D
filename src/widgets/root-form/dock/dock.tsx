import { Model, Layout, TabNode } from 'flexlayout-react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { MainMenu } from './main-menu';
import { DownloadFiles } from './download-files';
import { LeftPanel } from './left-panel';
import { TopTab } from './top-tab';
import { RightTab } from './right-tab';
import { i18nMapper } from 'shared/locales';
import { getDockLayout } from '../layout/dock-layout';
import { dockLayoutSelector, rootActiveChildIDSelector } from '../store/root-form.selectors';
import { Presentation, displayedFormTypesSelector } from 'widgets/presentation';


const factory = (node: TabNode) => {
  const id = node.getId();
  if (id === 'top-menu') return <MainMenu/>;
  if (id === 'right-dock') return <DownloadFiles/>;
  if (id.startsWith('top')) return <TopTab id={id}/>;
  if (id.startsWith('right')) return <RightTab/>;
  if (node.getComponent() === 'left') return <LeftPanel/>;
  return <DockForm/>;
};

/** Главная форма. */
export const Dock = () => {
  const formTypes = useSelector(displayedFormTypesSelector);
  const dockLayout = useSelector(dockLayoutSelector);

  const model = useMemo<Model>(() => {
    return getDockLayout(formTypes, dockLayout);
  }, [formTypes, dockLayout]);

  const onModelChange = (model: Model) => {
    const [topBorder, rightBorder] = model.getBorderSet().getBorders();
    dockLayout.topPanelHeight = topBorder.getSize();
    dockLayout.leftPanelWidth = model.getNodeById('left').getRect().width;
    dockLayout.rightPanelWidth = rightBorder.getSize();
    dockLayout.selectedTopTab = topBorder.getSelected();
    dockLayout.selectedRightTab = rightBorder.getSelected();
  };

  return (
    <Layout
      model={model} factory={factory}
      onModelChange={onModelChange} i18nMapper={i18nMapper}
    />
  );
};

const DockForm = () => {
  const id = useSelector(rootActiveChildIDSelector);
  return <Presentation id={id}/>;
};
