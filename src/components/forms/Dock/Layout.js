import React from 'react';
import PresentationList from '../../PresentationList';
import FormParametersList from '../../FormParametersList';
import FlexLayout from "flexlayout-react";

export default function Layout(props) {

    const { formId, form, activeChild, setActiveChildById, sqlProgramsList } = props;

    var newjson = {
        global: {
            tabSetEnableTabStrip: false
        },
        borders: [
            {
                "type": "border",
                "size": 34,
                "minSize": 34,
                "location": "top",
                "children": [
                    {
                        "type": "tab",
                        "name": "Программы",
                        "component": "programsplugin",
                    }
                ]
            },
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
            return <FormParametersList formId={formId} />
        }
        else if (component === "presparamsplugin") {
            return <FormParametersList
                formId={activeChild.id}
            />
        }
        else if (component === "preslistplugin") {
            return <PresentationList
                setActiveChildById={setActiveChildById}
            />
        }
        else if (component === "programsplugin") {
            return sqlProgramsList
        }
        return form;
    }, [activeChild, sqlProgramsList, setActiveChildById, form, formId])

    return (
        <div>
            <FlexLayout.Layout model={modelJson} factory={factory} />
        </div>);
}
