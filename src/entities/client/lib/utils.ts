/** Возвращает список типов форм в презентации с учётом их видимости. */
export function getChildrenTypes(children: FormDataWM[], opened: ClientID[]): Set<ClientType> {
  const types = new Set<ClientType>();
  for (const child of children) {
    const isOpened = opened.includes(child.id);
    if (isOpened) types.add(child.type);
  }
  return types;
}
