export function getFormTypes(children: FormDataWMR[]): FormType[] {
  return [...new Set(children.map(child => child.type))];
}
