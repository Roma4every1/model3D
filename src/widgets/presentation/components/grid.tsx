import { IJsonModel, Model, Layout, Action, Actions } from 'flexlayout-react';
import { useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { i18nMapper } from 'shared/locales';
import { setActiveForm, setPresentationLayout } from '../store/presentations.actions';


interface GridProps {
  id: FormID,
  layout: IJsonModel,
}


const factory = (node) => node.getComponent();

export const Grid = ({id, layout}: GridProps) => {
  const dispatch = useDispatch();
  const [changed, setChanged] = useState(false);

  const model = useMemo(() => {
    return Model.fromJson(layout);
  }, [layout]);

  // обновление разметки в redux при изменении модели
  useEffect(() => {
    if (!changed) return;
    setChanged(false);
    dispatch(setPresentationLayout(id, model.toJson()));
  }, [changed, model, id, dispatch]);

  const onAction = (action: Action) => {
    const { type, data } = action;
    if (type === Actions.SET_ACTIVE_TABSET) {
      const tabset = model.getNodeById(data.tabsetNode);
      const newActiveID = tabset.getChildren()[0]?.getId();
      if (newActiveID) dispatch(setActiveForm(id, newActiveID))
    } else if (type === Actions.SELECT_TAB) {
      dispatch(setActiveForm(id, data.tabNode));
    } else if (type === Actions.ADJUST_SPLIT || type === Actions.MAXIMIZE_TOGGLE) {
      setChanged(true);
    }
    return action;
  };

  return <Layout model={model} factory={factory} onAction={onAction} i18nMapper={i18nMapper}/>;
};
