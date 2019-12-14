import prettyHrtime from 'pretty-hrtime';
import { createMapper } from '../../src/index';

function basicMap() {
  const mapObj = [{ oldName: 'newName' }];

  const srcObj = {
      oldName: 'alpha'
  };

  const map = createMapper(mapObj);

  const start = process.hrtime();

  for (let i = 0; i < 10000000; i += 1) {
      map.map(srcObj);
  }

  const elapsed = process.hrtime(start);

  console.log(`basic map: ${prettyHrtime(elapsed)}`);
}

function dotNotation() {
  const mapObj = [{ oldName: 'newName' }, { 'sub.deep': 'shallow' }];

  const srcObj = {
      oldName: 'alpha',
      sub: {
          deep: 'beta',
      },
  };

  const map = createMapper(mapObj);

  const start = process.hrtime();

  for (let i = 0; i < 10000000; i += 1) {
      map.map(srcObj);
  }

  const elapsed = process.hrtime(start);

  console.log(`dot notation: ${prettyHrtime(elapsed)}`);
}

basicMap();
dotNotation();
