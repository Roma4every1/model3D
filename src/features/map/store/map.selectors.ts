/** Состояние карт. */
export function mapsStateSelector(state: WState): MapsState {
  return state.maps;
}

/** Состояние мультикарты. */
export function multiMapStateSelector(this: FormID, state: WState): MultiMapState {
  return state.maps.multi[this];
}

/** Состояние карты. */
export function mapStateSelector(this: FormID, state: WState): MapState {
  return state.maps.single[this];
}

/** Состояние карты. */
export function getMapPresentationParameterSelector(parentID: ClientID, paramID: ParameterID) {
  return (state: WState) => {
    return state.parameters[parentID].find(p => p.id === paramID);
  }
}
