import symbols from './symbols';
import patterns from './patterns';
import cache from './cache';
import { showMap } from './maps';
import { mapsAPI } from '../lib/maps.api';
import lines from './lines.json';


const drawOptions = {
	zoomSleep: 400,
	selectedSize: 6,
	selectedColor: '#000FFF',
	selectedWidth: 1,
	piesliceBorderColor: 'black',
	piesliceBorderWidth: 0.2,
	piesliceAlpha: 0.7,
};

function createProvider() {
  let provider: any = {
    drawOptions,
    getSymbolsLib: cache(() => mapsAPI.getSymbolsLib()),
    getPatternLib: cache((libName) => mapsAPI.getPatternLib(libName)),
    linesConfigJson: { data: lines },
  };

  provider = symbols(provider);
  provider = patterns(provider);
  return provider;
}

export const provider = createProvider();

export function createMapDrawer(): MapDrawer {
  return {
    showMap: showMap,
    getSignImage: provider.getSignImage,
  };
}
