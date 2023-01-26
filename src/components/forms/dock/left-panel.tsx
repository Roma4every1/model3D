import { ReactNode, useMemo } from 'react';
import { Model, Layout, TabNode, Action, Actions } from 'flexlayout-react';
import { useSelector } from 'react-redux';
import { PresentationList } from './presentation-list';
import { FormParametersList } from '../../common/form-parameters-list';
import { i18nMapper } from '../../../locales/i18n';
import { getLeftPanelLayout } from '../../../layout/left-tabs';
import { selectors } from '../../../store';


/** Левая боковая панель (содержит параметры и список презентаций). */
export const LeftPanel = () => {
  const rootFormID = useSelector(selectors.rootFormID);
  const leftLayout = useSelector(selectors.leftLayout);
  const activeChildId: FormID = useSelector(selectors.activeChildID.bind(rootFormID));

  const globalParams: FormParameter[] = useSelector(selectors.formParams.bind(rootFormID));
  const formParams: FormParameter[] = useSelector(selectors.formParams.bind(activeChildId));

  const model = useMemo<Model>(() => {
    return getLeftPanelLayout(leftLayout, globalParams, formParams);
  }, [leftLayout, globalParams, formParams]);

  const factory = (node: TabNode): ReactNode => {
    const component = node.getComponent();
    if (component === 'global') return <FormParametersList formID={rootFormID}/>;
    if (component === 'form') return <FormParametersList formID={activeChildId}/>;
    return <PresentationList/>;
  };

  const onAction = (action: Action): Action => {
    if (action.type === Actions.ADJUST_SPLIT) { // ручное регулирование высоты
      const data = action.data;
      leftLayout[data?.node1] = data?.pixelWidth1;
      leftLayout[data?.node2] = data?.pixelWidth2;
    }
    return action;
  };

  return <Layout model={model} factory={factory} onAction={onAction} i18nMapper={i18nMapper}/>;
};
