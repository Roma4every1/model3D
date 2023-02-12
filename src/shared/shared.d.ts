/** Число для сортировки каких-либо элементов. */
type Order = number;

/** Строка для отображения названия сущности на интерфейсе. */
type DisplayName = string;

/** Словарь изображений. */
type ImageDict<Items = string> = Record<Items, ImagePath>;

/** Путь к изображению. */
type ImagePath = string;
