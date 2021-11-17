// module getlayer

var fs = require("fs");
var transform = require("./gsTransform");

var root = "./www/maps/";

function readdirSync(dir) {
	return fs.readdirSync(dir).map(d => `${dir}/${d}`)
}

var files = [`${root}Containers`, ...readdirSync(`${root}Maps`)].map(d => readdirSync(d))
	.filter(f => f.match(/\.xml$/));

for ( var file of files ) transformFile(
	file,
	file.replace( /\.xml$/, ".json" ),
	transform.readXml
)

transformFile(
	`${ root }mapinfocache.json`,
	`${ root }mapinfo.json`,
	transform.readTable
)

function transformFile(source, dest, transformer) {
	console.log(source)
	var text = transformer(fs.readFileSync(source, "utf8"))
	if (typeof text != "string")
		text = JSON.stringify(text, null, "\t")
	fs.writeFile(dest, text)
}
