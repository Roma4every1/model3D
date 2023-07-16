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

export function loadImageData(data, contentType) {
  if (data instanceof Array) data = new Uint8Array(data);
  const url = URL.createObjectURL(new Blob([data], {type: contentType}))
  const fin = () => { URL.revokeObjectURL(url); };

  const ret = new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = () => { resolve(image); };
    image.onerror = reject;
  });

  ret.then(fin).catch(fin);
  return ret;
}
