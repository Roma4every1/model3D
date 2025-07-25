/** Состояния окон и диалогов приложения. */
type WindowStates = Record<WindowID, WindowState>;

/** Состояние кастомного окна или диалога. */
interface WindowState {
  /** Идентификатор окна (диалога). */
  id: WindowID;
  /** Тип: окон или диалог. */
  type: 'window' | 'dialog';
  /** Пропс окна или диалога. */
  props: any;
  /** Содержимое окна или диалога. */
  content: any;
  /** Добавлены ли необходимые слушатели на элемент окна. */
  listenerAdded?: boolean;
}

/** Идентификатор окна (диалога). */
type WindowID = string;

/* --- Message Dialog --- */

/** Свойства диалогового окна сообщения. */
interface MessageDialogProps {
  /** Тип диалога. */
  type: MessageDialogType;
  /** Заголовок окна. */
  title?: string;
  /** Стили контейнера для содержимого (`CSSProperties`). */
  style?: any;
  /** Контент диалога (текст и т.п.). */
  content: any;
  /** Слушатель закрытия окна. */
  onClose?: () => void;
}

/** Тип сообщения: **информация**, **предупреждение** или **ошибка**. */
type MessageDialogType = 'info' | 'warning' | 'error';
