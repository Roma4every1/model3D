// module pixelPerMeter

var _ = require( "lodash" )

module.exports = _.once( () => {
	var pxpcm = document.createElement( "div" )
	var sampleSizeInCm = 20

	pxpcm.style.width = pxpcm.style.height = sampleSizeInCm + "cm"
	pxpcm.style.position = "fixed"

	document.body.appendChild( pxpcm )
	try {
		return pxpcm.clientWidth * ( 100 / sampleSizeInCm )
	}
	finally {
		document.body.removeChild( pxpcm )
	}
} )
