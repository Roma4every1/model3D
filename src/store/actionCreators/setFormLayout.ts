import {ActionSet, LayoutActions} from "../reducers/layout";


const setFormLayoutForms = (formId, value): ActionSet => {
    return {type: LayoutActions.SET, formId, value};
}

export default setFormLayoutForms;
