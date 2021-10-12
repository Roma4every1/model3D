import React from 'react';
import GlobalParametersList from '../../GlobalParametersList';
import PresentationList from '../../PresentationList';
import PresentationParametersList from '../../PresentationParametersList';
import FlexLayout from "flexlayout-react";

export default function Layout(props) {

    const { form, activeChild, setActiveChildById } = props;

    var newjson = {
        global: { tabSetEnableTabStrip: false },
        borders: [
            {
                "type": "border",
                "size": 300,
                "minSize": 300,
                "location": "left",
                "children": [
                    {
                        "type": "tab",
                        "name": "Параметры",
                        "component": "paramsplugin",
                    },
                    {
                        "type": "tab",
                        "name": "Параметры презентации",
                        "component": "presparamsplugin",
                    },
                    {
                        "type": "tab",
                        "name": "Презентации",
                        "component": "preslistplugin",
                    }
                ]
            }],
        layout: {
            "type": "row",
            "children": [

                {
                    "type": "tabset",
                    "enableTabStrip": false,
                    "selected": 0,
                    "children": [
                        {
                            "tabStripHeight": 0,
                            "type": "tab",
                            "name": "test",
                            "component": "awfawf"
                        }
                    ]
                }]
        }
    };

    const modelJson = FlexLayout.Model.fromJson(newjson);

    const factory = React.useCallback((node) => {
        var component = node.getComponent();
        if (component === "paramsplugin") {
            return <GlobalParametersList />
        }
        else if (component === "presparamsplugin") {
            return <PresentationParametersList
                formId={activeChild.id}
            />
        }
        else if (component === "preslistplugin") {
            return <PresentationList
                setActiveChildById={setActiveChildById}
            />
        }
        return form;
    }, [activeChild, setActiveChildById, form])

    return (
        <div>
            <FlexLayout.Layout model={modelJson} factory={factory} />
        </div>);
}
