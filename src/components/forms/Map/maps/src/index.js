import { loadImage } from "./htmlHelper";
import symbols from "./symbols";
import patterns from "./patterns";
import cache from "./cache";
import Maps from "./maps";
import Scroller from "./scroller";
import logger from "./logger";


function createMapsDrawer(paths, httpClient) {
	const getImage = cache(imageName => loadImage(paths.imageRoot + imageName));
	let provider = {
		//getLinesDefStub: () => linesDefStub,
		getSymbolsLib: cache(() => httpClient.getHTTP(paths.symbolDef, 'binary')),
		getPatternLib: cache(libName => httpClient.getHTTP(paths.libs + libName.toLowerCase() + '.smb', 'binary')),
		getMapsInfo: cache(() => httpClient.getJSON(paths.mapInfo)),
		getMap: cache(mapPath => httpClient.getJSON(paths.mapRoot + mapPath)),
		getContainer: cache((containerName, indexName) =>
			indexName
				? httpClient.getJSON(paths.containerRoot + containerName + '&index=' + indexName)
				: httpClient.getJSON(paths.containerRoot + containerName)
		),
		getPatternImage: getImage,
		getSignImage: getImage,
		drawOptions: paths.drawOptions,
		linesConfigJson: paths.linesConfig,
		getProfile: () => httpClient.getJSON('profileUrl')
	};

	provider = [symbols, patterns].reduce((x, f) => f(x), provider);
	const ret = new Maps(provider);
	ret.Scroller = Scroller;
	ret.getSignImage = provider.getSignImage
	return ret;
}

if (window) window.createMapsDrawer = createMapsDrawer;
createMapsDrawer.logger = logger;

export default createMapsDrawer;
