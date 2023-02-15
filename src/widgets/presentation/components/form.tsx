import { createElement, useLayoutEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FormSkeleton, FormFetchError } from './plugs';
import { formStateSelector } from '../store/forms.selectors';
import { stateNotLoaded, formFetchStateSelector } from 'entities/fetch-state';
import { DataSet, setFormRefs } from 'features/dataset';
import { formDict } from './form-dict';


export interface FormProps {
  formData: FormDataWMR,
}


/** Обобщённый компонент всех типов форм. */
export const Form = ({formData}: FormProps) => {
  const { id, type } = formData;
  const dispatch = useDispatch();

  const fetchState: FetchState = useSelector(formFetchStateSelector.bind(id));
  const formState: FormState = useSelector(formStateSelector.bind(id));

  const ref = useRef(null);
  const isDataSet = type === 'dataSet';

  useLayoutEffect(() => {
    if (isDataSet) dispatch(setFormRefs(id, ref));
  }, [id, isDataSet, dispatch]);

  if (stateNotLoaded(fetchState)) return <FormSkeleton/>;
  if (fetchState.details) return <FormFetchError details={fetchState.details}/>;

  if (isDataSet) return <DataSet formData={formData} channels={formState.channels} ref={ref}/>;
  return (
    <div className={'form-container'}>
      {createElement(formDict[type], formState)}
    </div>
  );
};
