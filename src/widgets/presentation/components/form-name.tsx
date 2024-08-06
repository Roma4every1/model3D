import { ParameterStringTemplate, getParameterStorage, useParameterValues } from 'entities/parameter';


interface FormNameProps {
  pattern: ParameterStringTemplate;
}


/** Динамический заголовок формы. */
export const FormName = ({pattern}: FormNameProps) => {
  const ids = [...pattern.parameterIDs];
  useParameterValues(ids); // подписка на изменения

  const storage = getParameterStorage();
  const parameters = ids.map(id => storage.get(id));
  return <>{pattern.build(parameters)}</>;
};
