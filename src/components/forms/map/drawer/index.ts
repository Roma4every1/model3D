import symbols from './symbols';
import patterns from './patterns';
import cache from './cache';
import Maps from './maps';
import { loadImage } from './html-helper';
import { API } from '../../../../api/api';
import lines from '../lines.json';


const drawOptions = {
	zoomSleep: 400,
	selectedSize: 6,
	selectedColor: '#000FFF',
	selectedWidth: 1,
	piesliceBorderColor: 'black',
	piesliceBorderWidth: 0.2,
	piesliceAlpha: 0.7,
};
const getImage = cache((imageName) => loadImage(API.requester.root + 'images/' + imageName));

function createProvider() {
  let provider = {
    drawOptions,
    getSymbolsLib: cache(() => API.maps.getSymbolsLib()),
    getPatternLib: cache((libName) => API.maps.getPatternLib(libName)),
    getPatternImage: getImage,
    getSignImage: getImage,
    linesConfigJson: { data: lines },
  };

  provider = symbols(provider);
  provider = patterns(provider);
  return provider;
}

export function createMapsDrawer() {
  // @ts-ignore
  const mapsDrawer: MapsDrawer = new Maps();
  mapsDrawer.getSignImage = provider.getSignImage;
  return mapsDrawer;
}

export const provider = createProvider();

