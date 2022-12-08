import { ReactNode, useMemo, useCallback } from "react";
import { IJsonModel, Model, Layout, TabNode } from "flexlayout-react";
import { useSelector } from "react-redux";
import PresentationList from "./plugins/presentation-list";
import FormParametersList from "../../common/form-parameters-list";
import translator from "../../../locales/layout";
import { selectors } from "../../../store";
import { LeftPanelItems, getLeftPanelLayout } from "../../../layout/left-tabs";


/** Левая боковая панель (обычно содержит параметры и список презентаций). */
export const LeftPanel = () => {
  const rootFormID = useSelector(selectors.rootFormID);
  const leftLayoutProto = useSelector(selectors.leftLayout) as LeftPanelItems[];
  const activeChildId: FormID = useSelector(selectors.activeChildID.bind(rootFormID));

  const globalParams: FormParameter[] = useSelector(selectors.formParams.bind(rootFormID));
  const formParams: FormParameter[] = useSelector(selectors.formParams.bind(activeChildId));

  const leftBorderSettings = useMemo<IJsonModel>(() => {
    return getLeftPanelLayout(leftLayoutProto, globalParams, formParams);
  }, [globalParams, formParams, leftLayoutProto]);

  const model = useMemo(() => {
    return Model.fromJson(leftBorderSettings)
  }, [leftBorderSettings]);

  const factory = useCallback((node: TabNode): ReactNode => {
    const component = node.getComponent();
    if (component === LeftPanelItems.GLOBAL) return <FormParametersList formId={rootFormID}/>;
    if (component === LeftPanelItems.FORM) return <FormParametersList formId={activeChildId}/>;
    return <PresentationList formId={rootFormID}/>;
  }, [activeChildId, rootFormID]);

  return (
    <Layout
      factory={factory} model={model}
      i18nMapper={translator}
    />
  );
};
