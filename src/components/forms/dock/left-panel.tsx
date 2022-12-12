import { ReactNode, useMemo, useCallback } from "react";
import { IJsonModel, Model, Layout, TabNode, Action, Actions } from "flexlayout-react";
import { useSelector } from "react-redux";
import PresentationList from "./plugins/presentation-list";
import FormParametersList from "../../common/form-parameters-list";
import translator from "../../../locales/layout";
import { selectors } from "../../../store";
import { getLeftPanelLayout } from "../../../layout/left-tabs";


/** Левая боковая панель (обычно содержит параметры и список презентаций). */
export const LeftPanel = () => {
  const rootFormID = useSelector(selectors.rootFormID);
  const leftLayout = useSelector(selectors.leftLayout);
  const activeChildId: FormID = useSelector(selectors.activeChildID.bind(rootFormID));

  const globalParams: FormParameter[] = useSelector(selectors.formParams.bind(rootFormID));
  const formParams: FormParameter[] = useSelector(selectors.formParams.bind(activeChildId));

  const leftBorderSettings = useMemo<IJsonModel>(() => {
    return getLeftPanelLayout(leftLayout, globalParams, formParams);
  }, [leftLayout, globalParams, formParams]);

  const model = useMemo(() => {
    return Model.fromJson(leftBorderSettings)
  }, [leftBorderSettings]);

  const factory = useCallback((node: TabNode): ReactNode => {
    const component = node.getComponent();
    if (component === 'global') return <FormParametersList formId={rootFormID}/>;
    if (component === 'form') return <FormParametersList formId={activeChildId}/>;
    return <PresentationList/>;
  }, [activeChildId, rootFormID]);

  const onAction = useCallback((action: Action): Action => {
    if (action.type === Actions.ADJUST_SPLIT) { // ручное регулирование высоты
      leftLayout[action.data?.node1] = action.data?.pixelWidth1;
      leftLayout[action.data?.node2] = action.data?.pixelWidth2;
    }
    return action;
  }, [leftLayout]);

  return (
    <Layout
      factory={factory} model={model}
      onAction={onAction}
      i18nMapper={translator}
    />
  );
};
