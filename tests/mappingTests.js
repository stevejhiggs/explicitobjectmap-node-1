var assert = require('assert'),
	explicitMapper = require('../src/index')

describe('for a single object', function(){

	describe('and a mapping consisting of simple copies', function(){
		var mapObj = 
		[
			'simpleA',
			'simpleC'
		];

		var srcObj = {
			simpleA: 'alpha',
			simpleB: 'bravo',
			simpleC: 'charlie',
			simpleD: 'delta'
		};

		var dstObj = {};

		beforeEach(function(){
			var mapper = explicitMapper(mapObj);
			dstObj = mapper.map(srcObj);
		});

		it('should copy mapped fields that exist to the destination', function(){
            assert(dstObj.simpleA === 'alpha');
            assert(dstObj.simpleC === 'charlie');
        });

        it('shouldnt copy mapped fields that exist to the destination', function(){
            assert(!dstObj.simpleB);
        });

        it('shouldnt copy fields that do not exist in the map', function(){
            assert(!dstObj.simpleD);
        });
	});

	describe('and a mapping consisting of field aliases', function(){
		var mapObj = 
		[
			{'oldName' : 'newName'},
			{'sub.deep' : 'shallow'}
		];

		var srcObj = {
			oldName: 'alpha',
			sub: {
				deep: 'beta'
			}
		};

		var dstObj = {};

		beforeEach(function(){
			var mapper = explicitMapper(mapObj);
			dstObj = mapper.map(srcObj);
		});

		it('should map the old field to the new field', function(){
            assert(dstObj.newName === 'alpha');
        });

        it('should handle dot notation in the source field', function(){
            assert(dstObj.shallow === 'beta');
        });
	});

	describe('and a mapping with custom transforms', function(){
		var mapObj = 
		[
			{
				srcName:'complexoldname',
				dstName:'complexnewname',
				customTransform: function (srcObj, val){
					return val.toUpperCase();
				}
			}
		];

		var srcObj = {
			complexoldname: 'alpha',
		};

		var dstObj = {};

		beforeEach(function(){
			var mapper = explicitMapper(mapObj);
			dstObj = mapper.map(srcObj);
		});

		it('should map the old field to the new field', function(){
            assert(dstObj.complexnewname);
        });

        it('should run the custom transform', function(){
            assert(dstObj.complexnewname === 'ALPHA');
        });
	});
});

describe('for an array of objects', function(){
	var mapObj = 
		[
			{'simpleA': 'SimpleB'},
		];

		var srcObj = {
			simpleA: 'alpha'
		};

		var dstObj = {};

		beforeEach(function(){
			var mapper = explicitMapper(mapObj);
			dstObj = mapper.map([srcObj, srcObj]);
		});

		it('should map all elements of the array', function(){
            assert(dstObj.length === 2);
            assert(dstObj[1].SimpleB === 'alpha')
        });
});