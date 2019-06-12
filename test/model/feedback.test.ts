import * as chai from 'chai';
import * as mocha from 'mocha'; // tslint:disable-line
import * as mongoose from 'mongoose';

import { FeedbackModel } from '../../src/model/feedback';

const expect = chai.expect;

describe('Test Model: Assignee', () => {
  it('should give validation error', async () => {
    const feedbackModel = new FeedbackModel();

    try {
      await feedbackModel.validate();
      // fail it
      expect(false).to.be.true;
    } catch (err) {
      expect(err.errors.reviewId).to.exist;
      expect(err.errors.employeeId).to.exist;
      expect(err.errors.feedback).to.exist;
      expect(err.errors.updatedBy).to.exist;
      expect(err.errors.updatedDate).to.exist;
    }
  });

  it('should not give validation error', async () => {
    const feedbackModel = new FeedbackModel({
      reviewId: 'test',
      employeeId: '2',
      feedback: 'first feedback',
      updatedBy: '1',
      updatedDate: new Date(),
    });

    try {
      await feedbackModel.validate();

      expect(feedbackModel.errors).to.be.undefined;
    } catch (error) {
      expect(error, `Should not have error: ${error}`).to.not.exist;
    }
  });
});
