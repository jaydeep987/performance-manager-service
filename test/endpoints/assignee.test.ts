import * as chai from 'chai';
// chai-http is exported as single object (export =)
import chaiHttp = require('chai-http');
import { Application } from 'express';
import * as http from 'http';
import * as mocha from 'mocha'; // tslint:disable-line
import * as mongoose from 'mongoose';

import { Assignee, AssigneeModel } from '../../src/model/assignee';
import { User, UserModel } from '../../src/model/user';
import { VirtualMongoServerConnector, pick } from '../test-utils';

import { authenticate, normalizeAddedData, normalizeRecievedData } from './common';

chai.use(chaiHttp);
const assert = chai.assert;

const mockUsers = [
  {
    firstName: 'person1',
    lastName: 'mock1',
    sex: 'm',
    role: 'admin',
    userName: 'person1',
    password: '123',
  },
  {
    firstName: 'person2',
    lastName: 'mock2',
    sex: 'm',
    role: 'normal',
    userName: 'person2',
    password: 'abc',
  },
  {
    firstName: 'person3',
    lastName: 'mock3',
    sex: 'm',
    role: 'normal',
    userName: 'person3',
    password: 'abc',
  },
];

const mockAssignees = [
  {
    // both id will be updated after adding user data
    assigneeId: 'mocked',
    assignedEmployeeId: '1',
    updatedBy: '1',
    updatedDate: new Date(),
  },
  {
    // both will be updated after adding user data
    assigneeId: 'mocked2',
    assignedEmployeeId: '2',
    updatedBy: '1',
    updatedDate: new Date(),
  },
];

describe('Test Endpoints for: Assignee', async () => {
  let virtualMongoConnector: VirtualMongoServerConnector;
  let addedMockData: mongoose.Document[];
  let app: Application;
  let cookie: string[];
  let normalizedAddedData: Assignee[];
  let addedUserData: mongoose.Document[];
  let server: http.Server;

  before(async () => {
    virtualMongoConnector = new VirtualMongoServerConnector();

    await virtualMongoConnector.connect();

    // load app after we initialize MONGO_URL in config
    app = await new (await import('../../src/app')).App().createApp();
    server = http.createServer(app);

    // First add user data
    addedUserData = normalizeAddedData(await UserModel.create(mockUsers));

    // fill data in assignee, get ids from user model
    /*
      Assignment:
      assignee: user[0] assignedTo: user[1] -> user[0] can give review to user[1]
      assignee: user[2] assignedTo: user[0] -> user[2] can give review to user[0]
    */
    mockAssignees[0].assigneeId = addedUserData[0]._id.toString();
    mockAssignees[0].assignedEmployeeId = addedUserData[1]._id.toString();
    mockAssignees[1].assigneeId = addedUserData[2]._id.toString();
    mockAssignees[1].assignedEmployeeId = addedUserData[0]._id.toString();
    mockAssignees[0].updatedBy = addedUserData[0]._id.toString();
    mockAssignees[1].updatedBy = addedUserData[0]._id.toString();
    addedMockData = await AssigneeModel.create(mockAssignees);

    normalizedAddedData = normalizeAddedData<Assignee>(addedMockData);

    // authenticate and get cookie
    cookie = await authenticate(server, mockUsers[0].userName, mockUsers[0].password);
  });

  after(async () => {
    chai.request(server).close();
    await virtualMongoConnector.disconnect();
  });

  describe('Endpoint: /assignees/', async () => {
    it('should give all assignees by assignedEmployeeId', async () => {
      const response = await chai
        .request(server)
        .post('/assignees/')
        .set('Cookie', cookie)
        .send({ assignedEmployeeId: mockAssignees[1].assignedEmployeeId }); // user[2]

      const expected = [{
        ...normalizedAddedData[1],
        assigneeInfo: [ ...[normalizeRecievedData<User>(addedUserData[2]) as User] ],
      }];

      const receivedAssignee = normalizeRecievedData<Assignee>(response.body) as Assignee[];
      // console.log('no', response.body);

      const received = receivedAssignee.map((rAssignee) => ({
        ...rAssignee,
        assigneeInfo: normalizeRecievedData(rAssignee.assigneeInfo) as User[],
      }));

      assert.strictEqual(response.status, 200);
      assert.deepEqual<Assignee[]>(received, expected);
    });
  });

  describe('Endpoint: /assignees/:id', () => {

    it('should give an error if wrong event id passed', async () => {
      const response = await chai
        .request(server)
        .get('/assignees/wrongid')
        .set('Cookie', cookie)
        .send();

      assert.strictEqual(response.status, 500);
    });

    it('shoud give assignees by id', async () => {
      const response = await chai
        .request(server)
        .get(`/assignees/${addedMockData[0]._id}`) // user[0] -> user[1]
        .set('Cookie', cookie)
        .send();
      const expected = {
        ...normalizedAddedData[0],
      };

      assert.strictEqual(response.status, 200);

      assert.deepEqual(normalizeRecievedData(response.body), expected);
    });
  });

  describe('Endpoint: /assignees/create', () => {
    it('should give validation error when nothing passed', async () => {
      const response = await chai
        .request(server)
        .post('/assignees/create')
        .set('Cookie', cookie)
        .send();

      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.body.type, 'Validation Error');
    });

    it('should add new assignee in database', async () => {
      const data = {
        assigneeId: addedUserData[1]._id.toString() as string,
        assignedEmployeeId: addedUserData[0]._id.toString() as string,
      };
      const response = await chai
        .request(server)
        .post('/assignees/create')
        .set('Cookie', cookie)
        .send(data);

      assert.strictEqual(response.status, 201);
      // pick values from data we gave, because response contains _id which we cant predict
      assert.deepEqual(data, pick(response.body, Object.keys(data)));
    });
  });

  describe('Endpoint delete: /assignees/', () => {
    it('should give error if wrong assignee id is passed', async () => {
      const response = await chai
        .request(server)
        .delete('/assignees/')
        .set('Cookie', cookie)
        .send({_id: 'wrong'});

      assert.strictEqual(response.status, 500);
    });

    it('should delete assignee', async () => {
      const response = await chai
        .request(server)
        .delete(`/assignees/`)
        .set('Cookie', cookie)
        .send({_id: addedMockData[1]._id});

      assert.strictEqual(response.status, 200);

      // verify assignee by searching it
      const found = await chai
        .request(server)
        .get(`/assignees/${addedMockData[1]._id}`)
        .set('Cookie', cookie)
        .send();

      assert.strictEqual(found.status, 404);
    });
  });

});
