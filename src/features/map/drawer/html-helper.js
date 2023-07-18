/** Каждые 100 мс проверяет размеры элемента. */
export function onElementSize(canvas, callback) {
	let width, height, timerID;
	let canRun = true;

	function run() {
		timerID = setTimeout(check, 100);
	}
	function check() {
		timerID = null;
		const newWidth = canvas.clientWidth;
		const newHeight = canvas.clientHeight;

		if (width !== newWidth || height !== newHeight) {
			callback(canvas);
			width = newWidth;
			height = newHeight;
		}
		if (canRun) run();
	}
	check();

	return () => {
    timerID && clearTimeout(timerID);
    canRun = false;
  };
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
