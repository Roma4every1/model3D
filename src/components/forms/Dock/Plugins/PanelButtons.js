import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, ButtonGroup } from "@progress/kendo-react-buttons";
import { sum } from "lodash";
import { setFormLayout } from "../../../../store/actionCreators/layout.actions";
import { compareArrays } from "../../../../utils";


export default function PanelButtons({formId}) {
  const dispatch = useDispatch();

  const [plugins, formLayout, parameters] = useSelector((state) => {
    const activeChild = state.childForms[formId]?.children.find(p => p.id === (state.childForms[formId].openedChildren[0]));
    return [state.layout.plugins, state.layout[formId], activeChild ? state.formParams[activeChild.id] : null];
  }, compareArrays);

  const isDisabled = (plugin) => {
    return plugin.condition === 'presentationParamsNotEmpty'
      && parameters
      && parameters.filter(param => param.editorType).length === 0;
  }

  const handlePresentationParameters = (plugin) => {
    if (formLayout) {
      const pluginID = plugin.children[0].component.id;
      plugin.children[0].id = formId + ',' + plugin.WMWname;

      const pluginExists = formLayout.layout.children.some(ch => ch.children.some(child => child.component.id === pluginID));
      if (!pluginExists) {
        if (!plugin.initialWeight) plugin.initialWeight = plugin.weight;

        const totalWeight = sum(formLayout.layout.children.map(child => child.weight));
        plugin.weight = plugin.initialWeight / (100 - plugin.initialWeight) * totalWeight;

        dispatch(setFormLayout(formId, {
          global: {rootOrientationVertical: true},
          layout: {
            ...formLayout.layout,
            type: 'row',
            children: [...formLayout.layout.children, plugin].sort((a, b) => a.order - b.order),
          }
        }));
      }
    }
  }

  return (
    <ButtonGroup>
      {plugins.left.map(plugin =>
        <Button
          className="actionbutton"
          key={plugin.children[0].component.id}
          disabled={isDisabled(plugin)}
          onClick={() => handlePresentationParameters(plugin)}
        >
          {plugin.children[0].name}
        </Button>
      )}
    </ButtonGroup>
  );
}
