import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Button
} from "@progress/kendo-react-buttons";
import setFormLayout from '../../../../store/actionCreators/setFormLayout';
var _ = require("lodash");

export default function PanelButtons(props) {
    const dispatch = useDispatch();
    const { formId } = props;

    const plugins = useSelector((state) => state.plugins);
    const formLayout = useSelector((state) => state.layout[formId]);
    const activeChild = useSelector((state) => state.childForms[formId]?.children.find(p => p.id === (state.childForms[formId].openedChildren[0])));
    const parametersJSON = useSelector((state) => state.formParams[activeChild.id]);

    const getDisabled = (plugin) => {
        var result = false;
        if (plugin.condition === "presentationParamsNotEmpty")
        {
            if (parametersJSON && parametersJSON.filter(parameterJSON => parameterJSON.editorType).length === 0)
            {
                result = true;
            }
        }
        return result;
    }

    const handlePresentationParameters = (plugin) => {
        if (formLayout) {
            var pluginId = plugin.children[0].component.id;
            plugin.children[0].id = formId + ',' + plugin.WMWname;
            var pluginExists = formLayout.layout.children.some(ch => ch.children.some(tabch => tabch.component.id === pluginId));
            if (!pluginExists) {
                if (!plugin.initialWeight) {
                    plugin.initialWeight = plugin.weight;
                }
                var totalWeight = _.sum(formLayout.layout.children.map(ch => ch.weight));
                var newWeight = plugin.initialWeight / (100 - plugin.initialWeight) * totalWeight;
                plugin.weight = newWeight;

                var settings = {
                    global: {
                        rootOrientationVertical: true
                    },
                    layout: {
                        ...formLayout.layout,
                        "type": "row",
                        "children": [...formLayout.layout.children, plugin].sort((a, b) => a.order - b.order)
                    }
                }
                dispatch(setFormLayout(formId, settings));
            }
        }
    }

    return (
        <div>
            {plugins.left.map(pl => <Button key={pl.children[0].component.id} disabled={getDisabled(pl)} className="actionbutton" onClick={() => handlePresentationParameters(pl)}>
                {pl.children[0].name}
            </Button>)}
        </div>);
}
