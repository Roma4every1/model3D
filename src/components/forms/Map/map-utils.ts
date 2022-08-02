/** Возвращает точку с координатами клика мыши. */
export const clientPoint = (event: MouseEvent): ClientPoint => {
  return {x: event.offsetX, y: event.offsetY};
};
