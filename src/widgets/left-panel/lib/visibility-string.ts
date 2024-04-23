import { ParameterStringTemplate } from 'entities/parameter';


/** Создаёт обработчики видимости для презентаций с заданной строкой видимости. */
export function handlePresentationTree(tree: PresentationTree, parameters: Parameter[]): void {
  const values: Record<string, Parameter> = {};
  for (const p of parameters) values[p.id] = p;

  let i = 0;
  const visit = (treeItems: PresentationTree) => {
    for (const item of treeItems) {
      if (item.items) {
        item.id = (i++).toString();
        visit(item.items);
      } else {
        const pattern = item.visibilityString as string;
        if (pattern) {
          item.visibilityString = new ParameterStringTemplate(pattern);
          item.visible = Boolean(eval(item.visibilityString.build(values)));
        } else {
          item.visible = true;
        }
      }
    }
  };
  visit(tree);
}
