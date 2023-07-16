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
		const image = new Image();
		image.src = url;
		image.onload = () => {resolve(image)};
		image.onerror = reject;
	});
}


export function makeDataUrl(data, contentType) {
	if (data instanceof Array) data = new Uint8Array(data);
	return URL.createObjectURL(new Blob([data], {type: contentType}));
}

export function deleteDataUrl(url) {
	URL.revokeObjectURL(url);
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
