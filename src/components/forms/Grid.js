import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Form from './Form';
import FlexLayout from "flexlayout-react";
import Container from './Grid/Container';

function Grid(props, ref) {
    const { t } = useTranslation();
    const sessionManager = useSelector((state) => state.sessionManager);
    const sessionId = useSelector((state) => state.sessionId);
    const { formData } = props;
    const [openedForms, setOpenedForms] = React.useState(null);

    React.useEffect(() => {
        sessionManager.getChildForms(formData.id);
    }, [formData, sessionManager]);

    const form = useSelector((state) => state.childForms[formData.id]);

    React.useEffect(() => {
        if (!openedForms) {
            const formsData = form?.children;
            const openedData = form?.openedChildren;
            setOpenedForms(openedData?.map(od => formsData?.find(p => p.id === od)));
        }
    }, [form, formData, openedForms]);

    const [modelJson, setModelJson] = React.useState(null);

    const layout = useSelector((state) => state.layout[formData.id]);

    const pushElement = (jsonToInsert, layout, formsToPush, activeIds) => {
        jsonToInsert.layout.children.push({
            "type": "tabset",
            "weight": layout.size,
            "maximized": layout.maximized,
            "selected": layout.selected,
            "active": formsToPush.some(formToPush => activeIds.includes(formToPush.id)),
            "children": formsToPush.map(formToPush => {
                return {
                    "id": formToPush.id,
                    "type": "tab",
                    "name": formToPush.displayName,
                    "component": <Form
                        key={formToPush.id}
                        formData={formToPush}
                    />
                }
            })
        });
    }

    const correctElement = React.useCallback((layout, forms, activeIds) => {
        if (layout.type === "tabset") {
            layout.active = layout.children.some(child => activeIds.includes(child.id))
        }
        else if (layout.type === "tab") {
            var form = forms.find(f => f.id === layout.id);
            if (form) {
                if (!layout.title) {
                    layout.name = form.displayName;
                }
                else {
                    layout.name = layout.title;
                }
                layout.component = <Form
                    key={form.id}
                    formData={form}
                />
            }
        }
        if (layout.children) {
            layout.children.forEach(child => correctElement(child, forms, activeIds));
        }
    }, []);

    React.useEffect(() => {
        let ignore = false;
        if (layout) {
            setModelJson(FlexLayout.Model.fromJson(layout));
        }
        else {
            var newjson = {
                global: {
                    rootOrientationVertical: false
                },
                borders: [],
                layout: {
                    "type": "row",
                    "weight": 100,
                    "children": []
                }
            };
            setModelJson(FlexLayout.Model.fromJson(newjson));

            if (form && openedForms) {
                async function fetchData() {
                    const data = await sessionManager.fetchData(`getFormLayout?sessionId=${sessionId}&formId=${formData.id}`);
                    if (!ignore) {
                        if (data.layout && data.layout.children && openedForms) {
                            correctElement(data.layout, openedForms, form.activeChildren);
                            setModelJson(FlexLayout.Model.fromJson(data));
                        }
                        else if (openedForms) {
                            openedForms.forEach(openedForm => {
                                if (openedForm) {
                                    pushElement(newjson, 100 / openedForms.length, [openedForm], form.activeChildren);
                                }
                            });
                            setModelJson(FlexLayout.Model.fromJson(newjson));
                        }
                    }
                }
                fetchData();
            }
        }
        return () => { ignore = true; }
    }, [form, sessionId, formData, openedForms, layout, correctElement, sessionManager]);

    return (
        <div>
            {!openedForms
                ? <p><em>{t('base.loading')}</em></p>
                : <Container formId={formData.id} modelJson={modelJson}>
                    {openedForms.map(formData =>
                        <Form
                            key={formData.id}
                            formData={formData}
                        />)}
                </Container>
            }
        </div>);
}
export default Grid = React.forwardRef(Grid); // eslint-disable-line
