import React from 'react';
import { useDispatch } from 'react-redux';
import translator from '../../common/LayoutTranslator';
import setActiveChildren from '../../../store/actionCreators/setActiveChildren';
import setOpenedChildren from '../../../store/actionCreators/setOpenedChildren';
import setFormLayout from '../../../store/actionCreators/setFormLayout';
import FlexLayout from "flexlayout-react";

export default function Container(props) {
    const dispatch = useDispatch();
    const { modelJson } = props;

    const getOpenedChidren = (layout, list) => {
        if (layout.type === "tabset") {
            layout.children.forEach(child => list.push(child.id));
        }
        if (layout.children) {
            layout.children.forEach(child => getOpenedChidren(child, list));
        }
    }

    const getActiveChidren = (layout, list) => {
        if (layout.type === "tabset" && layout.active && (layout.selected || layout.children.length === 1)) {
            list.push(layout.children[layout.selected ?? 0].id);
        }
        if (layout.children) {
            layout.children.forEach(child => getActiveChidren(child, list));
        }
    }

    const onModelChange = () => {
        var json = modelJson.toJson();
        var opened = [];
        var active = [];
        getOpenedChidren(json.layout, opened);
        getActiveChidren(json.layout, active);
        dispatch(setActiveChildren(props.formId, active));
        dispatch(setOpenedChildren(props.formId, opened));
        dispatch(setFormLayout(props.formId, json));
    }

    const factory = (node) => {
        var component = node.getComponent();
        return component;
    }

    return (
        <div>
            <FlexLayout.Layout model={modelJson} factory={factory} onModelChange={onModelChange} i18nMapper={translator} />
        </div>
    );
}
