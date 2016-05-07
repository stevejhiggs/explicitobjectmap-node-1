'use strict';

const _ = require('lodash');

const copyVal = (src, dst, srcName, dstName) => {
  const val = src[srcName];
  if (val !== undefined) {
    dst[dstName] = src[srcName];
    return true;
  }

  return false;
};

const getObjectViaDotNotation = (name, context) => {
  const parts = name.split('.');
  const p = parts.pop();

  for (let i = 0, j; context && (j = parts[i]); i++) {
    context = (j in context ? context[j] : context[j] = {});
  }
  return context && p ? (context[p]) : undefined; // Object
};

const copyValWithDotNotation = (src, dst, srcName, dstName) => {
  const val = getObjectViaDotNotation(srcName, src);
  if (val !== undefined) {
    dst[dstName] = val;
    return true;
  }

  return false;
};

const createFunctionCallListFromMapStructure = (mapObj) => {
  const mappingFunctionCalls = [];
  const postMapFunctionCalls = [];

  mapObj.forEach((elem) => {
    if (_.isString(elem)) {
      mappingFunctionCalls.push({
        srcName: elem,
        dstName: elem,
        transform: copyVal,
      });
    } else if (_.isFunction(elem)) {
      postMapFunctionCalls.push(elem);
    } else if (_.isObject(elem)) {
      let srcName;
      let dstName;

      if (elem.srcName) {
        srcName = elem.srcName;
      }
      if (elem.dstName) {
        dstName = elem.dstName;
      } else {
        srcName = Object.keys(elem)[0];
        dstName = elem[srcName];
      }

      if (srcName.indexOf('.') > 0) {
        mappingFunctionCalls.push({
          srcName,
          dstName,
          transform: copyValWithDotNotation,
          customTransform: elem.customTransform,
          mapper: elem.mapper,
        });
      } else if (srcName && dstName) {
        mappingFunctionCalls.push({
          srcName,
          dstName,
          transform: copyVal,
          customTransform: elem.customTransform,
          mapper: elem.mapper,
        });
      }
    }
  });

  return {
    mappingCalls: mappingFunctionCalls,
    postMapCalls: postMapFunctionCalls,
  };
};

const applyAllMappingFunctionCallsToObject = (srcObj, mapFunctionCalls, options) => {
  const dst = {};

  for (let functionCallIndex = 0; functionCallIndex < mapFunctionCalls.length; functionCallIndex++) {
    const transformBlock = mapFunctionCalls[functionCallIndex];

    if (transformBlock.transform(srcObj, dst, transformBlock.srcName, transformBlock.dstName)) {
      if (transformBlock.customTransform) {
        dst[transformBlock.dstName] = transformBlock.customTransform(srcObj, dst[transformBlock.dstName], options);
      } else if (transformBlock.mapper) {
        dst[transformBlock.dstName] = transformBlock.mapper.map(srcObj[transformBlock.srcName], options);
      }
    }
  }

  return dst;
};

const applyPostMapFunctionCallsToObject = (srcObj, dstObj, postMapFunctionCalls, options) => {
  for (let functionCallIndex = 0; functionCallIndex < postMapFunctionCalls.length; functionCallIndex++) {
    const postMapFunction = postMapFunctionCalls[functionCallIndex];
    postMapFunction(srcObj, dstObj, options);
  }
};

const createMappedObject = (srcArr, mapFunctionCalls, postMapFunctionCalls, options) => {
  const dstArr = [];

  for (let srcIndex = 0; srcIndex < srcArr.length; srcIndex++) {
    const mappedObject = applyAllMappingFunctionCallsToObject(
      srcArr[srcIndex],
      mapFunctionCalls,
      options
    );

    applyPostMapFunctionCallsToObject(
      srcArr[srcIndex],
      mappedObject,
      postMapFunctionCalls,
      options
    );

    dstArr.push(mappedObject);
  }

  return dstArr;
};

module.exports = (mapping) => {
  const functionCalls = createFunctionCallListFromMapStructure(mapping);

  return {
    map: (srcObj, options) => {
      if (!srcObj) {
        return null;
      }

      if (Array.isArray(srcObj)) {
        return createMappedObject(
          srcObj,
          functionCalls.mappingCalls,
          functionCalls.postMapCalls,
          options
        );
      }

      return createMappedObject(
        [srcObj],
        functionCalls.mappingCalls,
        functionCalls.postMapCalls,
        options
      )[0];
    },
  };
};
