var _ = require("lodash");
var explicitmapper = require('./src/index');

var srcObj = {
	simpleA: 'alpha',
	oldname: 'changedName',
	deep: {
		childA: 'wah'
	},
	complexoldname: 'shouldbeupper'
};

var scrObjs = [];
for (var i = 0; i <= 1000000; i++)
{
	scrObjs.push(srcObj);
}

var mapObj = 
	[
		'simpleA',
		{'oldname':'newname'},
	];

var srcObj = {
	simpleA: 'alpha',
	oldname: 'changedName'
};

var mapper = ObjectMapper(mapObj);
var dstObj = mapper.map(scrObj);


console.log(JSON.stringify(dstObjs[0]));




var mapObj = 
	[
		'simpleA',
		'simpleB',
		'simpleC',
		'simpleD',
		{'oldname':'newname'},
	]

var mapper = ObjectMapper(mapObj);
console.time("mapper");
var dstObjs = mapper.map(scrObjs);
console.timeEnd("mapper");

console.log(JSON.stringify(dstObjs[0]));





