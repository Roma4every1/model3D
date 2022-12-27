import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Model, IJsonModel } from "flexlayout-react";
import { Loader } from "@progress/kendo-react-indicators";
import { Container } from "./container";
import { correctElement, pushElement, isMultiMap, getMultiMapChildrenID } from "./grid-utils";
import { selectors, actions } from "../../../store";


export default function Grid({formData: {id: formID}}) {
  const dispatch = useDispatch();

  const sessionID = useSelector(selectors.sessionID);
  const sessionManager = useSelector(selectors.sessionManager);
  const formChildrenState: FormChildrenState = useSelector(selectors.formChildrenState.bind(formID));
  const layout: FormLayout = useSelector(selectors.formLayout.bind(formID));

  const children = formChildrenState?.children;
  const activeChildren = formChildrenState?.activeChildren;
  const openedChildren = formChildrenState?.openedChildren;

  const [openedForms, setOpenedForms] = useState<FormChildren>(null);
  const [model, setModel] = useState<Model>(null);

  useEffect(() => {
    sessionManager.getChildForms(formID).then();
  }, [formID, sessionManager]);

  useEffect(() => {
    if (openedForms) return;
    const callback = formID => children?.find(p => p.id === formID);
    setOpenedForms(openedChildren?.map(callback));
  }, [children, openedChildren, openedForms]);

  // проверка на то, что форма является мультикартой
  useEffect(() => {
    if (isMultiMap(children)) {
      const childMapsID = getMultiMapChildrenID(children);
      dispatch(actions.addMultiMap(formID, childMapsID));
    }
  }, [formID, children, dispatch]);

  useEffect(() => {
    let ignore = false;
    if (layout) {
      setModel(Model.fromJson(layout));
    } else {
      const newJSON: IJsonModel = {
        global: {rootOrientationVertical: false, splitterSize: 4},
        borders: [],
        layout: {type: 'row', weight: 100, children: []},
      };
      setModel(Model.fromJson(newJSON));

      if (activeChildren && openedForms && !ignore) {
        const path = `getFormLayout?sessionId=${sessionID}&formId=${formID}`;
        sessionManager.fetchData(path).then((data: IJsonModel) => {
          if (data.layout && data.layout.children && openedForms) {
            correctElement(data.layout, openedForms, activeChildren);
            setModel(Model.fromJson(data));
          } else if (openedForms) {
            openedForms.forEach(openedForm => {
              if (openedForm) pushElement(newJSON, openedForm, activeChildren);
            });
            setModel(Model.fromJson(newJSON));
          }
        });
      }
    }
    return () => { ignore = true; }
  }, [activeChildren, formID, openedForms, layout, sessionID, sessionManager]);

  if (!openedForms) return <Loader size={'small'} type={'infinite-spinner'} />;
  return <Container formID={formID} model={model}/>;
}
