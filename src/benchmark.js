const mapper = require('./index');
const prettyHrtime = require('pretty-hrtime');

const mapObj =
  [
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

for (let i = 0; i < 10000000; i++) {
  map.map(srcObj);
}

const elapsed = process.hrtime(start);

console.log(prettyHrtime(elapsed));

