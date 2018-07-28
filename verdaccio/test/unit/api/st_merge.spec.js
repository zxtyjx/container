let assert = require('assert');
let semverSort = require('../../../src/lib/utils').semverSort;
import {mergeVersions} from '../../../src/lib/metadata-utils';

require('../../../src/lib/logger').setup([]);

describe('Storage._merge_versions versions', () => {

  test('simple', () => {
    let pkg = {
      'versions': {a: 1, b: 1, c: 1},
      'dist-tags': {},
    };

    mergeVersions(pkg, {versions: {a: 2, q: 2}});

    assert.deepEqual(pkg, {
      'versions': {a: 1, b: 1, c: 1, q: 2},
      'dist-tags': {},
    });
  });

  test('dist-tags - compat', () => {
    let pkg = {
      'versions': {},
      'dist-tags': {q: '1.1.1', w: '2.2.2'},
    };

    mergeVersions(pkg, {'dist-tags': {q: '2.2.2', w: '3.3.3', t: '4.4.4'}});

    assert.deepEqual(pkg, {
      'versions': {},
      'dist-tags': {q: '2.2.2', w: '3.3.3', t: '4.4.4'},
    });
  });

  test('dist-tags - staging', () => {

    let pkg = {
      versions: {},
      // we've been locally publishing 1.1.x in preparation for the next
      // public release
      'dist-tags': {q:'1.1.10',w:'2.2.2'},
    };
    // 1.1.2 is the latest public release, but we want to continue testing
    // against our local 1.1.10, which may end up published as 1.1.3 in the
    // future

    mergeVersions(pkg, {'dist-tags':{q:'1.1.2',w:'3.3.3',t:'4.4.4'}})

    assert.deepEqual(pkg, {
      versions: {},
      'dist-tags': {q:'1.1.10',w:'3.3.3',t:'4.4.4'},
    });

  });

  test('semverSort', () => {

    assert.deepEqual(semverSort(['1.2.3', '1.2', '1.2.3a', '1.2.3c', '1.2.3-b']),
    ['1.2.3a',
      '1.2.3-b',
      '1.2.3c',
      '1.2.3']
    );

  });

});

