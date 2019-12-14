const getObjectViaDotNotation = (fieldArray, context) => {
  const p = fieldArray.pop();

  for (let i = 0, j; context && (j = fieldArray[i]); i += 1) {
    context = (j in context ? context[j] : context[j] = {});
  }
  return context && p ? (context[p]) : undefined; // Object
};

const fastCopyValWithDotNotation = (fieldArray, src, dst, srcName, dstName) => {
  const val = getObjectViaDotNotation(fieldArray, src);
  if (val !== undefined) {
    dst[dstName] = val;
    return true;
  }

  return false;
};

const precomputeCopyValWithDotNotation = (srcName) => {
  // build an array of fields to walk down
  const fieldArray = srcName.split('.');
  return fastCopyValWithDotNotation.bind(this, fieldArray);
};

module.exports = {
  precomputeCopyValWithDotNotation,
};
