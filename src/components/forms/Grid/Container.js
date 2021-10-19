import React from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import setActiveChildren from '../../../store/actionCreators/setActiveChildren';
import setOpenedChildren from '../../../store/actionCreators/setOpenedChildren';
import setFormLayout from '../../../store/actionCreators/setFormLayout';
import FlexLayout from "flexlayout-react";
var _ = require("lodash");

export default function Container(props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { modelJson } = props;

    const onModelChange = () => {
        var json = modelJson.toJson();
        var opened = _.map(json.layout.children, (item) => item.children[0].id);
        var active = _.map(_.filter(json.layout.children, (item) => item.active), (item) => item.children[0].id);
        if (json.layout.children[0].type === "row") {
            opened = _.map(json.layout.children[0].children, (item) => item.children[0].id);
            active = _.map(_.filter(json.layout.children[0].children, (item) => item.active), (item) => item.children[0].id);
        }

        dispatch(setActiveChildren(props.formId, active));
        dispatch(setOpenedChildren(props.formId, opened));

        dispatch(setFormLayout(props.formId, json));
    }

    const factory = (node) => {
        var component = node.getComponent();
        return component;
    }

    const translator = (text, parameter) => {
        if (text === "Move: ") {
            return t('flexlayout.move') + parameter;
        }
        else if (text === "Hidden tabs") {
            return t('flexlayout.hiddenTabs');
        }
        else if (text === "Restore tabset") {
            return t('flexlayout.restoreTabset');
        }
        else if (text === "Maximize tabset") {
            return t('flexlayout.maximizeTabset');
        }
        else if (text === "Close") {
            return t('flexlayout.close');
        }
        else if (text === "ErroRendering component") {
            return t('flexlayout.error');
        }
        else {
            if (parameter) {
                return text + parameter;
            }
            else {
                return text;
            }
        }
    }

    return (
        <div>
            <FlexLayout.Layout model={modelJson} factory={factory} onModelChange={onModelChange} i18nMapper={translator} />
        </div>
    );
}
