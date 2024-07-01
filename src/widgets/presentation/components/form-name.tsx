import { ParameterStringTemplate, useParameters } from 'entities/parameter';


interface FormNameProps {
  pattern: ParameterStringTemplate;
}


/** Динамический заголовок формы. */
export const FormName = ({pattern}: FormNameProps) => {
  const parameters = useParameters([...pattern.parameterIDs]);
  return <>{pattern.build(parameters)}</>;
};
