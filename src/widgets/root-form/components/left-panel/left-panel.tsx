import { ReactNode, useMemo } from 'react';
import { Model, Layout, TabNode, Action, Actions } from 'flexlayout-react';
import { useSelector } from 'react-redux';
import { PresentationTree } from './presentation-tree';
import { GlobalParamList } from './global-param-list';
import { PresentationParamList } from './presentation-param-list';
import { i18nMapper } from 'shared/locales';
import { getLeftPanelLayout } from '../../layout/left-tabs';
import { leftLayoutSelector, globalParamsSelector, activeChildParamsSelector } from '../../store/root-form.selectors';


/** Левая боковая панель (содержит параметры и список презентаций). */
export const LeftPanel = () => {
  const leftLayout = useSelector(leftLayoutSelector);
  const globalParams = useSelector(globalParamsSelector);
  const presentationParams = useSelector(activeChildParamsSelector);

  const model = useMemo<Model>(() => {
    return getLeftPanelLayout(leftLayout, globalParams, presentationParams);
  }, [leftLayout, globalParams, presentationParams]);

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

const factory = (node: TabNode): ReactNode => {
  const component = node.getComponent();
  if (component === 'global') return <GlobalParamList/>;
  if (component === 'form') return <PresentationParamList/>;
  return <PresentationTree/>;
};
