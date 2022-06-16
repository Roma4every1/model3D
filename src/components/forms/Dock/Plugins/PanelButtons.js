import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button} from "@progress/kendo-react-buttons";
import {sum} from "lodash";
import setFormLayout from "../../../../store/actionCreators/setFormLayout";


export default function PanelButtons(props) {
  const { formId } = props;
  const dispatch = useDispatch();

  const [plugins, formLayout, parameters] = useSelector((state) => {
    const activeChild = state.childForms[formId]?.children.find(p => p.id === (state.childForms[formId].openedChildren[0]));
    return [state.plugins, state.layout[formId], activeChild ? state.formParams[activeChild.id] : null];
  });

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
    <>
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
    </>
  );
}
