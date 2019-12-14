import isString from 'lodash.isstring';
import isFunction from 'lodash.isfunction';
import isObject from 'lodash.isobject';

import { precomputeCopyValWithDotNotation } from './dotNotation';

const copyVal = (src, dst, srcName, dstName) => {
    const val = src[srcName];
    if (val !== undefined) {
        dst[dstName] = src[srcName];
        return true;
    }

    return false;
};

const createFunctionCallListFromMapStructure = mapObj => {
    const mappingFunctionCalls = [];
    const postMapFunctionCalls = [];

    mapObj.forEach((elem: any) => {
        if (isString(elem)) {
            mappingFunctionCalls.push({
                srcName: elem,
                dstName: elem,
                transform: copyVal,
            });
        } else if (isFunction(elem)) {
            postMapFunctionCalls.push(elem);
        } else if (isObject(elem)) {
            let srcName: any;
            let dstName: any;

            if ((elem as any).srcName) {
                srcName = (elem as any).srcName;
            }
            if ((elem as any).dstName) {
                dstName = (elem as any).dstName;
            } else {
                // eslint-disable-next-line prefer-destructuring
                srcName = Object.keys(elem)[0];
                dstName = elem[srcName];
            }

            if (srcName.indexOf('.') > 0) {
                mappingFunctionCalls.push({
                    srcName,
                    dstName,
                    transform: precomputeCopyValWithDotNotation(srcName),
                    customTransform: (elem as any).customTransform,
                    mapper: (elem as any).mapper,
                });
            } else if (srcName && dstName) {
                mappingFunctionCalls.push({
                    srcName,
                    dstName,
                    transform: copyVal,
                    customTransform: (elem as any).customTransform,
                    mapper: (elem as any).mapper,
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

    for (let functionCallIndex = 0; functionCallIndex < mapFunctionCalls.length; functionCallIndex += 1) {
        const transformBlock = mapFunctionCalls[functionCallIndex];

        if (transformBlock.transform(srcObj, dst, transformBlock.srcName, transformBlock.dstName)) {
            if (transformBlock.customTransform) {
                dst[transformBlock.dstName] = transformBlock.customTransform(
                    srcObj,
                    dst[transformBlock.dstName],
                    options,
                );
            } else if (transformBlock.mapper) {
                dst[transformBlock.dstName] = transformBlock.mapper.map(srcObj[transformBlock.srcName], options);
            }
        }
    }

    return dst;
};

const applyPostMapFunctionCallsToObject = (srcObj, dstObj, postMapFunctionCalls, options) => {
    for (let functionCallIndex = 0; functionCallIndex < postMapFunctionCalls.length; functionCallIndex += 1) {
        const postMapFunction = postMapFunctionCalls[functionCallIndex];
        postMapFunction(srcObj, dstObj, options);
    }
};

const createMappedObject = (srcArr, mapFunctionCalls, postMapFunctionCalls, options) => {
    const dstArr = [];

    for (let srcIndex = 0; srcIndex < srcArr.length; srcIndex += 1) {
        const mappedObject = applyAllMappingFunctionCallsToObject(srcArr[srcIndex], mapFunctionCalls, options);

        applyPostMapFunctionCallsToObject(srcArr[srcIndex], mappedObject, postMapFunctionCalls, options);

        dstArr.push(mappedObject);
    }

    return dstArr;
};

export default function(mapping) {
    const functionCalls = createFunctionCallListFromMapStructure(mapping);

    return {
        map: (srcObj, options?) => {
            if (!srcObj) {
                return null;
            }

            if (Array.isArray(srcObj)) {
                return createMappedObject(srcObj, functionCalls.mappingCalls, functionCalls.postMapCalls, options);
            }

            return createMappedObject([srcObj], functionCalls.mappingCalls, functionCalls.postMapCalls, options)[0];
        },
    };
}
