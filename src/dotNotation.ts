const getObjectViaDotNotation = (fieldArray: string[], context: any | undefined): any => {
    return fieldArray.reduce((o, i) => o[i], context);
};

const fastCopyValWithDotNotation = (fieldArray: string[], src, dst, srcName: string, dstName: string): boolean => {
    const val = getObjectViaDotNotation(fieldArray, src);
    if (val !== undefined) {
        dst[dstName] = val;
        return true;
    }

    return false;
};

export const precomputeCopyValWithDotNotation = (srcName: string): Function => {
    // build an array of fields to walk down
    const fieldArray = srcName.split('.');
    return fastCopyValWithDotNotation.bind(this, fieldArray);
};
