export function get(address, encoding) {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		if (encoding === 'binary') xhr.responseType = 'arraybuffer';

		xhr.onload = () => {
			if (xhr.status === 200) {
				if (encoding === 'binary') {
					if (xhr.response !== null) return resolve(new Uint8Array(xhr.response))
				} else {
					if (xhr.responseText !== null) return resolve(xhr.responseText)
				}
				reject('NULL')
			}
			else reject(xhr.status + ' ' + xhr.statusText)
		}

		xhr.ontimeout = () => reject('TIMEOUT');
		xhr.onerror = (e) => reject(e || 'ERROR');
		xhr.open('GET', address);
		xhr.send();
	});
}

export function getJSON(url) {
	return get(url).then(JSON.parse);
}
