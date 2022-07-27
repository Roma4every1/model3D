import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Loader } from "@progress/kendo-react-indicators";
import FlexLayout from "flexlayout-react";

import Form from "./Form";
import Container from "./Grid/Container";
import FormDisplayName from "./Form/FormDisplayName";


const pushElement = (jsonToInsert, layout, formsToPush, activeIds) => {
  jsonToInsert.layout.children.push({
    type: 'tabset',
    weight: layout.size,
    maximized: layout.maximized,
    selected: layout.selected,
    active: formsToPush.some(form => activeIds.includes(form.id)),
    children: formsToPush.map(form => {
      return {
        id: form.id, type: 'tab', name: form.displayName,
        component: <Form key={form.id} formData={form}/>
      }
    })
  });
}

function Grid({formData}, ref) {
  const sessionManager = useSelector((state) => state.sessionManager);
  const sessionID = useSelector((state) => state.sessionId);
  const form = useSelector((state) => state.childForms[formData.id]);
  const layout = useSelector((state) => state.layout[formData.id]);

  const [openedForms, setOpenedForms] = useState(null);
  const [modelJson, setModelJson] = useState(null);

  useEffect(() => {
    sessionManager.getChildForms(formData.id).then();
  }, [formData, sessionManager]);

  useEffect(() => {
    if (!openedForms) {
      const formsData = form?.children;
      const openedData = form?.openedChildren;
      setOpenedForms(openedData?.map(od => formsData?.find(p => p.id === od)));
    }
  }, [form, formData, openedForms]);

  const correctElement = useCallback((layout, forms, activeIds) => {
    if (layout.type === 'tabset') {
      layout.active = layout.children.some(child => activeIds.includes(child.id))
    } else if (layout.type === 'tab') {
      const form = forms.find(f => f.id === layout.id);
      if (form) {
        if (!layout.title) {
          layout.name = <FormDisplayName formData={form} />;
        } else {
          layout.name = layout.title;
        }
        layout.component = <Form key={form.id} formData={form}/>
      }
    }

    if (layout.children) {
      layout.children.forEach(child => correctElement(child, forms, activeIds));
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    if (layout) {
      setModelJson(FlexLayout.Model.fromJson(layout));
    } else {
      const newJSON = {
        global: {rootOrientationVertical: false},
        borders: [],
        layout: {type: 'row', weight: 100, children: []},
      };
      setModelJson(FlexLayout.Model.fromJson(newJSON));

      if (form && openedForms && !ignore) {
        const fetchData = async () => {
          const data = await sessionManager.fetchData(`getFormLayout?sessionId=${sessionID}&formId=${formData.id}`);

          if (data.layout && data.layout.children && openedForms) {
            correctElement(data.layout, openedForms, form.activeChildren);
            setModelJson(FlexLayout.Model.fromJson(data));
          } else if (openedForms) {
            openedForms.forEach(openedForm => {
              if (openedForm) {
                pushElement(newJSON, 100 / openedForms.length, [openedForm], form.activeChildren);
              }
            });
            setModelJson(FlexLayout.Model.fromJson(newJSON));
          }
        }
        fetchData()
      }
    }
    return () => { ignore = true; }
  }, [form, sessionID, formData, openedForms, layout, correctElement, sessionManager]);

  if (!openedForms) return <Loader size={'small'} type={'infinite-spinner'} />;
  return (
    <Container formId={formData.id} modelJson={modelJson}>
      {openedForms.map(formData => <Form key={formData.id} formData={formData}/>)}
    </Container>
  );
}

export default Grid = React.forwardRef(Grid); // eslint-disable-line
