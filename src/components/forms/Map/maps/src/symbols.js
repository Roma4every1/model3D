// module symbols

var startThread = require( "./startThread" )
var htmlHelper = require( "./htmlHelper" )
var cache = require( "./cache" )
var _ = require( "lodash" )
var symbol2svg = require( "./symbol2svg" )
var cp1251 = require( "./cp1251" )
var def2json = require( "./def2json" )
var logger = require( "./logger" )

module.exports = provider => {
	var ret = _.extend( {}, provider )

	ret.getSymbolsLib = cache( () => provider.getSymbolsLib().then(
		text => symbol2svg( def2json( cp1251.toUnicode( text ) ) )
	) )

	ret.getSignImage = cache( ( name, index, color ) => {
		if ( name.match( /\.(png|gif|jpg|jpeg|svg)$/ ) )
			return provider.getSignImage( name )
		return startThread( function* () {
			var lib = yield ret.getSymbolsLib()
			var template = lib[ `${ name.toUpperCase() } (${ index })` ]
			if ( !template ){
                var L = logger.createLogger( "DRAW WELL" )
                L.error("well sign is missed "+ name.toUpperCase() +" "+ index)
                template = lib['PNT.CHR (0)']
            }
				
			var svg = template( color )
			var image = yield htmlHelper.loadImageData( svg, "image/svg+xml" ) 
			return image
		} )
	} )

	return ret
}
