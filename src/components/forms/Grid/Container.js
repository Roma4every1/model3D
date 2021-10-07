import React from 'react';
import FlexLayout from "flexlayout-react";

export default function Container(props) {
    var newjson = {
        global: {},
        borders: [],
        layout: {
            "type": "row",
            "weight": 100,
            "children": []
        }
    };

    for (var i = 0; i < props.children.length; i++) {
        if (props.children[i]) {
            newjson.layout.children.push({
                "type": "tabset",
                "weight": 100 / props.children.length,
                "selected": 0,
                "children": [
                    {
                        "type": "tab",
                        "name": props.children[i].props.formData.displayName,
                        "component": i,
                    }
                ]
            });
        }
    }

    const modelJson = FlexLayout.Model.fromJson(newjson);

    const factory = (node) => {
        var component = node.getComponent();
        return props.children[component];
    }

    return (
        <div className="presentation" height="500">
            <FlexLayout.Layout height="500" model={modelJson} factory={factory} />
        </div>
    );
}
