// module htmlHelper

var logger = require("./logger");

export function onElementSize(element, proc) {
	var width, height, timeout
	var canRun = true;
	function run() {
		timeout = setTimeout(check, 100)
	}
	function check() {
		timeout = null
		var newWidth = element.clientWidth
		var newHeight = element.clientHeight
		if (width !== newWidth || height !== newHeight) {
			proc(element, newWidth, newHeight, width, height)
			width = newWidth
			height = newHeight
		}
		if (canRun) {
			run();
		}
	}
	check()
	return {
		stop: () => {
			timeout && clearTimeout(timeout)
			canRun = false;
		}
	}
}

export function loadImage(url) {
	return new Promise((resolve, reject) => {
		logger.info("loading image from the url", url)
		var image = new Image()
		image.src = url
		image.onload = () => {
			resolve(image)
		}
		image.onerror = (error) => {
			logger.warn("image was not loaded from the url", url, error)
			reject(error)
		}
	})
}

var USE_BLOB_URLS = Boolean( URL && URL.createObjectURL )

export function makeDataUrl(data, contentType) {
	if (USE_BLOB_URLS) {
		if (data instanceof Array)
			data = new Uint8Array(data)
		var url = URL.createObjectURL(new Blob([data], { type: contentType }))
		logger.info("object url allocated", url)
		return url
	}
	else
		throw new Error("todo: branch with plain 'data:' scheme for old browsers")
}

export function deleteDataUrl(url) {
	if (USE_BLOB_URLS) {
		logger.info("object url deleted", url)
		URL.revokeObjectURL(url)
	}
	else { }
}

export function withDataUrl(data, contentType, fun) {
	var url = makeDataUrl(data, contentType)
	function fin() {
		deleteDataUrl(url)
	}
	var ret = fun(url)
	ret.then(fin).catch(fin)
	return ret
}

export function loadImageData(data, contentType) {
	return withDataUrl(data, contentType, loadImage)
}

export function copyImage(image) {
	var ret = document.createElement("canvas")
	ret.width = image.width
	ret.height = image.height
	ret.getContext("2d").drawImage(image, 0, 0)
	return ret
}
