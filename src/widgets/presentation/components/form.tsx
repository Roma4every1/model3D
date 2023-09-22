import { useSelector } from 'react-redux';
import { TextInfo } from 'shared/ui';
import { FormSkeleton } from './plugs';
import { formStateSelector } from '../store/form.selectors';
import { stateNotLoaded, formFetchStateSelector } from 'entities/fetch-state';
import { formDict } from '../lib/form-dict';


export interface FormProps {
  id: FormID;
  type: FormType;
}


/** Обобщённый компонент всех типов форм. */
export const Form = ({id, type}: FormProps) => {
  const fetchState: FetchState = useSelector(formFetchStateSelector.bind(id));
  const formState: FormState = useSelector(formStateSelector.bind(id));

  if (stateNotLoaded(fetchState)) return <FormSkeleton/>;
  if (fetchState.details) return <TextInfo text={fetchState.details}/>;

  const TypedForm = formDict[type];
  if (!TypedForm) return <TextInfo text={'messages.unsupported-form'}/>;

  return (
    <div className={'form-container'}>
      <TypedForm {...formState}/>
    </div>
  );
};
