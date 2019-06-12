import * as chai from 'chai';
import * as mocha from 'mocha'; // tslint:disable-line
import * as mongoose from 'mongoose';

import { UserModel } from '../../src/model/user';

const expect = chai.expect;

describe('Test Model: User', () => {
  it('should give validation error', async () => {
    const userModel = new UserModel();

    try {
      await userModel.validate();
      // fail it
      expect(false).to.be.true;
    } catch (err) {
      expect(err.errors.firstName).to.exist;
      expect(err.errors.lastName).to.exist;
      expect(err.errors.sex).to.exist;
      expect(err.errors.role).to.exist;
      expect(err.errors.userName).to.exist;
      expect(err.errors.password).to.exist;
    }
  });

  it('should not give validation error', async () => {
    const userModel = new UserModel({
      firstName: 'person1',
      lastName: 'ere',
      sex: 'm',
      role: 'admin',
      userName: 'person1',
      password: '123',
    });

    try {
      await userModel.validate();

      expect(userModel.errors).to.be.undefined;
    } catch (error) {
      expect(error, `Should not have error: ${error}`).to.not.exist;
    }
  });
});
