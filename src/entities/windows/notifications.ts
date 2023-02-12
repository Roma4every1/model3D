import { Dispatch } from 'redux';
import { setWindowNotification, closeWindowNotification } from './store/window-data.actions';


const defaultErrorNotice = 'Ошибка при выполнении запроса';

/** Принимает {@link Promise}, при его завершении выведется уведомление.
 * @param promise промис
 * @param dispatch функция из `useDispatch`
 * @param successText текст уведомления
 * @param errorText текст уведомления в случае ошибки
 * @param duration сколько секунд будет показываться уведомление
 * */
export function callBackWithNotices(
  promise: Promise<any>, dispatch: Dispatch,
  successText: string, errorText = defaultErrorNotice, duration = 3,
) {
  const durationMs = duration * 1000;
  const clearNotice = () => { dispatch(closeWindowNotification()); };

  promise.then(() => {
    dispatch(setWindowNotification(successText));
    setTimeout(clearNotice, durationMs);
  }).catch(() => {
    dispatch(setWindowNotification(errorText));
    setTimeout(clearNotice, durationMs);
  });
}

/** Выводит уведомление.
 * @param dispatch функция из `useDispatch`
 * @param text текст уведомления
 * @param duration сколько секунд будет показываться уведомление
 * */
export function showNotice(dispatch: Dispatch, text: string, duration: number = 3) {
  const clearNotice = () => { dispatch(closeWindowNotification()); };
  dispatch(setWindowNotification(text));
  setTimeout(clearNotice, duration * 1000);
}
