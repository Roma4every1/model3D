import { useClientState, setClientActiveChild } from 'entities/client';
import { TextInfo } from 'shared/ui';
import { formDict } from '../lib/form-dict';


export interface FormProps {
  id: FormID;
  type: ClientType;
}

/** Обобщённый компонент всех типов форм. */
export const Form = ({id, type}: FormProps) => {
  const state = useClientState(id);
  if (!state) return <div className={'wm-skeleton'}/>;
  if (state.loading.error) return <TextInfo text={state.loading.error}/>;

  const TypedForm = formDict[type];
  if (!TypedForm) return <TextInfo text={'app.unsupported-form'}/>;
  const onFocus = () => setClientActiveChild(state.parent, state.id);

  return (
    <div className={'form-container'} onFocus={onFocus}>
      <TypedForm {...state}/>
    </div>
  );
};
