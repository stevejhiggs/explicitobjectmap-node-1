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

	mapObj.forEach(function(elem){
		if (_.isString(elem)){
			mappingFunctionCalls.push({
				srcName: elem,
				dstName: elem,
				transform: copyVal
			});
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

	return mappingFunctionCalls;
}

function applyAllFunctionCallsToObject(srcObj, mapFunctionCalls){
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

function createMappedObject(srcArr, mapFunctionCalls){
    var dstArr = [];

    for(var srcIndex = 0; srcIndex < srcArr.length; srcIndex++){
        dstArr.push(applyAllFunctionCallsToObject(srcArr[srcIndex], mapFunctionCalls));
    }

    return dstArr;
}

module.exports = function(mapping){
	var mapFuctionCalls = createFunctionCallListFromMapStructure(mapping);

	return {
        map: function(srcObj) {
        	if (Array.isArray(srcObj)){
        		return createMappedObject(srcObj, mapFuctionCalls);
        	} else {
        		return createMappedObject([srcObj], mapFuctionCalls)[0];
        	}
        }
    };
};