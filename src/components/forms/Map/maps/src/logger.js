// module logger

var count = 0;

function Logger( name, parent ) {
	this.name = name;
	this.parent = parent;
	this.threadId = count && `<${ count }>`;
	++count;

	levels.forEach( ( levelName, levelValue ) => {
		this[ levelName ] = function ( data ) {
			if ( levelValue >= levelValues[ logger.level ] )
				this.send( levelName, this.name, this.threadId, arguments );
			return data;
		}.bind( this ); // keep in mind using "arguments"
	} );
}

Logger.prototype.createLogger = function ( name ) {
	return new Logger( name || this.name, this );
};

Logger.prototype.send = function ( level, name, threadId, data ) {
	//return this.parent.send( level, name, threadId, data );
};

const levelValues = {
	all: -Infinity,
	silent: Infinity,
};

var levels = [
	"trace",
	"debug",
	"info",
	"warn",
	"error",
	"fatal"
];

levels.forEach( ( levelName, levelValue ) => {
	levelValues[ levelName ] = levelValue;
} );

var logger = module.exports = new Logger();

logger.level = "debug";

logger.send = function ( level, name, threadId, data ) {
	//var msg = Array.from( data );
	//if ( threadId )
	//	msg.unshift( threadId );
	//if ( name )
	//	msg.unshift( name );
	////cons[ level ]( ...msg )
	//console[level](...msg);
};
