/** Состояние формы; `this - formID`. */
export function formStateSelector(this: FormID, state: WState): FormState {
  return state.forms[this];
}

/** Настройки формы; `this - formID`. */
export function formSettingsSelector(this: FormID, state: WState): FormSettings {
  return state.forms[this].settings;
}
