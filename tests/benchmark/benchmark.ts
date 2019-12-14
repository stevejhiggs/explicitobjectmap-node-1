import prettyHrtime from 'pretty-hrtime';
import mapper from '../../src/index';

const mapObj = [
  { oldName: 'newName' },
  { 'sub.deep': 'shallow' },
];

const srcObj = {
  oldName: 'alpha',
  sub: {
    deep: 'beta',
  },
};

const map = mapper(mapObj);

const start = process.hrtime();

for (let i = 0; i < 10000000; i += 1) {
  map.map(srcObj);
}

const elapsed = process.hrtime(start);

console.log(prettyHrtime(elapsed));
