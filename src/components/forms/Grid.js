import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Model } from "flexlayout-react";
import { Loader } from "@progress/kendo-react-indicators";
import { selectors, actions } from "../../store";

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
/** Является ли форма мультикартой (т.е. содержит несколько карт). */
const isMultiMap = (children) => {
  return children && children.filter(child => child.type === 'map').length > 1;
};
/** Возвращает список форм-карт мультикарты. */
const getMultiMapChildrenID = (children) => {
  return children.filter(child => child.type === 'map').map(child => child.id);
};

function Grid({formData}, ref) {
  const dispatch = useDispatch();

  const sessionID = useSelector(selectors.sessionID);
  const sessionManager = useSelector(selectors.sessionManager);
  /** @type FormChildrenState */
  const formChildrenState = useSelector(selectors.formChildrenState.bind(formData.id));
  const layout = useSelector(selectors.formLayout.bind(formData.id));

  const [openedForms, setOpenedForms] = useState(null);
  const [modelJson, setModelJson] = useState(null);

  useEffect(() => {
    sessionManager.getChildForms(formData.id).then();
  }, [formData, sessionManager]);

  useEffect(() => {
    if (!openedForms) {
      const formsData = formChildrenState?.children;
      setOpenedForms(formChildrenState?.openedChildren?.map(
        formID => formsData?.find(p => p.id === formID)
      ));
    }
  }, [formChildrenState, formData, openedForms]);

  // проверка на то, что форма является мультикартой
  useEffect(() => {
    if (isMultiMap(formChildrenState?.children)) {
      const childMapsID = getMultiMapChildrenID(formChildrenState.children);
      dispatch(actions.addMultiMap(formData.id, childMapsID));
    }
  }, [formData.id, formChildrenState, dispatch]);

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
      setModelJson(Model.fromJson(layout));
    } else {
      const newJSON = {
        global: {rootOrientationVertical: false},
        borders: [],
        layout: {type: 'row', weight: 100, children: []},
      };
      setModelJson(Model.fromJson(newJSON));

      if (formChildrenState && openedForms && !ignore) {
        const fetchData = async () => {
          const data = await sessionManager.fetchData(`getFormLayout?sessionId=${sessionID}&formId=${formData.id}`);

          if (data.layout && data.layout.children && openedForms) {
            correctElement(data.layout, openedForms, formChildrenState.activeChildren);
            setModelJson(Model.fromJson(data));
          } else if (openedForms) {
            openedForms.forEach(openedForm => {
              if (openedForm) {
                pushElement(newJSON, 100 / openedForms.length, [openedForm], formChildrenState.activeChildren);
              }
            });
            setModelJson(Model.fromJson(newJSON));
          }
        }
        fetchData()
      }
    }
    return () => { ignore = true; }
  }, [formChildrenState, sessionID, formData, openedForms, layout, correctElement, sessionManager]);

  if (!openedForms) return <Loader size={'small'} type={'infinite-spinner'} />;
  return (
    <Container formID={formData.id} modelJson={modelJson}>
      {openedForms.map(openFormData => <Form key={openFormData.id} formData={openFormData}/>)}
    </Container>
  );
}

export default Grid = React.forwardRef(Grid); // eslint-disable-line
