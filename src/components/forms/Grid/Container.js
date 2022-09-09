import React from "react";
import FlexLayout from "flexlayout-react";
import { useDispatch } from "react-redux";
import translator from "../../common/LayoutTranslator";
import { actions } from "../../../store";


const getOpenedChildren = (layout, list) => {
  if (layout.type === 'tabset') layout.children.forEach(child => list.push(child.id));
  if (layout.children) layout.children.forEach(child => getOpenedChildren(child, list));
}

const getActiveChildren = (layout, list) => {
  if (layout.type === 'tabset' && layout.active && layout.children[layout.selected ?? 0]) {
    list.push(layout.children[layout.selected ?? 0].id);
  }

  if (layout.children) layout.children.forEach(child => getActiveChildren(child, list));
}

export default function Container({formID, modelJson}) {
  const dispatch = useDispatch();

  const onModelChange = () => {
    const json = modelJson.toJson();
    const opened = [], active = [];

    getOpenedChildren(json.layout, opened);
    getActiveChildren(json.layout, active);

    dispatch(actions.setActiveChildren(formID, active));
    dispatch(actions.setOpenedChildren(formID, opened));
    dispatch(actions.setFormLayout(formID, json));
  }

  return (
    <FlexLayout.Layout
      model={modelJson}
      factory={(node) => node.getComponent()}
      onModelChange={onModelChange}
      i18nMapper={translator}
    />
  );
}
