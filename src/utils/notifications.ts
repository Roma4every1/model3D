import { WDispatch, actions } from "../store";


const defaultErrorNotice = 'Ошибка при выполнении запроса';

/** Принимает {@link Promise}, при его завершении выведется уведомление.
 * @param promise промис
 * @param dispatch функция из `useDispatch`
 * @param successText текст уведомления
 * @param errorText текст уведомления в случае ошибки
 * @param duration сколько будет показываться уведомление
 * */
export function callBackWithNotices(
  promise: Promise<any>, dispatch: WDispatch,
  successText: string, errorText = defaultErrorNotice, duration = 2,
) {
  const durationMs = duration * 1000;
  const clearNotice = () => { dispatch(actions.closeWindowNotification()); };

  promise.then(() => {
    dispatch(actions.setWindowNotification(successText));
    setTimeout(clearNotice, durationMs);
  }).catch(() => {
    dispatch(actions.setWindowNotification(errorText));
    setTimeout(clearNotice, durationMs);
  });
}
