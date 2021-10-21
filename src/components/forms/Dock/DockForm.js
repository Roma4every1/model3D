import React from 'react';
import { useSelector } from 'react-redux';
import Form from '../Form';

export default function DockForm(props) {
    const { formId } = props;
    const activeChild = useSelector((state) => state.childForms[formId]?.children.find(p => p.id === (state.childForms[formId].openedChildren[0])));

    const form = activeChild ? <Form
        key={activeChild.id}
        formData={activeChild}
    /> : <div />;

    return form;
}