import { createElement } from 'react';
import { useSelector } from 'react-redux';
import { FormSkeleton, FormFetchError } from './plugs';
import { formStateSelector } from '../store/forms.selectors';
import { stateNotLoaded, formFetchStateSelector } from 'entities/fetch-state';
import { formDict } from './form-dict';


export interface FormProps {
  id: FormID,
  type: FormType,
}


/** Обобщённый компонент всех типов форм. */
export const Form = ({id, type}: FormProps) => {
  const fetchState: FetchState = useSelector(formFetchStateSelector.bind(id));
  const formState: FormState = useSelector(formStateSelector.bind(id));

  if (stateNotLoaded(fetchState)) return <FormSkeleton/>;
  if (fetchState.details) return <FormFetchError details={fetchState.details}/>;

  return (
    <div className={'form-container'}>
      {createElement(formDict[type], formState)}
    </div>
  );
};
