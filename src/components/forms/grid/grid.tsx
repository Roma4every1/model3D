import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { IJsonModel, Model } from "flexlayout-react";
import { Container } from "./container";
import { gridLayoutGlobalAttrs, fillLayout, createLayout } from "./grid-utils";
import { isMultiMap, getMultiMapChildrenID } from "./grid-utils";
import { applyDisplayNamePattern } from "../../../utils/display-name-string";
import { selectors, actions } from "../../../store";
import { API } from "../../../api/api";


export const Grid = ({formID}: FormProps) => {
  const dispatch = useDispatch();
  const [model, setModel] = useState<Model>();

  const formChildrenState: FormChildrenState = useSelector(selectors.formChildrenState.bind(formID));
  const layout: IJsonModel = useSelector(selectors.formLayout.bind(formID));

  const children = formChildrenState?.children;
  const activeChildren = formChildrenState?.activeChildren;
  const openedChildren = formChildrenState?.openedChildren;

  // получить данные о дочерних формах, если этого нет
  useEffect(() => {
    if (!formChildrenState) API.forms.getFormChildren(formID).then((res) => {
      const data: FormChildrenState = res.ok
        ? res.data
        : {id: formID, children: [], activeChildren: [], openedChildren: []};
      data.children.forEach(applyDisplayNamePattern);
      dispatch(actions.setChildForms(formID, data));
    });
  }, [formChildrenState, formID, dispatch]);

  // проверка на то, что форма является мультикартой
  useEffect(() => {
    if (isMultiMap(children)) {
      const childMapsID = getMultiMapChildrenID(children);
      dispatch(actions.addMultiMap(formID, childMapsID));
    }
  }, [formID, children, dispatch]);

  // создание модели разметки
  useEffect(() => {
    if (model || !children) return;
    if (layout) { setModel(Model.fromJson(layout)); return; }

    API.forms.getFormLayout(formID).then((res) => {
      let formLayout: IJsonModel;
      const openedForms = openedChildren.map(formID => children.find(p => p.id === formID))
      if (res.ok && res.data.layout?.children) {
        formLayout = res.data;
        formLayout.global = gridLayoutGlobalAttrs;
        fillLayout(formLayout.layout, openedForms, activeChildren[0]);
        setModel(Model.fromJson(formLayout));
      } else {
        formLayout = createLayout(openedForms, activeChildren[0]);
        setModel(Model.fromJson(formLayout));
      }
      dispatch(actions.setFormLayout(formID, formLayout));
    });
  }, [activeChildren, openedChildren, children, model, formID, layout, dispatch]);

  if (!model) return <div/>;
  return <Container formID={formID} model={model}/>;
};
