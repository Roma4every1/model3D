import React from 'react';
import { Splitter } from "@progress/kendo-react-layout";
import FlexLayout from "flexlayout-react";
import BoolTextEditor from './activeParametersEditors/BoolTextEditor';

export default function FormsContainer(props) {
	var json = {
		global: {},
		borders: [],
		layout: {
			"type": "row",
			"weight": 100,
			"children": [
				{
					"type": "tabset",
					"weight": 50,
					"selected": 0,
					"children": [
						{
							"type": "tab",
							"name": "FX",
							"component": "button",
						}
					]
				},
				{
					"type": "tabset",
					"weight": 50,
					"selected": 0,
					"children": [
						{
							"type": "tab",
							"name": "FI",
							"component": "button",
						}
					]
				}
			]
		}
	};

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

	const modelJson = FlexLayout.Model.fromJson(newjson);

    const factory = (node) => {
		//var component = node.getComponent();
  //      if (component === "button") {
  //          return <button>{node.getName()}</button>;
  //      }
	//	return <BoolTextEditor/>
	//	return <button>{"Прівет!!"}</button>;
		var component = node.getComponent();
		return props.children[component];
    }

	return (        
		<div className="presentation" height="500">
			<FlexLayout.Layout height="500" model={modelJson} factory={factory} />
			</div>
    );
}
