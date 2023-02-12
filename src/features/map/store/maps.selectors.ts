export const mapsStateSelector = (state: WState) => {
  return state.maps;
};

export function multiMapStateSelector(this: FormID, state: WState): MultiMapState {
  return state.maps.multi[this];
}

/** Хранилище состояния карты. */
export function mapStateSelector(this: FormID, state: WState): MapState {
  return state.maps.single[this];
}
