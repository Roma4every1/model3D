import React from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import setActiveChildren from '../../../store/actionCreators/setActiveChildren';
import setOpenedChildren from '../../../store/actionCreators/setOpenedChildren';
import setFormLayout from '../../../store/actionCreators/setFormLayout';
import FlexLayout from "flexlayout-react";

export default function Container(props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { modelJson } = props;

    const onModelChange = () => {
        var json = modelJson.toJson();
        var childrenToAnalize = json.layout.children;
        if (childrenToAnalize[0].type === "row") {
            childrenToAnalize = childrenToAnalize[0].children;
        }
        var opened = childrenToAnalize.flatMap(item => item.children.map(ch => ch.id));
        var active = childrenToAnalize.filter(item => item.active && (item.selected || item.children.length === 1)).map(item => item.children[item.selected ?? 0].id);
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
