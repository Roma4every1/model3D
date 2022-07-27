import logger from "./logger";

export function onElementSize(element, proc) {
	let width, height, timeout;
	let canRun = true;

	function run() {
		timeout = setTimeout(check, 100)
	}
	function check() {
		timeout = null
		const newWidth = element.clientWidth;
		const newHeight = element.clientHeight;

		if (width !== newWidth || height !== newHeight) {
			proc(element, newWidth, newHeight, width, height);
			width = newWidth;
			height = newHeight;
		}
		if (canRun) run();
	}
	check()

	return {
		stop: () => {
			timeout && clearTimeout(timeout);
			canRun = false;
		}
	}
}

export function loadImage(url) {
	return new Promise((resolve, reject) => {
		logger.info('loading image from the url', url)
		const image = new Image();
		image.src = url;
		image.onload = () => {resolve(image)};
		image.onerror = (error) => {
			logger.warn('image was not loaded from the url', url, error);
			reject(error);
		}
	});
}

const USE_BLOB_URLS = Boolean(URL && URL.createObjectURL);

export function makeDataUrl(data, contentType) {
	if (USE_BLOB_URLS) {
		if (data instanceof Array) data = new Uint8Array(data);
		const url = URL.createObjectURL(new Blob([data], {type: contentType}));
		logger.info('object url allocated', url)
		return url
	} else throw new Error("todo: branch with plain 'data:' scheme for old browsers");
}

export function deleteDataUrl(url) {
	if (USE_BLOB_URLS) {
		logger.info("object url deleted", url);
		URL.revokeObjectURL(url);
	}
}

export function withDataUrl(data, contentType, fun) {
	const url = makeDataUrl(data, contentType);
	const fin = () => {deleteDataUrl(url)};

	const ret = fun(url);
	ret.then(fin).catch(fin);
	return ret;
}

export function loadImageData(data, contentType) {
	return withDataUrl(data, contentType, loadImage);
}

export function copyImage(image) {
	const canvas = document.createElement('canvas');
	canvas.width = image.width;
	canvas.height = image.height;
	canvas.getContext('2d').drawImage(image, 0, 0);
	return canvas;
}
