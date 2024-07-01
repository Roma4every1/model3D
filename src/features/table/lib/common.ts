/** Делает ячейку полностью видимой за счёт прокрутки контейнера таблицы. */
export function scrollCellIntoView(container: Element, cell: HTMLTableCellElement) {
  let top = 0, left = 0, scrollBoxSize = 15;
  const cellRect = cell.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  const topDelta = containerRect.y - cellRect.y;
  if (topDelta > 0) {
    top = -topDelta;
  } else {
    const scrollbarDelta = container.scrollWidth > container.clientWidth ? scrollBoxSize : 0;
    const bottomDelta = (cellRect.y + cellRect.height) - (containerRect.y + containerRect.height);
    if (bottomDelta > -scrollbarDelta) top = bottomDelta + scrollbarDelta;
  }

  const leftDelta = containerRect.x - cellRect.x;
  if (leftDelta > 0) {
    left = -leftDelta;
  } else {
    const rightDelta = (cellRect.x + cellRect.width) - (containerRect.x + containerRect.width);
    if (rightDelta > -scrollBoxSize) left = rightDelta + scrollBoxSize;
  }

  if (top || left) container.scrollBy({top, left, behavior: 'smooth'});
}
