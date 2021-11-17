// module getlayer

var _ = require( "lodash" )
var fs = require( "fs" )
var zlib = require( "zlib" )
var transform = require( "./gsTransform" )

var root = "./www/maps/"

function readdirSync( dir ) {
	return fs.readdirSync( dir ).map( d => `${ dir }/${ d }` )
}

var files = [
	for ( d of [ `${ root }Containers`, ...readdirSync( `${ root }Maps` ) ] )
	for ( f of readdirSync( d ) )
	f ]
	.filter( f => f.match( /\.xml$/ ) )
	// .slice( 0, 5 )

for ( var file of files ) transformFile(
	file,
	file.replace( /\.xml$/, ".json" ),
	transform.readXml
)

transformFile(
	`${ root }mapinfocache.json`,
	`${ root }mapinfo.json`,
	transform.readTable
)	

function transformFile( source, dest, transformer ) {
	console.log( source )
	var text = transformer( fs.readFileSync( source, "utf8" ) )
	if ( typeof text != "string" )
		text = JSON.stringify( text, null, "\t" )
	// writeGzip( dest, text )
	fs.writeFile( dest, text )
}

function writeGzip( file, text ) {
	var stream = zlib.createGzip()
	stream.pipe( fs.createWriteStream( file + ".gz" ) )
	stream.write( text )
	stream.end()
}	

