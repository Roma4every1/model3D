// module httpClient

var logger = require("./logger");

export function get(address, encoding) {
	return new Promise((resolve, reject) => {

		logger.info("http", address)

		var xhr = new XMLHttpRequest()
		if (encoding === "binary")
			xhr.responseType = "arraybuffer"
		xhr.onload = () => {
			if (xhr.status === 200) {
				if (encoding === "binary") {
					if (xhr.response != null)
						return done(new Uint8Array(xhr.response))
				}
				else {
					if (xhr.responseText != null)
						return done(xhr.responseText)
				}
				fail("NULL")
			}
			else
				fail(xhr.status + " " + xhr.statusText)
		}
		xhr.ontimeout = () => fail("TIMEOUT")
		xhr.onerror = e => fail(e || "ERROR")
		xhr.open("GET", address)
		xhr.send()

		function done(value) {
			logger.info("http", address, "done")
			resolve(value)
		}

		function fail(value) {
			logger.warn("http failure:", address, value)
			reject(value)
		}

	})
}

export function getJSON(url) {
	return get(url).then(JSON.parse)
}
