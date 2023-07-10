/** Состояние формы; `this - formID`. */
export function formStateSelector(this: FormID, state: WState): FormState {
  return state.forms[this];
}
