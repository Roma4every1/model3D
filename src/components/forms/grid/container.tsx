import { Layout, Model } from "flexlayout-react";
import { IJsonRowNode, IJsonTabSetNode } from "flexlayout-react/declarations/model/IJsonModel";
import { useDispatch } from "react-redux";
import { actions } from "../../../store";
import translator from "../../../locales/layout";


interface ContainerProps {
  formID: FormID,
  model: Model,
}


export function Container({formID, model}: ContainerProps) {
  const dispatch = useDispatch();

  const onModelChange = () => {
    const json = model.toJson();
    const opened: OpenedChildrenList = [];
    const active: ActiveChildrenList = [];

    fillOpenedChildren(json.layout, opened);
    fillActiveChildren(json.layout, active);

    dispatch(actions.setActiveChildren(formID, active));
    dispatch(actions.setOpenedChildren(formID, opened));
    dispatch(actions.setFormLayout(formID, json));
  };

  return (
    <Layout
      model={model}
      factory={factory}
      onModelChange={onModelChange}
      i18nMapper={translator}
    />
  );
}

const factory = (node) => node.getComponent();

const fillOpenedChildren = (layout: IJsonRowNode | IJsonTabSetNode, list: OpenedChildrenList) => {
  if (layout.type === 'tabset') layout.children.forEach(child => list.push(child.id));
  if (layout.children) layout.children.forEach(child => fillOpenedChildren(child, list));
};
const fillActiveChildren = (layout: IJsonRowNode | IJsonTabSetNode, list: ActiveChildrenList) => {
  if (layout.type === 'tabset' && layout.active && layout.children[layout.selected ?? 0]) {
    list.push(layout.children[layout.selected ?? 0].id);
  }
  if (layout.children) layout.children.forEach(child => fillActiveChildren(child, list));
};
