import { Model, Layout, TabNode } from 'flexlayout-react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { MainMenu } from './top-panel/main-menu';
import { PresentationReports } from './top-panel/presentation-reports';
import { DownloadFiles } from './right-panel/download-files';
import { LeftPanel } from './left-panel/left-panel';
import { FormEditPanel } from './top-panel/form-edit-panel';
import { RightTab } from './right-panel/right-tab';
import { i18nMapper } from 'shared/locales';
import { getDockLayout } from '../layout/dock-layout';
import { dockLayoutSelector, rootActiveChildIDSelector } from '../store/root-form.selectors';
import { Presentation, displayedFormTypesSelector } from 'widgets/presentation';


const factory = (node: TabNode) => {
  if (node.getComponent() === 'left') return <LeftPanel/>;
  const id = node.getId();

  if (id === 'top-menu') return <MainMenu/>;
  if (id === 'top-programs') return <PresentationReports/>;
  if (id.startsWith('top')) return <FormEditPanel id={id}/>;

  if (id === 'right-dock') return <DownloadFiles/>;
  if (id.startsWith('right')) return <RightTab/>;

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
