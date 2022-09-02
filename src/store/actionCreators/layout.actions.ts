import {LayoutAction, LayoutActions} from "../reducers/layout";


export const setFormLayout = (formID: FormID, layout): LayoutAction => {
  return {type: LayoutActions.SET, formID, payload: layout};
}

export const setPlugins = (plugins: any): LayoutAction => {
  return {type: LayoutActions.SET_PLUGINS, payload: plugins};
}

export const setTopBorderSize = (size: number): LayoutAction => {
  return {type: LayoutActions.SET_TOP_SIZE, payload: size};
}
