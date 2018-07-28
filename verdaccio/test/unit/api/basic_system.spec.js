import endPointAPI from '../../../src/api/index';
import {API_ERROR} from '../../../src/lib/constants';

import express from 'express';
import request from 'request';
import rimraf from 'rimraf';
import config from '../partials/config/index';

const app = express();
const server = require('http').createServer(app);

describe('basic system test', () => {
  let port;

  beforeAll(function(done) {
    rimraf(__dirname + '/store/test-storage', done);
  });

  beforeAll(async function(done) {

    app.use(await endPointAPI(config));

    server.listen(0, function() {
      port = server.address().port;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  test('server should respond on /', done => {
    request({
      url: 'http://localhost:' + port + '/',
    }, function(err, res, body) {
      expect(err).toBeNull();
      expect(body).toMatch(/<title>Verdaccio<\/title>/);
      done();
    });
  });

  test('server should respond on /whatever', done => {
    request({
      url: `http://localhost:${port}/whatever`,
    }, function(err, res, body) {
      expect(err).toBeNull();
      expect(body).toMatch(API_ERROR.NO_PACKAGE);
      done();
    });
  });
});
