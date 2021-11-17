// module startThread

var logger = require( "./logger" )

module.exports = startThread

function startThread( proc ) {
	return new Promise( function ( resolve, reject ) {
		var i
		try {
			i = proc()
		}
		catch ( e ) {
			logger.debug( "thread", e )
			return reject( e )
		}
		next()
		function step( imethod, result ) {
			var v
			try {
				v = imethod.call( i, result )
			}
			catch ( e ) {
				logger.debug( "thread", e )
				return reject( e )
			}
			if ( v.done ){
				return resolve( v.value )
			}
			if (v.value && v.value.then){
				v.value.then( next, fail )
			}
		}
		function next( result ) {
			return step( i.next, result )
		}
		function fail( result ) {
			return step( i.throw, result )
		}
	} )
}

startThread.sleep = milliseconds => new Promise( resolve =>
	setTimeout( resolve, milliseconds )
)
