import symbols from "./symbols";
import patterns from "./patterns";
import cache from "./cache";
import Maps from "./maps";
import { loadImage } from "./html-helper";
import { API } from "../../../../api/api";
import lines from "../lines.json";


const drawOptions = {
	zoomSleep: 500,
	selectedSize: 6,
	selectedColor: '#000FFF',
	selectedWidth: 1,
	piesliceBorderColor: 'black',
	piesliceBorderWidth: 0.2,
	piesliceAlpha: 0.7,
};


export function createMapsDrawer(formID: FormID, owner: MapOwner) {
	const getImage = cache((imageName) => loadImage(API.requester.root + 'images/' + imageName));

	let provider = {
		drawOptions,
		getSymbolsLib: cache(() => API.maps.getSymbolsLib()),
		getPatternLib: cache((libName) => API.maps.getPatternLib(libName)),
		getMap: cache((mapID) => API.maps.getMap(formID, mapID)),
		getContainer: cache((containerName, indexName) => {
			return API.maps.getMapContainer(containerName, formID, owner, indexName);
		}),
		getPatternImage: getImage,
		getSignImage: getImage,
		linesConfigJson: { data: lines },
		getProfile: async () => {
			const response = await fetch('profileUrl', {credentials: 'include'});
      return await response.json();
		}
	};

	provider = symbols(provider);
	provider = patterns(provider);

	// @ts-ignore
	const mapsDrawer: MapsDrawer = new Maps(provider);
	mapsDrawer.provider = provider;
	mapsDrawer.getSignImage = provider.getSignImage;
	mapsDrawer.changeOwner = (newOwner) => {
		provider.getContainer = cache((containerName, indexName) => {
			return API.maps.getMapContainer(containerName, formID, newOwner, indexName);
		})
	};
	return mapsDrawer;
}
