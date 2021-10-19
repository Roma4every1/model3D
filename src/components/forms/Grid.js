import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Form from '../Form';
import FlexLayout from "flexlayout-react";
import Container from './Grid/Container';
var utils = require("../../utils");

export default function Grid(props) {
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
            setOpenedForms(openedData?.map(od => formsData?.find(p => p.id === (od))));
        }
    }, [form, formData, openedForms]);

    const [modelJson, setModelJson] = React.useState(null);

    const pushElement = (jsonToInsert, weight, formToPush) => {
        jsonToInsert.layout.children.push({
            "type": "tabset",
            "weight": weight,
            "children": [
                {
                    "id": formToPush.id,
                    "type": "tab",
                    "name": formToPush.displayName,
                    "component": <Form
                        key={formToPush.id}
                        formData={formToPush}
                    />,
                }
            ]
        });
    }

    React.useEffect(() => {
        let ignore = false;
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
                                var layoutSettingsId = layoutSettings.id;
                                var openedFormWithLayout = openedForms.find(f => f.id === layoutSettingsId);
                                if (layoutSettings && openedFormWithLayout) {
                                    pushElement(newjson, layoutSettings.size, openedFormWithLayout);
                                }
                            });
                        }
                    }
                    else if (openedForms) {
                        openedForms.forEach(openedForm => {
                            if (openedForm) {
                                pushElement(newjson, 100 / openedForms.length, openedForm);
                            }
                        });
                    }
                    setModelJson(FlexLayout.Model.fromJson(newjson));
                }
            }
            fetchData();
        }
        return () => { ignore = true; }
    }, [sessionId, formData, openedForms]);

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
