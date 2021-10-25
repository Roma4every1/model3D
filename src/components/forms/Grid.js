import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Form from './Form';
import FlexLayout from "flexlayout-react";
import Container from './Grid/Container';
var utils = require("../../utils");

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

            if (sessionId) {
                async function fetchData() {
                    const response = await utils.webFetch(`getFormLayout?sessionId=${sessionId}&formId=${formData.id}`);
                    const data = await response.json();
                    if (!ignore) {
                        if (data.children) {
                            newjson.global.rootOrientationVertical = data.vertical;
                            if (openedForms) {
                                data.children.forEach(layoutSettings => {
                                    var layoutSettingsIds = layoutSettings.ids;
                                    var openedFormWithLayout = openedForms.filter(f => layoutSettingsIds.includes(f.id));
                                    if (layoutSettings && openedFormWithLayout) {
                                        pushElement(newjson, layoutSettings, openedFormWithLayout, form.activeChildren);
                                    }
                                });
                            }
                        }
                        else if (openedForms) {
                            openedForms.forEach(openedForm => {
                                if (openedForm) {
                                    pushElement(newjson, 100 / openedForms.length, [openedForm], form.activeChildren);
                                }
                            });
                        }
                        setModelJson(FlexLayout.Model.fromJson(newjson));
                    }
                }
                fetchData();
            }
        }
        return () => { ignore = true; }
    }, [form, sessionId, formData, openedForms, layout]);

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
