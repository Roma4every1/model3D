import { useClientStore } from 'entities/client';
import { ParameterStringTemplate } from 'entities/parameter';
import { useLocalOrGlobalParamValues } from 'entities/parameter/store/parameter.store';


interface FormNameProps {
  formID: FormID;
  pattern: ParameterStringTemplate;
}


/** Динамический заголовок формы. */
export const FormName = ({formID, pattern}: FormNameProps) => {
  const parent = useClientStore(state => state[formID]?.parent);
  const values = useLocalOrGlobalParamValues(parent, pattern.parameterIDs);
  return <>{pattern.build(values)}</>;
};
