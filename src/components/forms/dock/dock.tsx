import { useEffect, useMemo, useCallback } from "react";
import { IJsonModel, Model, Layout, TabNode } from "flexlayout-react";
import { useSelector } from "react-redux";
import { MainMenu } from "../../top-tabs/main-menu";
import { LeftPanel } from "./left-panel";
import { TopTab } from "../../top-tabs/top-tab";
import { RightTab } from "../../right-tabs/right-tab";
import { compareArrays } from "../../../utils/utils";
import { selectors } from "../../../store";
import { getDockLayout } from "../../../layout/dock-layout";
import Form from "../form/form";
import DateChanging from "./plugins/date-changing";
import translator from "../../../locales/layout";


const dockLayoutSelector = (state: WState) => {
  // console.log(state);
  return state.layout.dock;
}

export default function Dock({formData: {id: formID}}) {
  const sessionManager = useSelector(selectors.sessionManager);
  const formTypes = useSelector(selectors.displayedFormTypes, compareArrays);
  const dockLayout = useSelector(dockLayoutSelector);

  useEffect(() => {
    sessionManager.getChildForms(formID).then();
  }, [formID, sessionManager]);

  const layoutSettings = useMemo<IJsonModel>(() => {
    return getDockLayout(formTypes, dockLayout);
  }, [formTypes, dockLayout]);

  const factory = useCallback((node: TabNode) => {
    const id = node.getId();
    if (id === 'top-menu') return <MainMenu/>;
    if (id.startsWith('top')) return <TopTab id={id}/>;
    if (id.startsWith('right')) return <RightTab id={id}/>
    if (node.getComponent() === 'left') return <LeftPanel/>;
    return <DockForm formID={formID}/>;
  }, [formID]);

  const onModelChange = useCallback((model: Model) => {
    const [topBorder, rightBorder] = model.getBorderSet().getBorders();
    dockLayout.topPanelHeight = topBorder.getSize();
    dockLayout.leftPanelWidth = model.getNodeById('left').getRect().width;
    dockLayout.rightPanelWidth = rightBorder.getSize();
    dockLayout.selectedTopTab = topBorder.getSelected();
    dockLayout.selectedRightTab = rightBorder.getSelected();
  }, [dockLayout]);

  return (
    <>
      <Layout
        model={Model.fromJson(layoutSettings)}
        factory={factory}
        onModelChange={onModelChange}
        i18nMapper={translator}
      />
      <DateChanging formID={formID}/>
    </>
  );
}

function DockForm({formID}: PropsFormID) {
  const activeChild = useSelector(selectors.activeChild.bind(formID));
  return activeChild ? <Form data={null} formData={activeChild}/> : null;
}
