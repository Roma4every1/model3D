const title = 'Element 1.0\r\n\x1A\x20\x00\x20\x00\x00';
const titleLength = title.length;
const titleBytes = [].slice.call(title).map(c => c.charCodeAt(0)) + '';


export default function parseSMB(data) {
	if ([].slice.call(data, 0, titleLength) + '' !== titleBytes)
		throw new Error('not a SMB format');

	const ret = [];
	let index = titleLength;

	while (index < data.length) {
		const matrix = [];

		for (let y = 0; y < 32; ++y) {
			matrix[y] = [];

			for (let b = 0; b < 4; ++b) {
				let code = data[index++];

				for (let i = 0; i < 8; ++i) {
					matrix[y][b * 8 + i] = (code & 128) >> 7;
					code <<= 1;
				}
			}
		}
		ret.push(matrix);
	}
	return ret;
}
