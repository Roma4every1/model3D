import { Model, Layout, TabNode } from "flexlayout-react";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { MainMenu } from "../../top-tabs/main-menu";
import { DownloadFiles } from "../../right-tabs/download-files";
import { LeftPanel } from "./left-panel";
import { TopTab } from "../../top-tabs/top-tab";
import { RightTab } from "../../right-tabs/right-tab";
import { i18nMapper } from "../../../locales/i18n";
import { compareArrays } from "../../../utils/utils";
import { getDockLayout } from "../../../layout/dock-layout";
import { selectors } from "../../../store";
import Form from "../form/form";


const dockLayoutSelector = (state: WState): DockLayout => {
  // console.log(state);
  return state.layout.dock;
};
const activePresentationSelector = (state: WState): FormDataWMR => {
  const rootFormState = state.childForms[state.appState.rootFormID];
  const id = rootFormState.activeChildren[0];
  return rootFormState.children.find(child => child.id === id);
};
const factory = (node: TabNode) => {
  const id = node.getId();
  if (id === 'top-menu') return <MainMenu/>;
  if (id === 'right-dock') return <DownloadFiles/>;
  if (id.startsWith('top')) return <TopTab id={id}/>;
  if (id.startsWith('right')) return <RightTab/>;
  if (node.getComponent() === 'left') return <LeftPanel/>;
  return <DockForm/>;
};

export const Dock = () => {
  const formTypes = useSelector(selectors.displayedFormTypes, compareArrays);
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
  const activeChild = useSelector(activePresentationSelector);
  return activeChild ? <Form formData={activeChild}/> : null;
};
