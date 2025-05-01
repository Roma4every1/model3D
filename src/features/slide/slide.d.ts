/** Идентификатор элемента слайд-формы. */
type SlideElementID = number | string;

/**
 * Тип элемента слайд-формы.
 * + `collapse` — сворачиваемый контейнер для других элементов
 * + `text` — текстовый блок, который может иметь заголовок
 * + `button` — кнопка для запуска процедур
 */
type SlideElementType = 'collapse' | 'text' | 'button';
