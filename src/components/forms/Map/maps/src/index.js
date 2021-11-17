// module index

var logger = require( "./logger" )
var Maps = require( "./maps" )
var htmlHelper = require( "./htmlHelper" )
var cache = require( "./cache" )
var Scroller = require( "./scroller" )

module.exports = createMapsDrawer

if ( typeof window != "undefined")
	window.createMapsDrawer = createMapsDrawer

createMapsDrawer.logger = logger

function createMapsDrawer( paths, httpClient ) {

	var getImage = cache( imageName => htmlHelper.loadImage( paths.imageRoot + imageName ) )

    var provider = {
        getLinesDefStub: cache( () => httpClient.getJSON( paths.linesDef + ".stub.json" ) ),
		getSymbolsLib: cache( () => httpClient.getHTTP( paths.symbolDef, "binary" ) ),
		getPatternLib: cache( libName => httpClient.getHTTP( paths.libs + libName.toLowerCase() + ".smb", "binary" ) ),
		getMapsInfo: cache( () => httpClient.getJSON( paths.mapInfo ) ),
		getMap: cache( mapPath => httpClient.getJSON( paths.mapRoot + mapPath ) ),
		getContainer: cache( (containerName, indexName) => 
			indexName 
				? httpClient.getJSON( paths.containerRoot + containerName + "&index=" + indexName )
				: httpClient.getJSON( paths.containerRoot + containerName )
			),
		getPatternImage: getImage,
		getSignImage: getImage,
		drawOptions: paths.drawOptions,
		linesConfigJson: paths.linesConfig,
		getProfile: () => httpClient.getJSON("profileUrl")
	}
    
	var services = [
		require( "./symbols" ),
		require( "./patterns" ),
	]

	var ret = new Maps( services.reduce( ( x, f ) => f( x ), provider ) )
	ret.Scroller = Scroller
	return ret
}
