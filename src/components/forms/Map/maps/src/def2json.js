// module def2json

module.exports = def2json

function mayBeNumber( str ) {
	var ret = Number( str )
	if ( ret + "" != "NaN" )
		return ret
	else
		return str
}

function def2json( def ) {
	var ret = def
	.split( "\n" )
	.map( function ( str ) { return str.trim() } )
	.filter( Boolean )
	.filter( function ( str ) { return str.charAt( 0 ) != ";" } )
	.map( function ( str ) { return str.match(
		/(?:^\[\s*(\/)?\s*(.*?)(?:\s*\=\s*(.*?))?\]$)|(?:^(.*?)\s*\=\s*(.*?)$)/
	) } )
	.filter( Boolean )
	.reduce( function ( stack, parsed ) {
		if ( parsed[ 1 ] != null ) {
			var name = parsed[ 2 ]
			while ( stack.length > 1 ) {
				var head = stack.pop()
				if ( head.name == name )
					break
			}
		}
		else if ( parsed[ 2 ] != null ) {
			var name = parsed[ 2 ]
			var ret = {}
			if ( parsed[ 3 ] != null )
				ret.$ = mayBeNumber( parsed[ 3 ] )
			stack[ stack.length - 1 ].value[ name ] = ret
			stack.push( { name: name, value: ret } )
		}
		else if ( parsed[ 4 ] != null ) {
			var name = parsed[ 4 ]
			stack[ stack.length - 1 ].value[ name ] = mayBeNumber( parsed[ 5 ] )
		}
		return stack
	}, [ { value: {} } ] )
	[ 0 ]
	.value

	return ret
}
