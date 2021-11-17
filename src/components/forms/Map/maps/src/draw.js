"use strict"

window.Drawer = module.exports

module httpClient from "./httpClient"
module startThread from "./startThread"
module drawer from "./mapDrawer"
module geom from "./geom"
module htmlHelper from "./htmlHelper"
module pixelPerMeter from "./pixelPerMeter"
module logger from "./logger"

export var logger

var devicePixelRatio = window.devicePixelRatio || 1

function updateCanvasSize( canvas ) {
	canvas.width = canvas.clientWidth * devicePixelRatio || 0
	canvas.height = canvas.clientHeight * devicePixelRatio || 0
}

function loadMapData( name ) { return startThread( function* loadDataThread() {
	logger.info( "loading map data", name )

	// var [ ret, info ] = yield Promise.all( [
	// 	httpClient.getJSON( `/maps/Containers/${ name }.json` ),
	// 	httpClient.getJSON( `/maps/Containers/${ name }ContainerInfo.json` ),
	// ] )
	// ret.info = info

	var ret = yield httpClient.getJSON( `/maps/Containers/${ name }.json` )
	logger.info( "loaded map data", name, ret )
	return ret
} ) }

export function loadMap( path ) { return startThread( function* loadMapThread() {
	logger.info( "loading map", path )
	if ( typeof path != "string" )
		path = path.PATH
	var ret = yield httpClient.getJSON( `/maps${ path }` )
	var coll = {}
	var loadData = name => coll[ "_" + name ]
		|| ( coll[ "_" + name ] = loadMapData( name ) )
	ret.namedpointsContainer = ret.namedpoints
	ret.namedpoints = loadData( ret.namedpointsContainer )
		.then( data => data.namedpoints )
		.catch( error => {
			logger.error( "error loading named points from",
				ret.namedpointsContainer, error )
			return []
		} )
	for ( let layer of ret.layers ) {
		let name = layer.container
		layer.data =
			loadData( layer.container )
			.then( data => data.layers[ layer.uid ].elements )
			.catch( error => {
				logger.error( "error loading",
					layer.name, "/", layer.uid,
					"from", layer.container,
					error )
				return []
			} )
	}
	logger.info( "loaded map", path, ret )
	return ret
} ) }

export var mapInfo = httpClient.getJSON( "/maps/mapinfo.json" )

var RESOLVED = Promise.resolve()

export function showMap( canvas, map, { scale, centerx, centery, idle } = {} ) {
	gard.flag = canvas.mapDrawCycle = {}
	function gard() {
		if ( gard.flag !== canvas.mapDrawCycle )
			throw new Error( "stop" )
		if ( idle )
			idle()
		return RESOLVED
	}
	htmlHelper.onElementSize( canvas, canvas => {
		gard()

		updateCanvasSize( canvas )

		var dotsPerMeter = canvas.width / ( canvas.clientWidth / pixelPerMeter() )
		var cx = canvas.width / 2
		var cy = canvas.height / 2

		if ( centerx == null ) {
			var bounds = geom.rects.join( ...map.layers.map( layer => layer.bounds ) )
			if ( !bounds ) {
				if ( !scale )
					scale = 5000
				centerx = 0
				centery = 0
			}
			else {
				if ( !scale )
					scale = 1.05 * Math.max(
						( bounds.max.x - bounds.min.x ) / ( canvas.width / dotsPerMeter ),
						( bounds.max.y - bounds.min.y ) / ( canvas.height / dotsPerMeter )
					)
				centerx = ( bounds.min.x + bounds.max.x ) / 2
				centery = ( bounds.min.y + bounds.max.y ) / 2
			}
		}

		var context = canvas.getContext( "2d" )
		context.fillStyle = "white"
		context.fillRect( 0, 0, canvas.width, canvas.height, "white" )

		drawer.startPaint( canvas, map, {
			dotsPerMeter,
			pixelRatio: devicePixelRatio,
			scale,
			centerx,
			centery,
			onIdle: gard,
		} )
		.catch( logger.error )
	} )
}

