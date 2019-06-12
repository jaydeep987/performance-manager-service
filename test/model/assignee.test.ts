import * as chai from 'chai';
import * as mocha from 'mocha'; // tslint:disable-line
import * as mongoose from 'mongoose';

import { AssigneeModel } from '../../src/model/assignee';

const expect = chai.expect;

describe('Test Model: Assignee', () => {
  it('should give validation error', async () => {
    const assigneeModel = new AssigneeModel();

    try {
      await assigneeModel.validate();
      // fail it
      expect(false).to.be.true;
    } catch (err) {
      expect(err.errors.assigneeId).to.exist;
      expect(err.errors.assignedEmployeeId).to.exist;
      expect(err.errors.updatedBy).to.exist;
      expect(err.errors.updatedDate).to.exist;
    }
  });

  it('should not give validation error', async () => {
    const assigneeModel = new AssigneeModel({
      assigneeId: 'mocked',
      assignedEmployeeId: '1',
      updatedBy: '1',
      updatedDate: new Date(),
    });

    try {
      await assigneeModel.validate();

      expect(assigneeModel.errors).to.be.undefined;
    } catch (error) {
      expect(error, `Should not have error: ${error}`).to.not.exist;
    }
  });
});
