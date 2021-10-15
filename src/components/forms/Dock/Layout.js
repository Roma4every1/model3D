import React from 'react';
import PresentationList from '../../PresentationList';
import FormParametersList from '../../FormParametersList';
import Menu from '../../Menu';
import FlexLayout from "flexlayout-react";

export default function Layout(props) {

    const { formId, form, activeChild, setActiveChildById, sqlProgramsList } = props;

    const [layoutSettings] = React.useState({
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
                        "name": "Меню",
                        "component": "menu",
                    },
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
    });

    const [flexLayoutModel] = React.useState(FlexLayout.Model.fromJson(layoutSettings));

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
                formId={formId}
                setActiveChildById={setActiveChildById}
            />
        }
        else if (component === "programsplugin") {
            return sqlProgramsList
        }
        else if (component === "menu") {
            return <Menu />
        }
        if (activeChild) {
            return form;
        }
        else {
            return <div/>
        }
    }, [activeChild, sqlProgramsList, setActiveChildById, form, formId])

    return (
        <div>
            <FlexLayout.Layout model={flexLayoutModel} factory={factory} />
        </div>);
}
