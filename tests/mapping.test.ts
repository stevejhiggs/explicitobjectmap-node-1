import 'jest';

import explicitMapper from '../src/index';

describe('for a single object', () => {
    it("shouldn't break when given a null object", () => {
        const mapObj = ['MyField'];
        const srcObj = null;

        const mapper = explicitMapper(mapObj);
        const dstObj = mapper.map(srcObj);

        expect(dstObj).toBe(null);
    });

    describe('and a mapping consisting of simple copies', () => {
        const mapObj = ['simpleA', 'simpleC', 'falsy'];

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
            expect(dstObj.simpleA).toBe('alpha');
            expect(dstObj.simpleC).toBe('charlie');
        });

        it('shouldnt copy mapped fields that exist to the destination', () => {
            expect(dstObj.simpleB).not.toBeDefined;
        });

        it('shouldnt copy fields that do not exist in the map', () => {
            expect(dstObj.simpleD).not.toBeDefined;
        });

        it('should copy falsy fields', () => {
            expect(dstObj.falsy).not.toEqual(undefined);
        });
    });

    describe('and a mapping consisting of field aliases', () => {
        const mapObj = [{ oldName: 'newName' }, { 'sub.deep': 'shallow' }];

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
            expect(dstObj.newName).toEqual('alpha');
        });

        it('should handle dot notation in the source field', () => {
            expect(dstObj.shallow).toEqual('beta');
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
            expect(dstObj.complexnewname).toBeDefined;
        });

        it('should run the custom transform', () => {
            expect(dstObj.complexnewname).toEqual('ALPHA');
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
            expect(dstObj.Custom).toEqual('fish');
        });
    });
});

describe('for an array of objects', () => {
    const mapObj = [{ simpleA: 'SimpleB' }];

    const srcObj: any = {
        simpleA: 'alpha',
    };

    let dstObj: any = {};

    beforeEach(() => {
        const mapper = explicitMapper(mapObj);
        dstObj = mapper.map([srcObj, srcObj]);
    });

    it('should map all elements of the array', () => {
        expect(dstObj.length).toEqual(2);
        expect(dstObj[1].SimpleB).toEqual('alpha');
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
        expect(dstObj.complexnewname).toEqual('oldValLOAF');
    });

    it('it should pass the mapping options to a post mapping function', () => {
        expect(dstObj.Custom).toEqual('haddock');
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
        expect(dstObj.simpleA).toEqual('alpha');
    });

    it('it should map the composite field using the supplied mapper', () => {
        expect(dstObj.newInternalObject.newSimpleB).toEqual('beta');
    });
});
