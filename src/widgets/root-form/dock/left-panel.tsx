import { ReactNode, useMemo } from 'react';
import { Model, Layout, TabNode, Action, Actions } from 'flexlayout-react';
import { useSelector } from 'react-redux';
import { PresentationList } from './presentation-list';
import { FormParametersList } from './form-parameters-list';
import { i18nMapper } from 'shared/locales';
import { getLeftPanelLayout } from '../layout/left-tabs';
import { rootFormStateSelector } from '../store/root-form.selectors';
import { formParamsSelector } from 'entities/parameters';


/** Левая боковая панель (содержит параметры и список презентаций). */
export const LeftPanel = () => {
  const rootState = useSelector(rootFormStateSelector);
  const { id, activeChildID } = rootState;
  const leftLayout = rootState.layout.left;

  const globalParams: FormParameter[] = useSelector(formParamsSelector.bind(id));
  const formParams: FormParameter[] = useSelector(formParamsSelector.bind(activeChildID));

  const model = useMemo<Model>(() => {
    return getLeftPanelLayout(leftLayout, globalParams, formParams);
  }, [leftLayout, globalParams, formParams]);

  const factory = (node: TabNode): ReactNode => {
    const component = node.getComponent();
    if (component === 'global') return <FormParametersList formID={id}/>;
    if (component === 'form') return <FormParametersList formID={activeChildID}/>;
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
