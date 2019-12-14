import 'mocha';

import assert from 'assert';
import explicitMapper from '../src/index';

describe('for a single object', () => {
  it('shouldn\'t break when given a null object', () => {
    const mapObj = ['MyField'];
    const srcObj = null;

    const mapper = explicitMapper(mapObj);
    const dstObj = mapper.map(srcObj);

    assert(dstObj === null);
  });

  describe('and a mapping consisting of simple copies', () => {
    const mapObj = [
      'simpleA',
      'simpleC',
      'falsy',
    ];

    const srcObj: any = {
      simpleA: 'alpha',
      simpleB: 'bravo',
      simpleC: 'charlie',
      simpleD: 'delta',
      falsy: false,
    };

    let dstObj: any = {};

    beforeEach(() => {
      const mapper = explicitMapper(mapObj);
      dstObj = mapper.map(srcObj);
    });

    it('should copy mapped fields that exist to the destination', () => {
      assert(dstObj.simpleA === 'alpha');
      assert(dstObj.simpleC === 'charlie');
    });

    it('shouldnt copy mapped fields that exist to the destination', () => {
      assert(!dstObj.simpleB);
    });

    it('shouldnt copy fields that do not exist in the map', () => {
      assert(!dstObj.simpleD);
    });

    it('should copy falsy fields', () => {
      assert(dstObj.falsy !== undefined);
    });
  });

  describe('and a mapping consisting of field aliases', () => {
    const mapObj = [
      { oldName: 'newName' },
      { 'sub.deep': 'shallow' },
    ];

    const srcObj: any = {
      oldName: 'alpha',
      sub: {
        deep: 'beta',
      },
    };

    let dstObj: any = {};

    beforeEach(() => {
      const mapper = explicitMapper(mapObj);
      dstObj = mapper.map(srcObj);
    });

    it('should map the old field to the new field', () => {
      assert(dstObj.newName === 'alpha');
    });

    it('should handle dot notation in the source field', () => {
      assert(dstObj.shallow === 'beta');
    });
  });

  describe('and a mapping with custom value transforms', () => {
    const mapObj = [
      {
        srcName: 'complexoldname',
        dstName: 'complexnewname',
        customTransform: (srcObj, val) => {
          return val.toUpperCase();
        },
      },
    ];

    const srcObj: any = {
      complexoldname: 'alpha',
    };

    let dstObj: any = {};

    beforeEach(() => {
      const mapper = explicitMapper(mapObj);
      dstObj = mapper.map(srcObj);
    });

    it('should map the old field to the new field', () => {
      assert(dstObj.complexnewname);
    });

    it('should run the custom transform', () => {
      assert(dstObj.complexnewname === 'ALPHA');
    });
  });

  describe('and a mapping with post mapping transforms', () => {
    const mapObj = [
      'fieldA',
      (srcObj, dstObj) => {
        dstObj.Custom = 'fish';
      },
    ];

    const srcObj: any = {
      fieldA: 'alpha',
    };

    let dstObj: any = {};

    beforeEach(() => {
      const mapper = explicitMapper(mapObj);
      dstObj = mapper.map(srcObj);
    });

    it('should run the custom transform', () => {
      assert(dstObj.Custom === 'fish');
    });
  });
});

describe('for an array of objects', () => {
  const mapObj = [
    { simpleA: 'SimpleB' },
  ];

  const srcObj: any = {
    simpleA: 'alpha',
  };

  let dstObj: any = {};

  beforeEach(() => {
    const mapper = explicitMapper(mapObj);
    dstObj = mapper.map([srcObj, srcObj]);
  });

  it('should map all elements of the array', () => {
    assert(dstObj.length === 2);
    assert(dstObj[1].SimpleB === 'alpha');
  });
});

describe('for a single object and given custom mapping args', () => {
  const mapObj = [
    {
      srcName: 'complexoldname',
      dstName: 'complexnewname',
      customTransform: (srcObj, val, options) => {
        return val + options.breadVal.toUpperCase();
      },
    },
    (srcObj, dstObj, options) => {
      dstObj.Custom = options.fishVal;
    },
  ];

  const srcObj: any = {
    simpleA: 'alpha',
    complexoldname: 'oldVal',
  };

  let dstObj: any = {};

  beforeEach(() => {
    const mapper = explicitMapper(mapObj);
    dstObj = mapper.map(srcObj, { fishVal: 'haddock', breadVal: 'loaf' });
  });

  it('it should pass the mapping options to a custom element mapping function', () => {
    assert(dstObj.complexnewname === 'oldValLOAF');
  });

  it('it should pass the mapping options to a post mapping function', () => {
    assert(dstObj.Custom === 'haddock');
  });
});


describe('for a single object and given a mapper to map composite objects', () => {
  const internalMap = [{ simpleB: 'newSimpleB' }];
  const mapObj = [
    'simpleA',
    {
      srcName: 'internalObject',
      dstName: 'newInternalObject',
      mapper: explicitMapper(internalMap),
    },
  ];

  const srcObj: any = {
    simpleA: 'alpha',
    internalObject: {
      simpleB: 'beta',
    },
  };

  let dstObj: any = {};

  beforeEach(() => {
    const mapper = explicitMapper(mapObj);
    dstObj = mapper.map(srcObj);
  });

  it('it should map other fields as normal', () => {
    assert(dstObj.simpleA === 'alpha');
  });

  it('it should map the composite field using the supplied mapper', () => {
    assert(dstObj.newInternalObject.newSimpleB === 'beta');
  });
});
