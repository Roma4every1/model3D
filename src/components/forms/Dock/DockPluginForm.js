import React from 'react';
import { useSelector } from 'react-redux';

export default function DockPluginForm(props) {
    const { formId, FormByType } = props;
    const activeChild = useSelector((state) => state.childForms[formId]?.children.find(p => p.id === (state.childForms[formId].openedChildren[0])));

    if (activeChild && activeChild.id) {
        return <FormByType formId={activeChild.id} />
    }
    else {
        return <div />
    }
}