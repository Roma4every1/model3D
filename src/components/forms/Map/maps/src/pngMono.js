// module pngMono

var PNGlib = require( "./pnglib" )
var parseColor = require( "parse-color" )

var map = [].map

module.exports = function ( matrix, color, bkcolor ) {
	var p = new PNGlib( matrix[ 0 ].length, matrix.length, 256 )

	var background = !bkcolor || bkcolor == "none"
		? p.color( 0, 0, 0, 0 ) : p.color( ...parseColor( bkcolor ).rgb )
	var foreground = p.color( ...parseColor( color ).rgb )

	for ( var x = 0; x < 32; ++x )
	for ( var y = 0; y < 32; ++y )
		p.buffer[ p.index( x, y ) ] = matrix[ y ][ x ]
			? foreground : background

	return map.call( p.getDump(), c => c.charCodeAt( 0 ) & 255 )
}
