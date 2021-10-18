import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Form from '../Form';
import FlexLayout from "flexlayout-react";
import Container from './Grid/Container';
var utils = require("../../utils")

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
    }, [form, formData]);

    const [modelJson, setModelJson] = React.useState(null);

    React.useEffect(() => {
        let ignore = false;
        var newjson = {
            global: { rootOrientationVertical: false },
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
                            for (var i = 0; i < data.children.length; i++) {
                                var openedForm = openedForms.find(f => f.id === data.children[i].id);
                                var layoutSettings = data.children[i];
                                if (layoutSettings) {
                                    if (openedForm) {
                                        newjson.layout.children.push({
                                            "type": "tabset",
                                            "weight": layoutSettings.size,
                                            "children": [
                                                {
                                                    "id": openedForm.id,
                                                    "type": "tab",
                                                    "name": openedForm.displayName,
                                                    "component": <Form
                                                        key={openedForm.id}
                                                        formData={openedForm}
                                                    />,
                                                }
                                            ]
                                        });
                                    }
                                }
                            }
                        }
                    }
                    else if (openedForms) {
                        for (var i = 0; i < openedForms.length; i++) {
                            var openedForm = openedForms[i];
                            if (openedForm) {
                                newjson.layout.children.push({
                                    "type": "tabset",
                                    "id": openedForm.id,
                                    "weight": 100 / openedForms.length,
                                    "children": [
                                        {
                                            "type": "tab",
                                            "name": openedForm.displayName,
                                            "component": <Form
                                                key={openedForm.id}
                                                formData={openedForm}
                                            />,
                                        }
                                    ]
                                });
                            }
                        }
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
