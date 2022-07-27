// module getLayer

// import { readdirSync as _readdirSync, readFileSync, writeFile } from "fs";
// import { readXml, readTable } from "./gsTransform";
//
//
// const root = './www/maps/';
//
// function readdirSync(dir) {
// 	return _readdirSync(dir).map(d => `${dir}/${d}`)
// }
//
// const files = [`${root}Containers`, ...readdirSync(`${root}Maps`)]
// 	.map(d => readdirSync(d))
// 	.filter(f => f.match(/\.xml$/));
//
// for (let file of files)
// 	transformFile(file, file.replace(/\.xml$/, '.json'), readXml)
//
// transformFile(`${root}mapinfocache.json`, `${root}mapinfo.json`, readTable)
//
// function transformFile(source, dest, transformer) {
// 	let text = transformer(readFileSync(source, 'utf8'));
// 	if (typeof text !== 'string') text = JSON.stringify(text, null, '\t')
// 	writeFile(dest, text)
// }
