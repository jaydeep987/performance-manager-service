import * as chai from 'chai';
// chai-http is exported as single object (export =)
import chaiHttp = require('chai-http');
import * as express from 'express';
import * as http from 'http';
import * as mocha from 'mocha'; // tslint:disable-line
import * as mongoose from 'mongoose';

import { UserModel } from '../../src/model/user';
import { VirtualMongoServerConnector, pick } from '../test-utils';

import { authenticate, normalizeAddedData, normalizeRecievedData } from './common';

chai.use(chaiHttp);
const assert = chai.assert;

const mockUsers = [
  {
    firstName: 'person1',
    lastName: 'ere',
    sex: 'm',
    role: 'admin',
    userName: 'person1',
    password: '123',
  },
  {
    firstName: 'person2',
    lastName: 'mock',
    sex: 'm',
    role: 'normal',
    userName: 'person2',
    password: 'abc',
  },
];

describe('Test Endpoints for: User', async () => {
  const virtualMongoConnector: VirtualMongoServerConnector = new VirtualMongoServerConnector();
  let addedMockData: mongoose.Document[];
  let app: express.Application;
  let cookie: string[];
  let normalizedAddedData: mongoose.Document[];
  let server: http.Server;

  before(async () => {
    await virtualMongoConnector.connect();

    // load server after we initialize MONGO_URL in config
    app = await new (await import('../../src/app')).App().createApp();
    server = http.createServer(app);

    // fill data
    addedMockData = await UserModel.create(mockUsers);
    normalizedAddedData = normalizeAddedData(addedMockData);

    // authenticate and get cookie
    cookie = await authenticate(server, mockUsers[0].userName, mockUsers[0].password);
  });

  after(async () => {
    await virtualMongoConnector.disconnect();
    server.close();
  });

  describe('Endpoint: /users/', async () => {
    it('should give all users', async () => {
      const response = await chai
        .request(server)
        .get('/users/')
        .set('Cookie', cookie)
        .send();

      assert.strictEqual(response.status, 200);
      assert.deepEqual(normalizeRecievedData(response.body), normalizedAddedData);
    });
  });

  describe('Endpoint: /users/:id', () => {

    it('should give an error if wrong event id passed', async () => {
      const response = await chai
        .request(server)
        .get('/users/wrongid')
        .set('Cookie', cookie)
        .send();

      assert.strictEqual(response.status, 500);
    });

    it('shoud give user by id', async () => {
      const response = await chai
        .request(server)
        .get(`/users/${addedMockData[0]._id}`)
        .set('Cookie', cookie)
        .send();
      const expected = {
        ...addedMockData[0].toObject(),
        _id: addedMockData[0]._id.toString(),
      };

      assert.strictEqual(response.status, 200);

      const received = {
        ...response.body,
        created_date: new Date(response.body.created_date),
      };

      assert.deepEqual(received, expected);
    });
  });

  describe('Endpoint: /users/register', () => {
    it('should give validation error when nothing passed', async () => {
      const response = await chai
        .request(server)
        .post('/users/register')
        .set('Cookie', cookie)
        .send();

      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.body.type, 'Validation Error');
    });

    it('should add new user in database', async () => {
      const data = {
        firstName: 'person3',
        lastName: 'mock3',
        sex: 'm',
        role: 'normal',
        userName: 'person3',
        password: '333',
      };
      const response = await chai
        .request(server)
        .post('/users/register')
        .set('Cookie', cookie)
        .send(data);

      assert.strictEqual(response.status, 201);
      // pick values from data we gave, because response contains _id which we cant predict
      assert.deepEqual(data, pick(response.body, Object.keys(data)));
    });
  });

  describe('Endpoint delete: /users/', () => {
    it('should give error if wrong user id is passed', async () => {
      const response = await chai
        .request(server)
        .delete('/users/')
        .set('Cookie', cookie)
        .send({_id: 'wrong'});

      assert.strictEqual(response.status, 500);
    });

    it('should not delete currently logged in user', async () => {
      const response = await chai
        .request(server)
        .delete(`/users/`)
        .set('Cookie', cookie)
        .send({_id: addedMockData[0]._id});

      assert.strictEqual(response.status, 400);

      // verify event by searching it
      const foundEvent = await chai
        .request(server)
        .get(`/users/${addedMockData[0]._id}`);

      assert.strictEqual(response.status, 400);
    });

    it('should delete user', async () => {
      const response = await chai
        .request(server)
        .delete(`/users/`)
        .set('Cookie', cookie)
        .send({_id: addedMockData[1]._id});

      assert.strictEqual(response.status, 200);

      // verify user by searching it
      const found = await chai
        .request(server)
        .get(`/users/${addedMockData[1]._id}`)
        .set('Cookie', cookie)
        .send();

      assert.strictEqual(found.status, 404);
    });
  });

});
