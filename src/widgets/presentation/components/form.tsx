import { useDispatch, useSelector } from 'react-redux';
import { formStateSelector } from '../store/form.selectors';
import { stateNotLoaded, formFetchStateSelector } from 'entities/fetch-state';
import { setActiveForm } from '../store/presentation.actions.ts';
import { TextInfo } from 'shared/ui';
import { FormSkeleton } from './plugs';
import { formDict } from '../lib/form-dict';


export interface FormProps {
  id: FormID;
  type: FormType;
}


/** Обобщённый компонент всех типов форм. */
export const Form = ({id, type}: FormProps) => {
  const dispatch = useDispatch();
  const fetchState: FetchState = useSelector(formFetchStateSelector.bind(id));
  const formState: FormState = useSelector(formStateSelector.bind(id));

  if (stateNotLoaded(fetchState)) return <FormSkeleton/>;
  if (fetchState.details) return <TextInfo text={fetchState.details}/>;

  const TypedForm = formDict[type];
  if (!TypedForm) return <TextInfo text={'messages.unsupported-form'}/>;
  const onFocus = () => dispatch(setActiveForm(formState.parent, formState.id));

  return (
    <div className={'form-container'} onFocus={onFocus}>
      <TypedForm {...formState}/>
    </div>
  );
};
