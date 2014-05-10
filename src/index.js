"use strict";

var _ = require("lodash");

function copyVal(src, dst, srcName, dstName) {
    var val = src[srcName];
    if (val) {
        dst[dstName] = src[srcName];
    }
}

function getObjectViaDotNotation(name, context){
    var parts=name.split("."), 
    p=parts.pop();
    for(var i=0, j; context && (j=parts[i]); i++){
        context = (j in context ? context[j] : context[j]={});
    }
    return context && p ? (context[p]) : undefined; // Object
}

function copyValWithDotNotation(src, dst, srcName, dstName){
	var val = getObjectViaDotNotation(srcName, src);
	if (val) {
		dst[dstName] = val;
	}
}

function createFunctionCallListFromMapStructure(mapObj){
	var mappingFunctionCalls = [];
	var postMapFunctionCalls = [];

	mapObj.forEach(function(elem){
		if (_.isString(elem)){
			mappingFunctionCalls.push({
				srcName: elem,
				dstName: elem,
				transform: copyVal
			});
		}
        else if (_.isFunction(elem)){
            postMapFunctionCalls.push(elem);
        }
		else if (_.isObject(elem)){
			var srcName;
			var dstName;

			if (elem.srcName){
                srcName = elem.srcName;
            }
            if (elem.dstName){
				dstName = elem.dstName;
			}
			else{
				srcName = Object.keys(elem)[0];
				dstName = elem[srcName];
			}

			if (srcName.indexOf(".") > 0){
				mappingFunctionCalls.push({
					srcName: srcName,
					dstName: dstName,
					transform: copyValWithDotNotation,
					customTransform: elem.customTransform
				});
			}
			else if (srcName && dstName){
				mappingFunctionCalls.push({
					srcName: srcName,
					dstName: dstName,
					transform: copyVal,
					customTransform: elem.customTransform
				});
			}
		}
	});

	return {
		mappingCalls: mappingFunctionCalls,
		postMapCalls: postMapFunctionCalls
	};
}

function applyAllMappingFunctionCallsToObject(srcObj, mapFunctionCalls){
    var dst = {};

    for(var functionCallIndex = 0; functionCallIndex < mapFunctionCalls.length; functionCallIndex++) {
        var transformBlock = mapFunctionCalls[functionCallIndex];

        transformBlock.transform(srcObj, dst, transformBlock.srcName, transformBlock.dstName);
        if (transformBlock.customTransform) {
            dst[transformBlock.dstName] = transformBlock.customTransform(srcObj, dst[transformBlock.dstName]);
        }
    }

    return dst;
}

function applyPostMapFunctionCallsToObject(srcObj, dstObj, postMapFunctionCalls){
	for(var functionCallIndex = 0; functionCallIndex < postMapFunctionCalls.length; functionCallIndex++) {
		var postMapFunction = postMapFunctionCalls[functionCallIndex];
		postMapFunction(srcObj, dstObj);
	}
}

function createMappedObject(srcArr, mapFunctionCalls, postMapFunctionCalls){
    var dstArr = [];

    for(var srcIndex = 0; srcIndex < srcArr.length; srcIndex++){
    	var mappedObject = applyAllMappingFunctionCallsToObject(srcArr[srcIndex], mapFunctionCalls);
    	applyPostMapFunctionCallsToObject(srcArr[srcIndex], mappedObject, postMapFunctionCalls);
        dstArr.push(mappedObject);
    }

    return dstArr;
}

module.exports = function(mapping){
	var functionCalls = createFunctionCallListFromMapStructure(mapping);

	return {
        map: function(srcObj) {
        	if (Array.isArray(srcObj)){
                return createMappedObject(srcObj, functionCalls.mappingCalls, functionCalls.postMapCalls);
        	} else {
        		return createMappedObject([srcObj], functionCalls.mappingCalls, functionCalls.postMapCalls)[0];
        	}
        }
    };
};