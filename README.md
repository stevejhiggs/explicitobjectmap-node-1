explicit-object-mapper
======================

Map named fields from one json object to another with optional transforms. Any fields not named in the map will not be copied to the destination object

Mappings consist of a simple javascript array containing mapping instructions:

	[
		'simpleA', //will just copy accross the field
		'simpleB',
		'simpleC',
		'simpleD',
		{'oldname':'newname'}, //will rename the field from oldname to newname
		{	//will rename the field then run the custom tranform on the result
			srcName:'complexoldname',
			dstName:'complexnewname',
			customTransform: function (srcObj, val){
				return val.toUpperCase();
			}
		},
		{'deep.childA': 'baby'} //dot notation is currently only supported when renaming fields
	]
	
### Installation
	npm install explicit-object-mapper

### usage

	var explicitObjectMapper = require('explicit-object-mapper');
	
	var mapObj = 
	[
		'simpleA',
		{'oldname':'myVal'},
	];

	var srcObj = {
		simpleA: 'alpha',
		oldname: 'changedName'
	};

	var mapper = explicitObjectMapper(mapObj);
	var dstObj = mapper.map(scrObj);
	
The output from the above would be:

	{
		simpleA: 'alpha',
		changedName: 'myVal'
	}
	

If an array of objects is passed in then all objects will be mapped and returned in an array.

### speed
There is some overhead to the mapping process depending on map size and the amount of source data; this can be mitigated a little by creating the mappings ahead of time and reusing them.