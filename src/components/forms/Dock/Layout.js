import React from 'react';
import PresentationList from './Plugins/PresentationList';
import FormParametersList from '../../common/FormParametersList';
import Menu from './Plugins/Menu';
import FlexLayout from "flexlayout-react";

export default function Layout(props) {

    const { formId, form, activeChild, sqlProgramsList } = props;

    const [layoutSettings] = React.useState({
        global: {
            tabSetEnableTabStrip: false,
            borderEnableDrop: false
        },
        borders: [
            {
                "type": "border",
                "size": 34,
                "minSize": 34,
                "location": "top",
                "children": [
                    {
                        "enableDrag": false,
                        "type": "tab",
                        "name": "Меню",
                        "component": "menu",
                    },
                    {
                        "enableDrag": false,
                        "type": "tab",
                        "name": "Программы",
                        "component": "programsplugin",
                    }
                ]
            },
            {
                "type": "border",
                "enableDrop": "false",
                "size": 300,
                "minSize": 300,
                "location": "left",
                "children": [
                    {
                        "enableDrag": false,
                        "type": "tab",
                        "name": "Параметры",
                        "component": "paramsplugin",
                    },
                    {
                        "enableDrag": false,
                        "type": "tab",
                        "name": "Параметры презентации",
                        "component": "presparamsplugin",
                    },
                    {
                        "enableDrag": false,
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
    }, [activeChild, sqlProgramsList, form, formId])

    return (
        <div>
            <FlexLayout.Layout model={flexLayoutModel} factory={factory} />
        </div>);
}
