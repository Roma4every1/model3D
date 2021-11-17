// module parseSMB

var slice = [].slice;

module.exports = function (data) {
	if (slice.call(data, 0, title.length) + "" !== titleBytes)
		throw new Error("not a SMB format")
	var index = title.length
	var ret = []
	while (index < data.length) {
		var matrix = []
		for (var y = 0; y < 32; ++y) {
			matrix[y] = []
			for (var b = 0; b < 4; ++b) {
				var code = data[index++]
				for (var i = 0; i < 8; ++i) {
					matrix[y][b * 8 + i] = (code & 128) >> 7
					code <<= 1
				}
			}
		}
		ret.push(matrix)
	}
	return ret
}

var title = "Element 1.0\r\n\x1A\x20\x00\x20\x00\x00";
var titleBytes = slice.call(title).map(c => c.charCodeAt(0)) + "";
