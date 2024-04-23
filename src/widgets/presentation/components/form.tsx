import { useClientState } from 'entities/client';
import { useFormFetchState, stateNotLoaded } from 'entities/fetch-state';
import { setActiveForm } from '../store/presentation.actions';
import { TextInfo } from 'shared/ui';
import { FormSkeleton } from './plugs';
import { formDict } from '../lib/form-dict';


export interface FormProps {
  id: FormID;
  type: ClientType;
}


/** Обобщённый компонент всех типов форм. */
export const Form = ({id, type}: FormProps) => {
  const state = useClientState(id);
  const fetchState = useFormFetchState(id);

  if (stateNotLoaded(fetchState)) return <FormSkeleton/>;
  if (fetchState.details) return <TextInfo text={fetchState.details}/>;

  const TypedForm = formDict[type];
  if (!TypedForm) return <TextInfo text={'messages.unsupported-form'}/>;
  const onFocus = () => setActiveForm(state.parent, state.id);

  return (
    <div className={'form-container'} onFocus={onFocus}>
      <TypedForm {...state}/>
    </div>
  );
};
