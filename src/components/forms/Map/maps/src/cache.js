// module cache

module.exports = function Cache( fun ) {
	var cache = {}
	var ret = function () {
		var n = [ "$", arguments.length ]
		for ( var i = 0; i < arguments.length; ++i )
			n.push( " $", arguments[ i ] )
		n = n.join( "" )
		var ret = cache[ n ]
		if ( ret !== void 0 )
			return ret
		else
			return cache[ n ] = fun.apply( this, arguments )
	}
	ret.clearCache = () => cache = {}
	return ret
}
