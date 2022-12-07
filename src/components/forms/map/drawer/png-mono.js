import PNGlib from "./pnglib";
import parseColor from "parse-color";


export default function pngMono(matrix, color, backColor) {
	const p = new PNGlib(matrix[0].length, matrix.length, 256);

	const foreground = p.color(...parseColor(color).rgb);
	const background = !backColor || backColor === 'none'
		? p.color(0, 0, 0, 0)
		: p.color(...parseColor(backColor).rgb);

	for (let x = 0; x < 32; ++x)
		for (let y = 0; y < 32; ++y)
			p.buffer[p.index(x, y)] = matrix[y][x] ? foreground : background;

	return [].map.call(p.getDump(), c => c.charCodeAt(0) & 255);
}
