import { useClientState, setClientActiveChild } from 'entities/client';
import { TextInfo } from 'shared/ui';
import { formDict } from '../lib/form-dict';


/** Обобщённый компонент всех типов форм. */
export const Form = ({id}: {id: FormID}) => {
  const state = useClientState(id);
  if (!state) return <div className={'wm-skeleton'}/>;
  if (state.loading.error) return <TextInfo text={state.loading.error}/>;
  // console.log(state);
  
  const TypedForm = formDict[state.type];
  if (!TypedForm) return <TextInfo text={'app.unsupported-form'}/>;
  const onFocus = () => setClientActiveChild(state.parent, state.id);

  return (
    <div className={'form-container'} onFocus={onFocus}>
      <TypedForm {...state}/>
    </div>
  );
};
