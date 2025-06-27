import type { ParameterStringTemplate } from 'entities/parameter';
import { getParameterStorage, useParameterValues } from 'entities/parameter';


interface FormHeaderProps {
  /** Шаблон заголовка. */
  readonly template: ParameterStringTemplate;
}

/** Динамический заголовок формы. */
export const FormHeader = ({template}: FormHeaderProps): string => {
  const ids = [...template.parameterIDs];
  useParameterValues(ids); // подписка на изменения

  const storage = getParameterStorage();
  const parameters = ids.map(id => storage.get(id));
  return template.build(parameters);
};
