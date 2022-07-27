import * as htmlHelper from "./htmlHelper";
import symbols from "./symbols";
import patterns from "./patterns";
import cache from "./cache";
import Maps from "./maps";
import Scroller from "./scroller";
import logger from "./logger";

import linesDefStub from "../../../../../static/libs/lines.def.stub.json";


function createMapsDrawer(paths, httpClient) {
	const getImage = cache(imageName => htmlHelper.loadImage(paths.imageRoot + imageName));
	const provider = {
		getLinesDefStub: cache(() => linesDefStub),
		getSymbolsLib: cache(() => httpClient.getHTTP(paths.symbolDef, "binary")),
		getPatternLib: cache(libName => httpClient.getHTTP(paths.libs + libName.toLowerCase() + ".smb", "binary")),
		getMapsInfo: cache(() => httpClient.getJSON(paths.mapInfo)),
		getMap: cache(mapPath => httpClient.getJSON(paths.mapRoot + mapPath)),
		getContainer: cache((containerName, indexName) =>
			indexName
				? httpClient.getJSON(paths.containerRoot + containerName + "&index=" + indexName)
				: httpClient.getJSON(paths.containerRoot + containerName)
		),
		getPatternImage: getImage,
		getSignImage: getImage,
		drawOptions: paths.drawOptions,
		linesConfigJson: paths.linesConfig,
		getProfile: () => httpClient.getJSON("profileUrl")
	};

	const ret = new Maps([symbols, patterns].reduce((x, f) => f(x), provider));
	ret.Scroller = Scroller;
	return ret;
}

if ( typeof window !== 'undefined') window.createMapsDrawer = createMapsDrawer;
createMapsDrawer.logger = logger;

export default createMapsDrawer;
